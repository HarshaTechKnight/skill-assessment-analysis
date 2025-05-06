// src/app/tests/generate/page.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Cpu, FileText, HelpCircle, Terminal, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator'; // Added Separator

// Import functions and *types* only
import { extractSkillsFromJobDescription, type ExtractSkillsOutput } from '@/ai/flows/extract-skills-from-job-description';
import { createTestFromSkills, type CreateTestInput, type CreateTestOutput } from '@/ai/flows/create-test-from-skills';
import { generateJobDescription, type GenerateJobDescriptionInput, type GenerateJobDescriptionOutput } from '@/ai/flows/generate-job-description'; // Added import for description generation

// --- Define Local Zod Schemas for Form Validation ---
const GenerateTestFormSchema = z.object({
  jobTitle: z.string().min(1, 'Please select a job title.'),
  seniority: z.enum(['junior', 'mid-level', 'senior', 'lead', 'staff', 'principal']), // Expanded seniority options
  jobDescription: z.string().min(50, { message: 'Job description must be at least 50 characters long.' }),
  numberOfQuestions: z.number().int().min(3).max(20).default(5),
  assessmentFocus: z.array(z.enum(['technical', 'problem-solving', 'domain-knowledge', 'soft-skills'])).optional(),
});

type GenerateTestFormValues = z.infer<typeof GenerateTestFormSchema>;

// Predefined job titles for the dropdown
const commonJobTitles = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "Product Manager",
  "Project Manager",
  "UX Designer",
  "UI Designer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Cybersecurity Analyst",
  "Business Analyst",
  "Marketing Manager",
];


