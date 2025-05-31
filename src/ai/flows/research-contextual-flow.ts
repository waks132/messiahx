
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

// Corresponds to public/prompts.json -> researchPrompts -> research
const researchContextualPromptTemplate = `Tu es un assistant de recherche contextuelle.

ENTRÉE UTILISATEUR : {{{text}}}

INSTRUCTIONS :
1. Analyse la longueur et le contenu de l'ENTRÉE UTILISATEUR.
2. SI l'ENTRÉE UTILISATEUR semble être un mot-clé, un nom propre, ou un sujet court (ex: moins de 15 mots ou clairement un terme de recherche) ALORS :
   Fournis un aperçu contextuel général (historique, politique, culturel, scientifique) sur ce mot-clé/sujet. Indique les tendances actuelles, les controverses, et les éléments clés pour comprendre son impact. Sois précis et, si possible, mentionne des sources ou des domaines de recherche pertinents. Ne dis pas 'Veuillez me fournir le texte...'. Agis comme si tu avais déjà effectué la recherche.
3. SI l'ENTRÉE UTILISATEUR est un texte plus long (ex: 15 mots ou plus, et ne ressemblant pas à un simple terme de recherche) ALORS :
   Analyse ce texte spécifique. Identifie son sujet principal. Recherche les tendances ou controverses actuelles liées à ce sujet. Identifie les éléments de contexte (historiques, politiques, culturels, scientifiques) spécifiquement pertinents pour comprendre l'impact et la signification de CE TEXTE PRÉCIS.
4. Dans tous les cas, fournis une réponse détaillée, complète, substantielle, bien développée et bien structurée. Utilise des titres et des listes à puces si cela améliore la clarté. Assure-toi que la réponse soit toujours utile et informative, même pour une entrée courte. Ne te contente pas de demander plus d'informations si l'entrée est un mot-clé.`;


const ResearchContextualInputSchema = z.object({
  text: z.string().describe('The text or topic to research contextually.'),
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
  },
  async (flowInput) => { // Renommé 'input' en 'flowInput' pour éviter la confusion avec l'input du prompt
    const { text } = flowInput;

    if (!researchContextualPromptTemplate) {
      return { researchResult: 'Error: Contextual research prompt template is not configured. Veuillez fournir une réponse détaillée, complète, substantielle et bien développée.' };
    }

    // Replace a generic placeholder in the template with the actual input text
    const promptContent = researchContextualPromptTemplate.replace('{{{text}}}', text);

    try {
      const result = await ai.generate({
        prompt: promptContent,
        output: { format: 'text' },
        config: { temperature: 0.5 }
      });
      
      const researchResult = result.text;
      if (!researchResult || researchResult.trim() === "") {
        return { researchResult: "The model did not provide a contextual research result. Veuillez fournir une réponse détaillée, complète, substantielle et bien développée." };
      }
      return { researchResult };
    } catch (error: any) {
      console.error('Error during contextual research:', error);
      return { researchResult: `Failed to perform contextual research: ${error.message}. Veuillez fournir une réponse détaillée, complète, substantielle et bien développée.` };
    }
  }
);
    
