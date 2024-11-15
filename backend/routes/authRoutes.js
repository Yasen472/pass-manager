const express = require("express");
const { registerUser, loginUser, deleteUser, updateUser, setupTwoFA, verify2FA } = require("../controllers/authController.js"); 
const admin = require("firebase-admin");
const credentials = require("../key.json");
const { verifyToken } = require("../middleware/authMiddleware.js");

// Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(credentials)
});

const db = admin.firestore();
const auth = admin.auth();

const router = express.Router();

// New route to send server time (UTC)
router.get('/api/time', (req, res) => {
    const serverTime = new Date().toISOString();  // Current time in ISO format (UTC)
    res.json({ serverTime });
});

// Auth routes
router.post('/register', registerUser(db));  // Register a new user
router.post('/login', loginUser(db));  // Standard login with email and password
router.put('/update/:id', verifyToken, updateUser(db, auth));  // Update user details, authenticated
router.delete('/delete/:id', verifyToken, deleteUser(db, auth));  // Delete user, authenticated

// 2FA routes
router.post('/enable-2fa', verifyToken, setupTwoFA(db));  // Enable 2FA (setup)
router.post('/verify-2fa', verifyToken, verify2FA(db));  // Verify 2FA token

module.exports = router;
