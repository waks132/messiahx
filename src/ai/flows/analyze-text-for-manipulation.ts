
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
  language: z.string().default('fr').describe('The language of the text and for the response (e.g., "fr", "en").'),
});
export type AnalyzeTextInput = z.infer<typeof AnalyzeTextInputSchema>;

const AnalyzeTextOutputSchema = z.object({
  summary: z.string().describe('A neutral summary of the discursive elements found in the text.'),
  rhetoricalTechniques: z.array(z.string()).describe('A list of rhetorical techniques identified (e.g., metaphors, irony, hyperbole).'),
  cognitiveBiases: z.array(z.string()).describe('A list of potential cognitive biases suggested by the text (e.g., confirmation bias, anchoring).'),
  unverifiableFacts: z.array(z.string()).describe('A list of statements *presented as objective factual claims* but that are difficult or impossible to verify empirically, each with a brief justification. These must have the appearance of factuality, distinct from poetic expressions, opinions, or clearly subjective statements. Format: "Statement - Justification"'),
});
export type AnalyzeTextOutput = z.infer<typeof AnalyzeTextOutputSchema>;

export async function analyzeText(input: AnalyzeTextInput): Promise<AnalyzeTextOutput> {
  return analyzeTextFlow(input);
}

const analyzeTextPrompt = ai.definePrompt({
  name: 'analyzeTextPrompt',
  input: {schema: AnalyzeTextInputSchema},
  output: {schema: AnalyzeTextOutputSchema},
  prompt: `You are an expert in discourse analysis. Your task is to identify potential discursive elements in the provided text.
List them factually and neutrally. The context, intent, and manipulative intensity will be assessed in a subsequent step.
**REGARDLESS of the input text's language, YOUR ENTIRE RESPONSE, including all summaries, lists, and explanations, MUST be in {{language}}. This includes translating any technical terms or examples (e.g., 'confirmation bias' becomes 'biais de confirmation' if language is 'fr') found or used during your analysis.**

Text: {{{text}}}

Provide a comprehensive and detailed summary of your findings.
Also, provide structured lists for the following categories, ensuring each list is well-populated if elements are found and that explanations are substantial:
- rhetoricalTechniques: Identify various rhetorical techniques used (e.g., metaphors, irony, hyperbole, appeals to emotion, rhetorical questions, etc. - ensure these examples are also translated to {{language}} in your output if they are used as labels for categories). Provide substantial examples from the text for each identified technique.
- cognitiveBiases: Identify any potential cognitive biases suggested by the text or that the text might exploit in the reader (e.g., confirmation bias, anchoring, framing effect, availability heuristic - ensure these examples are also translated to {{language}} in your output if they are used as labels for categories). Explain briefly how each identified bias might manifest or be triggered by the text.
- unverifiableFacts: Identify statements *presented as objective factual claims* within the text that are inherently difficult or impossible to verify empirically by a typical reader. Apply critical thinking and nuance; avoid listing common knowledge, easily deducible statements, or clearly subjective opinions not disguised as objective fact. These must have the appearance of factuality and be distinct from poetic expressions, literary devices, opinions, clearly subjective statements, hyperbolic rhetorical flourishes, or common knowledge. Focus *only* on claims that, if taken literally as factual, would require external proof that is not provided and is hard to obtain. For each statement, provide the specific statement verbatim followed by a hyphen and a brief (1-sentence) justification of why it is considered unverifiable in this context. Example format (ensure this example's labels are also in {{language}} in your output): "Statement - Justification". If the text is purely poetic or artistic and contains no such claims, this list should be empty.

Ensure your output strictly matches the output schema: {summary: string, rhetoricalTechniques: string[], cognitiveBiases: string[], unverifiableFacts: string[]}.
IMPORTANT: Your response for all fields (summary, techniques, biases, facts) should be as long, detailed, comprehensive, and substantial as possible, exploring all facets of the request. Do not summarize or truncate your thoughts prematurely. Aim for maximum token utilization to provide the deepest possible analysis.`,
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
        summary: output?.summary || (input.language === 'fr' ? "Résumé de l'analyse non disponible." : "Analysis summary not available."),
        rhetoricalTechniques: output?.rhetoricalTechniques || [],
        cognitiveBiases: output?.cognitiveBiases || [],
        unverifiableFacts: output?.unverifiableFacts || [],
      };
    } catch (error) {
      console.error("Error in analyzeTextFlow:", error);
      const lang = input.language || 'fr';
      const errorMessage = lang === 'fr' ? "Échec de l'analyse initiale du discours." : "Failed to perform initial discourse analysis.";
      return {
        summary: errorMessage,
        rhetoricalTechniques: [],
        cognitiveBiases: [],
        unverifiableFacts: [],
      };
    }
  }
);
    
