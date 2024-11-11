const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,  // Your email address
        pass: process.env.GMAIL_PASS   // Your email password or app-specific password
    }
});

// Function to generate a random token for email verification
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Main registration function
const registerUser = (db) => async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (passwordValidation !== true) {
            return res.status(400).json({ message: passwordValidation });
        }

        // Check if user already exists by email or username
        const usersRef = db.collection("users");
        const existingUserQuery = usersRef.where("email", "==", email);
        const existingUsernameQuery = usersRef.where("username", "==", username);

        const [existingUserSnapshot, existingUsernameSnapshot] = await Promise.all([ 
            existingUserQuery.get(),
            existingUsernameQuery.get()
        ]);

        if (!existingUserSnapshot.empty) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        if (!existingUsernameSnapshot.empty) {
            return res.status(409).json({ message: "Username already taken" });
        }

        // Hash the password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);  // 10 salt rounds

        // Generate verification token
        const verificationToken = generateVerificationToken();

        // Save user with hashed password, username, and verification token
        await db.collection("users").add({ 
            email, 
            username, 
            password: hashedPassword, 
            verificationToken,
            isVerified: false // Initially, the user is not verified
        });

        // Create verification link (use localhost:3000 for local testing)
        const verificationLink = `http://localhost:8080/auth/verify-email?token=${verificationToken}`;

        // Set up email options
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Please verify your email address',
            html: `<p>Hi ${username},</p>
                   <p>Thank you for registering. Please verify your email by clicking the link below:</p>
                   <p><a href="${verificationLink}">${verificationLink}</a></p>`
        };

        // Send verification email
        await transporter.sendMail(mailOptions);

        // Respond with success
        res.status(201).json({ message: "User registered successfully, please check your email for verification" });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "An error occurred during registration" });
    }
};


const loginUser = (db) => async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const usersRef = db.collection("users");
        const userQuery = usersRef.where("email", "==", email);
        const userSnapshot = await userQuery.get();

        // Check if user exists
        if (userSnapshot.empty) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Retrieve user data
        let user;
        userSnapshot.forEach((doc) => {
            user = { _id: doc.id, ...doc.data() };
        });

        // Check if the user is verified
        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email before logging in." });
        }

        // Compare provided password with stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check last login verification status
        if (!user.lastLoginVerified) {
            // Generate a login verification token
            const loginToken = generateVerificationToken();
            await db.collection("users").doc(user._id).update({
                loginToken,
                lastLoginVerified: false,
            });

            // Send a new login verification email
            const loginVerificationLink = `http://localhost:8080/auth/confirm-login?token=${loginToken}`;
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: email,
                subject: 'Confirm your login',
                html: `<p>Please confirm your login by clicking the link below:</p>
                       <p><a href="${loginVerificationLink}">${loginVerificationLink}</a></p>`,
            };
            await transporter.sendMail(mailOptions);

            return res.status(403).json({ message: "Please confirm your login by clicking the link sent to your email." });
        }

        // Mark lastLoginVerified as false for future logins
        await db.collection("users").doc(user._id).update({ lastLoginVerified: false });

        // Generate JWT with user ID, email, and username
        const token = jwt.sign(
            { id: user._id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: "Login successful", token, username: user.username });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
};


const confirmLogin = (db) => async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: "Confirmation token is required" });
        }

        // Search for the user using the login token
        const usersRef = db.collection("users");
        const userQuery = usersRef.where("loginToken", "==", token);
        const userSnapshot = await userQuery.get();

        if (userSnapshot.empty) {
            return res.status(400).json({ message: "Invalid or expired login token" });
        }

        // Retrieve and update the user's login verification status
        let user;
        userSnapshot.forEach((doc) => {
            user = { _id: doc.id, ...doc.data() };
        });

        await db.collection("users").doc(user._id).update({
            lastLoginVerified: true,
            loginToken: "",  // Clear the login token after successful confirmation
        });

        res.status(200).json({ message: "Login confirmed successfully! You may now proceed to login." });
    } catch (error) {
        console.error("Error during login confirmation:", error);
        res.status(500).json({ message: "An error occurred during login confirmation" });
    }
};


