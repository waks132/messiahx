
"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputPanel } from "@/components/panels/input-panel";
import { CognitiveAnalysisPanel } from "@/components/panels/cognitive-analysis-panel";
import { CriticalSummaryPanel, type AnalysisStyle } from "@/components/panels/critical-summary-panel";
import { ParanoidReadingPanel } from "@/components/panels/paranoid-reading-panel";
import { CognitiveClassificationPanel } from "@/components/panels/cognitive-classification-panel";
import { ReformulationPanel } from "@/components/panels/reformulation-panel";
import PromptConfigPage from "@/app/config/prompts/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  analyzeTextAction, 
  generateCriticalSummaryAction, 
  detectHiddenNarrativesAction, 
  classifyCognitiveCategoriesAction,
  reformulateTextAction,
  researchContextualAction,
  researchManipulationAction
} from "@/app/actions";
import type { AnalyzeTextOutput, AnalyzeTextInput } from '@/ai/flows/analyze-text-for-manipulation';
import type { GenerateCriticalSummaryOutput } from '@/ai/flows/generate-critical-summary';
import type { DetectHiddenNarrativesOutput } from '@/ai/flows/detect-hidden-narratives';
import type { ClassifyCognitiveCategoriesInput, ClassifyCognitiveCategoriesOutput } from '@/ai/flows/classify-cognitive-categories';
import type { ReformulateTextInput, ReformulateTextOutput } from '@/ai/flows/reformulate-text';
import type { ResearchContextualInput, ResearchContextualOutput } from '@/ai/flows/research-contextual-flow';
import type { ResearchManipulationInput, ResearchManipulationOutput } from '@/ai/flows/research-manipulation-flow';

import { Logo } from '@/components/logo';
import { useToast } from "@/hooks/use-toast";
import { FileText, Quote, Drama, BrainCircuit, SearchCheck, PenTool, Settings, Telescope, MessageSquareText } from 'lucide-react';

