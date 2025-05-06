// src/app/tests/take/[testId]/page.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'; // Added FormDescription
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, FileText, HelpCircle, AlertCircle, Lightbulb, Code } from 'lucide-react'; // Added Code icon
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Import cn utility
import { Badge } from '@/components/ui/badge'; // Import Badge component

// --- Mock Data ---
// In a real app, this data would come from a database based on `testId`
interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean; // Only needed for grading
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'free-form' | 'coding-challenge'; // Added 'coding-challenge'
  text: string;
  options?: QuestionOption[];
  explanation?: string; // For MCQs and free-form ideal answers
  language?: string; // For coding challenges
  starterCode?: string; // For coding challenges
  solution?: string; // Example solution for coding challenges
}

interface Test {
  id: string;
  title: string;
  questions: Question[];
}

// Expanded Sample Test Data with Explanations and Coding Challenge
const sampleTest: Test = {
  id: 'sample',
  title: 'Sample Web Development & Coding Test',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      text: 'What does HTML stand for?',
      options: [
        { id: 'q1o1', text: 'HyperText Markup Language', isCorrect: true },
        { id: 'q1o2', text: 'Hyperlinks and Text Markup Language' },
        { id: 'q1o3', text: 'Home Tool Markup Language' },
      ],
      explanation: 'HTML stands for HyperText Markup Language. It is the standard markup language for creating web pages and web applications.'
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      text: 'Which property is used in CSS to change the text color of an element?',
      options: [
        { id: 'q2o1', text: 'font-color' },
        { id: 'q2o2', text: 'text-color' },
        { id: 'q2o3', text: 'color', isCorrect: true },
        { id: 'q2o4', text: 'font-style' },
      ],
      explanation: 'The `color` property in CSS is used to set the color of the text content of an element.'
    },
    {
      id: 'q3',
      type: 'free-form',
      text: 'Describe the difference between `let`, `const`, and `var` in JavaScript.',
      explanation: '`var` has function scope (or global scope if declared outside a function) and can be redeclared and reassigned. `let` and `const` have block scope ({}). `let` can be reassigned but not redeclared within the same scope. `const` cannot be reassigned or redeclared within the same scope, and must be initialized upon declaration.'
    },
     {
      id: 'q4',
      type: 'coding-challenge', // New question type
      text: 'Write a JavaScript function `sumArray(arr)` that takes an array of numbers and returns their sum. Handle potential non-numeric elements by ignoring them.',
      language: 'javascript',
      starterCode: `function sumArray(arr) {
  // Your code here

}`,
      solution: `function sumArray(arr) {
  let sum = 0;
  if (!Array.isArray(arr)) {
    return 0; // Or throw an error, depending on requirements
  }
  for (const item of arr) {
    if (typeof item === 'number' && !isNaN(item)) {
      sum += item;
    }
  }
  return sum;
}`
    },
  ],
};
// --- End Mock Data ---


// Dynamically create Zod schema based on the test structure
const generateSchema = (test: Test) => {
  const schemaObject: { [key: string]: z.ZodTypeAny } = {};
  test.questions.forEach((q) => {
    if (q.type === 'multiple-choice') {
      schemaObject[q.id] = z.string().min(1, { message: 'Please select an option.' });
    } else if (q.type === 'free-form') {
      schemaObject[q.id] = z.string().min(10, { message: 'Answer must be at least 10 characters.' });
    } else if (q.type === 'coding-challenge') {
      // Basic validation for coding challenges - ensure something is entered
      schemaObject[q.id] = z.string().min(1, { message: 'Please enter your code.' });
    }
  });
  return z.object(schemaObject);
};

type TestFormValues = z.infer<ReturnType<typeof generateSchema>>;

interface ResultDetail {
    questionId: string;
    isCorrect?: boolean; // Undefined for free-form and coding
    selectedOptionId?: string;
    correctOptionId?: string;
    userAnswer?: string; // Store user's free-form or code answer
    feedbackMessage?: string; // Simple static feedback
}
interface Result {
  score: number;
  totalMultipleChoice: number;
  details: ResultDetail[];
  hasCodingOrFreeForm: boolean; // Flag if further review needed
}

