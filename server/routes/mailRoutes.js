import express from 'express';
import multer from 'multer';
import os from 'os';
import {
  sendBulkMail,
  getMailHistory,
  getMailById,
  getMailStats,
  deleteMailById,
  uploadCsvRecipients,
} from '../controllers/mailController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer storage for temporary CSV processing
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv files are supported'), false);
    }
  },
});

// Mail API Endpoints (All protected)
router.post('/send', protect, sendBulkMail);
router.get('/history', protect, getMailHistory);
router.get('/history/:id', protect, getMailById);
router.get('/stats', protect, getMailStats);
router.delete('/history/:id', protect, deleteMailById);
router.post('/upload-csv', protect, upload.single('file'), uploadCsvRecipients);

export default router;
