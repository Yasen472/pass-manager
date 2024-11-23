const jwt = require('jsonwebtoken');

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Get token from "Authorization: Bearer <token>"

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }

        if (!decoded.userId) {
            console.error("Decoded token is missing the 'userId' field:", decoded);
            return res.status(400).json({ message: "Token payload invalid" });
        }
        
        // Attach userId to the request object
        req.user = { id: decoded.userId };
        console.log(`verifyToken is being executed properly - Decoded userId: ${req.user.id}`);
        next();
    });
};

module.exports = { verifyToken };
