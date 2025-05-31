
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, ShieldAlert, Eye, SearchCheck, Lightbulb, Info } from "lucide-react";
import { CognitiveMapChart } from "@/components/charts/cognitive-map-chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AnalyzeTextOutput } from "@/ai/flows/analyze-text-for-manipulation";
import { LoadingSpinner } from "@/components/loading-spinner";

interface CognitiveAnalysisPanelProps {
  analysisResults: AnalyzeTextOutput | null;
  isLoading: boolean;
}

const ItemList = ({ title, items, icon, badgeVariant = "secondary", badgeClassName, tooltipText }: { title: string; items: string[]; icon: React.ReactNode; badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info", badgeClassName?: string, tooltipText?: string }) => (
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
            {items.map((item, index) => (
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
            ))}
          </ul>
        </ScrollArea>
      ) : (
        <p className="text-sm text-muted-foreground italic">Aucun élément de ce type détecté.</p>
      )}
    </CardContent>
  </Card>
);

export function CognitiveAnalysisPanel({ analysisResults, isLoading }: CognitiveAnalysisPanelProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-lg text-primary animate-pulse">Analyse initiale en cours...</p>
      </div>
    );
  }

  if (!analysisResults || (analysisResults.summary.startsWith("Failed to analyze text") && !analysisResults.summary.startsWith("Failed to analyze text: Analysis summary not available."))) {
    return (
      <Card className="shadow-xl bg-card/80 backdrop-blur-md border-primary/30">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2 text-primary">
            <SearchCheck className="h-6 w-6" />
            Analyse Initiale du Discours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {analysisResults?.summary || "Les résultats de l'analyse initiale du discours apparaîtront ici une fois le texte soumis et analysé."}
          </p>
           {analysisResults?.summary.startsWith("Failed to analyze text") && !analysisResults.summary.startsWith("Failed to analyze text: Analysis summary not available.") && (
            <p className="text-destructive text-center py-2 bg-destructive/10 rounded-md">
              {analysisResults.summary}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
  
  const hasResults = analysisResults && 
                     !analysisResults.summary.startsWith("Failed to analyze text: Analysis summary not available.") &&
                     (analysisResults.rhetoricalTechniques.length > 0 ||
                      analysisResults.cognitiveBiases.length > 0 ||
                      analysisResults.unverifiableFacts.length > 0 ||
                      (analysisResults.summary && !analysisResults.summary.startsWith("Failed to analyze text")));


  if (!hasResults) {
     return (
      <Card className="shadow-xl bg-card/80 backdrop-blur-md border-primary/30">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2 text-primary">
            <SearchCheck className="h-6 w-6" />
            Analyse Initiale du Discours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Aucun résultat à afficher pour l'analyse initiale. Veuillez soumettre un texte.
          </p>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-6">
      <Card className="shadow-xl animate-fadeIn bg-card/80 backdrop-blur-md border-primary/30">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2 text-primary">
            <SearchCheck className="h-6 w-6" />
            Analyse Initiale du Discours
          </CardTitle>
          <CardDescription>Résumé et éléments discursifs identifiés par l'IA de manière neutre. L'intention et l'intensité manipulative seront évaluées dans l'onglet "Classification".</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold font-headline text-accent flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Résumé des Éléments Discursifs :
          </h3>
          <p className="text-foreground/90 leading-relaxed bg-muted/20 p-4 rounded-md shadow-inner text-sm">
            {analysisResults.summary || "Aucun résumé disponible."}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ItemList 
          title="Techniques Rhétoriques" 
          items={analysisResults.rhetoricalTechniques || []}
          icon={<BookText className="h-5 w-5" />}
          badgeVariant="info"
          badgeClassName="bg-gradient-to-br from-sky-500 to-cyan-400 text-white"
          tooltipText="Ex: métaphores, ironie, hyperbole, questions rhétoriques."
        />
        <ItemList 
          title="Biais Cognitifs Potentiels" 
          items={analysisResults.cognitiveBiases || []}
          icon={<Eye className="h-5 w-5" />}
          badgeVariant="warning"
          badgeClassName="bg-gradient-to-br from-amber-500 to-yellow-400 text-black"
          tooltipText="Ex: biais de confirmation, ancrage, effet de halo."
        />
        <ItemList 
          title="Faits Non Vérifiables" 
          items={analysisResults.unverifiableFacts || []}
          icon={<ShieldAlert className="h-5 w-5" />}
          badgeVariant="destructive"
           badgeClassName="bg-gradient-to-br from-red-500 to-orange-400 text-white"
           tooltipText="Affirmations présentées comme des faits mais difficiles ou impossibles à vérifier objectivement."
        />
      </div>
      
      <CognitiveMapChart analysisResults={analysisResults} />
      
    </div>
  );
}
