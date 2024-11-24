const jwt = require('jsonwebtoken');

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
    // Get token from "Authorization: Bearer <token>"
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; 

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    // Verify the token using the secret key stored in environment variables
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Check for userId (or id) in the decoded token
        const userId = decoded.userId || decoded.id; // Account for both possible keys
        
        if (!userId) {
            console.error("Decoded token is missing the 'userId' field or equivalent:", decoded);
            return res.status(400).json({ message: "Token payload invalid, 'userId' or 'id' not found" });
        }

        // Attach userId to the request object (req.user)
        req.user = { id: userId };

        // Log userId for debugging purposes
        console.log(`verifyToken executed: Decoded userId: ${req.user.id}`);

        // Proceed to the next middleware or route handler
        next();
    });
};

module.exports = { verifyToken };


