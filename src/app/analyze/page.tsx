'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeProblemSolving, type AnalyzeProblemSolvingOutput } from '@/ai/flows/analyze-problem-solving'; // Import the AI flow
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, FileText, BrainCircuit } from 'lucide-react'; // Using BrainCircuit for consistency
import { Separator } from '@/components/ui/separator';

const analyzeSchema = z.object({
  answer: z.string().min(20, 'Answer must be at least 20 characters long.'),
  jobRequirements: z.string().min(10, 'Job requirements must be detailed.'),
});

type AnalyzeFormValues = z.infer<typeof analyzeSchema>;

export default function AnalyzeProblemSolvingPage() {
  const [analysisResult, setAnalysisResult] = React.useState<AnalyzeProblemSolvingOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<AnalyzeFormValues>({
    resolver: zodResolver(analyzeSchema),
    defaultValues: {
      answer: '',
      jobRequirements: '',
    },
  });

  const onSubmit = async (data: AnalyzeFormValues) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeProblemSolving(data);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Error analyzing problem solving:", err);
      setError("Failed to analyze the answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
         <BrainCircuit className="w-8 h-8" /> Problem-Solving Analyzer
      </h1>
      <p className="text-muted-foreground">Analyze a candidate's free-form answer using AI to assess their problem-solving approach and efficiency.</p>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardHeader>
              <CardTitle>Input Details</CardTitle>
              <CardDescription>Provide the candidate's answer and the relevant job requirements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="jobRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the job requirements related to the question asked."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidate's Answer</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the candidate's full free-form answer here."
                        className="min-h-[150px]"
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
                {isLoading ? 'Analyzing...' : 'Analyze Answer'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis in Progress...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-6 w-1/2 mt-4" />
            <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-2/3 mt-4" />
            <Skeleton className="h-4 w-full" />
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

      {analysisResult && !isLoading && (
        <Card className="bg-secondary/30 border-accent">
          <CardHeader>
            <CardTitle className="text-primary">AI Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">Problem-Solving Approach:</h3>
              <p className="text-muted-foreground whitespace-pre-wrap bg-background/50 p-3 rounded-md border">{analysisResult.problemSolvingApproach}</p>
            </div>
             <Separator className="my-4" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Efficiency Assessment:</h3>
              <p className="text-muted-foreground whitespace-pre-wrap bg-background/50 p-3 rounded-md border">{analysisResult.efficiencyAssessment}</p>
            </div>
             <Separator className="my-4" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Areas for Improvement:</h3>
              <p className="text-muted-foreground whitespace-pre-wrap bg-background/50 p-3 rounded-md border">{analysisResult.areasForImprovement}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
