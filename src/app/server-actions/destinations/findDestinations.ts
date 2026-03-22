'use server';

import { createSafeAction } from '@/app/server-actions/lib/safe-action';
import { FirestoreDestinationRepository } from '@/backend/destinations/infrastructure/firestore-destination.repository';
import { Destination } from '@/backend/destinations/domain/destination.model';

export const findDestinationById = createSafeAction(
    {
        allowedRoles: ['admin'],
    },
    async (destinationId: string, user): Promise<{ data?: Destination; error?: string }> => {
        if (!user) return { error: "Authentication required" };
        try {
            const destinationRepository = new FirestoreDestinationRepository();
            const destination = await destinationRepository.findById(destinationId);
            if (!destination) {
                return { error: 'Destination not found.' };
            }
            return { data: JSON.parse(JSON.stringify(destination)) };
        } catch (error: any) {
            return { error: error.message || 'Failed to fetch destination.' };
        }
    }
);

export const findAllDestinations = createSafeAction(
  {}, // Public action
  async (_: {}): Promise<{ data?: Destination[]; error?: string }> => {
    try {
      const destinationRepository = new FirestoreDestinationRepository();
      const destinations = await destinationRepository.findAll();
      return { data: JSON.parse(JSON.stringify(destinations)) };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch destinations.' };
    }
  }
);

export const findDestinationBySlugAndLang = createSafeAction(
    {}, // Public action
    async ({ slug, lang }: { slug: string, lang: string }): Promise<{ data?: Destination; error?: string; }> => {
        try {
            const destinationRepository = new FirestoreDestinationRepository();
            const destination = await destinationRepository.findBySlug(slug, lang);

            if (!destination || !destination.published) {
                return { error: 'Destination not found or not published.' };
            }
            return { data: JSON.parse(JSON.stringify(destination)) };

        } catch (error: any) {
            return { error: error.message || 'Failed to fetch destination.' };
        }
    }
);
