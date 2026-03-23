
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, Map, DollarSign, QrCode, AlertTriangle, Check, X, Info } from 'lucide-react';
import Link from 'next/link';
import { RouteMap } from '@/components/route-map';
import { notFound } from 'next/navigation';
import { getFirestore } from 'firebase-admin/firestore';
import { Booking } from '@/backend/bookings/domain/booking.model';
import { Tour } from '@/backend/tours/domain/tour.model';
import { Hotel } from '@/backend/hotels/domain/hotel.model';
import { MeetingPoint } from '@/backend/meeting-points/domain/meeting-point.model';
import { format } from 'date-fns';
import { es, fr, de, nl } from 'date-fns/locale';
import { Locale as DateFnsLocale } from 'date-fns';
import QRCode from "react-qr-code";
import { adminApp } from '@/firebase/server/config';
import { getDictionary } from '@/dictionaries/get-dictionary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Locale } from '@/dictionaries/config';
import { BookingSuccessTracker } from '@/components/analytics/booking-success-tracker';
import { hashUserData } from '@/lib/hash-utils';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

interface SearchParams {
    booking_id: string;
}

const locales: Record<string, DateFnsLocale> = { es, fr, de, nl };

async function getBookingData(bookingId: string) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1500; // 1.5 seconds

    try {
        adminApp; // Ensure Firebase Admin is initialized
        const db = getFirestore();

        for (let i = 0; i < MAX_RETRIES; i++) {
            const bookingSnapshot = await db.collection('bookings').doc(bookingId).get();

            if (bookingSnapshot.exists) {
                const booking = bookingSnapshot.data() as Booking;

                // If confirmed, we are good to go.
                if (booking.status === 'confirmed') {
                    return getFullBookingDetails(booking);
                }
            }
            // If it's not the last retry, wait before checking again.
            if (i < MAX_RETRIES - 1) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
        }

        // If after all retries it's still not confirmed, or doesn't exist
        console.warn(`Booking ${bookingId} was not found or not confirmed after ${MAX_RETRIES} retries.`);
        return null;

    } catch (error) {
        console.error("Error fetching booking data:", error);
        return null;
    }
}


async function getFullBookingDetails(booking: Booking) {
    const db = getFirestore();
    const tourSnapshot = await db.collection('tours').doc(booking.tourId).get();
    const tour = tourSnapshot.exists ? tourSnapshot.data() as Tour : null;

    let hotel: Hotel | null = null;
    if (booking.hotelId) {
        const hotelSnapshot = await db.collection('hotels').doc(booking.hotelId).get();
        hotel = hotelSnapshot.exists ? hotelSnapshot.data() as Hotel : null;
    }

    let meetingPoint: MeetingPoint | null = null;
    if (booking.meetingPointId) {
        const meetingPointSnapshot = await db.collection('meetingPoints').doc(booking.meetingPointId).get();
        meetingPoint = meetingPointSnapshot.exists ? meetingPointSnapshot.data() as MeetingPoint : null;
    }

    return { booking, tour, hotel, meetingPoint };
}

async function manualVerifyBooking(bookingId: string, paymentIntentId: string): Promise<any | null> {
    try {
        console.log(`🔍 Attempting manual verification for booking ${bookingId} with PI ${paymentIntentId} `);
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            const db = getFirestore();
            const bookingRef = db.collection('bookings').doc(bookingId);
            const bookingSnapshot = await bookingRef.get();

            if (!bookingSnapshot.exists) return null;

            const booking = bookingSnapshot.data() as Booking;

            // Only update if still pending
            if (booking.status === 'pending') {
                const metadata = paymentIntent.metadata;
                // Fallback to booking total price if metadata is missing (should not happen)
                const totalPrice = metadata.totalPrice ? parseFloat(metadata.totalPrice) : booking.totalPrice;
                const amountPaid = paymentIntent.amount / 100;
                const amountDue = totalPrice - amountPaid;

                await bookingRef.update({
                    status: 'confirmed',
                    amountPaid: amountPaid,
                    amountDue: amountDue,
                });

                console.log(`✅ Manually confirmed booking ${bookingId}`);

                // --- EMAIL DISPATCH BLOCK (Fallback) ---
                try {
                  const tourDoc = await db.collection('tours').doc(booking.tourId).get();
                  if (tourDoc.exists) {
                      const tourData = tourDoc.data() as any;
                      const bookingData = { ...booking, status: 'confirmed', amountPaid, amountDue };
                      
                      const { sendBookingConfirmation } = await import('@/backend/emails/sendBookingConfirmation');
                      const { sendAdminNotification } = await import('@/backend/emails/sendAdminNotification');
                      
                      // Fire sequentially or parallel without blocking the UI heavily
                      await Promise.all([
                          sendBookingConfirmation(bookingData as any, tourData),
                          sendAdminNotification(bookingData as any, tourData)
                      ]);
                  }
                } catch (emailErr) {
                  console.error('❌ Non-fatal error during fallback email dispatch:', emailErr);
                }
                // --- END EMAIL DISPATCH ---

                // Return updated data
                return getFullBookingDetails({
                    ...booking,
                    status: 'confirmed',
                    amountPaid,
                    amountDue
                });
            } else {
                return getFullBookingDetails(booking);
            }
        }
        return null;
    } catch (error) {
        console.error("Error verifying payment intent:", error);
        return null;
    }
}


