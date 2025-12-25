import User from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isValidEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        // Debug (redact password)
        console.log('🧾 /api/auth/register body:', {
            name,
            email,
            password: password ? '[REDACTED]' : undefined
        });

        if (!isNonEmptyString(name)) {
            return res.status(400).json({ message: 'Name is required' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Valid email is required' });
        }

        if (!isNonEmptyString(password) || password.trim().length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user exists
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: password.trim()
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(500).json({ message: 'Failed to create user' });
        }
    } catch (error) {
        // Handle duplicate key error (race condition)
        if (error?.code === 11000) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Mongoose validation errors
        if (error?.name === 'ValidationError') {
            const messages = Object.values(error.errors || {})
                .map((e) => e?.message)
                .filter(Boolean);
            return res.status(400).json({ message: messages.join(', ') || 'Invalid input' });
        }

        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePhoto: user.profilePhoto,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Google OAuth login
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
    try {
        const { email, name, googleId, profilePhoto } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // Update Google ID if not set
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // Create new user
            user = await User.create({
                name,
                email,
                googleId,
                profilePhoto
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePhoto: user.profilePhoto,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