// Destructure testId directly from params
export default function TakeTestPage({ params }: { params: { testId: string } }) {
   // Unwrap params using React.use() - Correct way in newer Next.js versions
   const { testId } = React.use(params);


  // In a real app, fetch test data based on testId
  // const [test, setTest] = React.useState<Test | null>(null);
  // React.useEffect(() => { fetch(`/api/tests/${testId}`).then(res => res.json()).then(data => setTest(data))}, [testId]);
  // For now, we use the sample test:
  const test = testId === 'sample' ? sampleTest : null; // Basic routing for sample

  const [result, setResult] = React.useState<Result | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // testSchema depends on the test data, memoize based on the specific testId
  const testSchema = React.useMemo(() => test ? generateSchema(test) : z.object({}), [test]);

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: test ? test.questions.reduce((acc, q) => {
        if (q.type === 'coding-challenge' && q.starterCode) {
          acc[q.id] = q.starterCode;
        } else {
          acc[q.id] = '';
        }
        return acc;
      }, {} as TestFormValues) : {}, // Set starter code as default
  });


  // Reset form when testId changes or test data loads
  React.useEffect(() => {
     if (test) {
        const defaultVals = test.questions.reduce((acc, q) => {
            if (q.type === 'coding-challenge' && q.starterCode) {
                acc[q.id] = q.starterCode;
            } else {
                acc[q.id] = '';
            }
            return acc;
        }, {} as TestFormValues);
         form.reset(defaultVals);
     } else {
         form.reset({});
     }
    setResult(null);
  }, [testId, test, form]);


  const onSubmit = (data: TestFormValues) => {
    if (!test) return;
    setIsLoading(true);

    // Simulate grading delay
    setTimeout(() => {
      let score = 0;
      let totalMultipleChoice = 0;
      let hasCodingOrFreeForm = false;
      const details: Result['details'] = [];

      test.questions.forEach((q) => {
         let feedbackMessage = '';
         const detail: Partial<ResultDetail> = { questionId: q.id };

        if (q.type === 'multiple-choice' && q.options) {
          totalMultipleChoice++;
          const selectedOptionId = data[q.id];
          const correctOption = q.options.find(opt => opt.isCorrect);
          const isCorrect = correctOption?.id === selectedOptionId;

          detail.selectedOptionId = selectedOptionId;
          detail.correctOptionId = correctOption?.id;
          detail.isCorrect = isCorrect;

          if (isCorrect) {
            score++;
            feedbackMessage = "Correct! Excellent understanding.";
          } else {
            feedbackMessage = "Not quite. The correct answer provides a better approach. Review the explanation.";
          }
        } else if (q.type === 'free-form') {
           hasCodingOrFreeForm = true;
           detail.userAnswer = data[q.id]; // Store user's answer
           feedbackMessage = "Answer submitted. Free-form responses require thoughtful analysis. See the ideal approach below.";
           // No isCorrect status for free-form in this auto-grade
        } else if (q.type === 'coding-challenge') {
            hasCodingOrFreeForm = true;
            detail.userAnswer = data[q.id]; // Store user's code
            feedbackMessage = "Code submitted. This requires execution and review for full evaluation. Compare your approach with the sample solution.";
            // No isCorrect status for coding challenges in this auto-grade
        }

        detail.feedbackMessage = feedbackMessage;
        details.push(detail as ResultDetail); // Push the completed detail object
      });

      setResult({ score, totalMultipleChoice, details, hasCodingOrFreeForm });
      setIsLoading(false);
      window.scrollTo(0, 0); // Scroll to top to show results
    }, 500); // 0.5 second delay
  };

  if (!test) {
    // In a real app, show a loading state or proper error
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 mt-10">
            <AlertCircle className="w-16 h-16 text-destructive" />
             <h1 className="text-2xl font-semibold">Test Not Found</h1>
             <p className="text-muted-foreground">The requested test ('{testId}') could not be found.</p>
             <Link href="/" passHref>
                 <Button variant="outline">Go Back Home</Button>
             </Link>
        </div>
    );
  }


  const getQuestionResult = (questionId: string) => {
    return result?.details.find(d => d.questionId === questionId);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">{test.title}</h1>

      {result && (
        <Card className="bg-card border-accent shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <CheckCircle className="text-green-600" /> Test Results
            </CardTitle>
            <CardDescription>Review your performance below. Feedback and explanations/solutions are provided.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-lg font-semibold">
              Multiple Choice Score: {result.score} / {result.totalMultipleChoice} ({result.totalMultipleChoice > 0 ? Math.round((result.score / result.totalMultipleChoice) * 100) : 0}%)
            </p>
            {result.hasCodingOrFreeForm && (
                <p className="text-sm text-muted-foreground">
                 Free-form and coding answers require manual review or AI analysis for detailed evaluation. See feedback below.
                </p>
            )}
             <Separator className="my-4" />
              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                 {result.hasCodingOrFreeForm && (
                     <>
                        <Link href="/analyze" passHref>
                            <Button variant="secondary" size="sm">
                                <FileText className="mr-2 h-4 w-4"/> Analyze Free-Form with AI
                            </Button>
                        </Link>
                        <Link href="/analyze/code" passHref>
                            <Button variant="secondary" size="sm">
                                <Code className="mr-2 h-4 w-4"/> Analyze Code Quality with AI
                            </Button>
                         </Link>
                     </>
                 )}
                   <Link href="/" passHref>
                       <Button variant="outline" size="sm">Back to Home</Button>
                   </Link>
              </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {test.questions.map((question, index) => {
            const questionResult = getQuestionResult(question.id);
            const isCorrect = questionResult?.isCorrect;
            const selectedOptionId = questionResult?.selectedOptionId;
            const correctOptionId = questionResult?.correctOptionId;
            const userAnswer = questionResult?.userAnswer;
            const feedbackMessage = questionResult?.feedbackMessage;

            const cardClasses = cn(
              "transition-all duration-300",
              result ? (
                  question.type === 'multiple-choice' ?
                      (isCorrect === true ? 'border-green-500 bg-green-50/50' : 'border-red-500 bg-red-50/50') :
                      'border-blue-300 bg-blue-50/30' // Blue border for submitted free-form/coding
                ) : 'border-border'
            );

             const getResultIcon = () => {
                  if (!result) return <HelpCircle className="h-6 w-6 text-muted-foreground" title="Question pending" />;
                  if (question.type === 'multiple-choice') {
                    return isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-600" title="Correct" />
                    ) : (
                         <XCircle className="h-6 w-6 text-red-600" title="Incorrect"/>
                    )
                  } else if (question.type === 'coding-challenge') {
                     return <Code className="h-6 w-6 text-blue-600" title="Coding answer submitted" />;
                  } else { // free-form
                      return <FileText className="h-6 w-6 text-blue-600" title="Free-form answer submitted" />;
                  }
             };


            return (
              <Card key={question.id} className={cardClasses}>
                <CardHeader>
                  <CardTitle className="text-xl flex justify-between items-start gap-2">
                    <span className="flex-1">Question {index + 1}: {question.text}</span>
                     {/* Icon indicating status */}
                     <div className="flex-shrink-0">
                         {getResultIcon()}
                     </div>
                  </CardTitle>
                   {question.type === 'coding-challenge' && question.language && (
                      <CardDescription>Language: <Badge variant="secondary">{question.language}</Badge></CardDescription>
                   )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Display Options, Text Area, or Code Editor Area */}
                   {question.type === 'multiple-choice' && question.options && (
                    <FormField
                      control={form.control}
                      name={question.id}
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-2"
                              disabled={!!result || isLoading}
                            >
                              {question.options?.map((option) => {
                                const isSelected = selectedOptionId === option.id;
                                const isCorrectOption = correctOptionId === option.id;

                                const itemClasses = cn(
                                  "flex items-center space-x-3 space-y-0 p-3 rounded-md border transition-colors",
                                  result ? (
                                    isCorrectOption ? 'border-green-400 bg-green-100/60' :
                                    (isSelected ? 'border-red-400 bg-red-100/60 opacity-70' : 'border-border bg-background/30 opacity-60')
                                  ) : 'border-border hover:bg-accent/10',
                                  !result && 'cursor-pointer'
                                );
                                const labelClasses = cn(
                                  "font-normal flex-1",
                                   result ? (
                                        isCorrectOption ? 'text-green-800 font-semibold' :
                                        (isSelected ? 'text-red-800' : 'text-muted-foreground')
                                    ) : 'cursor-pointer',

                                );

                                return (
                                    <FormItem key={option.id} className={itemClasses}>
                                        <FormControl>
                                            <RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} disabled={!!result || isLoading} />
                                        </FormControl>
                                        <FormLabel htmlFor={`${question.id}-${option.id}`} className={labelClasses}>
                                            {option.text}
                                        </FormLabel>
                                         {/* Show icons only after submission */}
                                         {result && (
                                            <>
                                                {isCorrectOption && <CheckCircle className="h-5 w-5 text-green-600" />}
                                                {isSelected && !isCorrectOption && <XCircle className="h-5 w-5 text-red-600" />}
                                            </>
                                        )}
                                    </FormItem>
                                );
                               })}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {question.type === 'free-form' && (
                    <FormField
                      control={form.control}
                      name={question.id}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Your Answer:</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Your detailed answer..."
                              className="min-h-[120px]"
                              {...field}
                              disabled={!!result || isLoading}
                              readOnly={!!result} // Make read-only after submission
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                   {question.type === 'coding-challenge' && (
                     <FormField
                       control={form.control}
                       name={question.id}
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="font-medium">Your Code:</FormLabel>
                           <FormControl>
                             <Textarea
                               placeholder={question.starterCode || "Write your code here..."}
                               className="min-h-[200px] font-mono text-sm bg-muted/30 border-dashed border-input" // Style for code
                               {...field}
                               disabled={!!result || isLoading}
                               readOnly={!!result} // Make read-only after submission
                               spellCheck="false" // Disable spellcheck for code
                             />
                           </FormControl>
                            <FormDescription>Enter your {question.language} code in the editor.</FormDescription>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   )}

                  {/* Display Feedback and Explanation/Solution after submission */}
                   {result && (
                     <div className="mt-4 space-y-3 border-t pt-4">
                       {feedbackMessage && (
                            <Alert className={cn(
                                question.type === 'multiple-choice'
                                    ? (isCorrect ? "bg-green-100/70 border-green-300" : "bg-red-100/70 border-red-300")
                                    : "bg-blue-100/70 border-blue-300" // Blue for free-form/coding feedback
                            )}>
                                <AlertTitle className={cn("font-medium",
                                     question.type === 'multiple-choice'
                                        ? (isCorrect ? "text-green-800" : "text-red-800")
                                        : "text-blue-800"
                                )}>
                                    {question.type === 'multiple-choice'
                                        ? (isCorrect ? <CheckCircle className="inline-block mr-2 h-4 w-4"/> : <XCircle className="inline-block mr-2 h-4 w-4"/>)
                                        : (question.type === 'coding-challenge' ? <Code className="inline-block mr-2 h-4 w-4"/> : <FileText className="inline-block mr-2 h-4 w-4"/>)
                                    }
                                    Feedback
                                </AlertTitle>
                                <AlertDescription className={cn("text-sm",
                                     question.type === 'multiple-choice'
                                        ? (isCorrect ? "text-green-700" : "text-red-700")
                                        : "text-blue-700"
                                )}>
                                     {feedbackMessage}
                                </AlertDescription>
                            </Alert>
                       )}

                        {/* Show Explanation (for MCQs/Free-form if incorrect) */}
                         {question.explanation && (question.type !== 'coding-challenge' && (isCorrect === false || question.type === 'free-form')) && (
                           <Alert variant="default" className="bg-background/80 border-border">
                             <Lightbulb className="h-4 w-4 text-accent" />
                             <AlertTitle className="text-primary">Explanation / Ideal Answer</AlertTitle>
                             <AlertDescription className="text-muted-foreground whitespace-pre-wrap">
                               {question.explanation}
                             </AlertDescription>
                           </Alert>
                         )}

                         {/* Show Solution (for coding challenges) */}
                         {question.solution && question.type === 'coding-challenge' && (
                            <Alert variant="default" className="bg-background/80 border-border">
                                <Lightbulb className="h-4 w-4 text-accent" />
                                <AlertTitle className="text-primary">Sample Solution ({question.language})</AlertTitle>
                                <AlertDescription>
                                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono"><code>{question.solution}</code></pre>
                                </AlertDescription>
                            </Alert>
                         )}
                     </div>
                   )}
                </CardContent>
              </Card>
            );
          })}

          {!result && (
             <CardFooter className="flex justify-center mt-6">
               <Button type="submit" disabled={isLoading} size="lg">
                  {isLoading ? 'Submitting...' : 'Submit Test'}
                </Button>
             </CardFooter>
          )}
            {result && (
             <CardFooter className="flex justify-center mt-6">
                <Button type="button" onClick={() => window.scrollTo(0,0)} variant="outline">
                    Back to Top (View Results)
                </Button>
             </CardFooter>
          )}
        </form>
      </Form>
    </div>
  );
}
