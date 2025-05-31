'use server';
/**
 * @fileOverview Analyzes text for manipulative techniques, cognitive biases, and unverifiable facts.
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
  manipulativeTechniques: z.array(z.string()).describe('A list of manipulative techniques found in the text.'),
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
  prompt: `You are an expert in analyzing text for manipulative techniques, cognitive biases, and unverifiable facts.

  Analyze the following text and identify any manipulative techniques, cognitive biases, and unverifiable facts.

  Text: {{{text}}}

  Provide a summary of your analysis and a structured list of the manipulative techniques, cognitive biases, and unverifiable facts that you found.
  Make sure your answer matches the output schema exactly.
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
    return output!;
  }
);
