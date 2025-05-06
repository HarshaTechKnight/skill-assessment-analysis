// src/app/skills/extract/page.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'; // Added for Job Title if needed
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added Select
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Terminal, Sparkles } from 'lucide-react'; // Added Sparkles
import * as z from 'zod';
// Import the functions and *types* only
import { extractSkillsFromJobDescription, type ExtractSkillsOutput, type ExtractSkillsInput } from '@/ai/flows/extract-skills-from-job-description';
import { generateJobDescription, type GenerateJobDescriptionInput, type GenerateJobDescriptionOutput } from '@/ai/flows/generate-job-description'; // Added import
import { Separator } from '@/components/ui/separator'; // Added Separator
import { useToast } from "@/hooks/use-toast" // Added useToast

// Define the Zod schema locally for form validation
const ExtractSkillsFormSchema = z.object({
  jobTitle: z.string().optional(), // Made optional as it's primarily for generation
  seniority: z.enum(['junior', 'mid-level', 'senior', 'lead', 'staff', 'principal']).optional(), // Added seniority
  jobDescription: z.string().min(50, { message: 'Job description must be at least 50 characters long.' }),
});

type ExtractSkillsFormValues = z.infer<typeof ExtractSkillsFormSchema>; // Use local schema for form values

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

export default function ExtractSkillsPage() {
  const { toast } = useToast();
  const [extractedSkills, setExtractedSkills] = React.useState<ExtractSkillsOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false); // State for description generation
  const [error, setError] = React.useState<string | null>(null);
  const [generateError, setGenerateError] = React.useState<string | null>(null); // State for generation error

  const form = useForm<ExtractSkillsFormValues>({
    resolver: zodResolver(ExtractSkillsFormSchema), // Use local schema for resolver
    defaultValues: {
      jobTitle: '',
      seniority: 'mid-level', // Default seniority
      jobDescription: '',
    },
  });

  // Function to handle AI generation of job description
  const handleGenerateDescription = async () => {
    const jobTitle = form.getValues('jobTitle');
    const seniority = form.getValues('seniority');

    if (!jobTitle) {
      setGenerateError("Please select a job title to generate a description.");
      toast({
        title: "Job Title Missing",
        description: "Select a job title before generating.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    setError(null); // Clear extraction error
    setExtractedSkills(null); // Clear previous results

    try {
      toast({ title: "Generating Job Description...", description: "AI is crafting the description." });
      const input: GenerateJobDescriptionInput = { jobTitle };
      if (seniority) {
        input.seniority = seniority;
      }
      const result = await generateJobDescription(input);
      form.setValue('jobDescription', result.jobDescription, { shouldValidate: true });
      toast({ title: "Description Generated!", description: "Review and edit the description below.", variant: "default" });
    } catch (err: any) {
      console.error("Error generating job description:", err);
      setGenerateError(err.message || "Failed to generate job description.");
      toast({ title: "Generation Failed", description: err.message || "Could not generate description.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };


  // The onSubmit function for extracting skills
  const onSubmit = async (data: ExtractSkillsFormValues) => {
    setIsLoading(true);
    setError(null);
    setGenerateError(null); // Clear generation error
    setExtractedSkills(null);

    try {
       toast({ title: "Extracting Skills...", description: "Analyzing the provided job description." });
      // Pass only the jobDescription, matching ExtractSkillsInput structure
      const result = await extractSkillsFromJobDescription({ jobDescription: data.jobDescription });
      setExtractedSkills(result);
       toast({ title: "Skills Extracted!", description: "View the identified skills below.", variant: "default" });
    } catch (err: any) {
      console.error("Error extracting skills:", err);
      setError(err.message || "Failed to extract skills. Please check the job description and try again.");
       toast({ title: "Extraction Failed", description: err.message || "Could not extract skills.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeVariant = (importance: 'critical' | 'important' | 'nice-to-have'): 'destructive' | 'secondary' | 'outline' => {
    switch (importance) {
      case 'critical': return 'destructive';
      case 'important': return 'secondary';
      case 'nice-to-have': return 'outline';
      default: return 'outline';
    }
  };

   const getCategoryColor = (category: string) => {
    switch (category) {
        case 'technical': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'soft': return 'bg-green-100 text-green-800 border-green-300';
        case 'domain-specific': return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'tooling': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <ClipboardList className="w-8 h-8" /> Skill Extractor
          </h1>
          <p className="text-muted-foreground">Generate a job description using AI or paste your own, then extract key skills.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
           {/* Generation Card */}
           <Card>
             <CardHeader>
                <CardTitle>Generate Job Description (Optional)</CardTitle>
                <CardDescription>Select a role and seniority, then let AI generate a starting point for your job description.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Job Title</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a common job title" />
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
                        <FormLabel>Select Seniority</FormLabel>
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
                 {generateError && (
                     <Alert variant="destructive" className="mt-4">
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>Generation Error</AlertTitle>
                      <AlertDescription>{generateError}</AlertDescription>
                    </Alert>
                  )}
             </CardContent>
              <CardFooter>
                 <Button type="button" variant="secondary" onClick={handleGenerateDescription} disabled={isGenerating || isLoading}>
                   {isGenerating ? (
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
              </CardFooter>
           </Card>

           {/* Separator */}
           <div className="flex items-center my-6">
             <Separator className="flex-1" />
             <span className="mx-4 text-sm text-muted-foreground">OR</span>
             <Separator className="flex-1" />
           </div>


          {/* Manual Input Card */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Job Description Input</CardTitle>
              <CardDescription>Paste the job description text directly below, or edit the AI-generated one.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the entire job description here, or edit the generated one..."
                        className="min-h-[250px] text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading || isGenerating} className="w-full md:w-auto">
                {isLoading ? 'Extracting...' : 'Extract Skills from Description'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>


      {/* Loading State for Extraction */}
      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Extracting Skills...</CardTitle>
             <CardDescription>Analyzing the job description...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>
             <Skeleton className="h-4 w-full mt-2" />
             <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      )}

       {/* Extraction Error */}
      {error && !isLoading && (
         <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Extraction Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Card */}
      {extractedSkills && !isLoading && (
        <Card className="bg-secondary/30 border-accent">
          <CardHeader>
            <CardTitle className="text-primary">Extracted Skills</CardTitle>
            <CardDescription>Skills identified from the job description, categorized and rated by importance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {extractedSkills.extractedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                {extractedSkills.extractedSkills.map((skill, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex items-center justify-between mb-2">
                         <h3 className="font-semibold text-base">{skill.name}</h3>
                         <Badge variant={getBadgeVariant(skill.importance)} className="capitalize ml-2">
                           {skill.importance.replace('-', ' ')}
                         </Badge>
                       </div>
                       <Badge className={`text-xs capitalize font-normal border ${getCategoryColor(skill.category)}`}>
                          {skill.category.replace('-', ' ')}
                       </Badge>
                       {skill.context && (
                         <p className="text-xs text-muted-foreground mt-2 italic">Context: "{skill.context}"</p>
                       )}
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-muted-foreground">No specific skills were extracted. The job description might be too generic or lack detail.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
