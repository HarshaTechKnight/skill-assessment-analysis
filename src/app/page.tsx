import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Edit } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Welcome to SkillCheck Pro</h1>
        <p className="text-lg text-muted-foreground">
          Your intelligent engine for assessing candidate skills accurately and efficiently.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center gap-4">
            <Edit className="w-8 h-8 text-accent" />
            <div>
              <CardTitle className="text-2xl">Create Skill Tests</CardTitle>
              <CardDescription>Build role-specific assessments based on job requirements.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Link href="/tests/create" passHref>
              <Button>
                <Edit className="mr-2 h-4 w-4" /> Create Test
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center gap-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M14 19a6 6 0 0 0-12 0h12Z"/><circle cx="18" cy="5" r="3"/><path d="M20.6 10a6 6 0 1 0-9.6 7.3"/></svg> {/* AI icon */}
            <div>
              <CardTitle className="text-2xl">Analyze Problem-Solving</CardTitle>
              <CardDescription>Assess candidate's free-form answers using AI.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-end">
             <Link href="/analyze" passHref>
                <Button>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14 19a6 6 0 0 0-12 0h12Z"/><circle cx="18" cy="5" r="3"/><path d="M20.6 10a6 6 0 1 0-9.6 7.3"/></svg> {/* AI icon */}
                   Analyze Answer
                </Button>
              </Link>
          </CardContent>
        </Card>

         <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4">
            <CheckSquare className="w-8 h-8 text-accent" />
            <div>
              <CardTitle className="text-2xl">Take a Test (Example)</CardTitle>
              <CardDescription>Experience the auto-grading feature with a sample test.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Link href="/tests/take/sample" passHref>
              <Button variant="secondary">
                <CheckSquare className="mr-2 h-4 w-4" /> Take Sample Test
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
