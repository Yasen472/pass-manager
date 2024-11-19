const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware.js");
const { createAccount, getAccountsByOwner, updateAccount, deleteAccount, getAccountById } = require("../controllers/accountsController.js");
const admin = require("firebase-admin");  // Don't initialize Firebase here, just use it

// Use the initialized db from server.js
const db = admin.firestore();
const router = express.Router();

// Account management routes
router.post('/accounts', verifyToken, createAccount(db));  // Create a new account - done
router.get('/accounts/:ownerId', verifyToken, getAccountsByOwner(db));  // Get all accounts by ownerId - done
router.get('/account/:accountId', verifyToken, getAccountById(db));  // Get a specific account by accountId
router.put('/account/update/:accountId', verifyToken, updateAccount(db));  // Update account details
router.delete('/account/:accountId', verifyToken, deleteAccount(db));  // Delete a specific account

//fetches the userId
router.get('/user-id', verifyToken, (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(400).json({ error: "User information is missing or invalid" });
    }
    res.status(200).json({ userId: req.user.id });
});

module.exports = router;
