import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-problem-solving.ts';
import '@/ai/flows/extract-skills-from-job-description.ts';
import '@/ai/flows/create-test-from-skills.ts';
import '@/ai/flows/analyze-code-quality.ts'; // Added import for new flow
