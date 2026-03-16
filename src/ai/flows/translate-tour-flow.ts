

import { z } from 'zod';

const ItineraryItemTranslationInputSchema = z.object({
  title: z.object({ en: z.string().optional() }).optional(),
  activities: z.object({ en: z.array(z.string()).optional() }).optional(),
});

export const TranslateTourInputSchema = z.object({
  title: z.string().describe('The title of the tour in English.'),
  slug: z.string().describe('The URL-friendly slug in English.'),
  description: z.string().describe('The short description of the tour in English.'),
  overview: z.string().describe('The detailed overview of the tour in English.'),
  generalInfo: z.object({
    cancellationPolicy: z.string().describe('Cancellation policy text in English.'),
    bookingPolicy: z.string().describe('Booking policy text in English.'),
    guideInfo: z.string().describe('Guide information text in English.'),
    pickupInfo: z.string().describe('Pickup information text in English.'),
  }),
  details: z.object({
      highlights: z.string().describe('List of highlights, separated by newlines.'),
      fullDescription: z.string().describe('The full, detailed description.'),
      included: z.string().describe('List of what is included, separated by newlines.'),
      notIncluded: z.string().describe('List of what is not included, separated by newlines.'),
      notSuitableFor: z.string().describe('List of who this is not suitable for, separated by newlines.'),
      whatToBring: z.string().describe('List of what to bring, separated by newlines.'),
      beforeYouGo: z.string().describe('List of things to know before you go, separated by newlines.'),
  }),
  pickupPoint: z.object({
    title: z.string().describe('Pickup point main title in English.'),
    description: z.string().describe('Pickup point detailed description in English.'),
  }),
  itinerary: z.array(ItineraryItemTranslationInputSchema).describe('An array of itinerary items in English.'),
});

export type TranslateTourInput = z.infer<typeof TranslateTourInputSchema>;

const MultilingualStringSchema = z.object({
    de: z.string().optional(),
    fr: z.string().optional(),
    nl: z.string().optional(),
});

const ItineraryItemTranslationOutputSchema = z.object({
    title: MultilingualStringSchema.optional(),
    activities: z.object({
        de: z.array(z.string()).optional(),
        fr: z.array(z.string()).optional(),
        nl: z.array(z.string()).optional(),
    }).optional(),
});

export const TranslateTourOutputSchema = z.object({
  slug: MultilingualStringSchema.optional(),
  title: MultilingualStringSchema.optional(),
  description: MultilingualStringSchema.optional(),
  overview: MultilingualStringSchema.optional(),
  generalInfo: z.object({
    cancellationPolicy: MultilingualStringSchema.optional(),
    bookingPolicy: MultilingualStringSchema.optional(),
    guideInfo: MultilingualStringSchema.optional(),
    pickupInfo: MultilingualStringSchema.optional(),
  }).optional(),
  details: z.object({
    highlights: MultilingualStringSchema.optional(),
    fullDescription: MultilingualStringSchema.optional(),
    included: MultilingualStringSchema.optional(),
    notIncluded: MultilingualStringSchema.optional(),
    notSuitableFor: MultilingualStringSchema.optional(),
    whatToBring: MultilingualStringSchema.optional(),
    beforeYouGo: MultilingualStringSchema.optional(),
  }).optional(),
  pickupPoint: z.object({
    title: MultilingualStringSchema.optional(),
    description: MultilingualStringSchema.optional(),
  }).optional(),
  itinerary: z.array(ItineraryItemTranslationOutputSchema).optional(),
});

export type TranslateTourOutput = z.infer<typeof TranslateTourOutputSchema>;


