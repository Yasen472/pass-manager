const express = require("express");
const { registerUser, loginUser, deleteUser, updateUser, verifyEmail, confirmLogin, resendVerificationEmail } = require("../controllers/authController.js");
const admin = require("firebase-admin");
const credentials = require("../key.json");

// Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(credentials)
});

const db = admin.firestore();
const auth = admin.auth();

const router = express.Router();

// Auth routes
router.post('/register', registerUser(db));
router.post('/login', loginUser(db));          // Standard login with email and password
router.get('/confirm-login', confirmLogin(db)); // New route for email 2FA confirmation
router.get('/verify-email', verifyEmail(db));   // Email verification on registration
router.post('/resend-verification-email', resendVerificationEmail);  // Route for resending verification email
router.put('/update/:id', updateUser(db, auth));
router.delete('/delete/:id', deleteUser(db, auth));

module.exports = router;
