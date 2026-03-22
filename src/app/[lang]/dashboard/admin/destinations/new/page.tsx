import { AdminRouteGuard } from "@/components/auth/admin-route-guard";
import { DestinationForm } from "@/components/destinations/destination-form";

export default async function CreateDestinationPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    return (
        <AdminRouteGuard>
            <div className="max-w-5xl mx-auto py-8">
                <DestinationForm lang={lang} />
            </div>
        </AdminRouteGuard>
    );
}
