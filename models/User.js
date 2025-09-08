const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  userType: {
    type: String,
    enum: ['attorney', 'staff', 'client'],
    required: [true, 'User type is required']
  },
  // Common fields for all user types
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Address information (mainly for clients)
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Philippines' }
  },

  // Attorney/Staff specific fields
  position: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  barNumber: {
    type: String,
    trim: true // Only for attorneys
  },
  specializations: [{
    type: String,
    trim: true // Attorney specializations
  }],

  // Client specific fields
  clientId: {
    type: String,
    unique: true,
    sparse: true // Only for clients
  },
  assignedAttorney: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Reference to attorney
  },
  
  // Metadata
  lastLogin: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate client ID before saving for client users
userSchema.pre('save', async function(next) {
  if (this.userType === 'client' && !this.clientId) {
    const count = await mongoose.model('User').countDocuments({ userType: 'client' });
    this.clientId = `CLIENT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full address as string
userSchema.virtual('fullAddress').get(function() {
  if (!this.address || !this.address.street) return '';
  
  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.zipCode,
    this.address.country
  ].filter(part => part && part.trim());
  
  return parts.join(', ');
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Index for efficient queries
userSchema.index({ userType: 1, isActive: 1 });
userSchema.index({ assignedAttorney: 1 });

module.exports = mongoose.model('User', userSchema);