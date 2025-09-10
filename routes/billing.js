const express = require('express');
const { body, validationResult } = require('express-validator');
const Billing = require('../models/Billing');
const Case = require('../models/Case');
const { auth, authorize, canAccessClient } = require('../middleware/auth');

const router = express.Router();

// Get all billing records (filtered by user type)
router.get('/', auth, async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 10 } = req.query;
    let query = {};

    // Filter based on user type
    if (req.user.userType === 'client') {
      query.client = req.user._id;
    } else if (req.user.userType === 'attorney') {
      query.assignedAttorney = req.user._id;
    }

    // Apply additional filters
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const billings = await Billing.find(query)
      .populate('client', 'name email phone clientId')
      .populate('case', 'title caseNumber')
      .populate('assignedAttorney', 'name email')
      .sort({ issueDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Billing.countDocuments(query);

    res.json({
      billings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single billing record
router.get('/:billingId', auth, async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.billingId)
      .populate('client', 'name email phone clientId fullAddress')
      .populate('case', 'title caseNumber description')
      .populate('assignedAttorney', 'name email phone')
      .populate('payments.recordedBy', 'name')
      .populate('notes.createdBy', 'name userType');

    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }

    // Check access permissions
    if (req.user.userType === 'client' && billing.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    } else if (req.user.userType === 'attorney' && billing.assignedAttorney._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(billing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new billing record (attorney/staff only)
router.post('/', [
  auth,
  authorize('attorney', 'staff'),
  body('client').isMongoId().withMessage('Valid client ID is required'),
  body('case').isMongoId().withMessage('Valid case ID is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('billingType').isIn(['consultation', 'legal-services', 'court-filing', 'document-preparation', 'research', 'other']).withMessage('Invalid billing type'),
  body('lineItems').isArray({ min: 1 }).withMessage('At least one line item is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify case exists and user has access
    const case_ = await Case.findById(req.body.case);
    if (!case_) {
      return res.status(400).json({ message: 'Case not found' });
    }

    if (req.user.userType === 'attorney' && case_.assignedAttorney.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only create billing for your assigned cases' });
    }

    const billingData = {
      ...req.body,
      assignedAttorney: case_.assignedAttorney,
      createdBy: req.user._id
    };

    const billing = new Billing(billingData);
    await billing.save();

    const populatedBilling = await Billing.findById(billing._id)
      .populate('client', 'name email phone clientId')
      .populate('case', 'title caseNumber')
      .populate('assignedAttorney', 'name email');

    res.status(201).json(populatedBilling);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update billing record
router.put('/:billingId', [
  auth,
  authorize('attorney', 'staff')
], async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.billingId);
    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }

    // Check access permissions
    if (req.user.userType === 'attorney' && billing.assignedAttorney.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowedUpdates = [
      'description', 'billingType', 'lineItems', 'dueDate', 'status', 'notes'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    updates.lastModifiedBy = req.user._id;

    const updatedBilling = await Billing.findByIdAndUpdate(
      req.params.billingId,
      updates,
      { new: true, runValidators: true }
    ).populate('client', 'name email phone clientId')
     .populate('case', 'title caseNumber');

    res.json(updatedBilling);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Record payment
router.post('/:billingId/payments', [
  auth,
  authorize('attorney', 'staff'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be greater than 0'),
  body('paymentMethod').isIn(['cash', 'check', 'bank-transfer', 'credit-card', 'gcash', 'paymaya', 'other']).withMessage('Invalid payment method'),
  body('paymentDate').optional().isISO8601().withMessage('Valid payment date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const billing = await Billing.findById(req.params.billingId);
    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }

    // Check access permissions
    if (req.user.userType === 'attorney' && billing.assignedAttorney.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const payment = {
      amount: req.body.amount,
      paymentDate: req.body.paymentDate || new Date(),
      paymentMethod: req.body.paymentMethod,
      reference: req.body.reference,
      notes: req.body.notes,
      recordedBy: req.user._id
    };

    billing.payments.push(payment);
    await billing.save();

    const updatedBilling = await Billing.findById(billing._id)
      .populate('client', 'name email phone clientId')
      .populate('case', 'title caseNumber')
      .populate('payments.recordedBy', 'name');

    res.json({
      message: 'Payment recorded successfully',
      billing: updatedBilling,
      payment: billing.payments[billing.payments.length - 1]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get client's billing records
router.get('/client/my-bills', auth, authorize('client'), async (req, res) => {
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

// Get client's current unpaid bills
router.get('/client/unpaid', auth, authorize('client'), async (req, res) => {
  try {
    const unpaidBills = await Billing.find({
      client: req.user._id,
      paymentStatus: { $in: ['unpaid', 'partial'] },
      status: { $in: ['sent', 'viewed'] }
    })
      .populate('case', 'title caseNumber')
      .populate('assignedAttorney', 'name email phone')
      .sort({ dueDate: 1 });

    res.json(unpaidBills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add note to billing record
router.post('/:billingId/notes', [
  auth,
  body('content').trim().isLength({ min: 1 }).withMessage('Note content is required'),
  body('isInternal').optional().isBoolean().withMessage('isInternal must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const billing = await Billing.findById(req.params.billingId);
    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }

    // Check access permissions
    if (req.user.userType === 'client' && billing.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    } else if (req.user.userType === 'attorney' && billing.assignedAttorney.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { content, isInternal = false } = req.body;

    // Clients can't add internal notes
    const noteIsInternal = req.user.userType === 'client' ? false : isInternal;

    const note = {
      content,
      createdBy: req.user._id,
      isInternal: noteIsInternal
    };

    billing.notes.push(note);
    await billing.save();

    const updatedBilling = await Billing.findById(billing._id)
      .populate('notes.createdBy', 'name userType');

    res.json({
      message: 'Note added successfully',
      note: billing.notes[billing.notes.length - 1]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get billing statistics
router.get('/stats/overview', auth, authorize('attorney', 'staff'), async (req, res) => {
  try {
    let query = {};
    
    if (req.user.userType === 'attorney') {
      query.assignedAttorney = req.user._id;
    }

    const totalBills = await Billing.countDocuments(query);
    const paidBills = await Billing.countDocuments({ ...query, paymentStatus: 'paid' });
    const unpaidBills = await Billing.countDocuments({ ...query, paymentStatus: 'unpaid' });
    const overdueBills = await Billing.countDocuments({
      ...query,
      paymentStatus: { $in: ['unpaid', 'partial'] },
      dueDate: { $lt: new Date() }
    });

    const totalRevenue = await Billing.aggregate([
      { $match: { ...query, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const pendingRevenue = await Billing.aggregate([
      { $match: { ...query, paymentStatus: { $in: ['unpaid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      totalBills,
      paidBills,
      unpaidBills,
      overdueBills,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingRevenue: pendingRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;