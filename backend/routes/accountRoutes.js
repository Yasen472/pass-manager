const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware.js");
const { createAccount, getAccountsByOwner, updateAccount, deleteAccount } = require("../controllers/accountsController.js");
const admin = require("firebase-admin");  // Using Firebase Admin SDK

// Use the initialized db from server.js
const db = admin.firestore();
const router = express.Router();

// Account management routes
router.post('/accounts', verifyToken, createAccount(db));  // Create a new account - works
router.get('/accounts/:ownerId', verifyToken, getAccountsByOwner(db));  // Get all accounts by ownerId - works
router.put('/accounts/update/:accountId', verifyToken, updateAccount(db));  // Update account details (encrypts new password if updated) - works
router.delete('/accounts/:accountId', verifyToken, deleteAccount(db));  // Delete a specific account - works

// Fetches the authenticated user's ID
router.get('/user-id', verifyToken, (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(400).json({ error: "User information is missing or invalid" });
    }
    res.status(200).json({ userId: req.user.id });
});

module.exports = router;
