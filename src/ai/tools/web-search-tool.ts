
'use server';
/**
 * @fileOverview A web search tool using Genkit.
 * It attempts to use the Perplexity API if a PERPLEXITY_API_KEY is found in environment variables.
 * Otherwise, it acts as a placeholder.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WebSearchInputSchema = z.object({
  query: z.string().describe('The search query.'),
  language: z.string().optional().describe('The preferred language for search results (e.g., "fr", "en"). ISO 639-1 code.'),
});
export type WebSearchInput = z.infer<typeof WebSearchInputSchema>;

const WebSearchOutputSchema = z.object({
  searchResults: z.string().describe('A summary of the web search results relevant to the query.'),
  source: z.string().describe('The source of the search results (e.g., "PerplexityAPI", "PlaceholderWebSearchTool").'),
});
export type WebSearchOutput = z.infer<typeof WebSearchOutputSchema>;

export const webSearchTool = ai.defineTool(
  {
    name: 'webSearch',
    description: 'Performs a web search to find relevant, up-to-date information on a given query. Useful for current events, specific facts, or general knowledge. Can prioritize results by language if specified.',
    inputSchema: WebSearchInputSchema,
    outputSchema: WebSearchOutputSchema,
  },
  async (input) => {
    console.log(`WebSearchTool: Received query "${input.query}" for language "${input.language || 'default'}".`);
    
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

    if (PERPLEXITY_API_KEY && PERPLEXITY_API_KEY.trim() !== "") {
      try {
        // Construct Perplexity API request
        // Using llama-3-sonar-small-32k-online as it's good for search-augmented tasks
        // and generally available.
        const messages = [
          { role: 'system', content: 'You are a helpful AI assistant that provides concise and relevant search results. Prioritize accuracy and cite sources if possible.' },
          { role: 'user', content: input.query }
        ];
        
        // Add language context to the system prompt if provided
        if (input.language) {
            messages[0].content += ` The user prefers results in ${input.language}. Please tailor your search and response accordingly.`;
        }

        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${PERPLEXITY_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3-sonar-small-32k-online", 
            messages: messages,
            // Perplexity API doesn't have a direct 'language' parameter for results,
            // so we include it in the prompt to guide the model.
          })
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Perplexity API Error:", response.status, errorData);
          return { 
            searchResults: `Web search failed with Perplexity API: ${response.status} ${response.statusText}. Details: ${errorData}`,
            source: "PerplexityAPIError"
          };
        }

        const data = await response.json();
        const searchResultsContent = data.choices[0]?.message?.content || "No relevant information found by Perplexity API.";
        
        return { 
          searchResults: searchResultsContent,
          source: "PerplexityAPI" 
        };

      } catch (error: any) {
        console.error("Error calling Perplexity API:", error);
        return { 
          searchResults: `Error during web search with Perplexity API: ${error.message}`,
          source: "PerplexityAPIError"
        };
      }
    } else {
      // Placeholder implementation if API key is not found
      const lang = input.language || 'fr';
      const placeholderText = lang === 'fr'
        ? `Résultat de recherche web (placeholder - clé API Perplexity non configurée) pour : "${input.query}". La fonctionnalité de recherche réelle n'est pas implémentée.`
        : `Web search result (placeholder - Perplexity API key not configured) for: "${input.query}". Actual search functionality is not implemented.`;
      
      return { 
          searchResults: placeholderText,
          source: "PlaceholderWebSearchTool"
      };
    }
  }
);
