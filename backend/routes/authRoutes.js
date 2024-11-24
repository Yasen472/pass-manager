const { registerUser, loginUser, deleteUser, updateUser, setupTwoFA, verify2FA, updateSecurityInfo, checkSecurityInfo, getUserInfo, verifyTwoFaCode, updateUserByEmail} = require("../controllers/authController.js");
const admin = require("firebase-admin");
const express = require("express");
const credentials = require("../key.json");
const { verifyToken } = require("../middleware/authMiddleware.js");

// Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(credentials)
});

const db = admin.firestore();
const auth = admin.auth();

const router = express.Router();

// Utility route to get server time (UTC)
router.get('/api/time', (req, res) => {
    const serverTime = new Date().toISOString(); // Current time in ISO format (UTC)
    res.json({ serverTime });
});

// Auth routes
router.post('/register', registerUser(db));  // Register a new user
router.post('/login', loginUser(db));  // Standard login with email and password
router.put('/update/:id', verifyToken, updateUser(db, auth));  // Update user details (requires authentication)
router.post('/verify-security-info', checkSecurityInfo(db));

//old route
// // router.post('/update-security-info', verifyToken, updateSecurityInfo(db)); // Update security info for a user
// router.post('/update-security-info/:id', verifyToken, updateSecurityInfo(db));

router.put('/update-security-info/:userId', verifyToken, updateSecurityInfo(db));


router.delete('/delete/:id', verifyToken, deleteUser(db, auth));  // Delete user (requires authentication)
router.get("/user/:id", getUserInfo(db));

// 2FA routes
router.post('/enable-2fa', verifyToken, setupTwoFA(db));  // Enable 2FA for a user
router.post('/verify-2fa', verifyToken, verify2FA(db));  // Verify 2FA token

// New route for verifying 2FA code provided by the user
router.post('/verify-2fa-code', verifyTwoFaCode(db));  // Verify the 2FA code entered by the user

// Add a route for updating user by email (no token verification required)
router.put('/update-user-email', updateUserByEmail(db));


module.exports = router;