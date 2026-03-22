'use server';

import { createSafeAction } from '@/app/server-actions/lib/safe-action';
import { FirestoreDestinationRepository } from '@/backend/destinations/infrastructure/firestore-destination.repository';
import { Destination, CreateDestinationInputSchema } from '@/backend/destinations/domain/destination.model';
import { revalidatePath } from 'next/cache';

export const createDestination = createSafeAction(
  {
    allowedRoles: ['admin'],
    inputSchema: CreateDestinationInputSchema,
  },
  async (
    destinationData: any
  ): Promise<{ data?: { destinationId: string }; error?: string }> => {
    try {
      const destinationRepository = new FirestoreDestinationRepository();

      const newDestination: Destination = {
        ...destinationData,
        id: destinationData.id || destinationRepository.generateId(),
      };

      await destinationRepository.save(newDestination);

      revalidatePath('/[lang]', 'layout'); // Update everything

      return { data: { destinationId: newDestination.id } };
    } catch (error: any) {
      console.error('Error creating destination:', error);
      return { error: error.message || 'Failed to create destination.' };
    }
  }
);
