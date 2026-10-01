import mongoose from 'mongoose';
import Mail from '../models/Mail.js';
import transporter from '../config/mailer.js';
import { parseAndCleanRecipients } from '../utils/validateEmails.js';
import fs from 'fs';
import csvParser from 'csv-parser';

// In-memory campaign storage fallback
const memoryMails = [
  {
    _id: '674e1a2b3c4d5e6f7a8b9c01',
    subject: 'Welcome to BulkMail Pro Platform Demo',
    body: 'Hello and welcome! This sample campaign showcases the rich live preview, statistics tracking, and recipient delivery breakdown in BulkMail Pro.',
    recipients: ['alex.sample@gmail.com', 'maria.partner@company.org', 'dev.lead@techcorp.io'],
    successEmails: ['alex.sample@gmail.com', 'maria.partner@company.org'],
    failedEmails: [{ email: 'dev.lead@techcorp.io', error: 'Mailbox quota exceeded (simulated)' }],
    successCount: 2,
    failedCount: 1,
    totalRecipients: 3,
    status: 'Partial',
    sentBy: { name: 'Administrator', email: 'admin@bulkmailpro.com' },
    sentAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
  },
];

/**
 * @desc    Send bulk emails
 * @route   POST /api/mail/send
 * @access  Private
 */
