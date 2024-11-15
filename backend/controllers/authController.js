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

        // Password validation
        const passwordValidation = validatePassword(password);
        if (passwordValidation !== true) {
            return res.status(400).json({ message: passwordValidation });
        }

        // Check if user already exists by email or username
        const usersRef = db.collection("users");
        const [existingUserSnapshot, existingUsernameSnapshot] = await Promise.all([
            usersRef.where("email", "==", email).get(),
            usersRef.where("username", "==", username).get(),
        ]);

        if (!existingUserSnapshot.empty) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        if (!existingUsernameSnapshot.empty) {
            return res.status(409).json({ message: "Username already taken" });
        }

        // Hash the password and save user to Firestore
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await db.collection("users").add({
            email,
            username,
            password: hashedPassword,
            isVerified: false,
        });

        // Generate JWT for authentication after registration
        const payload = { userId: user.id, email, username };
        const authToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log(`Auth token from the backend is ${authToken}`);

        res.status(201).json({
            message: "User registered successfully",
            token: authToken,
            userId: user.id,
        });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "An error occurred during registration" });
    }
};


const setupTwoFA = (db) => async (req, res) => {
    try {
        const userId = req.user.id;  // Assuming you're using JWT to authenticate the user

        // Retrieve user document from Firestore
        const userDoc = await db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userDoc.data();
        console.log(user.twofaSecret)

        // If 2FA is already set up, generate the QR code with the existing secret
        if (user.twofaSecret) {
            const otpauthUrl = speakeasy.otpauthURL({
                secret: user.twofaSecret,
                encoding: 'ascii',
                label: `MyApp:${user.username}`,
                issuer: "MyApp"
            });

            const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);
            console.log(`QR code from the backend is ${otpauthUrl}`)

            return res.status(200).json({
                message: "2FA is already set up",
                qrCodeUrl
            });
        }

        // Generate new 2FA secret if not set up
        const secret = speakeasy.generateSecret({ length: 20 });

        // Save the new 2FA secret in Firestore
        await db.collection("users").doc(userId).update({
            twofaSecret: secret.base32
        });

        const otpauthUrl = speakeasy.otpauthURL({
            secret: secret.base32,
            label: `MyApp:${user.username}`,
            issuer: "MyApp"
        });

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



const verify2FA = (db) => async (req, res) => {
    try {
        const { userId, token, userInputTime } = req.body;  // Expecting userInputTime from client

        console.log(userInputTime);


        // Step 1: Retrieve the user's 2FA secret from Firestore
        const userDoc = await db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userDoc.data();
        const twofaSecret = user.twofaSecret;

        // Step 2: Log the expected OTP (generated token)
        // const generatedToken = speakeasy.totp({
        //     secret: twofaSecret,
        //     encoding: 'base32',
        // });

        // Step 3: Fetch the current server time from the request body or other service
        const serverTime = Date.now(); // Server time in milliseconds
        // console.log("Generated OTP:", generatedToken);
        console.log("Server Time (Timestamp):", serverTime);

        // Time difference between the server time and the user input time
        const timeDifference = Math.floor(serverTime - userInputTime);  // In milliseconds

        console.log("Time difference between server and user input time:", timeDifference);

        // Step 4: Log the entered token from the user for comparison
        console.log("Entered OTP (User's Token):", token);

        // console.log(twoFAToken)
        // Step 5: Verify the token using speakeasy
        const isVerified = speakeasy.totp.verify({
            secret: twofaSecret,
            encoding: 'ascii',
            token: token,
            window: 1,  // Optional: allows a small window of time for the token (typically 30 seconds before/after the expected time)
        });

        if (!isVerified) {
            return res.status(400).json({ message: "Invalid 2FA token" });
        }

        // Step 6: Update the user's isVerified status to true
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
            // Calculate size in bytes
            // const docData = JSON.stringify(doc.data);
            // const docSizeInBytes = Buffer.byteLength(docData, 'utf8');

            // Print the document size
            // console.log(`Document size: ${docSizeInBytes} bytes`);
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
                encoding: 'ascii',
                token: twoFAToken,  // Use the renamed variable for 2FA token
                window: 1// Allow 2 time windows for token verification
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
