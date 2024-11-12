const jwt = require('jsonwebtoken');

// Verify JWT token middleware
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token is required for authentication.' });
    }

    // Remove "Bearer" from the token if present
    const tokenWithoutBearer = token.split(' ')[1];

    jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: 'Token authentication failed. Please login again.' });
        }

        req.user = decoded;
        next();
    });
}


module.exports = { verifyToken };