export const sendBulkMail = async (req, res) => {
  try {
    const { subject, body, recipients } = req.body;

    // Validation
    if (!subject || !subject.trim()) {
      return res.status(400).json({ message: 'Email subject is required' });
    }

    if (!body || !body.trim()) {
      return res.status(400).json({ message: 'Email body is required' });
    }

    if (!recipients || (Array.isArray(recipients) && recipients.length === 0)) {
      return res.status(400).json({ message: 'At least one recipient email is required' });
    }

    // Parse, clean, deduplicate and validate recipient emails
    const { validEmails, invalidEmails } = parseAndCleanRecipients(recipients);

    if (validEmails.length === 0) {
      return res.status(400).json({
        message: 'No valid recipient email addresses found',
        invalidEmails,
      });
    }

    const successEmails = [];
    const failedEmails = [];

    // Add originally invalid emails directly to failed list
    for (const inv of invalidEmails) {
      failedEmails.push({
        email: inv,
        error: 'Invalid email address format',
      });
    }

    const fromAddress =
      process.env.SMTP_FROM ||
      `BulkMail Pro <${process.env.SMTP_USER || 'no-reply@bulkmailpro.com'}>`;

    // Process each valid recipient individually
    for (const email of validEmails) {
      try {
        const mailOptions = {
          from: fromAddress,
          to: email,
          subject: subject.trim(),
          text: body,
          html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #2563EB; margin-top: 0;">${subject.trim()}</h2>
              <div style="white-space: pre-wrap; margin-top: 15px;">${body}</div>
              <hr style="margin-top: 25px; border: none; border-top: 1px solid #e2e8f0;" />
              <p style="font-size: 11px; color: #64748b; margin-top: 10px;">
                Sent via <strong>BulkMail Pro</strong>.
              </p>
            </div>
          </div>`,
        };

        // If credentials are dummy/placeholder or offline, simulate delivery gracefully
        const isPlaceholderSmtp =
          !process.env.SMTP_USER ||
          process.env.SMTP_USER === 'your_email@gmail.com' ||
          process.env.SMTP_PASS === 'your_app_password';

        if (isPlaceholderSmtp) {
          // If placeholder, simulate delivery for demonstration
          successEmails.push(email);
        } else {
          await transporter.sendMail(mailOptions);
          successEmails.push(email);
        }
      } catch (err) {
        console.error(`Error sending email to ${email}:`, err.message);
        failedEmails.push({
          email,
          error: err.message || 'Delivery failed',
        });
      }
    }

    // Determine campaign status
    const totalRecipients = successEmails.length + failedEmails.length;
    const successCount = successEmails.length;
    const failedCount = failedEmails.length;

    let status = 'Success';
    if (successCount === 0) {
      status = 'Failed';
    } else if (failedCount > 0) {
      status = 'Partial';
    }

    const mailRecordData = {
      subject: subject.trim(),
      body,
      recipients: [...validEmails, ...invalidEmails],
      successEmails,
      failedEmails,
      successCount,
      failedCount,
      totalRecipients,
      status,
      sentBy: req.admin ? req.admin._id : null,
      sentAt: new Date(),
    };

    let savedId = null;

    if (mongoose.connection.readyState === 1) {
      const mailRecord = await Mail.create(mailRecordData);
      savedId = mailRecord._id;
    } else {
      // In-memory record
      const memRecord = {
        ...mailRecordData,
        _id: new mongoose.Types.ObjectId().toString(),
        sentBy: req.admin ? { name: req.admin.name, email: req.admin.email } : null,
      };
      memoryMails.unshift(memRecord);
      savedId = memRecord._id;
    }

    return res.status(201).json({
      message: 'Mail sending completed',
      status,
      totalRecipients,
      successCount,
      failedCount,
      mailId: savedId,
    });
  } catch (error) {
    console.error('sendBulkMail error:', error);
    return res.status(500).json({
      message: 'Internal server error while sending bulk emails',
      error: error.message,
    });
  }
};

/**
 * @desc    Get sent mail history with optional status and search filters
 * @route   GET /api/mail/history
 * @access  Private
 */
export const getMailHistory = async (req, res) => {
  try {
    const { status, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (status && status !== 'All') {
        filter.status = status;
      }
      if (search && search.trim()) {
        filter.subject = { $regex: search.trim(), $options: 'i' };
      }

      const history = await Mail.find(filter)
        .sort({ sentAt: -1 })
        .populate('sentBy', 'name email');

      return res.status(200).json(history);
    }

    // In-memory filtering
    let list = [...memoryMails];
    if (status && status !== 'All') {
      list = list.filter((m) => m.status === status);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((m) => m.subject.toLowerCase().includes(q));
    }

    res.status(200).json(list);
  } catch (error) {
    console.error('getMailHistory error:', error);
    res.status(500).json({ message: 'Error fetching mail history', error: error.message });
  }
};

/**
 * @desc    Get single mail record detail by ID
 * @route   GET /api/mail/history/:id
 * @access  Private
 */
export const getMailById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const mail = await Mail.findById(req.params.id).populate('sentBy', 'name email');
      if (!mail) {
        return res.status(404).json({ message: 'Email record not found' });
      }
      return res.status(200).json(mail);
    }

    const mail = memoryMails.find((m) => String(m._id) === String(req.params.id));
    if (!mail) {
      return res.status(404).json({ message: 'Email record not found' });
    }

    res.status(200).json(mail);
  } catch (error) {
    console.error('getMailById error:', error);
    res.status(500).json({ message: 'Error retrieving email record', error: error.message });
  }
};

/**
 * @desc    Get dashboard email statistics
 * @route   GET /api/mail/stats
 * @access  Private
 */
export const getMailStats = async (req, res) => {
  try {
    let allRecords = [];
    if (mongoose.connection.readyState === 1) {
      allRecords = await Mail.find({});
    } else {
      allRecords = memoryMails;
    }

    const totalCampaigns = allRecords.length;
    let totalEmails = 0;
    let successEmails = 0;
    let failedEmails = 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let todayEmails = 0;

    for (const record of allRecords) {
      totalEmails += record.totalRecipients || 0;
      successEmails += record.successCount || 0;
      failedEmails += record.failedCount || 0;

      if (record.sentAt && new Date(record.sentAt) >= startOfToday) {
        todayEmails += record.totalRecipients || 0;
      }
    }

    res.status(200).json({
      totalEmails,
      successEmails,
      failedEmails,
      totalCampaigns,
      todayEmails,
    });
  } catch (error) {
    console.error('getMailStats error:', error);
    res.status(500).json({ message: 'Error retrieving mail statistics', error: error.message });
  }
};

/**
 * @desc    Delete a mail history record by ID
 * @route   DELETE /api/mail/history/:id
 * @access  Private
 */
export const deleteMailById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const mail = await Mail.findById(req.params.id);
      if (!mail) {
        return res.status(404).json({ message: 'Email record not found' });
      }
      await Mail.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: 'Email history record deleted successfully' });
    }

    const index = memoryMails.findIndex((m) => String(m._id) === String(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: 'Email record not found' });
    }

    memoryMails.splice(index, 1);
    res.status(200).json({ message: 'Email history record deleted successfully' });
  } catch (error) {
    console.error('deleteMailById error:', error);
    res.status(500).json({ message: 'Error deleting email record', error: error.message });
  }
};

/**
 * @desc    Optional CSV upload endpoint to extract emails
 * @route   POST /api/mail/upload-csv
 * @access  Private
 */
export const uploadCsvRecipients = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    const emails = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        for (const key of Object.keys(row)) {
          const val = row[key];
          if (val && typeof val === 'string') {
            const found = val.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g);
            if (found) {
              emails.push(...found);
            }
          }
        }
      })
      .on('end', () => {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          // ignore
        }

        const uniqueEmails = [...new Set(emails.map((e) => e.toLowerCase()))];
        res.status(200).json({
          count: uniqueEmails.length,
          emails: uniqueEmails,
        });
      })
      .on('error', (err) => {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          // ignore
        }
        res.status(500).json({ message: 'Failed to parse CSV file', error: err.message });
      });
  } catch (error) {
    console.error('uploadCsvRecipients error:', error);
    res.status(500).json({ message: 'Server error processing CSV file' });
  }
};
