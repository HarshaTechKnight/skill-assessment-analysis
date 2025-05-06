// src/ai/flows/create-test-from-skills.ts
'use server';
/**
 * @fileOverview Generates a skill assessment test structure based on job requirements and extracted skills.
 *
 * - createTestFromSkills - Generates test questions tailored to the role.
 * - CreateTestInput - Input includes job details, skills, and test parameters.
 * - CreateTestOutput - Output is a structured test with questions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ExtractSkillsOutputSchema } from './extract-skills-from-job-description'; // Import skill schema

// Define question structures consistent with the existing test format
const QuestionOptionSchema = z.object({
  id: z.string().describe('Unique ID for the option (e.g., q1o1, q1o2).'),
  text: z.string().min(1).describe('The text content of the option.'),
  isCorrect: z.boolean().optional().describe('Indicates if this is the correct option. Only one option should be correct.'),
});

const QuestionSchema = z.object({
  id: z.string().describe('Unique ID for the question (e.g., q1, q2).'),
  type: z.enum(['multiple-choice', 'free-form']).describe('The type of question.'),
  text: z.string().min(10).describe('The text content of the question.'),
  options: z.array(QuestionOptionSchema).optional().describe('List of options for multiple-choice questions. Should contain 3-5 options.'),
  skillCategory: z.string().optional().describe('The primary skill category this question assesses (e.g., technical, problem-solving, soft).'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().describe('Estimated difficulty level.'),
}).refine(data => {
    // Ensure options exist for multiple-choice and don't for free-form
    if (data.type === 'multiple-choice') {
        return Array.isArray(data.options) && data.options.length >= 2;
    }
    return !data.options || data.options.length === 0;
}, { message: "Multiple choice questions must have options, free-form questions must not." })
.refine(data => {
    // Ensure exactly one correct answer for multiple-choice
    if (data.type === 'multiple-choice' && data.options) {
        const correctCount = data.options.filter(opt => opt.isCorrect).length;
        return correctCount === 1;
    }
    return true;
}, { message: "Multiple choice questions must have exactly one correct option." });


export const CreateTestInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job role.'),
  jobDescription: z.string().describe('The full job description text.'),
  extractedSkills: ExtractSkillsOutputSchema.shape.extractedSkills.describe('The list of skills extracted from the job description.'),
  seniority: z.enum(['junior', 'mid-level', 'senior', 'lead']).describe('The seniority level of the role.'),
  numberOfQuestions: z.number().int().min(3).max(20).default(5).describe('The desired number of questions in the test.'),
  assessmentFocus: z.array(z.enum(['technical', 'problem-solving', 'domain-knowledge', 'soft-skills'])).optional().describe('Optional focus areas for the assessment.'),
});
export type CreateTestInput = z.infer<typeof CreateTestInputSchema>;

export const CreateTestOutputSchema = z.object({
  testTitle: z.string().describe('A suitable title for the generated test.'),
  questions: z.array(QuestionSchema).describe('The list of generated assessment questions.'),
});
export type CreateTestOutput = z.infer<typeof CreateTestOutputSchema>;


export async function createTestFromSkills(input: CreateTestInput): Promise<CreateTestOutput> {
    // Basic validation before calling the flow
    if (!input.extractedSkills || input.extractedSkills.length === 0) {
        throw new Error("Cannot generate test without extracted skills.");
    }
    return createTestFlow(input);
}

const createTestPrompt = ai.definePrompt({
  name: 'createTestPrompt',
  input: {schema: CreateTestInputSchema},
  output: {schema: CreateTestOutputSchema},
  prompt: `You are an expert assessment creator for technical and professional roles. Based on the provided job details and extracted skills, generate a tailored skill assessment test.

Job Title: {{{jobTitle}}}
Seniority: {{{seniority}}}
Job Description:
{{{jobDescription}}}

Extracted Skills:
{{#each extractedSkills}}
- {{name}} ({{category}}, Importance: {{importance}}) {{#if context}}Context: {{context}}{{/if}}
{{/each}}

Assessment Parameters:
- Generate exactly {{{numberOfQuestions}}} questions.
{{#if assessmentFocus}}
- Prioritize questions focusing on: {{#each assessmentFocus}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/if}}
- Ensure a mix of question types (multiple-choice, free-form) relevant to the skills being assessed. Use free-form for problem-solving or conceptual understanding, MCQs for knowledge checks.
- Calibrate question difficulty according to the '{{{seniority}}}' seniority level.
- Generate unique IDs for each question (q1, q2, ...) and options (q1o1, q1o2, ...).
- For multiple-choice questions, provide 3-5 plausible options, with exactly one marked as correct. Ensure options are distinct and clear.
- Ensure question text is concise and unambiguous.
- Assign a relevant skill category and difficulty to each question.
- Generate a suitable overall test title.

Generate the test structure now.
`,
});


const createTestFlow = ai.defineFlow(
  {
    name: 'createTestFlow',
    inputSchema: CreateTestInputSchema,
    outputSchema: CreateTestOutputSchema,
  },
  async (input) => {
    // Add logic here if needed, e.g., fetching from a skills database, adjusting weights
    const {output} = await createTestPrompt(input);
    // Post-processing validation or refinement could happen here
    if (!output?.questions || output.questions.length !== input.numberOfQuestions) {
        console.warn(`AI did not generate the exact number of requested questions. Requested: ${input.numberOfQuestions}, Generated: ${output?.questions?.length ?? 0}`);
        // Handle discrepancy if needed, e.g., truncate, pad, or error
    }
     // Ensure IDs are sequential and correct format if needed
     output?.questions.forEach((q, index) => {
         q.id = `q${index + 1}`;
         if (q.options) {
             q.options.forEach((opt, optIndex) => {
                 opt.id = `q${index + 1}o${optIndex + 1}`;
             });
         }
     });

    return output!;
  }
);
