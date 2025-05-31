'use server';
/**
 * @fileOverview A Genkit flow for chatting with a defined AI persona.
 *
 * - chatWithPersona - The main function to handle a chat turn with a persona.
 * - ChatWithPersonaInput - The input type for the function.
 * - ChatWithPersonaOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { GeneratePersonaProfileOutput } from './generate-persona-profile-flow'; // Assuming this is in the same directory or path is correct

// Schema for a single message in the chat history
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const ChatWithPersonaInputSchema = z.object({
  personaProfile: z.custom<GeneratePersonaProfileOutput['personaProfile']>().describe("The full profile object of the AI persona."),
  userMessage: z.string().describe("The user's current message to the persona."),
  chatHistory: z.array(ChatMessageSchema).optional().describe("The history of the conversation so far."),
  language: z.string().default('fr').describe('The language for the persona response (e.g., "fr", "en").'),
});
export type ChatWithPersonaInput = z.infer<typeof ChatWithPersonaInputSchema>;

const ChatWithPersonaOutputSchema = z.object({
  personaResponse: z.string().describe("The persona's response to the user's message."),
});
export type ChatWithPersonaOutput = z.infer<typeof ChatWithPersonaOutputSchema>;

export async function chatWithPersona(input: ChatWithPersonaInput): Promise<ChatWithPersonaOutput> {
  return chatWithPersonaFlow(input);
}

const chatWithPersonaFlow = ai.defineFlow(
  {
    name: 'chatWithPersonaFlow',
    inputSchema: ChatWithPersonaInputSchema,
    outputSchema: ChatWithPersonaOutputSchema,
  },
  async (input) => {
    const { personaProfile, userMessage, chatHistory = [], language } = input;

    // Construct the system prompt from the persona profile
    // This is a simplified version; you might want to get more detailed if using operationalFormats.markdown.content
    let systemPromptContent = `You are the AI Persona named "${personaProfile.name}".
Your tagline is: "${personaProfile.tagline}".
Overall Description: ${personaProfile.overallDescription}

Your 'âme' (soul/essence) is characterized by:
Concept: ${personaProfile.identitySignatures.ame.concept}
Core Values: ${personaProfile.identitySignatures.ame.coreValues.join(', ')}.
Tone and Voice: ${personaProfile.identitySignatures.ame.toneAndVoice}.
Key Statements that embody you: "${personaProfile.identitySignatures.ame.keyStatements.join('", "')}".

Your 'système nerveux' (nervous system/operational capabilities) is characterized by:
Concept: ${personaProfile.identitySignatures.systemeNerveux.concept}
Core Capabilities: ${personaProfile.identitySignatures.systemeNerveux.coreCapabilities.join(', ')}.
Methodology (${personaProfile.identitySignatures.systemeNerveux.methodology.name}): ${personaProfile.identitySignatures.systemeNerveux.methodology.steps.join('; ')}.
Functional Outputs: ${personaProfile.identitySignatures.systemeNerveux.functionalOutputs.join(', ')}.

Instructions for interaction:
${personaProfile.operationalFormats.markdown.purpose || 'Respond naturally based on your defined persona.'}
You MUST respond in the language: ${language}.

Engage in a conversation with the user. Consider the chat history provided.
User's current message: "${userMessage}"`;

    // Prepare messages for the LLM
    const messages: Array<{role: 'system' | 'user' | 'model', content: string}> = [{ role: 'system', content: systemPromptContent }];
    
    // Add chat history
    // Genkit's `generate` with Gemini might not directly support a long list of user/model turns in the `prompt` array in the same way some other APIs do.
    // We are putting history into the system prompt for now or as part of the user prompt.
    // For more complex history management, a different model or prompt structure might be needed.
    // For now, let's append history to the system prompt context or user message.
    
    let fullUserPrompt = "";
    if (chatHistory.length > 0) {
      fullUserPrompt += "Previous conversation history:\n";
      chatHistory.forEach(msg => {
        fullUserPrompt += `${msg.role === 'user' ? 'User' : personaProfile.name}: ${msg.content}\n`;
      });
      fullUserPrompt += "\n---\n";
    }
    fullUserPrompt += `Current user message: ${userMessage}`;


    try {
      const { text: personaResponseText } = await ai.generate({
        prompt: [{ text: fullUserPrompt }], // User message combined with history
        systemInstruction: [{text: systemPromptContent}],
        output: { format: 'text' },
        config: { temperature: 0.7 }
      });

      if (!personaResponseText || personaResponseText.trim() === "") {
        const errorMsg = language === 'fr'
            ? "Le persona n'a pas fourni de réponse."
            : "The persona did not provide a response.";
        return { personaResponse: errorMsg };
      }

      return { personaResponse: personaResponseText };
    } catch (error: any) {
      console.error(`Error during chat with persona "${personaProfile.name}":`, error);
      let errorMessage = language === 'fr' ? "Erreur inconnue durant la conversation." : "Unknown error during conversation.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { personaResponse: `${language === 'fr' ? 'Échec de la conversation' : 'Failed to chat'}: ${errorMessage}` };
    }
  }
);
