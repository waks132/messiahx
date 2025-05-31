
"use client";

import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, UploadCloud, Send, Sparkles } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";

interface InputPanelProps {
  inputText: string;
  setInputText: Dispatch<SetStateAction<string>>;
  handleAnalyze: () => Promise<void>;
  isAnalyzing: boolean;
}

export function InputPanel({ inputText, setInputText, handleAnalyze, isAnalyzing }: InputPanelProps) {
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
      // Reset file input to allow re-uploading the same file
      event.target.value = "";
    }
  };

  return (
    <Card className="shadow-xl bg-card/70 backdrop-blur-md border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
          <FileText className="h-6 w-6" />
          Saisie du Texte Utilisateur
        </CardTitle>
        <CardDescription>Entrez ou chargez le texte à analyser pour la cartographie cognitive.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="text-input" className="text-lg font-semibold text-foreground/90">Entrez votre texte ici :</Label>
          <Textarea
            id="text-input"
            placeholder="Collez votre texte, écrivez directement, ou chargez un fichier .txt ci-dessous..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={12}
            className="min-h-[250px] border-2 border-input focus:border-accent transition-colors duration-300 shadow-inner rounded-lg p-4 bg-background/80 text-base"
            disabled={isAnalyzing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-upload" className="text-lg font-semibold text-foreground/90">Ou chargez un fichier .txt :</Label>
          <div className="flex items-center gap-3 p-3 border border-dashed border-border rounded-lg bg-muted/20 hover:border-accent transition-colors">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <Input
              id="file-upload"
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-accent/20 hover:file:text-accent-foreground cursor-pointer disabled:opacity-50"
              disabled={isAnalyzing}
            />
          </div>
        </div>
        
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !inputText.trim()} 
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
              Lancer l'Analyse Initiale du Discours
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
