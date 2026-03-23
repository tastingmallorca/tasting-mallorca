'use server';

import { createSafeAction } from '@/app/server-actions/lib/safe-action';
import { z } from 'zod';
import nodemailer from 'nodemailer';

const testEmailSchema = z.object({});

export const sendTestEmail = createSafeAction(
  {
    inputSchema: testEmailSchema,
  },
  async (): Promise<{ data?: { success: boolean; message: string }; error?: string }> => {
    try {
      // Initialize Nodemailer Transport using Hostinger settings
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: true, // true for 465, false for 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      // Target emails (Testing string as requested)
      const recipients = 'caangogi@gmail.com';
      /* const recipients = 'tastingmallorca2025@gmail.com, excursion.surprise@hotmail.com'; */

      // Dispatch the email
      const info = await transporter.sendMail({
        from: `"Tasting Mallorca" <${process.env.SMTP_USER}>`,
        to: recipients,
        subject: '[System Diagnostics] Testing Mallorca Native Email Delivery',
        text: 'This is an automated test email dispatched directly via Vercel (Next.js NodeMailer) using your Hostinger SMTP server.',
        html: '<h2 style="color:#0ea5e9;">Server Action Email Test</h2><p>This automated email confirms that your native Nodemailer integration successfully routed an SMTP request from Next.js straight to the Admins.</p>',
      });

      console.log('Message sent: %s', info.messageId);

      return {
        data: {
          success: true,
          message: 'Test email successfully dispatched via Hostinger SMTP. Check your inbox.',
        },
      };
    } catch (error: any) {
      console.error('Error dispatching test email:', error);
      return { error: error.message || 'An unexpected error occurred.' };
    }
  }
);
