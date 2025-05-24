// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/db');
// const authRoutes = require('./routes/authRoutes');
// const emailRoutes = require('./routes/emailRoutes');
// const planRoutes = require('./routes/planRoutes');
// const multer = require('multer');
// const path = require('path');

// // Load environment variables from .env file
// require('dotenv').config();

// const app = express();

// // Connect to MongoDB
// connectDB();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Set up multer for file uploads
// const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/email', upload.fields([{ name: 'file' }, { name: 'logo' }]), emailRoutes);
// app.use('/api/plan', planRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from 'express';
import cors from 'cors';
import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const { json } = express;

const app = express();
app.use(cors());
app.use(json());

// Nodemailer transporter configuration for Zeptomail
const transporter = createTransport({
  host: 'smtp.zeptomail.in',
  port: 465, // SSL for secure connection
  secure: true, // true for port 465
  auth: {
    user: process.env.ZOHO_EMAIL_APIKEY, // Using emailapikey as username
    pass: process.env.ZOHO_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Transporter is ready to send emails');
  }
});

// Email template
const getEmailTemplate = (recipientName) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #333333;
      background-color: #f7f7f7;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #e3f2fd;
      padding: 20px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      color: #1565c0;
      margin: 0;
      font-size: 26px;
      font-weight: 600;
    }
    .header p.tagline {
      color: #555555;
      font-style: italic;
      font-size: 16px;
      margin: 5px 0 0;
    }
    .content {
      padding: 25px;
    }
    .content p {
      margin: 0 0 15px;
    }
    .content .highlight {
      color: #1565c0;
      font-weight: 500;
    }
    .footer {
      font-size: 12px;
      color: #666666;
      text-align: center;
      padding: 20px;
      border-top: 1px solid #e0e0e0;
    }
    .footer a {
      color: #1565c0;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to SavayasHeal</h1>
      <p class="tagline">We don't judge, we emphasize</p>
    </div>
    <div class="content">
      <p>Dear ${recipientName || 'Valued Friend'},</p>
      <p>Take a moment to pause and breathe. At <span class="highlight">SavayasHeal</span>, we’re dedicated to creating a space where you feel valued and supported. Our goal is to guide you toward wellness and growth with empathy and understanding.</p>
      <p>Explore how we can support your journey to balance and fulfillment. Visit savayasheal.com to learn more about our offerings.</p>
      <p>With care and warmth,</p>
      <p>The SavayasHeal Team<br>savayasheal.com</p>
    </div>
    <div class="footer">
      <p>Don’t wish to receive these emails? <a href="mailto:${process.env.ZOHO_EMAIL_APIKEY}?subject=Unsubscribe">Click here to unsubscribe</a>.</p>
      <p>SavayasHeal, ${process.env.ZOHO_EMAIL_APIKEY}</p>
    </div>
  </div>
</body>
</html>
`;

// API to send emails
app.post('/send-emails', async (req, res) => {
  const { recipients } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'No valid recipients provided' });
  }

  const results = [];
  for (const recipient of recipients) {
    const { email, name } = recipient;
    if (!email) {
      results.push({ email: 'missing', status: 'failed', error: 'No email provided' });
      continue;
    }
    try {
      await transporter.sendMail({
        from: `"SavayasHeal" <${process.env.ZOHO_EMAIL_APIKEY}>`,
        to: email,
        subject: 'A Warm Welcome from SavayasHeal',
        html: getEmailTemplate(name)
      });
      results.push({ email, status: 'success' });
    } catch (error) {
      console.error(`Error sending email to ${email}:`, error);
      results.push({ email, status: 'failed', error: error.message });
    }
  }

  const failed = results.filter(r => r.status === 'failed');
  if (failed.length > 0) {
    res.status(500).json({ message: 'Some emails failed to send', results });
  } else {
    res.json({ message: 'All emails sent successfully', results });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});