
"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PenTool, Send, Download, Trash2 } from "lucide-react";
import type { ReformulateTextOutput, ReformulateTextInput } from "@/ai/flows/reformulate-text";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { downloadTxt } from "@/lib/utils";

// This should ideally come from a shared types file or dynamically from prompts.json
// For now, keep it aligned with public/prompts.json reformulationPrompts keys
const reformulationStyles = [
  { value: "neutral", label: "Neutre et Objectif" },
  { value: "messianic", label: "Messianique / Prophétique" },
  { value: "paranoid", label: "Paranoïaque / Conspirateur" },
  { value: "analytical_rhetoric", label: "Analyse Rhétorique Détaillée" },
];

interface ReformulationPanelProps {
  reformulationInputText: string;
  setReformulationInputText: Dispatch<SetStateAction<string>>;
  selectedReformulationStyle: string;
  setSelectedReformulationStyle: Dispatch<SetStateAction<string>>;
  reformulationResult: ReformulateTextOutput | null;
  setReformulationResult: Dispatch<SetStateAction<ReformulateTextOutput | null>>;
  isReformulating: boolean;
  handleReformulate: (input: ReformulateTextInput) => Promise<void>;
}

export function ReformulationPanel({ 
  reformulationInputText,
  setReformulationInputText,
  selectedReformulationStyle,
  setSelectedReformulationStyle,
  reformulationResult,
  setReformulationResult,
  isReformulating,
  handleReformulate
}: ReformulationPanelProps) {
  const { toast } = useToast();

  const onTriggerReformulation = async () => {
    if (!reformulationInputText.trim()) {
      toast({ title: "Erreur", description: "Veuillez entrer un texte à reformuler.", variant: "destructive" });
      return;
    }
    if (!selectedReformulationStyle) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un style de reformulation.", variant: "destructive" });
      return;
    }
    // Clear previous results before new reformulation
    setReformulationResult(null); 
    await handleReformulate({ text: reformulationInputText, style: selectedReformulationStyle });
  };

  const handleClear = () => {
    setReformulationInputText("");
    setReformulationResult(null);
  };

  const handleDownload = () => {
    if (reformulationResult && reformulationResult.reformulatedText && !reformulationResult.reformulatedText.startsWith("Error:") && !reformulationResult.reformulatedText.startsWith("The model did not provide") && !reformulationResult.reformulatedText.startsWith("Failed to reformulate")) {
      const contentToDownload = `Original Text:\n${reformulationInputText}\n\nStyle: ${reformulationResult.styleUsed}\nReformulated Text:\n${reformulationResult.reformulatedText}`;
      downloadTxt(contentToDownload, `reformulation_${reformulationResult.styleUsed}.txt`);
      toast({ title: "Succès", description: "Reformulation téléchargée." });
    } else {
      toast({ title: "Erreur", description: "Aucune reformulation valide à télécharger.", variant: "destructive" });
    }
  };

  return (
    <Card className="shadow-xl bg-card/80 backdrop-blur-md border-primary/30">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
          <PenTool className="h-6 w-6" />
          Module de Reformulation de Texte
        </CardTitle>
        <CardDescription>Explorez comment un même texte peut être transformé sous différents prismes stylistiques et intentionnels. Les reformulations visent à être détaillées et complètes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="reformulation-input" className="text-lg font-semibold">Texte à Reformuler :</Label>
          <Textarea
            id="reformulation-input"
            placeholder="Entrez le texte que vous souhaitez voir reformulé..."
            value={reformulationInputText}
            onChange={(e) => setReformulationInputText(e.target.value)}
            rows={8}
            className="min-h-[150px] border-input focus:border-accent transition-colors duration-300 shadow-inner rounded-lg p-3 bg-background/80"
            disabled={isReformulating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reformulation-style-select" className="text-lg font-semibold">Style de Reformulation :</Label>
          <Select 
            value={selectedReformulationStyle} 
            onValueChange={setSelectedReformulationStyle}
            disabled={isReformulating}
          >
            <SelectTrigger id="reformulation-style-select" className="w-full md:w-[320px] bg-background/80">
              <SelectValue placeholder="Choisissez un style de reformulation" />
            </SelectTrigger>
            <SelectContent>
              {reformulationStyles.map(style => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={onTriggerReformulation} 
            disabled={isReformulating || !reformulationInputText.trim() || !selectedReformulationStyle}
            size="lg"
            className="transition-all duration-300 hover:shadow-md transform hover:scale-105 bg-gradient-to-r from-primary to-accent text-primary-foreground"
          >
            {isReformulating ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Reformulation en cours...</span>
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Lancer la Reformulation
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleClear} disabled={isReformulating}>
            <Trash2 className="mr-2 h-4 w-4" />
            Effacer
          </Button>
        </div>

        {reformulationResult && (
          <div className="space-y-6 pt-6 animate-fadeIn">
            <Card className="bg-secondary/10">
              <CardHeader>
                <CardTitle className="text-lg text-accent">Texte Original</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-auto max-h-60 min-h-[80px] pr-3">
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-sm p-2 bg-muted/10 rounded">{reformulationInputText || "Aucun texte original fourni."}</p>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="bg-background shadow-lg border border-accent/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-primary">
                  Texte Reformulé (Style: <span className="font-semibold capitalize">{reformulationResult.styleUsed?.replace(/_/g, ' ') || 'Inconnu'}</span>)
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleDownload} 
                        disabled={!reformulationResult.reformulatedText || reformulationResult.reformulatedText.startsWith("Error:") || reformulationResult.reformulatedText.startsWith("The model did not provide") || reformulationResult.reformulatedText.startsWith("Failed to reformulate")}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-auto max-h-96 min-h-[120px] pr-3">
                  {reformulationResult.reformulatedText.startsWith("Error:") || reformulationResult.reformulatedText.startsWith("The model did not provide") || reformulationResult.reformulatedText.startsWith("Failed to reformulate") ? (
                    <p className="text-destructive leading-relaxed whitespace-pre-wrap p-4 bg-destructive/10 rounded-md">
                      {reformulationResult.reformulatedText}
                    </p>
                  ) : (
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap p-4 bg-muted/20 rounded-md shadow-inner">
                      {reformulationResult.reformulatedText || "Aucune reformulation générée."}
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
         {!reformulationResult && !isReformulating && reformulationInputText && selectedReformulationStyle && (
           <p className="text-muted-foreground pt-4 text-center italic">Cliquez sur "Lancer la Reformulation" pour voir le résultat.</p>
         )}
      </CardContent>
      <CardFooter className="border-t border-border/30 pt-4 mt-4">
          <p className="text-xs text-muted-foreground">
            Les reformulations sont générées par IA et visent à être substantielles. La qualité dépend du style choisi et du texte source.
          </p>
      </CardFooter>
    </Card>
  );
}
