const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Application = require('../models/Application');
const { authMiddleware, adminMiddleware, moderatorMiddleware } = require('../middleware/auth');
const { validateLogin } = require('../middleware/validation');
const { loginLimiter } = require('../middleware/rateLimit');
const logger = require('../utils/logger');

// Admin login
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });
        
        if (!user || !user.isActive) {
            logger.warn(`Failed login attempt for username: ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Check if account is locked
        if (user.isLocked()) {
            return res.status(401).json({ 
                error: 'Account is locked. Please try again later.' 
            });
        }
        
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            await user.incLoginAttempts();
            logger.warn(`Failed password attempt for user: ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Reset login attempts on successful login
        await user.updateOne({
            $set: { loginAttempts: 0 },
            $unset: { lockUntil: 1 }
        });
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        logger.info(`User logged in: ${username}`);
        
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all applications (with filters)
router.get('/applications', authMiddleware, moderatorMiddleware, async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;
        
        const query = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        const applications = await Application.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('reviewedBy', 'username');
        
        const total = await Application.countDocuments(query);
        
        res.json({
            applications,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
        
    } catch (error) {
        logger.error('Get applications error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update application status
router.put('/applications/:id', authMiddleware, moderatorMiddleware, async (req, res) => {
    try {
        const { status, notes } = req.body;
        
        const application = await Application.findById(req.params.id);
        
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        
        application.status = status || application.status;
        if (notes) application.notes = notes;
        application.reviewedBy = req.user._id;
        application.reviewedAt = new Date();
        
        await application.save();
        
        logger.info(`Application ${application._id} updated by ${req.user.username}`);
        
        res.json({
            success: true,
            message: 'Application updated successfully',
            application
        });
        
    } catch (error) {
        logger.error('Update application error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get statistics
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const totalApplications = await Application.countDocuments();
        const pendingApplications = await Application.countDocuments({ status: 'pending' });
        const acceptedApplications = await Application.countDocuments({ status: 'accepted' });
        
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weeklyApplications = await Application.countDocuments({
            createdAt: { $gte: lastWeek }
        });
        
        const applicationsBySpecialty = await Application.aggregate([
            { $group: { _id: '$specialty', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        res.json({
            total: totalApplications,
            pending: pendingApplications,
            accepted: acceptedApplications,
            weekly: weeklyApplications,
            bySpecialty: applicationsBySpecialty
        });
        
    } catch (error) {
        logger.error('Stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;