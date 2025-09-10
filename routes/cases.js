const express = require('express');
const { body, validationResult } = require('express-validator');
const Case = require('../models/Case');
const User = require('../models/User');
const { auth, authorize, canAccessCase } = require('../middleware/auth');

const router = express.Router();

// Get all cases (filtered by user type)
router.get('/', auth, async (req, res) => {
  try {
    const { status, caseType, priority, page = 1, limit = 10 } = req.query;
    let query = {};

    // Filter based on user type
    if (req.user.userType === 'client') {
      query.client = req.user._id;
    } else if (req.user.userType === 'attorney') {
      query.assignedAttorney = req.user._id;
    } else if (req.user.userType === 'staff') {
      query.supportStaff = { $in: [req.user._id] };
    }

    // Apply additional filters
    if (status) query.status = status;
    if (caseType) query.caseType = caseType;
    if (priority) query.priority = priority;

    const cases = await Case.find(query)
      .populate('client', 'name email phone clientId')
      .populate('assignedAttorney', 'name email phone barNumber')
      .populate('supportStaff', 'name email position')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Case.countDocuments(query);

    res.json({
      cases,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single case
router.get('/:caseId', auth, canAccessCase, async (req, res) => {
  try {
    const case_ = await Case.findById(req.params.caseId)
      .populate('client', 'name email phone clientId fullAddress')
      .populate('assignedAttorney', 'name email phone barNumber specializations')
      .populate('supportStaff', 'name email position')
      .populate('documents', 'title filename originalName size createdAt')
      .populate('hearings', 'title startDate endDate location status')
      .populate({
        path: 'notes.createdBy',
        select: 'name userType'
      });

    res.json(case_);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new case (attorney/staff only)
router.post('/', [
  auth,
  authorize('attorney', 'staff'),
  body('title').trim().isLength({ min: 1 }).withMessage('Case title is required'),
  body('caseType').isIn(['criminal', 'civil', 'family', 'corporate', 'real-estate', 'immigration', 'labor', 'other']).withMessage('Invalid case type'),
  body('client').isMongoId().withMessage('Valid client ID is required'),
  body('filingDate').isISO8601().withMessage('Valid filing date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify client exists and is actually a client
    const client = await User.findOne({ _id: req.body.client, userType: 'client' });
    if (!client) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    const caseData = {
      ...req.body,
      assignedAttorney: req.user.userType === 'attorney' ? req.user._id : req.body.assignedAttorney,
      createdBy: req.user._id
    };

    const newCase = new Case(caseData);
    await newCase.save();

    const populatedCase = await Case.findById(newCase._id)
      .populate('client', 'name email phone clientId')
      .populate('assignedAttorney', 'name email phone barNumber')
      .populate('createdBy', 'name userType');

    res.status(201).json(populatedCase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update case
router.put('/:caseId', [
  auth,
  authorize('attorney', 'staff'),
  canAccessCase
], async (req, res) => {
  try {
    const allowedUpdates = [
      'title', 'description', 'status', 'priority', 'court', 
      'expectedResolutionDate', 'estimatedCost', 'outcome'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const case_ = await Case.findByIdAndUpdate(
      req.params.caseId,
      updates,
      { new: true, runValidators: true }
    ).populate('client', 'name email phone clientId')
     .populate('assignedAttorney', 'name email phone barNumber');

    res.json(case_);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add note to case
router.post('/:caseId/notes', [
  auth,
  canAccessCase,
  body('content').trim().isLength({ min: 1 }).withMessage('Note content is required'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, isPublic = false } = req.body;

    // Clients can only add public notes
    const noteIsPublic = req.user.userType === 'client' ? true : isPublic;

    const case_ = await Case.findByIdAndUpdate(
      req.params.caseId,
      {
        $push: {
          notes: {
            content,
            createdBy: req.user._id,
            isPublic: noteIsPublic
          }
        }
      },
      { new: true }
    ).populate({
      path: 'notes.createdBy',
      select: 'name userType'
    });

    res.json(case_.notes[case_.notes.length - 1]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get case notes (filtered by user type)
router.get('/:caseId/notes', auth, canAccessCase, async (req, res) => {
  try {
    const case_ = await Case.findById(req.params.caseId)
      .populate({
        path: 'notes.createdBy',
        select: 'name userType'
      });

    let notes = case_.notes;

    // Clients can only see public notes
    if (req.user.userType === 'client') {
      notes = notes.filter(note => note.isPublic);
    }

    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get client's active case
router.get('/client/active', auth, authorize('client'), async (req, res) => {
  try {
    const activeCase = await Case.findOne({
      client: req.user._id,
      status: { $in: ['pending', 'active'] }
    })
      .populate('assignedAttorney', 'name email phone barNumber specializations')
      .populate('supportStaff', 'name email position')
      .populate({
        path: 'notes.createdBy',
        select: 'name userType'
      });

    if (!activeCase) {
      return res.status(404).json({ message: 'No active case found' });
    }

    // Filter notes for client (only public notes)
    activeCase.notes = activeCase.notes.filter(note => note.isPublic);

    res.json(activeCase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get case statistics
router.get('/stats/overview', auth, authorize('attorney', 'staff'), async (req, res) => {
  try {
    let query = {};
    
    if (req.user.userType === 'attorney') {
      query.assignedAttorney = req.user._id;
    } else if (req.user.userType === 'staff') {
      query.supportStaff = { $in: [req.user._id] };
    }

    const stats = await Case.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalCases = await Case.countDocuments(query);
    const activeCases = await Case.countDocuments({ ...query, status: 'active' });
    const pendingCases = await Case.countDocuments({ ...query, status: 'pending' });
    const completedCases = await Case.countDocuments({ ...query, status: 'completed' });

    res.json({
      totalCases,
      activeCases,
      pendingCases,
      completedCases,
      statusBreakdown: stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;