export default function GenerateTestPage() {
  const { toast } = useToast();
  const [step, setStep] = React.useState<'input' | 'generating' | 'review'>('input');
  const [extractedSkills, setExtractedSkills] = React.useState<ExtractSkillsOutput | null>(null);
  const [generatedTest, setGeneratedTest] = React.useState<CreateTestOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false); // For test generation
  const [isGeneratingDesc, setIsGeneratingDesc] = React.useState(false); // For description generation
  const [error, setError] = React.useState<string | null>(null); // For test generation
  const [generateDescError, setGenerateDescError] = React.useState<string | null>(null); // For description generation
  const [formData, setFormData] = React.useState<GenerateTestFormValues | null>(null); // Store form data

  const form = useForm<GenerateTestFormValues>({
    resolver: zodResolver(GenerateTestFormSchema),
    defaultValues: {
      jobTitle: '',
      seniority: 'mid-level',
      jobDescription: '',
      numberOfQuestions: 5,
      assessmentFocus: [],
    },
  });

  // Function to handle AI generation of job description
  const handleGenerateDescription = async () => {
    const jobTitle = form.getValues('jobTitle');
    const seniority = form.getValues('seniority');

    if (!jobTitle) {
      setGenerateDescError("Please select a job title to generate a description.");
      toast({
        title: "Job Title Missing",
        description: "Select a job title before generating.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingDesc(true);
    setGenerateDescError(null);
    setError(null); // Clear test gen error
    // Keep previous results? setExtractedSkills(null); setGeneratedTest(null);

    try {
      toast({ title: "Generating Job Description...", description: "AI is crafting the description." });
      const input: GenerateJobDescriptionInput = { jobTitle, seniority };
      const result = await generateJobDescription(input);
      form.setValue('jobDescription', result.jobDescription, { shouldValidate: true });
      toast({ title: "Description Generated!", description: "Review and edit the description below.", variant: "default" });
    } catch (err: any) {
      console.error("Error generating job description:", err);
      setGenerateDescError(err.message || "Failed to generate job description.");
      toast({ title: "Generation Failed", description: err.message || "Could not generate description.", variant: "destructive" });
    } finally {
      setIsGeneratingDesc(false);
    }
  };


  // --- Main submission for Test Generation ---
  const onSubmit = async (data: GenerateTestFormValues) => {
    setIsLoading(true); // Use main loading state
    setError(null);
    setGenerateDescError(null); // Clear description error
    setExtractedSkills(null);
    setGeneratedTest(null);
    setStep('generating');
    setFormData(data); // Save form data

    try {
      // Step 1: Extract Skills
      toast({ title: "Step 1: Extracting Skills...", description: "Analyzing job description." });
      const skillsResult = await extractSkillsFromJobDescription({ jobDescription: data.jobDescription });
      setExtractedSkills(skillsResult);

      if (!skillsResult || skillsResult.extractedSkills.length === 0) {
          throw new Error("No skills extracted. Cannot generate test. Try a more detailed job description.");
      }

      // Step 2: Generate Test
      toast({ title: "Step 2: Generating Test...", description: "Creating questions based on skills." });
      const testInput: CreateTestInput = {
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription,
        extractedSkills: skillsResult.extractedSkills,
        seniority: data.seniority as 'junior' | 'mid-level' | 'senior' | 'lead', // Cast based on form schema
        numberOfQuestions: data.numberOfQuestions,
        assessmentFocus: data.assessmentFocus,
      };
      const testResult = await createTestFromSkills(testInput);
      setGeneratedTest(testResult);

      toast({ title: "Test Generated Successfully!", description: "Review the generated questions below.", variant: "default" });
      setStep('review');

    } catch (err: any) {
      console.error("Error generating test:", err);
      setError(err.message || "An unexpected error occurred during test generation.");
      setStep('input');
      toast({ title: "Error Generating Test", description: err.message || "Please check inputs and try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

   const getBadgeVariant = (importance: string | undefined): 'destructive' | 'secondary' | 'outline' => {
    switch (importance) {
      case 'critical': return 'destructive';
      case 'important': return 'secondary';
      case 'nice-to-have': return 'outline';
      default: return 'outline';
    }
  };

  const getDifficultyColor = (difficulty: string | undefined) => {
    switch (difficulty) {
        case 'easy': return 'bg-green-100 text-green-800 border-green-300';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'hard': return 'bg-red-100 text-red-800 border-red-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  const handleEdit = () => {
    setStep('input');
  }

  const handleAccept = () => {
    // In a real app, save the generatedTest to a database
    console.log("Test Accepted:", generatedTest);
    toast({
      title: "Test Saved!",
      description: `The test "${generatedTest?.testTitle}" has been saved.`,
    });
    // Optionally reset or navigate away
    setStep('input'); // Go back to input for potentially generating another test
    form.reset();
    setExtractedSkills(null);
    setGeneratedTest(null);
    setFormData(null);
  }


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
        <Cpu className="w-8 h-8" /> AI Test Generator
      </h1>
       <p className="text-muted-foreground">Generate tailored skill assessments automatically based on job requirements and desired focus areas.</p>

      {/* Display combined errors at the top if they exist */}
      {(error || generateDescError) && step === 'input' && (
         <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Occurred</AlertTitle>
          <AlertDescription>{error || generateDescError}</AlertDescription>
        </Alert>
      )}

      {/* --- Input Form Area --- */}
      {step === 'input' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Card 1: Job Title, Seniority, and AI Description Generation */}
              <Card>
                 <CardHeader>
                    <CardTitle>Step 1: Define Role & Description</CardTitle>
                    <CardDescription>Select the job title and seniority. Optionally, generate a job description using AI.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <FormField
                        control={form.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a job title" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {commonJobTitles.map((title) => (
                                  <SelectItem key={title} value={title}>{title}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="seniority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seniority Level *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select seniority level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="junior">Junior</SelectItem>
                                <SelectItem value="mid-level">Mid-Level</SelectItem>
                                <SelectItem value="senior">Senior</SelectItem>
                                <SelectItem value="lead">Lead</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="principal">Principal</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                 </CardContent>
                 <CardFooter className="flex justify-between items-center">
                     <Button type="button" variant="secondary" onClick={handleGenerateDescription} disabled={isGeneratingDesc || isLoading}>
                       {isGeneratingDesc ? (
                        <>
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Generating...
                        </>
                       ) : (
                        <>
                           <Sparkles className="mr-2 h-4 w-4" /> Generate Description with AI
                         </>
                      )}
                     </Button>
                     {generateDescError && (
                        <p className="text-sm text-destructive">{generateDescError}</p>
                     )}
                 </CardFooter>
              </Card>

              {/* Separator */}
               <div className="flex items-center my-4">
                 <Separator className="flex-1" />
                 <span className="mx-4 text-sm text-muted-foreground">THEN</span>
                 <Separator className="flex-1" />
               </div>


               {/* Card 2: Job Description, Test Params, and Final Submission */}
               <Card>
                  <CardHeader>
                    <CardTitle>Step 2: Configure Assessment</CardTitle>
                    <CardDescription>Paste or edit the job description, then set the test parameters.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <FormField
                        control={form.control}
                        name="jobDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Description *</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="Paste the full job description here, or edit the AI-generated one. This is crucial for identifying relevant skills."
                                className="min-h-[150px]"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                    />

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <FormField
                        control={form.control}
                        name="numberOfQuestions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Questions</FormLabel>
                             <FormControl>
                                <Input
                                    type="number"
                                    min="3"
                                    max="20"
                                    {...field}
                                    onChange={event => field.onChange(+event.target.value)}
                                 />
                            </FormControl>
                            <FormDescription>Between 3 and 20.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                          control={form.control}
                          name="assessmentFocus"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel className="text-base">Assessment Focus (Optional)</FormLabel>
                                <FormDescription>
                                  Guide AI on question types.
                                </FormDescription>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 {(['technical', 'problem-solving', 'domain-knowledge', 'soft-skills'] as const).map((item) => (
                                   <FormField
                                      key={item}
                                      control={form.control}
                                      name="assessmentFocus"
                                      render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={item}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(item)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...(field.value ?? []), item])
                                                  : field.onChange(
                                                      (field.value ?? []).filter(
                                                        (value) => value !== item
                                                      )
                                                    )
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal capitalize">
                                            {item.replace('-', ' ')}
                                          </FormLabel>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                     </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isLoading || isGeneratingDesc} className="w-full md:w-auto">
                       {isLoading ? 'Generating Test...' : 'Generate Test'}
                    </Button>
                  </CardFooter>
               </Card>
            </form>
          </Form>
      )}

      {/* --- Loading / Generating State --- */}
      {step === 'generating' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                 Generating Assessment...
            </CardTitle>
            <CardDescription>The AI is working its magic. This may take a moment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center space-x-4">
                 <Skeleton className={`h-6 w-6 rounded-full ${extractedSkills ? 'bg-green-500' : 'bg-muted'}`} />
                 <Skeleton className={`h-4 flex-1 ${extractedSkills ? 'bg-green-500/30' : 'bg-muted'}`} />
             </div>
             <p className={`ml-10 text-sm ${extractedSkills ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                {extractedSkills ? 'Skills Extracted Successfully' : 'Extracting skills from job description...'}
             </p>

              <div className="flex items-center space-x-4">
                 <Skeleton className={`h-6 w-6 rounded-full ${generatedTest ? 'bg-green-500' : 'bg-muted'}`} />
                 <Skeleton className={`h-4 flex-1 ${generatedTest ? 'bg-green-500/30' : 'bg-muted'}`} />
             </div>
             <p className={`ml-10 text-sm ${extractedSkills ? (generatedTest ? 'text-green-600 font-medium' : 'text-primary animate-pulse') : 'text-muted-foreground'}`}>
                {extractedSkills ? (generatedTest ? 'Test Generated Successfully' : 'Generating test questions...') : 'Waiting for skill extraction...'}
             </p>

             {error && (
                <Alert variant="destructive" className="mt-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error during generation</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
             )}
          </CardContent>
        </Card>
      )}


      {/* --- Review Test --- */}
      {step === 'review' && generatedTest && (
        <Card className="border-accent bg-secondary/20">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                    <CardTitle className="text-2xl text-primary">{generatedTest.testTitle}</CardTitle>
                    <CardDescription>Review the AI-generated test questions below. You can edit them or accept the test.</CardDescription>
                </div>
                <div className="flex gap-2 flex-shrink-0 mt-2 md:mt-0">
                    <Button variant="outline" onClick={handleEdit}>Edit Parameters</Button>
                    <Button onClick={handleAccept}>Accept & Save Test</Button>
                </div>
            </div>
             {extractedSkills && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">Based on Extracted Skills:</h4>
                     <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                        {extractedSkills.extractedSkills.map((skill, index) => (
                            <Badge key={index} variant={getBadgeVariant(skill.importance)} className="text-xs capitalize">
                                {skill.name} ({skill.importance})
                            </Badge>
                        ))}
                    </div>
                  </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {generatedTest.questions.map((question, index) => (
              <Card key={question.id} className="bg-card shadow-sm p-4">
                <CardHeader className="p-0 pb-3">
                  <CardTitle className="text-lg flex justify-between items-start gap-2">
                    <span>Question {index + 1}: {question.text}</span>
                     <div className="flex flex-col items-end gap-1 flex-shrink-0">
                         <Badge variant="outline" className="capitalize text-xs">
                            {question.type === 'multiple-choice' ? 'Multiple Choice' : 'Free Form'}
                        </Badge>
                        {question.difficulty && (
                             <Badge className={`text-xs capitalize font-normal border ${getDifficultyColor(question.difficulty)}`}>
                                Difficulty: {question.difficulty}
                            </Badge>
                        )}
                         {question.skillCategory && (
                             <Badge variant="secondary" className="text-xs capitalize">
                                Category: {question.skillCategory}
                            </Badge>
                        )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {question.type === 'multiple-choice' && question.options && (
                    <div className="space-y-2 mt-2 pl-4 border-l-2 border-border">
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center gap-2 text-sm">
                           {option.isCorrect ? (
                             <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                           ) : (
                             <XCircle className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                           )}
                          <span className={`${option.isCorrect ? 'font-medium text-green-700' : 'text-muted-foreground'}`}>
                            {option.text} {option.isCorrect && "(Correct)"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {question.type === 'free-form' && (
                     <div className="text-sm text-muted-foreground italic mt-2 pl-4 border-l-2 border-border">
                      (Free-form answer required)
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
           <CardFooter className="flex justify-end gap-2">
                 <Button variant="outline" onClick={handleEdit}>Edit Parameters</Button>
                 <Button onClick={handleAccept}>Accept & Save Test</Button>
           </CardFooter>
        </Card>
      )}
    </div>
  );
}
