const express = require('express');
const Tracker = require('../models/Tracker');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const tracker = new Tracker({ ...req.body, user: req.user.userId });
    await tracker.save();
    res.status(201).json(tracker);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tracker', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const trackers = await Tracker.find({ user: req.user.userId });
    res.json(trackers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trackers', error: error.message });
  }
});

router.post('/:trackerId/items', auth, async (req, res) => {
  try {
    const tracker = await Tracker.findOne({ _id: req.params.trackerId, user: req.user.userId });
    if (!tracker) {
      return res.status(404).json({ message: 'Tracker not found' });
    }
    tracker.items.push(req.body);
    await tracker.save();
    res.status(201).json(tracker);
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to tracker', error: error.message });
  }
});

// New route to delete a tracker
router.delete('/:trackerId', auth, async (req, res) => {
  try {
    const tracker = await Tracker.findOneAndDelete({ _id: req.params.trackerId, user: req.user.userId });
    if (!tracker) {
      return res.status(404).json({ message: 'Tracker not found' });
    }
    res.json({ message: 'Tracker deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tracker', error: error.message });
  }
});

// New route to delete an item from a tracker
router.delete('/:trackerId/items/:itemId', auth, async (req, res) => {
  try {
    const tracker = await Tracker.findOne({ _id: req.params.trackerId, user: req.user.userId });
    if (!tracker) {
      return res.status(404).json({ message: 'Tracker not found' });
    }
    tracker.items = tracker.items.filter(item => item._id.toString() !== req.params.itemId);
    await tracker.save();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item from tracker', error: error.message });
  }
});

module.exports = router;

