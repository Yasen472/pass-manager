const crypto = require("crypto");

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Hexadecimal 32-byte key

// Ensure the key is converted to a Buffer and is 32 bytes long
const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");

const IV_LENGTH = 16;  // AES-256-CBC requires a 16-byte IV

// Encryption function
function encryptPassword(text) {
    const iv = crypto.randomBytes(IV_LENGTH); // Generate a random IV
    const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv); // Use the key buffer
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");
    return `${iv.toString("base64")}:${encrypted}`; // Return IV and encrypted text as a single string
}

// Decryption function
function decryptPassword(encryptedText) {
    const [iv, encrypted] = encryptedText.split(":");
    const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, Buffer.from(iv, "base64"));
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

/**
 * Function to create a new account for a user.
 * @param {Object} db - Firestore database instance.
 * @returns {Function} Express.js route handler.
 */
const createAccount = (db) => async (req, res) => {
    try {
        const { accountName, username, email, password } = req.body;

        const ownerId = req.user?.id; // Securely obtained from middleware
        if (!ownerId) return res.status(400).json({ message: "OwnerId is required and must be set by the system" });

        if (!accountName || !email || !password) {
            return res.status(400).json({ message: "accountName, email, and password are required" });
        }

        // Encrypt the password using AES
        const encryptedPassword = encryptPassword(password);

        const account = await db.collection("accounts").add({
            ownerId,
            accountName,
            username: username || null,
            email,
            password: encryptedPassword,
            createdAt: new Date().toISOString(),
        });

        res.status(201).json({ message: "Account saved successfully", accountId: account.id });
    } catch (error) {
        console.error("Error during account creation:", error);
        res.status(500).json({ message: "An error occurred while saving the account" });
    }
};

/**
 * Function to retrieve all accounts by owner.
 * @param {Object} db - Firestore database instance.
 * @returns {Function} Express.js route handler.
 */
const getAccountsByOwner = (db) => async (req, res) => {
    try {
        const { ownerId } = req.params;

        if (!ownerId) return res.status(400).json({ message: "OwnerId is required" });

        const accountsSnapshot = await db.collection("accounts").where("ownerId", "==", ownerId).get();
        if (accountsSnapshot.empty) return res.status(404).json({ message: "No accounts found for this owner" });

        const accounts = [];
        accountsSnapshot.forEach((doc) => {
            const account = doc.data();
            account.id = doc.id;
            account.password = decryptPassword(account.password); // Decrypt the password
            accounts.push(account);
        });

        res.status(200).json(accounts);
    } catch (error) {
        console.error("Error retrieving accounts:", error);
        res.status(500).json({ message: "An error occurred while retrieving accounts" });
    }
};

/**
 * Function to update an account and re-encrypt the password if changed.
 * @param {Object} db - Firestore database instance.
 * @returns {Function} Express.js route handler.
 */
const updateAccount = (db) => async (req, res) => {
    try {
        const { accountId } = req.params;
        const { accountName, username, email, password } = req.body;

        if (!accountId) return res.status(400).json({ message: "AccountId is required" });

        const updates = {};
        if (accountName) updates.accountName = accountName;
        if (username) updates.username = username;
        if (email) updates.email = email;
        if (password) updates.password = encryptPassword(password); // Re-encrypt the new password

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }

        await db.collection("accounts").doc(accountId).update(updates);

        res.status(200).json({ message: "Account updated successfully" });
    } catch (error) {
        console.error("Error updating account:", error);
        res.status(500).json({ message: "An error occurred while updating the account" });
    }
};

/**
 * Function to delete an account.
 * @param {Object} db - Firestore database instance.
 * @returns {Function} Express.js route handler.
 */
const deleteAccount = (db) => async (req, res) => {
    try {
        const { accountId } = req.params;

        if (!accountId) return res.status(400).json({ message: "AccountId is required" });

        await db.collection("accounts").doc(accountId).delete();
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ message: "An error occurred while deleting the account" });
    }
};

module.exports = {
    createAccount,
    getAccountsByOwner,
    updateAccount,
    deleteAccount,
};
