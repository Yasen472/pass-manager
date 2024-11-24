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


const registerUser = (db) => async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Validate password
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

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to Firestore
        const user = await db.collection("users").add({
            email,
            username,
            password: hashedPassword,
            isVerified: false,
            securityInfo: [], // Placeholder for security info
        });

        // Generate JWT for authentication after registration
        const payload = { userId: user.id, email, username };
        const authToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({
            message: "User registered successfully",
            token: authToken,
            userId: user.id,
        });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "An error occurred during registration." });
    }
};

const checkSecurityInfo = (db) => async (req, res) => {
    try {
        const { userId, providedSecurityInfo } = req.body;

        // Validate input
        if (!userId || !providedSecurityInfo) {
            return res.status(400).json({
                message: "User ID and provided security info are required.",
            });
        }

        // Retrieve the user's stored security info
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found." });
        }

        const user = userDoc.data();
        const storedSecurityInfo = user.securityInfo;

        // Ensure both `storedSecurityInfo` and `providedSecurityInfo` are arrays
        if (!Array.isArray(storedSecurityInfo) || !Array.isArray(providedSecurityInfo)) {
            return res.status(400).json({
                message: "Invalid security info format.",
            });
        }

        // Compare the stored and provided security info
        if (storedSecurityInfo.length !== providedSecurityInfo.length) {
            return res.status(400).json({ message: "Security info does not match." });
        }

        for (let i = 0; i < storedSecurityInfo.length; i++) {
            const stored = storedSecurityInfo[i];
            const provided = providedSecurityInfo[i];

            if (
                stored.question !== provided.question ||
                stored.answer !== provided.answer
            ) {
                return res.status(400).json({
                    message: `Security info mismatch at index ${i}.`,
                });
            }
        }

        // If all checks pass
        res.status(200).json({ message: "Security info verified successfully." });
    } catch (error) {
        console.error("Error checking security info:", error);
        res.status(500).json({
            message: "An error occurred while verifying security info.",
        });
    }
};

const updateSecurityInfo = (db) => async (req, res) => {
    try {
        // Access userId from req.user set by the verifyToken middleware
        const userId = req.user.id; // This should now be populated correctly
        console.log(`User id from token: ${userId}`);  // Log userId

        const { securityInfo } = req.body;  // Get securityInfo from request body

        // Validate `securityInfo`: Must contain exactly 3 question-answer pairs
        if (!Array.isArray(securityInfo) || securityInfo.length !== 3) {
            return res.status(400).json({
                message: "Security info must contain exactly 3 question-answer pairs.",
            });
        }

        // Validate each question-answer pair
        for (let i = 0; i < securityInfo.length; i++) {
            const { question, answer } = securityInfo[i];
            if (!question || !answer) {
                return res.status(400).json({
                    message: `Security question and answer at index ${i} must be provided.`,
                });
            }
        }

        // Retrieve user document using the actual userId from the request
        const userDocRef = db.collection("users").doc(userId);

        // Check if the user exists in Firestore
        const userDoc = await userDocRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({
                message: 'User not found.',
            });
        }

        // Update the security info for the user
        await userDocRef.update({
            securityInfo
        });

        res.status(200).json({
            message: 'Security info updated successfully.',
        });
    } catch (error) {
        console.error('Error during security info update:', error);
        res.status(500).json({
            message: 'An error occurred while updating security information. Please try again later.',
        });
    }
};


// this one is the old one from the laptop
const setupTwoFA = (db) => async (req, res) => {
    try {
        const userId = req.user.id;  // Assuming you're using JWT to authenticate the user

        // Retrieve user document from Firestore
        const userDoc = await db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userDoc.data();

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
            secret: secret.base32 
        });

    } catch (error) {
        console.error("Error during 2FA setup:", error);
        res.status(500).json({ message: "An error occurred during 2FA setup" });
    }
};

