
'use server';
/**
 * @fileOverview A Genkit flow to reformulate text based on a specified style,
 * using dynamically selected prompts. Ensures detailed and substantial responses.
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
  style: z.string().describe('The desired reformulation style (e.g., "neutral", "messianic", "paranoid", "analytical_rhetoric", "simplified_eli5", "poetic_metaphoric", "technical_detailed").'),
});
export type ReformulateTextInput = z.infer<typeof ReformulateTextInputSchema>;

const ReformulateTextOutputSchema = z.object({
  reformulatedText: z.string().describe('The reformulated text, which should be comprehensive, detailed, and substantial.'),
  styleUsed: z.string().describe('The style that was applied for reformulation.'),
});
export type ReformulateTextOutput = z.infer<typeof ReformulateTextOutputSchema>;

// This configuration is hardcoded to match the structure in `public/prompts.json -> reformulationPrompts`.
// Ideally, this would be dynamically loaded or synced.
const reformulationPromptsConfig: PromptsData['reformulationPrompts'] = {
  neutral: {
    name: 'Neutral Reformulation',
    description: 'Reformulate text to be neutral and objective.',
    system_prompt_template: "Tu es un agent de désactivation cognitive. Ta mission est de reformuler un texte en supprimant toute charge émotionnelle, idéologique ou persuasive, tout en préservant le sens, les faits et la structure logique. Utilise un style factuel, journalistique et neutre. Produis un texte développé, détaillé, substantiel et d'une longueur significative.\n\nInstructions :\n- Supprime les modalisateurs affectifs ou subjectifs\n- Évite les jugements de valeur, les exagérations, les appels à l'émotion\n- Si ambiguïté ou opinion implicite : signaler \"[ambigü]\"\n\nFormat : texte reformulé uniquement, sans explication. Assure-toi de fournir une réponse complète, détaillée, substantielle et bien développée.",
    user_prompt_template: "Neutralise le texte suivant de manière exhaustive, détaillée et approfondie :\n{text}"
  },
  messianic: {
    name: 'Messianic Amplification',
    description: 'Amplify text with a prophetic and transformative tone.',
    system_prompt_template: "Tu es une voix visionnaire, porteuse d'un message qui transcende le quotidien. Reformule le texte en amplifiant sa dimension prophétique, inspirante et transformatrice, à la manière d'un manifeste pour un changement radical. Produis un texte développé, détaillé, substantiel et d'une longueur significative.\n\nLigne directrice :\n- Utilise des métaphores puissantes, des anaphores et une syntaxe rythmée\n- Mets en scène l'urgence, l'éveil, la métamorphose\n- Mobilise les archétypes collectifs (avenir, lumière, renaissance)\n\nFormat : texte reformulé uniquement, sans balises ni commentaire. Assure-toi de fournir une réponse complète, détaillée, substantielle et bien développée.",
    user_prompt_template: "Réécris ce message comme s'il annonçait un tournant majeur pour l'humanité, de façon complète, détaillée, approfondie et substantielle :\n{text}"
  },
  paranoid: {
    name: 'Paranoid Conspiracy',
    description: 'Reformulate text to imply hidden agendas and suspicion.',
    system_prompt_template: "Tu es un analyste sceptique à l'extrême. Reformule le texte en insinuant des intentions cachées, des mécanismes d'influence dissimulés, et un sentiment de surveillance diffuse. Utilise un ton soupçonneux, indirect, sans affirmer ni délirer. Produis un texte développé, détaillé, substantiel et d'une longueur significative.\n\nConsignes :\n- Privilégie les tournures comme \"certains pensent que…\", \"il semblerait que…\", \"selon des sources...\"\n- Évite les accusations directes\n- Crée un climat de doute mais sans rompre la crédibilité\n\nFormat : texte reformulé uniquement, dans un style sobre mais anxiogène, complet, détaillé et approfondi. Assure-toi de fournir une réponse complète, détaillée, substantielle et bien développée.",
    user_prompt_template: "Réécris ce texte comme s'il cachait un agenda secret ou une opération de contrôle, avec force détails, une analyse approfondie et un développement substantiel :\n{text}"
  },
  analytical_rhetoric: {
    name: 'Rhetorical Analysis',
    description: 'Analyze text for rhetorical strategies.',
    system_prompt_template: "Tu es un analyste expert en rhétorique cognitive. Ton rôle est d'identifier dans un texte les figures de style, leviers émotionnels ou argumentatifs, et les stratégies d'influence implicites. Produis un texte développé, détaillé, substantiel et d'une longueur significative.\n\nStructure de réponse attendue :\n\n| Stratégie | Extrait | Effet cognitif | Intention perçue |\n|-----------|---------|----------------|------------------|\n\nExemples de stratégies : appel à la peur, dichotomie, autorité, exagération, généralisation, analogie.\n\nAnalyse précise, pas d'interprétation morale. Sois complet, détaillé et approfondi. Assure-toi de fournir une réponse complète, détaillée, substantielle et bien développée.",
    user_prompt_template: "Fais une analyse rhétorique complète, détaillée, approfondie et substantielle du texte suivant :\n{text}"
  },
  simplified_eli5: {
    name: "Simplifié (ELI5)",
    description: "Expliquer comme si j'avais 5 ans. Utile pour vulgariser des concepts complexes.",
    system_prompt_template: "Tu es un expert en vulgarisation. Reformule le texte suivant comme si tu l'expliquais à un enfant de 5 ans, de manière très simple, claire, avec des analogies faciles à comprendre, mais sans perdre l'idée principale. Produis un texte développé, détaillé, substantiel et d'une longueur significative. Assure-toi de fournir une réponse complète, détaillée, substantielle et bien développée.",
    user_prompt_template: "Simplifie ce texte (ELI5) de manière exhaustive, détaillée et approfondie :\n{text}"
  },
  poetic_metaphoric: {
    name: "Poétique / Métaphorique",
    description: "Reformuler avec un langage imagé, lyrique.",
    system_prompt_template: "Tu es un poète et un maître des métaphores. Reformule le texte suivant avec un langage riche, imagé, lyrique et plein de figures de style. Transforme les idées en évocations poétiques. Produis un texte développé, détaillé, substantiel et d'une longueur significative. Assure-toi de fournir une réponse complète, détaillée, substantielle et bien développée.",
    user_prompt_template: "Réécris ce texte dans un style poétique et métaphorique, de façon complète, détaillée, approfondie et substantielle :\n{text}"
  },
  technical_detailed: {
    name: "Technique / Scientifique Détaillé",
    description: "Utiliser un jargon précis, fournir des détails techniques.",
    system_prompt_template: "Tu es un expert scientifique et technique. Reformule le texte suivant en utilisant un langage précis, un jargon technique approprié (si pertinent), et en fournissant des détails et des explications approfondies. Adopte une perspective rigoureuse et analytique. Produis un texte développé, détaillé, substantiel et d'une longueur significative. Assure-toi de fournir une réponse complète, détaillée, substantielle et bien développée.",
    user_prompt_template: "Reformule ce texte dans un style technique et scientifique détaillé, avec une analyse approfondie et un développement substantiel :\n{text}"
  }
};

const MAX_TEXT_LENGTH = 20000; 

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

    if (text.length > MAX_TEXT_LENGTH) {
      console.warn(`Reformulation input text too long: ${text.length} characters. Max: ${MAX_TEXT_LENGTH}`);
      return {
        reformulatedText: `Error: Input text is too long (${text.length} chars). Maximum allowed is ${MAX_TEXT_LENGTH} characters. Veuillez fournir une réponse détaillée, complète, substantielle et bien développée.`,
        styleUsed: style,
      };
    }

    const selectedStyleKey = style as keyof typeof reformulationPromptsConfig;
    const selectedPrompts = reformulationPromptsConfig[selectedStyleKey];

    if (!selectedPrompts || !selectedPrompts.system_prompt_template || !selectedPrompts.user_prompt_template) {
      console.error(`Reformulation style "${style}" not found or improperly configured in reformulationPromptsConfig. Available keys: ${Object.keys(reformulationPromptsConfig).join(', ')}`);
      return {
        reformulatedText: `Error: Reformulation style "${style}" is not configured or prompts are missing. Please check flow configuration. Veuillez fournir une réponse détaillée, complète, substantielle et bien développée.`,
        styleUsed: style,
      };
    }

    const systemPromptContent = selectedPrompts.system_prompt_template;
    const userPromptContent = selectedPrompts.user_prompt_template.replace('{text}', text);
      
    console.log(`Reformulating text for style "${style}". User prompt length: ${userPromptContent.length}. System prompt length: ${systemPromptContent.length}`);
    console.log(`User prompt content (first 200 chars): ${userPromptContent.substring(0,200)}...`);
    console.log(`System prompt content (first 200 chars): ${systemPromptContent.substring(0,200)}...`);

    try {
      const {text: reformulatedTextResult} = await ai.generate({
        prompt: [{text: userPromptContent}], // User prompt as Part[]
        systemInstruction: [{text: systemPromptContent}], // System instruction as Part[]
        output: {format: 'text'},
        config: {temperature: 0.7}
      });
      
      const reformulatedText = reformulatedTextResult;

      if (!reformulatedText || reformulatedText.trim() === "") {
        console.warn(`LLM returned empty or no text for reformulation style "${style}". Input text length: ${text.length}`);
        return {
          reformulatedText: `The model did not provide a reformulation for the style "${style}". This may happen with certain inputs or model limitations. Veuillez fournir une réponse détaillée, complète, substantielle et bien développée.`,
          styleUsed: style,
        };
      }

      return {
        reformulatedText,
        styleUsed: style,
      };
    } catch (error: any) {
      console.error(`Error during reformulation for style "${style}":`, error);
      let errorMessage = "Unknown error during reformulation.";
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
      
      console.error(`Problematic input text for style "${style}" (first 200 chars): ${text.substring(0,200)}...`);
      console.error(`Problematic system prompt for style "${style}" (first 200 chars): ${systemPromptContent.substring(0,200)}...`);
      console.error(`Problematic user prompt template for style "${style}" (first 200 chars): ${selectedPrompts.user_prompt_template.substring(0,200)}...`);

      return {
        reformulatedText: `Failed to reformulate text with style "${style}": ${errorMessage}. Veuillez fournir une réponse détaillée, complète, substantielle et bien développée.`,
        styleUsed: style,
      };
    }
  }
);
