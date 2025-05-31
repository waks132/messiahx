
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Save, RotateCcw, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/loading-spinner';

interface PromptDetail {
  name: string;
  description: string;
  prompt: string;
}

interface PromptsData {
  [key: string]: PromptDetail;
}

export default function PromptConfigPage() {
  const [prompts, setPrompts] = useState<PromptsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const defaultPromptsPath = '/prompts.json'; // Path in the public folder

  const fetchPrompts = async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to fetch prompts from ${path}: ${response.statusText}`);
      }
      const data: PromptsData = await response.json();
      setPrompts(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur de chargement",
        description: `Impossible de charger les prompts depuis ${path}. Utilisation des prompts sauvegardés ou affichage d'une erreur.`,
        variant: "destructive",
      });
      // Try loading from localStorage as a fallback
      const storedPrompts = localStorage.getItem('user_prompts');
      if (storedPrompts) {
        setPrompts(JSON.parse(storedPrompts));
        toast({
          title: "Prompts locaux chargés",
          description: "Les prompts ont été chargés depuis la sauvegarde locale.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Attempt to load from localStorage first, then fetch defaults if not present or on explicit reset
    const storedPrompts = localStorage.getItem('user_prompts');
    if (storedPrompts) {
      setPrompts(JSON.parse(storedPrompts));
      setIsLoading(false);
    } else {
      fetchPrompts(defaultPromptsPath);
    }
  }, []);

  const handlePromptChange = (promptKey: string, value: string) => {
    if (prompts) {
      setPrompts({
        ...prompts,
        [promptKey]: {
          ...prompts[promptKey],
          prompt: value,
        },
      });
    }
  };

  const handleSavePrompts = () => {
    if (prompts) {
      setIsSaving(true);
      // For now, save to localStorage. True server-side saving would require a backend API.
      localStorage.setItem('user_prompts', JSON.stringify(prompts));
      setTimeout(() => { // Simulate async operation
        setIsSaving(false);
        toast({
          title: "Prompts sauvegardés !",
          description: "Vos modifications ont été sauvegardées dans le stockage local de votre navigateur.",
        });
      }, 500);
    }
  };

  const handleResetPrompts = () => {
    fetchPrompts(defaultPromptsPath);
    localStorage.removeItem('user_prompts');
    toast({
      title: "Prompts réinitialisés",
      description: "Les prompts ont été réinitialisés à leurs valeurs par défaut.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !prompts) {
    return (
      <Card className="max-w-3xl mx-auto mt-8 bg-destructive/10 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle /> Erreur Critique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Impossible de charger la configuration des prompts : {error}</p>
          <p>Veuillez vérifier que le fichier <code>public/prompts.json</code> existe et est accessible, ou essayez de rafraîchir la page.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!prompts) {
     return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <p>Aucun prompt à afficher. Problème de chargement.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <Card className="shadow-xl bg-card/80 backdrop-blur-sm border-primary/30">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Gestionnaire de Configuration des Prompts</CardTitle>
          <CardDescription>
            Visualisez et modifiez les prompts utilisés par les différents modules d'IA.
            <br />
            <span className="text-xs text-warning-foreground bg-warning/20 p-1 rounded inline-flex items-center gap-1 mt-2">
              <Info size={14}/> Actuellement, les modifications sont sauvegardées <strong className="font-semibold">localement dans votre navigateur</strong> et ne modifient pas les prompts utilisés par les flux Genkit en production. Cette page est une démonstration de l'interface d'édition.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button onClick={handleSavePrompts} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Sauvegarde..." : "Sauvegarder les Modifications"}
            </Button>
            <Button variant="outline" onClick={handleResetPrompts}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Réinitialiser aux Défauts
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {Object.entries(prompts).map(([key, promptDetail]) => (
              <AccordionItem value={key} key={key} className="bg-background/50 border border-border/50 rounded-lg shadow-md">
                <AccordionTrigger className="hover:bg-muted/20 px-4 py-3 text-left text-lg font-semibold text-accent hover:no-underline focus:ring-2 focus:ring-ring/50 rounded-t-md">
                  {promptDetail.name || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2 space-y-3">
                  {promptDetail.description && (
                    <p className="text-sm text-muted-foreground italic">{promptDetail.description}</p>
                  )}
                  <Textarea
                    value={promptDetail.prompt}
                    onChange={(e) => handlePromptChange(key, e.target.value)}
                    rows={15}
                    className="w-full p-3 border-input bg-background/70 focus:border-primary transition-colors duration-300 shadow-inner rounded-md text-sm font-mono"
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
