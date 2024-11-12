const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const speakeasy = require("speakeasy");  // For generating and verifying 2FA codes
const QRCode = require('qrcode');

dotenv.config();

// Password validation function remains the same
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/;
    const hasLowerCase = /[a-z]/;
    const hasNumber = /[0-9]/;
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/;

    if (password.length < minLength) {
        return `Password should be at least ${minLength} characters long.`;
    }
    if (!hasUpperCase.test(password)) {
        return "Password should include at least one uppercase letter.";
    }
    if (!hasLowerCase.test(password)) {
        return "Password should include at least one lowercase letter.";
    }
    if (!hasNumber.test(password)) {
        return "Password should include at least one number.";
    }
    if (!hasSymbol.test(password)) {
        return "Password should include at least one symbol.";
    }

    return true;
};

// 2FA Setup: Generate a secret for Google Authenticator
// 2FA Setup: Generate a secret for Google Authenticator
const registerUser = (db) => async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Step 1: Validate password strength
        const passwordValidation = validatePassword(password);
        if (passwordValidation !== true) {
            console.log("Password validation failed:", passwordValidation);
            return res.status(400).json({ message: passwordValidation });
        }

        // Step 2: Check if user already exists by email or username
        const usersRef = db.collection("users");
        const [existingUserSnapshot, existingUsernameSnapshot] = await Promise.all([
            usersRef.where("email", "==", email).get(),
            usersRef.where("username", "==", username).get(),
        ]);

        if (!existingUserSnapshot.empty) {
            console.log("User with this email already exists:", email);
            return res.status(409).json({ message: "User with this email already exists" });
        }

        if (!existingUsernameSnapshot.empty) {
            console.log("Username already taken:", username);
            return res.status(409).json({ message: "Username already taken" });
        }

        // Step 3: Hash the password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);  // 10 salt rounds

        // Step 4: Generate a 2FA secret for the user
        const twofaSecret = speakeasy.generateSecret({
            length: 20,
            name: `MyApp (${email})`,  // Set a name for the QR code label
        });

        // Step 5: Save user with hashed password and 2FA secret
        const user = await db.collection("users").add({
            email,
            username,
            password: hashedPassword,
            isVerified: false,  // Initially, the user is not verified
            twofaSecret: twofaSecret.base32,  // Save the base32 encoded secret
        });

        console.log("User registered successfully:", user.id);

        // Step 6: Generate JWT token after registration (before 2FA verification)
        const payload = {
            userId: user.id,  // Use the Firestore generated user ID
            email,
            username
        };

        const authToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });  // You can adjust the expiration time as needed

        // Step 7: Generate QR code URL
        const otpauthUrl = twofaSecret.otpauth_url;
        let qrCodeDataURL;
        try {
            qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);
        } catch (error) {
            console.error("Error generating QR code:", error);
            return res.status(500).json({ message: "Error generating QR code." });
        }

        // Step 8: Send response including JWT token and QR code URL
        res.status(201).json({
            message: "User registered successfully",
            qrCodeUrl: qrCodeDataURL,
            userId: user.id,  // Optional, for frontend reference
            token: authToken  // Send the JWT token to the client
        });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "An error occurred during registration" });
    }
};



