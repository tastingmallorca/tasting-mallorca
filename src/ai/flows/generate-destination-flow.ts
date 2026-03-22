import { z } from 'zod';

export const GenerateDestinationInputSchema = z.object({
  name: z.string().describe("The name of the destination in Mallorca to generate content for."),
});
export type GenerateDestinationInput = z.infer<typeof GenerateDestinationInputSchema>;

const MultilingualStringSchema = z.object({
    en: z.string(),
    es: z.string(),
    de: z.string(),
    fr: z.string(),
    nl: z.string(),
});

const MultilingualArraySchema = z.object({
    en: z.array(z.string()),
    es: z.array(z.string()),
    de: z.array(z.string()),
    fr: z.array(z.string()),
    nl: z.array(z.string()),
});

export const GenerateDestinationOutputSchema = z.object({
  slug: MultilingualStringSchema,
  shortDescription: MultilingualStringSchema,
  longDescription: MultilingualStringSchema,
  seoTitle: MultilingualStringSchema,
  seoDescription: MultilingualStringSchema,
  searchTags: MultilingualArraySchema,
});

export type GenerateDestinationOutput = z.infer<typeof GenerateDestinationOutputSchema>;

function buildPrompt(input: GenerateDestinationInput): string {
    const outputSchemaForPrompt = {
        slug: { en: "string", es: "string", de: "string", fr: "string", nl: "string" },
        shortDescription: { en: "string", es: "string", de: "string", fr: "string", nl: "string" },
        longDescription: { en: "string", es: "string", de: "string", fr: "string", nl: "string" },
        seoTitle: { en: "string", es: "string", de: "string", fr: "string", nl: "string" },
        seoDescription: { en: "string", es: "string", de: "string", fr: "string", nl: "string" },
        searchTags: { en: ["string"], es: ["string"], de: ["string"], fr: ["string"], nl: ["string"] },
    };

    return `You are an expert travel writer and SEO specialist for "Tasting Mallorca", a local company offering authentic tours in Mallorca. 
    Your task is to automatically generate SEO-optimized and engaging multilingual content for a new Destination Landing Page based on its name.

    **Destination Name:** ${input.name}

    **CRITICAL INSTRUCTIONS:**
    1.  **Generate Comprehensive Content:** For the destination named above, output high-quality, descriptive text detailing its history, culture, and highlights.
        *   **slug:** URL friendly version of the destination (e.g. "arta", "ermita-de-bonany").
        *   **shortDescription:** 1-2 sentences summarizing the destination (great for cards).
        *   **longDescription:** A rich, multi-paragraph description.
        *   **seoTitle:** An optimized meta title (e.g., "Explore [Name] | Tasting Mallorca").
        *   **seoDescription:** An optimized meta description (150-160 chars).
        *   **searchTags:** An array of 5 to 10 keywords or related concepts (like region, nearby towns, key monuments) that will be used to automatically dynamically link this destination to matching Tours in our database.

    2.  **Translate to 5 Languages:** Provide ALL the above fields in English (en), Spanish (es), German (de), French (fr), and Dutch (nl). Ensure high-quality native phrasing.

    3.  **Format your response STRICTLY as a single JSON object.** Do not wrap it in markdown backticks (\`\`\`json) or any other text. The JSON object must conform to the schema provided below.

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
        if (done) break;
        result += decoder.decode(value, { stream: true });
    }
    return result;
}

export async function generateDestinationContent(input: GenerateDestinationInput): Promise<GenerateDestinationOutput> {
  const prompt = buildPrompt(input);
  const apiKey = process.env.VERTEX_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('VERTEX_AI_API_KEY environment variable is not set. Cannot run AI-First Generation.');
  }

  const endpoint = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:streamGenerateContent?key=${apiKey}`;
  let rawResponseText = '';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
        throw new Error(`Vertex AI API call failed with status ${response.status}: ${response.statusText}`);
    }

    rawResponseText = await getStreamingResponse(response);

    let combinedText = rawResponseText;
    try {
        const chunks = JSON.parse(rawResponseText);
        if (Array.isArray(chunks)) {
            combinedText = chunks.map((chunk: any) => chunk.candidates[0].content.parts[0].text).join('');
        }
    } catch (e) {}

    const jsonMatch = combinedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI returned invalid JSON format.");
    
    const parsedJson = JSON.parse(jsonMatch[0]);
    return GenerateDestinationOutputSchema.parse(parsedJson);

  } catch (error: any) {
    console.error("[Vertex AI Error] Failed to generate destination content:", error);
    throw new Error(`AI Generation failed: ${error.message}`);
  }
}
