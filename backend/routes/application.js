const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { validateApplication } = require('../middleware/validation');
const { applicationLimiter } = require('../middleware/rateLimit');
const emailService = require('../utils/emailService');
const logger = require('../utils/logger');

// Submit new application
router.post('/submit', applicationLimiter, validateApplication, async (req, res) => {
    try {
        const { name, phone, email, specialty } = req.body;
        
        // Check for duplicate applications
        const ipAddress = req.ip || req.connection.remoteAddress;
        const duplicate = await Application.checkDuplicate(email, ipAddress);
        
        if (duplicate) {
            logger.warn(`Duplicate application attempt from ${email} (${ipAddress})`);
            return res.status(429).json({ 
                error: 'Դուք արդեն դիմել եք վերջին 24 ժամվա ընթացքում' 
            });
        }
        
        // Create new application
        const application = new Application({
            name,
            phone,
            email,
            specialty,
            ipAddress,
            userAgent: req.headers['user-agent']
        });
        
        await application.save();
        
        logger.info(`New application submitted: ${application._id} from ${email}`);
        
        // Send confirmation emails
        await Promise.all([
            emailService.sendApplicationConfirmation(application),
            emailService.sendAdminNotification(application)
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Ձեր դիմումը հաջողությամբ ուղարկվել է',
            applicationId: application._id
        });
        
    } catch (error) {
        logger.error('Application submission error:', error);
        res.status(500).json({ 
            error: 'Սերվերի սխալ, խնդրում ենք փորձել կրկին' 
        });
    }
});

// Get application status (public)
router.get('/status/:id', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .select('name status specialty createdAt');
        
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        
        res.json(application);
    } catch (error) {
        logger.error('Status check error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;