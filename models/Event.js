const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  eventType: {
    type: String,
    enum: ['consultation', 'meeting', 'court-hearing', 'document-review', 'client-meeting', 'other'],
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  location: {
    type: String,
    trim: true
  },
  
  // Participants
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['invited', 'confirmed', 'declined', 'attended'],
      default: 'invited'
    }
  }],
  
  // Event status and details
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Related case
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  
  // Court-specific information
  judge: {
    type: String,
    trim: true
  },
  courtroom: {
    type: String,
    trim: true
  },
  
  // Reminder settings
  reminder: {
    enabled: {
      type: Boolean,
      default: true
    },
    minutes: {
      type: Number,
      default: 30
    }
  },
  
  // Event notes and outcomes
  notes: {
    type: String,
    trim: true
  },
  outcome: {
    type: String,
    trim: true
  },
  
  // Documents related to this event
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for event duration in minutes
eventSchema.virtual('durationMinutes').get(function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60));
});

// Virtual for formatted date range
eventSchema.virtual('dateRange').get(function() {
  const start = this.startDate.toLocaleDateString();
  const end = this.endDate.toLocaleDateString();
  return start === end ? start : `${start} - ${end}`;
});

// Virtual for status color
eventSchema.virtual('statusColor').get(function() {
  const colorMap = {
    'scheduled': '#ffc107',
    'confirmed': '#28a745',
    'completed': '#6c757d',
    'cancelled': '#dc3545',
    'rescheduled': '#fd7e14'
  };
  return colorMap[this.status] || '#6c757d';
});

// Ensure virtual fields are serialized
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

// Index for efficient date queries
eventSchema.index({ startDate: 1, assignedTo: 1 });
eventSchema.index({ client: 1, startDate: 1 });
eventSchema.index({ case: 1 });
eventSchema.index({ eventType: 1, status: 1 });

module.exports = mongoose.model('Event', eventSchema);