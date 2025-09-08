const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required']
  },
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: [true, 'Case is required']
  },
  assignedAttorney: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned attorney is required']
  },
  
  // Billing details
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  billingType: {
    type: String,
    enum: ['consultation', 'legal-services', 'court-filing', 'document-preparation', 'research', 'other'],
    required: [true, 'Billing type is required']
  },
  
  // Line items
  lineItems: [{
    description: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1
    },
    rate: {
      type: Number,
      required: true,
      min: 0
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Amounts
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0.12, // 12% VAT in Philippines
    min: 0,
    max: 1
  },
  taxAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  },
  
  // Payment information
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'refunded'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'check', 'bank-transfer', 'credit-card', 'gcash', 'paymaya', 'other'],
    trim: true
  },
  
  // Important dates
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  paidDate: {
    type: Date
  },
  
  // Payment tracking
  payments: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'check', 'bank-transfer', 'credit-card', 'gcash', 'paymaya', 'other'],
      required: true
    },
    reference: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  
  // Notes and communications
  notes: [{
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isInternal: {
      type: Boolean,
      default: false // Whether this note is internal or visible to client
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
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

// Generate invoice number before saving
billingSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Billing').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Calculate totals before saving
billingSchema.pre('save', function(next) {
  // Calculate subtotal from line items
  if (this.lineItems && this.lineItems.length > 0) {
    this.subtotal = this.lineItems.reduce((sum, item) => sum + item.amount, 0);
  }
  
  // Calculate tax amount
  this.taxAmount = this.subtotal * this.taxRate;
  
  // Calculate total amount
  this.totalAmount = this.subtotal + this.taxAmount;
  
  // Update payment status based on payments
  if (this.payments && this.payments.length > 0) {
    const totalPaid = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    if (totalPaid >= this.totalAmount) {
      this.paymentStatus = 'paid';
      if (!this.paidDate) {
        this.paidDate = new Date();
      }
    } else if (totalPaid > 0) {
      this.paymentStatus = 'partial';
    }
  }
  
  next();
});

// Virtual for remaining balance
billingSchema.virtual('remainingBalance').get(function() {
  const totalPaid = this.payments ? this.payments.reduce((sum, payment) => sum + payment.amount, 0) : 0;
  return Math.max(0, this.totalAmount - totalPaid);
});

// Virtual for total paid amount
billingSchema.virtual('totalPaid').get(function() {
  return this.payments ? this.payments.reduce((sum, payment) => sum + payment.amount, 0) : 0;
});

// Virtual for overdue status
billingSchema.virtual('isOverdue').get(function() {
  return this.paymentStatus !== 'paid' && new Date() > this.dueDate;
});

// Virtual for days overdue
billingSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const diffTime = Math.abs(new Date() - this.dueDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
billingSchema.set('toJSON', { virtuals: true });
billingSchema.set('toObject', { virtuals: true });

// Indexes for efficient queries
billingSchema.index({ client: 1, status: 1 });
billingSchema.index({ case: 1 });
billingSchema.index({ assignedAttorney: 1 });
billingSchema.index({ invoiceNumber: 1 });
billingSchema.index({ issueDate: -1 });
billingSchema.index({ dueDate: 1, paymentStatus: 1 });

module.exports = mongoose.model('Billing', billingSchema);