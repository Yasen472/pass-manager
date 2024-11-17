const express = require("express");
const { registerUser, loginUser, deleteUser, updateUser, setupTwoFA, verify2FA } = require("../controllers/authController.js");
const { createAccount, getAccountsByOwner, updateAccount, deleteAccount, getAccountById } = require("../controllers/accountsController.js"); // Updated import statement
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

// Utility route to get server time (UTC)
router.get('/api/time', (req, res) => {
    const serverTime = new Date().toISOString(); // Current time in ISO format (UTC)
    res.json({ serverTime });
});

// Auth routes
router.post('/register', registerUser(db));  // Register a new user
router.post('/login', loginUser(db));  // Standard login with email and password
router.put('/update/:id', verifyToken, updateUser(db, auth));  // Update user details (requires authentication)
router.delete('/delete/:id', verifyToken, deleteUser(db, auth));  // Delete user (requires authentication)

// 2FA routes
router.post('/enable-2fa', verifyToken, setupTwoFA(db));  // Enable 2FA for a user
router.post('/verify-2fa', verifyToken, verify2FA(db));  // Verify 2FA token

// Account management routes
router.post('/accounts', verifyToken, createAccount(db));  // Create a new account
// Get all accounts associated with a specific ownerId
router.get('/accounts/:ownerId', verifyToken, getAccountsByOwner(db)); 
router.get('/account/:accountId', verifyToken, getAccountById(db)); // Get a specific account by accountId
router.put('/account/:accountId', verifyToken, updateAccount(db));  // Update account details
router.delete('/account/:accountId', verifyToken, deleteAccount(db)); // Delete a specific account

module.exports = router;
