'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Wand2, Plus, Trash2 } from "lucide-react";
import { Destination, CreateDestinationInputSchema } from "@/backend/destinations/domain/destination.model";
import { createDestination } from "@/app/server-actions/destinations/createDestination";
import { updateDestination } from "@/app/server-actions/destinations/updateDestination";
import { generateDestinationAI } from "@/app/server-actions/destinations/generateDestinationAction";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ui/image-upload";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { initializeFirebase } from "@/firebase";

interface DestinationFormProps {
  initialData?: Destination;
  lang: string;
}

export function DestinationForm({ initialData, lang }: DestinationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof CreateDestinationInputSchema>>({
    resolver: zodResolver(CreateDestinationInputSchema),
    defaultValues: initialData || {
      name: "",
      published: false,
      mainImage: "",
      galleryImages: [],
      slug: { en: "", es: "", de: "", fr: "", nl: "" },
      shortDescription: { en: "", es: "", de: "", fr: "", nl: "" },
      longDescription: { en: "", es: "", de: "", fr: "", nl: "" },
      seoTitle: { en: "", es: "", de: "", fr: "", nl: "" },
      seoDescription: { en: "", es: "", de: "", fr: "", nl: "" },
      searchTags: { en: [], es: [], de: [], fr: [], nl: [] },
    },
  });

  const uploadFile = (file: File, destinationId: string): Promise<string> => {
      return new Promise((resolve, reject) => {
          const { app } = initializeFirebase();
          const storage = getStorage(app);
          const fileName = `destinations/${destinationId}/${Date.now()}-${file.name}`;
          const fileRef = storageRef(storage, fileName);
          const uploadTask = uploadBytesResumable(fileRef, file);

          uploadTask.on(
              'state_changed',
              (snapshot) => {},
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

  const onSubmit = async (data: z.infer<typeof CreateDestinationInputSchema>) => {
    setIsSubmitting(true);
    try {
        const destId = initialData?.id || crypto.randomUUID();

        let mainImageUrl = data.mainImage;
        if (data.mainImage instanceof File) {
            mainImageUrl = await uploadFile(data.mainImage, destId);
        }

        let galleryImageUrls: string[] = [];
        const newGalleryFiles = (data.galleryImages as any[])?.filter(img => img instanceof File) || [];
        const oldGalleryUrls = (data.galleryImages as any[])?.filter(img => typeof img === 'string') || [];

        if (newGalleryFiles.length > 0) {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < newGalleryFiles.length; i++) {
                const url = await uploadFile(newGalleryFiles[i], destId);
                uploadedUrls.push(url);
            }
            galleryImageUrls = [...oldGalleryUrls, ...uploadedUrls];
        } else {
            galleryImageUrls = oldGalleryUrls;
        }

        const formattedData = {
            ...data,
            mainImage: mainImageUrl,
            galleryImages: galleryImageUrls,
        }

        let result;
        if (initialData?.id) {
           result = await updateDestination({ ...formattedData, id: initialData.id });
        } else {
           result = await createDestination({ ...formattedData, id: destId });
        }

        if (result.error) {
          toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
          toast({ title: "Success", description: "Destination saved successfully." });
          router.push(`/${lang}/dashboard/admin/destinations`);
          router.refresh();
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Upload Error", description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleGenerateAI = async () => {
      const name = form.getValues('name');
      if (!name) {
          toast({ variant: "destructive", description: "Please enter a Destination Name first." });
          return;
      }
      setIsGenerating(true);
      const res = await generateDestinationAI({ name });
      setIsGenerating(false);

      if (res.error || !res.data) {
          toast({ variant: "destructive", title: "AI Generation Failed", description: res.error });
      } else {
          toast({ title: "AI Generated Content", description: "All linguistic fields successfully enriched." });
          const db = res.data;
          
          Object.keys(db.slug).forEach(l => form.setValue(`slug.${l as 'en'|'es'|'de'|'fr'|'nl'}`, db.slug[l as keyof typeof db.slug] || ''));
          Object.keys(db.shortDescription).forEach(l => form.setValue(`shortDescription.${l as 'en'|'es'|'de'|'fr'|'nl'}`, db.shortDescription[l as keyof typeof db.shortDescription] || ''));
          Object.keys(db.longDescription).forEach(l => form.setValue(`longDescription.${l as 'en'|'es'|'de'|'fr'|'nl'}`, db.longDescription[l as keyof typeof db.longDescription] || ''));
          Object.keys(db.seoTitle).forEach(l => form.setValue(`seoTitle.${l as 'en'|'es'|'de'|'fr'|'nl'}`, db.seoTitle[l as keyof typeof db.seoTitle] || ''));
          Object.keys(db.seoDescription).forEach(l => form.setValue(`seoDescription.${l as 'en'|'es'|'de'|'fr'|'nl'}`, db.seoDescription[l as keyof typeof db.seoDescription] || ''));
          Object.keys(db.searchTags).forEach(l => form.setValue(`searchTags.${l as 'en'|'es'|'de'|'fr'|'nl'}`, db.searchTags[l as keyof typeof db.searchTags] || []));
      }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur py-4 border-b">
            <h2 className="text-2xl font-bold">{initialData ? 'Edit Destination' : 'Create Destination'}</h2>
            <div className="flex gap-4">
                <Button type="button" variant="secondary" onClick={handleGenerateAI} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    Enrich with AI
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Destination
                </Button>
            </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="content">Multilingual Content</TabsTrigger>
                <TabsTrigger value="seo">SEO & Interlinking</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6 mt-6">
                <Card>
                    <CardHeader><CardTitle>Core Details</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Destination canonical name</FormLabel>
                                    <FormControl><Input placeholder="E.g. Valldemossa" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="mainImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Main Image</FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                value={field.value ? [field.value] : []}
                                                onChange={(file) => field.onChange(file)}
                                                onRemove={() => field.onChange("")}
                                                multiple={false}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="galleryImages"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gallery Images</FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                value={field.value || []}
                                                onChange={(files) => field.onChange(files)}
                                                onRemove={(fileToRemove) => {
                                                    const newValue = [...(field.value || [])].filter(file => file !== fileToRemove);
                                                    field.onChange(newValue);
                                                }}
                                                multiple={true}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField control={form.control} name="published" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <FormLabel>Published</FormLabel>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="content" className="mt-6">
                <Card>
                    <CardHeader><CardTitle>Translations (Auto-filled by AI)</CardTitle></CardHeader>
                    <CardContent>
                        <Tabs defaultValue="en">
                            <TabsList className="mb-4">
                                {['en', 'es', 'de', 'fr', 'nl'].map(l => (
                                    <TabsTrigger key={l} value={l} className="uppercase">{l}</TabsTrigger>
                                ))}
                            </TabsList>
                            {['en', 'es', 'de', 'fr', 'nl'].map(l => (
                                <TabsContent key={l} value={l} className="space-y-4">
                                    <FormField control={form.control} name={`slug.${l as 'en'}`} render={({ field }) => (
                                        <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`shortDescription.${l as 'en'}`} render={({ field }) => (
                                        <FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`longDescription.${l as 'en'}`} render={({ field }) => (
                                        <FormItem><FormLabel>Long Description</FormLabel><FormControl><Textarea className="min-h-[200px]" {...field} /></FormControl></FormItem>
                                    )} />
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="seo" className="mt-6">
                <Card>
                    <CardHeader><CardTitle>SEO & Tagging</CardTitle></CardHeader>
                    <CardContent>
                        <Tabs defaultValue="en">
                            <TabsList className="mb-4">
                                {['en', 'es', 'de', 'fr', 'nl'].map(l => (
                                    <TabsTrigger key={l} value={l} className="uppercase">{l}</TabsTrigger>
                                ))}
                            </TabsList>
                            {['en', 'es', 'de', 'fr', 'nl'].map(l => (
                                <TabsContent key={l} value={l} className="space-y-4">
                                    <FormField control={form.control} name={`seoTitle.${l as 'en'}`} render={({ field }) => (
                                        <FormItem><FormLabel>SEO Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`seoDescription.${l as 'en'}`} render={({ field }) => (
                                        <FormItem><FormLabel>SEO Description</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`searchTags.${l as 'en'}`} render={({ field }) => (
                                        <FormItem><FormLabel>Search Tags (Comma separated)</FormLabel><FormControl>
                                            <Input 
                                                value={field.value?.join(', ') || ''} 
                                                onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                                            />
                                        </FormControl></FormItem>
                                    )} />
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>
            </TabsContent>

        </Tabs>

      </form>
    </Form>
  );
}
