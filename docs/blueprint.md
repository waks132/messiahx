# **App Name**: MeSSiahX – CognitiveMapper

## Core Features:

- Texte Utilisateur: Text field in the UI for user input, allowing text entry, file uploads (.txt), or loading from sources like RSS feeds or OCR.
- Analyse Perplexity (inférence primaire): API call to Perplexity configured to detect discursive manipulations, emotions, cognitive biases, and unverifiable facts, outputting a summary and structured list.
- Classification Cognitive Locale (Sonar / LLaMA): Local or API-based LLaMA 3 or SonarAI model classifying elements detected by Perplexity into cognitive categories (e.g., authority fallacy, appeal to fear), outputting a JSON with classes and intensity.
- Visualisation – Carte Cognitive Interactive: Interactive cognitive map using Chart.js to represent cognitive triggers, their intensity, and correlations in a reactive, dynamic, and animated format.
- Résumé Critique (Expert Commentary): Uses Perplexity or a secondary LLM to generate a critical summary, such as 'Presence of authority fallacy, negativity bias, implicit appeal to fear,' with a configurable style (academic, journalistic, sarcastic).
- Lecture Paranoïaque – IA Gemini: Secondary level using Gemini/Genkit for deep inference; replaying a paranoid/messianic/counter-manipulation reading of the Perplexity summary or raw text to detect implicit intentions and hidden narratives.
- Éditeur de Prompts (UI intégrée): UI zone or tab for modifying the main prompt, defining secondary prompts, and choosing an analysis style, supporting prompt.json or a React editor via a dynamic form.
- Comparaison de Textes: Future feature to load two texts, compare their cognitive profiles, manipulation scores, and dominant bias types.

## Style Guidelines:

- Saturated purple #A050A0
- Light grey #F0F0F3 (with a touch of purple)
- Desaturated pink #E090E0
- PT Sans (text), Playfair (titles)
- Simple, with tooltips (trigger type)
- CSS Grid responsive
- Subtle (on trigger/card updates)