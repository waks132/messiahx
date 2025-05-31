
"use client";

import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { FileText, UploadCloud, Sparkles, Search, ShieldAlert, Telescope, MessageSquareText } from "lucide-react";
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
}

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
  isSearchingManipulation
}: InputPanelProps) {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/plain") {
        try {
            const text = await file.text();
            setInputText(text);
        } catch (error) {
            console.error("Error reading file:", error);
            alert("Erreur lors de la lecture du fichier.");
        }
      } else {
        alert("Veuillez charger un fichier .txt uniquement.");
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
          Saisie du Texte & Recherche Contextuelle
        </CardTitle>
        <CardDescription>Entrez le texte pour l'analyse cognitive principale, ou utilisez le champ ci-dessous pour des recherches contextuelles spécifiques.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="text-input" className="text-lg font-semibold text-foreground/90">Texte pour Analyse Cognitive Principale :</Label>
          <Textarea
            id="text-input"
            placeholder="Collez votre texte, écrivez directement, ou chargez un fichier .txt ci-dessous..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={10}
            className="min-h-[200px] border-2 border-input focus:border-accent transition-colors duration-300 shadow-inner rounded-lg p-4 bg-background/80 text-base"
            disabled={isAnyLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-upload" className="text-lg font-semibold text-foreground/90">Ou chargez un fichier .txt pour l'analyse principale :</Label>
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
              <span className="ml-2">Analyse Initiale en cours...</span>
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Lancer l'Analyse Initiale du Discours (sur le texte ci-dessus)
            </>
          )}
        </Button>

        <div className="border-t border-border/30 pt-6 space-y-4">
            <Label htmlFor="research-query-input" className="text-lg font-semibold text-foreground/90">Termes pour Recherche Contextuelle / Analyse de Manipulation :</Label>
            <Input
                id="research-query-input"
                placeholder="Entrez un sujet, une phrase clé, ou un extrait de texte pour une recherche spécifique..."
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
                        <span className="ml-2">Recherche...</span>
                    </>
                    ) : (
                    <>
                        <Telescope className="mr-2 h-4 w-4" />
                        Recherche Contextuelle (sur le terme ci-dessus)
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
                        <span className="ml-2">Analyse Sonar...</span>
                    </>
                    ) : (
                    <>
                        <MessageSquareText className="mr-2 h-4 w-4" />
                        Analyse de Manipulation (sur le terme ci-dessus)
                    </>
                    )}
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
    
