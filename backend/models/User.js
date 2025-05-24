const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  businessType: String,
  numberOfEmployees: Number,
  businessName: String,
  address: String,
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  emailsSentToday: { type: Number, default: 0 },
  lastResetDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);