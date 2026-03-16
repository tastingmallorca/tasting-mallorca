
'use client';

import { TourForm, getFieldTab } from "@/app/[lang]/dashboard/admin/tours/new/tour-form";
import { useForm, FormProvider, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TourFormHeader } from "@/app/./[lang]/dashboard/admin/tours/new/tour-form-header";
import { useState, useEffect } from "react";
import { Tour, UpdateTourInputSchema, CreateTourInput } from "@/backend/tours/domain/tour.model";
import { parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { initializeFirebase } from "@/firebase";
import { updateTour } from "@/app/server-actions/tours/updateTour";
import { useFormPersistence } from "@/hooks/use-form-persistence";
import { UploadProgressDialog } from "@/components/upload-progress-dialog";
import { cloneDeep, mergeWith } from "lodash";
import { TranslateTourInput, TranslateTourOutput } from "@/ai/flows/translate-tour-flow";
import { translateTourAction } from "@/app/server-actions/tours/translateTourAction";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteTourImage } from "@/app/server-actions/tours/deleteTourImage";
import { Loader2 } from "lucide-react";


type TourFormValues = CreateTourInput;

interface EditTourClientPageProps {
    initialData: Tour;
    lang: string;
}

const defaultMultilingual = { en: '', de: '', fr: '', nl: '' };

function getFirstErrorMessage(errors: any, currentPath: string = ''): { message: string, path: string } | null {
    if (!errors || typeof errors !== 'object') return null;

    if (errors.message && typeof errors.message === 'string') {
        return { message: errors.message, path: currentPath };
    }

    if (errors.root?.message) {
        return { message: errors.root.message, path: currentPath };
    }

    for (const key in errors) {
        if (Object.prototype.hasOwnProperty.call(errors, key)) {
            const error = errors[key];
            const newPath = currentPath ? `${currentPath}.${key}` : key;
            
            // Handle array of errors
            if (Array.isArray(error)) {
                for (let i = 0; i < error.length; i++) {
                    const result = getFirstErrorMessage(error[i], `${newPath}[${i}]`);
                    if (result) return result;
                }
            } 
            // Handle nested object of errors
            else if (typeof error === 'object' && error !== null) {
                const result = getFirstErrorMessage(error, newPath);
                if (result) return result;
            }
        }
    }
    return null;
}

