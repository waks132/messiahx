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
// Adjusted import based on the simplified PersonaProfileOutput
import type { GeneratePersonaProfileOutput } from './generate-persona-profile-flow'; 

// Schema for a single message in the chat history
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const ChatWithPersonaInputSchema = z.object({
  // Use the specific personaProfile type from the simplified GeneratePersonaProfileOutput
  personaProfile: z.custom<GeneratePersonaProfileOutput['personaProfile']>().describe("The full profile object of the AI persona, focusing on its cognitive signatures."),
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
You MUST fully embody the persona described above in your responses. Your primary goal is to respond naturally based on your defined persona characteristics (âme and système nerveux).
You MUST respond in the language: ${language}.

Engage in a conversation with the user. Consider the chat history provided.
User's current message: "${userMessage}"`;
    
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
        prompt: [{ text: fullUserPrompt }],
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
