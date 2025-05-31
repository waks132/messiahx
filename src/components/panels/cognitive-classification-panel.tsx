
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BrainCircuit, Zap, Info, BarChartBig, HelpCircle, Lightbulb } from "lucide-react";
import type { ClassifyCognitiveCategoriesOutput, ClassifyCognitiveCategoriesInput } from "@/ai/flows/classify-cognitive-categories";
import type { AnalyzeTextOutput } from "@/ai/flows/analyze-text-for-manipulation";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CognitiveClassificationPanelProps {
  classificationResult: ClassifyCognitiveCategoriesOutput | null;
  baseAnalysisResults: AnalyzeTextOutput | null;
  originalText: string;
  handleClassifyCognitiveCategories: (input: ClassifyCognitiveCategoriesInput) => Promise<void>;
  isLoading: boolean;
}

const getScoreColor = (score: number): string => {
  if (score >= 65) return "text-destructive";
  if (score >= 30) return "text-yellow-600";
  return "text-green-600";
};

const getIntensityColor = (intensity: number): string => {
  if (intensity >= 7) return "bg-destructive/80";
  if (intensity >= 4) return "bg-yellow-500/80";
  return "bg-green-500/80";
}


export function CognitiveClassificationPanel({ 
  classificationResult, 
  baseAnalysisResults,
  originalText,
  handleClassifyCognitiveCategories, 
  isLoading 
}: CognitiveClassificationPanelProps) {

  const onGenerateClassification = () => {
    if (baseAnalysisResults && originalText) {
      const input: ClassifyCognitiveCategoriesInput = {
        analysisSummary: baseAnalysisResults.summary,
        manipulativeTechniques: baseAnalysisResults.manipulativeTechniques,
        cognitiveBiases: baseAnalysisResults.cognitiveBiases,
        unverifiableFacts: baseAnalysisResults.unverifiableFacts,
        originalText: originalText,
      };
      handleClassifyCognitiveCategories(input);
    }
  };
  
  const isReadyToClassify = !!baseAnalysisResults && !!originalText.trim();

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          Classification Cognitive Locale
        </CardTitle>
        <CardDescription>Analyse approfondie des catégories cognitives, de leur intensité et classification globale du contenu.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={onGenerateClassification} 
          disabled={isLoading || !isReadyToClassify}
          size="lg"
          className="w-full md:w-auto transition-all duration-300 hover:shadow-md transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Classification en cours...</span>
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" />
              Lancer la Classification Détaillée
            </>
          )}
        </Button>

        {!isReadyToClassify && !isLoading && (
          <p className="text-muted-foreground pt-4">
            Veuillez d'abord effectuer une analyse cognitive de base dans l'onglet "Entrée & Analyse" pour activer cette fonctionnalité.
          </p>
        )}

        {isLoading && isReadyToClassify && (
          <div className="flex justify-center items-center min-h-[200px]">
            <LoadingSpinner size="lg" />
            <p className="ml-4 text-lg">Classification en cours, veuillez patienter...</p>
          </div>
        )}

        {classificationResult && !isLoading && (
          <div className="space-y-6 pt-4 animate-fadeIn">
            {/* Overall Classification Section */}
            <Card className="bg-secondary/30 shadow-inner">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                  <Info className="h-5 w-5 text-accent" />
                  Classification Globale du Contenu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Type de Contenu:</span>
                  <Badge variant="default" className="text-base px-3 py-1">{classificationResult.overallClassification.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Score:</span>
                  <span className={`font-bold text-lg ${getScoreColor(classificationResult.overallClassification.score)}`}>
                    {classificationResult.overallClassification.score.toFixed(0)}/100
                  </span>
                </div>
                 <div className="w-full">
                    <Progress value={classificationResult.overallClassification.score} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:via-yellow-500 [&>div]:to-red-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-1"><Lightbulb className="h-4 w-4"/>Raisonnement:</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{classificationResult.overallClassification.reasoning}</p>
                </div>
              </CardContent>
            </Card>

            {/* Classified Categories Section */}
            <div>
              <h3 className="text-xl font-semibold font-headline mb-3 flex items-center gap-2">
                <BarChartBig className="h-5 w-5 text-accent" />
                Catégories Cognitives Détaillées:
              </h3>
              {classificationResult.classifiedCategories.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {classificationResult.classifiedCategories.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index} className="border-b border-border/50">
                      <AccordionTrigger className="hover:bg-secondary/20 px-2 py-3 rounded-md transition-colors">
                        <div className="flex items-center justify-between w-full">
                            <span className="font-semibold text-left">{item.categoryName}</span>
                            <TooltipProvider>
                              <Tooltip delayDuration={100}>
                                  <TooltipTrigger asChild>
                                      <div className="flex items-center gap-2">
                                          <Progress value={item.intensity * 10} className={`w-20 h-2.5 ${getIntensityColor(item.intensity)}`} />
                                          <Badge variant="outline" className="text-sm">{item.intensity}/10</Badge>
                                      </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                      <p>Intensité: {item.intensity}/10</p>
                                  </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 py-3 text-sm text-foreground/80 bg-background rounded-b-md">
                        {item.description}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground">Aucune catégorie cognitive spécifique n'a été identifiée pour ce texte.</p>
              )}
            </div>
          </div>
        )}
         {!classificationResult && !isLoading && isReadyToClassify && (
           <p className="text-muted-foreground pt-4">Cliquez sur "Lancer la Classification Détaillée" pour voir les résultats.</p>
         )}
      </CardContent>
      <CardFooter>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
              <HelpCircle className="h-3 w-3" /> 
              Cette classification est générée par IA et peut nécessiter une interprétation critique.
          </p>
      </CardFooter>
    </Card>
  );
}
