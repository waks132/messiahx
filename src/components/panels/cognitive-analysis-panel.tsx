
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, ShieldAlert, Eye, SearchCheck, Lightbulb, Info, Download, Copy } from "lucide-react";
import { CognitiveMapChart } from "@/components/charts/cognitive-map-chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AnalyzeTextOutput } from "@/ai/flows/analyze-text-for-manipulation";
import { LoadingSpinner } from "@/components/loading-spinner";
import { downloadJson } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CognitiveAnalysisPanelProps {
  analysisResults: AnalyzeTextOutput | null;
  isLoading: boolean;
  currentLanguage: string;
}

const panelLabels: Record<string, Record<string, string>> = {
  fr: {
    title: "Analyse Initiale du Discours",
    description: "Résumé et éléments discursifs identifiés par l'IA de manière neutre. L'intention et l'intensité manipulative seront évaluées dans l'onglet \"Classification\".",
    downloadButton: "Télécharger l'Analyse",
    copySummaryButton: "Copier le Résumé",
    summaryTitle: "Résumé des Éléments Discursifs :",
    noSummary: "Aucun résumé disponible.",
    rhetoricalTechniques: "Techniques Rhétoriques",
    rhetoricalTooltip: "Ex: métaphores, ironie, hyperbole, questions rhétoriques.",
    cognitiveBiases: "Biais Cognitifs Potentiels",
    cognitiveTooltip: "Ex: biais de confirmation, ancrage, effet de halo.",
    unverifiableFacts: "Faits Non Vérifiables",
    unverifiableTooltip: "Affirmations présentées comme des faits objectifs mais difficiles ou impossibles à vérifier empiriquement. Distinct des opinions, métaphores ou expressions poétiques.",
    noItemsDetected: "Aucun élément de ce type détecté.",
    loadingText: "Analyse initiale en cours...",
    resultsAppearHere: "Les résultats de l'analyse initiale du discours apparaîtront ici une fois le texte soumis et analysé.",
    noResultsToShow: "Aucun résultat à afficher pour l'analyse initiale. Veuillez soumettre un texte.",
    copiedToClipboard: "Copié dans le presse-papiers !",
    failedToCopy: "Échec de la copie.",
    factStatement: "Affirmation",
    factJustification: "Justification Invérifiabilité",
  },
  en: {
    title: "Initial Discourse Analysis",
    description: "Summary and discursive elements identified by the AI neutrally. Manipulative intent and intensity will be assessed in the \"Classification\" tab.",
    downloadButton: "Download Analysis",
    copySummaryButton: "Copy Summary",
    summaryTitle: "Summary of Discursive Elements:",
    noSummary: "No summary available.",
    rhetoricalTechniques: "Rhetorical Techniques",
    rhetoricalTooltip: "E.g., metaphors, irony, hyperbole, rhetorical questions.",
    cognitiveBiases: "Potential Cognitive Biases",
    cognitiveTooltip: "E.g., confirmation bias, anchoring, halo effect.",
    unverifiableFacts: "Unverifiable Facts",
    unverifiableTooltip: "Statements presented as objective facts but difficult or impossible to verify empirically. Distinct from opinions, metaphors, or poetic expressions.",
    noItemsDetected: "No such items detected.",
    loadingText: "Initial analysis in progress...",
    resultsAppearHere: "The results of the initial discourse analysis will appear here once the text is submitted and analyzed.",
    noResultsToShow: "No results to display for initial analysis. Please submit a text.",
    copiedToClipboard: "Copied to clipboard!",
    failedToCopy: "Failed to copy.",
    factStatement: "Statement",
    factJustification: "Unverifiability Justification",
  }
};

