
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Quote, MessageSquareHeart, Copy } from "lucide-react"; 
import type { GenerateCriticalSummaryOutput } from "@/ai/flows/generate-critical-summary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export type AnalysisStyle = "academic" | "journalistic" | "sarcastic";

interface CriticalSummaryPanelProps {
  criticalSummaryResult: GenerateCriticalSummaryOutput | null;
  handleGenerateSummary: (style: AnalysisStyle) => Promise<void>;
  isLoading: boolean;
  isBaseTextAvailable: boolean;
  currentLanguage: string;
}

const panelLabels: Record<string, Record<string, string>> = {
  fr: {
    title: "Résumé Critique (Commentaire Expert)",
    description: "Générez un résumé critique du texte analysé avec un style configurable.",
    styleLabel: "Style d'analyse :",
    stylePlaceholder: "Choisissez un style",
    academicStyle: "Académique",
    journalisticStyle: "Journalistique",
    sarcasticStyle: "Sarcastique",
    generateButton: "Générer le Résumé Critique",
    generatingButton: "Génération...",
    generatedSummaryTitle: "Résumé Généré :",
    clickToSeeResults: "Cliquez sur \"Générer le Résumé Critique\" pour voir le résultat.",
    analyzeFirst: "Veuillez d'abord analyser un texte dans l'onglet \"Entrée & Analyse\".",
    copyButton: "Copier le Résumé",
    copiedToClipboard: "Résumé copié dans le presse-papiers !",
    failedToCopy: "Échec de la copie du résumé.",
  },
  en: {
    title: "Critical Summary (Expert Commentary)",
    description: "Generate a critical summary of the analyzed text with a configurable style.",
    styleLabel: "Analysis Style:",
    stylePlaceholder: "Choose a style",
    academicStyle: "Academic",
    journalisticStyle: "Journalistic",
    sarcasticStyle: "Sarcastic",
    generateButton: "Generate Critical Summary",
    generatingButton: "Generating...",
    generatedSummaryTitle: "Generated Summary:",
    clickToSeeResults: "Click \"Generate Critical Summary\" to see the result.",
    analyzeFirst: "Please analyze a text in the \"Input & Research\" tab first.",
    copyButton: "Copy Summary",
    copiedToClipboard: "Summary copied to clipboard!",
    failedToCopy: "Failed to copy summary.",
  }
};

export function CriticalSummaryPanel({ 
  criticalSummaryResult, 
  handleGenerateSummary, 
  isLoading, 
  isBaseTextAvailable,
  currentLanguage 
}: CriticalSummaryPanelProps) {
  const [selectedStyle, setSelectedStyle] = useState<AnalysisStyle>("academic");
  const labels = panelLabels[currentLanguage] || panelLabels.fr;
  const { toast } = useToast();

  const onGenerate = () => {
    handleGenerateSummary(selectedStyle);
  };

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

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Quote className="h-6 w-6 text-primary" />
          {labels.title}
        </CardTitle>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="analysis-style-select" className="text-lg">{labels.styleLabel}</Label>
          <Select 
            value={selectedStyle} 
            onValueChange={(value) => setSelectedStyle(value as AnalysisStyle)}
            disabled={isLoading}
          >
            <SelectTrigger id="analysis-style-select" className="w-full md:w-[280px]">
              <SelectValue placeholder={labels.stylePlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="academic">{labels.academicStyle}</SelectItem>
              <SelectItem value="journalistic">{labels.journalisticStyle}</SelectItem>
              <SelectItem value="sarcastic">{labels.sarcasticStyle}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={onGenerate} 
          disabled={isLoading || !isBaseTextAvailable}
          size="lg"
          className="w-full md:w-auto transition-all duration-300 hover:shadow-md transform hover:scale-105"
        >
          {isLoading ? (
             <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">{labels.generatingButton}</span>
            </>
          ) : (
            <>
              <MessageSquareHeart className="mr-2 h-5 w-5" />
              {labels.generateButton}
            </>
          )}
        </Button>

        {criticalSummaryResult && !isLoading && (
          <div className="space-y-2 pt-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold font-headline">{labels.generatedSummaryTitle}</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleCopyToClipboard(criticalSummaryResult?.summary)}
                disabled={!criticalSummaryResult?.summary}
              >
                <Copy className="mr-2 h-4 w-4" />
                {labels.copyButton}
              </Button>
            </div>
             <ScrollArea className="h-auto max-h-[500px] pr-3 border rounded-md bg-muted/20 shadow-inner">
                <p className="text-foreground/90 leading-relaxed p-4 whitespace-pre-wrap text-sm">
                {criticalSummaryResult.summary}
                </p>
            </ScrollArea>
          </div>
        )}
         {!criticalSummaryResult && !isLoading && isBaseTextAvailable && (
           <p className="text-muted-foreground pt-4">{labels.clickToSeeResults}</p>
         )}
         {!isBaseTextAvailable && !isLoading && (
            <p className="text-muted-foreground pt-4">{labels.analyzeFirst}</p>
         )}
      </CardContent>
    </Card>
  );
}
    
