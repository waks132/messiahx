
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Save, RotateCcw, Info, AlertTriangle, MessageSquareQuote, SearchCode, PencilRuler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/loading-spinner';

interface PromptDetail {
  name: string;
  description: string;
  prompt?: string; // For analysis prompts
  system_prompt_template?: string; // For reformulation prompts
  user_prompt_template?: string; // For reformulation prompts
  prompt_template?: string; // For research prompts
}

interface PromptCategory {
  [key: string]: PromptDetail;
}

interface PromptsData {
  analysisPrompts?: PromptCategory;
  reformulationPrompts?: PromptCategory;
  researchPrompts?: PromptCategory;
}

const PromptTextArea = ({ value, onChange, rows = 10 }: { value?: string; onChange: (val: string) => void, rows?: number }) => (
  <Textarea
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    rows={rows}
    className="w-full p-3 border-input bg-background/70 focus:border-primary transition-colors duration-300 shadow-inner rounded-md text-sm font-mono"
  />
);

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
    const storedPrompts = localStorage.getItem('user_prompts');
    if (storedPrompts) {
      try {
        setPrompts(JSON.parse(storedPrompts));
        setIsLoading(false);
      } catch (e) {
        console.error("Error parsing stored prompts:", e);
        localStorage.removeItem('user_prompts'); // Clear invalid data
        fetchPrompts(defaultPromptsPath);
      }
    } else {
      fetchPrompts(defaultPromptsPath);
    }
  }, []); // defaultPromptsPath is constant, removed from deps

  const handlePromptChange = (categoryKey: keyof PromptsData, promptKey: string, field: keyof PromptDetail, value: string) => {
    setPrompts(prevPrompts => {
      if (!prevPrompts || !prevPrompts[categoryKey]) return prevPrompts;
      const updatedCategory = { ...prevPrompts[categoryKey]! };
      if (!updatedCategory[promptKey]) return prevPrompts;
      
      updatedCategory[promptKey] = {
        ...updatedCategory[promptKey],
        [field]: value,
      };
      
      return {
        ...prevPrompts,
        [categoryKey]: updatedCategory,
      };
    });
  };

  const handleSavePrompts = () => {
    if (prompts) {
      setIsSaving(true);
      localStorage.setItem('user_prompts', JSON.stringify(prompts));
      setTimeout(() => {
        setIsSaving(false);
        toast({
          title: "Prompts sauvegardés !",
          description: "Vos modifications ont été sauvegardées localement dans votre navigateur.",
        });
      }, 500);
    }
  };

  const handleResetPrompts = () => {
    localStorage.removeItem('user_prompts');
    fetchPrompts(defaultPromptsPath);
    toast({
      title: "Prompts réinitialisés",
      description: "Les prompts ont été réinitialisés à leurs valeurs par défaut.",
    });
  };
  
  const renderPromptFields = (categoryKey: keyof PromptsData, promptKey: string, promptDetail: PromptDetail) => {
    if (categoryKey === "analysisPrompts") {
      return (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Prompt Principal :</label>
            <PromptTextArea value={promptDetail.prompt} onChange={(val) => handlePromptChange(categoryKey, promptKey, 'prompt', val)} rows={15} />
          </div>
        </>
      );
    } else if (categoryKey === "reformulationPrompts") {
      return (
        <>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Template de Prompt Système :</label>
              <PromptTextArea value={promptDetail.system_prompt_template} onChange={(val) => handlePromptChange(categoryKey, promptKey, 'system_prompt_template', val)} rows={8}/>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Template de Prompt Utilisateur (variables comme '{"{{text}}"}'}) :</label>
              <PromptTextArea value={promptDetail.user_prompt_template} onChange={(val) => handlePromptChange(categoryKey, promptKey, 'user_prompt_template', val)} rows={4}/>
            </div>
          </div>
        </>
      );
    } else if (categoryKey === "researchPrompts") {
       return (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Template de Prompt de Recherche (variables comme '{"{{text}}"}' ou '{"{{query}}"}'}) :</label>
            <PromptTextArea value={promptDetail.prompt_template} onChange={(val) => handlePromptChange(categoryKey, promptKey, 'prompt_template', val)} rows={10} />
          </div>
        </>
      );
    }
    return <p className="text-destructive">Type de prompt non reconnu pour l'édition.</p>;
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><LoadingSpinner size="lg" /></div>;
  }

  if (error && !prompts) {
    return (
      <Card className="max-w-3xl mx-auto mt-8 bg-destructive/10 border-destructive">
        <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle /> Erreur Critique</CardTitle></CardHeader>
        <CardContent><p>Impossible de charger la configuration des prompts : {error}</p><p>Veuillez vérifier que le fichier <code>public/prompts.json</code> existe et est accessible.</p></CardContent>
      </Card>
    );
  }
  
  if (!prompts) {
     return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><p>Aucun prompt à afficher. Problème de chargement.</p></div>;
  }

  const promptCategoriesMap: { key: keyof PromptsData; title: string; icon: React.ElementType }[] = [
    { key: 'analysisPrompts', title: 'Prompts d\'Analyse Cognitive', icon: SearchCode },
    { key: 'reformulationPrompts', title: 'Prompts de Reformulation de Texte', icon: PencilRuler },
    { key: 'researchPrompts', title: 'Prompts de Recherche Contextuelle', icon: MessageSquareQuote },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <Card className="shadow-xl bg-card/90 backdrop-blur-sm border-primary/30">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Gestionnaire de Configuration des Prompts</CardTitle>
          <CardDescription>
            Visualisez et modifiez les prompts utilisés par les différents modules d'IA.
            <br />
            <span className="text-xs text-muted-foreground bg-muted/30 p-1 rounded inline-flex items-center gap-1 mt-2">
              <Info size={14}/> Actuellement, les modifications sont sauvegardées <strong className="font-semibold">localement dans votre navigateur</strong>.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={handleSavePrompts} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Sauvegarde..." : "Sauvegarder les Modifications"}
            </Button>
            <Button variant="outline" onClick={handleResetPrompts}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Réinitialiser aux Défauts
            </Button>
          </div>

          {promptCategoriesMap.map(({ key, title, icon: Icon }) => (
            prompts[key] && Object.keys(prompts[key]!).length > 0 && (
              <div key={key} className="mb-8">
                <h2 className="text-xl font-headline text-accent mb-4 flex items-center gap-2 border-b border-border pb-2">
                  <Icon className="h-6 w-6" />
                  {title}
                </h2>
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {Object.entries(prompts[key]!).map(([promptKey, promptDetail]) => (
                    <AccordionItem value={`${key}-${promptKey}`} key={`${key}-${promptKey}`} className="bg-background/70 border border-border/60 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      <AccordionTrigger className="hover:bg-muted/30 px-4 py-3 text-left text-lg font-semibold text-primary/90 hover:text-primary hover:no-underline focus:ring-1 focus:ring-ring/70 rounded-t-md">
                        {promptDetail.name || promptKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-2 space-y-3">
                        {promptDetail.description && (
                          <p className="text-sm text-muted-foreground italic border-l-2 border-accent pl-2">{promptDetail.description}</p>
                        )}
                        {renderPromptFields(key, promptKey, promptDetail)}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