const ItemList = ({ title, items, icon, badgeVariant = "secondary", badgeClassName, tooltipText, currentLanguage, isUnverifiableFact = false }: { title: string; items: string[]; icon: React.ReactNode; badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info", badgeClassName?: string, tooltipText?: string, currentLanguage: string, isUnverifiableFact?: boolean }) => {
  const labels = panelLabels[currentLanguage] || panelLabels.fr;

  const parseFact = (item: string) => {
    const parts = item.split(' - ');
    if (parts.length >= 2) {
      return { statement: parts[0], justification: parts.slice(1).join(' - ') };
    }
    return { statement: item, justification: "" };
  };

  return (
    <Card className="flex-1 min-w-[280px] animate-fadeIn transition-shadow duration-300 hover:shadow-lg bg-card/90 backdrop-blur-sm border border-border/70">
      <CardHeader>
        <CardTitle className="text-lg font-headline flex items-center gap-2 text-primary">
          {icon}
          {title}
          {tooltipText && (
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-popover text-popover-foreground p-2 rounded-md shadow-xl">
                  <p>{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items && items.length > 0 ? (
          <ScrollArea className="h-40 pr-3">
            <ul className="space-y-2">
              {items.map((item, index) => {
                if (isUnverifiableFact) {
                  const { statement, justification } = parseFact(item);
                  return (
                    <li key={index} className="text-sm">
                       <TooltipProvider>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <div className={`cursor-default text-left whitespace-normal py-1.5 px-2.5 text-xs shadow-md hover:shadow-lg transition-shadow rounded-md ${badgeClassName}`}>
                              <p><strong className="font-semibold">{labels.factStatement}:</strong> {statement}</p>
                              {justification && <p className="text-xs italic text-muted-foreground mt-1"><strong className="font-medium">{labels.factJustification}:</strong> {justification}</p>}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md bg-popover text-popover-foreground p-2 rounded-md shadow-xl">
                            <p className="font-semibold">{title.slice(0,-1)}:</p>
                            <p><strong className="font-semibold">{labels.factStatement}:</strong> {statement}</p>
                            {justification && <p className="text-xs italic mt-1"><strong className="font-medium">{labels.factJustification}:</strong> {justification}</p>}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </li>
                  );
                }
                return (
                  <li key={index} className="text-sm">
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Badge variant={badgeVariant} className={`cursor-default text-left whitespace-normal py-1.5 px-2.5 text-xs shadow-md hover:shadow-lg transition-shadow ${badgeClassName}`}>
                            {item}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs bg-popover text-popover-foreground p-2 rounded-md shadow-xl">
                          <p className="font-semibold">{title.slice(0, -1)}:</p>
                          <p>{item}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground italic">{labels.noItemsDetected}</p>
        )}
      </CardContent>
    </Card>
  );
};

export function CognitiveAnalysisPanel({ analysisResults, isLoading, currentLanguage }: CognitiveAnalysisPanelProps) {
  const labels = panelLabels[currentLanguage] || panelLabels.fr;
  const { toast } = useToast();

  const handleDownloadAnalysis = () => {
    if (analysisResults) {
      const filename = currentLanguage === 'fr' ? "analyse_cognitive_initiale.json" : "initial_cognitive_analysis.json";
      downloadJson(analysisResults, filename);
    }
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


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-lg text-primary animate-pulse">{labels.loadingText}</p>
      </div>
    );
  }

  const hasFailed = analysisResults?.summary.startsWith("Failed") || analysisResults?.summary.startsWith("Échec");
  const isEmptyPlaceholder = analysisResults?.summary.startsWith("Failed to analyze text: Analysis summary not available.") || analysisResults?.summary.startsWith("Résumé de l'analyse non disponible.");


  if (!analysisResults || (hasFailed && !isEmptyPlaceholder)) {
    return (
      <Card className="shadow-xl bg-card/80 backdrop-blur-md border-primary/30">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2 text-primary">
            <SearchCheck className="h-6 w-6" />
            {labels.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {analysisResults?.summary || labels.resultsAppearHere}
          </p>
           {hasFailed && !isEmptyPlaceholder && (
            <p className="text-destructive text-center py-2 bg-destructive/10 rounded-md">
              {analysisResults.summary}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
  
  const hasResults = analysisResults && 
                     !isEmptyPlaceholder &&
                     !hasFailed &&
                     (analysisResults.rhetoricalTechniques.length > 0 ||
                      analysisResults.cognitiveBiases.length > 0 ||
                      analysisResults.unverifiableFacts.length > 0 ||
                      (analysisResults.summary && !analysisResults.summary.startsWith("Failed") && !analysisResults.summary.startsWith("Échec")));


  if (!hasResults) {
     return (
      <Card className="shadow-xl bg-card/80 backdrop-blur-md border-primary/30">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2 text-primary">
            <SearchCheck className="h-6 w-6" />
            {labels.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {labels.noResultsToShow}
          </p>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-6">
      <Card className="shadow-xl animate-fadeIn bg-card/80 backdrop-blur-md border-primary/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-xl flex items-center gap-2 text-primary">
              <SearchCheck className="h-6 w-6" />
              {labels.title}
            </CardTitle>
            <CardDescription>{labels.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(analysisResults?.summary)} disabled={!analysisResults?.summary}>
              <Copy className="mr-2 h-4 w-4" />
              {labels.copySummaryButton}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadAnalysis} disabled={!analysisResults}>
              <Download className="mr-2 h-4 w-4" />
              {labels.downloadButton}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold font-headline text-accent flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {labels.summaryTitle}
          </h3>
          <ScrollArea className="h-auto max-h-60 pr-3">
            <p className="text-foreground/90 leading-relaxed bg-muted/20 p-4 rounded-md shadow-inner text-sm whitespace-pre-wrap">
              {analysisResults.summary || labels.noSummary}
            </p>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ItemList 
          title={labels.rhetoricalTechniques}
          items={analysisResults.rhetoricalTechniques || []}
          icon={<BookText className="h-5 w-5" />}
          badgeVariant="info"
          badgeClassName="bg-gradient-to-br from-sky-500 to-cyan-400 text-white"
          tooltipText={labels.rhetoricalTooltip}
          currentLanguage={currentLanguage}
        />
        <ItemList 
          title={labels.cognitiveBiases} 
          items={analysisResults.cognitiveBiases || []}
          icon={<Eye className="h-5 w-5" />}
          badgeVariant="warning"
          badgeClassName="bg-gradient-to-br from-amber-500 to-yellow-400 text-black"
          tooltipText={labels.cognitiveTooltip}
          currentLanguage={currentLanguage}
        />
        <ItemList 
          title={labels.unverifiableFacts}
          items={analysisResults.unverifiableFacts || []}
          icon={<ShieldAlert className="h-5 w-5" />}
          badgeVariant="destructive"
          badgeClassName="bg-gradient-to-br from-red-500 to-orange-400 text-white"
          tooltipText={labels.unverifiableTooltip}
          currentLanguage={currentLanguage}
          isUnverifiableFact={true}
        />
      </div>
      
      <CognitiveMapChart analysisResults={analysisResults} />
      
    </div>
  );
}
    
