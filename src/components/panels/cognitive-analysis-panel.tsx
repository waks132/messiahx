
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, ShieldAlert, Eye, SearchCheck, Sigma } from "lucide-react";
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

const ItemList = ({ title, items, icon, badgeVariant = "secondary", badgeClassName }: { title: string; items: string[]; icon: React.ReactNode; badgeVariant?: "default" | "secondary" | "destructive" | "outline", badgeClassName?: string }) => (
  <Card className="flex-1 min-w-[280px] animate-fadeIn transition-shadow duration-300 hover:shadow-lg bg-card/80 backdrop-blur-sm">
    <CardHeader>
      <CardTitle className="text-xl font-headline flex items-center gap-2 text-primary">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {items.length > 0 ? (
        <ScrollArea className="h-40 pr-3">
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="text-sm">
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                       <Badge variant={badgeVariant} className={`cursor-default text-left whitespace-normal py-1.5 px-2.5 text-sm shadow-md hover:shadow-lg transition-shadow ${badgeClassName}`}>{item}</Badge>
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
        <p className="text-sm text-muted-foreground italic">Aucun {title.toLowerCase().replace(/s$/, "")} détecté.</p>
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

  if (!analysisResults || analysisResults.summary.startsWith("Failed to analyze text")) {
    return (
      <Card className="shadow-xl bg-card/70 backdrop-blur-md border-primary/30">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
            <SearchCheck className="h-6 w-6" />
            Analyse Initiale du Discours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {analysisResults?.summary || "Les résultats de l'analyse initiale apparaîtront ici une fois le texte soumis."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl animate-fadeIn bg-card/70 backdrop-blur-md border-primary/30">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
            <SearchCheck className="h-6 w-6" />
            Analyse Initiale du Discours
          </CardTitle>
          <CardDescription>Résumé et éléments discursifs identifiés par l'IA avant classification contextuelle.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-xl font-semibold font-headline text-accent">Résumé de l'Analyse :</h3>
          <p className="text-foreground/90 leading-relaxed bg-secondary/20 p-4 rounded-md shadow-inner text-base">
            {analysisResults.summary || "Aucun résumé disponible."}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ItemList 
          title="Techniques Rhétoriques" 
          items={analysisResults.rhetoricalTechniques || []}
          icon={<BookText className="h-5 w-5" />}
          badgeVariant="secondary"
          badgeClassName="bg-gradient-to-br from-purple-500 to-pink-500 text-white"
        />
        <ItemList 
          title="Biais Cognitifs Potentiels" 
          items={analysisResults.cognitiveBiases || []}
          icon={<Eye className="h-5 w-5" />}
          badgeVariant="default"
          badgeClassName="bg-gradient-to-br from-blue-500 to-teal-500 text-white"
        />
        <ItemList 
          title="Faits Non Vérifiables" 
          items={analysisResults.unverifiableFacts || []}
          icon={<ShieldAlert className="h-5 w-5" />}
          badgeVariant="destructive"
           badgeClassName="bg-gradient-to-br from-red-500 to-orange-500 text-white"
        />
      </div>
      
      <CognitiveMapChart analysisResults={analysisResults} />
      
    </div>
  );
}
