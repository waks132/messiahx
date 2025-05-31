
'use server';

import { analyzeText as analyzeTextForManipulationFlow, type AnalyzeTextInput, type AnalyzeTextOutput } from '@/ai/flows/analyze-text-for-manipulation';
import { generateCriticalSummary as generateCriticalSummaryFlow, type GenerateCriticalSummaryInput, type GenerateCriticalSummaryOutput } from '@/ai/flows/generate-critical-summary';
import { detectHiddenNarratives as detectHiddenNarrativesFlow, type DetectHiddenNarrativesInput, type DetectHiddenNarrativesOutput } from '@/ai/flows/detect-hidden-narratives';
import { classifyCognitiveCategories as classifyCognitiveCategoriesFlow, type ClassifyCognitiveCategoriesInput, type ClassifyCognitiveCategoriesOutput } from '@/ai/flows/classify-cognitive-categories';

export async function analyzeTextAction(input: AnalyzeTextInput): Promise<AnalyzeTextOutput> {
  try {
    const result = await analyzeTextForManipulationFlow(input);
    // Ensure all arrays are present, even if empty, to prevent downstream errors
    return {
      summary: result.summary || "Analysis summary not available.",
      rhetoricalTechniques: result.rhetoricalTechniques || [],
      cognitiveBiases: result.cognitiveBiases || [],
      unverifiableFacts: result.unverifiableFacts || [],
    };
  } catch (error) {
    console.error("Error in analyzeTextAction:", error);
    // Return a structured error object or a default safe AnalyzeTextOutput
    return {
      summary: "Failed to analyze text. Please try again.",
      rhetoricalTechniques: [],
      cognitiveBiases: [],
      unverifiableFacts: [],
      // You could add an error field here if the AnalyzeTextOutput schema supported it
    };
  }
}

export async function generateCriticalSummaryAction(input: GenerateCriticalSummaryInput): Promise<GenerateCriticalSummaryOutput> {
  try {
    return await generateCriticalSummaryFlow(input);
  } catch (error)
  {
    console.error("Error in generateCriticalSummaryAction:", error);
    return { summary: "Failed to generate critical summary. Please try again." };
  }
}

export async function detectHiddenNarrativesAction(input: DetectHiddenNarrativesInput): Promise<DetectHiddenNarrativesOutput> {
  try {
    return await detectHiddenNarrativesFlow(input);
  } catch (error) {
    console.error("Error in detectHiddenNarrativesAction:", error);
    return { hiddenNarratives: "Failed to detect hidden narratives. Please try again." };
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
    let errorMessage = "Failed to classify cognitive categories. An unknown error occurred.";
    if (error instanceof Error) {
       errorMessage = `Failed to classify cognitive categories: ${error.message}`;
    }
    // Return a default safe ClassifyCognitiveCategoriesOutput
    return {
      classifiedCategories: [],
      overallClassification: { type: 'other', score: 0, reasoning: errorMessage }
    };
  }
}
