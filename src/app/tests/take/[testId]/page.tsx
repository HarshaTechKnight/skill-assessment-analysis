'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, FileText, HelpCircle, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

// --- Mock Data ---
// In a real app, this data would come from a database based on `testId`
interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean; // Only needed for grading, might not be exposed to client initially
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'free-form';
  text: string;
  options?: QuestionOption[];
}

interface Test {
  id: string;
  title: string;
  questions: Question[];
}

const sampleTest: Test = {
  id: 'sample',
  title: 'Sample Web Development Basics Test',
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
    },
    {
      id: 'q3',
      type: 'free-form',
      text: 'Describe the difference between `let`, `const`, and `var` in JavaScript.',
    },
     {
      id: 'q4',
      type: 'multiple-choice',
      text: 'What is the purpose of a `<div>` tag in HTML?',
      options: [
        { id: 'q4o1', text: 'To define a hyperlink' },
        { id: 'q4o2', text: 'To create a division or a section', isCorrect: true },
        { id: 'q4o3', text: 'To display an image' },
        { id: 'q4o4', text: 'To format text as bold' },
      ],
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
    }
  });
  return z.object(schemaObject);
};

type TestFormValues = z.infer<ReturnType<typeof generateSchema>>;

interface Result {
  score: number;
  totalMultipleChoice: number;
  details: {
    questionId: string;
    isCorrect?: boolean; // Undefined for free-form
    selectedOptionId?: string;
    correctOptionId?: string;
  }[];
}

// Destructure testId directly from params
export default function TakeTestPage({ params: { testId } }: { params: { testId: string } }) {
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
    defaultValues: {}, // Default values will be empty initially
  });

  // Reset form when testId changes (though unlikely in this setup without full routing)
  React.useEffect(() => {
    form.reset();
    setResult(null);
  }, [testId, form]);


  const onSubmit = (data: TestFormValues) => {
    if (!test) return;
    setIsLoading(true);

    // Simulate grading delay
    setTimeout(() => {
      let score = 0;
      let totalMultipleChoice = 0;
      const details: Result['details'] = [];

      test.questions.forEach((q) => {
        if (q.type === 'multiple-choice' && q.options) {
          totalMultipleChoice++;
          const selectedOptionId = data[q.id];
          const correctOption = q.options.find(opt => opt.isCorrect);
          const isCorrect = correctOption?.id === selectedOptionId;
          if (isCorrect) {
            score++;
          }
          details.push({
            questionId: q.id,
            isCorrect: isCorrect,
            selectedOptionId: selectedOptionId,
            correctOptionId: correctOption?.id,
          });
        } else if (q.type === 'free-form') {
           details.push({ questionId: q.id }); // Free-form answers aren't auto-graded here
        }
      });

      setResult({ score, totalMultipleChoice, details });
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
            <CardDescription>Your results for the multiple-choice questions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg font-semibold">
              Score: {result.score} / {result.totalMultipleChoice} ({result.totalMultipleChoice > 0 ? Math.round((result.score / result.totalMultipleChoice) * 100) : 0}%)
            </p>
            <p className="text-sm text-muted-foreground">
              Free-form answers require manual review or AI analysis.
            </p>
             <Separator className="my-4" />
             <Link href="/analyze" passHref>
                 <Button variant="link" className="p-0 h-auto">
                   Analyze Free-Form Answers
                 </Button>
             </Link>
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

            return (
              <Card key={question.id} className={`transition-all duration-300 ${result ? (isCorrect === true ? 'border-green-500 bg-green-50/50' : isCorrect === false ? 'border-red-500 bg-red-50/50' : 'border-border') : 'border-border'}`}>
                <CardHeader>
                  <CardTitle className="text-xl flex justify-between items-start gap-2">
                    <span>Question {index + 1}: {question.text}</span>
                    {result && question.type === 'multiple-choice' && (
                      isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                      ) : (
                         isCorrect === false && <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                      )
                    )}
                     {result && question.type === 'free-form' && (
                        <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" title="Free-form answer submitted" />
                    )}
                     {!result && question.type === 'free-form' && (
                        <HelpCircle className="h-6 w-6 text-muted-foreground flex-shrink-0" title="Free-form question" />
                     )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
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

                                return (
                                    <FormItem key={option.id} className={`flex items-center space-x-3 space-y-0 p-3 rounded-md border transition-colors ${result ? (isCorrectOption ? 'border-green-400 bg-green-100/60' : (isSelected ? 'border-red-400 bg-red-100/60' : 'border-border bg-background/50')) : 'border-border hover:bg-accent/10'}`}>
                                        <FormControl>
                                        <RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} />
                                        </FormControl>
                                        <FormLabel htmlFor={`${question.id}-${option.id}`} className={`font-normal flex-1 cursor-pointer ${result && isSelected ? 'font-medium' : ''} ${result && isCorrectOption ? 'text-green-800 font-semibold' : ''} ${result && isSelected && !isCorrectOption ? 'text-red-800' : ''}`}>
                                            {option.text}
                                            {result && isCorrectOption && !isSelected && <span className="text-green-700 text-xs ml-2">(Correct Answer)</span>}
                                            {result && isSelected && !isCorrectOption && <span className="text-red-700 text-xs ml-2">(Your Answer)</span>}
                                        </FormLabel>
                                    </FormItem>
                                );
                               })}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                           {result && isCorrect === false && correctOptionId && (
                            <Alert variant="destructive" className="mt-2 bg-red-100 border-red-300 text-red-900">
                                <AlertCircle className="h-4 w-4 !text-red-900" />
                              <AlertDescription className="!text-red-900">
                                Correct answer: {question.options.find(o => o.id === correctOptionId)?.text}
                              </AlertDescription>
                            </Alert>
                          )}
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
                          <FormControl>
                            <Textarea
                              placeholder="Your detailed answer..."
                              className="min-h-[120px]"
                              {...field}
                              disabled={!!result || isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                          {result && <p className="text-sm text-blue-600 mt-2">Answer submitted. Requires manual review or AI analysis.</p>}
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}

          {!result && (
             <CardFooter className="flex justify-end">
               <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? 'Submitting...' : 'Submit Test'}
                </Button>
             </CardFooter>
          )}
            {result && (
             <CardFooter className="flex justify-center">
               <Link href="/" passHref>
                 <Button variant="outline">Back to Home</Button>
               </Link>
             </CardFooter>
          )}
        </form>
      </Form>
    </div>
  );
}

    