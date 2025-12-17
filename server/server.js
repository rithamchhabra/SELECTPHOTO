const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

// Connect to Database
connectDB().then(() => {
    app.listen(PORT, console.log(`Server running on port ${PORT}`));
}).catch(err => {
    console.error("Failed to connect to DB", err);
});

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));



const PORT = process.env.PORT || 5000;

// app.listen was here previously
