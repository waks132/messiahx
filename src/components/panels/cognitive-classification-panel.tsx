
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BrainCircuit, Zap, Info, BarChartBig, HelpCircle, Lightbulb, AlertTriangle, Settings } from "lucide-react";
import type { ClassifyCognitiveCategoriesOutput, ClassifyCognitiveCategoriesInput } from "@/ai/flows/classify-cognitive-categories";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CognitiveIntensityChart } from "@/components/charts/cognitive-intensity-chart";

interface CognitiveClassificationPanelProps {
  classificationResult: ClassifyCognitiveCategoriesOutput | null;
  handleClassifyCognitiveCategories: () => Promise<void>; // Removed input from props, will be constructed inside
  isLoading: boolean;
  isReadyToClassify: boolean;
}

const getScoreColorClass = (score: number): string => {
  if (score >= 65) return "text-destructive"; // HSL destructive
  if (score >= 40) return "text-yellow-500"; // A distinct warning yellow
  return "text-green-500"; // A positive green
};

const getBadgeVariantForContentType = (type: string | undefined): "default" | "secondary" | "destructive" => {
    switch (type) {
        case 'conspiracy': return 'destructive';
        case 'literary':
        case 'political_discourse':
            return 'secondary';
        case 'opinion':
        case 'promotional':
            return 'default'; // Or a more specific color if added to theme
        default: return 'outline';
    }
};


export function CognitiveClassificationPanel({ 
  classificationResult, 
  handleClassifyCognitiveCategories, 
  isLoading,
  isReadyToClassify
}: CognitiveClassificationPanelProps) {
  
  const overallClassificationData = classificationResult?.overallClassification;

  return (
    <Card className="shadow-xl bg-card/70 backdrop-blur-md border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
          <BrainCircuit className="h-6 w-6" />
          Classification Cognitive Contextuelle
        </CardTitle>
        <CardDescription>Analyse approfondie des catégories cognitives, de leur intensité, et classification globale du contenu basée sur le contexte.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={handleClassifyCognitiveCategories} 
          disabled={isLoading || !isReadyToClassify}
          size="lg"
          className="w-full md:w-auto transition-all duration-300 hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-primary to-accent text-primary-foreground"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Classification en cours...</span>
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" />
              Lancer la Classification Contextuelle
            </>
          )}
        </Button>

        {!isReadyToClassify && !isLoading && (
          <Card className="border-dashed border-muted-foreground/50 p-6 text-center bg-muted/20">
            <Info className="h-10 w-10 text-muted-foreground mx-auto mb-3"/>
            <p className="text-muted-foreground">
              Veuillez d'abord effectuer une analyse initiale du discours dans l'onglet "Analyse Initiale" pour activer cette fonctionnalité.
            </p>
          </Card>
        )}

        {isLoading && isReadyToClassify && (
          <div className="flex flex-col justify-center items-center min-h-[200px] space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-lg text-primary animate-pulse">Classification contextuelle en cours...</p>
          </div>
        )}

        {classificationResult && !isLoading && (
          <div className="space-y-6 pt-4 animate-fadeIn">
            {overallClassificationData && overallClassificationData.reasoning !== 'Classification data incomplete.' && !overallClassificationData.reasoning.startsWith("Failed to classify") ? (
              <Card className="bg-background shadow-lg border border-border/50 rounded-lg overflow-hidden">
                <CardHeader className="bg-secondary/20 border-b border-border/30">
                  <CardTitle className="font-headline text-xl flex items-center gap-2 text-accent">
                    <Settings className="h-5 w-5" />
                    Classification Globale du Contenu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground/90">Type de Contenu:</span>
                    <Badge variant={getBadgeVariantForContentType(overallClassificationData.type)} className="text-base px-3 py-1 shadow-sm capitalize">{overallClassificationData.type?.replace(/_/g, ' ') || "N/D"}</Badge>
                  </div>
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-foreground/90">Score de Confiance/Intensité:</span>
                        <span className={`font-bold text-lg ${getScoreColorClass(overallClassificationData.score || 0)}`}>
                        {(overallClassificationData.score || 0).toFixed(0)}/100
                        </span>
                    </div>
                    <Progress 
                        value={overallClassificationData.score || 0} 
                        className="h-3 rounded-full" 
                        indicatorClassName={`${ (overallClassificationData.score || 0) > 65 ? 'bg-destructive' : (overallClassificationData.score || 0) > 40 ? 'bg-yellow-500' : 'bg-green-500' } rounded-full`}
                    />
                  </div>
                  {overallClassificationData.reasoning && (
                    <div className="mt-3 border-t border-border/30 pt-3">
                      <h4 className="font-semibold mb-1 flex items-center gap-1 text-foreground/90"><Lightbulb className="h-4 w-4 text-accent"/>Raisonnement de l'IA:</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed italic bg-muted/20 p-3 rounded-md">{overallClassificationData.reasoning}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-destructive/5 border-destructive/30 shadow-md">
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Classification Globale Indisponible
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive/80">{overallClassificationData?.reasoning || "Les données de classification globale n'ont pas pu être déterminées."}</p>
                </CardContent>
              </Card>
            )}

            <CognitiveIntensityChart classificationResult={classificationResult} />

            <div>
              <h3 className="text-xl font-semibold font-headline mb-3 flex items-center gap-2 text-accent">
                <BarChartBig className="h-5 w-5" />
                Intensités des Catégories Cognitives Détaillées:
              </h3>
              {classificationResult.classifiedCategories && classificationResult.classifiedCategories.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {classificationResult.classifiedCategories.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index} className="border border-border/40 rounded-lg shadow-sm bg-background hover:bg-secondary/10 transition-colors overflow-hidden">
                      <AccordionTrigger className="hover:bg-secondary/20 px-4 py-3 text-left hover:no-underline focus:ring-2 focus:ring-accent/50 rounded-t-md">
                        <div className="flex items-center justify-between w-full">
                            <span className="font-semibold text-primary text-base">{item.categoryName || "Catégorie inconnue"}</span>
                            <TooltipProvider>
                              <Tooltip delayDuration={100}>
                                  <TooltipTrigger asChild>
                                      <div className="flex items-center gap-2">
                                          <Progress value={(item.intensity || 0) * 10} className={`w-24 h-2.5 rounded-full bg-muted`} indicatorClassName="bg-accent rounded-full" />
                                          <Badge variant="outline" className="text-sm border-accent text-accent">{(item.intensity || 0)}/10</Badge>
                                      </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="bg-popover text-popover-foreground p-2 rounded-md shadow-xl max-w-xs">
                                      <p className="font-bold">Intensité: {item.intensity || 0}/10</p>
                                      <p className="text-xs mt-1">{item.description || "Pas de description."}</p>
                                  </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-2 text-sm text-foreground/80 bg-muted/10 rounded-b-md">
                        <p className="italic">{item.description || "Pas de description fournie pour cette catégorie."}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground italic text-center py-4">Aucune catégorie cognitive spécifique n'a été classifiée pour ce texte, ou les données sont incomplètes.</p>
              )}
            </div>
          </div>
        )}
         {!classificationResult && !isLoading && isReadyToClassify && (
           <p className="text-muted-foreground pt-4 text-center italic">Cliquez sur "Lancer la Classification Contextuelle" pour voir les résultats.</p>
         )}
      </CardContent>
      <CardFooter className="border-t border-border/30 pt-4 mt-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" /> 
              La classification contextuelle est générée par IA et peut nécessiter une interprétation critique. Les résultats sont basés sur le modèle et le prompt configurés.
          </p>
      </CardFooter>
    </Card>
  );
}
