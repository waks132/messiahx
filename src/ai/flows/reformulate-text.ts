
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
// Assuming PromptsData and related types are correctly defined in this path based on previous setup
// For a production app, consider a more robust way to share types or load configs.
import type { PromptsData } from '@/app/config/prompts/page'; 

const ReformulateTextInputSchema = z.object({
  text: z.string().describe('The text to reformulate.'),
  style: z.string().describe('The desired reformulation style (e.g., "neutral", "messianic", "paranoid", "analytical_rhetoric").'),
});
export type ReformulateTextInput = z.infer<typeof ReformulateTextInputSchema>;

const ReformulateTextOutputSchema = z.object({
  reformulatedText: z.string().describe('The reformulated text, which should be comprehensive, detailed, and substantial.'),
  styleUsed: z.string().describe('The style that was applied for reformulation.'),
});
export type ReformulateTextOutput = z.infer<typeof ReformulateTextOutputSchema>;

// This configuration is hardcoded to match the structure in `public/prompts.json -> reformulationPrompts`.
// Ideally, this would be dynamically loaded if prompts could change server-side without redeploy.
const reformulationPromptsConfig: PromptsData['reformulationPrompts'] = {
  neutral: {
    name: 'Neutral Reformulation',
    description: 'Reformulate text to be neutral and objective.',
    system_prompt_template: "Tu es un agent de désactivation cognitive. Ta mission est de reformuler un texte en supprimant toute charge émotionnelle, idéologique ou persuasive, tout en préservant le sens, les faits et la structure logique. Utilise un style factuel, journalistique et neutre. Fournis une réponse détaillée, complète, substantielle et bien développée.\n\nInstructions :\n- Supprime les modalisateurs affectifs ou subjectifs\n- Évite les jugements de valeur, les exagérations, les appels à l'émotion\n- Si ambiguïté ou opinion implicite : signaler \"[ambigü]\"\n\nFormat : texte reformulé uniquement, sans explication.",
    user_prompt_template: "Neutralise le texte suivant de manière exhaustive, détaillée et approfondie :\n{text}"
  },
  messianic: {
    name: 'Messianic Amplification',
    description: 'Amplify text with a prophetic and transformative tone.',
    system_prompt_template: "Tu es une voix visionnaire, porteuse d'un message qui transcende le quotidien. Reformule le texte en amplifiant sa dimension prophétique, inspirante et transformatrice, à la manière d'un manifeste pour un changement radical. Assure-toi que la reformulation soit riche, substantielle, détaillée et d'une longueur significative.\n\nLigne directrice :\n- Utilise des métaphores puissantes, des anaphores et une syntaxe rythmée\n- Mets en scène l'urgence, l'éveil, la métamorphose\n- Mobilise les archétypes collectifs (avenir, lumière, renaissance)\n\nFormat : texte reformulé uniquement, sans balises ni commentaire.",
    user_prompt_template: "Réécris ce message comme s'il annonçait un tournant majeur pour l'humanité, de façon complète, détaillée, approfondie et substantielle :\n{text}"
  },
  paranoid: {
    name: 'Paranoid Conspiracy',
    description: 'Reformulate text to imply hidden agendas and suspicion.',
    system_prompt_template: "Tu es un analyste sceptique à l'extrême. Reformule le texte en insinuant des intentions cachées, des mécanismes d'influence dissimulés, et un sentiment de surveillance diffuse. Utilise un ton soupçonneux, indirect, sans affirmer ni délirer. Produis un texte développé, détaillé, substantiel et d'une longueur significative.\n\nConsignes :\n- Privilégie les tournures comme \"certains pensent que…\", \"il semblerait que…\", \"selon des sources...\"\n- Évite les accusations directes\n- Crée un climat de doute mais sans rompre la crédibilité\n\nFormat : texte reformulé uniquement, dans un style sobre mais anxiogène, complet, détaillé et approfondi.",
    user_prompt_template: "Réécris ce texte comme s'il cachait un agenda secret ou une opération de contrôle, avec force détails, une analyse approfondie et un développement substantiel :\n{text}"
  },
  analytical_rhetoric: {
    name: 'Rhetorical Analysis',
    description: 'Analyze text for rhetorical strategies.',
    system_prompt_template: "Tu es un analyste expert en rhétorique cognitive. Ton rôle est d'identifier dans un texte les figures de style, leviers émotionnels ou argumentatifs, et les stratégies d'influence implicites. Fournis une analyse détaillée, exhaustive, bien structurée et d'une longueur conséquente.\n\nStructure de réponse attendue :\n\n| Stratégie | Extrait | Effet cognitif | Intention perçue |\n|-----------|---------|----------------|------------------|\n\nExemples de stratégies : appel à la peur, dichotomie, autorité, exagération, généralisation, analogie.\n\nAnalyse précise, pas d'interprétation morale. Sois complet, détaillé et approfondi.",
    user_prompt_template: "Fais une analyse rhétorique complète, détaillée, approfondie et substantielle du texte suivant :\n{text}"
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

    const selectedStyleKey = style as keyof typeof reformulationPromptsConfig;
    // Ensure reformulationPromptsConfig is treated as potentially undefined for safety, though hardcoded here.
    const selectedPrompts = reformulationPromptsConfig ? reformulationPromptsConfig[selectedStyleKey] : undefined;

    if (!selectedPrompts || !selectedPrompts.system_prompt_template || !selectedPrompts.user_prompt_template) {
      console.error(`Reformulation style "${style}" not found or improperly configured in reformulationPromptsConfig.`);
      return {
        reformulatedText: `Error: Reformulation style "${style}" is not configured or prompts are missing. Please check flow configuration. Veuilez fournir une réponse détaillée, complète, substantielle et bien développée.`,
        styleUsed: style,
      };
    }

    try {
      const systemPromptContent = selectedPrompts.system_prompt_template + " Assurez-vous de fournir une réponse complète, détaillée, substantielle et bien développée.";
      const userPromptContent = selectedPrompts.user_prompt_template.replace('{text}', text);

      // Corrected structure for ai.generate prompt
      const result = await ai.generate({
        prompt: [
          { role: 'system', content: [{text: systemPromptContent}] },
          { role: 'user', content: [{text: userPromptContent}] },
        ],
        // model: 'googleai/gemini-1.5-flash-latest', // Ensure correct model or use default
        output: {format: 'text'}, 
        config: { temperature: 0.7 } 
      });
      
      const reformulatedText = result.text;

      if (!reformulatedText || reformulatedText.trim() === "") {
        console.warn(`LLM returned empty or no text for reformulation style "${style}". Input text length: ${text.length}`);
        return {
          reformulatedText: `The model did not provide a reformulation for the style "${style}". This may happen with certain inputs or model limitations. Please try a different style or text. Veuilez fournir une réponse détaillée, complète, substantielle et bien développée.`,
          styleUsed: style,
        };
      }

      return {
        reformulatedText,
        styleUsed: style,
      };
    } catch (error: any) {
      console.error(`Error during reformulation for style "${style}":`, error);
      return {
        reformulatedText: `Failed to reformulate text with style "${style}": ${error.message}. Veuilez fournir une réponse détaillée, complète, substantielle et bien développée.`,
        styleUsed: style,
      };
    }
  }
);

    