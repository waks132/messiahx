
"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputPanel } from "@/components/panels/input-panel";
import { CognitiveAnalysisPanel } from "@/components/panels/cognitive-analysis-panel";
import { CriticalSummaryPanel, type AnalysisStyle } from "@/components/panels/critical-summary-panel";
import { ParanoidReadingPanel } from "@/components/panels/paranoid-reading-panel";
import { CognitiveClassificationPanel } from "@/components/panels/cognitive-classification-panel";
import { analyzeTextAction, generateCriticalSummaryAction, detectHiddenNarrativesAction, classifyCognitiveCategoriesAction } from "@/app/actions";
import type { AnalyzeTextOutput, AnalyzeTextInput } from '@/ai/flows/analyze-text-for-manipulation';
import type { GenerateCriticalSummaryOutput } from '@/ai/flows/generate-critical-summary';
import type { DetectHiddenNarrativesOutput } from '@/ai/flows/detect-hidden-narratives';
import type { ClassifyCognitiveCategoriesInput, ClassifyCognitiveCategoriesOutput } from '@/ai/flows/classify-cognitive-categories';
import { Logo } from '@/components/logo';
import { useToast } from "@/hooks/use-toast";
import { FileText, ListChecks, Quote, Drama, Settings2, BrainCircuit, SearchCheck } from 'lucide-react';

// Default empty state for analysisResults
const initialAnalysisResults: AnalyzeTextOutput = {
  summary: "",
  rhetoricalTechniques: [],
  cognitiveBiases: [],
  unverifiableFacts: [],
};

// Default empty state for classificationResult
const initialClassificationResult: ClassifyCognitiveCategoriesOutput = {
  classifiedCategories: [],
  overallClassification: {
    type: 'other',
    score: 0,
    reasoning: '',
  }
};


