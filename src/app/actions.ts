
'use server';

import { analyzeText as analyzeTextForManipulationFlow, type AnalyzeTextInput, type AnalyzeTextOutput } from '@/ai/flows/analyze-text-for-manipulation';
import { generateCriticalSummary as generateCriticalSummaryFlow, type GenerateCriticalSummaryInput, type GenerateCriticalSummaryOutput } from '@/ai/flows/generate-critical-summary';
import { detectHiddenNarratives as detectHiddenNarrativesFlow, type DetectHiddenNarrativesInput, type DetectHiddenNarrativesOutput } from '@/ai/flows/detect-hidden-narratives';
import { classifyCognitiveCategories as classifyCognitiveCategoriesFlow, type ClassifyCognitiveCategoriesInput, type ClassifyCognitiveCategoriesOutput } from '@/ai/flows/classify-cognitive-categories';
import { reformulateText as reformulateTextFlow, type ReformulateTextInput, type ReformulateTextOutput } from '@/ai/flows/reformulate-text';
import { researchContextual as researchContextualFlow, type ResearchContextualInput, type ResearchContextualOutput } from '@/ai/flows/research-contextual-flow';
import { researchManipulation as researchManipulationFlow, type ResearchManipulationInput, type ResearchManipulationOutput } from '@/ai/flows/research-manipulation-flow';
import { generatePersonaProfile as generatePersonaProfileFlow, type GeneratePersonaProfileInput, type GeneratePersonaProfileOutput } from '@/ai/flows/generate-persona-profile-flow';
import { chatWithPersona as chatWithPersonaFlow, type ChatWithPersonaInput, type ChatWithPersonaOutput } from '@/ai/flows/chat-with-persona-flow';


export async function analyzeTextAction(input: AnalyzeTextInput): Promise<AnalyzeTextOutput> {
  try {
    // Language is now part of AnalyzeTextInput
    const result = await analyzeTextForManipulationFlow(input); 
    return {
      summary: result.summary || (input.language === 'fr' ? "Résumé de l'analyse non disponible." : "Analysis summary not available."),
      rhetoricalTechniques: result.rhetoricalTechniques || [],
      cognitiveBiases: result.cognitiveBiases || [],
      unverifiableFacts: result.unverifiableFacts || [],
    };
  } catch (error) {
    console.error("Error in analyzeTextAction:", error);
    const errorSummary = input.language === 'fr'
        ? `Échec de l'analyse du texte : ${error instanceof Error ? error.message : "Erreur inconnue"}`
        : `Failed to analyze text: ${error instanceof Error ? error.message : "Unknown error"}`;
    return {
      summary: errorSummary,
      rhetoricalTechniques: [],
      cognitiveBiases: [],
      unverifiableFacts: [],
    };
  }
}

export async function generateCriticalSummaryAction(input: GenerateCriticalSummaryInput): Promise<GenerateCriticalSummaryOutput> {
  try {
    // Language is now part of GenerateCriticalSummaryInput
    const result = await generateCriticalSummaryFlow(input);
    const defaultError = input.language === 'fr' 
        ? "Échec de la génération du résumé critique : Réponse invalide de l'IA."
        : "Failed to generate critical summary: Invalid response from AI.";
    if (!result || typeof result.summary !== 'string') {
      console.error("Invalid result from generateCriticalSummaryFlow:", result);
      return { summary: defaultError };
    }
    return result;
  } catch (error) {
    console.error("Error in generateCriticalSummaryAction:", error);
    const errorMessage = input.language === 'fr'
        ? `Échec de la génération du résumé critique : ${error instanceof Error ? error.message : "Erreur inconnue"}`
        : `Failed to generate critical summary: ${error instanceof Error ? error.message : "Unknown error"}`;
    return { summary: errorMessage };
  }
}

