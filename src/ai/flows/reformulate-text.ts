
'use server';
/**
 * @fileOverview A Genkit flow to reformulate text based on a specified style,
 * using dynamically selected prompts.
 *
 * - reformulateText - The main function to initiate the text reformulation flow.
 * - ReformulateTextInput - The input type for the reformulateText function.
 * - ReformulateTextOutput - The output type for the reformulateText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { PromptsData } from '@/app/config/prompts/page'; // Assuming type is in this path

// Define input and output schemas
const ReformulateTextInputSchema = z.object({
  text: z.string().describe('The text to reformulate.'),
  style: z.string().describe('The desired reformulation style (e.g., "neutral", "messianic", "paranoid", "analytical_rhetoric").'),
});
export type ReformulateTextInput = z.infer<typeof ReformulateTextInputSchema>;

const ReformulateTextOutputSchema = z.object({
  reformulatedText: z.string().describe('The reformulated text.'),
  styleUsed: z.string().describe('The style that was applied for reformulation.'),
});
export type ReformulateTextOutput = z.infer<typeof ReformulateTextOutputSchema>;

// Hardcoded prompts (ideally, these would be loaded dynamically from prompts.json)
// This is a simplified representation. In a real scenario, you'd fetch and parse prompts.json.
const reformulationPromptsConfig: PromptsData['reformulationPrompts'] = {
  neutral: {
    name: 'Neutral Reformulation',
    description: 'Reformulate text to be neutral and objective.',
    system_prompt_template: "Tu es un agent de désactivation cognitive. Ta mission est de reformuler un texte en supprimant toute charge émotionnelle, idéologique ou persuasive, tout en préservant le sens, les faits et la structure logique. Utilise un style factuel, journalistique et neutre. Fournis une réponse détaillée et complète.\n\nInstructions :\n- Supprime les modalisateurs affectifs ou subjectifs\n- Évite les jugements de valeur, les exagérations, les appels à l'émotion\n- Si ambiguïté ou opinion implicite : signaler \"[ambigü]\"\n\nFormat : texte reformulé uniquement, sans explication.",
    user_prompt_template: "Neutralise le texte suivant de manière exhaustive :\n{text}"
  },
  messianic: {
    name: 'Messianic Amplification',
    description: 'Amplify text with a prophetic and transformative tone.',
    system_prompt_template: "Tu es une voix visionnaire, porteuse d'un message qui transcende le quotidien. Reformule le texte en amplifiant sa dimension prophétique, inspirante et transformatrice, à la manière d'un manifeste pour un changement radical. Assure-toi que la reformulation soit riche et substantielle.\n\nLigne directrice :\n- Utilise des métaphores puissantes, des anaphores et une syntaxe rythmée\n- Mets en scène l'urgence, l'éveil, la métamorphose\n- Mobilise les archétypes collectifs (avenir, lumière, renaissance)\n\nFormat : texte reformulé uniquement, sans balises ni commentaire.",
    user_prompt_template: "Réécris ce message comme s'il annonçait un tournant majeur pour l'humanité, de façon complète et détaillée :\n{text}"
  },
  paranoid: {
    name: 'Paranoid Conspiracy',
    description: 'Reformulate text to imply hidden agendas and suspicion.',
    system_prompt_template: "Tu es un analyste sceptique à l'extrême. Reformule le texte en insinuant des intentions cachées, des mécanismes d'influence dissimulés, et un sentiment de surveillance diffuse. Utilise un ton soupçonneux, indirect, sans affirmer ni délirer. Produis un texte développé et détaillé.\n\nConsignes :\n- Privilégie les tournures comme \"certains pensent que…\", \"il semblerait que…\", \"selon des sources...\"\n- Évite les accusations directes\n- Crée un climat de doute mais sans rompre la crédibilité\n\nFormat : texte reformulé uniquement, dans un style sobre mais anxiogène et complet.",
    user_prompt_template: "Réécris ce texte comme s'il cachait un agenda secret ou une opération de contrôle, avec force détails :\n{text}"
  },
  analytical_rhetoric: {
    name: 'Rhetorical Analysis',
    description: 'Analyze text for rhetorical strategies.',
    system_prompt_template: "Tu es un analyste expert en rhétorique cognitive. Ton rôle est d'identifier dans un texte les figures de style, leviers émotionnels ou argumentatifs, et les stratégies d'influence implicites. Fournis une analyse détaillée et exhaustive.\n\nStructure de réponse attendue :\n\n| Stratégie | Extrait | Effet cognitif | Intention perçue |\n|-----------|---------|----------------|------------------|\n\nExemples de stratégies : appel à la peur, dichotomie, autorité, exagération, généralisation, analogie.\n\nAnalyse précise, pas d'interprétation morale.",
    user_prompt_template: "Fais une analyse rhétorique complète et détaillée du texte suivant :\n{text}"
  }
};

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
    const { text, style } = input;

    const selectedPrompts = reformulationPromptsConfig ? reformulationPromptsConfig[style] : undefined;

    if (!selectedPrompts || !selectedPrompts.system_prompt_template || !selectedPrompts.user_prompt_template) {
      console.error(`Reformulation style "${style}" not found or improperly configured.`);
      return {
        reformulatedText: `Error: Reformulation style "${style}" is not configured or prompts are missing. Please check prompts.json.`,
        styleUsed: style,
      };
    }

    try {
      const systemPrompt = selectedPrompts.system_prompt_template;
      const userPromptContent = selectedPrompts.user_prompt_template.replace('{text}', text);

      const result = await ai.generate({
        prompt: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPromptContent },
        ],
        // Add model and other configurations if needed
      });
      
      const reformulatedText = result.text;

      if (!reformulatedText) {
        throw new Error('LLM returned no text for reformulation.');
      }

      return {
        reformulatedText,
        styleUsed: style,
      };
    } catch (error: any) {
      console.error(`Error during reformulation for style "${style}":`, error);
      return {
        reformulatedText: `Failed to reformulate text with style "${style}": ${error.message}`,
        styleUsed: style,
      };
    }
  }
);