function buildPrompt(input: TranslateTourInput): string {
    const outputSchemaForPrompt = {
        slug: { de: "string", fr: "string", nl: "string" },
        title: { de: "string", fr: "string", nl: "string" },
        description: { de: "string", fr: "string", nl: "string" },
        overview: { de: "string", fr: "string", nl: "string" },
        generalInfo: {
            cancellationPolicy: { de: "string", fr: "string", nl: "string" },
            bookingPolicy: { de: "string", fr: "string", nl: "string" },
            guideInfo: { de: "string", fr: "string", nl: "string" },
            pickupInfo: { de: "string", fr: "string", nl: "string" },
        },
        details: {
            highlights: { de: "string", fr: "string", nl: "string" },
            fullDescription: { de: "string", fr: "string", nl: "string" },
            included: { de: "string", fr: "string", nl: "string" },
            notIncluded: { de: "string", fr: "string", nl: "string" },
            notSuitableFor: { de: "string", fr: "string", nl: "string" },
            whatToBring: { de: "string", fr: "string", nl: "string" },
            beforeYouGo: { de: "string", fr: "string", nl: "string" },
        },
        pickupPoint: {
            title: { de: "string", fr: "string", nl: "string" },
            description: { de: "string", fr: "string", nl: "string" },
        },
        itinerary: [
            {
                title: { de: "string", fr: "string", nl: "string" },
                activities: { de: ["string"], fr: ["string"], nl: ["string"] },
            }
        ]
    };

    return `You are an expert translator specializing in creating engaging and natural-sounding tourism marketing content for a European audience. Your task is to translate the provided tour information from English into German (de), French (fr), and Dutch (nl).

    **CRITICAL INSTRUCTIONS:**
    1.  **Do not perform a literal, word-for-word translation.** Adapt the phrasing, tone, and cultural nuances to make the content appealing and natural for speakers of each target language.
    2.  **Translate the 'slug' field.** It must be a URL-friendly version of the translated title (lowercase, hyphens for spaces, no special characters).
    3.  **Handle list-based fields correctly:** For fields in the 'details' section (like highlights, included, etc.), the input is a single string with items separated by newlines. Your output for these fields MUST be an object with keys "de", "fr", "nl", where each value is a single string that preserves the newline-separated list format.
    4.  **Handle the Itinerary Array:** The 'itinerary' is an array of objects. You must process each object in the array and translate its contents.
        - For each object, translate the 'title.en' field.
        - If an object contains an 'activities.en' array with strings, translate each string in that array.
        - If 'activities.en' is missing, empty, or null, you must return empty arrays for 'de', 'fr', and 'nl' for that object.
        - Your final output for the 'itinerary' must be an array of translated objects, maintaining the original order.
    5.  **Format your response STRICTLY as a single JSON object.** Do not wrap it in markdown backticks (\`\`\`json) or any other text. The JSON object must conform to the schema provided at the end of this prompt.
    6.  If a source field is empty or missing, the corresponding translated fields should also be empty strings or empty arrays.

    **Source Content (English):**
    - Title: ${input.title}
    - Slug: ${input.slug}
    - Description: ${input.description}
    - Overview: ${input.overview}
    - General Info:
      - Cancellation Policy: ${input.generalInfo.cancellationPolicy}
      - Booking Policy: ${input.generalInfo.bookingPolicy}
      - Guide Info: ${input.generalInfo.guideInfo}
      - Pickup Info: ${input.generalInfo.pickupInfo}
    - Details:
      - Highlights: ${input.details?.highlights}
      - Full Description: ${input.details?.fullDescription}
      - Included: ${input.details?.included}
      - Not Included: ${input.details?.notIncluded}
      - Not Suitable For: ${input.details?.notSuitableFor}
      - What To Bring: ${input.details?.whatToBring}
      - Before You Go: ${input.details?.beforeYouGo}
    - Pickup Point:
      - Title: ${input.pickupPoint.title}
      - Description: ${input.pickupPoint.description}
    - Itinerary Items (translate 'title.en' and each string in 'activities.en' for each item):
    ${JSON.stringify(input.itinerary, null, 2)}

    **Required Output JSON Schema:**
    \`\`\`json
    ${JSON.stringify(outputSchemaForPrompt, null, 2)}
    \`\`\`
    `;
}

async function getStreamingResponse(response: Response): Promise<string> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let result = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        result += decoder.decode(value, { stream: true });
    }
    return result;
}


export async function translateTour(input: TranslateTourInput): Promise<TranslateTourOutput> {
  const prompt = buildPrompt(input);
  
  const apiKey = process.env.VERTEX_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('VERTEX_AI_API_KEY environment variable is not set.');
  }

  const endpoint = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:streamGenerateContent?key=${apiKey}`;

  let rawResponseText = '';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
        }
      })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Vertex AI API Error Body:", errorBody);
        throw new Error(`Vertex AI API call failed with status ${response.status}: ${response.statusText}`);
    }

    rawResponseText = await getStreamingResponse(response);

    if (!rawResponseText) {
        throw new Error('No response text from AI model.');
    }
    
    // Combine chunks if the response is streamed and comes in a JSON array format
    let combinedText = rawResponseText;
    try {
        const chunks = JSON.parse(rawResponseText);
        if (Array.isArray(chunks)) {
            combinedText = chunks.map((chunk: any) => chunk.candidates[0].content.parts[0].text).join('');
        }
    } catch (e) {
        // If parsing as array fails, assume it's a single JSON object string
    }

    // Clean the response: remove markdown and extract JSON
    const jsonMatch = combinedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`AI returned invalid JSON format. Raw response: ${combinedText}`);
    }
    let jsonString = jsonMatch[0];

    // Sanitize the JSON string:
    // AI models often incorrectly escape single quotes in JSON (e.g., L\'hôtel instead of L'hôtel), 
    // which throws a "Bad escaped character" SyntaxError in JSON.parse.
    jsonString = jsonString.replace(/\\'/g, "'");

    const parsedJson = JSON.parse(jsonString);
    return TranslateTourOutputSchema.parse(parsedJson);

  } catch (error: any) {
    console.error("[Vertex AI Error] Failed to generate content:", error);
    if (error instanceof z.ZodError) {
        const detailedError = `The AI's response did not match the expected format. Details: ${JSON.stringify(error.issues, null, 2)}. Raw AI Response: ${rawResponseText}`;
        throw new Error(detailedError);
    }
    if (error.message.includes("invalid JSON")) {
        throw new Error(`Vertex AI API call failed: AI returned invalid JSON format. Raw response: ${rawResponseText}`);
    }
    throw new Error(`Vertex AI API call failed: ${error.message}`);
  }
}