const verify2FA = (db) => async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user.id;  // Get userId from the middleware

        // Fetch the user document
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userDoc.data();
        const twofaSecret = user.twofaSecret;

        // Generate token and verify
        const isVerified = speakeasy.totp.verify({
            secret: twofaSecret,
            encoding: 'ascii',
            token,
            window: 1,
        });

        if (!isVerified) {
            return res.status(400).json({ message: "Invalid 2FA token" });
        }

        // Update user's `isVerified` status
        await db.collection("users").doc(userId).update({ isVerified: true });

        res.status(200).json({ message: "2FA verification successful. User is now verified." });
    } catch (error) {
        console.error("Error during 2FA verification:", error);
        res.status(500).json({ message: "An error occurred during 2FA verification" });
    }
};
//     try {
//         const { email, twoFACode } = req.body;  // Receive email and 2FA code from the frontend

//         // Validate input
//         if (!email || !twoFACode) {
//             return res.status(400).json({ message: "Email and 2FA code are required." });
//         }

//         // Find the user by email
//         const usersRef = db.collection("users");
//         const userQuery = usersRef.where("email", "==", email);
//         const userSnapshot = await userQuery.get();

//         if (userSnapshot.empty) {
//             return res.status(401).json({ message: "Invalid email." });
//         }

//         let user;
//         userSnapshot.forEach((doc) => {
//             user = { _id: doc.id, ...doc.data() };
//         });

//         // Check if the user has 2FA set up
//         if (!user.twofaSecret) {
//             return res.status(400).json({ message: "User has not set up 2FA." });
//         }

//         // Generate token and verify the provided code
//         const isVerified = speakeasy.totp.verify({
//             secret: user.twofaSecret,
//             encoding: 'ascii',
//             token: twoFACode,
//             window: 1,  // Allow a small window of time for the code to be valid
//         });

//         if (!isVerified) {
//             return res.status(400).json({ message: "Invalid 2FA code." });
//         }

//         // If the code is valid, send success response
//         res.status(200).json({ message: "2FA code verified successfully." });
//     } catch (error) {
//         console.error("Error during 2FA code verification:", error);
//         res.status(500).json({ message: "An error occurred during 2FA code verification." });
//     }
// };

const verifyTwoFaCode = (db) => async (req, res) => {
    try {
        const { email, twoFACode } = req.body;

        if (!email || !twoFACode) {
            return res.status(400).json({ message: "Email and 2FA code are required." });
        }

        const usersRef = db.collection("users");
        const userQuery = usersRef.where("email", "==", email);
        const userSnapshot = await userQuery.get();

        if (userSnapshot.empty) {
            return res.status(401).json({ message: "Invalid email." });
        }

        let user;
        userSnapshot.forEach((doc) => {
            user = { _id: doc.id, ...doc.data() };
        });

        if (!user.twofaSecret) {
            return res.status(400).json({ message: "User has not set up 2FA." });
        }

        const isVerified = speakeasy.totp.verify({
            secret: user.twofaSecret,
            encoding: 'ascii',
            token: twoFACode,
            window: 1,
        });

        if (!isVerified) {
            return res.status(400).json({ message: "Invalid 2FA code." });
        }

        // If the code is valid, respond with success
        return res.status(200).json({ message: "2FA code verified successfully." });
    } catch (error) {
        console.error("Error during 2FA code verification:", error);
        res.status(500).json({ message: "An error occurred during 2FA code verification." });
    }
};

