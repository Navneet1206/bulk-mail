const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const planRoutes = require('./routes/planRoutes');
const multer = require('multer');
const path = require('path');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/email', upload.fields([{ name: 'file' }, { name: 'logo' }]), emailRoutes);
app.use('/api/plan', planRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));