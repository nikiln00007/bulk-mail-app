import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Creates and configures the Nodemailer transporter using SMTP environment variables.
 */
export const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // If user has not configured real SMTP credentials yet, log a helpful note
  if (!user || user === 'your_email@gmail.com' || !pass || pass === 'your_app_password') {
    console.warn(
      '[SMTP NOTICE] SMTP credentials are not configured or still have placeholder values in server/.env.\n' +
      'To send real emails, update SMTP_USER and SMTP_PASS with your Gmail App Password or SMTP provider.'
    );
  }

  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465, // true for 465, false for 587 or other ports
    auth: {
      user: user,
      pass: pass,
    },
    // Optional TLS configuration for self-signed or development servers
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporter;
};

const transporter = createTransporter();

export default transporter;