export default async function BookingSuccessPage({ searchParams, params }: { searchParams: Promise<SearchParams & { payment_intent?: string }>, params: Promise<{ lang: Locale }> }) {
    const { booking_id, payment_intent } = await searchParams;
    const { lang } = await params;
    const dictionary = await getDictionary(lang);
    const t = dictionary.bookingSuccess;

    if (!booking_id) {
        return notFound();
    }

    let data = await getBookingData(booking_id);

    // If booking is not found or still pending, and we have a payment_intent, try to verify manually
    if ((!data || data.booking.status === 'pending') && payment_intent) {
        const verifiedData = await manualVerifyBooking(booking_id, payment_intent);
        if (verifiedData) {
            data = verifiedData;
        }
    }

    if (!data || data.booking.status !== 'confirmed') {
        return (
            <div className="bg-background text-foreground min-h-screen flex items-center justify-center py-12">
                <Card className="w-full max-w-md mx-4 text-center">
                    <CardHeader>
                        <CardTitle>{t.errorTitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{t.errorMessage}</p>
                        <Button asChild className="mt-4">
                            <Link href={`/ ${lang} `}>{t.goToHomepage}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { booking, tour, hotel, meetingPoint } = data;
    const locale = locales[lang] || undefined;
    const bookingDate = (booking.date as any).toDate ? (booking.date as any).toDate() : new Date(booking.date);
    const formattedDate = format(bookingDate, "PPP", { locale });

    const tourTitle = tour?.title[lang] || tour?.title.en || 'Tour';
    const isDeposit = booking.paymentType === 'deposit';

    const originCoords = (hotel?.latitude && hotel?.longitude)
        ? { lat: hotel.latitude, lng: hotel.longitude }
        : (booking.customerLatitude && booking.customerLongitude)
            ? { lat: booking.customerLatitude, lng: booking.customerLongitude }
            : null;
    const destinationCoords = (meetingPoint?.latitude && meetingPoint?.longitude) ? { lat: meetingPoint.latitude, lng: meetingPoint.longitude } : null;

    const totalParticipants = booking.adults + booking.children + booking.infants;

    const tourDetails = tour?.details;
    const tDetails = dictionary.tourDetail.tourDetails;
    const notSuitableFor = (tourDetails?.notSuitableFor?.[lang] || tourDetails?.notSuitableFor?.en || '').split('\n').filter(Boolean);
    const whatToBring = (tourDetails?.whatToBring?.[lang] || tourDetails?.whatToBring?.en || '').split('\n').filter(Boolean);
    const beforeYouGo = (tourDetails?.beforeYouGo?.[lang] || tourDetails?.beforeYouGo?.en || '').split('\n').filter(Boolean);

    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading confirmation...</div>}>
            <div className="bg-background text-foreground min-h-screen flex items-center justify-center py-12">
                <div className="container mx-auto px-4 w-full md:w-[70vw] lg:w-[60vw] xl:w-[50vw]">
                    <Card className="shadow-2xl border-primary/20">
                        <CardHeader className="text-center bg-secondary/30 rounded-t-lg pt-8">
                            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                            <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary">
                                {isDeposit ? t.titleDepositConfirmed : t.titleConfirmed}
                            </CardTitle>
                            <p className="text-muted-foreground text-lg mt-2">{t.thankYou}</p>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-6 text-base">
                            <p className="text-center text-muted-foreground">
                                {t.confirmationEmail}
                            </p>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <QrCode className="h-6 w-6" />
                                        {t.yourDigitalTicket}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col md:flex-row items-center justify-center gap-6 p-6">
                                    <div className="bg-white p-4 rounded-lg border">
                                        <QRCode
                                            size={256}
                                            style={{ height: "auto", maxWidth: "100%", width: "160px" }}
                                            value={booking.id}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                    <p className="text-muted-foreground text-center md:text-left max-w-xs">
                                        {t.qrCodeInstruction}
                                    </p>
                                </CardContent>
                            </Card>

                            <div className="border border-border bg-secondary/30 rounded-lg p-4 space-y-3">
                                <h3 className="font-bold text-xl mb-2 text-foreground">{t.adventureSummary}</h3>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t.tour}</span>
                                    <span className="font-semibold text-right">{tourTitle}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t.date}</span>
                                    <span className="font-semibold">{formattedDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t.participants}</span>
                                    <span className="font-semibold">{totalParticipants} ({booking.adults} Adults, {booking.children} Children, {booking.infants} Infants)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t.yourHotel}</span>
                                    <span className="font-semibold text-right">{booking.hotelName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t.meetingPoint}</span>
                                    <span className="font-semibold text-right">
                                        {booking.meetingPointName}
                                        {meetingPoint?.time && <span className="block text-xs text-muted-foreground text-right">{meetingPoint.time}</span>}
                                    </span>
                                </div>
                            </div>

                            <div className="border border-border bg-secondary/30 rounded-lg p-4 space-y-3">
                                <h3 className="font-bold text-xl mb-2 text-foreground flex items-center gap-2">
                                    <DollarSign className="w-6 h-6" />
                                    {t.paymentSummary}
                                </h3>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t.totalPrice}</span>
                                    <span className="font-semibold">€{booking.totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t.amountPaid}</span>
                                    <span className="font-semibold text-green-600">€{booking.amountPaid.toFixed(2)}</span>
                                </div>
                                {isDeposit && (
                                    <>
                                        <div className="flex justify-between text-lg font-bold pt-3 border-t mt-3 text-accent">
                                            <span>{t.amountDue}</span>
                                            <span>€{booking.amountDue.toFixed(2)}</span>
                                        </div>
                                        <Alert variant="default" className="mt-2 text-sm bg-accent/10 border-accent/20 text-accent-foreground">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                                {dictionary.tourDetail.booking.depositReminder}
                                            </AlertDescription>
                                        </Alert>
                                    </>
                                )}
                            </div>

                            {destinationCoords && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-xl flex items-center gap-2">
                                        <Map className="w-6 h-6 text-primary" />
                                        {originCoords ? t.routeToMeetingPoint : t.meetingPoint}
                                    </h3>
                                    <div className="h-96 rounded-lg overflow-hidden border border-border">
                                        <RouteMap
                                            origin={originCoords || undefined}
                                            destination={destinationCoords}
                                        />
                                    </div>
                                </div>
                            )}

                            {(notSuitableFor.length > 0 || whatToBring.length > 0 || beforeYouGo.length > 0) && (
                                <div className="border border-border bg-secondary/30 rounded-lg p-4 space-y-4">
                                    <h3 className="font-bold text-xl mb-2 text-foreground flex items-center gap-2">
                                        <Info className="w-6 h-6" />
                                        {tDetails.importantInfoTitle}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                        <div>
                                            {notSuitableFor.length > 0 && <>
                                                <h4 className="font-semibold mb-2">{tDetails.notSuitableTitle}</h4>
                                                <ul className="space-y-1 text-muted-foreground list-disc pl-5">
                                                    {notSuitableFor.map((item, index) => <li key={index}>{item}</li>)}
                                                </ul>
                                            </>}
                                            {whatToBring.length > 0 && <>
                                                <h4 className="font-semibold mt-4 mb-2">{tDetails.whatToBringTitle}</h4>
                                                <ul className="space-y-1 text-muted-foreground list-disc pl-5">
                                                    {whatToBring.map((item, index) => <li key={index}>{item}</li>)}
                                                </ul>
                                            </>}
                                        </div>
                                        <div>
                                            {beforeYouGo.length > 0 && <>
                                                <h4 className="font-semibold mb-2">{tDetails.beforeYouGoTitle}</h4>
                                                <ul className="space-y-1 text-muted-foreground list-disc pl-5">
                                                    {beforeYouGo.map((item, index) => <li key={index}>{item}</li>)}
                                                </ul>
                                            </>}
                                        </div>
                                    </div>
                                </div>
                            )}


                            <Button asChild size="lg" className="w-full font-bold text-lg mt-6">
                                <Link href={`/${lang} `}>
                                    <Home className="mr-2 h-5 w-5" />
                                    {t.goToMainPage}
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <BookingSuccessTracker
                        transactionId={booking.id}
                        value={booking.totalPrice}
                        currency="EUR"
                        items={[{
                            item_id: tour?.id || 'unknown',
                            item_name: tourTitle,
                            price: tour?.price || 0,
                            quantity: totalParticipants
                        }]}
                        user_data={{
                            email_hashed: hashUserData(booking.customerEmail),
                            phone_hashed: hashUserData(booking.customerPhone),
                            email_plain: booking.customerEmail,
                            phone_plain: booking.customerPhone
                        }}
                        lang={lang}
                    />
                </div>
            </div>
        </Suspense>
    );
}
