const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emailsSent: { type: Number, required: true },
  templateUsed: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EmailLog', emailLogSchema);