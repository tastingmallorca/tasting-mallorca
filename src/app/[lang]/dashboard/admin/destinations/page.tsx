import { AdminRouteGuard } from "@/components/auth/admin-route-guard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';
import { MigrationButton } from "./migration-button";
import { DestinationList } from "./destination-list";
import { findAllDestinations } from "@/app/server-actions/destinations/findDestinations";
import { Destination } from "@/backend/destinations/domain/destination.model";

export default async function DestinationManagementPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const createDestinationLink = `/${lang}/dashboard/admin/destinations/new`;
    const result = await findAllDestinations({});

    return (
        <AdminRouteGuard>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Gestión de Destinos (Destinations)</h1>
                    <p className="text-muted-foreground">
                        Crea, edita y enriquece todos los destinos (SEO & AI-First).
                    </p>
                </div>
                <div className="flex gap-4">
                    <MigrationButton />
                    <Button asChild>
                        <Link href={createDestinationLink}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crear Nuevo Destino
                        </Link>
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Destinos Existentes</CardTitle>
                    <CardDescription>
                        Aquí puedes ver y gestionar todos los destinos en la plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DestinationList destinations={result.data as Destination[]} error={result.error} />
                </CardContent>
            </Card>
        </AdminRouteGuard>
    );
}
