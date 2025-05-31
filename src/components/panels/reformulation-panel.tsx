
"use client";

import { type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PenTool, Send, Download, Trash2 } from "lucide-react";
import type { ReformulateTextOutput, ReformulateTextInput } from "@/ai/flows/reformulate-text"; // No longer need ReformulateTextInput here
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { downloadTxt } from "@/lib/utils";

interface ReformulationStyleOption {
  value: string;
  label: string;
}

interface ReformulationPanelProps {
  reformulationInputText: string;
  setReformulationInputText: Dispatch<SetStateAction<string>>;
  reformulationStyles: ReformulationStyleOption[]; 
  selectedReformulationStyle: string;
  setSelectedReformulationStyle: Dispatch<SetStateAction<string>>;
  reformulationResult: ReformulateTextOutput | null;
  setReformulationResult: Dispatch<SetStateAction<ReformulateTextOutput | null>>;
  isReformulating: boolean;
  handleReformulate: () => Promise<void>; // Changed signature
  currentLanguage: string;
}

const panelLabels: Record<string, Record<string, string>> = {
  fr: {
    title: "Module de Reformulation de Texte",
    description: "Explorez comment un même texte peut être transformé sous différents prismes stylistiques et intentionnels. Les reformulations visent à être détaillées et complètes.",
    textToReformulateLabel: "Texte à Reformuler :",
    textToReformulatePlaceholder: "Entrez le texte que vous souhaitez voir reformulé...",
    reformulationStyleLabel: "Style de Reformulation :",
    reformulationStylePlaceholder: "Choisissez un style de reformulation",
    reformulationButton: "Lancer la Reformulation",
    reformulatingButton: "Reformulation en cours...",
    clearButton: "Effacer",
    originalTextTitle: "Texte Original",
    noOriginalText: "Aucun texte original fourni.",
    reformulatedTextTitle: "Texte Reformulé",
    styleLabel: "Style",
    unknownStyle: "Inconnu",
    downloadButton: "Télécharger",
    noReformulationGenerated: "Aucune reformulation générée.",
    clickToSeeResults: "Cliquez sur \"Lancer la Reformulation\" pour voir le résultat.",
    footerNote: "Les reformulations sont générées par IA et visent à être substantielles. La qualité dépend du style choisi et du texte source.",
    errorToastTitle: "Erreur",
    emptyTextError: "Veuillez entrer un texte à reformuler.",
    noStyleError: "Veuillez sélectionner un style de reformulation.",
    clearToastTitle: "Champs effacés",
    clearToastDescription: "Les champs de texte de reformulation ont été effacés.",
    downloadSuccess: "Reformulation téléchargée.",
    downloadError: "Aucune reformulation valide à télécharger.",
    reformulationErrorPrefix: "Erreur:",
    modelDidNotProvidePrefix: "Le modèle n'a pas fourni",
    failedToReformulatePrefix: "Échec de la reformulation",
  },
  en: {
    title: "Text Reformulation Module",
    description: "Explore how the same text can be transformed through different stylistic and intentional prisms. Reformulations aim to be detailed and complete.",
    textToReformulateLabel: "Text to Reformulate:",
    textToReformulatePlaceholder: "Enter the text you want to see reformulated...",
    reformulationStyleLabel: "Reformulation Style:",
    reformulationStylePlaceholder: "Choose a reformulation style",
    reformulationButton: "Start Reformulation",
    reformulatingButton: "Reformulating...",
    clearButton: "Clear",
    originalTextTitle: "Original Text",
    noOriginalText: "No original text provided.",
    reformulatedTextTitle: "Reformulated Text",
    styleLabel: "Style",
    unknownStyle: "Unknown",
    downloadButton: "Download",
    noReformulationGenerated: "No reformulation generated.",
    clickToSeeResults: "Click \"Start Reformulation\" to see the result.",
    footerNote: "Reformulations are AI-generated and aim to be substantial. Quality depends on the chosen style and source text.",
    errorToastTitle: "Error",
    emptyTextError: "Please enter text to reformulate.",
    noStyleError: "Please select a reformulation style.",
    clearToastTitle: "Fields cleared",
    clearToastDescription: "Reformulation text fields have been cleared.",
    downloadSuccess: "Reformulation downloaded.",
    downloadError: "No valid reformulation to download.",
    reformulationErrorPrefix: "Error:",
    modelDidNotProvidePrefix: "The model did not provide",
    failedToReformulatePrefix: "Failed to reformulate",
  }
};

