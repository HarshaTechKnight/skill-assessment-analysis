// src/app/analyze/code/page.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Code, Terminal, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { analyzeCodeQuality, AnalyzeCodeQualityInputSchema, type AnalyzeCodeQualityOutput } from '@/ai/flows/analyze-code-quality';
import { Separator } from '@/components/ui/separator';

type AnalyzeCodeFormValues = z.infer<typeof AnalyzeCodeQualityInputSchema>;

export default function AnalyzeCodeQualityPage() {
  const [analysisResult, setAnalysisResult] = React.useState<AnalyzeCodeQualityOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<AnalyzeCodeFormValues>({
    resolver: zodResolver(AnalyzeCodeQualityInputSchema),
    defaultValues: {
      codeSnippet: '',
      language: 'javascript', // Default language
      jobRequirements: '',
      problemDescription: '',
    },
  });

  const onSubmit = async (data: AnalyzeCodeFormValues) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeCodeQuality(data);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error("Error analyzing code quality:", err);
      setError(err.message || "Failed to analyze the code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
        <Code className="w-8 h-8" /> Code Quality Analyzer
      </h1>
      <p className="text-muted-foreground">Analyze a candidate's code snippet using AI to assess quality, efficiency, and adherence to best practices.</p>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardHeader>
              <CardTitle>Code Input & Context</CardTitle>
              <CardDescription>Provide the code snippet and relevant context like language and requirements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Programming Language</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., javascript, python, java" {...field} />
                    </FormControl>
                    <FormDescription>Specify the language of the code snippet.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="codeSnippet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code Snippet</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the candidate's code here..."
                        className="min-h-[200px] font-mono text-sm" // Use mono font for code
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="problemDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problem Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the problem the code is intended to solve."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>Helps assess functional correctness.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="jobRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevant Job Requirements (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste any specific coding standards or requirements from the job description."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>Provides context for evaluation (e.g., specific frameworks, performance needs).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? 'Analyzing Code...' : 'Analyze Code Quality'}
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
            <div className="flex justify-between mt-4">
                 <Skeleton className="h-10 w-24" />
                 <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-6 w-1/2 mt-4" />
            <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-2/3 mt-4" />
            <Skeleton className="h-4 w-full" />
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

      {analysisResult && !isLoading && (
        <Card className="bg-secondary/30 border-accent">
          <CardHeader>
            <CardTitle className="text-primary">AI Code Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Summary */}
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Info className="w-5 h-5 text-blue-600"/>Overall Quality Summary</h3>
              <p className="text-muted-foreground whitespace-pre-wrap bg-background/50 p-3 rounded-md border">{analysisResult.overallQualitySummary}</p>
            </div>

            <Separator />

            {/* Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 bg-card rounded-lg border">
                    <h4 className="font-medium mb-1 text-muted-foreground">Readability Score</h4>
                    <p className={`text-2xl font-bold ${getScoreColor(analysisResult.readabilityScore)}`}>
                        {analysisResult.readabilityScore} / 10
                    </p>
                </div>
                 <div className="p-4 bg-card rounded-lg border">
                    <h4 className="font-medium mb-1 text-muted-foreground">Maintainability Score</h4>
                     <p className={`text-2xl font-bold ${getScoreColor(analysisResult.maintainabilityScore)}`}>
                        {analysisResult.maintainabilityScore} / 10
                    </p>
                </div>
            </div>

            {/* Detailed Sections */}
             <div className="space-y-4">
                 <AnalysisSection title="Functionality Assessment" content={analysisResult.functionalityAssessment} icon={<CheckCircle className="w-5 h-5 text-green-600"/>} />
                 <AnalysisSection title="Efficiency Assessment" content={analysisResult.efficiencyAssessment} icon={<AlertTriangle className="w-5 h-5 text-yellow-600"/>}/>
                 <AnalysisSection title="Best Practices Adherence" content={analysisResult.bestPracticesAdherence} icon={<CheckCircle className="w-5 h-5 text-green-600"/>}/>

                 {analysisResult.securityVulnerabilities && analysisResult.securityVulnerabilities.length > 0 && (
                    <AnalysisListSection title="Potential Security Vulnerabilities" items={analysisResult.securityVulnerabilities} icon={<XCircle className="w-5 h-5 text-red-600"/>} badgeVariant="destructive"/>
                 )}

                 {analysisResult.suggestionsForImprovement && analysisResult.suggestionsForImprovement.length > 0 && (
                    <AnalysisListSection title="Suggestions for Improvement" items={analysisResult.suggestionsForImprovement} icon={<Info className="w-5 h-5 text-blue-600"/>} badgeVariant="outline"/>
                 )}
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper components for consistent section display
const AnalysisSection = ({ title, content, icon }: { title: string; content: string; icon: React.ReactNode }) => (
  <div>
    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">{icon}{title}</h3>
    <p className="text-muted-foreground whitespace-pre-wrap bg-background/50 p-3 rounded-md border">{content}</p>
  </div>
);

const AnalysisListSection = ({ title, items, icon, badgeVariant }: { title: string; items: string[]; icon: React.ReactNode; badgeVariant: 'destructive' | 'outline' }) => (
   <div>
    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">{icon}{title}</h3>
    <ul className="list-none space-y-2 pl-0">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2">
          <Badge variant={badgeVariant} className="mt-1 rounded-full px-1.5 py-0.5 text-xs">-</Badge>
          <span className="text-muted-foreground">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);
