
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drama, Copy } from "lucide-react"; 
import type { DetectHiddenNarrativesOutput } from "@/ai/flows/detect-hidden-narratives";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ParanoidReadingPanelProps {
  paranoidReadingResult: DetectHiddenNarrativesOutput | null;
  handleGenerateParanoidReading: () => Promise<void>;
  isLoading: boolean;
  isBaseTextAvailable: boolean;
  currentLanguage: string;
}

const panelLabels: Record<string, Record<string, string>> = {
  fr: {
    title: "Lecture Paranoïaque (IA Gemini)",
    description: "Détectez les intentions implicites et les narratifs cachés via une lecture alternative du texte.",
    generateButton: "Lancer la Lecture Paranoïaque",
    generatingButton: "Détection en cours...",
    resultsTitle: "Narratifs Cachés Détectés :",
    clickToSeeResults: "Cliquez sur \"Lancer la Lecture Paranoïaque\" pour voir le résultat.",
    analyzeFirst: "Veuillez d'abord analyser un texte dans l'onglet \"Entrée & Analyse\".",
    copyButton: "Copier le Résultat",
    copiedToClipboard: "Résultat copié dans le presse-papiers !",
    failedToCopy: "Échec de la copie du résultat.",
  },
  en: {
    title: "Paranoid Reading (Gemini AI)",
    description: "Detect implicit intentions and hidden narratives via an alternative reading of the text.",
    generateButton: "Start Paranoid Reading",
    generatingButton: "Detection in progress...",
    resultsTitle: "Hidden Narratives Detected:",
    clickToSeeResults: "Click \"Start Paranoid Reading\" to see the result.",
    analyzeFirst: "Please analyze a text in the \"Input & Research\" tab first.",
    copyButton: "Copy Result",
    copiedToClipboard: "Result copied to clipboard!",
    failedToCopy: "Failed to copy result.",
  }
};

export function ParanoidReadingPanel({ 
  paranoidReadingResult, 
  handleGenerateParanoidReading, 
  isLoading, 
  isBaseTextAvailable,
  currentLanguage 
}: ParanoidReadingPanelProps) {
  const labels = panelLabels[currentLanguage] || panelLabels.fr;
  const { toast } = useToast();

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
          <Drama className="h-6 w-6 text-primary" />
          {labels.title}
        </CardTitle>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={handleGenerateParanoidReading} 
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
              <Drama className="mr-2 h-5 w-5" /> {/* Using Drama icon for consistency */}
              {labels.generateButton}
            </>
          )}
        </Button>

        {paranoidReadingResult && !isLoading && (
          <div className="space-y-2 pt-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold font-headline">{labels.resultsTitle}</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleCopyToClipboard(paranoidReadingResult?.hiddenNarratives)}
                disabled={!paranoidReadingResult?.hiddenNarratives}
              >
                <Copy className="mr-2 h-4 w-4" />
                {labels.copyButton}
              </Button>
            </div>
            <ScrollArea className="h-auto max-h-[500px] pr-3 border rounded-md bg-muted/20 shadow-inner">
                <p className="text-foreground/90 leading-relaxed p-4 whitespace-pre-wrap text-sm">
                {paranoidReadingResult.hiddenNarratives}
                </p>
            </ScrollArea>
          </div>
        )}
        {!paranoidReadingResult && !isLoading && isBaseTextAvailable && (
           <p className="text-muted-foreground pt-4">{labels.clickToSeeResults}</p>
         )}
        {!isBaseTextAvailable && !isLoading && (
          <p className="text-muted-foreground pt-4">{labels.analyzeFirst}</p>
        )}
      </CardContent>
    </Card>
  );
}
    
