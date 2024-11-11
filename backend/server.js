const express = require("express");
const authRoutes = require('./routes/authRoutes.js'); // Make sure to include the file extension
const cors = require("cors");

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Routes
app.use('/auth', authRoutes);

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
