const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (attorney/staff only, filtered by type)
router.get('/', auth, authorize('attorney', 'staff'), async (req, res) => {
  try {
    const { userType, page = 1, limit = 10, search } = req.query;
    let query = { isActive: true };

    if (userType) {
      query.userType = userType;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { clientId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('assignedAttorney', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single user
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('assignedAttorney', 'name email phone barNumber');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check access permissions
    if (req.user.userType === 'client' && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all attorneys (for assignment purposes)
router.get('/attorneys/list', auth, authorize('attorney', 'staff'), async (req, res) => {
  try {
    const attorneys = await User.find({
      userType: 'attorney',
      isActive: true
    })
      .select('name email phone barNumber specializations')
      .sort({ name: 1 });

    res.json(attorneys);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attorney's clients
router.get('/attorney/clients', auth, authorize('attorney'), async (req, res) => {
  try {
    const clients = await User.find({
      userType: 'client',
      assignedAttorney: req.user._id,
      isActive: true
    })
      .select('-password')
      .populate('assignedAttorney', 'name email')
      .sort({ name: 1 });

    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (attorney/staff only)
router.post('/', [
  auth,
  authorize('attorney', 'staff'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('userType').isIn(['attorney', 'staff', 'client']).withMessage('Invalid user type'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, userType, phone, address, position, barNumber, specializations, assignedAttorney } = req.body;

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user data object
    const userData = { 
      name, 
      email, 
      password, 
      userType, 
      phone,
      createdBy: req.user._id
    };

    // Add user-type specific fields
    if (address) userData.address = address;
    if (position) userData.position = position;
    if (barNumber && userType === 'attorney') userData.barNumber = barNumber;
    if (specializations && userType === 'attorney') userData.specializations = specializations;
    if (assignedAttorney && userType === 'client') userData.assignedAttorney = assignedAttorney;

    // Create new user
    const user = new User(userData);
    await user.save();

    const populatedUser = await User.findById(user._id)
      .select('-password')
      .populate('assignedAttorney', 'name email phone');

    res.status(201).json(populatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/:userId', [
  auth,
  authorize('attorney', 'staff'),
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedUpdates = [
      'name', 'phone', 'address', 'position', 'specializations', 
      'assignedAttorney', 'isActive'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('assignedAttorney', 'name email phone');

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate user (soft delete)
router.patch('/:userId/deactivate', auth, authorize('attorney'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reactivate user
router.patch('/:userId/activate', auth, authorize('attorney'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User activated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign attorney to client
router.patch('/:clientId/assign-attorney', [
  auth,
  authorize('attorney', 'staff'),
  body('attorneyId').isMongoId().withMessage('Valid attorney ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify client exists
    const client = await User.findOne({ _id: req.params.clientId, userType: 'client' });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Verify attorney exists
    const attorney = await User.findOne({ _id: req.body.attorneyId, userType: 'attorney', isActive: true });
    if (!attorney) {
      return res.status(400).json({ message: 'Attorney not found or inactive' });
    }

    client.assignedAttorney = req.body.attorneyId;
    await client.save();

    const updatedClient = await User.findById(client._id)
      .select('-password')
      .populate('assignedAttorney', 'name email phone barNumber');

    res.json({ message: 'Attorney assigned successfully', client: updatedClient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/stats/overview', auth, authorize('attorney', 'staff'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalClients = await User.countDocuments({ userType: 'client', isActive: true });
    const totalAttorneys = await User.countDocuments({ userType: 'attorney', isActive: true });
    const totalStaff = await User.countDocuments({ userType: 'staff', isActive: true });
    
    const unassignedClients = await User.countDocuments({ 
      userType: 'client', 
      isActive: true, 
      assignedAttorney: { $exists: false }
    });

    res.json({
      totalUsers,
      totalClients,
      totalAttorneys,
      totalStaff,
      unassignedClients
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;