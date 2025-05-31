"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Quote, MessageSquareHeart, Send } from "lucide-react";
import type { GenerateCriticalSummaryOutput } from "@/ai/flows/generate-critical-summary";
import { LoadingSpinner } from "@/components/loading-spinner";

export type AnalysisStyle = "academic" | "journalistic" | "sarcastic";

interface CriticalSummaryPanelProps {
  criticalSummaryResult: GenerateCriticalSummaryOutput | null;
  handleGenerateSummary: (style: AnalysisStyle) => Promise<void>;
  isLoading: boolean;
  isBaseTextAvailable: boolean;
}

export function CriticalSummaryPanel({ criticalSummaryResult, handleGenerateSummary, isLoading, isBaseTextAvailable }: CriticalSummaryPanelProps) {
  const [selectedStyle, setSelectedStyle] = useState<AnalysisStyle>("academic");

  const onGenerate = () => {
    handleGenerateSummary(selectedStyle);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Quote className="h-6 w-6 text-primary" />
          Résumé Critique (Commentaire Expert)
        </CardTitle>
        <CardDescription>Générez un résumé critique du texte analysé avec un style configurable.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="analysis-style-select" className="text-lg">Style d'analyse :</Label>
          <Select 
            value={selectedStyle} 
            onValueChange={(value) => setSelectedStyle(value as AnalysisStyle)}
            disabled={isLoading}
          >
            <SelectTrigger id="analysis-style-select" className="w-full md:w-[280px]">
              <SelectValue placeholder="Choisissez un style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="academic">Académique</SelectItem>
              <SelectItem value="journalistic">Journalistique</SelectItem>
              <SelectItem value="sarcastic">Sarcastique</SelectItem>
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
              <span className="ml-2">Génération...</span>
            </>
          ) : (
            <>
              <MessageSquareHeart className="mr-2 h-5 w-5" />
              Générer le Résumé Critique
            </>
          )}
        </Button>

        {criticalSummaryResult && !isLoading && (
          <div className="space-y-2 pt-4 animate-fadeIn">
            <h3 className="text-xl font-semibold font-headline">Résumé Généré :</h3>
            <p className="text-foreground/90 leading-relaxed bg-secondary/30 p-4 rounded-md shadow-inner whitespace-pre-wrap">
              {criticalSummaryResult.summary}
            </p>
          </div>
        )}
         {!criticalSummaryResult && !isLoading && isBaseTextAvailable && (
           <p className="text-muted-foreground pt-4">Cliquez sur "Générer le Résumé Critique" pour voir le résultat.</p>
         )}
         {!isBaseTextAvailable && !isLoading && (
            <p className="text-muted-foreground pt-4">Veuillez d'abord analyser un texte dans l'onglet "Entrée & Analyse".</p>
         )}
      </CardContent>
    </Card>
  );
}
