"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, ListChecks, ShieldAlert, Eye } from "lucide-react";
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

const ItemList = ({ title, items, icon, badgeVariant = "secondary" }: { title: string; items: string[]; icon: React.ReactNode; badgeVariant?: "default" | "secondary" | "destructive" | "outline" }) => (
  <Card className="flex-1 min-w-[280px] animate-fadeIn transition-shadow duration-300 hover:shadow-md">
    <CardHeader>
      <CardTitle className="text-xl font-headline flex items-center gap-2">
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
                       <Badge variant={badgeVariant} className="cursor-default text-left whitespace-normal py-1 px-2">{item}</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{title.slice(0, -1)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </li>
            ))}
          </ul>
        </ScrollArea>
      ) : (
        <p className="text-sm text-muted-foreground">Aucun {title.toLowerCase()} détecté.</p>
      )}
    </CardContent>
  </Card>
);

export function CognitiveAnalysisPanel({ analysisResults, isLoading }: CognitiveAnalysisPanelProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analysisResults) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" />
            Analyse Cognitive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Les résultats de l'analyse cognitive apparaîtront ici une fois le texte soumis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg animate-fadeIn">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" />
            Analyse Cognitive Détaillée
          </CardTitle>
          <CardDescription>Résumé et éléments identifiés par l'IA.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-xl font-semibold font-headline">Résumé de l'Analyse :</h3>
          <p className="text-foreground/90 leading-relaxed bg-secondary/30 p-4 rounded-md shadow-inner">{analysisResults.summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ItemList 
          title="Techniques Manipulatoires" 
          items={analysisResults.manipulativeTechniques}
          icon={<ShieldAlert className="h-5 w-5 text-destructive" />}
          badgeVariant="destructive"
        />
        <ItemList 
          title="Biais Cognitifs" 
          items={analysisResults.cognitiveBiases}
          icon={<Eye className="h-5 w-5 text-accent" />}
          badgeVariant="default"
        />
        <ItemList 
          title="Faits Invérifiables" 
          items={analysisResults.unverifiableFacts}
          icon={<AlertCircle className="h-5 w-5 text-yellow-600" />}
          badgeVariant="outline"
        />
      </div>
      
      <CognitiveMapChart analysisResults={analysisResults} />
      
    </div>
  );
}
