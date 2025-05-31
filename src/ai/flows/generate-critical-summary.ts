
'use server';

/**
 * @fileOverview A flow to generate a critical summary of the analyzed text, highlighting fallacies and biases.
 *
 * - generateCriticalSummary - A function that generates the critical summary.
 * - GenerateCriticalSummaryInput - The input type for the generateCriticalSummary function.
 * - GenerateCriticalSummaryOutput - The return type for the generateCriticalSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCriticalSummaryInputSchema = z.object({
  analyzedText: z
    .string()
    .describe("The analyzed text to generate a critical summary from."),
  analysisStyle: z
    .string()
    .default('academic')
    .describe("The style of the critical summary (e.g., academic, journalistic, sarcastic)."),
  language: z.string().default('fr').describe('The language for the response (e.g., "fr", "en").'),
});
export type GenerateCriticalSummaryInput = z.infer<typeof GenerateCriticalSummaryInputSchema>;

const GenerateCriticalSummaryOutputSchema = z.object({
  summary: z.string().describe('The detailed and substantial critical summary of the analyzed text.'),
});
export type GenerateCriticalSummaryOutput = z.infer<typeof GenerateCriticalSummaryOutputSchema>;

export async function generateCriticalSummary(
  input: GenerateCriticalSummaryInput
): Promise<GenerateCriticalSummaryOutput> {
  return generateCriticalSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCriticalSummaryPrompt',
  input: {schema: GenerateCriticalSummaryInputSchema},
  output: {schema: GenerateCriticalSummaryOutputSchema},
  prompt: `You are an expert at critically analyzing text and identifying fallacies and biases.
  Your response should be in {{language}}.

  Based on the analyzed text provided, generate a comprehensive, detailed, and substantial critical summary highlighting the presence of fallacies, cognitive biases, and manipulation techniques.
  The summary should be in a {{analysisStyle}} style.

  Analyzed Text: {{{analyzedText}}}

  IMPORTANT: Your summary should be as long, detailed, comprehensive, and substantial as possible, exploring all facets of the request. Do not summarize or truncate your thoughts prematurely. Aim for maximum token utilization to provide the deepest possible analysis.
  Please ensure your summary is thorough, well-explained, substantial, and detailed, providing significant insights.
  `,
});

const generateCriticalSummaryFlow = ai.defineFlow(
  {
    name: 'generateCriticalSummaryFlow',
    inputSchema: GenerateCriticalSummaryInputSchema,
    outputSchema: GenerateCriticalSummaryOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        return output!;
    } catch (error) {
        console.error("Error in generateCriticalSummaryFlow:", error);
        const lang = input.language || 'fr';
        const errorMessage = lang === 'fr' 
            ? "Échec de la génération du résumé critique." 
            : "Failed to generate critical summary.";
        return { summary: errorMessage };
    }
  }
);
    
