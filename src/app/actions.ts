
'use server';

import { analyzeText as analyzeTextForManipulationFlow, type AnalyzeTextInput, type AnalyzeTextOutput } from '@/ai/flows/analyze-text-for-manipulation';
import { generateCriticalSummary as generateCriticalSummaryFlow, type GenerateCriticalSummaryInput, type GenerateCriticalSummaryOutput } from '@/ai/flows/generate-critical-summary';
import { detectHiddenNarratives as detectHiddenNarrativesFlow, type DetectHiddenNarrativesInput, type DetectHiddenNarrativesOutput } from '@/ai/flows/detect-hidden-narratives';
import { classifyCognitiveCategories as classifyCognitiveCategoriesFlow, type ClassifyCognitiveCategoriesInput, type ClassifyCognitiveCategoriesOutput } from '@/ai/flows/classify-cognitive-categories';

export async function analyzeTextAction(input: AnalyzeTextInput): Promise<AnalyzeTextOutput> {
  try {
    return await analyzeTextForManipulationFlow(input);
  } catch (error) {
    console.error("Error in analyzeTextAction:", error);
    throw new Error("Failed to analyze text. Please try again.");
  }
}

export async function generateCriticalSummaryAction(input: GenerateCriticalSummaryInput): Promise<GenerateCriticalSummaryOutput> {
  try {
    return await generateCriticalSummaryFlow(input);
  } catch (error)
  {
    console.error("Error in generateCriticalSummaryAction:", error);
    throw new Error("Failed to generate critical summary. Please try again.");
  }
}

export async function detectHiddenNarrativesAction(input: DetectHiddenNarrativesInput): Promise<DetectHiddenNarrativesOutput> {
  try {
    return await detectHiddenNarrativesFlow(input);
  } catch (error) {
    console.error("Error in detectHiddenNarrativesAction:", error);
    throw new Error("Failed to detect hidden narratives. Please try again.");
  }
}

export async function classifyCognitiveCategoriesAction(input: ClassifyCognitiveCategoriesInput): Promise<ClassifyCognitiveCategoriesOutput> {
  try {
    return await classifyCognitiveCategoriesFlow(input);
  } catch (error) {
    console.error("Error in classifyCognitiveCategoriesAction:", error);
    // It's good to provide a more specific error message if possible, or rethrow a custom error.
    if (error instanceof Error) {
       throw new Error(`Failed to classify cognitive categories: ${error.message}`);
    }
    throw new Error("Failed to classify cognitive categories. An unknown error occurred.");
  }
}
