// src/ai/flows/analyze-problem-solving.ts
'use server';
/**
 * @fileOverview Analyzes a candidate's free-form answers to assess their problem-solving approach and efficiency.
 *
 * - analyzeProblemSolving - A function that handles the problem-solving analysis process.
 * - AnalyzeProblemSolvingInput - The input type for the analyzeProblemSolving function.
 * - AnalyzeProblemSolvingOutput - The return type for the analyzeProblemSolving function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeProblemSolvingInputSchema = z.object({
  answer: z.string().describe('The candidate\'s free-form answer to a technical question.'),
  jobRequirements: z.string().describe('The requirements for the job role.'),
});
export type AnalyzeProblemSolvingInput = z.infer<typeof AnalyzeProblemSolvingInputSchema>;

const AnalyzeProblemSolvingOutputSchema = z.object({
  problemSolvingApproach: z.string().describe('An analysis of the candidate\'s problem-solving approach.'),
  efficiencyAssessment: z.string().describe('An assessment of the candidate\'s efficiency in solving the problem.'),
  areasForImprovement: z.string().describe('Suggested areas for improvement in the candidate\'s problem-solving skills.'),
});
export type AnalyzeProblemSolvingOutput = z.infer<typeof AnalyzeProblemSolvingOutputSchema>;

export async function analyzeProblemSolving(input: AnalyzeProblemSolvingInput): Promise<AnalyzeProblemSolvingOutput> {
  return analyzeProblemSolvingFlow(input);
}

const analyzeProblemSolvingPrompt = ai.definePrompt({
  name: 'analyzeProblemSolvingPrompt',
  input: {schema: AnalyzeProblemSolvingInputSchema},
  output: {schema: AnalyzeProblemSolvingOutputSchema},
  prompt: `You are an expert technical recruiter analyzing a candidate's answer to assess their problem-solving skills.

  Job Requirements: {{{jobRequirements}}}

  Analyze the following answer, providing insights into their problem-solving approach, efficiency, and areas for improvement.

  Answer: {{{answer}}}

  Format your response as follows:

  Problem-Solving Approach: [Detailed analysis of the candidate's approach]
  Efficiency Assessment: [Assessment of the candidate's efficiency]
  Areas for Improvement: [Suggestions for improvement]
  `,
});

const analyzeProblemSolvingFlow = ai.defineFlow(
  {
    name: 'analyzeProblemSolvingFlow',
    inputSchema: AnalyzeProblemSolvingInputSchema,
    outputSchema: AnalyzeProblemSolvingOutputSchema,
  },
  async input => {
    const {output} = await analyzeProblemSolvingPrompt(input);
    return output!;
  }
);
