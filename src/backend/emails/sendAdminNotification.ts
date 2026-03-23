import { Booking } from '@/backend/bookings/domain/booking.model';
import { Tour } from '@/backend/tours/domain/tour.model';
import { mailTransporter, defaultSender } from './email-transporter';

export async function sendAdminNotification(booking: Booking, tour: Tour) {
  try {
    const tourTitle = tour.title['en'] || tour.title[booking.language || 'en'];
    
    // Safely parse Firestore Timestamp or standard Date string
    const bookingDate = (booking.date as any).toDate ? (booking.date as any).toDate() : new Date(booking.date);

    const htmlContent = `
      <div style="font-family: 'Inter', Helvetica, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #f8fafc; padding: 20px;">
        
        <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-top:0;">New Booking Received</h2>
        
        <p style="font-size: 15px;">A new payment was securely verified on Stripe and confirmed in the database.</p>

        <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #0284c7;">Tour Details</h3>
          <ul style="list-style: none; padding-left: 0; margin-bottom: 0;">
            <li style="margin-bottom: 8px;"><strong>Tour:</strong> ${tourTitle}</li>
            <li style="margin-bottom: 8px;"><strong>Date:</strong> ${bookingDate.toLocaleDateString()}</li>
            <li style="margin-bottom: 8px;"><strong>Meeting/Hotel:</strong> ${booking.hotelName || booking.meetingPointName}</li>
            <li><strong>Language:</strong> ${booking.language.toUpperCase()}</li>
          </ul>
        </div>

        <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #475569;">Customer Details</h3>
          <ul style="list-style: none; padding-left: 0; margin-bottom: 0;">
            <li style="margin-bottom: 8px;"><strong>Name:</strong> ${booking.customerName}</li>
            <li style="margin-bottom: 8px;"><strong>Email:</strong> <a href="mailto:${booking.customerEmail}">${booking.customerEmail}</a></li>
            <li style="margin-bottom: 8px;"><strong>Phone:</strong> ${booking.customerPhone}</li>
            <li style="color:#ef4444;"><strong>Participants:</strong> ${booking.adults} Adults, ${booking.children} Children, ${booking.infants} Infants</li>
          </ul>
        </div>

        <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; color: #10b981;">Financials</h3>
          <ul style="list-style: none; padding-left: 0; margin-bottom: 0;">
            <li style="margin-bottom: 8px;"><strong>Total Price:</strong> €${booking.totalPrice}</li>
            <li style="margin-bottom: 8px; color: #10b981;"><strong>Amount Paid on Website:</strong> €${booking.amountPaid}</li>
            <li style="color: #ef4444;"><strong>Amount Due (Cash at Bus):</strong> €${booking.amountDue}</li>
          </ul>
        </div>
        
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;">Checkout Session ID ID: ${booking.id}</p>
      </div>
    `;

    // Dispatch to designated Admin emails
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['tastingmallorca2025@gmail.com', 'excursion.surprise@hotmail.com'];

    const info = await mailTransporter.sendMail({
      from: defaultSender,
      to: adminEmails,
      subject: `🚨 New Booking: ${booking.customerName} - ${tourTitle}`,
      html: htmlContent,
    });

    console.log(`✅ Admin Notification Email sent to ${adminEmails.join(', ')}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send Admin Notification Email:', error);
    return false;
  }
}
