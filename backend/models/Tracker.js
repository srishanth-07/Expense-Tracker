const mongoose = require('mongoose');

const TrackerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  items: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Tracker', TrackerSchema);

