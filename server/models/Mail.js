import mongoose from 'mongoose';

const failedEmailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    error: {
      type: String,
      default: 'Failed to deliver',
    },
  },
  { _id: false }
);

const mailSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  body: {
    type: String,
    required: [true, 'Email body is required'],
  },
  recipients: {
    type: [String],
    default: [],
  },
  successEmails: {
    type: [String],
    default: [],
  },
  failedEmails: {
    type: [failedEmailSchema],
    default: [],
  },
  successCount: {
    type: Number,
    default: 0,
  },
  failedCount: {
    type: Number,
    default: 0,
  },
  totalRecipients: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Success', 'Failed', 'Partial'],
    default: 'Success',
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for search & sort
mailSchema.index({ sentAt: -1 });
mailSchema.index({ subject: 'text' });

const Mail = mongoose.models.Mail || mongoose.model('Mail', mailSchema);

export default Mail;
