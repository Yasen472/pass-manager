const bcrypt = require("bcryptjs"); // For encrypting passwords securely

/**
 * Function to create a new account for a user.
 * - Saves the account details to the "accounts" collection in Firestore.
 * 
 * @param {Object} db - Firestore database instance.
 * @returns {Function} Express.js route handler.
 */
const validator = require("validator");

const createAccount = (db) => async (req, res) => {
    try {
        const { userId, website, username, email, password } = req.body;

        // Validate required fields
        if (!userId || !website || !email || !password) {
            return res.status(400).json({ message: "UserId, website, email, and password are required" });
        }

        // Validate the website URL
        let formattedWebsite = website.trim();
        if (!/^https?:\/\//i.test(formattedWebsite)) {
            formattedWebsite = `https://${formattedWebsite}`;
        }

        if (!validator.isURL(formattedWebsite)) {
            return res.status(400).json({ message: "Website must be a valid URL" });
        }

        // Encrypt the password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Save the account to Firestore
        const account = await db.collection("accounts").add({
            userId,
            website: formattedWebsite,
            username: username || null,
            email,
            password: encryptedPassword,
            createdAt: new Date().toISOString(),
        });

        res.status(201).json({
            message: "Account saved successfully",
            accountId: account.id,
        });
    } catch (error) {
        console.error("Error during account creation:", error);
        res.status(500).json({ message: "An error occurred while saving the account" });
    }
};


/**
 * Function to retrieve all accounts saved by a specific user.
 * - Fetches accounts from Firestore based on the userId.
 * 
 * @param {Object} db - Firestore database instance.
 * @returns {Function} Express.js route handler.
 */
const getAccountsByUser = (db) => async (req, res) => {
    try {
        const { userId } = req.params; // Extract userId from the request parameters

        // Validate that userId is provided
        if (!userId) {
            return res.status(400).json({ message: "UserId is required" });
        }

        // Query the "accounts" collection for accounts linked to this userId
        const accountsSnapshot = await db.collection("accounts").where("userId", "==", userId).get();

        // Check if no accounts are found
        if (accountsSnapshot.empty) {
            return res.status(404).json({ message: "No accounts found for this user" });
        }

        // Map the account data into an array to send as the response
        const accounts = [];
        accountsSnapshot.forEach((doc) => {
            accounts.push({ id: doc.id, ...doc.data() });
        });

        // Respond with the list of accounts
        res.status(200).json(accounts);
    } catch (error) {
        console.error("Error retrieving accounts:", error);
        res.status(500).json({ message: "An error occurred while retrieving accounts" });
    }
};

/**
 * Function to update account details for a specific account.
 * - Updates fields like website, username, email, or password.
 * 
 * @param {Object} db - Firestore database instance.
 * @returns {Function} Express.js route handler.
 */
const updateAccount = (db) => async (req, res) => {
    try {
        const { accountId } = req.params; // Extract accountId from the request parameters
        const { website, username, email, password } = req.body; // Fields to update

        // Validate that accountId is provided
        if (!accountId) {
            return res.status(400).json({ message: "AccountId is required" });
        }

        // Prepare updates object with fields to update
        const updates = {};
        if (website) updates.website = website; // Update website if provided
        if (username) updates.username = username; // Update username if provided
        if (email) updates.email = email; // Update email if provided
        if (password) updates.password = await bcrypt.hash(password, 10); // Encrypt and update password if provided

        // Check if there are any fields to update
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }

        // Update the account in Firestore
        await db.collection("accounts").doc(accountId).update(updates);

        // Respond with success message
        res.status(200).json({ message: "Account updated successfully" });
    } catch (error) {
        console.error("Error updating account:", error);
        res.status(500).json({ message: "An error occurred while updating the account" });
    }
};

/**
 * Function to delete an account from Firestore.
 * 
 * @param {Object} db - Firestore database instance.
 * @returns {Function} Express.js route handler.
 */
const deleteAccount = (db) => async (req, res) => {
    try {
        const { accountId } = req.params; // Extract accountId from the request parameters

        // Validate that accountId is provided
        if (!accountId) {
            return res.status(400).json({ message: "AccountId is required" });
        }

        // Delete the account from Firestore
        await db.collection("accounts").doc(accountId).delete();

        // Respond with success message
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ message: "An error occurred while deleting the account" });
    }
};

/**
 * Function to retrieve details of a specific account by its ID.
 * 
 * @param {Object} db - Firestore database instance.
 * @returns {Function} Express.js route handler.
 */
const getAccountById = (db) => async (req, res) => {
    try {
        const { accountId } = req.params; // Extract accountId from the request parameters

        // Validate that accountId is provided
        if (!accountId) {
            return res.status(400).json({ message: "AccountId is required" });
        }

        // Fetch the account document from Firestore
        const accountDoc = await db.collection("accounts").doc(accountId).get();

        // Check if the account document exists
        if (!accountDoc.exists) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Respond with the account data
        const account = accountDoc.data();
        res.status(200).json(account);
    } catch (error) {
        console.error("Error retrieving account:", error);
        res.status(500).json({ message: "An error occurred while retrieving the account" });
    }
};

// Export all account-related functions
module.exports = {
    createAccount,
    getAccountsByUser,
    updateAccount,
    deleteAccount,
    getAccountById,
};
