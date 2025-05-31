
'use server';
/**
 * @fileOverview Identifie les éléments discursifs potentiels de manière neutre.
 * L'intention et l'intensité manipulative sont évaluées séparément.
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
  summary: z.string().describe('A neutral summary of the discursive elements found in the text.'),
  rhetoricalTechniques: z.array(z.string()).describe('A list of rhetorical techniques identified (e.g., metaphors, irony, hyperbole).'),
  cognitiveBiases: z.array(z.string()).describe('A list of potential cognitive biases suggested by the text (e.g., confirmation bias, anchoring).'),
  unverifiableFacts: z.array(z.string()).describe('A list of statements presented as facts but potentially difficult to verify.'),
});
export type AnalyzeTextOutput = z.infer<typeof AnalyzeTextOutputSchema>;

export async function analyzeText(input: AnalyzeTextInput): Promise<AnalyzeTextOutput> {
  return analyzeTextFlow(input);
}

const analyzeTextPrompt = ai.definePrompt({
  name: 'analyzeTextPrompt',
  input: {schema: AnalyzeTextInputSchema},
  output: {schema: AnalyzeTextOutputSchema},
  prompt: `You are an expert in discourse analysis. Your task is to identify potential rhetorical techniques, cognitive biases, and statements that may be difficult to verify in the provided text. 
List them factually and neutrally. The context, intent, and manipulative intensity will be assessed in a subsequent step.

Text: {{{text}}}

Provide a summary of your findings and a structured list of the rhetorical techniques, potential cognitive biases, and unverifiable statements.
Ensure your output strictly matches the output schema: {summary: string, rhetoricalTechniques: string[], cognitiveBiases: string[], unverifiableFacts: string[]}.`,
});

const analyzeTextFlow = ai.defineFlow(
  {
    name: 'analyzeTextFlow',
    inputSchema: AnalyzeTextInputSchema,
    outputSchema: AnalyzeTextOutputSchema,
  },
  async input => {
    try {
      const {output} = await analyzeTextPrompt(input);
      return {
        summary: output?.summary || "No summary could be generated for the discursive elements.",
        rhetoricalTechniques: output?.rhetoricalTechniques || [],
        cognitiveBiases: output?.cognitiveBiases || [],
        unverifiableFacts: output?.unverifiableFacts || [],
      };
    } catch (error) {
      console.error("Error in analyzeTextFlow:", error);
      return {
        summary: "Failed to perform initial discourse analysis.",
        rhetoricalTechniques: [],
        cognitiveBiases: [],
        unverifiableFacts: [],
      };
    }
  }
);
