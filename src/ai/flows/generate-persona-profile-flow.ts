'use server';
/**
 * @fileOverview A Genkit flow for generating structured AI persona profiles
 * including "âme" (soul/essence) and "système nerveux" (nervous system/operational) signatures,
 * along with details for Markdown and JSON operational formats.
 *
 * - generatePersonaProfile - The main function to initiate the persona profile generation.
 * - GeneratePersonaProfileInput - The input type for the function.
 * - GeneratePersonaProfileOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema: Describes the information needed to generate the persona.
// For simplicity, starts with a general description and key elements.
// This can be expanded later for more guided input.
const GeneratePersonaProfileInputSchema = z.object({
  personaName: z.string().describe("The desired name for the AI persona (e.g., 'MarketAI Strategist Prime')."),
  personaDescription: z.string().describe("A detailed textual description of the AI persona, its purpose, core capabilities, values, and intended interaction style. This will be used to derive the 'âme' and 'système nerveux' components."),
  language: z.string().default('fr').describe('The language for the generated persona profile (e.g., "fr", "en").'),
});
export type GeneratePersonaProfileInput = z.infer<typeof GeneratePersonaProfileInputSchema>;

// Output Schema: Defines the structure of the generated JSON persona profile.
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
    }).describe("Les deux signatures d'identité du persona."),
    operationalFormats: z.object({
      markdown: z.object({
        purpose: z.string().describe("Objectif de la version Markdown de ce persona."),
        usageContext: z.string().describe("Contexte d'utilisation typique pour la version Markdown (ex: instructions LLM)."),
        relationToJson: z.string().describe("Comment la version Markdown se rapporte à cette structure JSON.")
      }).describe("Détails pour le format opérationnel Markdown."),
      json: z.object({
        purpose: z.string().describe("Objectif de cette version JSON du persona."),
        usageContext: z.string().describe("Contexte d'utilisation typique pour la version JSON (ex: base de connaissances, configuration)."),
        status: z.string().describe("Confirmation de la nature fonctionnelle de cette version JSON.")
      }).describe("Détails pour le format opérationnel JSON."),
      synchronizationNotice: z.string().describe("Notice indiquant que les formats Markdown et JSON sont synchronisés et représentent le même persona.")
    }).describe("Détails sur les formats opérationnels et leur synchronisation.")
  }).describe("Le profil complet du persona IA généré.")
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
Il doit également décrire comment ce persona serait représenté en formats Markdown (pour instructions LLM) et JSON (cette structure même, pour la configuration système).

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
4.  **Formats Opérationnels :**
    *   Pour Markdown : Décris son but (ex: instructions LLM), son contexte d'usage, et sa relation au JSON.
    *   Pour JSON : Décris son but (ex: configuration système), son contexte d'usage, et confirme qu'il s'agit de la version fonctionnelle du persona.
    *   Ajoute une notice de synchronisation claire indiquant que les deux formats représentent le même persona.

Assure-toi que la sortie JSON est complète, bien structurée, et adhère strictement au schéma de sortie défini.
La réponse doit être ENTIÈREMENT et UNIQUEMENT le JSON demandé, sans texte ou explication supplémentaire avant ou après.
Tous les champs textuels dans le JSON de sortie doivent être dans la langue : {{language}}.
Sois créatif mais fidèle à l'esprit de la description fournie.
Vise la clarté, la concision et la pertinence pour chaque champ.
Le champ "status" pour le format JSON doit explicitement confirmer que la structure JSON est la version fonctionnelle du persona. Par exemple : "CE DOCUMENT JSON EST LA REPRÉSENTATION FONCTIONNELLE DE L'IDENTITÉ '[Nom du Persona]'."
Le champ "relationToJson" pour le format Markdown doit indiquer que le Markdown est une contrepartie descriptive.
La "synchronizationNotice" doit clairement lier les deux formats au même persona.
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
      // Construct a valid, minimal PersonaProfileOutput in case of error
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
          },
          operationalFormats: {
            markdown: { purpose: "", usageContext: "", relationToJson: "" },
            json: { purpose: "", usageContext: "", status: "" },
            synchronizationNotice: ""
          }
        }
      };
    }
  }
);
