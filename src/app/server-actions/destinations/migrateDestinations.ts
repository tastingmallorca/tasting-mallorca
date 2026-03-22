'use server';

import { createSafeAction } from '@/app/server-actions/lib/safe-action';
import { FirestoreDestinationRepository } from '@/backend/destinations/infrastructure/firestore-destination.repository';
import { staticDestinations } from '@/data/destinations';
import { Destination } from '@/backend/destinations/domain/destination.model';

export const triggerDestinationMigration = createSafeAction(
  { allowedRoles: ['admin'] },
  async (): Promise<{ data?: { success: boolean, count: number }; error?: string }> => {
    try {
      const db = new FirestoreDestinationRepository();

      let migratedCount = 0;
      for (const dest of staticDestinations) {
        
        // Convert old static model to new DDD model
        const newDest: Destination = {
            id: dest.id,
            name: dest.name,
            published: true,
            mainImage: dest.image,
            galleryImages: [],
            slug: { en: dest.slug, es: dest.slug, de: dest.slug, fr: dest.slug, nl: dest.slug },
            shortDescription: { en: dest.shortDescription.en, es: dest.shortDescription.es, de: '', fr: '', nl: '' },
            longDescription: { en: dest.longDescription.en, es: dest.longDescription.es, de: '', fr: '', nl: '' },
            seoTitle: { en: dest.seo.title.en, es: dest.seo.title.es },
            seoDescription: { en: dest.seo.description.en, es: dest.seo.description.es },
            searchTags: { en: dest.seo.keywords.en, es: dest.seo.keywords.es, de: [], fr: [], nl: [] }
        };

        await db.save(newDest);
        migratedCount++;
      }

      return { data: { success: true, count: migratedCount } };
    } catch (error: any) {
      console.error('Migration failed:', error);
      return { error: error.message };
    }
  }
);
