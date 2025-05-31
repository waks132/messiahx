
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  analyzeTextAction, 
  generateCriticalSummaryAction, 
  detectHiddenNarrativesAction, 
  classifyCognitiveCategoriesAction,
  reformulateTextAction,
  researchContextualAction,
  researchManipulationAction
} from "@/app/actions";
import type { AnalyzeTextOutput } from '@/ai/flows/analyze-text-for-manipulation';
import type { GenerateCriticalSummaryOutput } from '@/ai/flows/generate-critical-summary';
import type { DetectHiddenNarrativesOutput } from '@/ai/flows/detect-hidden-narratives';
import type { ClassifyCognitiveCategoriesInput, ClassifyCognitiveCategoriesOutput } from '@/ai/flows/classify-cognitive-categories';
import type { ReformulateTextInput, ReformulateTextOutput } from '@/ai/flows/reformulate-text';
import type { ResearchContextualInput, ResearchContextualOutput } from '@/ai/flows/research-contextual-flow';
import type { ResearchManipulationInput, ResearchManipulationOutput } from '@/ai/flows/research-manipulation-flow';
import type { WebSearchOutput } from '@/ai/tools/web-search-tool';

import { Logo } from '@/components/logo';
import { useToast } from "@/hooks/use-toast";
import { FileText, Quote, Drama, BrainCircuit, SearchCheck, PenTool, Settings, Telescope, MessageSquareText, Languages, Copy, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

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

// Moved from ReformulationPanel to be accessible for state initialization and new styles
const reformulationStyles = [
  { value: "neutral", label: "Neutre et Objectif" },
  { value: "messianic", label: "Messianique / Prophétique" },
  { value: "paranoid", label: "Paranoïaque / Conspirateur" },
  { value: "analytical_rhetoric", label: "Analyse Rhétorique Détaillée" },
  { value: "simplified_eli5", label: "Simplifié (ELI5)"},
  { value: "poetic_metaphoric", label: "Poétique / Métaphorique"},
  { value: "technical_detailed", label: "Technique / Scientifique Détaillé"},
];

interface UILabels {
  inputTab: string;
  analysisTab: string;
  classificationTab: string;
  summaryTab: string;
  reformulationTab: string;
  paranoidTab: string;
  configTab: string;
  languageLabel: string;
  contextualSearchTitle: string;
  manipulationSearchTitle: string;
  errorToastTitle: string;
  successToastTitle: string;
  emptyInputError: string;
  initialAnalysisComplete: string;
  initialAnalysisError: string;
  criticalSummaryComplete: string;
  criticalSummaryError: string;
  paranoidReadingComplete: string;
  paranoidReadingError: string;
  cognitiveClassificationComplete: string;
  cognitiveClassificationError: string;
  reformulationComplete: string;
  reformulationError: string;
  contextualSearchComplete: string;
  contextualSearchError: string;
  manipulationSearchComplete: string;
  manipulationSearchError: string;
  noTextToSummarize: string;
  noTextForParanoid: string;
  analysisRequiredForClassification: string;
  emptyReformulationInput: string;
  emptyResearchInput: string;
  searchInProgress: string;
  copiedToClipboard: string;
  failedToCopy: string;
  webSearchStatus: string;
  webSearchStatusSuccess: string;
  webSearchStatusKeyMissing: string;
  webSearchStatusError: string;
  webSearchStatusPlaceholder: string;
  copyButton: string;
  noResult: string;
}

const uiContent: Record<string, UILabels> = {
  fr: {
    inputTab: "Entrée & Recherche",
    analysisTab: "Analyse Initiale",
    classificationTab: "Classification",
    summaryTab: "Résumé Critique",
    reformulationTab: "Reformulation",
    paranoidTab: "Lecture Paranoïaque",
    configTab: "Prompts",
    languageLabel: "Langue de l'interface et de l'IA:",
    contextualSearchTitle: "Résultat de la Recherche Contextuelle",
    manipulationSearchTitle: "Résultat de l'Analyse de Manipulation",
    errorToastTitle: "Erreur",
    successToastTitle: "Succès",
    emptyInputError: "Le champ de texte pour l'analyse principale est vide.",
    initialAnalysisComplete: "Analyse initiale terminée.",
    initialAnalysisError: "Erreur d'Analyse Initiale",
    criticalSummaryComplete: "Résumé critique généré.",
    criticalSummaryError: "Erreur de Résumé Critique",
    paranoidReadingComplete: "Lecture paranoïaque terminée.",
    paranoidReadingError: "Erreur de Lecture Paranoïaque",
    cognitiveClassificationComplete: "Classification cognitive détaillée terminée.",
    cognitiveClassificationError: "Erreur de Classification Cognitive",
    reformulationComplete: "Texte reformulé avec le style",
    reformulationError: "Erreur de Reformulation",
    contextualSearchComplete: "Recherche Contextuelle Terminée",
    contextualSearchError: "Erreur de Recherche Contextuelle",
    manipulationSearchComplete: "Analyse de Manipulation Terminée",
    manipulationSearchError: "Erreur Analyse Manipulation",
    noTextToSummarize: "Aucun texte à résumer.",
    noTextForParanoid: "Aucun texte pour la lecture paranoïaque.",
    analysisRequiredForClassification: "L'analyse initiale doit être effectuée avec succès avant la classification.",
    emptyReformulationInput: "Le champ de texte pour la reformulation est vide.",
    emptyResearchInput: "Le champ de recherche est vide.",
    searchInProgress: "Recherche en cours...",
    copiedToClipboard: "Copié dans le presse-papiers !",
    failedToCopy: "Échec de la copie.",
    webSearchStatus: "Statut Recherche Web:",
    webSearchStatusSuccess: "Perplexity API (OK)",
    webSearchStatusKeyMissing: "Perplexity API (Clé manquante, Placeholder actif)",
    webSearchStatusError: "Perplexity API (Erreur)",
    webSearchStatusPlaceholder: "Recherche Web (Placeholder)",
    copyButton: "Copier",
    noResult: "Aucun résultat.",
  },
  en: {
    inputTab: "Input & Research",
    analysisTab: "Initial Analysis",
    classificationTab: "Classification",
    summaryTab: "Critical Summary",
    reformulationTab: "Reformulation",
    paranoidTab: "Paranoid Reading",
    configTab: "Prompts",
    languageLabel: "Interface and AI Language:",
    contextualSearchTitle: "Contextual Research Result",
    manipulationSearchTitle: "Manipulation Analysis Result",
    errorToastTitle: "Error",
    successToastTitle: "Success",
    emptyInputError: "The main analysis text field is empty.",
    initialAnalysisComplete: "Initial analysis complete.",
    initialAnalysisError: "Initial Analysis Error",
    criticalSummaryComplete: "Critical summary generated.",
    criticalSummaryError: "Critical Summary Error",
    paranoidReadingComplete: "Paranoid reading complete.",
    paranoidReadingError: "Paranoid Reading Error",
    cognitiveClassificationComplete: "Detailed cognitive classification complete.",
    cognitiveClassificationError: "Cognitive Classification Error",
    reformulationComplete: "Text reformulated with style",
    reformulationError: "Reformulation Error",
    contextualSearchComplete: "Contextual Search Complete",
    contextualSearchError: "Contextual Search Error",
    manipulationSearchComplete: "Manipulation Analysis Complete",
    manipulationSearchError: "Manipulation Analysis Error",
    noTextToSummarize: "No text to summarize.",
    noTextForParanoid: "No text for paranoid reading.",
    analysisRequiredForClassification: "Initial analysis must be performed successfully before classification.",
    emptyReformulationInput: "The reformulation text field is empty.",
    emptyResearchInput: "The research query field is empty.",
    searchInProgress: "Search in progress...",
    copiedToClipboard: "Copied to clipboard!",
    failedToCopy: "Failed to copy.",
    webSearchStatus: "Web Search Status:",
    webSearchStatusSuccess: "Perplexity API (OK)",
    webSearchStatusKeyMissing: "Perplexity API (Key missing, Placeholder active)",
    webSearchStatusError: "Perplexity API (Error)",
    webSearchStatusPlaceholder: "Web Search (Placeholder)",
    copyButton: "Copy",
    noResult: "No result.",
  },
};

const WebSearchStatusDisplay = ({ status, labels }: { status: WebSearchOutput['source'] | null, labels: UILabels }) => {
  if (!status) return null;

  let IconComponent = HelpCircle;
  let text = labels.webSearchStatusPlaceholder;
  let colorClass = "text-muted-foreground";

  switch (status) {
    case "PerplexityAPI_Success":
      IconComponent = CheckCircle2;
      text = labels.webSearchStatusSuccess;
      colorClass = "text-green-500";
      break;
    case "PerplexityAPI_KeyMissing":
      IconComponent = AlertCircle;
      text = labels.webSearchStatusKeyMissing;
      colorClass = "text-orange-500";
      break;
    case "PerplexityAPI_Error":
      IconComponent = AlertCircle;
      text = labels.webSearchStatusError;
      colorClass = "text-destructive";
      break;
  }

  return (
    <div className={`flex items-center gap-2 text-xs mt-2 ${colorClass}`}>
      <IconComponent className="h-4 w-4" />
      <span>{labels.webSearchStatus} {text}</span>
    </div>
  );
};


export default function CognitiveMapperClient() {
  const [currentLanguage, setCurrentLanguage] = useState<string>("fr");
  const labels = uiContent[currentLanguage] || uiContent.fr;

  const [inputText, setInputText] = useState<string>("");
  const [researchQueryText, setResearchQueryText] = useState<string>(""); 
  const [reformulationInputText, setReformulationInputText] = useState<string>("");

  const [analysisResults, setAnalysisResults] = useState<AnalyzeTextOutput>(initialAnalysisResults);
  const [criticalSummaryResult, setCriticalSummaryResult] = useState<GenerateCriticalSummaryOutput | null>(null);
  const [paranoidReadingResult, setParanoidReadingResult] = useState<DetectHiddenNarrativesOutput | null>(null);
  const [classificationResult, setClassificationResult] = useState<ClassifyCognitiveCategoriesOutput>(initialClassificationResult);
  
  const [reformulationResult, setReformulationResult] = useState<ReformulateTextOutput | null>(null);
  const [selectedReformulationStyle, setSelectedReformulationStyle] = useState<string>("neutral");

  const [contextualSearchResult, setContextualSearchResult] = useState<ResearchContextualOutput | null>(null);
  const [manipulationSearchResult, setManipulationSearchResult] = useState<ResearchManipulationOutput | null>(null);
  const [webSearchApiStatus, setWebSearchApiStatus] = useState<WebSearchOutput['source'] | null>(null);


  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [isGeneratingParanoid, setIsGeneratingParanoid] = useState<boolean>(false);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [isReformulating, setIsReformulating] = useState<boolean>(false);
  const [isSearchingContextual, setIsSearchingContextual] = useState<boolean>(false);
  const [isSearchingManipulation, setIsSearchingManipulation] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>("input");
  
  const { toast } = useToast();
  
  useEffect(() => {
    if (reformulationStyles.length > 0 && !selectedReformulationStyle) {
        setSelectedReformulationStyle(reformulationStyles[0].value);
    }
  }, [selectedReformulationStyle]); 

  useEffect(() => {
    if (inputText.trim() !== "" && (reformulationInputText.trim() === "" || reformulationInputText === inputText)) {
        setReformulationInputText(inputText);
    }
  }, [inputText, reformulationInputText]); 

  const handleCopyToClipboard = async (textToCopy: string | undefined) => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({ title: labels.copiedToClipboard });
    } catch (err) {
      toast({ title: labels.failedToCopy, variant: "destructive" });
      console.error('Failed to copy: ', err);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast({ title: labels.errorToastTitle, description: labels.emptyInputError, variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResults(initialAnalysisResults); 
    setCriticalSummaryResult(null); 
    setParanoidReadingResult(null);
    setClassificationResult(initialClassificationResult); 
    
    if (reformulationInputText.trim() === "") {
      setReformulationInputText(inputText);
    }
    if (researchQueryText.trim() === "" && inputText.trim() !== "") {
      setResearchQueryText(inputText);
    }

    try {
      const results = await analyzeTextAction({ text: inputText, language: currentLanguage });
      setAnalysisResults(results);
      if (results.summary.startsWith("Failed") || results.summary.startsWith("Échec")) {
        toast({ title: labels.initialAnalysisError, description: results.summary, variant: "destructive" });
      } else {
        toast({ title: labels.successToastTitle, description: labels.initialAnalysisComplete });
        setActiveTab("analysis"); 
      }
    } catch (error: any) {
      toast({ title: labels.initialAnalysisError, description: error.message || "Une erreur inattendue est survenue.", variant: "destructive" });
      setAnalysisResults(initialAnalysisResults);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateSummary = async (style: AnalysisStyle) => {
    if (!inputText.trim() && !analysisResults.summary) {
      toast({ title: labels.errorToastTitle, description: labels.noTextToSummarize, variant: "destructive" });
      return;
    }
    setIsGeneratingSummary(true);
    setCriticalSummaryResult(null);
    try {
      const textToSummarize = (analysisResults.summary && !analysisResults.summary.startsWith("Failed") && !analysisResults.summary.startsWith("Échec")) ? analysisResults.summary : inputText;
      const summary = await generateCriticalSummaryAction({ analyzedText: textToSummarize, analysisStyle: style, language: currentLanguage });
      setCriticalSummaryResult(summary);
      if (summary.summary.startsWith("Failed") || summary.summary.startsWith("Échec")) {
        toast({ title: labels.criticalSummaryError, description: summary.summary, variant: "destructive" });
      } else {
        toast({ title: labels.successToastTitle, description: labels.criticalSummaryComplete });
      }
    } catch (error: any) {
      toast({ title: labels.criticalSummaryError, description: error.message || "Une erreur inattendue est survenue.", variant: "destructive" });
       setCriticalSummaryResult({ summary: currentLanguage === 'fr' ? "Échec de la génération du résumé." : "Failed to generate summary."});
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateParanoidReading = async () => {
    if (!inputText.trim()) {
      toast({ title: labels.errorToastTitle, description: labels.noTextForParanoid, variant: "destructive" });
      return;
    }
    setIsGeneratingParanoid(true);
    setParanoidReadingResult(null);
    try {
      const reading = await detectHiddenNarrativesAction({ text: inputText, language: currentLanguage });
      setParanoidReadingResult(reading);
      if (reading.hiddenNarratives.startsWith("Failed") || reading.hiddenNarratives.startsWith("Échec")) {
         toast({ title: labels.paranoidReadingError, description: reading.hiddenNarratives, variant: "destructive" });
      } else {
        toast({ title: labels.successToastTitle, description: labels.paranoidReadingComplete });
      }
    } catch (error: any) {
      toast({ title: labels.paranoidReadingError, description: error.message || "Une erreur inattendue est survenue.", variant: "destructive" });
      setParanoidReadingResult({ hiddenNarratives: currentLanguage === 'fr' ? "Échec de la détection des narratifs cachés." : "Failed to detect hidden narratives." });
    } finally {
      setIsGeneratingParanoid(false);
    }
  };

  const handleClassifyCognitiveCategories = async () => {
    if (!analysisResults || analysisResults.summary.startsWith("Failed") || analysisResults.summary.startsWith("Échec")) {
       toast({ title: labels.errorToastTitle, description: labels.analysisRequiredForClassification, variant: "destructive" });
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
        language: currentLanguage,
      };
      const result = await classifyCognitiveCategoriesAction(input);
      setClassificationResult(result);
      if (result.overallClassification.reasoning.startsWith("Failed") || result.overallClassification.reasoning.startsWith("Échec")) {
        toast({ title: labels.cognitiveClassificationError, description: result.overallClassification.reasoning, variant: "destructive" });
      } else {
        toast({ title: labels.successToastTitle, description: labels.cognitiveClassificationComplete });
      }
    } catch (error: any) {
      toast({ title: labels.cognitiveClassificationError, description: error.message || "Une erreur inattendue est survenue.", variant: "destructive" });
      setClassificationResult(initialClassificationResult);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleReformulate = async () => { 
    if (!reformulationInputText.trim()) {
      toast({ title: labels.errorToastTitle, description: labels.emptyReformulationInput, variant: "destructive" });
      return;
    }
    setIsReformulating(true);
    setReformulationResult(null);
    try {
      const result = await reformulateTextAction({ text: reformulationInputText, style: selectedReformulationStyle, language: currentLanguage });
      setReformulationResult(result);
      if (result.reformulatedText.startsWith("Failed") || result.reformulatedText.startsWith("Error:") || result.reformulatedText.startsWith("The model did not provide") || result.reformulatedText.startsWith("Échec")) {
        toast({ title: labels.reformulationError, description: result.reformulatedText, variant: "destructive", duration: 8000 });
      } else {
        toast({ title: labels.successToastTitle, description: `${labels.reformulationComplete} "${result.styleUsed}".` });
      }
    } catch (error: any) {
      toast({ title: labels.reformulationError, description: error.message || "Une erreur inattendue est survenue.", variant: "destructive", duration: 8000 });
      setReformulationResult({ reformulatedText: `${currentLanguage === 'fr' ? 'Échec de la reformulation' : 'Failed to reformulate'}: ${error.message || "Erreur inconnue"}`, styleUsed: selectedReformulationStyle });
    } finally {
      setIsReformulating(false);
    }
  };

  const handleContextualSearch = async () => {
    if (!researchQueryText.trim()) { 
      toast({ title: labels.errorToastTitle, description: labels.emptyResearchInput, variant: "destructive" });
      return;
    }
    setIsSearchingContextual(true);
    setContextualSearchResult(null);
    setWebSearchApiStatus(null);
    try {
      const result = await researchContextualAction({ text: researchQueryText, language: currentLanguage }); 
      setContextualSearchResult(result);
      // @ts-ignore - Assuming result can have a source property if tool is used.
      if (result.source) setWebSearchApiStatus(result.source as WebSearchOutput['source']);

      if (result.researchResult.startsWith("Failed") || result.researchResult.startsWith("Error:") || result.researchResult.startsWith("The model did not provide") || result.researchResult.startsWith("Échec")) {
        toast({ title: labels.contextualSearchError, description: result.researchResult, variant: "destructive", duration: 8000 });
      } else {
        toast({ title: labels.contextualSearchComplete, description: `Résultat disponible.`, duration: 5000 });
      }
    } catch (error: any) {
      toast({ title: labels.contextualSearchError, description: error.message || "Une erreur inattendue.", variant: "destructive", duration: 8000 });
       setContextualSearchResult({researchResult: `${currentLanguage === 'fr' ? 'Échec de la recherche' : 'Search failed'}: ${error.message || "Erreur inconnue"}`});
    } finally {
      setIsSearchingContextual(false);
    }
  };

  const handleManipulationSearch = async () => {
    if (!researchQueryText.trim()) { 
      toast({ title: labels.errorToastTitle, description: labels.emptyResearchInput, variant: "destructive" });
      return;
    }
    setIsSearchingManipulation(true);
    setManipulationSearchResult(null);
    setWebSearchApiStatus(null);
    try {
      const result = await researchManipulationAction({ text: researchQueryText, language: currentLanguage }); 
      setManipulationSearchResult(result);
      // @ts-ignore
      if (result.source) setWebSearchApiStatus(result.source as WebSearchOutput['source']);
       if (result.manipulationInsights.startsWith("Failed") || result.manipulationInsights.startsWith("Error:") || result.manipulationInsights.startsWith("The model did not provide") || result.manipulationInsights.startsWith("Échec")) {
        toast({ title: labels.manipulationSearchError, description: result.manipulationInsights, variant: "destructive", duration: 8000 });
      } else {
        toast({ title: labels.manipulationSearchComplete, description: `Résultat disponible.`, duration: 5000 });
      }
    } catch (error: any) {
      toast({ title: labels.manipulationSearchError, description: error.message || "Une erreur inattendue.", variant: "destructive", duration: 8000 });
      setManipulationSearchResult({manipulationInsights: `${currentLanguage === 'fr' ? "Échec de l'analyse" : "Analysis failed"}: ${error.message || "Erreur inconnue"}`});
    } finally {
      setIsSearchingManipulation(false);
    }
  };

  const isMainAnalysisTextAvailable = !!inputText.trim();
  const isAnalysisDone = !!analysisResults && !analysisResults.summary.startsWith("Failed") && !analysisResults.summary.startsWith("Échec");
  const isReformulationTextAvailable = !!reformulationInputText.trim();


  return (
    <div className="w-full max-w-6xl mx-auto"> 
      <div className="flex justify-between items-center mb-6">
        <Logo />
        <div className="flex items-center gap-2">
          <Label htmlFor="language-select" className="text-sm text-muted-foreground flex items-center gap-1">
            <Languages size={16}/> {labels.languageLabel}
          </Label>
          <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
            <SelectTrigger id="language-select" className="w-[120px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 mb-6 bg-card/80 backdrop-blur-sm p-1.5 rounded-lg shadow-md">
          <TabsTrigger value="input" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg">
            <FileText className="mr-2 h-4 w-4" /> {labels.inputTab}
          </TabsTrigger>
          <TabsTrigger value="analysis" disabled={!isAnalysisDone && !isAnalyzing} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg">
            <SearchCheck className="mr-2 h-4 w-4" /> {labels.analysisTab}
          </TabsTrigger>
          <TabsTrigger value="classification" disabled={!isAnalysisDone && !isClassifying} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg">
            <BrainCircuit className="mr-2 h-4 w-4" /> {labels.classificationTab}
          </TabsTrigger>
          <TabsTrigger value="summary" disabled={!isMainAnalysisTextAvailable && !isGeneratingSummary && !isAnalysisDone} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg">
            <Quote className="mr-2 h-4 w-4" /> {labels.summaryTab}
          </TabsTrigger>
          <TabsTrigger value="reformulation" disabled={!isReformulationTextAvailable && !isReformulating} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg">
            <PenTool className="mr-2 h-4 w-4" /> {labels.reformulationTab}
          </TabsTrigger>
          <TabsTrigger value="paranoid" disabled={!isMainAnalysisTextAvailable && !isGeneratingParanoid} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg">
            <Drama className="mr-2 h-4 w-4" /> {labels.paranoidTab}
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg">
            <Settings className="mr-2 h-4 w-4" /> {labels.configTab}
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
            currentLanguage={currentLanguage}
          />
           <WebSearchStatusDisplay status={webSearchApiStatus} labels={labels} />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {contextualSearchResult && (
              <Card className="animate-fadeIn">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="flex items-center gap-2 font-headline text-xl text-primary">
                    <Telescope className="h-5 w-5" />
                    {labels.contextualSearchTitle}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(contextualSearchResult?.researchResult)} disabled={!contextualSearchResult?.researchResult}>
                    <Copy className="mr-2 h-4 w-4" /> {labels.copyButton}
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 pr-3 border rounded-md bg-muted/20 shadow-inner">
                    <p className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed p-4">
                      {contextualSearchResult.researchResult || (currentLanguage === 'fr' ? labels.noResult : labels.noResult)}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
            {manipulationSearchResult && (
              <Card className="animate-fadeIn">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="flex items-center gap-2 font-headline text-xl text-primary">
                     <MessageSquareText className="h-5 w-5" />
                    {labels.manipulationSearchTitle}
                  </CardTitle>
                   <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(manipulationSearchResult?.manipulationInsights)} disabled={!manipulationSearchResult?.manipulationInsights}>
                    <Copy className="mr-2 h-4 w-4" /> {labels.copyButton}
                  </Button>
                </CardHeader>
                <CardContent>
                   <ScrollArea className="h-96 pr-3 border rounded-md bg-muted/20 shadow-inner">
                    <p className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed p-4">
                      {manipulationSearchResult.manipulationInsights || (currentLanguage === 'fr' ? labels.noResult : labels.noResult)}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
           { (isSearchingContextual || isSearchingManipulation) && (!contextualSearchResult && !manipulationSearchResult) && (
             <div className="mt-6 text-center text-muted-foreground">
                {labels.searchInProgress}
             </div>
           )}
        </TabsContent>
        <TabsContent value="analysis">
          <CognitiveAnalysisPanel analysisResults={analysisResults} isLoading={isAnalyzing} currentLanguage={currentLanguage} />
        </TabsContent>
        <TabsContent value="classification">
          <CognitiveClassificationPanel
            classificationResult={classificationResult}
            handleClassifyCognitiveCategories={handleClassifyCognitiveCategories}
            isLoading={isClassifying}
            isReadyToClassify={isAnalysisDone}
            currentLanguage={currentLanguage}
          />
        </TabsContent>
        <TabsContent value="summary">
          <CriticalSummaryPanel 
            criticalSummaryResult={criticalSummaryResult}
            handleGenerateSummary={handleGenerateSummary}
            isLoading={isGeneratingSummary}
            isBaseTextAvailable={isMainAnalysisTextAvailable || isAnalysisDone}
            currentLanguage={currentLanguage}
          />
        </TabsContent>
        <TabsContent value="reformulation">
           <ReformulationPanel
            reformulationInputText={reformulationInputText}
            setReformulationInputText={setReformulationInputText}
            reformulationStyles={reformulationStyles} 
            selectedReformulationStyle={selectedReformulationStyle}
            setSelectedReformulationStyle={setSelectedReformulationStyle}
            reformulationResult={reformulationResult}
            setReformulationResult={setReformulationResult}
            isReformulating={isReformulating}
            handleReformulate={handleReformulate}
            currentLanguage={currentLanguage}
          />
        </TabsContent>
        <TabsContent value="paranoid">
          <ParanoidReadingPanel 
            paranoidReadingResult={paranoidReadingResult}
            handleGenerateParanoidReading={handleGenerateParanoidReading}
            isLoading={isGeneratingParanoid}
            isBaseTextAvailable={isMainAnalysisTextAvailable}
            currentLanguage={currentLanguage}
          />
        </TabsContent>
        <TabsContent value="config">
          <PromptConfigPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
