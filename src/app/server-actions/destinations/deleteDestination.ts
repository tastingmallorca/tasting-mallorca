'use server';

import { createSafeAction } from '@/app/server-actions/lib/safe-action';
import { FirestoreDestinationRepository } from '@/backend/destinations/infrastructure/firestore-destination.repository';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export const deleteDestination = createSafeAction(
  {
    allowedRoles: ['admin'],
    inputSchema: z.object({ id: z.string() })
  },
  async ({ id }: { id: string }): Promise<{ data?: { success: boolean }; error?: string }> => {
    try {
      const destinationRepository = new FirestoreDestinationRepository();
      await destinationRepository.delete(id);

      revalidatePath('/[lang]', 'layout'); 

      return { data: { success: true } };
    } catch (error: any) {
      console.error('Error deleting destination:', error);
      return { error: error.message || 'Failed to delete destination.' };
    }
  }
);
