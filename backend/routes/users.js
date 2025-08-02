const express = require('express');
const User = require('../models/User');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

router.put('/budget', auth, async (req, res) => {
  try {
    const { budget } = req.body;
    const user = await User.findByIdAndUpdate(req.user.userId, { budget }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating budget', error: error.message });
  }
});

router.get('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('notifications');
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

router.get('/monthly-report', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const expenses = await Expense.find({
      user: req.user.userId,
      date: { $gte: startDate, $lte: endDate }
    });

    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    res.json({ totalExpense, categoryTotals });
  } catch (error) {
    res.status(500).json({ message: 'Error generating monthly report', error: error.message });
  }
});

router.post('/clear-notifications', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { notifications: [] } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error clearing notifications', error: error.message });
  }
});

module.exports = router;

