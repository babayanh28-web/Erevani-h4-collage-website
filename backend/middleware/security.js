const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');

// Security middleware configuration
const securityMiddleware = (app) => {
    // Set security headers with Helmet
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "https://unpkg.com"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
                imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.googleapis.com"],
                connectSrc: ["'self'"],
                frameSrc: ["'self'", "https://www.google.com"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                childSrc: ["'self'"],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    }));
    
    // Enable CORS with specific options
    app.use(cors({
        origin: process.env.NODE_ENV === 'production' 
            ? ['https://yourdomain.com', 'https://www.yourdomain.com']
            : '*',
        credentials: true,
        optionsSuccessStatus: 200
    }));
    
    // Data sanitization against NoSQL injection
    app.use(mongoSanitize());
    
    // Data sanitization against XSS
    app.use(xss());
    
    // Compression
    app.use(compression());
    
    // Prevent parameter pollution
    app.use((req, res, next) => {
        if (req.query && Object.keys(req.query).length > 50) {
            return res.status(400).json({ error: 'Too many query parameters' });
        }
        next();
    });
    
    // Add security headers
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        next();
    });
    
    // Rate limiting for API
    const { apiLimiter } = require('./rateLimit');
    app.use('/api/', apiLimiter);
};

module.exports = securityMiddleware;