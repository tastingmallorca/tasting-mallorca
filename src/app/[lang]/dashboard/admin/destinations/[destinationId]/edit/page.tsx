import { AdminRouteGuard } from "@/components/auth/admin-route-guard";
import { DestinationForm } from "@/components/destinations/destination-form";
import { findDestinationById } from "@/app/server-actions/destinations/findDestinations";
import { notFound } from "next/navigation";
import { Destination } from "@/backend/destinations/domain/destination.model";

export default async function EditDestinationPage({ params }: { params: Promise<{ lang: string, destinationId: string }> }) {
    const { lang, destinationId } = await params;
    const result = await findDestinationById(destinationId);

    if (!result.data || result.error) {
        notFound();
    }

    return (
        <AdminRouteGuard>
            <div className="max-w-5xl mx-auto py-8">
                <DestinationForm initialData={result.data as Destination} lang={lang} />
            </div>
        </AdminRouteGuard>
    );
}
