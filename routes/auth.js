const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('userType').optional().isIn(['attorney', 'staff', 'client']).withMessage('Invalid user type')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, userType } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({ name, email, password, userType });
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        // Determine redirect URL based on user type
        let redirectUrl = '/';
        switch (user.userType) {
            case 'attorney':
                redirectUrl = '/attorney-dashboard';
                break;
            case 'staff':
                redirectUrl = '/staff-dashboard';
                break;
            case 'client':
                redirectUrl = '/client-dashboard';
                break;
        }

        res.status(201).json({
            token,
            redirectUrl,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').exists().withMessage('Password is required'),
    body('userType').optional().isIn(['attorney', 'staff', 'client']).withMessage('Invalid user type')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, userType } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if userType matches (if provided)
        if (userType && user.userType !== userType) {
            return res.status(400).json({ message: 'Invalid user type for this account' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(400).json({ message: 'Account is deactivated' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        // Determine redirect URL based on user type
        let redirectUrl = '/';
        switch (user.userType) {
            case 'attorney':
                redirectUrl = '/attorney-dashboard';
                break;
            case 'staff':
                redirectUrl = '/staff-dashboard';
                break;
            case 'client':
                redirectUrl = '/client-dashboard';
                break;
        }

        res.json({
            token,
            redirectUrl,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                userType: req.user.userType,
                avatar: req.user.avatar
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;