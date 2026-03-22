'use client';

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Database } from "lucide-react";
import { triggerDestinationMigration } from "@/app/server-actions/destinations/migrateDestinations";
import { useRouter } from "next/navigation";

export function MigrationButton() {
    const { toast } = useToast();
    const router = useRouter();
    const [isMigrating, setIsMigrating] = useState(false);

    const handleMigrate = async () => {
        if (!confirm("Are you sure you want to run the static data migration? This will inject destinations into Firestore.")) return;
        
        setIsMigrating(true);
        try {
            const result = await triggerDestinationMigration({});
            if (result.error) {
                toast({ variant: "destructive", title: "Migration Failed", description: result.error });
            } else {
                toast({ title: "Migration Successful", description: `Migrated ${result.data?.count || 0} destinations to Firebase.` });
                router.refresh();
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Migration Error", description: error.message });
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <Button variant="outline" onClick={handleMigrate} disabled={isMigrating}>
            {isMigrating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4 text-blue-500" />}
            Migrate Static Data
        </Button>
    );
}