export async function detectHiddenNarrativesAction(input: DetectHiddenNarrativesInput): Promise<DetectHiddenNarrativesOutput> {
  try {
    // Language is now part of DetectHiddenNarrativesInput
    const result = await detectHiddenNarrativesFlow(input);
    const defaultError = input.language === 'fr'
        ? "Échec de la détection des narratifs cachés : Réponse invalide de l'IA."
        : "Failed to detect hidden narratives: Invalid response from AI.";
    if (!result || typeof result.hiddenNarratives !== 'string') {
      console.error("Invalid result from detectHiddenNarrativesFlow:", result);
      return { hiddenNarratives: defaultError };
    }
    return result;
  } catch (error) {
    console.error("Error in detectHiddenNarrativesAction:", error);
     const errorMessage = input.language === 'fr'
        ? `Échec de la détection des narratifs cachés : ${error instanceof Error ? error.message : "Erreur inconnue"}`
        : `Failed to detect hidden narratives: ${error instanceof Error ? error.message : "Unknown error"}`;
    return { hiddenNarratives: errorMessage };
  }
}

export async function classifyCognitiveCategoriesAction(input: ClassifyCognitiveCategoriesInput): Promise<ClassifyCognitiveCategoriesOutput> {
  try {
    // Language is now part of ClassifyCognitiveCategoriesInput
    const result = await classifyCognitiveCategoriesFlow(input);
    const defaultReasoning = input.language === 'fr' ? 'Données de classification incomplètes.' : 'Classification data incomplete.';
     return {
      classifiedCategories: result.classifiedCategories || [],
      overallClassification: result.overallClassification || { type: 'other', score: 0, reasoning: defaultReasoning }
    };
  } catch (error) {
    console.error("Error in classifyCognitiveCategoriesAction:", error);
    let errorMessage = input.language === 'fr' ? "Une erreur inconnue est survenue durant la classification." : "An unknown error occurred during classification.";
    if (error instanceof Error) {
       errorMessage = error.message;
    }
    const finalReasoning = input.language === 'fr'
        ? `Échec de la classification des catégories cognitives : ${errorMessage}`
        : `Failed to classify cognitive categories: ${errorMessage}`;
    return {
      classifiedCategories: [],
      overallClassification: { type: 'other', score: 0, reasoning: finalReasoning }
    };
  }
}

export async function reformulateTextAction(input: ReformulateTextInput): Promise<ReformulateTextOutput> {
  try {
    // Language is now part of ReformulateTextInput
    const result = await reformulateTextFlow(input);
    const defaultError = input.language === 'fr'
        ? "Échec de la reformulation du texte : Réponse invalide de l'IA."
        : "Failed to reformulate text: Invalid response from AI.";
    if (!result || typeof result.reformulatedText !== 'string' || typeof result.styleUsed !== 'string') {
      console.error("Invalid result from reformulateTextFlow:", result);
      return { 
        reformulatedText: defaultError,
        styleUsed: input.style 
      };
    }
    return result;
  } catch (error) {
    console.error("Error in reformulateTextAction:", error);
    const errorMessage = input.language === 'fr'
        ? `Échec de la reformulation du texte : ${error instanceof Error ? error.message : "Erreur inconnue"}`
        : `Failed to reformulate text: ${error instanceof Error ? error.message : "Unknown error"}`;
    return { 
      reformulatedText: errorMessage,
      styleUsed: input.style 
    };
  }
}

export async function researchContextualAction(input: ResearchContextualInput): Promise<ResearchContextualOutput> {
  try {
    // Language is now part of ResearchContextualInput
    const result = await researchContextualFlow(input);
    const defaultError = input.language === 'fr'
        ? "Échec de la recherche contextuelle : Réponse invalide de l'IA."
        : "Failed to perform contextual research: Invalid response from AI.";
    if (!result || typeof result.researchResult !== 'string') {
      console.error("Invalid result from researchContextualFlow:", result);
      return { researchResult: defaultError };
    }
    return result;
  } catch (error) {
    console.error("Error in researchContextualAction:", error);
    const errorMessage = input.language === 'fr'
        ? `Échec de la recherche contextuelle : ${error instanceof Error ? error.message : "Erreur inconnue"}`
        : `Failed to perform contextual research: ${error instanceof Error ? error.message : "Unknown error"}`;
    return { researchResult: errorMessage };
  }
}

