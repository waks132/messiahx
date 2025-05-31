
'use server';
/**
 * @fileOverview Analyzes text for rhetorical techniques, cognitive biases, and unverifiable facts.
 *
 * - analyzeText - A function that analyzes the text.
 * - AnalyzeTextInput - The input type for the analyzeText function.
 * - AnalyzeTextOutput - The return type for the analyzeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextInputSchema = z.object({
  text: z.string().describe('The text to analyze.'),
});
export type AnalyzeTextInput = z.infer<typeof AnalyzeTextInputSchema>;

const AnalyzeTextOutputSchema = z.object({
  summary: z.string().describe('A summary of the analysis.'),
  rhetoricalTechniques: z.array(z.string()).describe('A list of rhetorical techniques found in the text.'),
  cognitiveBiases: z.array(z.string()).describe('A list of cognitive biases found in the text.'),
  unverifiableFacts: z.array(z.string()).describe('A list of unverifiable facts found in the text.'),
});
export type AnalyzeTextOutput = z.infer<typeof AnalyzeTextOutputSchema>;

export async function analyzeText(input: AnalyzeTextInput): Promise<AnalyzeTextOutput> {
  return analyzeTextFlow(input);
}

const analyzeTextPrompt = ai.definePrompt({
  name: 'analyzeTextPrompt',
  input: {schema: AnalyzeTextInputSchema},
  output: {schema: AnalyzeTextOutputSchema},
  prompt: `You are an expert in discourse analysis. Your task is to identify rhetorical techniques, potential cognitive biases, and statements that may be difficult to verify in the provided text.
For each identified element, briefly describe it. Note that the presence of a technique does not automatically imply malicious manipulation, as context is key.
The subsequent analysis step will determine the context and the manipulative intensity of these elements.

Text: {{{text}}}

Provide a summary of your findings and a structured list of the rhetorical techniques, potential cognitive biases, and unverifiable statements.
Ensure your output strictly matches the output schema.
  `,
});

const analyzeTextFlow = ai.defineFlow(
  {
    name: 'analyzeTextFlow',
    inputSchema: AnalyzeTextInputSchema,
    outputSchema: AnalyzeTextOutputSchema,
  },
  async input => {
    const {output} = await analyzeTextPrompt(input);
    // Ensure all arrays are present in the output, even if empty
    return {
      summary: output?.summary || "Analysis could not generate a summary.",
      rhetoricalTechniques: output?.rhetoricalTechniques || [],
      cognitiveBiases: output?.cognitiveBiases || [],
      unverifiableFacts: output?.unverifiableFacts || [],
    };
  }
);
