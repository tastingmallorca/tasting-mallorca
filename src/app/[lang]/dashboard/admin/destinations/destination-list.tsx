'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Destination } from "@/backend/destinations/domain/destination.model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Loader2, Trash2, ImageIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteDestination } from "@/app/server-actions/destinations/deleteDestination";
import { useState } from "react";
import { UploadProgressDialog } from "@/components/upload-progress-dialog";

interface DestinationListProps {
    destinations?: Destination[];
    error?: string;
}

export function DestinationList({ destinations, error }: DestinationListProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    if (error) {
        return <p className="text-destructive text-center py-12">Error: {error}</p>;
    }

    if (!destinations || destinations.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-medium text-muted-foreground">Aún no se han creado destinos.</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Haz clic en el botón para crear el primer destino dinámico.
                </p>
            </div>
        );
    }

    const handleDelete = async (destinationId: string) => {
        setIsDeleting(true);
        const result = await deleteDestination({ id: destinationId });
        setIsDeleting(false);

        if (result.error) {
            toast({
                variant: 'destructive',
                title: 'Error deleting destination',
                description: result.error,
            });
        } else {
            toast({
                title: 'Destination Deleted',
                description: 'The destination has been successfully deleted.',
            });
            router.refresh();
        }
    }

    return (
        <>
            {isDeleting && <UploadProgressDialog progress={100} message="Eliminando destino y sus imágenes..." />}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Imagen</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {destinations.map((dest) => (
                        <TableRow key={dest.id}>
                            <TableCell>
                                {dest.mainImage ? (
                                    <ImageWithSkeleton
                                        src={dest.mainImage}
                                        alt={dest.name}
                                        width={64}
                                        height={64}
                                        className="rounded-md object-cover aspect-square"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-secondary rounded-md flex items-center justify-center">
                                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="font-medium">{dest.name}</TableCell>
                            <TableCell>
                                <Badge variant={dest.published ? 'default' : 'secondary'}>
                                    {dest.published ? 'Publicado' : 'Borrador'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`${pathname}/${dest.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar
                                        </Link>
                                    </Button>
                                    <Button asChild variant="ghost" size="sm" disabled={!dest.published}>
                                        <Link href={`/destinations/${dest.slug.en}`} target="_blank">
                                            <Eye className="mr-2 h-4 w-4" />
                                            Ver
                                        </Link>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción no se puede deshacer. Eliminará permanentemente el destino y sus imágenes.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(dest.id)} disabled={isDeleting}>
                                                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table >
        </>
    );
}
