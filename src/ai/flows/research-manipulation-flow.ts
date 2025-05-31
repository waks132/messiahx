
'use server';
/**
 * @fileOverview A Genkit flow for manipulation analysis research based on input text.
 *
 * - researchManipulation - The main function to initiate the manipulation research.
 * - ResearchManipulationInput - The input type for the function.
 * - ResearchManipulationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { PromptsData } from '@/app/config/prompts/page';

// Hardcoded for now, align with public/prompts.json -> researchPrompts -> manipulation
const researchManipulationPromptTemplate: PromptsData['researchPrompts']['manipulation']['prompt_template'] =
  "Recherche en ligne des éléments suggérant que le texte suivant pourrait manipuler ou orienter la perception du lecteur.\n\nCherche :\n- Contre-arguments ou faits contradictoires\n- Sources fiables qui remettent en question les affirmations\n- Cas similaires de rhétorique manipulatoire\n\nSynthétise les résultats en 3 points max, avec sources si possible. Fournis une réponse détaillée, complète, substantielle et bien développée.";

const ResearchManipulationInputSchema = z.object({
  text: z.string().describe('The text to research for manipulation insights.'),
});
export type ResearchManipulationInput = z.infer<typeof ResearchManipulationInputSchema>;

const ResearchManipulationOutputSchema = z.object({
  manipulationInsights: z.string().describe('The detailed, comprehensive, and substantial manipulation research insights.'),
});
export type ResearchManipulationOutput = z.infer<typeof ResearchManipulationOutputSchema>;

export async function researchManipulation(input: ResearchManipulationInput): Promise<ResearchManipulationOutput> {
  return researchManipulationFlow(input);
}

const researchManipulationFlow = ai.defineFlow(
  {
    name: 'researchManipulationFlow',
    inputSchema: ResearchManipulationInputSchema,
    outputSchema: ResearchManipulationOutputSchema,
  },
  async (input) => {
    const { text } = input;

    if (!researchManipulationPromptTemplate) {
        return { manipulationInsights: 'Error: Manipulation research prompt template is not configured.' };
    }
    
    const promptContent = researchManipulationPromptTemplate.replace('{text}', text).replace('{query}', text);

    try {
      const result = await ai.generate({
        prompt: promptContent,
        output: { format: 'text' },
        config: { temperature: 0.5 }
      });
      
      const manipulationInsights = result.text;
      if (!manipulationInsights || manipulationInsights.trim() === "") {
        return { manipulationInsights: "The model did not provide manipulation research insights." };
      }
      return { manipulationInsights };
    } catch (error: any) {
      console.error('Error during manipulation research:', error);
      return { manipulationInsights: `Failed to perform manipulation research: ${error.message}` };
    }
  }
);

    