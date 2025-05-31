
'use server';
/**
 * @fileOverview A Genkit flow for contextual research based on input text or topic.
 * Provides detailed and substantial responses.
 *
 * - researchContextual - The main function to initiate the contextual research.
 * - ResearchContextualInput - The input type for the function.
 * - ResearchContextualOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { webSearchTool } from '@/ai/tools/web-search-tool'; // Import the tool

// Corresponds to public/prompts.json -> researchPrompts -> research
// Updated to include language and suggest tool use.
const researchContextualPromptTemplate = `Tu es un assistant de recherche contextuelle expert.
Ta réponse doit être en {{language}}. Utilise l'outil 'webSearch' si tu as besoin d'informations fraîches ou spécifiques pour répondre de manière exhaustive.

ENTRÉE UTILISATEUR : {{{text}}}

INSTRUCTIONS :
1. Analyse attentivement la longueur et la nature de l'ENTRÉE UTILISATEUR.
2. SI l'ENTRÉE UTILISATEUR est un mot-clé, un nom propre, une question courte, ou un sujet concis (ex: typiquement moins de 20 mots OU clairement un terme de recherche identifiable) :
   ALORS fournis un aperçu contextuel général, détaillé et approfondi sur ce mot-clé/sujet. Cet aperçu doit inclure les aspects historiques, politiques, culturels, et scientifiques pertinents. Souligne les tendances actuelles, les controverses majeures, les chiffres clés si disponibles, et les éléments essentiels pour comprendre son impact global et ses implications. Cite des domaines de recherche, des penseurs clés ou des événements marquants associés. N'hésite pas à utiliser l'outil 'webSearch' pour enrichir ta réponse.
3. SI l'ENTRÉE UTILISATEUR est un texte plus long (ex: 20 mots ou plus, ou ressemblant à un extrait d'article, un discours, etc.) :
   ALORS analyse ce texte spécifique de manière approfondie. Identifie son sujet principal, ses arguments clés, et son intention probable. Ensuite, recherche et fournis les éléments de contexte (historiques, politiques, culturels, scientifiques, sociaux) spécifiquement pertinents pour comprendre l'impact, la signification, et les possibles interprétations de CE TEXTE PRÉCIS. Mets en lumière les débats ou controverses auxquels ce texte pourrait se rattacher. Utilise l'outil 'webSearch' si nécessaire.
4. Dans TOUS les cas, ta réponse doit être extrêmement détaillée, complète, substantielle, bien structurée et bien développée. Utilise des titres, des sous-titres, et des listes à puces pour améliorer la clarté et l'organisation de l'information. Ne te limite pas en longueur ; explore toutes les facettes de la requête pour fournir l'analyse contextuelle la plus riche et profonde possible. Vise une utilisation maximale des tokens. La superficialité est à proscrire.
IMPORTANT : Ta réponse doit être aussi longue, détaillée, complète et substantielle que possible, explorant toutes les facettes de la demande. Ne résume pas ou ne tronque pas tes pensées prématurément. Vise une utilisation maximale des tokens pour fournir l'analyse la plus approfondie possible.`;


const ResearchContextualInputSchema = z.object({
  text: z.string().describe('The text or topic to research contextually.'),
  language: z.string().default('fr').describe('The language for the response (e.g., "fr", "en").'),
});
export type ResearchContextualInput = z.infer<typeof ResearchContextualInputSchema>;

const ResearchContextualOutputSchema = z.object({
  researchResult: z.string().describe('The detailed, comprehensive, and substantial contextual research result.'),
});
export type ResearchContextualOutput = z.infer<typeof ResearchContextualOutputSchema>;

export async function researchContextual(input: ResearchContextualInput): Promise<ResearchContextualOutput> {
  return researchContextualFlow(input);
}

const researchContextualFlow = ai.defineFlow(
  {
    name: 'researchContextualFlow',
    inputSchema: ResearchContextualInputSchema,
    outputSchema: ResearchContextualOutputSchema,
    tools: [webSearchTool], // Make the tool available to the flow
  },
  async (flowInput) => { 
    const { text, language } = flowInput;

    if (!researchContextualPromptTemplate) {
      const errorMsg = language === 'fr'
        ? 'Erreur : Le modèle de prompt pour la recherche contextuelle n\'est pas configuré.'
        : 'Error: Contextual research prompt template is not configured.';
      return { researchResult: `${errorMsg} Ta réponse doit être aussi longue, détaillée, complète et substantielle que possible.` };
    }

    const promptContent = researchContextualPromptTemplate
      .replace('{{{text}}}', text)
      .replace('{{language}}', language);

    try {
      const result = await ai.generate({
        prompt: promptContent, 
        output: { format: 'text' },
        tools: [webSearchTool], // Also pass tool to generate if flow doesn't handle it automatically
        config: { temperature: 0.5 } 
      });
      
      const researchResult = result.text;
      if (!researchResult || researchResult.trim() === "") {
        const errorMsg = language === 'fr'
            ? "Le modèle n'a pas fourni de résultat pour la recherche contextuelle."
            : "The model did not provide a contextual research result.";
        return { researchResult: `${errorMsg} Ta réponse doit être aussi longue, détaillée, complète et substantielle que possible.` };
      }
      return { researchResult };
    } catch (error: any) {
      console.error('Error during contextual research:', error);
      const errorMsg = language === 'fr'
        ? `Échec de la recherche contextuelle : ${error.message}.`
        : `Failed to perform contextual research: ${error.message}.`;
      return { researchResult: `${errorMsg} Ta réponse doit être aussi longue, détaillée, complète et substantielle que possible.` };
    }
  }
);
    
