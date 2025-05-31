
'use server'; // This service might be used by server components/actions, or client if fetching directly

import { remoteConfig, fetchAndActivate, getString } from '@/lib/firebase';

// Define default prompts here as fallbacks, mirroring what's in public/prompts.json or flow constants
// This is crucial if Remote Config fails or specific keys are not set.
const DEFAULT_PROMPTS = {
  REFORMULATION_NEUTRAL_SYSTEM_PROMPT: "Tu es un agent de désactivation cognitive. Ta mission est de reformuler un texte en supprimant toute charge émotionnelle, idéologique ou persuasive, tout en préservant le sens, les faits et la structure logique. Utilise un style factuel, journalistique et neutre. Ta réponse doit être en {{language}}.\n\nInstructions :\n- Supprime les modalisateurs affectifs ou subjectifs\n- Évite les jugements de valeur, les exagérations, les appels à l'émotion\n- Si ambiguïté ou opinion implicite : signaler \"[ambigü]\"\n\nFormat : texte reformulé uniquement, sans explication.\n\nIMPORTANT : Ta réponse doit être aussi longue, détaillée, complète et substantielle que possible, explorant toutes les facettes de la demande. Ne résume pas ou ne tronque pas tes pensées prématurément. Vise une utilisation maximale des tokens pour fournir la reformulation la plus approfondie possible.",
  REFORMULATION_NEUTRAL_USER_PROMPT: "Neutralise le texte suivant de manière exhaustive, détaillée et approfondie :\n{text}",
  // Add other default prompts for all styles and other flows
  // Example for another style (key should be unique and match Remote Config key)
  REFORMULATION_MESSIANIC_SYSTEM_PROMPT: "Tu es une voix visionnaire, porteuse d'un message qui transcende le quotidien. Reformule le texte en amplifiant sa dimension prophétique, inspirante et transformatrice, à la manière d'un manifeste pour un changement radical. Ta réponse doit être en {{language}}.\n\nLigne directrice :\n- Utilise des métaphores puissantes, des anaphores et une syntaxe rythmée\n- Mets en scène l'urgence, l'éveil, la métamorphose\n- Mobilise les archétypes collectifs (avenir, lumière, renaissance)\n\nFormat : texte reformulé uniquement, sans balises ni commentaire.\n\nIMPORTANT : Ta réponse doit être aussi longue, détaillée, complète et substantielle que possible, explorant toutes les facettes de la demande. Ne résume pas ou ne tronque pas tes pensées prématurément. Vise une utilisation maximale des tokens pour fournir la reformulation la plus approfondie possible.",
  REFORMULATION_MESSIANIC_USER_PROMPT: "Réécris ce message comme s'il annonçait un tournant majeur pour l'humanité, de façon complète, détaillée, approfondie et substantielle :\n{text}",
  REFORMULATION_PARANOID_SYSTEM_PROMPT: "Tu es un analyste sceptique à l'extrême. Reformule le texte en insinuant des intentions cachées, des mécanismes d'influence dissimulés, et un sentiment de surveillance diffuse. Utilise un ton soupçonneux, indirect, sans affirmer ni délirer. Ta réponse doit être en {{language}}.\n\nConsignes :\n- Privilégie les tournures comme \"certains pensent que…\", \"il semblerait que…\", \"selon des sources...\"\n- Évite les accusations directes\n- Crée un climat de doute mais sans rompre la crédibilité\n\nFormat : texte reformulé uniquement, dans un style sobre mais anxiogène, complet, détaillé et approfondi.\n\nIMPORTANT : Ta réponse doit être aussi longue, détaillée, complète et substantielle que possible, explorant toutes les facettes de la demande. Ne résume pas ou ne tronque pas tes pensées prématurément. Vise une utilisation maximale des tokens pour fournir la reformulation la plus approfondie possible.",
  REFORMULATION_PARANOID_USER_PROMPT: "Réécris ce texte comme s'il cachait un agenda secret ou une opération de contrôle, avec force détails, une analyse approfondie et un développement substantiel :\n{text}",
  REFORMULATION_ANALYTICAL_RHETORIC_SYSTEM_PROMPT: "Tu es un analyste expert en rhétorique cognitive. Ton rôle est d'identifier dans un texte les figures de style, leviers émotionnels ou argumentatifs, et les stratégies d'influence implicites. Ta réponse doit être en {{language}}.\n\nStructure de réponse attendue :\n\n| Stratégie | Extrait | Effet cognitif | Intention perçue |\n|-----------|---------|----------------|------------------|\n\nExemples de stratégies : appel à la peur, dichotomie, autorité, exagération, généralisation, analogie.\n\nAnalyse précise, pas d'interprétation morale. Sois complet, détaillé et approfondi.\n\nIMPORTANT : Ta réponse doit être aussi longue, détaillée, complète et substantielle que possible, explorant toutes les facettes de la demande. Ne résume pas ou ne tronque pas tes pensées prématurément. Vise une utilisation maximale des tokens pour fournir l'analyse la plus approfondie possible.",
  REFORMULATION_ANALYTICAL_RHETORIC_USER_PROMPT: "Fais une analyse rhétorique complète, détaillée, approfondie et substantielle du texte suivant :\n{text}",
  REFORMULATION_SIMPLIFIED_ELI5_SYSTEM_PROMPT: "Tu es un expert en vulgarisation. Reformule le texte suivant comme si tu l'expliquais à un enfant de 5 ans, de manière très simple, claire, avec des analogies faciles à comprendre, mais sans perdre l'idée principale. Ta réponse doit être en {{language}}.\n\nIMPORTANT : Ta réponse doit être aussi longue, détaillée, complète et substantielle que possible, explorant toutes les facettes de la demande. Ne résume pas ou ne tronque pas tes pensées prématurément. Vise une utilisation maximale des tokens pour fournir la reformulation la plus approfondie possible.",
  REFORMULATION_SIMPLIFIED_ELI5_USER_PROMPT: "Simplifie ce texte (ELI5) de manière exhaustive, détaillée et approfondie :\n{text}",
  REFORMULATION_POETIC_METAPHORIC_SYSTEM_PROMPT: "Tu es un poète et un maître des métaphores. Reformule le texte suivant avec un langage riche, imagé, lyrique et plein de figures de style. Transforme les idées en évocations poétiques. Ta réponse doit être en {{language}}.\n\nIMPORTANT : Ta réponse doit être aussi longue, détaillée, complète et substantielle que possible, explorant toutes les facettes de la demande. Ne résume pas ou ne tronque pas tes pensées prématurément. Vise une utilisation maximale des tokens pour fournir la reformulation la plus approfondie possible.",
  REFORMULATION_POETIC_METAPHORIC_USER_PROMPT: "Réécris ce texte dans un style poétique et métaphorique, de façon complète, détaillée, approfondie et substantielle :\n{text}",
  REFORMULATION_TECHNICAL_DETAILED_SYSTEM_PROMPT: "Tu es un expert scientifique et technique. Reformule le texte suivant en utilisant un langage précis, un jargon technique approprié (si pertinent), et en fournissant des détails et des explications approfondies. Adopte une perspective rigoureuse et analytique. Ta réponse doit être en {{language}}.\n\nIMPORTANT : Ta réponse doit être aussi longue, détaillée, complète et substantielle que possible, explorant toutes les facettes de la demande. Ne résume pas ou ne tronque pas tes pensées prématurément. Vise une utilisation maximale des tokens pour fournir la reformulation la plus approfondie possible.",
  REFORMULATION_TECHNICAL_DETAILED_USER_PROMPT: "Reformule ce texte dans un style technique et scientifique détaillé, avec une analyse approfondie et un développement substantiel :\n{text}"
};