// Update user
const updateUser = (db, auth) => async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const userId = req.params.id;

        // Get user document from Firestore
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prepare updates for Auth
        const authUpdates = {};
        if (email) authUpdates.email = email;
        if (password) authUpdates.password = password;
        if (username) authUpdates.displayName = username;

        // Update Auth user if there are auth updates
        if (Object.keys(authUpdates).length > 0) {
            await auth.updateUser(userId, authUpdates);
        }

        // Prepare updates for Firestore
        const firestoreUpdates = {};
        if (email) firestoreUpdates.email = email;
        if (username) firestoreUpdates.username = username;

        // Update Firestore if there are updates
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
const deleteUser = (db, auth) => async (req, res) => {
    try {
        const userId = req.params.id;

        // Delete from Auth
        await auth.deleteUser(userId);

        // Delete from Firestore
        await db.collection("users").doc(userId).delete();

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error during deletion:", error);
        res.status(500).json({ message: "An error occurred while deleting the user" });
    }
};

const verifyEmail = (db) => async (req, res) => {
    try {
        // Extract the token from the query parameters
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: "Verification token is required" });
        }

        // Search for the user using the verification token in the database
        const usersRef = db.collection("users");
        const userQuery = usersRef.where("verificationToken", "==", token);
        const userSnapshot = await userQuery.get();

        if (userSnapshot.empty) {
            return res.status(400).json({ message: "Invalid or expired verification token" });
        }

        // If a matching user is found, mark the email as verified
        let user;
        userSnapshot.forEach((doc) => {
            user = { _id: doc.id, ...doc.data() };
        });

        // Update the user's "isVerified" status to true in the database
        await db.collection("users").doc(user._id).update({
            isVerified: true,
            verificationToken: "", // Optionally, clear the verification token after use
        });

        // Send a response to inform the user that the email has been successfully verified
        res.status(200).json({ message: "Email successfully verified!" });
    } catch (error) {
        console.error("Error during email verification:", error);
        res.status(500).json({ message: "An error occurred during email verification" });
    }
};

// Resend verification email
const resendVerificationEmail = (db) => async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user by email
        const usersRef = db.collection("users");
        const userQuery = usersRef.where("email", "==", email);
        const userSnapshot = await userQuery.get();

        if (userSnapshot.empty) {
            return res.status(404).json({ message: "User not found" });
        }

        // Retrieve user data
        let user;
        userSnapshot.forEach((doc) => {
            user = { _id: doc.id, ...doc.data() };
        });

        // If the user is already verified, return an appropriate message
        if (user.isVerified) {
            return res.status(400).json({ message: "This email is already verified." });
        }

        // Generate a new verification token
        const verificationToken = generateVerificationToken();

        // Update the user with the new token
        await db.collection("users").doc(user._id).update({
            verificationToken,
        });

        // Create verification link
        const verificationLink = `http://localhost:8080/auth/verify-email?token=${verificationToken}`;

        // Set up email options
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Please verify your email address',
            html: `<p>Hi ${user.username},</p>
                   <p>Thank you for registering. Please verify your email by clicking the link below:</p>
                   <p><a href="${verificationLink}">${verificationLink}</a></p>`
        };

        // Send verification email
        await transporter.sendMail(mailOptions);

        // Respond with success
        res.status(200).json({ message: "A new verification link has been sent to your email." });
    } catch (error) {
        console.error("Error during resending verification email:", error);
        res.status(500).json({ message: "An error occurred while resending the verification email." });
    }
};



module.exports = {
    registerUser,
    loginUser,
    confirmLogin,
    updateUser,
    deleteUser,
    verifyEmail,
    resendVerificationEmail
};