const setupTwoFA = (db) => async (req, res) => {
    try {
        const userId = req.user.id;  // Assuming you're using JWT to authenticate the user

        console.log("Authenticated user:", req.user);

        // Get user document from Firestore
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userDoc.data();

        // Check if 2FA is already set up
        if (user.twofaSecret) {
            // 2FA is already set up, so just return the QR code for the existing secret
            const otpauthUrl = speakeasy.otpauthURL({
                secret: user.twofaSecret,
                label: `MyApp:${user.username}`,
                issuer: "MyApp"
            });

            // Generate the QR code URL using the OTP Auth URL
            const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

            return res.status(200).json({
                message: "2FA is already set up",
                qrCodeUrl
            });
        }

        // If 2FA secret is not set up, generate it here
        const secret = speakeasy.generateSecret({ length: 20 });

        // Save the new 2FA secret in Firestore
        await db.collection("users").doc(userId).update({
            twofaSecret: secret.base32
        });

        // Generate the OTP Auth URL for Google Authenticator
        const otpauthUrl = speakeasy.otpauthURL({
            secret: secret.base32,
            label: `MyApp:${user.username}`,
            issuer: "MyApp"
        });

        // Generate the QR code URL
        const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

        res.status(200).json({
            message: "2FA setup successful",
            qrCodeUrl,
            secret: secret.base32  // Optional: You can send this for later use
        });
    } catch (error) {
        console.error("Error during 2FA setup:", error);
        res.status(500).json({ message: "An error occurred during 2FA setup" });
    }
};


// 2FA Verification: Verify the token entered by the user
const verify2FA = (db) => async (req, res) => {
    try {
        const { userId, token } = req.body;

        // Step 1: Retrieve the user's 2FA secret from the database
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userDoc.data();
        const twofaSecret = user.twofaSecret;

        // Step 2: Verify the token using speakeasy
        const isVerified = speakeasy.totp.verify({
            secret: twofaSecret,
            encoding: 'base32',
            token: token,
        });

        if (!isVerified) {
            return res.status(400).json({ message: "Invalid 2FA token" });
        }

        // Step 3: Update the user's isVerified status to true
        await db.collection("users").doc(userId).update({
            isVerified: true,
        });

        res.status(200).json({
            message: "2FA verification successful. User is now verified.",
        });
    } catch (error) {
        console.error("Error during 2FA verification:", error);
        res.status(500).json({ message: "An error occurred during 2FA verification" });
    }
};


// Login user (with 2FA check)
const loginUser = (db) => async (req, res) => {
    try {
        const { email, password, token: twoFAToken } = req.body; // Rename token to twoFAToken

        // Find user by email
        const usersRef = db.collection("users");
        const userQuery = usersRef.where("email", "==", email);
        const userSnapshot = await userQuery.get();

        if (userSnapshot.empty) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        let user;
        userSnapshot.forEach((doc) => {
            user = { _id: doc.id, ...doc.data() };
        });

        // Check if the user is verified (2FA setup)
        if (!user.isVerified) {
            return res.status(403).json({ message: "User is not verified. Please complete the 2FA verification." });
        }

        // Compare provided password with stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Verify 2FA token if set
        if (user.twofaSecret) {
            const isVerified = speakeasy.totp.verify({
                secret: user.twofaSecret,
                encoding: 'base32',
                token: twoFAToken  // Use the renamed variable for 2FA token
            });

            if (!isVerified) {
                return res.status(400).json({ message: "Invalid 2FA token" });
            }
        }

        // Generate JWT with user ID, email, and username (renamed the variable to authToken)
        const authToken = jwt.sign(
            { id: user._id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: "Login successful", token: authToken, username: user.username });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
};



// Update user
const updateUser = (db) => async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const userId = req.params.id;

        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const firestoreUpdates = {};
        if (email) firestoreUpdates.email = email;
        if (username) firestoreUpdates.username = username;

        if (Object.keys(firestoreUpdates).length > 0) {
            await db.collection("users").doc(userId).update(firestoreUpdates);
        }

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        console.error("Error during user update:", error);
        res.status(500).json({ message: "An error occurred during the user update" });
    }
};

// Delete user
const deleteUser = (db) => async (req, res) => {
    try {
        const userId = req.params.id;

        await db.collection("users").doc(userId).delete();

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error during user deletion:", error);
        res.status(500).json({ message: "An error occurred during the user deletion" });
    }
};

module.exports = {
    registerUser,
    setupTwoFA,
    verify2FA,
    loginUser,
    updateUser,
    deleteUser
};
