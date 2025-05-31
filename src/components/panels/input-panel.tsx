
"use client";

import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, UploadCloud, Sparkles, Telescope, MessageSquareText } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";

interface InputPanelProps {
  inputText: string;
  setInputText: Dispatch<SetStateAction<string>>;
  researchQueryText: string;
  setResearchQueryText: Dispatch<SetStateAction<string>>;
  handleAnalyze: () => Promise<void>;
  isAnalyzing: boolean;
  handleContextualSearch: () => Promise<void>;
  isSearchingContextual: boolean;
  handleManipulationSearch: () => Promise<void>;
  isSearchingManipulation: boolean;
  currentLanguage: string;
}

const panelLabels: Record<string, Record<string, string>> = {
  fr: {
    mainAnalysisTitle: "Saisie du Texte & Recherche Contextuelle",
    mainAnalysisDescription: "Entrez le texte pour l'analyse cognitive principale, ou utilisez le champ ci-dessous pour des recherches contextuelles spécifiques.",
    mainAnalysisTextLabel: "Texte pour Analyse Cognitive Principale :",
    mainAnalysisPlaceholder: "Collez votre texte, écrivez directement, ou chargez un fichier .txt ci-dessous...",
    uploadFileLabel: "Ou chargez un fichier .txt pour l'analyse principale :",
    analyzeButtonText: "Lancer l'Analyse Initiale du Discours (sur le texte ci-dessus)",
    analyzingButtonText: "Analyse Initiale en cours...",
    researchQueryLabel: "Termes pour Recherche Contextuelle / Analyse de Manipulation :",
    researchQueryPlaceholder: "Entrez un sujet, une phrase clé, ou un extrait de texte pour une recherche spécifique...",
    contextualSearchButton: "Recherche Contextuelle (sur le terme ci-dessus)",
    contextualSearchingButton: "Recherche...",
    manipulationSearchButton: "Analyse de Manipulation (sur le terme ci-dessus)",
    manipulationSearchingButton: "Analyse Sonar...",
    unsupportedFile: "Veuillez charger un fichier .txt uniquement.",
    fileReadError: "Erreur lors de la lecture du fichier.",
  },
  en: {
    mainAnalysisTitle: "Text Input & Contextual Research",
    mainAnalysisDescription: "Enter the text for the main cognitive analysis, or use the field below for specific contextual research.",
    mainAnalysisTextLabel: "Text for Main Cognitive Analysis:",
    mainAnalysisPlaceholder: "Paste your text, write directly, or upload a .txt file below...",
    uploadFileLabel: "Or upload a .txt file for main analysis:",
    analyzeButtonText: "Start Initial Discourse Analysis (on the text above)",
    analyzingButtonText: "Initial Analysis in progress...",
    researchQueryLabel: "Terms for Contextual Research / Manipulation Analysis:",
    researchQueryPlaceholder: "Enter a topic, key phrase, or text snippet for specific research...",
    contextualSearchButton: "Contextual Research (on the term above)",
    contextualSearchingButton: "Searching...",
    manipulationSearchButton: "Manipulation Analysis (on the term above)",
    manipulationSearchingButton: "Sonar Analysis...",
    unsupportedFile: "Please upload a .txt file only.",
    fileReadError: "Error reading the file.",
  }
};


export function InputPanel({ 
  inputText, 
  setInputText, 
  researchQueryText,
  setResearchQueryText,
  handleAnalyze, 
  isAnalyzing,
  handleContextualSearch,
  isSearchingContextual,
  handleManipulationSearch,
  isSearchingManipulation,
  currentLanguage
}: InputPanelProps) {
  const labels = panelLabels[currentLanguage] || panelLabels.fr;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/plain") {
        try {
            const text = await file.text();
            setInputText(text);
        } catch (error) {
            console.error("Error reading file:", error);
            alert(labels.fileReadError);
        }
      } else {
        alert(labels.unsupportedFile);
      }
      event.target.value = "";
    }
  };

  const isAnyLoading = isAnalyzing || isSearchingContextual || isSearchingManipulation;

  return (
    <Card className="shadow-xl bg-card/70 backdrop-blur-md border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
          <FileText className="h-6 w-6" />
          {labels.mainAnalysisTitle}
        </CardTitle>
        <CardDescription>{labels.mainAnalysisDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="text-input" className="text-lg font-semibold text-foreground/90">{labels.mainAnalysisTextLabel}</Label>
          <Textarea
            id="text-input"
            placeholder={labels.mainAnalysisPlaceholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={10}
            className="min-h-[200px] border-2 border-input focus:border-accent transition-colors duration-300 shadow-inner rounded-lg p-4 bg-background/80 text-base"
            disabled={isAnyLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-upload" className="text-lg font-semibold text-foreground/90">{labels.uploadFileLabel}</Label>
          <div className="flex items-center gap-3 p-3 border border-dashed border-border rounded-lg bg-muted/20 hover:border-accent transition-colors">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <Input
              id="file-upload"
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-accent/20 hover:file:text-accent-foreground cursor-pointer disabled:opacity-50"
              disabled={isAnyLoading}
            />
          </div>
        </div>
        
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnyLoading || !inputText.trim()} 
          size="lg" 
          className="w-full text-base py-3 transition-all duration-300 hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-primary to-accent text-primary-foreground disabled:from-muted disabled:to-muted/80 disabled:text-muted-foreground disabled:hover:scale-100"
        >
          {isAnalyzing ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">{labels.analyzingButtonText}</span>
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              {labels.analyzeButtonText}
            </>
          )}
        </Button>

        <div className="border-t border-border/30 pt-6 space-y-4">
            <Label htmlFor="research-query-input" className="text-lg font-semibold text-foreground/90">{labels.researchQueryLabel}</Label>
            <Input
                id="research-query-input"
                placeholder={labels.researchQueryPlaceholder}
                value={researchQueryText}
                onChange={(e) => setResearchQueryText(e.target.value)}
                className="border-2 border-input focus:border-accent transition-colors duration-300 shadow-inner rounded-lg p-3 bg-background/80 text-base"
                disabled={isAnyLoading}
            />
            <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                    variant="outline"
                    onClick={handleContextualSearch} 
                    disabled={isAnyLoading || !researchQueryText.trim()} 
                    className="w-full sm:flex-1"
                >
                    {isSearchingContextual ? (
                    <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">{labels.contextualSearchingButton}</span>
                    </>
                    ) : (
                    <>
                        <Telescope className="mr-2 h-4 w-4" />
                        {labels.contextualSearchButton}
                    </>
                    )}
                </Button>
                <Button 
                    variant="outline"
                    onClick={handleManipulationSearch} 
                    disabled={isAnyLoading || !researchQueryText.trim()} 
                    className="w-full sm:flex-1"
                >
                    {isSearchingManipulation ? (
                    <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">{labels.manipulationSearchingButton}</span>
                    </>
                    ) : (
                    <>
                        <MessageSquareText className="mr-2 h-4 w-4" />
                        {labels.manipulationSearchButton}
                    </>
                    )}
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
    
