import { Booking } from '@/backend/bookings/domain/booking.model';
import { Tour } from '@/backend/tours/domain/tour.model';
import { mailTransporter, defaultSender } from './email-transporter';

export async function sendBookingConfirmation(booking: Booking, tour: Tour) {
  try {
    const language = booking.language || 'en';
    const tourTitle = tour.title[language] || tour.title['en'];
    const ticketUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tastingmallorca.com'}/${language}/booking-success?bookingId=${booking.id}`;
    
    // Safely parse Firestore Timestamp
    const bookingDate = (booking.date as any).toDate ? (booking.date as any).toDate() : new Date(booking.date);

    const htmlContent = `
      <div style="font-family: 'Inter', Helvetica, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        
        <!-- Hero Section -->
        <div style="background-color: #0ea5e9; padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Booking Confirmed!</h1>
          <p style="color: #e0f2fe; margin-top: 10px; font-size: 16px;">Thank you for choosing Tasting Mallorca, ${booking.customerName}.</p>
        </div>

        <!-- Image & Title -->
        <div style="padding: 20px;">
          <h2 style="font-size: 22px; color: #0284c7; margin-top: 0;">${tourTitle}</h2>
          ${tour.mainImage ? `<img src="${tour.mainImage}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;" alt="Tour Image" />` : ''}
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;"><strong>Date</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a;">${bookingDate.toLocaleDateString(language)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;"><strong>Meeting Point</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a;">${booking.hotelName || booking.meetingPointName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;"><strong>Participants</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a;">${booking.adults} Adults${booking.children ? `, ${booking.children} Children` : ``}</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 14px; color: #475569; display: flex; justify-content: space-between;">
              <span>Total Price: <strong>€${booking.totalPrice}</strong></span>
              <span>Amount Paid: <strong style="color: #10b981;">€${booking.amountPaid}</strong></span>
            </p>
            ${booking.amountDue > 0 ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #ef4444;text-align: right;"><strong>Amount Due at Meeting: €${booking.amountDue}</strong></p>` : ''}
          </div>

          <div style="text-align: center;">
            <a href="${ticketUrl}" style="background-color: #0ea5e9; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">View Your Digital Ticket</a>
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 25px;">Please show the digital ticket to your guide upon arrival.</p>
        </div>

        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">Tasting Mallorca &copy; ${new Date().getFullYear()}</p>
          <p style="margin: 5px 0 0 0;">For support, reply to this email.</p>
        </div>
      </div>
    `;

    const info = await mailTransporter.sendMail({
      from: defaultSender,
      to: booking.customerEmail,
      subject: `Booking Confirmed: ${tourTitle}`,
      html: htmlContent,
    });

    console.log(`✅ Customer Confirmation Email built and sent to ${booking.customerEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send Customer Confirmation Email:', error);
    return false;
  }
}
