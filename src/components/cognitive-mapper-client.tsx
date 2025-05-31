
"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputPanel } from "@/components/panels/input-panel";
import { CognitiveAnalysisPanel } from "@/components/panels/cognitive-analysis-panel";
import { CriticalSummaryPanel, type AnalysisStyle } from "@/components/panels/critical-summary-panel";
import { ParanoidReadingPanel } from "@/components/panels/paranoid-reading-panel";
import { CognitiveClassificationPanel } from "@/components/panels/cognitive-classification-panel";
import { analyzeTextAction, generateCriticalSummaryAction, detectHiddenNarrativesAction, classifyCognitiveCategoriesAction } from "@/app/actions";
import type { AnalyzeTextOutput } from '@/ai/flows/analyze-text-for-manipulation';
import type { GenerateCriticalSummaryOutput } from '@/ai/flows/generate-critical-summary';
import type { DetectHiddenNarrativesOutput } from '@/ai/flows/detect-hidden-narratives';
import type { ClassifyCognitiveCategoriesInput, ClassifyCognitiveCategoriesOutput } from '@/ai/flows/classify-cognitive-categories';
import { Logo } from '@/components/logo';
import { useToast } from "@/hooks/use-toast";
import { FileText, ListChecks, Quote, Drama, Settings2, BrainCircuit } from 'lucide-react';

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
      toast({ title: "Succès", description: "Analyse cognitive terminée." });
      setActiveTab("analysis"); 
    } catch (error: any) {
      toast({ title: "Erreur d'analyse", description: error.message, variant: "destructive" });
      setAnalysisResults(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateSummary = async (style: AnalysisStyle) => {
    if (!inputText.trim()) {
      toast({ title: "Erreur", description: "Aucun texte à résumer. Veuillez d'abord analyser un texte.", variant: "destructive" });
      return;
    }
    setIsGeneratingSummary(true);
    setCriticalSummaryResult(null);
    try {
      const summary = await generateCriticalSummaryAction({ analyzedText: inputText, analysisStyle: style });
      setCriticalSummaryResult(summary);
      toast({ title: "Succès", description: "Résumé critique généré." });
    } catch (error: any) {
      toast({ title: "Erreur de résumé", description: error.message, variant: "destructive" });
       setCriticalSummaryResult(null);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateParanoidReading = async () => {
    if (!inputText.trim()) {
      toast({ title: "Erreur", description: "Aucun texte pour la lecture paranoïaque. Veuillez d'abord analyser un texte.", variant: "destructive" });
      return;
    }
    setIsGeneratingParanoid(true);
    setParanoidReadingResult(null);
    try {
      const reading = await detectHiddenNarrativesAction({ text: inputText });
      setParanoidReadingResult(reading);
      toast({ title: "Succès", description: "Lecture paranoïaque terminée." });
    } catch (error: any) {
      toast({ title: "Erreur de lecture", description: error.message, variant: "destructive" });
      setParanoidReadingResult(null);
    } finally {
      setIsGeneratingParanoid(false);
    }
  };

  const handleClassifyCognitiveCategories = async (input: ClassifyCognitiveCategoriesInput) => {
    if (!analysisResults) {
       toast({ title: "Erreur", description: "L'analyse de base doit être effectuée avant la classification.", variant: "destructive" });
      return;
    }
    setIsClassifying(true);
    setClassificationResult(null);
    try {
      const result = await classifyCognitiveCategoriesAction(input);
      setClassificationResult(result);
      toast({ title: "Succès", description: "Classification cognitive détaillée terminée." });
    } catch (error: any) {
      toast({ title: "Erreur de Classification", description: error.message, variant: "destructive" });
      setClassificationResult(null);
    } finally {
      setIsClassifying(false);
    }
  };


  const isBaseTextAvailable = !!inputText.trim();
  const isBaseAnalysisDone = !!analysisResults;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Logo />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-6 bg-primary/5 backdrop-blur-sm p-1.5 rounded-lg">
          <TabsTrigger value="input" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
            <FileText className="mr-2 h-4 w-4" /> Entrée & Analyse
          </TabsTrigger>
          <TabsTrigger value="analysis" disabled={!analysisResults && !isAnalyzing} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
            <ListChecks className="mr-2 h-4 w-4" /> Analyse Cognitive
          </TabsTrigger>
           <TabsTrigger value="classification" disabled={!isBaseAnalysisDone && !isClassifying} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
            <BrainCircuit className="mr-2 h-4 w-4" /> Classification
          </TabsTrigger>
          <TabsTrigger value="summary" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
            <Quote className="mr-2 h-4 w-4" /> Résumé Critique
          </TabsTrigger>
          <TabsTrigger value="paranoid" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
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
            baseAnalysisResults={analysisResults}
            originalText={inputText}
            handleClassifyCognitiveCategories={handleClassifyCognitiveCategories}
            isLoading={isClassifying}
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
