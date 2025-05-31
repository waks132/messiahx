
'use server';
/**
 * @fileOverview Classifies detected manipulative elements into cognitive categories with intensity,
 * and provides an overall content type classification, explicitly considering how context influences intensity.
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
  description: z.string().describe('A comprehensive and detailed explanation (at least 2-3 well-developed sentences) of why this category was identified, its manifestation in the text, AND how the overall content type classification influenced its perceived intensity.'),
});

const ContentTypeClassificationSchema = z.object({
  type: z.enum(['conspiracy', 'literary', 'neutral', 'promotional', 'opinion', 'news_report', 'political_discourse', 'other']).describe('The overall detected primary type of the content based on its style, purpose, and characteristics.'),
  score: z.number().min(0).max(100).describe('A score (0-100) reflecting the confidence or dominance of the detected content type. For conspiracy: risk/intensity (e.g., 65+). For literary: rhetorical richness (e.g., 25-45%). For neutral: objectivity level. For political discourse: persuasive intent level.'),
  reasoning: z.string().describe('Comprehensive and detailed reasoning for this overall content classification (at least 3-4 sentences), highlighting key indicators from the original text and the initial analysis elements.'),
});

const ClassifyCognitiveCategoriesInputSchema = z.object({
  analysisSummary: z.string().describe("The summary from the initial text analysis."),
  rhetoricalTechniques: z.array(z.string()).describe('List of rhetorical techniques found.'),
  cognitiveBiases: z.array(z.string()).describe('List of cognitive biases found.'),
  unverifiableFacts: z.array(z.string()).describe('List of unverifiable facts found.'),
  originalText: z.string().describe('The original text submitted for analysis, used for contextual understanding.'),
  language: z.string().default('fr').describe('The language for the response (e.g., "fr", "en"). Consider this for cultural nuances in analysis if possible.'),
});
export type ClassifyCognitiveCategoriesInput = z.infer<typeof ClassifyCognitiveCategoriesInputSchema>;


const ClassifyCognitiveCategoriesOutputSchema = z.object({
  classifiedCategories: z.array(ClassifiedCategorySchema).describe('A comprehensive and detailed list of cognitive categories identified, their intensities, and detailed descriptions. This should prominently feature assessments for Emotional, Authority, Logical Fallacy, Social Pressure, and Information Bias triggers, plus any other relevant categories identified. Each description MUST explain how the overall content type influenced its intensity rating.'),
  overallClassification: ContentTypeClassificationSchema.describe('The overall classification of the content based on the detected categories and their intensities, with detailed reasoning and explanation.'),
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
  Your response should be in {{language}}. When performing the analysis, consider the cultural and linguistic context associated with the {{language}} language.
  Given the following elements detected in a text (summary of discursive elements, rhetorical techniques, cognitive biases, unverifiable facts) and the original text itself, your task is to provide a thorough and detailed analysis:

  1.  **Overall Content Classification**:
      a.  Carefully analyze the original text and the provided discursive elements. Determine the primary **type** of the content from: 'conspiracy', 'literary', 'neutral', 'promotional', 'opinion', 'news_report', 'political_discourse', 'other'.
          *   'literary' is for artistic texts (poetry, high rhetoric).
          *   'political_discourse' is for speeches by public figures or texts with clear persuasive intent within a political context.
          *   'conspiracy' is for texts aiming to promote unsubstantiated theories with high emotional load and often targeting specific groups or entities.
          *   'news_report' should be relatively objective.
          *   'opinion' expresses a viewpoint but may not be as structured as political discourse.
          *   'promotional' aims to sell or advocate for something.
          *   'neutral' is factual and lacks significant persuasive or emotional elements.
      b.  Assign a **score** (0-100) reflecting the strength/confidence of this classification. Guidelines:
          *   'conspiracy': High scores (e.g., 65-100) indicate strong presence.
          *   'literary': Moderate scores (e.g., 20-50%) for rich rhetorical content that is not primarily manipulative.
          *   'political_discourse': Scores can vary (e.g., 30-80%) depending on persuasive intensity and clarity of agenda.
      c.  Provide a **comprehensive and detailed reasoning** for this classification (at least 3-4 well-developed sentences), highlighting key indicators in the original text and the provided analysis elements.

  2.  **Specific Cognitive Trigger Analysis**:
      a.  Based on the **Overall Content Classification** from step 1, analyze the following core cognitive triggers: **Emotional, Authority, Logical Fallacy, Social Pressure, Information Bias**.
      b.  For each of these five core triggers:
          i.  Determine its **intensity** in the text (0 for not present/very weak, 10 for very dominant).
          ii. Provide a **detailed and comprehensive description** (at least 2-3 well-developed sentences) explaining its manifestation AND **explicitly state how the overall content type (determined in step 1) influenced your intensity rating for this specific trigger.** For example: "The 'conspiracy' context significantly amplifies the perceived intensity of emotional appeals (fear, anger), leading to an intensity of 8/10." OR "In this 'literary' text, the appeal to authority serves to establish poetic voice rather than to manipulate, resulting in an intensity of 3/10." OR "For 'political_discourse', the use of logical fallacies might be a deliberate persuasive tactic, rated at 7/10 intensity."
      c.  If relevant, identify any **other specific cognitive categories** (e.g., specific named fallacies like 'Ad Hominem', specific biases like 'Confirmation Bias') that are particularly salient, their intensities, and detailed descriptions, also explaining the influence of the overall content type. Ensure these descriptions are also comprehensive.

  Input from previous analysis:
  Summary of Discursive Elements: {{{analysisSummary}}}
  Rhetorical Techniques: {{#if rhetoricalTechniques}}<ul>{{#each rhetoricalTechniques}}<li>{{{this}}}</li>{{/each}}</ul>{{else}}None identified.{{/if}}
  Cognitive Biases: {{#if cognitiveBiases}}<ul>{{#each cognitiveBiases}}<li>{{{this}}}</li>{{/each}}</ul>{{else}}None identified.{{/if}}
  Unverifiable Facts: {{#if unverifiableFacts}}<ul>{{#each unverifiableFacts}}<li>{{{this}}}</li>{{/each}}</ul>{{else}}None identified.{{/if}}

  Original Text for full contextual understanding:
  {{{originalText}}}

  Base your classification and intensity scores on the prevalence and impact of the identified elements within the original text, critically considering the overall context type you determined.
  Ensure your output strictly adheres to the defined JSON schema for classifiedCategories and overallClassification.
  The 'classifiedCategories' array MUST prominently feature entries for Emotional, Authority, Logical Fallacy, Social Pressure, and Information Bias, each with a context-aware and detailed description.
  
  IMPORTANT: Your response for all fields (overall classification, classified categories, descriptions) should be as long, detailed, comprehensive, and substantial as possible, exploring all facets of the request. Do not summarize or truncate your thoughts prematurely. Aim for maximum token utilization to provide the deepest possible analysis.
  `,
});

const classifyCognitiveCategoriesFlow = ai.defineFlow(
  {
    name: 'classifyCognitiveCategoriesFlow',
    inputSchema: ClassifyCognitiveCategoriesInputSchema,
    outputSchema: ClassifyCognitiveCategoriesOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await classifyCognitiveCategoriesPrompt(input);
      if (!output) {
        throw new Error('Cognitive classification LLM call returned no output.');
      }
      return {
        classifiedCategories: output.classifiedCategories || [],
        overallClassification: output.overallClassification || { type: 'other', score: 0, reasoning: 'Overall classification data was not provided by the model.' }
      };
    } catch (error) {
       console.error("Error in classifyCognitiveCategoriesFlow:", error);
       const lang = input.language || 'fr';
       const reasoningMessage = lang === 'fr' 
         ? `Échec de la classification des catégories cognitives: ${error instanceof Error ? error.message : String(error)}`
         : `Failed to classify cognitive categories: ${error instanceof Error ? error.message : String(error)}`;
       return {
         classifiedCategories: [],
         overallClassification: { type: 'other', score: 0, reasoning: reasoningMessage }
       };
    }
  }
);
    
