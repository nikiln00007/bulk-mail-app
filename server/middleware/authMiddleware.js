import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import { memoryAdmins } from '../controllers/authController.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'bulkmailpro_super_secret_jwt_key_2026'
      );

      // Check database if connected
      if (mongoose.connection.readyState === 1) {
        const admin = await Admin.findById(decoded.id).select('-password');
        if (admin) {
          req.admin = admin;
          return next();
        }
      }

      // Check memory store fallback
      const memAdmin = memoryAdmins.find((a) => String(a._id) === String(decoded.id));
      if (memAdmin) {
        req.admin = {
          _id: memAdmin._id,
          name: memAdmin.name,
          email: memAdmin.email,
          createdAt: memAdmin.createdAt,
        };
        return next();
      }

      return res.status(401).json({ message: 'User no longer exists or unauthorized' });
    } catch (error) {
      console.error('Auth token verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export default protect;
