const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const registerUser = (db) => async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const usersRef = db.collection("users");
        const existingUserQuery = usersRef.where("email", "==", email);
        const existingUserSnapshot = await existingUserQuery.get();
        if (!existingUserSnapshot.empty) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hash the password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user with hashed password
        const newUser = { email, password: hashedPassword };
        const response = await db.collection("users").add(newUser);
        res.status(201).json({ message: "User registered successfully", userId: response.id });
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

        // Retrieve user data and check password
        let user;
        userSnapshot.forEach((doc) => {
            user = { _id: doc.id, ...doc.data() };
        });

        // Compare provided password with stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
};

const deleteUser = (db) => async (req, res) => {
    try {
        const response = await db.collection("users").doc(req.params.id).delete();
        res.status(200).json({ message: "User deleted successfully", response });
    } catch (error) {
        console.error("Error during deletion:", error);
        res.status(500).json({ message: "An error occurred while deleting the user" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    deleteUser
};