const initialAnalysisResults: AnalyzeTextOutput = {
  summary: "",
  rhetoricalTechniques: [],
  cognitiveBiases: [],
  unverifiableFacts: [],
};

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
  const [researchQueryText, setResearchQueryText] = useState<string>(""); 
  
  const [analysisResults, setAnalysisResults] = useState<AnalyzeTextOutput>(initialAnalysisResults);
  const [criticalSummaryResult, setCriticalSummaryResult] = useState<GenerateCriticalSummaryOutput | null>(null);
  const [paranoidReadingResult, setParanoidReadingResult] = useState<DetectHiddenNarrativesOutput | null>(null);
  const [classificationResult, setClassificationResult] = useState<ClassifyCognitiveCategoriesOutput>(initialClassificationResult);
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [isGeneratingParanoid, setIsGeneratingParanoid] = useState<boolean>(false);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);

  const [reformulationInputText, setReformulationInputText] = useState<string>("");
  const [selectedReformulationStyle, setSelectedReformulationStyle] = useState<string>("neutral");
  const [reformulationResult, setReformulationResult] = useState<ReformulateTextOutput | null>(null);
  const [isReformulating, setIsReformulating] = useState<boolean>(false);

  const [isSearchingContextual, setIsSearchingContextual] = useState<boolean>(false);
  const [contextualSearchResult, setContextualSearchResult] = useState<ResearchContextualOutput | null>(null);
  const [isSearchingManipulation, setIsSearchingManipulation] = useState<boolean>(false);
  const [manipulationSearchResult, setManipulationSearchResult] = useState<ResearchManipulationOutput | null>(null);


  const [activeTab, setActiveTab] = useState<string>("input");
  const { toast } = useToast();

  useEffect(() => {
    // Prime reformulation input only if it's empty and main input text is available.
    // This prevents overwriting user's specific text in reformulation tab.
    if (inputText && reformulationInputText.trim() === "") {
      setReformulationInputText(inputText);
    }
    // Research query is independent and should not be auto-filled from main input here
    // to avoid confusion and ensure user explicitly enters research terms.
  }, [inputText]); // Only depend on inputText for this specific priming logic

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast({ title: "Erreur", description: "Le champ de texte pour l'analyse principale est vide.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResults(initialAnalysisResults); 
    setCriticalSummaryResult(null); 
    setParanoidReadingResult(null);
    setClassificationResult(initialClassificationResult); 
    
    // Do not automatically clear reformulation input or other search results here
    // setReformulationResult(null); 
    // setContextualSearchResult(null);
    // setManipulationSearchResult(null);
    // Prime reformulation input if it's currently empty
    if (reformulationInputText.trim() === "" && inputText.trim() !== "") {
      setReformulationInputText(inputText);
    }


    try {
      const results = await analyzeTextAction({ text: inputText });
      setAnalysisResults(results);
      if (results.summary.startsWith("Failed to analyze text")) {
        toast({ title: "Erreur d'Analyse Initiale", description: results.summary, variant: "destructive" });
      } else {
        toast({ title: "Succès", description: "Analyse initiale terminée." });
        setActiveTab("analysis"); 
      }
    } catch (error: any) {
      toast({ title: "Erreur d'Analyse Initiale", description: error.message || "Une erreur inattendue est survenue.", variant: "destructive" });
      setAnalysisResults(initialAnalysisResults);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateSummary = async (style: AnalysisStyle) => {
    if (!inputText.trim() && !analysisResults.summary) {
      toast({ title: "Erreur", description: "Aucun texte à résumer.", variant: "destructive" });
      return;
    }
    setIsGeneratingSummary(true);
    setCriticalSummaryResult(null);
    try {
      const textToSummarize = (analysisResults.summary && !analysisResults.summary.startsWith("Failed")) ? analysisResults.summary : inputText;
      const summary = await generateCriticalSummaryAction({ analyzedText: textToSummarize, analysisStyle: style });
      setCriticalSummaryResult(summary);
      if (summary.summary.startsWith("Failed to generate critical summary")) {
        toast({ title: "Erreur de Résumé Critique", description: summary.summary, variant: "destructive" });
      } else {
        toast({ title: "Succès", description: "Résumé critique généré." });
      }
    } catch (error: any) {
      toast({ title: "Erreur de Résumé Critique", description: error.message || "Une erreur inattendue est survenue.", variant: "destructive" });
       setCriticalSummaryResult({ summary: "Échec de la génération du résumé."});
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateParanoidReading = async () => {
    if (!inputText.trim()) {
      toast({ title: "Erreur", description: "Aucun texte pour la lecture paranoïaque.", variant: "destructive" });
      return;
    }
    setIsGeneratingParanoid(true);
    setParanoidReadingResult(null);
    try {
      const reading = await detectHiddenNarrativesAction({ text: inputText });
      setParanoidReadingResult(reading);
      if (reading.hiddenNarratives.startsWith("Failed to detect hidden narratives")) {
         toast({ title: "Erreur de Lecture Paranoïaque", description: reading.hiddenNarratives, variant: "destructive" });
      } else {
        toast({ title: "Succès", description: "Lecture paranoïaque terminée." });
      }
    } catch (error: any) {
      toast({ title: "Erreur de Lecture Paranoïaque", description: error.message || "Une erreur inattendue est survenue.", variant: "destructive" });
      setParanoidReadingResult({ hiddenNarratives: "Échec de la détection des narratifs cachés." });
    } finally {
      setIsGeneratingParanoid(false);
    }
  };

  const handleClassifyCognitiveCategories = async () => {
    if (!analysisResults || analysisResults.summary.startsWith("Failed")) {
       toast({ title: "Erreur", description: "L'analyse initiale doit être effectuée avec succès avant la classification.", variant: "destructive" });
      return;
    }
    setIsClassifying(true);
    setClassificationResult(initialClassificationResult);
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
        toast({ title: "Erreur de Classification Cognitive", description: result.overallClassification.reasoning, variant: "destructive" });
      } else {
        toast({ title: "Succès", description: "Classification cognitive détaillée terminée." });
      }
    } catch (error: any) {
      toast({ title: "Erreur de Classification Cognitive", description: error.message || "Une erreur inattendue est survenue.", variant: "destructive" });
      setClassificationResult(initialClassificationResult);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleReformulate = async () => { // Takes no argument, uses state
    if (!reformulationInputText.trim()) {
      toast({ title: "Erreur", description: "Le champ de texte pour la reformulation est vide.", variant: "destructive" });
      return;
    }
    setIsReformulating(true);
    setReformulationResult(null);
    try {
      const result = await reformulateTextAction({ text: reformulationInputText, style: selectedReformulationStyle });
      setReformulationResult(result);
      if (result.reformulatedText.startsWith("Failed to reformulate") || result.reformulatedText.startsWith("Error:") || result.reformulatedText.startsWith("The model did not provide")) {
        toast({ title: "Erreur de Reformulation", description: result.reformulatedText, variant: "destructive", duration: 8000 });
      } else {
        toast({ title: "Succès", description: `Texte reformulé avec le style "${result.styleUsed}".` });
      }
    } catch (error: any) {
      toast({ title: "Erreur de Reformulation", description: error.message || "Une erreur inattendue est survenue.", variant: "destructive", duration: 8000 });
      setReformulationResult({ reformulatedText: `Échec de la reformulation : ${error.message || "Erreur inconnue"}`, styleUsed: selectedReformulationStyle });
    } finally {
      setIsReformulating(false);
    }
  };

  const handleContextualSearch = async () => {
    if (!researchQueryText.trim()) { 
      toast({ title: "Erreur", description: "Le champ de recherche contextuelle est vide.", variant: "destructive" });
      return;
    }
    setIsSearchingContextual(true);
    setContextualSearchResult(null);
    try {
      const result = await researchContextualAction({ text: researchQueryText }); 
      setContextualSearchResult(result);
      if (result.researchResult.startsWith("Failed") || result.researchResult.startsWith("Error:") || result.researchResult.startsWith("The model did not provide")) {
        toast({ title: "Erreur de Recherche Contextuelle", description: result.researchResult, variant: "destructive", duration: 8000 });
      } else {
        toast({ title: "Recherche Contextuelle Terminée", description: `Résultat disponible. Voir ci-dessous.`, duration: 5000 });
      }
    } catch (error: any) {
      toast({ title: "Erreur de Recherche Contextuelle", description: error.message || "Une erreur inattendue.", variant: "destructive", duration: 8000 });
       setContextualSearchResult({researchResult: `Échec de la recherche: ${error.message || "Erreur inconnue"}`});
    } finally {
      setIsSearchingContextual(false);
    }
  };

  const handleManipulationSearch = async () => {
    if (!researchQueryText.trim()) { 
      toast({ title: "Erreur", description: "Le champ d'analyse de manipulation est vide.", variant: "destructive" });
      return;
    }
    setIsSearchingManipulation(true);
    setManipulationSearchResult(null);
    try {
      const result = await researchManipulationAction({ text: researchQueryText }); 
      setManipulationSearchResult(result);
       if (result.manipulationInsights.startsWith("Failed") || result.manipulationInsights.startsWith("Error:") || result.manipulationInsights.startsWith("The model did not provide")) {
        toast({ title: "Erreur Analyse Manipulation", description: result.manipulationInsights, variant: "destructive", duration: 8000 });
      } else {
        toast({ title: "Analyse de Manipulation Terminée", description: `Résultat disponible. Voir ci-dessous.`, duration: 5000 });
      }
    } catch (error: any) {
      toast({ title: "Erreur Analyse Manipulation", description: error.message || "Une erreur inattendue.", variant: "destructive", duration: 8000 });
      setManipulationSearchResult({manipulationInsights: `Échec de l'analyse: ${error.message || "Erreur inconnue"}`});
    } finally {
      setIsSearchingManipulation(false);
    }
  };


  const isMainTextAvailable = !!inputText.trim();
  const isAnalysisDone = !!analysisResults && !analysisResults.summary.startsWith("Failed");
  const isReformulationInputAvailable = !!reformulationInputText.trim();


  return (
    <div className="w-full max-w-6xl mx-auto"> 
      <Logo />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 mb-6 bg-card/80 backdrop-blur-sm p-1.5 rounded-lg shadow-md">
          <TabsTrigger value="input" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg">
            <FileText className="mr-2 h-4 w-4" /> Entrée & Recherche
          </TabsTrigger>
          <TabsTrigger value="analysis" disabled={!isAnalysisDone && !isAnalyzing} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg">
            <SearchCheck className="mr-2 h-4 w-4" /> Analyse Initiale
          </TabsTrigger>
          <TabsTrigger value="classification" disabled={!isAnalysisDone && !isClassifying} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg">
            <BrainCircuit className="mr-2 h-4 w-4" /> Classification
          </TabsTrigger>
          <TabsTrigger value="summary" disabled={!isMainTextAvailable && !isGeneratingSummary} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg">
            <Quote className="mr-2 h-4 w-4" /> Résumé Critique
          </TabsTrigger>
          <TabsTrigger value="reformulation" disabled={!isReformulationInputAvailable && !isReformulating} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg">
            <PenTool className="mr-2 h-4 w-4" /> Reformulation
          </TabsTrigger>
          <TabsTrigger value="paranoid" disabled={!isMainTextAvailable && !isGeneratingParanoid} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg">
            <Drama className="mr-2 h-4 w-4" /> Lecture Paranoïaque
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg">
            <Settings className="mr-2 h-4 w-4" /> Prompts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <InputPanel 
            inputText={inputText} 
            setInputText={setInputText} 
            researchQueryText={researchQueryText}
            setResearchQueryText={setResearchQueryText}
            handleAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            handleContextualSearch={handleContextualSearch}
            isSearchingContextual={isSearchingContextual}
            handleManipulationSearch={handleManipulationSearch}
            isSearchingManipulation={isSearchingManipulation}
          />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {contextualSearchResult && (
              <Card className="animate-fadeIn">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-xl text-primary">
                    <Telescope className="h-5 w-5" />
                    Résultat de la Recherche Contextuelle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-auto max-h-80 pr-2">
                    <p className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed bg-muted/30 p-3 rounded-md shadow-inner">
                      {contextualSearchResult.researchResult || "Aucun résultat."}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
            {manipulationSearchResult && (
              <Card className="animate-fadeIn">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-xl text-primary">
                     <MessageSquareText className="h-5 w-5" />
                    Résultat de l'Analyse de Manipulation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <ScrollArea className="h-auto max-h-80 pr-2">
                    <p className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed bg-muted/30 p-3 rounded-md shadow-inner">
                      {manipulationSearchResult.manipulationInsights || "Aucun résultat."}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
           { (isSearchingContextual || isSearchingManipulation) && (!contextualSearchResult && !manipulationSearchResult) && (
             <div className="mt-6 text-center text-muted-foreground">
                Recherche en cours...
             </div>
           )}
        </TabsContent>
        <TabsContent value="analysis">
          <CognitiveAnalysisPanel analysisResults={analysisResults} isLoading={isAnalyzing} />
        </TabsContent>
        <TabsContent value="classification">
          <CognitiveClassificationPanel
            classificationResult={classificationResult}
            handleClassifyCognitiveCategories={handleClassifyCognitiveCategories}
            isLoading={isClassifying}
            isReadyToClassify={isAnalysisDone}
          />
        </TabsContent>
        <TabsContent value="summary">
          <CriticalSummaryPanel 
            criticalSummaryResult={criticalSummaryResult}
            handleGenerateSummary={handleGenerateSummary}
            isLoading={isGeneratingSummary}
            isBaseTextAvailable={isMainTextAvailable}
          />
        </TabsContent>
        <TabsContent value="reformulation">
           <ReformulationPanel
            reformulationInputText={reformulationInputText}
            setReformulationInputText={setReformulationInputText}
            selectedReformulationStyle={selectedReformulationStyle}
            setSelectedReformulationStyle={setSelectedReformulationStyle}
            reformulationResult={reformulationResult}
            isReformulating={isReformulating}
            handleReformulate={handleReformulate} 
          />
        </TabsContent>
        <TabsContent value="paranoid">
          <ParanoidReadingPanel 
            paranoidReadingResult={paranoidReadingResult}
            handleGenerateParanoidReading={handleGenerateParanoidReading}
            isLoading={isGeneratingParanoid}
            isBaseTextAvailable={isMainTextAvailable}
          />
        </TabsContent>
        <TabsContent value="config">
          <PromptConfigPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
    
