
'use server';
/**
 * @fileOverview A Genkit flow to reformulate text based on a specified style,
 * using dynamically selected prompts. Ensures detailed and substantial responses.
 * Prompts are fetched from Firebase Remote Config with local fallbacks.
 *
 * - reformulateText - The main function to initiate the text reformulation flow.
 * - ReformulateTextInput - The input type for the reformulateText function.
 * - ReformulateTextOutput - The output type for the reformulateText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getReformulationPromptsForStyle } from '@/services/prompt-config-service';

const ReformulateTextInputSchema = z.object({
  text: z.string().describe('The text to reformulate.'),
  style: z.string().describe('The desired reformulation style (e.g., "neutral", "messianic", "paranoid", "analytical_rhetoric", "simplified_eli5", "poetic_metaphoric", "technical_detailed").'),
  language: z.string().default('fr').describe('The language for the response (e.g., "fr", "en").'),
});
export type ReformulateTextInput = z.infer<typeof ReformulateTextInputSchema>;

const ReformulateTextOutputSchema = z.object({
  reformulatedText: z.string().describe('The reformulated text, which should be comprehensive, detailed, and substantial.'),
  styleUsed: z.string().describe('The style that was applied for reformulation.'),
});
export type ReformulateTextOutput = z.infer<typeof ReformulateTextOutputSchema>;

const MAX_TEXT_LENGTH = 100000; 

export async function reformulateText(input: ReformulateTextInput): Promise<ReformulateTextOutput> {
  return reformulateTextFlow(input);
}

const reformulateTextFlow = ai.defineFlow(
  {
    name: 'reformulateTextFlow',
    inputSchema: ReformulateTextInputSchema,
    outputSchema: ReformulateTextOutputSchema,
  },
  async (input) => {
    const { text, style, language } = input;

    if (text.length > MAX_TEXT_LENGTH) {
      console.warn(`Reformulation input text too long: ${text.length} characters. Max: ${MAX_TEXT_LENGTH}`);
      const errorMsg = language === 'fr' 
        ? `Erreur : Le texte d'entrée est trop long (${text.length} caractères). Le maximum autorisé est de ${MAX_TEXT_LENGTH} caractères.`
        : `Error: Input text is too long (${text.length} chars). Maximum allowed is ${MAX_TEXT_LENGTH} characters.`;
      return {
        reformulatedText: errorMsg,
        styleUsed: style,
      };
    }

    let systemPromptContent = "";
    let userPromptContent = "";

    try {
      const prompts = await getReformulationPromptsForStyle(style);
      if (!prompts || !prompts.system_prompt_template || !prompts.user_prompt_template) {
        throw new Error(`Prompts for style "${style}" not found or improperly configured.`);
      }
      systemPromptContent = prompts.system_prompt_template.replace('{{language}}', language);
      userPromptContent = prompts.user_prompt_template.replace('{text}', text);
    } catch (fetchError: any) {
      console.error(`Error fetching prompts for style "${style}":`, fetchError);
      const errorMsg = language === 'fr'
        ? `Erreur de configuration des prompts pour le style "${style}": ${fetchError.message}.`
        : `Prompt configuration error for style "${style}": ${fetchError.message}.`;
      return {
        reformulatedText: errorMsg,
        styleUsed: style,
      };
    }
      
    console.log(`Reformulating text for style "${style}" in language "${language}". User prompt length: ${userPromptContent.length}. System prompt length: ${systemPromptContent.length}`);
    console.log(`User prompt content (first 200 chars): ${userPromptContent.substring(0,200)}...`);
    console.log(`System prompt content (first 200 chars): ${systemPromptContent.substring(0,200)}...`);

    try {
      const {text: reformulatedTextResult} = await ai.generate({
        prompt: [{text: userPromptContent}],
        systemInstruction: [{text: systemPromptContent}],
        output: {format: 'text'},
        config: {temperature: 0.7}
      });
      
      const reformulatedText = reformulatedTextResult;

      if (!reformulatedText || reformulatedText.trim() === "") {
        console.warn(`LLM returned empty or no text for reformulation style "${style}", lang "${language}". Input text length: ${text.length}`);
        const errorMsg = language === 'fr'
            ? `Le modèle n'a pas fourni de reformulation pour le style "${style}".`
            : `The model did not provide a reformulation for the style "${style}".`;
        return {
          reformulatedText: errorMsg,
          styleUsed: style,
        };
      }

      return {
        reformulatedText,
        styleUsed: style,
      };
    } catch (error: any) {
      console.error(`Error during reformulation for style "${style}", lang "${language}":`, error);
      let errorMessage = language === 'fr' ? "Erreur inconnue durant la reformulation." : "Unknown error during reformulation.";
      if (error instanceof Error) {
        errorMessage = error.message;
        if ((error as any).cause) {
          errorMessage += ` - Cause: ${JSON.stringify((error as any).cause)}`;
        } else if ((error as any).details) {
           errorMessage += ` - Details: ${JSON.stringify((error as any).details)}`;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.error(`Problematic input text for style "${style}", lang "${language}" (first 200 chars): ${text.substring(0,200)}...`);
      console.error(`Problematic system prompt for style "${style}", lang "${language}" (first 200 chars): ${systemPromptContent.substring(0,200)}...`);
      
      const finalErrorMsg = language === 'fr'
        ? `Échec de la reformulation du texte avec le style "${style}": ${errorMessage}.`
        : `Failed to reformulate text with style "${style}": ${errorMessage}.`;
      return {
        reformulatedText: finalErrorMsg,
        styleUsed: style,
      };
    }
  }
);
    