export function ReformulationPanel({ 
  reformulationInputText,
  setReformulationInputText,
  reformulationStyles, 
  selectedReformulationStyle,
  setSelectedReformulationStyle,
  reformulationResult,
  setReformulationResult,
  isReformulating,
  handleReformulate,
  currentLanguage
}: ReformulationPanelProps) {
  const { toast } = useToast();
  const labels = panelLabels[currentLanguage] || panelLabels.fr;

  const onTriggerReformulation = async () => {
    if (!reformulationInputText.trim()) {
      toast({ title: labels.errorToastTitle, description: labels.emptyTextError, variant: "destructive" });
      return;
    }
    if (!selectedReformulationStyle) {
      toast({ title: labels.errorToastTitle, description: labels.noStyleError, variant: "destructive" });
      return;
    }
    setReformulationResult(null); 
    await handleReformulate(); // Removed input from here, parent (CognitiveMapperClient) will construct it
  };

  const handleClear = () => {
    setReformulationInputText("");
    setReformulationResult(null);
    toast({ title: labels.clearToastTitle, description: labels.clearToastDescription });
  };

  const handleDownload = () => {
    if (reformulationResult && reformulationResult.reformulatedText && 
        !reformulationResult.reformulatedText.startsWith(labels.reformulationErrorPrefix) && 
        !reformulationResult.reformulatedText.startsWith(labels.modelDidNotProvidePrefix) && 
        !reformulationResult.reformulatedText.startsWith(labels.failedToReformulatePrefix)) {
      const contentToDownload = `${labels.originalTextTitle}:\n${reformulationInputText}\n\n${labels.styleLabel}: ${reformulationResult.styleUsed}\n${labels.reformulatedTextTitle}:\n${reformulationResult.reformulatedText}`;
      const filename = currentLanguage === 'fr' 
        ? `reformulation_${reformulationResult.styleUsed}.txt` 
        : `reformulation_${reformulationResult.styleUsed}.txt`;
      downloadTxt(contentToDownload, filename);
      toast({ title: labels.successToastTitle, description: labels.downloadSuccess });
    } else {
      toast({ title: labels.errorToastTitle, description: labels.downloadError, variant: "destructive" });
    }
  };
  
  const successToastTitle = panelLabels[currentLanguage]?.successToastTitle || panelLabels.fr.successToastTitle;


  return (
    <Card className="shadow-xl bg-card/80 backdrop-blur-md border-primary/30">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
          <PenTool className="h-6 w-6" />
          {labels.title}
        </CardTitle>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="reformulation-input" className="text-lg font-semibold">{labels.textToReformulateLabel}</Label>
          <Textarea
            id="reformulation-input"
            placeholder={labels.textToReformulatePlaceholder}
            value={reformulationInputText}
            onChange={(e) => setReformulationInputText(e.target.value)}
            rows={8}
            className="min-h-[150px] border-input focus:border-accent transition-colors duration-300 shadow-inner rounded-lg p-3 bg-background/80"
            disabled={isReformulating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reformulation-style-select" className="text-lg font-semibold">{labels.reformulationStyleLabel}</Label>
          <Select 
            value={selectedReformulationStyle} 
            onValueChange={setSelectedReformulationStyle}
            disabled={isReformulating}
          >
            <SelectTrigger id="reformulation-style-select" className="w-full md:w-[320px] bg-background/80">
              <SelectValue placeholder={labels.reformulationStylePlaceholder} />
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
                <span className="ml-2">{labels.reformulatingButton}</span>
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                {labels.reformulationButton}
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleClear} disabled={isReformulating}>
            <Trash2 className="mr-2 h-4 w-4" />
            {labels.clearButton}
          </Button>
        </div>

        {reformulationResult && (
          <div className="space-y-6 pt-6 animate-fadeIn">
            <Card className="bg-secondary/10">
              <CardHeader>
                <CardTitle className="text-lg text-accent">{labels.originalTextTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-auto max-h-60 min-h-[80px] pr-3">
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-sm p-2 bg-muted/10 rounded">{reformulationInputText || labels.noOriginalText}</p>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="bg-background shadow-lg border border-accent/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-primary">
                  {labels.reformulatedTextTitle} ({labels.styleLabel}: <span className="font-semibold capitalize">{reformulationResult.styleUsed?.replace(/_/g, ' ') || labels.unknownStyle}</span>)
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleDownload} 
                        disabled={!reformulationResult.reformulatedText || reformulationResult.reformulatedText.startsWith(labels.reformulationErrorPrefix) || reformulationResult.reformulatedText.startsWith(labels.modelDidNotProvidePrefix) || reformulationResult.reformulatedText.startsWith(labels.failedToReformulatePrefix)}>
                  <Download className="mr-2 h-4 w-4" />
                  {labels.downloadButton}
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-auto max-h-96 min-h-[120px] pr-3">
                  {reformulationResult.reformulatedText.startsWith(labels.reformulationErrorPrefix) || reformulationResult.reformulatedText.startsWith(labels.modelDidNotProvidePrefix) || reformulationResult.reformulatedText.startsWith(labels.failedToReformulatePrefix) ? (
                    <p className="text-destructive leading-relaxed whitespace-pre-wrap p-4 bg-destructive/10 rounded-md">
                      {reformulationResult.reformulatedText}
                    </p>
                  ) : (
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap p-4 bg-muted/20 rounded-md shadow-inner">
                      {reformulationResult.reformulatedText || labels.noReformulationGenerated}
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
         {!reformulationResult && !isReformulating && reformulationInputText && selectedReformulationStyle && (
           <p className="text-muted-foreground pt-4 text-center italic">{labels.clickToSeeResults}</p>
         )}
      </CardContent>
      <CardFooter className="border-t border-border/30 pt-4 mt-4">
          <p className="text-xs text-muted-foreground">
            {labels.footerNote}
          </p>
      </CardFooter>
    </Card>
  );
}
    
