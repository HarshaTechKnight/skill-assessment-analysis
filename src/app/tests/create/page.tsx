'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

const questionSchema = z.object({
  type: z.enum(['multiple-choice', 'free-form']),
  text: z.string().min(1, 'Question text cannot be empty.'),
  options: z.array(z.object({ text: z.string().min(1, 'Option text cannot be empty.'), isCorrect: z.boolean() })).optional(),
});

const testSchema = z.object({
  title: z.string().min(1, 'Test title cannot be empty.'),
  jobRequirements: z.string().min(10, 'Job requirements must be detailed.'),
  questions: z.array(questionSchema).min(1, 'Test must have at least one question.'),
});

type TestFormValues = z.infer<typeof testSchema>;

export default function CreateTestPage() {
  const { toast } = useToast()
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      title: '',
      jobRequirements: '',
      questions: [{ type: 'multiple-choice', text: '', options: [{ text: '', isCorrect: false }] }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

   const onSubmit = (data: TestFormValues) => {
    // In a real app, you would save this data to a database
    console.log('Test Created:', data);
    toast({
      title: "Test Created Successfully!",
      description: `The test "${data.title}" has been created.`,
    })
    // Optionally reset form or redirect
    // form.reset();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Skill Test Builder</h1>
      <p className="text-muted-foreground">Create role-specific skill tests based on job requirements.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
              <CardDescription>Define the title and link the test to job requirements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Frontend Developer Assessment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the detailed job requirements here. This helps in contextualizing the assessment."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
              <CardDescription>Add multiple-choice or free-form questions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <Card key={field.id} className="border p-4 rounded-md shadow-sm bg-card/50">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg">Question {index + 1}</h3>
                     <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove Question</span>
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name={`questions.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Question Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select question type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                            <SelectItem value="free-form">Free Form</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`questions.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Question Text</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter the question" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch(`questions.${index}.type`) === 'multiple-choice' && (
                    <QuestionOptions control={form.control} questionIndex={index} />
                  )}
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ type: 'multiple-choice', text: '', options: [{ text: '', isCorrect: false }] })}
                className="mt-4"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </CardContent>
             <CardFooter>
              <Button type="submit" className="w-full md:w-auto">Create Test</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}


// Helper component for Multiple Choice options
function QuestionOptions({ control, questionIndex }: { control: any; questionIndex: number }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  return (
    <div className="space-y-4 mt-4 pl-4 border-l-2 border-accent/50">
      <h4 className="font-medium text-muted-foreground">Options</h4>
      {fields.map((optionField, optionIndex) => (
        <div key={optionField.id} className="flex items-center gap-2 p-2 rounded bg-background">
          <FormField
            control={control}
            name={`questions.${questionIndex}.options.${optionIndex}.isCorrect`}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                 <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id={`correct-${questionIndex}-${optionIndex}`}
                  />
                 </FormControl>
                 <FormLabel htmlFor={`correct-${questionIndex}-${optionIndex}`} className="font-normal cursor-pointer">
                   Correct
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`questions.${questionIndex}.options.${optionIndex}.text`}
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input placeholder={`Option ${optionIndex + 1}`} {...field} className="h-8" />
                </FormControl>
                 <FormMessage className="text-xs mt-1" />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
            onClick={() => remove(optionIndex)}
            disabled={fields.length <= 1}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove Option</span>
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => append({ text: '', isCorrect: false })}
        className="text-accent hover:text-accent"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Option
      </Button>
    </div>
  );
}

