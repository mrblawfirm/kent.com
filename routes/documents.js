const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/documents';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow common document types
    const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document files are allowed (PDF, DOC, DOCX, TXT, images)'));
    }
  }
});

// Get all documents (filtered by user type and access level)
router.get('/', auth, async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    let query = { isArchived: false };

    // Filter based on user type and access level
    if (req.user.userType === 'client') {
      query.$or = [
        { client: req.user._id },
        { accessLevel: 'public' },
        { accessLevel: 'client-visible' }
      ];
    } else if (req.user.userType === 'attorney') {
      // Attorneys can see documents they uploaded or are assigned to their cases
      query.$or = [
        { uploadedBy: req.user._id },
        { accessLevel: { $ne: 'private' } }
      ];
    } else if (req.user.userType === 'staff') {
      query.accessLevel = { $in: ['public', 'client-visible', 'staff-only'] };
    }

    if (category) query.category = category;

    const documents = await Document.find(query)
      .populate('client', 'name email clientId')
      .populate('case', 'title caseNumber')
      .populate('uploadedBy', 'name userType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload document
router.post('/upload', [
  auth,
  upload.single('document'),
  body('title').trim().isLength({ min: 1 }).withMessage('Document title is required'),
  body('category').optional().isIn(['contract', 'legal-brief', 'evidence', 'correspondence', 'court-filing', 'consultation', 'other']).withMessage('Invalid category'),
  body('accessLevel').optional().isIn(['public', 'client-visible', 'attorney-only', 'staff-only', 'private']).withMessage('Invalid access level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const documentData = {
      title: req.body.title,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      category: req.body.category || 'other',
      accessLevel: req.body.accessLevel || 'attorney-only',
      client: req.body.client,
      case: req.body.case,
      event: req.body.event,
      description: req.body.description,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      uploadedBy: req.user._id
    };

    const document = new Document(documentData);
    await document.save();

    const populatedDocument = await Document.findById(document._id)
      .populate('client', 'name email clientId')
      .populate('case', 'title caseNumber')
      .populate('uploadedBy', 'name userType');

    res.status(201).json(populatedDocument);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single document
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('client', 'name email clientId')
      .populate('case', 'title caseNumber')
      .populate('uploadedBy', 'name userType')
      .populate('reviewedBy.user', 'name userType');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access permissions
    let hasAccess = false;

    if (req.user.userType === 'client') {
      hasAccess = document.client?._id.toString() === req.user._id.toString() ||
                  document.accessLevel === 'public' ||
                  document.accessLevel === 'client-visible';
    } else if (req.user.userType === 'attorney') {
      hasAccess = document.uploadedBy._id.toString() === req.user._id.toString() ||
                  document.accessLevel !== 'private';
    } else if (req.user.userType === 'staff') {
      hasAccess = document.accessLevel !== 'private' && document.accessLevel !== 'attorney-only';
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download document
router.get('/:id/download', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access permissions (same as get single document)
    let hasAccess = false;

    if (req.user.userType === 'client') {
      hasAccess = document.client?.toString() === req.user._id.toString() ||
                  document.accessLevel === 'public' ||
                  document.accessLevel === 'client-visible';
    } else if (req.user.userType === 'attorney') {
      hasAccess = document.uploadedBy.toString() === req.user._id.toString() ||
                  document.accessLevel !== 'private';
    } else if (req.user.userType === 'staff') {
      hasAccess = document.accessLevel !== 'private' && document.accessLevel !== 'attorney-only';
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(document.path, document.originalName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get client's documents
router.get('/client/my-documents', auth, authorize('client'), async (req, res) => {
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

// Get recent documents for client
router.get('/client/recent', auth, authorize('client'), async (req, res) => {
  try {
    const recentDocuments = await Document.find({
      $or: [
        { client: req.user._id },
        { accessLevel: 'public' },
        { accessLevel: 'client-visible' }
      ],
      isArchived: false
    })
      .populate('uploadedBy', 'name userType')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(recentDocuments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update document
router.put('/:id', [
  auth,
  authorize('attorney', 'staff'),
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user can update this document
    if (document.uploadedBy.toString() !== req.user._id.toString() && req.user.userType !== 'attorney') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowedUpdates = ['title', 'description', 'category', 'accessLevel', 'tags', 'status'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'tags' && typeof req.body[field] === 'string') {
          updates[field] = req.body[field].split(',').map(tag => tag.trim());
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('client', 'name email clientId')
     .populate('case', 'title caseNumber');

    res.json(updatedDocument);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete document
router.delete('/:id', auth, authorize('attorney', 'staff'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user can delete this document
    if (document.uploadedBy.toString() !== req.user._id.toString() && req.user.userType !== 'attorney') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;