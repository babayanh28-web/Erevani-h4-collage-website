const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const applicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters'],
        set: (value) => value.trim()
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^\+?[0-9\s\-\(\)]{8,20}$/, 'Please enter a valid phone number']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    specialty: {
        type: String,
        required: [true, 'Specialty is required'],
        enum: ['Փայտամշակում', 'Ոսկերչություն', 'Հրուշակագործություն', 'Դիզայն', 'Շինարարություն', 'Խոհարարական', 'Ավտոմեխանիկ', 'Վարսահարդարում']
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'accepted', 'rejected'],
        default: 'pending'
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        maxlength: 500
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Index for faster queries
applicationSchema.index({ email: 1, createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ phone: 1 });

// Prevent duplicate applications (same email within 24 hours)
applicationSchema.statics.checkDuplicate = async function(email, ipAddress) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await this.findOne({
        $or: [
            { email: email.toLowerCase() },
            { ipAddress: ipAddress }
        ],
        createdAt: { $gte: twentyFourHoursAgo }
    });
    return existing;
};

// Virtual for formatted date
applicationSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString('hy-AM');
});

// Encrypt sensitive data before saving
applicationSchema.pre('save', function(next) {
    if (this.isModified('email')) {
        this.email = this.email.toLowerCase();
    }
    if (this.isModified('phone')) {
        // Store phone in consistent format
        this.phone = this.phone.replace(/\s/g, '');
    }
    next();
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;