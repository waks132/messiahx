
'use server';
/**
 * @fileOverview A Genkit flow for contextual research based on input text.
 *
 * - researchContextual - The main function to initiate the contextual research.
 * - ResearchContextualInput - The input type for the function.
 * - ResearchContextualOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { PromptsData } from '@/app/config/prompts/page'; 

// Hardcoded for now, align with public/prompts.json -> researchPrompts -> research
const researchContextualPromptTemplate: PromptsData['researchPrompts']['research']['prompt_template'] = 
  "Fais une recherche en ligne pour fournir un contexte au texte suivant : historique, politique, culturel ou scientifique.\n\nIndique :\n1. Sujet principal\n2. Tendances ou controverses actuelles liées\n3. Éléments de contexte pertinents pour en comprendre l'impact\n\nSois synthétique, précis, sourcé. Fournis une réponse détaillée, complète, substantielle et bien développée.";

const ResearchContextualInputSchema = z.object({
  text: z.string().describe('The text or topic to research contextually.'),
});
export type ResearchContextualInput = z.infer<typeof ResearchContextualInputSchema>;

const ResearchContextualOutputSchema = z.object({
  researchResult: z.string().describe('The detailed, comprehensive, and substantial contextual research result.'),
});
export type ResearchContextualOutput = z.infer<typeof ResearchContextualOutputSchema>;

export async function researchContextual(input: ResearchContextualInput): Promise<ResearchContextualOutput> {
  return researchContextualFlow(input);
}

const researchContextualFlow = ai.defineFlow(
  {
    name: 'researchContextualFlow',
    inputSchema: ResearchContextualInputSchema,
    outputSchema: ResearchContextualOutputSchema,
  },
  async (input) => {
    const { text } = input;

    if (!researchContextualPromptTemplate) {
      return { researchResult: 'Error: Contextual research prompt template is not configured.' };
    }

    const promptContent = researchContextualPromptTemplate.replace('{text}', text).replace('{query}', text);

    try {
      const result = await ai.generate({
        prompt: promptContent,
        output: { format: 'text' },
        config: { temperature: 0.5 }
      });
      
      const researchResult = result.text;
      if (!researchResult || researchResult.trim() === "") {
        return { researchResult: "The model did not provide a contextual research result." };
      }
      return { researchResult };
    } catch (error: any) {
      console.error('Error during contextual research:', error);
      return { researchResult: `Failed to perform contextual research: ${error.message}` };
    }
  }
);

    