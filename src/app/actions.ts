
'use server';

import { analyzeText as analyzeTextForManipulationFlow, type AnalyzeTextInput, type AnalyzeTextOutput } from '@/ai/flows/analyze-text-for-manipulation';
import { generateCriticalSummary as generateCriticalSummaryFlow, type GenerateCriticalSummaryInput, type GenerateCriticalSummaryOutput } from '@/ai/flows/generate-critical-summary';
import { detectHiddenNarratives as detectHiddenNarrativesFlow, type DetectHiddenNarrativesInput, type DetectHiddenNarrativesOutput } from '@/ai/flows/detect-hidden-narratives';
import { classifyCognitiveCategories as classifyCognitiveCategoriesFlow, type ClassifyCognitiveCategoriesInput, type ClassifyCognitiveCategoriesOutput } from '@/ai/flows/classify-cognitive-categories';
import { reformulateText as reformulateTextFlow, type ReformulateTextInput, type ReformulateTextOutput } from '@/ai/flows/reformulate-text';
import { researchContextual as researchContextualFlow, type ResearchContextualInput, type ResearchContextualOutput } from '@/ai/flows/research-contextual-flow';
import { researchManipulation as researchManipulationFlow, type ResearchManipulationInput, type ResearchManipulationOutput } from '@/ai/flows/research-manipulation-flow';


export async function analyzeTextAction(input: AnalyzeTextInput): Promise<AnalyzeTextOutput> {
  try {
    const result = await analyzeTextForManipulationFlow(input);
    return {
      summary: result.summary || "Analysis summary not available.",
      rhetoricalTechniques: result.rhetoricalTechniques || [],
      cognitiveBiases: result.cognitiveBiases || [],
      unverifiableFacts: result.unverifiableFacts || [],
    };
  } catch (error) {
    console.error("Error in analyzeTextAction:", error);
    return {
      summary: `Failed to analyze text: ${error instanceof Error ? error.message : "Unknown error"}`,
      rhetoricalTechniques: [],
      cognitiveBiases: [],
      unverifiableFacts: [],
    };
  }
}

export async function generateCriticalSummaryAction(input: GenerateCriticalSummaryInput): Promise<GenerateCriticalSummaryOutput> {
  try {
    const result = await generateCriticalSummaryFlow(input);
    if (!result || typeof result.summary !== 'string') {
      console.error("Invalid result from generateCriticalSummaryFlow:", result);
      return { summary: "Failed to generate critical summary: Invalid response from AI." };
    }
    return result;
  } catch (error) {
    console.error("Error in generateCriticalSummaryAction:", error);
    return { summary: `Failed to generate critical summary: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

export async function detectHiddenNarrativesAction(input: DetectHiddenNarrativesInput): Promise<DetectHiddenNarrativesOutput> {
  try {
    const result = await detectHiddenNarrativesFlow(input);
    if (!result || typeof result.hiddenNarratives !== 'string') {
      console.error("Invalid result from detectHiddenNarrativesFlow:", result);
      return { hiddenNarratives: "Failed to detect hidden narratives: Invalid response from AI." };
    }
    return result;
  } catch (error) {
    console.error("Error in detectHiddenNarrativesAction:", error);
    return { hiddenNarratives: `Failed to detect hidden narratives: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

export async function classifyCognitiveCategoriesAction(input: ClassifyCognitiveCategoriesInput): Promise<ClassifyCognitiveCategoriesOutput> {
  try {
    const result = await classifyCognitiveCategoriesFlow(input);
     return {
      classifiedCategories: result.classifiedCategories || [],
      overallClassification: result.overallClassification || { type: 'other', score: 0, reasoning: 'Classification data incomplete.' }
    };
  } catch (error) {
    console.error("Error in classifyCognitiveCategoriesAction:", error);
    let errorMessage = "An unknown error occurred during classification.";
    if (error instanceof Error) {
       errorMessage = error.message;
    }
    return {
      classifiedCategories: [],
      overallClassification: { type: 'other', score: 0, reasoning: `Failed to classify cognitive categories: ${errorMessage}` }
    };
  }
}

export async function reformulateTextAction(input: ReformulateTextInput): Promise<ReformulateTextOutput> {
  try {
    const result = await reformulateTextFlow(input);
    if (!result || typeof result.reformulatedText !== 'string' || typeof result.styleUsed !== 'string') {
      console.error("Invalid result from reformulateTextFlow:", result);
      return { 
        reformulatedText: "Failed to reformulate text: Invalid response from AI.",
        styleUsed: input.style 
      };
    }
    return result;
  } catch (error) {
    console.error("Error in reformulateTextAction:", error);
    return { 
      reformulatedText: `Failed to reformulate text: ${error instanceof Error ? error.message : "Unknown error"}`,
      styleUsed: input.style 
    };
  }
}

export async function researchContextualAction(input: ResearchContextualInput): Promise<ResearchContextualOutput> {
  try {
    const result = await researchContextualFlow(input);
    if (!result || typeof result.researchResult !== 'string') {
      console.error("Invalid result from researchContextualFlow:", result);
      return { researchResult: "Failed to perform contextual research: Invalid response from AI." };
    }
    return result;
  } catch (error) {
    console.error("Error in researchContextualAction:", error);
    return { researchResult: `Failed to perform contextual research: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

export async function researchManipulationAction(input: ResearchManipulationInput): Promise<ResearchManipulationOutput> {
  try {
    const result = await researchManipulationFlow(input);
    if (!result || typeof result.manipulationInsights !== 'string') {
      console.error("Invalid result from researchManipulationFlow:", result);
      return { manipulationInsights: "Failed to perform manipulation research: Invalid response from AI." };
    }
    return result;
  } catch (error) {
    console.error("Error in researchManipulationAction:", error);
    return { manipulationInsights: `Failed to perform manipulation research: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

    