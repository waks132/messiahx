'use server';
/**
 * @fileOverview A Genkit flow for generating structured AI persona profiles
 * including "âme" (soul/essence) and "système nerveux" (nervous system/operational) signatures.
 *
 * - generatePersonaProfile - The main function to initiate the persona profile generation.
 * - GeneratePersonaProfileInput - The input type for the function.
 * - GeneratePersonaProfileOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonaProfileInputSchema = z.object({
  personaName: z.string().describe("The desired name for the AI persona (e.g., 'MarketAI Strategist Prime')."),
  personaDescription: z.string().describe("A detailed textual description of the AI persona, its purpose, core capabilities, values, and intended interaction style. This will be used to derive the 'âme' and 'système nerveux' components."),
  language: z.string().default('fr').describe('The language for the generated persona profile (e.g., "fr", "en").'),
});
export type GeneratePersonaProfileInput = z.infer<typeof GeneratePersonaProfileInputSchema>;

const PersonaProfileOutputSchema = z.object({
  personaProfile: z.object({
    name: z.string().describe("Le nom du persona IA."),
    tagline: z.string().describe("Le slogan ou la phrase d'accroche du persona."),
    overallDescription: z.string().describe("Une description globale du persona."),
    identitySignatures: z.object({
      ame: z.object({
        concept: z.string().describe("Concept de la signature 'âme' (l'essence philosophique, éthique et relationnelle)."),
        coreValues: z.array(z.string()).describe("Valeurs clés de l'âme."),
        toneAndVoice: z.string().describe("Ton et voix de l'âme."),
        keyStatements: z.array(z.string()).describe("Déclarations clés ou citations illustrant l'âme.")
      }).describe("Signature 'âme' du persona."),
      systemeNerveux: z.object({
        concept: z.string().describe("Concept de la signature 'système nerveux' (le moteur logique, analytique et opérationnel)."),
        coreCapabilities: z.array(z.string()).describe("Capacités clés et compétences techniques du système nerveux."),
        methodology: z.object({
          name: z.string().describe("Nom de la méthodologie ou du processus de travail principal."),
          steps: z.array(z.string()).describe("Étapes clés de la méthodologie.")
        }).describe("Méthodologie du système nerveux."),
        functionalOutputs: z.array(z.string()).describe("Types de résultats ou livrables concrets produits par le système nerveux.")
      }).describe("Signature 'système nerveux' du persona.")
    }).describe("Les deux signatures d'identité du persona.")
  }).describe("Le profil complet du persona IA généré, focalisé sur ses signatures cognitives et identitaires.")
});
export type GeneratePersonaProfileOutput = z.infer<typeof PersonaProfileOutputSchema>;


export async function generatePersonaProfile(input: GeneratePersonaProfileInput): Promise<GeneratePersonaProfileOutput> {
  return generatePersonaProfileFlow(input);
}

const generatePersonaProfileGenkitPrompt = ai.definePrompt({
  name: 'generatePersonaProfilePrompt',
  input: {schema: GeneratePersonaProfileInputSchema},
  output: {schema: PersonaProfileOutputSchema},
  prompt: `Tu es un expert en design de personas IA et en architecture d'identité pour des agents intelligents.
Ta tâche est de générer un profil de persona IA structuré en JSON, basé sur la description fournie.
Le profil doit inclure deux signatures distinctes : "âme" (aspects éthiques, relationnels, valeurs) et "système nerveux" (aspects opérationnels, logiques, capacités).

Langue cible pour toute la sortie : {{language}}.

Description du Persona Fournie (base pour ta génération) :
Nom du Persona : {{{personaName}}}
Description Détaillée : {{{personaDescription}}}

Instructions Spécifiques :
1.  **Profil Général :** Extrais ou génère un nom, un slogan, et une description globale basés sur l'input.
2.  **Signature "Âme" :**
    *   Définis un concept clair pour l'âme.
    *   Identifie 3-5 valeurs fondamentales.
    *   Décris le ton et la voix.
    *   Formule 3-5 déclarations clés qui incarnent cette âme.
3.  **Signature "Système Nerveux" :**
    *   Définis un concept clair pour le système nerveux.
    *   Liste 3-5 capacités techniques ou opérationnelles principales.
    *   Décris une méthodologie de travail (nom et 3-5 étapes).
    *   Liste 3-5 types de sorties fonctionnelles ou de livrables.

Assure-toi que la sortie JSON est complète, bien structurée, et adhère strictement au schéma de sortie défini (qui se concentre sur le nom, le tagline, la description globale et les deux signatures d'identité).
La réponse doit être ENTIÈREMENT et UNIQUEMENT le JSON demandé, sans texte ou explication supplémentaire avant ou après.
Tous les champs textuels dans le JSON de sortie doivent être dans la langue : {{language}}.
Sois créatif mais fidèle à l'esprit de la description fournie.
Vise la clarté, la concision et la pertinence pour chaque champ.
`,
});

const generatePersonaProfileFlow = ai.defineFlow(
  {
    name: 'generatePersonaProfileFlow',
    inputSchema: GeneratePersonaProfileInputSchema,
    outputSchema: PersonaProfileOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await generatePersonaProfileGenkitPrompt(input);
      if (!output) {
        throw new Error('Persona profile generation LLM call returned no output.');
      }
      return output;
    } catch (error) {
      console.error("Error in generatePersonaProfileFlow:", error);
      const lang = input.language || 'fr';
      const errorMessage = lang === 'fr' 
         ? `Échec de la génération du profil de persona: ${error instanceof Error ? error.message : String(error)}`
         : `Failed to generate persona profile: ${error instanceof Error ? error.message : String(error)}`;
      
      return {
        personaProfile: {
          name: input.personaName || (lang === 'fr' ? "Persona Indéfini" : "Undefined Persona"),
          tagline: errorMessage,
          overallDescription: lang === 'fr' ? "Description indisponible en raison d'une erreur." : "Description unavailable due to an error.",
          identitySignatures: {
            ame: {
              concept: lang === 'fr' ? "Concept d'âme non généré." : "Soul concept not generated.",
              coreValues: [],
              toneAndVoice: "",
              keyStatements: []
            },
            systemeNerveux: {
              concept: lang === 'fr' ? "Concept de système nerveux non généré." : "Nervous system concept not generated.",
              coreCapabilities: [],
              methodology: { name: "", steps: [] },
              functionalOutputs: []
            }
          }
        }
      };
    }
  }
);
