import { z } from 'zod';

const multilingualStringSchema = z.object({
  en: z.string().min(1, { message: "English text is required." }),
  es: z.string().optional(),
  de: z.string().optional(),
  fr: z.string().optional(),
  nl: z.string().optional(),
});

const multilingualOptionalStringSchema = z.object({
  en: z.string().optional(),
  es: z.string().optional(),
  de: z.string().optional(),
  fr: z.string().optional(),
  nl: z.string().optional(),
}).optional();

export interface Destination {
  id: string;
  slug: { [key: string]: string };
  name: string; // The canonical name for the UI, maybe English by default
  shortDescription: { [key: string]: string };
  longDescription: { [key: string]: string };
  mainImage: string;
  galleryImages: string[];
  published: boolean;
  seoTitle: { [key: string]: string };
  seoDescription: { [key: string]: string };
  searchTags: { [key: string]: string[] }; // Keywords to map tours
}

const baseDestinationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required."),
  slug: multilingualStringSchema,
  shortDescription: multilingualStringSchema,
  longDescription: multilingualStringSchema,
  published: z.boolean().default(false),
  mainImage: z.any().optional(),
  galleryImages: z.any().optional(),
  seoTitle: multilingualOptionalStringSchema,
  seoDescription: multilingualOptionalStringSchema,
  searchTags: z.object({
    en: z.array(z.string()).optional(),
    es: z.array(z.string()).optional(),
    de: z.array(z.string()).optional(),
    fr: z.array(z.string()).optional(),
    nl: z.array(z.string()).optional(),
  }).optional(),
});

export const CreateDestinationInputSchema = baseDestinationSchema
  .refine(data => data.mainImage, {
    message: "Main image is required.",
    path: ["mainImage"],
  });

export const UpdateDestinationInputSchema = baseDestinationSchema.partial().extend({
  id: z.string(),
});

export type CreateDestinationInput = z.infer<typeof CreateDestinationInputSchema>;
