const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Password validation function
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
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user with hashed password and username
        const newUser = { email, username, password: hashedPassword };
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

        // Generate JWT with user ID, email, and username
        const token = jwt.sign({ id: user._id, email: user.email, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.status(200).json({ message: "Login successful", token, username: user.username });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
};

const updateUser = (db) => async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const userId = req.params.id;

        // Retrieve the existing user
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prepare the fields to update
        const updatedFields = {};

        // If email is provided, add to update object
        if (email) {
            updatedFields.email = email;
        }

        // If username is provided, ensure it's not taken by another user
        if (username) {
            const usernameQuery = db.collection("users").where("username", "==", username).where("__name__", "!=", userId);
            const usernameSnapshot = await usernameQuery.get();
            if (!usernameSnapshot.empty) {
                return res.status(409).json({ message: "Username already taken" });
            }
            updatedFields.username = username;
        }

        // If password is provided, validate and hash it before saving
        if (password) {
            const passwordValidation = validatePassword(password);
            if (passwordValidation !== true) {
                return res.status(400).json({ message: passwordValidation });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updatedFields.password = hashedPassword;
        }

        // Update user details in the database
        await userRef.update(updatedFields);

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        console.error("Error during user update:", error);
        res.status(500).json({ message: "An error occurred during the user update" });
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
    deleteUser, 
    updateUser
};
