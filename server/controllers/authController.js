import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import connectDB from '../config/db.js';
import { isValidEmail } from '../utils/validateEmails.js';

// In-memory fallback storage for when MongoDB is not running locally
export const memoryAdmins = [
  {
    _id: '66f5a1b2c3d4e5f678901234',
    name: 'Administrator',
    email: 'admin@bulkmailpro.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    createdAt: new Date(),
  },
];

// Helper to sign JWT
const generateToken = (id) => {
  return jwt.sign(
    { id: String(id) },
    process.env.JWT_SECRET || 'bulkmailpro_super_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

/**
 * @desc    Register a new admin
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ message: 'Invalid email address format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    await connectDB();

    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      const adminExists = await Admin.findOne({ email: cleanEmail });
      if (adminExists) {
        return res.status(400).json({ message: 'Admin with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const admin = await Admin.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
      });

      return res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id),
        message: 'Admin account created successfully',
      });
    }

    // In-memory fallback
    const existing = memoryAdmins.find((a) => a.email === cleanEmail);
    if (existing) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newAdmin = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      createdAt: new Date(),
    };
    memoryAdmins.push(newAdmin);

    return res.status(201).json({
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      token: generateToken(newAdmin._id),
      message: 'Admin account created successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

/**
 * @desc    Authenticate admin & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Attempt to ensure database connection is established
    try {
      await connectDB();
    } catch (e) {
      // Ignore, will use in-memory fallback
    }

    // If MongoDB is connected, query DB
    if (mongoose.connection.readyState === 1) {
      let admin = await Admin.findOne({ email: cleanEmail });

      // Auto-seed default admin if default credentials are used and not yet in database
      if (!admin && cleanEmail === 'admin@bulkmailpro.com' && password === 'admin123') {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        admin = await Admin.create({
          name: 'Administrator',
          email: 'admin@bulkmailpro.com',
          password: hashedPassword,
        });
        console.log('Auto-seeded default admin during login');
      }

      if (!admin) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      return res.status(200).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id),
        message: 'Login successful',
      });
    }

    // In-memory fallback
    let memAdmin = memoryAdmins.find((a) => a.email.toLowerCase() === cleanEmail);

    // Auto-seed in-memory if needed
    if (!memAdmin && cleanEmail === 'admin@bulkmailpro.com' && password === 'admin123') {
      memAdmin = {
        _id: '66f5a1b2c3d4e5f678901234',
        name: 'Administrator',
        email: 'admin@bulkmailpro.com',
        passwordHash: bcrypt.hashSync('admin123', 10),
        createdAt: new Date(),
      };
      memoryAdmins.push(memAdmin);
    }

    if (!memAdmin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, memAdmin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({
      _id: memAdmin._id,
      name: memAdmin.name,
      email: memAdmin.email,
      token: generateToken(memAdmin._id),
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

/**
 * @desc    Authenticate with Google OAuth ID Token
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential token is required' });
    }

    // Verify token with Google's official API
    let payload;
    try {
      const gResponse = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      payload = await gResponse.json();

      if (!gResponse.ok || payload.error || payload.error_description) {
        const errMsg = payload.error_description || payload.error || 'Invalid Google token';
        console.error('Google token verification error:', payload);
        // Common cause: domain not in authorized JavaScript origins in Google Cloud Console
        return res.status(401).json({
          message: `Google Sign-In failed: ${errMsg}. If you are the developer, please add your domain to Authorized JavaScript Origins in Google Cloud Console.`,
        });
      }

      // Verify the token audience matches our client ID
      const expectedClientId = process.env.GOOGLE_CLIENT_ID;
      if (expectedClientId && payload.aud !== expectedClientId) {
        console.error('Google token audience mismatch:', payload.aud, 'expected:', expectedClientId);
        return res.status(401).json({
          message: 'Google token audience mismatch. Check your GOOGLE_CLIENT_ID configuration.',
        });
      }
    } catch (fetchErr) {
      console.error('Failed to reach Google token verification endpoint:', fetchErr);
      return res.status(502).json({ message: 'Unable to contact Google authentication service. Please try email login instead.' });
    }

    const { email, name, picture, sub } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google account does not provide an email address' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Ensure database connection
    try {
      await connectDB();
    } catch (e) {
      // Ignore, will use in-memory fallback
    }

    if (mongoose.connection.readyState === 1) {
      let admin = await Admin.findOne({ email: cleanEmail });

      if (!admin) {
        // Register new admin via Google
        admin = await Admin.create({
          name: name || 'Google User',
          email: cleanEmail,
          avatar: picture || '',
          googleId: sub,
          authProvider: 'google',
        });
        console.log(`New admin registered via Google: ${cleanEmail}`);
      } else {
        // Update avatar/googleId if missing
        let updated = false;
        if (!admin.googleId && sub) {
          admin.googleId = sub;
          updated = true;
        }
        if (picture && admin.avatar !== picture) {
          admin.avatar = picture;
          updated = true;
        }
        if (updated) await admin.save();
      }

      return res.status(200).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar,
        token: generateToken(admin._id),
        message: 'Google login successful',
      });
    }

    // In-memory fallback
    let memAdmin = memoryAdmins.find((a) => a.email.toLowerCase() === cleanEmail);
    if (!memAdmin) {
      memAdmin = {
        _id: new mongoose.Types.ObjectId().toString(),
        name: name || 'Google User',
        email: cleanEmail,
        avatar: picture || '',
        googleId: sub,
        authProvider: 'google',
        createdAt: new Date(),
      };
      memoryAdmins.push(memAdmin);
    }

    return res.status(200).json({
      _id: memAdmin._id,
      name: memAdmin.name,
      email: memAdmin.email,
      avatar: memAdmin.avatar,
      token: generateToken(memAdmin._id),
      message: 'Google login successful',
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).json({
      message: 'Server error during Google authentication',
      error: error.message,
    });
  }
};

/**
 * @desc    Get logged in admin info
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.status(200).json({
      _id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      createdAt: req.admin.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};