export async function researchManipulationAction(input: ResearchManipulationInput): Promise<ResearchManipulationOutput> {
  try {
    // Language is now part of ResearchManipulationInput
    const result = await researchManipulationFlow(input);
    const defaultError = input.language === 'fr'
        ? "Échec de l'analyse de manipulation : Réponse invalide de l'IA."
        : "Failed to perform manipulation research: Invalid response from AI.";
    if (!result || typeof result.manipulationInsights !== 'string') {
      console.error("Invalid result from researchManipulationFlow:", result);
      return { manipulationInsights: defaultError };
    }
    return result;
  } catch (error) {
    console.error("Error in researchManipulationAction:", error);
    const errorMessage = input.language === 'fr'
        ? `Échec de l'analyse de manipulation : ${error instanceof Error ? error.message : "Erreur inconnue"}`
        : `Failed to perform manipulation research: ${error instanceof Error ? error.message : "Unknown error"}`;
    return { manipulationInsights: errorMessage };
  }
}

export async function generatePersonaProfileAction(input: GeneratePersonaProfileInput): Promise<GeneratePersonaProfileOutput> {
  try {
    const result = await generatePersonaProfileFlow(input);
    if (!result || !result.personaProfile || !result.personaProfile.name) {
       const lang = input.language || 'fr';
       const errorMsg = lang === 'fr' ? 'Réponse invalide de la génération de profil.' : 'Invalid response from persona profile generation.';
      throw new Error(errorMsg);
    }
    return result;
  } catch (error) {
    console.error("Error in generatePersonaProfileAction:", error);
    const lang = input.language || 'fr';
    const errorMessage = lang === 'fr' 
      ? `Échec de la génération du profil de persona : ${error instanceof Error ? error.message : "Erreur inconnue"}`
      : `Failed to generate persona profile: ${error instanceof Error ? error.message : "Unknown error"}`;
    
    return {
      personaProfile: {
        name: input.personaName || (lang === 'fr' ? "Persona Indéfini (Erreur)" : "Undefined Persona (Error)"),
        tagline: errorMessage,
        overallDescription: lang === 'fr' ? "Description indisponible en raison d'une erreur." : "Description unavailable due to an error.",
        identitySignatures: {
          ame: { concept: "", coreValues: [], toneAndVoice: "", keyStatements: [] },
          systemeNerveux: { concept: "", coreCapabilities: [], methodology: { name: "", steps: [] }, functionalOutputs: [] }
        }
        // operationalFormats removed here as well for consistency in error object, though the schema doesn't have it anymore.
      }
    };
  }
}


export async function chatWithPersonaAction(input: ChatWithPersonaInput): Promise<ChatWithPersonaOutput> {
  try {
    const result = await chatWithPersonaFlow(input);
    const defaultError = input.language === 'fr'
        ? "Échec de la conversation : Réponse invalide du persona."
        : "Failed to chat: Invalid response from persona.";
    if (!result || typeof result.personaResponse !== 'string') {
      console.error("Invalid result from chatWithPersonaFlow:", result);
      return { personaResponse: defaultError };
    }
    return result;
  } catch (error) {
    console.error("Error in chatWithPersonaAction:", error);
    const errorMessage = input.language === 'fr'
        ? `Échec de la conversation : ${error instanceof Error ? error.message : "Erreur inconnue"}`
        : `Failed to chat: ${error instanceof Error ? error.message : "Unknown error"}`;
    return { personaResponse: errorMessage };
  }
}