export function EditTourClientPage({ initialData, lang }: EditTourClientPageProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadMessage, setUploadMessage] = useState('Starting...');
    const [activeTab, setActiveTab] = useState('main');
    const [errorTab, setErrorTab] = useState<string | null>(null);

    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<string | null>(null);
    const [isDeletingImage, setIsDeletingImage] = useState(false);

    const formPersistenceKey = `tour-form-edit-${initialData.id}`;

    const parsedInitialData = {
        ...initialData,
        availabilityPeriods: initialData.availabilityPeriods?.map(p => ({
            ...p,
            startDate: p.startDate ? parseISO(p.startDate) : new Date(),
            endDate: p.endDate ? parseISO(p.endDate) : new Date(),
            activeDays: p.activeDays && p.activeDays.length > 0 ? p.activeDays : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            languages: p.languages && p.languages.length > 0 ? p.languages : ['en', 'es', 'de', 'fr', 'nl']
        })) || [],
        itinerary: initialData.itinerary?.map(item => ({
            ...item,
            title: { ...defaultMultilingual, ...item.title },
            activities: {
                en: item.activities?.en || [],
                de: item.activities?.de || [],
                fr: item.activities?.fr || [],
                nl: item.activities?.nl || [],
            }
        })) || []
    };

    const defaultValues: TourFormValues = {
        id: initialData.id || '',
        title: { ...defaultMultilingual },
        slug: { ...defaultMultilingual },
        description: { ...defaultMultilingual },
        overview: { ...defaultMultilingual },
        generalInfo: {
            cancellationPolicy: { ...defaultMultilingual },
            bookingPolicy: { ...defaultMultilingual },
            guideInfo: { ...defaultMultilingual },
            pickupInfo: { ...defaultMultilingual },
        },
        details: {
            highlights: { ...defaultMultilingual },
            fullDescription: { ...defaultMultilingual },
            included: { ...defaultMultilingual },
            notIncluded: { ...defaultMultilingual },
            notSuitableFor: { ...defaultMultilingual },
            whatToBring: { ...defaultMultilingual },
            beforeYouGo: { ...defaultMultilingual },
        },
        pickupPoint: {
            title: { ...defaultMultilingual },
            description: { ...defaultMultilingual },
        },
        price: 0,
        childPrice: 0,
        region: "South" as "South",
        durationHours: 8,
        isFeatured: false,
        published: false,
        allowDeposit: false,
        depositPrice: 0,
        hasPromotion: false,
        promotionPercentage: 0,
        itinerary: [],
        galleryImages: [],
        mainImage: undefined,
        video: {},
        availabilityPeriods: [],
    };
    const mergedData = mergeWith(cloneDeep(defaultValues), parsedInitialData, (objValue, srcValue) => {
        if (srcValue !== undefined && srcValue !== null) {
            return srcValue;
        }
        return objValue;
    });

    const form = useForm<TourFormValues>({
        resolver: zodResolver(UpdateTourInputSchema),
        defaultValues: mergedData,
    });

    const { clearPersistedData } = useFormPersistence(formPersistenceKey, form, mergedData);

    const uploadFile = (file: File, tourId: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const { app } = initializeFirebase();
            const storage = getStorage(app);
            const fileName = `tours/${tourId}/${Date.now()}-${file.name}`;
            const fileRef = storageRef(storage, fileName);
            const uploadTask = uploadBytesResumable(fileRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(resolve);
                }
            );
        });
    };

    const handleInvalidSubmit = (errors: FieldErrors<TourFormValues>) => {
        const errorDetails = getFirstErrorMessage(errors);
        if (errorDetails) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: `Field '${errorDetails.path}' is invalid: ${errorDetails.message}`,
            });
            const tabWithError = getFieldTab(errorDetails.path);
            if (tabWithError) {
                setActiveTab(tabWithError);
                setErrorTab(tabWithError);
                setTimeout(() => setErrorTab(null), 500);
            }
        }
    }

    const onSubmit = async (data: TourFormValues) => {
        setIsSubmitting(true);

        try {
            let tourId = data.id;

            let mainImageUrl = data.mainImage;
            if (data.mainImage instanceof File) {
                setUploadMessage('Uploading main image...');
                mainImageUrl = await uploadFile(data.mainImage, tourId!);
            }

            let galleryImageUrls: string[] = [];
            const existingGalleryUrls = (data.galleryImages as any[])?.filter(img => typeof img === 'string') || [];
            const newGalleryFiles = (data.galleryImages as any[])?.filter(img => img instanceof File) || [];

            if (newGalleryFiles.length > 0) {
                const uploadedUrls: string[] = [];
                for (let i = 0; i < newGalleryFiles.length; i++) {
                    setUploadMessage(`Uploading gallery image ${i + 1} of ${newGalleryFiles.length}...`);
                    const url = await uploadFile(newGalleryFiles[i], tourId!);
                    uploadedUrls.push(url);
                }
                galleryImageUrls = [...existingGalleryUrls, ...uploadedUrls];
            } else {
                galleryImageUrls = existingGalleryUrls;
            }

            // Handle Video Uploads
            const videoUrls: { [key: string]: string | undefined } = { ...data.video };
            const languages = ['en', 'de', 'fr', 'nl'];
            let hasVideoUpdates = false;

            for (const lang of languages) {
                const videoFile = data.video?.[lang as keyof typeof data.video];
                if (videoFile instanceof File) {
                    setUploadMessage(`Uploading ${lang.toUpperCase()} video...`);
                    const url = await uploadFile(videoFile, tourId!);
                    videoUrls[lang as keyof typeof videoUrls] = url;
                    hasVideoUpdates = true;
                }
            }

            setUploadMessage('Saving tour data...');
            setUploadProgress(100);

            const tourData = {
                ...data,
                mainImage: mainImageUrl,
                galleryImages: galleryImageUrls,
                video: videoUrls,
            };

            const result = await updateTour({ ...tourData, id: tourId });

            if (result.error) throw new Error(result.error);

            clearPersistedData();
            form.reset(tourData, { keepDirty: false });

            toast({
                title: "Tour Saved!",
                description: `The tour "${data.title.en}" has been saved successfully.`,
            });

        } catch (error: any) {
            console.error("Error saving tour:", error);
            toast({
                variant: "destructive",
                title: "Error saving tour",
                description: error.message || "An issue occurred, please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTranslate = async () => {
        setIsTranslating(true);
        try {
            const currentData = form.getValues();

            const translationInput: TranslateTourInput = {
                title: currentData.title.en,
                slug: currentData.slug.en,
                description: currentData.description.en,
                overview: currentData.overview.en,
                generalInfo: {
                    cancellationPolicy: currentData.generalInfo.cancellationPolicy.en,
                    bookingPolicy: currentData.generalInfo.bookingPolicy.en,
                    guideInfo: currentData.generalInfo.guideInfo.en,
                    pickupInfo: currentData.generalInfo.pickupInfo.en,
                },
                details: {
                    highlights: currentData.details?.highlights?.en || '',
                    fullDescription: currentData.details?.fullDescription?.en || '',
                    included: currentData.details?.included?.en || '',
                    notIncluded: currentData.details?.notIncluded?.en || '',
                    notSuitableFor: currentData.details?.notSuitableFor?.en || '',
                    whatToBring: currentData.details?.whatToBring?.en || '',
                    beforeYouGo: currentData.details?.beforeYouGo?.en || '',
                },
                pickupPoint: {
                    title: currentData.pickupPoint.title.en,
                    description: currentData.pickupPoint.description.en,
                },
                itinerary: currentData.itinerary?.map(item => ({
                    id: item.id,
                    type: item.type,
                    title: { en: item.title.en },
                    activities: { en: item.activities?.en || [] },
                })) || []
            };

            const result = await translateTourAction(translationInput);

            if (result.error) throw new Error(result.error);
            if (!result.data) throw new Error("No translation data returned.");

            const translatedData = result.data as TranslateTourOutput;
            const updatedData = mergeWith(cloneDeep(currentData), translatedData);
            form.reset(updatedData);

            toast({
                title: "Content Translated!",
                description: "The tour content has been translated automatically.",
            });

        } catch (error: any) {
            console.error("Translation failed:", error);
            toast({
                variant: "destructive",
                title: "Translation Error",
                description: error.message || "An unexpected issue occurred during translation.",
            });
        } finally {
            setIsTranslating(false);
        }
    }

    const handleServerImageDelete = (imageUrl: string) => {
        setImageToDelete(imageUrl);
        setIsDeleteAlertOpen(true);
    };

    const confirmDeleteImage = async () => {
        if (!imageToDelete) return;

        setIsDeletingImage(true);
        const result = await deleteTourImage({ tourId: initialData.id, imageUrl: imageToDelete });

        setIsDeletingImage(false);
        setIsDeleteAlertOpen(false);

        if (result.error) {
            toast({
                variant: "destructive",
                title: "Error deleting image",
                description: result.error,
            });
        } else {
            toast({
                title: "Image Deleted",
                description: "The image has been permanently deleted.",
            });
            // Update the form state to reflect the deletion
            if (form.getValues('mainImage') === imageToDelete) {
                form.setValue('mainImage', undefined, { shouldDirty: true });
            } else {
                const currentGallery = form.getValues('galleryImages') || [];
                form.setValue('galleryImages', currentGallery.filter((url: any) => url !== imageToDelete), { shouldDirty: true });
            }
        }
        setImageToDelete(null);
    };

    const basePath = `/${lang}/dashboard/admin/tours`;

    return (
        <FormProvider {...form}>
            <div className="flex flex-col h-full">
                {isSubmitting && <UploadProgressDialog progress={uploadProgress} message={uploadMessage} />}
                <TourFormHeader
                    isSubmitting={isSubmitting}
                    isTranslating={isTranslating}
                    onTranslate={handleTranslate}
                    initialData={initialData}
                    basePath={basePath}
                />
                <main className="flex-grow overflow-y-scroll px-4 pt-4 md:px-8 lg:px-10">
                    <form
                        id="tour-form"
                        onSubmit={form.handleSubmit(onSubmit, handleInvalidSubmit)}
                        className="space-y-8"
                    >
                        <TourForm
                            initialData={initialData}
                            onServerImageDelete={handleServerImageDelete}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            errorTab={errorTab}
                        />
                    </form>
                </main>
            </div>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the image from the storage.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteImage} disabled={isDeletingImage} className="bg-destructive hover:bg-destructive/90">
                            {isDeletingImage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Yes, delete image
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </FormProvider>
    );
}
