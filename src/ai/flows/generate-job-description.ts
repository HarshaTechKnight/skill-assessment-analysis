// src/ai/flows/generate-job-description.ts
'use server';
/**
 * @fileOverview Generates a sample job description based on a job title and seniority level.
 *
 * - generateJobDescription - Generates a sample job description.
 * - GenerateJobDescriptionInput - Input includes job title and optional seniority.
 * - GenerateJobDescriptionOutput - Output is the generated job description text.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJobDescriptionInputSchema = z.object({
  jobTitle: z.string().min(3).describe('The title of the job role (e.g., Software Engineer, Product Manager).'),
  seniority: z.enum(['junior', 'mid-level', 'senior', 'lead', 'staff', 'principal']).optional().describe('Optional seniority level to tailor the description.'),
});
export type GenerateJobDescriptionInput = z.infer<typeof GenerateJobDescriptionInputSchema>;

const GenerateJobDescriptionOutputSchema = z.object({
  jobDescription: z.string().min(100).describe('The generated job description text, including responsibilities, qualifications, and preferred skills.'),
});
export type GenerateJobDescriptionOutput = z.infer<typeof GenerateJobDescriptionOutputSchema>;

export async function generateJobDescription(input: GenerateJobDescriptionInput): Promise<GenerateJobDescriptionOutput> {
  return generateJobDescriptionFlow(input);
}

const generateJobDescriptionPrompt = ai.definePrompt({
  name: 'generateJobDescriptionPrompt',
  input: {schema: GenerateJobDescriptionInputSchema},
  output: {schema: GenerateJobDescriptionOutputSchema},
  prompt: `You are an expert HR specialist crafting compelling job descriptions.

Generate a detailed and realistic job description for the following role:

Job Title: {{{jobTitle}}}
{{#if seniority}}
Seniority Level: {{{seniority}}}
{{/if}}

Instructions:
1.  Create a comprehensive job description suitable for posting on a job board.
2.  Include sections for:
    *   Company Overview (brief, generic placeholder like "[Company Name] is a leading innovator...")
    *   Role Summary
    *   Key Responsibilities (use bullet points)
    *   Required Qualifications (use bullet points, including relevant education/experience)
    *   Preferred Qualifications/Skills (use bullet points)
    *   What We Offer (placeholder benefits like "Competitive salary, health benefits...")
3.  Tailor the responsibilities and qualifications based on the job title and seniority level (if provided). For example, a senior role should emphasize leadership, strategy, and complex problem-solving, while a junior role focuses on learning, execution, and collaboration.
4.  Ensure the description is at least 100 words long and professionally written.
5.  Output only the generated job description text within the specified schema. Do not include conversational text or apologies.
`,
});

const generateJobDescriptionFlow = ai.defineFlow(
  {
    name: 'generateJobDescriptionFlow',
    inputSchema: GenerateJobDescriptionInputSchema,
    outputSchema: GenerateJobDescriptionOutputSchema,
  },
  async (input) => {
    // Basic validation
    if (!input.jobTitle) {
        throw new Error("Job title must be specified.");
    }

    const {output} = await generateJobDescriptionPrompt(input);
    return output!;
  }
);
