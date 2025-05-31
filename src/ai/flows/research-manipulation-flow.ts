
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
const researchManipulationPromptTemplate = `Tu es un expert en détection de manipulation, en analyse critique de discours, et en rhétorique. Ta mission est d'agir comme un 'sonar' pour sonder en profondeur le texte fourni, afin de détecter les techniques de manipulation potentielles, les arguments fallacieux, les omissions significatives, les contre-arguments pertinents, et les faits contradictoires.

TEXTE FOURNI POUR ANALYSE : {{{text}}}

RECHERCHE ET ANALYSE APPROFONDIES À CONDUIRE SUR LE TEXTE FOURNI :
1.  **Contre-arguments ou Faits Contradictoires Majeurs :** Recherche activement et présente des informations détaillées (faits établis, études reconnues, analyses d'experts, données statistiques) qui contredisent directement ou nuancent fortement les affirmations principales et les conclusions implicites du TEXTE FOURNI. Ne te contente pas de suggestions vagues ; fournis des éléments concrets.
2.  **Sources Fiables et Crédibles Remettant en Question :** Identifie et cite (si possible, avec des exemples de ce qu'elles pourraient dire) des sources crédibles (organismes de vérification des faits reconnus, institutions académiques de premier plan, rapports d'enquête journalistique d'investigation primés, publications scientifiques peer-reviewed) qui pourraient sérieusement remettre en cause la validité, l'objectivité, ou l'exhaustivité du TEXTE FOURNI ou de ses prémisses.
3.  **Techniques de Rhétorique et de Persuasion Manipulatoire Employées :** Analyse minutieusement le TEXTE FOURNI pour identifier des techniques spécifiques de persuasion ou de manipulation. Pour chaque technique identifiée, donne des exemples précis tirés du texte et explique en détail comment cette technique fonctionne et quel effet elle cherche à produire sur le lecteur/auditeur. Exemples non exhaustifs : appel à l'émotion disproportionné, généralisations abusives, faux dilemmes, arguments d'autorité fallacieux, désinformation, mésinformation, sophismes (homme de paille, pente glissante, etc.), cadrage biaisé, répétition, etc.
4.  **Omissions Significatives et Angles Morts :** Identifie les informations cruciales, les perspectives alternatives importantes, ou les contextes pertinents qui semblent délibérément ou par négligence omis du TEXTE FOURNI. Explique comment l'inclusion de ces éléments omis pourrait changer radicalement la perception ou la conclusion du lecteur.
5.  **Analyse de l'Intention Perçue et des Agendas Cachés :** Sur la base de ton analyse, quelle semble être l'intention principale de l'auteur du TEXTE FOURNI ? Y a-t-il des indices d'un agenda caché ou d'une tentative d'influencer l'opinion de manière non transparente ? Argumente ta réponse.

SYNTHÈSE DES RÉSULTATS :
Fournis une synthèse détaillée et structurée de tes découvertes, organisée selon les points ci-dessus. Chaque section doit être développée avec des exemples précis et des explications approfondies.

IMPORTANT : Ta réponse doit être aussi longue, détaillée, complète et substantielle que possible, explorant toutes les facettes de la requête. Ne résume pas ou ne tronque pas tes pensées prématurément. Vise une utilisation maximale des tokens pour fournir l'analyse la plus profonde possible. La superficialité est à proscrire.`;

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
  async (flowInput) => { 
    const { text } = flowInput;

    if (!researchManipulationPromptTemplate) {
        // This should ideally not happen
        return { manipulationInsights: 'Error: Manipulation research prompt template is not configured. Your response should be as long, detailed, comprehensive, and substantial as possible.' };
    }
    
    const promptContent = researchManipulationPromptTemplate.replace(/\{\{\{text\}\}\}/g, text).replace(/\{\{\{query\}\}\}/g, text);


    try {
      const result = await ai.generate({
        prompt: promptContent, // Direct string prompt
        output: { format: 'text' },
        config: { temperature: 0.5 } // Temperature can be adjusted
      });
      
      const manipulationInsights = result.text;
      if (!manipulationInsights || manipulationInsights.trim() === "") {
        return { manipulationInsights: "The model did not provide manipulation research insights. Your response should be as long, detailed, comprehensive, and substantial as possible." };
      }
      return { manipulationInsights };
    } catch (error: any) {
      console.error('Error during manipulation research:', error);
      return { manipulationInsights: `Failed to perform manipulation research: ${error.message}. Your response should be as long, detailed, comprehensive, and substantial as possible.` };
    }
  }
);

    