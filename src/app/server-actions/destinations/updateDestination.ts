'use server';

import { createSafeAction } from '@/app/server-actions/lib/safe-action';
import { FirestoreDestinationRepository } from '@/backend/destinations/infrastructure/firestore-destination.repository';
import { UpdateDestinationInputSchema } from '@/backend/destinations/domain/destination.model';
import { revalidatePath } from 'next/cache';

export const updateDestination = createSafeAction(
  {
    allowedRoles: ['admin'],
    inputSchema: UpdateDestinationInputSchema,
  },
  async (
    destinationData: any
  ): Promise<{ data?: { success: boolean }; error?: string }> => {
    try {
      const destinationRepository = new FirestoreDestinationRepository();

      await destinationRepository.update(destinationData);

      revalidatePath('/[lang]', 'layout'); 

      return { data: { success: true } };
    } catch (error: any) {
      console.error('Error updating destination:', error);
      return { error: error.message || 'Failed to update destination.' };
    }
  }
);