export default function CognitiveMapperClient() {
  const [inputText, setInputText] = useState<string>("");
  const [analysisResults, setAnalysisResults] = useState<AnalyzeTextOutput | null>(null);
  const [criticalSummaryResult, setCriticalSummaryResult] = useState<GenerateCriticalSummaryOutput | null>(null);
  const [paranoidReadingResult, setParanoidReadingResult] = useState<DetectHiddenNarrativesOutput | null>(null);
  const [classificationResult, setClassificationResult] = useState<ClassifyCognitiveCategoriesOutput | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [isGeneratingParanoid, setIsGeneratingParanoid] = useState<boolean>(false);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("input");

  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast({ title: "Erreur", description: "Le champ de texte est vide.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResults(null); 
    setCriticalSummaryResult(null); 
    setParanoidReadingResult(null);
    setClassificationResult(null); 

    try {
      const results = await analyzeTextAction({ text: inputText });
      setAnalysisResults(results);
      if (results.summary.startsWith("Failed to analyze text")) {
        toast({ title: "Erreur d'analyse", description: results.summary, variant: "destructive" });
      } else {
        toast({ title: "Succès", description: "Analyse initiale terminée." });
        setActiveTab("analysis"); 
      }
    } catch (error: any) { // Catching errors from the action call itself if it throws
      toast({ title: "Erreur d'analyse", description: error.message || "Une erreur inattendue est survenue lors de l'analyse.", variant: "destructive" });
      setAnalysisResults(initialAnalysisResults); // Reset to initial empty state
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateSummary = async (style: AnalysisStyle) => {
    if (!inputText.trim()) {
      toast({ title: "Erreur", description: "Aucun texte à résumer. Veuillez d'abord entrer un texte.", variant: "destructive" });
      return;
    }
    setIsGeneratingSummary(true);
    setCriticalSummaryResult(null);
    try {
      // Use analysisResults.summary if available and not an error message, otherwise use inputText
      const textToSummarize = (analysisResults && !analysisResults.summary.startsWith("Failed")) ? analysisResults.summary : inputText;
      const summary = await generateCriticalSummaryAction({ analyzedText: textToSummarize, analysisStyle: style });
      setCriticalSummaryResult(summary);
      if (summary.summary.startsWith("Failed to generate critical summary")) {
        toast({ title: "Erreur de résumé", description: summary.summary, variant: "destructive" });
      } else {
        toast({ title: "Succès", description: "Résumé critique généré." });
      }
    } catch (error: any) {
      toast({ title: "Erreur de résumé", description: error.message || "Une erreur inattendue est survenue.", variant: "destructive" });
       setCriticalSummaryResult({ summary: ""});
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateParanoidReading = async () => {
    if (!inputText.trim()) {
      toast({ title: "Erreur", description: "Aucun texte pour la lecture paranoïaque. Veuillez d'abord entrer un texte.", variant: "destructive" });
      return;
    }
    setIsGeneratingParanoid(true);
    setParanoidReadingResult(null);
    try {
      const reading = await detectHiddenNarrativesAction({ text: inputText });
      setParanoidReadingResult(reading);
      if (reading.hiddenNarratives.startsWith("Failed to detect hidden narratives")) {
         toast({ title: "Erreur de lecture", description: reading.hiddenNarratives, variant: "destructive" });
      } else {
        toast({ title: "Succès", description: "Lecture paranoïaque terminée." });
      }
    } catch (error: any) {
      toast({ title: "Erreur de lecture", description: error.message || "Une erreur inattendue est survenue.", variant: "destructive" });
      setParanoidReadingResult({ hiddenNarratives: "" });
    } finally {
      setIsGeneratingParanoid(false);
    }
  };

  const handleClassifyCognitiveCategories = async () => {
    if (!analysisResults || !analysisResults.summary || analysisResults.summary.startsWith("Failed")) {
       toast({ title: "Erreur", description: "L'analyse initiale doit être effectuée avec succès avant la classification.", variant: "destructive" });
      return;
    }
    setIsClassifying(true);
    setClassificationResult(null);
    try {
      const input: ClassifyCognitiveCategoriesInput = {
        analysisSummary: analysisResults.summary,
        rhetoricalTechniques: analysisResults.rhetoricalTechniques || [],
        cognitiveBiases: analysisResults.cognitiveBiases || [],
        unverifiableFacts: analysisResults.unverifiableFacts || [],
        originalText: inputText,
      };
      const result = await classifyCognitiveCategoriesAction(input);
      setClassificationResult(result);
      if (result.overallClassification.reasoning.startsWith("Failed to classify cognitive categories")) {
        toast({ title: "Erreur de Classification", description: result.overallClassification.reasoning, variant: "destructive" });
      } else {
        toast({ title: "Succès", description: "Classification cognitive détaillée terminée." });
      }
    } catch (error: any) {
      toast({ title: "Erreur de Classification", description: error.message || "Une erreur inattendue est survenue.", variant: "destructive" });
      setClassificationResult(initialClassificationResult);
    } finally {
      setIsClassifying(false);
    }
  };


  const isBaseTextAvailable = !!inputText.trim();
  const isBaseAnalysisDone = !!analysisResults && !analysisResults.summary.startsWith("Failed");

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Logo />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6 bg-primary/5 backdrop-blur-sm p-1.5 rounded-lg">
          <TabsTrigger value="input" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
            <FileText className="mr-2 h-4 w-4" /> Entrée
          </TabsTrigger>
          <TabsTrigger value="analysis" disabled={!isBaseAnalysisDone && !isAnalyzing} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
            <SearchCheck className="mr-2 h-4 w-4" /> Analyse Initiale
          </TabsTrigger>
           <TabsTrigger value="classification" disabled={!isBaseAnalysisDone && !isClassifying} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
            <BrainCircuit className="mr-2 h-4 w-4" /> Classification
          </TabsTrigger>
          <TabsTrigger value="summary" disabled={!isBaseTextAvailable && !isGeneratingSummary} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
            <Quote className="mr-2 h-4 w-4" /> Résumé Critique
          </TabsTrigger>
          <TabsTrigger value="paranoid" disabled={!isBaseTextAvailable && !isGeneratingParanoid} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
            <Drama className="mr-2 h-4 w-4" /> Lecture Paranoïaque
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <InputPanel 
            inputText={inputText} 
            setInputText={setInputText} 
            handleAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </TabsContent>
        <TabsContent value="analysis">
          <CognitiveAnalysisPanel analysisResults={analysisResults} isLoading={isAnalyzing} />
        </TabsContent>
         <TabsContent value="classification">
          <CognitiveClassificationPanel
            classificationResult={classificationResult}
            handleClassifyCognitiveCategories={handleClassifyCognitiveCategories}
            isLoading={isClassifying}
            isReadyToClassify={isBaseAnalysisDone}
          />
        </TabsContent>
        <TabsContent value="summary">
          <CriticalSummaryPanel 
            criticalSummaryResult={criticalSummaryResult}
            handleGenerateSummary={handleGenerateSummary}
            isLoading={isGeneratingSummary}
            isBaseTextAvailable={isBaseTextAvailable}
          />
        </TabsContent>
        <TabsContent value="paranoid">
          <ParanoidReadingPanel 
            paranoidReadingResult={paranoidReadingResult}
            handleGenerateParanoidReading={handleGenerateParanoidReading}
            isLoading={isGeneratingParanoid}
            isBaseTextAvailable={isBaseTextAvailable}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
