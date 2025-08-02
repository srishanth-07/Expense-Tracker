const express = require('express');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all goals for a user
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.userId });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals', error: error.message });
  }
});

// Create a new goal
router.post('/', auth, async (req, res) => {
  try {
    const { name, targetAmount } = req.body;
    const goal = new Goal({
      user: req.user.userId,
      name,
      targetAmount,
    });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating goal', error: error.message });
  }
});

// Update a goal
router.put('/:id', auth, async (req, res) => {
  try {
    const { currentAmount } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { currentAmount },
      { new: true }
    );
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal', error: error.message });
  }
});

// Delete a goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting goal', error: error.message });
  }
});

module.exports = router;

