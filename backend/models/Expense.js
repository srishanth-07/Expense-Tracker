const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['income', 'expense'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);

