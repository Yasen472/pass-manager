const express = require("express");
const authRoutes = require('./routes/authRoutes.js'); // Make sure to include the file extension
const accountsRoutes = require('./routes/accountRoutes.js');  // Accounts routes
const cors = require("cors");

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:3000', // Assuming your frontend is running on port 3000
    credentials: true
}));

// Endpoint to get the server time (UTC)
app.get('/api/time', (req, res) => {
    const serverTime = new Date().toISOString(); // UTC time in ISO format
    res.json({ serverTime });
});

// Routes
app.use('/auth', authRoutes); // Authentication routes
app.use('/api', accountsRoutes); // Authentication routes

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});