const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all events for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, type, status } = req.query;
    let query = {};

    // Filter based on user type
    if (req.user.userType === 'client') {
      query.client = req.user._id;
    } else {
      query.assignedTo = req.user._id;
    }

    // Date range filter
    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Type filter
    if (type) {
      query.eventType = type;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate('client', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('case', 'title caseNumber')
      .sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new event
router.post('/', [
  auth,
  authorize('attorney', 'staff'),
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('eventType').isIn(['consultation', 'meeting', 'court-hearing', 'document-review', 'client-meeting', 'other']).withMessage('Invalid event type'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      assignedTo: req.user._id,
      createdBy: req.user._id
    };

    const event = new Event(eventData);
    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('client', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('case', 'title caseNumber');

    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming court hearings
router.get('/court-hearings', auth, async (req, res) => {
  try {
    let query = {
      eventType: 'court-hearing',
      startDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    };

    if (req.user.userType === 'client') {
      query.client = req.user._id;
    } else {
      query.assignedTo = req.user._id;
    }

    const hearings = await Event.find(query)
      .populate('client', 'name email phone')
      .populate('case', 'title caseNumber')
      .sort({ startDate: 1 })
      .limit(10);

    res.json(hearings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming consultations
router.get('/consultations', auth, async (req, res) => {
  try {
    let query = {
      eventType: 'consultation',
      startDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    };

    if (req.user.userType === 'client') {
      query.client = req.user._id;
    } else {
      query.assignedTo = req.user._id;
    }

    const consultations = await Event.find(query)
      .populate('client', 'name email phone')
      .populate('case', 'title caseNumber')
      .sort({ startDate: 1 })
      .limit(10);

    res.json(consultations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/:id', [
  auth,
  authorize('attorney', 'staff'),
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('eventType').optional().isIn(['consultation', 'meeting', 'court-hearing', 'document-review', 'client-meeting', 'other']).withMessage('Invalid event type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, assignedTo: req.user._id },
      { ...req.body, lastModifiedBy: req.user._id },
      { new: true }
    ).populate('client', 'name email phone')
     .populate('case', 'title caseNumber');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', auth, authorize('attorney', 'staff'), async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      assignedTo: req.user._id
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;