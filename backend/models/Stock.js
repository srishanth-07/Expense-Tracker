const mongoose = require('mongoose');

// Define the schema for a Stock
const stockSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  price: { type: String, required: true },
  high: { type: String, required: true },
  low: { type: String, required: true },
});

module.exports = mongoose.model('Stock', stockSchema);
