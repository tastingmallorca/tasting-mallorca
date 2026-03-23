import nodemailer from 'nodemailer';

/**
 * Singleton Nodemailer Transporter connected to Hostinger SMTP.
 * Relies on environment variables established in the Testing phase.
 */
export const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const defaultSender = `"Tasting Mallorca" <${process.env.SMTP_USER}>`;
