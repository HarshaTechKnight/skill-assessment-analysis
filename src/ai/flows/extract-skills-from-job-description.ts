// src/ai/flows/extract-skills-from-job-description.ts
'use server';
/**
 * @fileOverview Extracts key skills from a job description using AI.
 *
 * - extractSkillsFromJobDescription - Analyzes job description text and identifies required skills.
 * - ExtractSkillsInput - The input type (job description text).
 * - ExtractSkillsOutput - The output type (structured list of skills).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SkillSchema = z.object({
  name: z.string().describe('The name of the skill.'),
  category: z.enum(['technical', 'soft', 'domain-specific', 'tooling', 'other']).describe('The category of the skill.'),
  importance: z.enum(['critical', 'important', 'nice-to-have']).describe('The perceived importance of the skill based on the description.'),
  context: z.string().optional().describe('Brief context or example from the job description related to the skill.'),
});

export const ExtractSkillsInputSchema = z.object({
  jobDescription: z.string().min(50).describe('The full text of the job description.'),
});
export type ExtractSkillsInput = z.infer<typeof ExtractSkillsInputSchema>;

export const ExtractSkillsOutputSchema = z.object({
  extractedSkills: z.array(SkillSchema).describe('A list of skills extracted from the job description, categorized and rated by importance.'),
});
export type ExtractSkillsOutput = z.infer<typeof ExtractSkillsOutputSchema>;

export async function extractSkillsFromJobDescription(input: ExtractSkillsInput): Promise<ExtractSkillsOutput> {
  return extractSkillsFlow(input);
}

const extractSkillsPrompt = ai.definePrompt({
  name: 'extractSkillsPrompt',
  input: {schema: ExtractSkillsInputSchema},
  output: {schema: ExtractSkillsOutputSchema},
  prompt: `You are an expert recruitment consultant specializing in technical roles. Analyze the provided job description and extract the key skills, competencies, and knowledge areas required for the role.

Job Description:
{{{jobDescription}}}

Instructions:
1.  Identify both explicit and implicit skill requirements.
2.  Categorize each skill as 'technical', 'soft', 'domain-specific', 'tooling', or 'other'.
3.  Assess the importance of each skill as 'critical', 'important', or 'nice-to-have' based on the emphasis in the description.
4.  Provide a brief context or example for each skill if possible.
5.  Return the results as a structured list of skills. Focus on actionable skills relevant for assessment. Do not include generic requirements like "Bachelor's degree". Limit the list to the top 15-20 most relevant skills.
`,
});

const extractSkillsFlow = ai.defineFlow(
  {
    name: 'extractSkillsFlow',
    inputSchema: ExtractSkillsInputSchema,
    outputSchema: ExtractSkillsOutputSchema,
  },
  async (input) => {
    const {output} = await extractSkillsPrompt(input);
    return output!;
  }
);
