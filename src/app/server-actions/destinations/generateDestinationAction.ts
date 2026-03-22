'use server';

import { createSafeAction } from '@/app/server-actions/lib/safe-action';
import { 
    generateDestinationContent,
    GenerateDestinationInputSchema,
    GenerateDestinationOutput
} from '@/ai/flows/generate-destination-flow';

export const generateDestinationAI = createSafeAction(
  {
    allowedRoles: ['admin'],
    inputSchema: GenerateDestinationInputSchema,
  },
  async (
    input: { name: string }
  ): Promise<{ data?: GenerateDestinationOutput; error?: string }> => {
    try {
      const generatedData = await generateDestinationContent(input);
      return { data: generatedData };
    } catch (error: any) {
      console.error('Error in generateDestinationAI:', error.message);
      return { error: error.message || 'Failed to generate content.' };
    }
  }
);
