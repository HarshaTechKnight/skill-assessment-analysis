// src/ai/flows/analyze-code-quality.ts
'use server';
/**
 * @fileOverview Analyzes code quality for technical assessments.
 *
 * - analyzeCodeQuality - Evaluates provided code snippet against best practices and requirements.
 * - AnalyzeCodeQualityInput - Input includes the code, language, and job context.
 * - AnalyzeCodeQualityOutput - Output includes metrics on quality, efficiency, security, etc.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCodeQualityInputSchema = z.object({
  codeSnippet: z.string().min(20).describe('The code submitted by the candidate.'),
  language: z.string().describe('The programming language of the snippet (e.g., javascript, python, java).'),
  jobRequirements: z.string().optional().describe('Relevant job requirements or coding standards for context.'),
  problemDescription: z.string().optional().describe('The description of the problem the code is supposed to solve.'),
});
export type AnalyzeCodeQualityInput = z.infer<typeof AnalyzeCodeQualityInputSchema>;

const AnalyzeCodeQualityOutputSchema = z.object({
  functionalityAssessment: z.string().describe('Assessment of whether the code likely solves the intended problem (based on description, if provided). Does it appear functionally correct?'),
  readabilityScore: z.number().min(0).max(10).describe('Score from 0-10 for code readability and clarity.'),
  maintainabilityScore: z.number().min(0).max(10).describe('Score from 0-10 for code maintainability.'),
  efficiencyAssessment: z.string().describe('Qualitative assessment of potential algorithmic efficiency (e.g., time/space complexity concerns).'),
  bestPracticesAdherence: z.string().describe('Analysis of adherence to common best practices for the language.'),
  securityVulnerabilities: z.array(z.string()).describe('List of potential security vulnerabilities identified (if any).'),
  suggestionsForImprovement: z.array(z.string()).describe('Specific suggestions for improving the code.'),
  overallQualitySummary: z.string().describe('A brief overall summary of the code quality.'),
});
export type AnalyzeCodeQualityOutput = z.infer<typeof AnalyzeCodeQualityOutputSchema>;

export async function analyzeCodeQuality(input: AnalyzeCodeQualityInput): Promise<AnalyzeCodeQualityOutput> {
  return analyzeCodeQualityFlow(input);
}

const analyzeCodePrompt = ai.definePrompt({
  name: 'analyzeCodeQualityPrompt',
  input: {schema: AnalyzeCodeQualityInputSchema},
  output: {schema: AnalyzeCodeQualityOutputSchema},
  prompt: `You are an expert code reviewer and senior software engineer. Analyze the following code snippet written in {{{language}}}.

{{#if problemDescription}}
Problem Description:
{{{problemDescription}}}
{{/if}}

{{#if jobRequirements}}
Relevant Job Requirements/Standards:
{{{jobRequirements}}}
{{/if}}

Code Snippet:
\`\`\`{{{language}}}
{{{codeSnippet}}}
\`\`\`

Instructions:
Evaluate the code based on the following criteria:
1.  **Functionality:** Based on the problem description (if available), does the code appear to logically solve the problem? Comment on its likely correctness.
2.  **Readability & Clarity:** Assess naming conventions, comments, formatting, and overall ease of understanding. Provide a score from 0 (unreadable) to 10 (excellent).
3.  **Maintainability:** Evaluate modularity, complexity, and how easy it would be to modify or debug. Provide a score from 0 (unmaintainable) to 10 (excellent).
4.  **Efficiency:** Analyze potential performance issues. Comment on time and space complexity if obvious issues exist (e.g., nested loops on large datasets, unnecessary memory usage). Don't perform exact Big O analysis unless trivial.
5.  **Best Practices:** Check for adherence to common language-specific conventions and best practices (e.g., error handling, proper use of language features).
6.  **Security:** Identify any obvious potential security vulnerabilities (e.g., injection risks, hardcoded secrets, improper input validation).
7.  **Suggestions:** Provide specific, actionable suggestions for improvement.
8.  **Summary:** Give a concise overall summary of the code's quality.

Format your response according to the output schema. Be objective and constructive.
`,
});

const analyzeCodeQualityFlow = ai.defineFlow(
  {
    name: 'analyzeCodeQualityFlow',
    inputSchema: AnalyzeCodeQualityInputSchema,
    outputSchema: AnalyzeCodeQualityOutputSchema,
  },
  async (input) => {
    // Basic validation
    if (!input.codeSnippet || input.codeSnippet.trim().length < 20) {
        throw new Error("Code snippet is too short for meaningful analysis.");
    }
    if (!input.language) {
        throw new Error("Programming language must be specified.");
    }

    const {output} = await analyzeCodePrompt(input);
    // Post-processing or refinement could happen here if needed
    return output!;
  }
);
