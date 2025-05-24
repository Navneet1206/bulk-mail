// backend/models/Plan.js
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: String,
  dailyEmailLimit: Number,
  maxEmailsPerUpload: Number, // -1 for unlimited
  templateAccess: String, // 'basic' or 'premium'
  price: Number,
});

module.exports = mongoose.model('Plan', planSchema);