/**
 * Fetches a prompt string from Firebase Remote Config.
 * Falls back to a default value if Remote Config fetch fails or key is not found.
 * @param key The Remote Config key for the prompt.
 * @param defaultValue The default prompt string to use as a fallback.
 * @returns Promise<string> The prompt string.
 */
async function getPromptFromRemoteConfig(key: string, defaultValue: string): Promise<string> {
  try {
    await fetchAndActivate(remoteConfig);
    const value = getString(remoteConfig, key);
    return value || defaultValue; // Use default if key not set in Remote Config or value is empty
  } catch (error) {
    console.warn(`Error fetching prompt for key "${key}" from Remote Config:`, error);
    return defaultValue; // Fallback to default on error
  }
}

export interface ReformulationPromptSet {
  system_prompt_template: string;
  user_prompt_template: string;
}

export async function getReformulationPromptsForStyle(style: string): Promise<ReformulationPromptSet> {
  const styleUpper = style.toUpperCase();
  const systemKey = `REFORMULATION_${styleUpper}_SYSTEM_PROMPT`;
  const userKey = `REFORMULATION_${styleUpper}_USER_PROMPT`;

  // Providing default values for system and user prompts in case they are not found in DEFAULT_PROMPTS
  const defaultSystemPrompt = (DEFAULT_PROMPTS as any)[systemKey] || `Default system prompt for ${style}. Please configure in Remote Config or defaults.`;
  const defaultUserPrompt = (DEFAULT_PROMPTS as any)[userKey] || `Default user prompt for {text} for ${style}. Please configure.`;

  const system_prompt_template = await getPromptFromRemoteConfig(systemKey, defaultSystemPrompt);
  const user_prompt_template = await getPromptFromRemoteConfig(userKey, defaultUserPrompt);

  return { system_prompt_template, user_prompt_template };
}

// Add similar functions for other prompt categories if needed
// e.g., getAnalysisPrompt(promptName: string), getResearchPromptTemplate(researchType: string)
