
'use server';
/**
 * @fileOverview Classifies detected manipulative elements into cognitive categories with intensity,
 * and provides an overall content type classification.
 *
 * - classifyCognitiveCategories - A function that performs the classification.
 * - ClassifyCognitiveCategoriesInput - The input type for the function.
 * - ClassifyCognitiveCategoriesOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { AnalyzeTextOutput } from './analyze-text-for-manipulation'; // Assuming AnalyzeTextOutput is in the same dir or adjust path

const ClassifiedCategorySchema = z.object({
  categoryName: z.string().describe('The name of the cognitive category detected (e.g., authority fallacy, appeal to fear, confirmation bias).'),
  intensity: z.number().min(0).max(10).describe('The intensity of this category in the text on a scale of 0 (not present/very weak) to 10 (very strong/dominant).'),
  description: z.string().describe('A brief explanation (1-2 sentences) of why this category was identified and its manifestation in the provided text elements.'),
});

const ContentTypeClassificationSchema = z.object({
  type: z.enum(['conspiracy', 'literary', 'neutral', 'promotional', 'opinion', 'news_report', 'other']).describe('The overall detected primary type of the content.'),
  score: z.number().min(0).max(100).describe('A score (0-100) related to the detected type. For conspiracy: risk/intensity. For literary: rhetorical richness. For neutral: objectivity level.'),
  reasoning: z.string().describe('Brief reasoning for this overall content classification (2-3 sentences).'),
});

const ClassifyCognitiveCategoriesInputSchema = z.object({
  analysisSummary: z.string().describe("The summary from the initial text analysis."),
  manipulativeTechniques: z.array(z.string()).describe('List of manipulative techniques found.'),
  cognitiveBiases: z.array(z.string()).describe('List of cognitive biases found.'),
  unverifiableFacts: z.array(z.string()).describe('List of unverifiable facts found.'),
  originalText: z.string().describe('The original text submitted for analysis, for context.'),
});
export type ClassifyCognitiveCategoriesInput = z.infer<typeof ClassifyCognitiveCategoriesInputSchema>;


const ClassifyCognitiveCategoriesOutputSchema = z.object({
  classifiedCategories: z.array(ClassifiedCategorySchema).describe('A list of cognitive categories identified, their intensities, and descriptions.'),
  overallClassification: ContentTypeClassificationSchema.describe('The overall classification of the content based on the detected categories and their intensities.'),
});
export type ClassifyCognitiveCategoriesOutput = z.infer<typeof ClassifyCognitiveCategoriesOutputSchema>;

export async function classifyCognitiveCategories(input: ClassifyCognitiveCategoriesInput): Promise<ClassifyCognitiveCategoriesOutput> {
  return classifyCognitiveCategoriesFlow(input);
}

const classifyCognitiveCategoriesPrompt = ai.definePrompt({
  name: 'classifyCognitiveCategoriesPrompt',
  input: {schema: ClassifyCognitiveCategoriesInputSchema},
  output: {schema: ClassifyCognitiveCategoriesOutputSchema},
  prompt: `You are an expert in cognitive science, rhetoric, and content analysis.
  Given the following elements detected in a text (summary, manipulative techniques, cognitive biases, unverifiable facts) and the original text itself, your task is to:
  1. Identify and classify specific cognitive categories (e.g., fallacies like 'straw man', 'ad hominem'; biases like 'confirmation bias', 'availability heuristic'; rhetorical devices like 'appeal to emotion', 'loaded language').
  2. For each identified category, provide an intensity score from 0 (not present/very weak) to 10 (very strong/dominant in the text).
  3. Provide a brief description (1-2 sentences) explaining its manifestation based on the provided detected elements and original text.
  4. Perform an overall classification of the content's primary type. Choose from: 'conspiracy', 'literary', 'neutral', 'promotional', 'opinion', 'news_report', 'other'.
  5. Provide a score (0-100) relevant to this classification (e.g., for 'conspiracy', this is a risk/intensity score like 65+; for 'literary', this could be a rhetorical richness score like 25-30%; for 'neutral', an objectivity score where higher is more neutral).
  6. Provide a brief reasoning (2-3 sentences) for the overall classification and score, considering the detected elements and their intensities.

  Input from previous analysis:
  Summary: {{{analysisSummary}}}
  Manipulative Techniques: {{#if manipulativeTechniques}}<ul>{{#each manipulativeTechniques}}<li>{{{this}}}</li>{{/each}}</ul>{{else}}None identified.{{/if}}
  Cognitive Biases: {{#if cognitiveBiases}}<ul>{{#each cognitiveBiases}}<li>{{{this}}}</li>{{/each}}</ul>{{else}}None identified.{{/if}}
  Unverifiable Facts: {{#if unverifiableFacts}}<ul>{{#each unverifiableFacts}}<li>{{{this}}}</li>{{/each}}</ul>{{else}}None identified.{{/if}}

  Original Text for context:
  {{{originalText}}}

  Base your classification and intensity scores on the prevalence and impact of the identified elements within the original text.
  Ensure your output strictly adheres to the defined JSON schema for classifiedCategories and overallClassification.
  For overall classification scores, aim for these general guidelines if applicable:
  - Conspiracy content: ~65%+
  - Literary content (focusing on legitimate rhetoric): ~25-30%
  - Neutral content: Lower scores, indicating baseline or objectivity.
  `,
});

const classifyCognitiveCategoriesFlow = ai.defineFlow(
  {
    name: 'classifyCognitiveCategoriesFlow',
    inputSchema: ClassifyCognitiveCategoriesInputSchema,
    outputSchema: ClassifyCognitiveCategoriesOutputSchema,
  },
  async (input) => {
    const {output} = await classifyCognitiveCategoriesPrompt(input);
    if (!output) {
      throw new Error('Cognitive classification failed to produce an output.');
    }
    // Ensure the output structure matches, especially if the LLM might sometimes omit an empty array
    return {
      classifiedCategories: output.classifiedCategories || [],
      overallClassification: output.overallClassification
    };
  }
);

