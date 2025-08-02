const express = require('express');
const Expense = require('../models/Expense');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const expense = new Expense({ ...req.body, user: req.user.userId });
    await expense.save();

    // Check if the user has exceeded their budget
    const user = await User.findById(req.user.userId);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          user: user._id,
          type: 'expense',
          date: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1)
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalExpenses = monthlyExpenses.length > 0 ? monthlyExpenses[0].total : 0;

    if (totalExpenses > user.budget && user.budget > 0) {
      user.notifications.push({
        message: `You have exceeded your monthly budget of $${user.budget}. Current expenses: $${totalExpenses.toFixed(2)}`,
        date: new Date()
      });
      await user.save();
    }

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error adding expense', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.userId });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
});

router.get('/dashboard', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.userId });
    const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const categoryTotals = expenses.reduce((acc, e) => {
      if (e.type === 'expense') {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
      }
      return acc;
    }, {});
    const user = await User.findById(req.user.userId);
    res.json({ totalIncome, totalExpense, categoryTotals, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
});

module.exports = router;

