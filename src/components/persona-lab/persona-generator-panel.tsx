
"use client";

import { type Dispatch, type SetStateAction } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { UserPlus, Brain, Download, Copy, Trash2, CheckCircle, PlusCircle, List } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import type { GeneratePersonaProfileOutput } from '@/ai/flows/generate-persona-profile-flow';
import { useToast } from '@/hooks/use-toast';
import { downloadJson } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PersonaGeneratorPanelProps {
  personaNameInput: string;
  setPersonaNameInput: Dispatch<SetStateAction<string>>;
  personaDescriptionInput: string;
  setPersonaDescriptionInput: Dispatch<SetStateAction<string>>;
  generatedPersonaProfile: GeneratePersonaProfileOutput | null;
  handleGeneratePersonaProfile: () => Promise<void>;
  isGeneratingPersona: boolean;
  currentLanguage: string;
  labels: { 
    personaLabGeneratorTitle: string;
    personaLabGeneratorDescription: string;
    personaNameLabel: string;
    personaNamePlaceholder: string;
    personaDescriptionLabel: string;
    personaDescriptionPlaceholder: string;
    generatePersonaButton: string;
    generatingPersonaButton: string;
    generatedProfileTitle: string;
    downloadProfileButton: string;
    copyProfileButton: string;
    noProfileGenerated: string;
    profileGeneratedSuccess: string;
    profileGenerationError: string;
    copiedToClipboard: string;
    failedToCopy: string;
    savedPersonasTitle: string;
    noSavedPersonas: string;
    selectPersonaButton: string;
    deletePersonaButton: string;
    newPersonaButton: string;
  };
  savedPersonas: GeneratePersonaProfileOutput[];
  onSelectPersona: (persona: GeneratePersonaProfileOutput) => void;
  onDeletePersona: (personaName: string) => void;
  onNewPersona: () => void;
}

export function PersonaGeneratorPanel({
  personaNameInput,
  setPersonaNameInput,
  personaDescriptionInput,
  setPersonaDescriptionInput,
  generatedPersonaProfile,
  handleGeneratePersonaProfile,
  isGeneratingPersona,
  currentLanguage,
  labels,
  savedPersonas,
  onSelectPersona,
  onDeletePersona,
  onNewPersona,
}: PersonaGeneratorPanelProps) {
  const { toast } = useToast();

  const handleInternalGenerate = async () => {
    await handleGeneratePersonaProfile();
  };

  const handleDownloadProfile = () => {
    if (generatedPersonaProfile) {
      downloadJson(generatedPersonaProfile, `${generatedPersonaProfile.personaProfile.name || 'persona_profile'}.json`);
    }
  };

  const handleCopyProfile = async () => {
    if (generatedPersonaProfile) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(generatedPersonaProfile, null, 2));
        toast({ title: labels.copiedToClipboard });
      } catch (err) {
        toast({ title: labels.failedToCopy, variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2 text-primary">
            <UserPlus className="h-5 w-5" />
            {labels.personaLabGeneratorTitle}
          </CardTitle>
          <CardDescription>{labels.personaLabGeneratorDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="persona-name">{labels.personaNameLabel}</Label>
            <Input
              id="persona-name"
              value={personaNameInput}
              onChange={(e) => setPersonaNameInput(e.target.value)}
              placeholder={labels.personaNamePlaceholder}
              disabled={isGeneratingPersona}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="persona-description">{labels.personaDescriptionLabel}</Label>
            <Textarea
              id="persona-description"
              value={personaDescriptionInput}
              onChange={(e) => setPersonaDescriptionInput(e.target.value)}
              placeholder={labels.personaDescriptionPlaceholder}
              rows={5}
              disabled={isGeneratingPersona}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleInternalGenerate} disabled={isGeneratingPersona || !personaNameInput.trim() || !personaDescriptionInput.trim()} className="flex-grow">
              {isGeneratingPersona ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">{labels.generatingPersonaButton}</span>
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  {labels.generatePersonaButton}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onNewPersona} title={labels.newPersonaButton}>
                <PlusCircle className="h-4 w-4" />
            </Button>
          </div>

          {generatedPersonaProfile && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-accent">{labels.generatedProfileTitle}: {generatedPersonaProfile.personaProfile.name}</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyProfile} title={labels.copyProfileButton}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadProfile} title={labels.downloadProfileButton}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                readOnly
                value={JSON.stringify(generatedPersonaProfile, null, 2)}
                rows={10}
                className="font-mono text-xs bg-muted/50 h-60"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2 text-primary">
            <List className="h-5 w-5" />
            {labels.savedPersonasTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {savedPersonas.length > 0 ? (
            <ScrollArea className="h-60">
              <ul className="space-y-2">
                {savedPersonas.map((persona) => (
                  <li key={persona.personaProfile.name} className="flex items-center justify-between p-2 border rounded-md bg-background hover:bg-muted/50">
                    <span className="font-medium truncate" title={persona.personaProfile.name}>{persona.personaProfile.name}</span>
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => onSelectPersona(persona)} title={labels.selectPersonaButton}>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDeletePersona(persona.personaProfile.name)} title={labels.deletePersonaButton}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-4">{labels.noSavedPersonas}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    