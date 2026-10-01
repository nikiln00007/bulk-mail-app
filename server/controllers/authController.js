import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
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

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email address format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      const adminExists = await Admin.findOne({ email: email.toLowerCase() });
      if (adminExists) {
        return res.status(400).json({ message: 'Admin with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const admin = await Admin.create({
        name,
        email: email.toLowerCase(),
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
    const existing = memoryAdmins.find((a) => a.email === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newAdmin = {
      _id: new mongoose.Types.ObjectId().toString(),
      name,
      email: email.toLowerCase(),
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

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // If MongoDB is connected, query DB
    if (mongoose.connection.readyState === 1) {
      const admin = await Admin.findOne({ email: email.toLowerCase() });
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
    const memAdmin = memoryAdmins.find((a) => a.email === email.toLowerCase());
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
