
"use client";

import { useState, type Dispatch, type SetStateAction } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserPlus, Brain, Download, Copy } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import type { GeneratePersonaProfileOutput } from '@/ai/flows/generate-persona-profile-flow';
import { useToast } from '@/hooks/use-toast';
import { downloadJson } from '@/lib/utils';

interface PersonaGeneratorPanelProps {
  personaNameInput: string;
  setPersonaNameInput: Dispatch<SetStateAction<string>>;
  personaDescriptionInput: string;
  setPersonaDescriptionInput: Dispatch<SetStateAction<string>>;
  generatedPersonaProfile: GeneratePersonaProfileOutput | null;
  handleGeneratePersonaProfile: () => Promise<void>;
  isGeneratingPersona: boolean;
  currentLanguage: string;
  labels: { // Assuming labels are passed from a central uiContent object
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
  };
  onPersonaGenerated: (profile: GeneratePersonaProfileOutput) => void;
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
  onPersonaGenerated,
}: PersonaGeneratorPanelProps) {
  const { toast } = useToast();

  const handleInternalGenerate = async () => {
    await handleGeneratePersonaProfile();
    // The parent component (CognitiveMapperClient) will update generatedPersonaProfile
    // and then call onPersonaGenerated if successful.
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
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2 text-primary">
          <UserPlus className="h-5 w-5" />
          {labels.personaLabGeneratorTitle}
        </CardTitle>
        <CardDescription>{labels.personaLabGeneratorDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
            rows={6}
            disabled={isGeneratingPersona}
          />
        </div>
        <Button onClick={handleInternalGenerate} disabled={isGeneratingPersona || !personaNameInput.trim() || !personaDescriptionInput.trim()} className="w-full">
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

        {generatedPersonaProfile && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-accent">{labels.generatedProfileTitle}: {generatedPersonaProfile.personaProfile.name}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyProfile}>
                  <Copy className="mr-2 h-4 w-4" />
                  {labels.copyProfileButton}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadProfile}>
                  <Download className="mr-2 h-4 w-4" />
                  {labels.downloadProfileButton}
                </Button>
              </div>
            </div>
            <Textarea
              readOnly
              value={JSON.stringify(generatedPersonaProfile, null, 2)}
              rows={15}
              className="font-mono text-xs bg-muted/50"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
