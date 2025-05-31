"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drama, Send } from "lucide-react"; // Using Drama icon for "paranoid"
import type { DetectHiddenNarrativesOutput } from "@/ai/flows/detect-hidden-narratives";
import { LoadingSpinner } from "@/components/loading-spinner";

interface ParanoidReadingPanelProps {
  paranoidReadingResult: DetectHiddenNarrativesOutput | null;
  handleGenerateParanoidReading: () => Promise<void>;
  isLoading: boolean;
  isBaseTextAvailable: boolean;
}

export function ParanoidReadingPanel({ paranoidReadingResult, handleGenerateParanoidReading, isLoading, isBaseTextAvailable }: ParanoidReadingPanelProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Drama className="h-6 w-6 text-primary" />
          Lecture Paranoïaque (IA Gemini)
        </CardTitle>
        <CardDescription>Détectez les intentions implicites et les narratifs cachés via une lecture alternative du texte.</CardDescription>
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
              <span className="ml-2">Détection en cours...</span>
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Lancer la Lecture Paranoïaque
            </>
          )}
        </Button>

        {paranoidReadingResult && !isLoading && (
          <div className="space-y-2 pt-4 animate-fadeIn">
            <h3 className="text-xl font-semibold font-headline">Narratifs Cachés Détectés :</h3>
            <p className="text-foreground/90 leading-relaxed bg-secondary/30 p-4 rounded-md shadow-inner whitespace-pre-wrap">
              {paranoidReadingResult.hiddenNarratives}
            </p>
          </div>
        )}
        {!paranoidReadingResult && !isLoading && isBaseTextAvailable && (
           <p className="text-muted-foreground pt-4">Cliquez sur "Lancer la Lecture Paranoïaque" pour voir le résultat.</p>
         )}
        {!isBaseTextAvailable && !isLoading && (
          <p className="text-muted-foreground pt-4">Veuillez d'abord analyser un texte dans l'onglet "Entrée & Analyse".</p>
        )}
      </CardContent>
    </Card>
  );
}
