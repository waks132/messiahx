"use client";

import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, UploadCloud, Send } from "lucide-react";
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
        const text = await file.text();
        setInputText(text);
      } else {
        alert("Please upload a .txt file.");
      }
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Texte Utilisateur
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="text-input" className="text-lg">Entrez votre texte ici :</Label>
          <Textarea
            id="text-input"
            placeholder="Collez votre texte ou écrivez directement..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={10}
            className="min-h-[200px] border-2 focus:border-primary transition-colors duration-300"
            disabled={isAnalyzing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-upload" className="text-lg">Ou chargez un fichier .txt :</Label>
          <div className="flex items-center gap-2">
            <Input
              id="file-upload"
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              disabled={isAnalyzing}
            />
             <UploadCloud className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !inputText.trim()} 
          size="lg" 
          className="w-full transition-all duration-300 hover:shadow-md transform hover:scale-105"
        >
          {isAnalyzing ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Analyse en cours...</span>
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Lancer l'Analyse Cognitive
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
