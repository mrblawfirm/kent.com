const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Token is not valid or user is inactive.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

const authorize = (...userTypes) => {
  return (req, res, next) => {
    if (!userTypes.includes(req.user.userType)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        requiredUserTypes: userTypes,
        currentUserType: req.user.userType
      });
    }
    next();
  };
};

// Middleware to check if user can access client data
const canAccessClient = async (req, res, next) => {
  try {
    const clientId = req.params.clientId || req.body.clientId || req.query.clientId;
    
    if (!clientId) {
      return res.status(400).json({ message: 'Client ID is required.' });
    }

    // If user is a client, they can only access their own data
    if (req.user.userType === 'client') {
      if (req.user._id.toString() !== clientId) {
        return res.status(403).json({ message: 'Access denied. You can only access your own data.' });
      }
    }
    // If user is attorney or staff, check if they have access to this client
    else if (req.user.userType === 'attorney' || req.user.userType === 'staff') {
      const client = await User.findById(clientId);
      if (!client) {
        return res.status(404).json({ message: 'Client not found.' });
      }
      
      // Attorneys can access their assigned clients
      if (req.user.userType === 'attorney' && client.assignedAttorney?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only access your assigned clients.' });
      }
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error in access control.' });
  }
};

// Middleware to check if user can access case data
const canAccessCase = async (req, res, next) => {
  try {
    const caseId = req.params.caseId || req.body.caseId || req.query.caseId;
    
    if (!caseId) {
      return res.status(400).json({ message: 'Case ID is required.' });
    }

    const Case = require('../models/Case');
    const case_ = await Case.findById(caseId);
    
    if (!case_) {
      return res.status(404).json({ message: 'Case not found.' });
    }

    // Check access based on user type
    if (req.user.userType === 'client') {
      if (case_.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only access your own cases.' });
      }
    } else if (req.user.userType === 'attorney') {
      if (case_.assignedAttorney.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only access your assigned cases.' });
      }
    } else if (req.user.userType === 'staff') {
      // Staff can access cases they are assigned to support
      const isSupport = case_.supportStaff.some(staff => staff.toString() === req.user._id.toString());
      if (!isSupport) {
        return res.status(403).json({ message: 'Access denied. You can only access cases you support.' });
      }
    }

    req.case = case_;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error in case access control.' });
  }
};

module.exports = { auth, authorize, canAccessClient, canAccessCase };