
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-critical-summary.ts';
import '@/ai/flows/detect-hidden-narratives.ts';
import '@/ai/flows/analyze-text-for-manipulation.ts';
import '@/ai/flows/classify-cognitive-categories.ts';
import '@/ai/flows/reformulate-text.ts';
import '@/ai/flows/research-contextual-flow.ts';
import '@/ai/flows/research-manipulation-flow.ts';
import '@/ai/tools/web-search-tool.ts'; // Import the tool so Genkit recognizes it
    
