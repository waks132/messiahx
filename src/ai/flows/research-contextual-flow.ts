
'use server';
/**
 * @fileOverview A Genkit flow for contextual research based on input text or topic.
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
  "Given the input: '{input_text}'. If this input is a short topic or keyword, provide a general contextual overview (historical, political, cultural, scientific). If the input is a longer text, analyze that specific text for its context and provide a summary of this contextual analysis. In either case, indicate: 1. Main subject. 2. Current trends or controversies. 3. Relevant contextual elements to understand its impact. Be concise, precise, and if possible, mention sources. Provide a detailed, comprehensive, substantial, and well-developed response.";

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
      return { researchResult: 'Error: Contextual research prompt template is not configured. Veuillez fournir une réponse détaillée, complète, substantielle et bien développée.' };
    }

    // Replace a generic placeholder in the template with the actual input text
    const promptContent = researchContextualPromptTemplate.replace('{input_text}', text);

    try {
      const result = await ai.generate({
        prompt: promptContent,
        output: { format: 'text' },
        config: { temperature: 0.5 }
      });
      
      const researchResult = result.text;
      if (!researchResult || researchResult.trim() === "") {
        return { researchResult: "The model did not provide a contextual research result. Veuillez fournir une réponse détaillée, complète, substantielle et bien développée." };
      }
      return { researchResult };
    } catch (error: any) {
      console.error('Error during contextual research:', error);
      return { researchResult: `Failed to perform contextual research: ${error.message}. Veuillez fournir une réponse détaillée, complète, substantielle et bien développée.` };
    }
  }
);
    
