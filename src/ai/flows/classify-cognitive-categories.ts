
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

const ClassifiedCategorySchema = z.object({
  categoryName: z.string().describe('The name of the cognitive category detected (e.g., Emotional, Authority, Logical Fallacy, Social Pressure, Information Bias, or other relevant fallacy/bias/rhetorical device).'),
  intensity: z.number().min(0).max(10).describe('The intensity of this category in the text on a scale of 0 (not present/very weak) to 10 (very strong/dominant).'),
  description: z.string().describe('A brief explanation (1-2 sentences) of why this category was identified, its manifestation in the text, and how the overall text context influenced its perceived intensity.'),
});

const ContentTypeClassificationSchema = z.object({
  type: z.enum(['conspiracy', 'literary', 'neutral', 'promotional', 'opinion', 'news_report', 'political_discourse', 'other']).describe('The overall detected primary type of the content based on its style, purpose, and characteristics.'),
  score: z.number().min(0).max(100).describe('A score (0-100) reflecting the confidence or dominance of the detected content type. For conspiracy: risk/intensity (e.g., 65+). For literary: rhetorical richness (e.g., 25-45%). For neutral: objectivity level. For political discourse: persuasive intent level.'),
  reasoning: z.string().describe('Brief reasoning for this overall content classification (2-3 sentences), highlighting key indicators.'),
});

const ClassifyCognitiveCategoriesInputSchema = z.object({
  analysisSummary: z.string().describe("The summary from the initial text analysis."),
  rhetoricalTechniques: z.array(z.string()).describe('List of rhetorical techniques found.'),
  cognitiveBiases: z.array(z.string()).describe('List of cognitive biases found.'),
  unverifiableFacts: z.array(z.string()).describe('List of unverifiable facts found.'),
  originalText: z.string().describe('The original text submitted for analysis, for context.'),
});
export type ClassifyCognitiveCategoriesInput = z.infer<typeof ClassifyCognitiveCategoriesInputSchema>;


const ClassifyCognitiveCategoriesOutputSchema = z.object({
  classifiedCategories: z.array(ClassifiedCategorySchema).describe('A list of cognitive categories identified, their intensities, and descriptions. This should include assessments for Emotional, Authority, Logical Fallacy, Social Pressure, and Information Bias triggers, plus any other relevant categories identified.'),
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
  Given the following elements detected in a text (summary, rhetorical techniques, cognitive biases, unverifiable facts) and the original text itself, your task is to:

  1.  **Overall Content Classification**:
      a.  Determine the primary **type** of the content from: 'conspiracy', 'literary', 'neutral', 'promotional', 'opinion', 'news_report', 'political_discourse', 'other'. Consider the specific nuances: 'literary' for artistic texts (poetry, high rhetoric), 'political_discourse' for speeches by public figures that may use persuasion without being outright conspiracy, and 'conspiracy' for texts aiming to promote unsubstantiated theories with high emotional load.
      b.  Assign a **score** (0-100) reflecting the strength/confidence of this classification. Guidelines:
          *   'conspiracy': High scores (e.g., 65-100) indicate strong presence.
          *   'literary': Moderate scores (e.g., 20-50%) for rich rhetorical content that is not primarily manipulative.
          *   'political_discourse': Scores can vary (e.g., 30-70%) depending on persuasive intensity, but distinct from 'conspiracy'.
          *   'neutral': Higher scores indicate greater objectivity.
      c.  Provide a brief **reasoning** for this classification (2-3 sentences), highlighting key indicators in the original text and the provided analysis elements.

  2.  **Specific Cognitive Trigger Analysis**:
      a.  For each of the following core cognitive triggers: **Emotional, Authority, Logical Fallacy, Social Pressure, Information Bias**:
          i.  Determine its **intensity** in the text (0 for not present/very weak, 10 for very dominant).
          ii. Provide a **description** explaining its manifestation AND **explicitly state how the overall content type (determined in step 1) influenced your intensity rating for this specific trigger.** For example, "The literary context means the appeal to authority here is more about establishing ethos (intensity 4/10) rather than a manipulative fallacy." or "The conspiracy context amplifies the perceived intensity of emotional appeals (intensity 8/10)." or "In this political discourse, the appeal to authority is moderate (intensity 5/10) aimed at persuasion rather than deception."
      b.  Identify any **other relevant cognitive categories** (specific fallacies, biases, rhetorical devices not covered above), their intensities, and descriptions influenced by context.

  Input from previous analysis:
  Summary: {{{analysisSummary}}}
  Rhetorical Techniques: {{#if rhetoricalTechniques}}<ul>{{#each rhetoricalTechniques}}<li>{{{this}}}</li>{{/each}}</ul>{{else}}None identified.{{/if}}
  Cognitive Biases: {{#if cognitiveBiases}}<ul>{{#each cognitiveBiases}}<li>{{{this}}}</li>{{/each}}</ul>{{else}}None identified.{{/if}}
  Unverifiable Facts: {{#if unverifiableFacts}}<ul>{{#each unverifiableFacts}}<li>{{{this}}}</li>{{/each}}</ul>{{else}}None identified.{{/if}}

  Original Text for context:
  {{{originalText}}}

  Base your classification and intensity scores on the prevalence and impact of the identified elements within the original text, considering the overall context.
  Ensure your output strictly adheres to the defined JSON schema for classifiedCategories and overallClassification.
  The 'classifiedCategories' array should prominently feature entries for Emotional, Authority, Logical Fallacy, Social Pressure, and Information Bias.
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
    // Ensure the output structure matches, especially if the LLM might sometimes omit an empty array for classifiedCategories
    // or if overallClassification is missing.
    return {
      classifiedCategories: output.classifiedCategories || [],
      overallClassification: output.overallClassification || { type: 'other', score: 0, reasoning: 'Overall classification data was not provided by the model.' }
    };
  }
);
