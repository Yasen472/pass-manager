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
        
        // Attach user information (like userId) to the request object
        req.user = { id: decoded.userId };  // Assuming you store the userId in the payload
        console.log(`verifyToken is being executed properly - verifyToken function`)
        next();
    });
};


module.exports = { verifyToken };
