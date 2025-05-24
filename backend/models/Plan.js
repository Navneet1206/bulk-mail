const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: String,
  dailyEmailLimit: Number,
  maxEmailsPerUpload: Number,
  templateAccess: String,
  price: Number,
});

module.exports = mongoose.model('Plan', planSchema);