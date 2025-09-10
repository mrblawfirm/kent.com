const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  category: {
    type: String,
    enum: ['contract', 'legal-brief', 'evidence', 'correspondence', 'court-filing', 'consultation', 'other'],
    default: 'other'
  },
  
  // Relationships
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  
  // Access control
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: String,
    enum: ['public', 'client-visible', 'attorney-only', 'staff-only', 'private'],
    default: 'attorney-only'
  },
  
  // Document metadata
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  },
  version: {
    type: Number,
    default: 1
  },
  parentDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  
  // Status and workflow
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'signed', 'filed', 'archived'],
    default: 'draft'
  },
  
  // Important dates
  documentDate: {
    type: Date // The date the document was created/signed (not upload date)
  },
  expirationDate: {
    type: Date
  },
  
  // Review and approval
  reviewedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs-revision'],
      default: 'pending'
    },
    comments: String
  }],
  
  // Metadata
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for file extension
documentSchema.virtual('fileExtension').get(function() {
  return this.originalName.split('.').pop().toLowerCase();
});

// Virtual for formatted file size
documentSchema.virtual('formattedSize').get(function() {
  const bytes = this.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for document age in days
documentSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
documentSchema.set('toJSON', { virtuals: true });
documentSchema.set('toObject', { virtuals: true });

// Index for efficient searches
documentSchema.index({ title: 'text', tags: 'text', description: 'text' });
documentSchema.index({ client: 1, createdAt: -1 });
documentSchema.index({ case: 1, createdAt: -1 });
documentSchema.index({ uploadedBy: 1, createdAt: -1 });
documentSchema.index({ accessLevel: 1, isArchived: 1 });

module.exports = mongoose.model('Document', documentSchema);