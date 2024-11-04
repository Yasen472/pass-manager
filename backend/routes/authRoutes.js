const express = require("express");
const router = express.Router();
const { registerUser, loginUser, deleteUser, updateUser } = require("../controllers/authController");

// Initialize Firebase in this file
const admin = require("firebase-admin");
const credentials = require("../key.json"); // Adjust path if necessary

admin.initializeApp({
    credential: admin.credential.cert(credentials)
});
const db = admin.firestore(); // Directly initialize db

// Define routes and pass db to controller functions
router.post('/register', registerUser(db));
router.post('/login', loginUser(db));
router.delete('/delete/:id', deleteUser(db));
router.put('/update/:id', updateUser(db));

module.exports = router;
