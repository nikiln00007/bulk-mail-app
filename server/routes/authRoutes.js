import express from 'express';
import { registerAdmin, loginAdmin, googleAuth, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);

export default router;
