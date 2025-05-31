
'use server';
/**
 * @fileOverview A Genkit flow for manipulation analysis research based on input text.
 * Provides detailed and substantial responses by directly analyzing the input.
 *
 * - researchManipulation - The main function to initiate the manipulation research.
 * - ResearchManipulationInput - The input type for the function.
 * - ResearchManipulationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Corresponds to public/prompts.json -> researchPrompts -> manipulation
const researchManipulationPromptTemplate = `Tu es un expert en détection de manipulation et en analyse critique de discours.

TEXTE FOURNI POUR ANALYSE : {{{text}}}

TA MISSION : Agis comme un 'sonar' pour détecter les techniques de manipulation potentielles, les contre-arguments, ou les faits contradictoires relatifs au TEXTE FOURNI. Fournis une analyse directe et des résultats concrets, ne décris pas seulement ta méthodologie.

RECHERCHE ET ANALYSE À CONDUIRE SUR LE TEXTE FOURNI :
1.  **Contre-arguments ou Faits Contradictoires :** Recherche activement des informations (faits, études, analyses d'experts) qui contredisent ou nuancent les affirmations principales du TEXTE FOURNI.
2.  **Sources Fiables Remettant en Question :** Identifie des sources crédibles (organismes de vérification des faits, institutions académiques, rapports d'enquête journalistique reconnus) qui pourraient remettre en cause la validité ou l'objectivité du TEXTE FOURNI.
3.  **Techniques de Rhétorique Manipulatoire Employées :** Analyse le TEXTE FOURNI pour identifier des techniques spécifiques de persuasion ou de manipulation (ex: appel à l'émotion excessif, généralisations abusives, faux dilemmes, arguments d'autorité fallacieux, désinformation, etc.). Donne des exemples tirés du texte.
4.  **Omissions Significatives :** Y a-t-il des informations cruciales ou des perspectives alternatives qui semblent délibérément omises du TEXTE FOURNI et qui changeraient la perception du lecteur ?

SYNTHÈSE DES RÉSULTATS :
Fournis une synthèse de tes découvertes en 2 à 4 points clés maximum. Pour chaque point, sois spécifique, cite des exemples tirés du TEXTE FOURNI si pertinent, et mentionne le type d'information recherchée (contre-argument, source critique, technique rhétorique, omission).

Assure-toi de fournir une réponse détaillée, complète, substantielle et bien développée directement basée sur l'analyse du TEXTE FOURNI.`;

const ResearchManipulationInputSchema = z.object({
  text: z.string().describe('The text to research for manipulation insights.'),
});
export type ResearchManipulationInput = z.infer<typeof ResearchManipulationInputSchema>;

const ResearchManipulationOutputSchema = z.object({
  manipulationInsights: z.string().describe('The detailed, comprehensive, and substantial manipulation research insights.'),
});
export type ResearchManipulationOutput = z.infer<typeof ResearchManipulationOutputSchema>;

export async function researchManipulation(input: ResearchManipulationInput): Promise<ResearchManipulationOutput> {
  return researchManipulationFlow(input);
}

const researchManipulationFlow = ai.defineFlow(
  {
    name: 'researchManipulationFlow',
    inputSchema: ResearchManipulationInputSchema,
    outputSchema: ResearchManipulationOutputSchema,
  },
  async (flowInput) => { // Renommé 'input' en 'flowInput'
    const { text } = flowInput;

    if (!researchManipulationPromptTemplate) {
        return { manipulationInsights: 'Error: Manipulation research prompt template is not configured. Veuillez fournir une réponse détaillée, complète, substantielle et bien développée.' };
    }
    
    // Remplacer {{{text}}} et {{{query}}} (au cas où) par le texte d'entrée.
    // Il est préférable d'avoir un seul placeholder cohérent, ici nous utilisons {{{text}}}
    const promptContent = researchManipulationPromptTemplate.replace(/\{\{\{text\}\}\}/g, text).replace(/\{\{\{query\}\}\}/g, text);


    try {
      const result = await ai.generate({
        prompt: promptContent,
        output: { format: 'text' },
        config: { temperature: 0.5 }
      });
      
      const manipulationInsights = result.text;
      if (!manipulationInsights || manipulationInsights.trim() === "") {
        return { manipulationInsights: "The model did not provide manipulation research insights. Veuillez fournir une réponse détaillée, complète, substantielle et bien développée." };
      }
      return { manipulationInsights };
    } catch (error: any) {
      console.error('Error during manipulation research:', error);
      return { manipulationInsights: `Failed to perform manipulation research: ${error.message}. Veuillez fournir une réponse détaillée, complète, substantielle et bien développée.` };
    }
  }
);
    
