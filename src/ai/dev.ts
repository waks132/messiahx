import { config } from 'dotenv';
config();

import '@/ai/flows/generate-critical-summary.ts';
import '@/ai/flows/detect-hidden-narratives.ts';
import '@/ai/flows/analyze-text-for-manipulation.ts';