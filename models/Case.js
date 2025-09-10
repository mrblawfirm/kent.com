const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseNumber: {
    type: String,
    required: [true, 'Case number is required'],
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Case title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  caseType: {
    type: String,
    enum: ['criminal', 'civil', 'family', 'corporate', 'real-estate', 'immigration', 'labor', 'other'],
    required: [true, 'Case type is required']
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'on-hold', 'completed', 'dismissed', 'settled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Parties involved
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required']
  },
  assignedAttorney: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned attorney is required']
  },
  supportStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Court information
  court: {
    name: String,
    address: String,
    judge: String,
    courtroom: String
  },
  
  // Case timeline
  filingDate: {
    type: Date,
    required: [true, 'Filing date is required']
  },
  expectedResolutionDate: {
    type: Date
  },
  actualResolutionDate: {
    type: Date
  },
  
  // Financial information
  estimatedCost: {
    type: Number,
    min: 0
  },
  actualCost: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Documents and evidence
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  
  // Case notes and updates
  notes: [{
    content: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPublic: {
      type: Boolean,
      default: false // Whether client can see this note
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Hearings and events
  hearings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  
  // Case outcome
  outcome: {
    result: {
      type: String,
      enum: ['won', 'lost', 'settled', 'dismissed', 'pending'],
      default: 'pending'
    },
    details: String,
    damages: Number,
    settlement: Number
  },
  
  // Metadata
  isArchived: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate case number before saving
caseSchema.pre('save', async function(next) {
  if (!this.caseNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Case').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.caseNumber = `CASE-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for case age in days
caseSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.filingDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for status color
caseSchema.virtual('statusColor').get(function() {
  const colorMap = {
    'pending': '#ffc107',
    'active': '#007bff',
    'on-hold': '#6c757d',
    'completed': '#28a745',
    'dismissed': '#dc3545',
    'settled': '#17a2b8'
  };
  return colorMap[this.status] || '#6c757d';
});

// Ensure virtual fields are serialized
caseSchema.set('toJSON', { virtuals: true });
caseSchema.set('toObject', { virtuals: true });

// Indexes for efficient queries
caseSchema.index({ client: 1, status: 1 });
caseSchema.index({ assignedAttorney: 1, status: 1 });
caseSchema.index({ caseNumber: 1 });
caseSchema.index({ filingDate: -1 });
caseSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('Case', caseSchema);