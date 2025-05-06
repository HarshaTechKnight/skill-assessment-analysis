// src/app/skills/extract/page.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Terminal } from 'lucide-react';
import * as z from 'zod';
// Import the function and *types* only
import { extractSkillsFromJobDescription, type ExtractSkillsOutput, type ExtractSkillsInput } from '@/ai/flows/extract-skills-from-job-description';

// Define the Zod schema locally for form validation
const ExtractSkillsFormSchema = z.object({
  jobDescription: z.string().min(50, { message: 'Job description must be at least 50 characters long.' }),
});

type ExtractSkillsFormValues = z.infer<typeof ExtractSkillsFormSchema>; // Use local schema for form values

export default function ExtractSkillsPage() {
  const [extractedSkills, setExtractedSkills] = React.useState<ExtractSkillsOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<ExtractSkillsFormValues>({
    resolver: zodResolver(ExtractSkillsFormSchema), // Use local schema for resolver
    defaultValues: {
      jobDescription: '',
    },
  });

  // The onSubmit function now accepts the local form values type
  // but passes the data conforming to the ExtractSkillsInput type to the server action
  const onSubmit = async (data: ExtractSkillsFormValues) => {
    setIsLoading(true);
    setError(null);
    setExtractedSkills(null);

    try {
      // Pass the validated data (which matches the ExtractSkillsInput structure)
      const result = await extractSkillsFromJobDescription(data);
      setExtractedSkills(result);
    } catch (err: any) {
      console.error("Error extracting skills:", err);
      setError(err.message || "Failed to extract skills. Please check the job description and try again.");
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
      <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
        <ClipboardList className="w-8 h-8" /> Skill Extractor
      </h1>
      <p className="text-muted-foreground">Paste a job description below to automatically identify required skills using AI.</p>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardHeader>
              <CardTitle>Job Description Input</CardTitle>
              <CardDescription>Provide the full text of the job description.</CardDescription>
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
                        placeholder="Paste the entire job description here..."
                        className="min-h-[200px] text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? 'Extracting...' : 'Extract Skills'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Extracting Skills...</CardTitle>
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

      {error && (
         <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