const loginUser = (db) => async (req, res) => {
    try {
        const { email, password, twoFACode } = req.body;

        // Find user by email
        const usersRef = db.collection("users");
        const userQuery = usersRef.where("email", "==", email);
        const userSnapshot = await userQuery.get();

        if (userSnapshot.empty) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        let user;
        userSnapshot.forEach((doc) => {
            user = { _id: doc.id, ...doc.data() };
        });

        // Ensure `securityInfo` is set
        if (!user.securityInfo || user.securityInfo.length === 0) {
            return res.status(403).json({ message: "Please set up security questions before logging in." });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // 2FA validation (if enabled)
        if (user.twofaSecret) {
            const isVerified = speakeasy.totp.verify({
                secret: user.twofaSecret,
                encoding: "ascii",
                token: twoFACode,
                window: 1,
            });

            if (!isVerified) {
                return res.status(400).json({ message: "Invalid 2FA token." });
            }
        }

        // Generate JWT
        const authToken = jwt.sign(
            { id: user._id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Login successful", token: authToken, username: user.username, _id: user._id });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "An error occurred during login." });
    }
};
//     try {
//         const userId = req.params.id; // Retrieve the user ID from the request parameters

//         console.log(userId)

//         // Validate userId
//         if (!userId || typeof userId !== "string") {
//             return res.status(400).json({ message: "Invalid user ID" });
//         }

//         // Fetch the user document from the Firestore database
//         const userDoc = await db.collection("users").doc(userId).get();

//         // Check if the user document exists
//         if (!userDoc.exists) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Extract user data
//         const user = userDoc.data();
//         const { email = '', username = '', securityInfo = {} } = user;

//         // Include securityInfo.answers
//         const { questions = [], answers = [] } = securityInfo;

//         // Validate securityInfo structure (optional)
//         if (!Array.isArray(questions) || !Array.isArray(answers)) {
//             return res.status(500).json({
//                 message: "Invalid security info format in database.",
//             });
//         }

//         // Only include questions if requested via query param
//         const isResetting = req.query.isResetting === "true";
//         const response = {
//             email,
//             username,
//             securityInfo: {
//                 questions: isResetting ? questions : [], // Include questions only if resetting
//                 answers: isResetting ? answers : [], // Include answers for resetting
//             },
//         };

//         res.status(200).json(response);
//     } catch (error) {
//         console.error("Error retrieving user information:", error);
//         res.status(500).json({
//             message: "An error occurred while retrieving user information.",
//         });
//     }
// };


const getUserInfo = (db) => async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userDoc.data();
        const { email = '', username = '', securityInfo = [] } = user;

        // Check if securityInfo is in the expected format
        if (!Array.isArray(securityInfo)) {
            return res.status(500).json({ message: "Invalid security info format" });
        }

        const questions = securityInfo.map(info => info.question);
        const answers = securityInfo.map(info => info.answer);

        const isResetting = req.query.isResetting === "true";
        const response = {
            email,
            username,
            securityInfo: {
                questions: isResetting ? questions : [], 
                answers: isResetting ? answers : [],
            },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error retrieving user information:", error);
        res.status(500).json({ message: "An error occurred while retrieving user information." });
    }
};


const updateUser = (db) => async (req, res) => {
    try {
        const { email, password, username } = req.body; // Include password in the destructuring
        const userId = req.params.id;

        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const firestoreUpdates = {};
        if (email) firestoreUpdates.email = email;
        if (username) firestoreUpdates.username = username;

        if (password) {
            // Hash the password before storing it
            const hashedPassword = await bcrypt.hash(password, 10);
            firestoreUpdates.password = hashedPassword;
        }

        if (Object.keys(firestoreUpdates).length > 0) {
            await db.collection("users").doc(userId).update(firestoreUpdates);
        }

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        console.error("Error during user update:", error);
        res.status(500).json({ message: "An error occurred during the user update" });
    }
};

const updateUserByEmail = (db) => async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Validate input
        if (!email || !newPassword) {
            return res.status(400).json({ message: "Email and new password are required." });
        }

        // Validate the password
        const passwordValidation = validatePassword(newPassword);
        if (passwordValidation !== true) {
            return res.status(400).json({ message: passwordValidation });
        }

        // Find user by email
        const usersRef = db.collection("users");
        const userQuery = usersRef.where("email", "==", email);
        const userSnapshot = await userQuery.get();

        if (userSnapshot.empty) {
            return res.status(404).json({ message: "User with this email does not exist." });
        }

        let userDocId;
        userSnapshot.forEach((doc) => {
            userDocId = doc.id; // Get the document ID for the user
        });

        if (!userDocId) {
            return res.status(404).json({ message: "User not found." });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        await db.collection("users").doc(userDocId).update({
            password: hashedPassword,
        });

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error updating user password by email:", error);
        res.status(500).json({ message: "An error occurred while updating the password." });
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
    updateSecurityInfo,
    checkSecurityInfo,
    getUserInfo,
    setupTwoFA,
    verify2FA,
    verifyTwoFaCode,
    updateUserByEmail,
    loginUser,
    updateUser,
    deleteUser
};