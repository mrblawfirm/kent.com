const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Case = require('../models/Case');
const Event = require('../models/Event');
const Document = require('../models/Document');
const Billing = require('../models/Billing');
const { auth, authorize, canAccessClient } = require('../middleware/auth');

const router = express.Router();

// Get client dashboard data
router.get('/dashboard', auth, authorize('client'), async (req, res) => {
  try {
    const clientId = req.user._id;

    // Get client's active case
    const activeCase = await Case.findOne({
      client: clientId,
      status: { $in: ['pending', 'active'] }
    }).populate('assignedAttorney', 'name email phone barNumber specializations');

    // Get next hearing
    const nextHearing = await Event.findOne({
      client: clientId,
      eventType: 'court-hearing',
      startDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    }).sort({ startDate: 1 });

    // Get upcoming events for the week
    const weekStart = new Date();
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekEvents = await Event.find({
      client: clientId,
      startDate: { $gte: weekStart, $lte: weekEnd }
    }).sort({ startDate: 1 });

    // Get current unpaid bills
    const unpaidBills = await Billing.find({
      client: clientId,
      paymentStatus: { $in: ['unpaid', 'partial'] },
      status: { $in: ['sent', 'viewed'] }
    }).populate('case', 'title caseNumber');

    // Get recent documents
    const recentDocuments = await Document.find({
      $or: [
        { client: clientId },
        { accessLevel: 'public' },
        { accessLevel: 'client-visible' }
      ],
      isArchived: false
    })
      .populate('uploadedBy', 'name userType')
      .sort({ createdAt: -1 })
      .limit(4);

    res.json({
      client: req.user,
      activeCase,
      nextHearing,
      weekEvents,
      unpaidBills,
      recentDocuments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get client's profile
router.get('/profile', auth, authorize('client'), async (req, res) => {
  try {
    const client = await User.findById(req.user._id)
      .select('-password')
      .populate('assignedAttorney', 'name email phone barNumber specializations');

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get client's cases
router.get('/cases', auth, authorize('client'), async (req, res) => {
  try {
    const cases = await Case.find({ client: req.user._id })
      .populate('assignedAttorney', 'name email phone')
      .populate({
        path: 'notes.createdBy',
        select: 'name userType'
      })
      .sort({ createdAt: -1 });

    // Filter notes to only show public notes to clients
    cases.forEach(case_ => {
      case_.notes = case_.notes.filter(note => note.isPublic);
    });

    res.json(cases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get client's events
router.get('/events', auth, authorize('client'), async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    let query = { client: req.user._id };

    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (type) {
      query.eventType = type;
    }

    const events = await Event.find(query)
      .populate('assignedTo', 'name email')
      .populate('case', 'title caseNumber')
      .sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get client's documents
router.get('/documents', auth, authorize('client'), async (req, res) => {
  try {
    const { category } = req.query;
    let query = {
      $or: [
        { client: req.user._id },
        { accessLevel: 'public' },
        { accessLevel: 'client-visible' }
      ],
      isArchived: false
    };

    if (category) query.category = category;

    const documents = await Document.find(query)
      .populate('case', 'title caseNumber')
      .populate('uploadedBy', 'name userType')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get client's billing records
router.get('/billing', auth, authorize('client'), async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    let query = { client: req.user._id };

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const billings = await Billing.find(query)
      .populate('case', 'title caseNumber')
      .populate('assignedAttorney', 'name email phone')
      .sort({ issueDate: -1 });

    res.json(billings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update client profile
router.put('/profile', [
  auth,
  authorize('client'),
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedUpdates = ['name', 'phone', 'avatar', 'address'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const client = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password').populate('assignedAttorney', 'name email phone');

    res.json({
      message: 'Profile updated successfully',
      client
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get client's upcoming hearings
router.get('/hearings/upcoming', auth, authorize('client'), async (req, res) => {
  try {
    const hearings = await Event.find({
      client: req.user._id,
      eventType: 'court-hearing',
      startDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate('case', 'title caseNumber')
      .populate('assignedTo', 'name email phone')
      .sort({ startDate: 1 });

    res.json(hearings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get client's consultation history
router.get('/consultations', auth, authorize('client'), async (req, res) => {
  try {
    const consultations = await Event.find({
      client: req.user._id,
      eventType: 'consultation'
    })
      .populate('assignedTo', 'name email phone')
      .populate('case', 'title caseNumber')
      .sort({ startDate: -1 });

    res.json(consultations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get client's case timeline
router.get('/timeline', auth, authorize('client'), async (req, res) => {
  try {
    const clientId = req.user._id;

    // Get all events for the client
    const events = await Event.find({ client: clientId })
      .populate('case', 'title caseNumber')
      .sort({ startDate: -1 })
      .limit(20);

    // Get case notes that are public
    const cases = await Case.find({ client: clientId })
      .populate({
        path: 'notes.createdBy',
        select: 'name userType'
      });

    const publicNotes = [];
    cases.forEach(case_ => {
      case_.notes.forEach(note => {
        if (note.isPublic) {
          publicNotes.push({
            type: 'note',
            content: note.content,
            createdBy: note.createdBy,
            createdAt: note.createdAt,
            case: {
              title: case_.title,
              caseNumber: case_.caseNumber
            }
          });
        }
      });
    });

    // Combine and sort timeline items
    const timeline = [
      ...events.map(event => ({
        type: 'event',
        title: event.title,
        eventType: event.eventType,
        startDate: event.startDate,
        status: event.status,
        case: event.case,
        createdAt: event.createdAt
      })),
      ...publicNotes
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(timeline);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;