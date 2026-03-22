'use server';

import { createSafeAction } from '@/app/server-actions/lib/safe-action';
import { adminApp } from '@/firebase/server/config';
import { getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';

const testEmailSchema = z.object({});

export const sendTestEmail = createSafeAction(
  {
    inputSchema: testEmailSchema,
  },
  async (): Promise<{ data?: { success: boolean; message: string }; error?: string }> => {
    try {
      // Ensure the admin SDK is initialized
      adminApp;
      const db = getFirestore();

      // Recipient addresses requested by Admin
      const recipients = ['caangogi@gmail.com'];
      /*   const recipients = ['tastingmallorca2025@gmail.com', 'excursion.surprise@hotmail.com']; */

      // Send via trigger extension by writing to 'mail' collection
      await db.collection('mail').add({
        to: recipients,
        message: {
          subject: '[System Diagnostics] Testing Malllorca Firebase Email Delivery',
          text: 'This is an automated test email to verify that the domain DNS and Firebase Extension configs are working perfectly.',
          html: '<h2 style="color:#0ea5e9;">Firebase Trigger Email Test</h2><p>This is an automated diagnostic email to ensure emails are correctly routed to Admins when bookings and events occur.</p>',
        },
      });

      return {
        data: {
          success: true,
          message: 'Test email successfully queued in Firestore. Check the aforementioned inboxes.',
        },
      };
    } catch (error: any) {
      console.error('Error dispatching test email document:', error);
      return { error: error.message || 'An unexpected error occurred.' };
    }
  }
);
