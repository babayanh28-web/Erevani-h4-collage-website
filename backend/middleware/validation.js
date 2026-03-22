const { body, validationResult } = require('express-validator');

// Validation rules for application
const validateApplication = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
        .matches(/^[\u0531-\u056F\u0561-\u056F\s\-]+$/).withMessage('Name can only contain Armenian letters, spaces, and hyphens'),
    
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[\+]?[0-9\s\-\(\)]{8,20}$/).withMessage('Please enter a valid phone number'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    
    body('specialty')
        .notEmpty().withMessage('Specialty is required')
        .isIn(['Փայտամշակում', 'Ոսկերչություն', 'Հրուշակագործություն', 'Դիզայն', 'Շինարարություն', 'Խոհարարական', 'Ավտոմեխանիկ', 'Վարսահարդարում'])
        .withMessage('Invalid specialty selected'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation for login
const validateLogin = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required'),
    
    body('password')
        .notEmpty().withMessage('Password is required'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateApplication, validateLogin };