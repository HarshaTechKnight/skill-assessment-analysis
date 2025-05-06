import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Edit, Code, Cpu, ClipboardList, BarChart3 } from "lucide-react"; // Added more icons
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Welcome to SkillCheck Pro</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Your intelligent engine for role-specific skill assessment, AI-powered test generation, auto-grading, and performance analysis.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">

         {/* Skill Extraction */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center gap-4">
             <ClipboardList className="w-8 h-8 text-accent" />
            <div>
              <CardTitle className="text-xl">Extract Skills</CardTitle> {/* Smaller Title */}
              <CardDescription>Analyze job descriptions to identify key skills using AI.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Link href="/skills/extract" passHref>
              <Button variant="secondary">
                <ClipboardList className="mr-2 h-4 w-4" /> Extract Skills
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Manual Test Creation */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center gap-4">
            <Edit className="w-8 h-8 text-accent" />
            <div>
              <CardTitle className="text-xl">Manual Test Builder</CardTitle> {/* Smaller Title */}
              <CardDescription>Manually create custom skill tests and assessments.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Link href="/tests/create" passHref>
              <Button>
                <Edit className="mr-2 h-4 w-4" /> Create Manually
              </Button>
            </Link>
          </CardContent>
        </Card>

         {/* AI Test Generation */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center gap-4">
             <Cpu className="w-8 h-8 text-accent" />
            <div>
              <CardTitle className="text-xl">AI Test Generation</CardTitle> {/* Smaller Title */}
              <CardDescription>Generate tests automatically based on skills and job roles.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Link href="/tests/generate" passHref>
              <Button>
                <Cpu className="mr-2 h-4 w-4" /> Generate with AI
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Problem Solving Analysis */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center gap-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M14 19a6 6 0 0 0-12 0h12Z"/><circle cx="18" cy="5" r="3"/><path d="M20.6 10a6 6 0 1 0-9.6 7.3"/></svg> {/* AI icon */}
            <div>
              <CardTitle className="text-xl">Analyze Free-Form</CardTitle> {/* Smaller Title */}
              <CardDescription>Assess problem-solving in free-form answers using AI.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-end">
             <Link href="/analyze" passHref>
                <Button variant="secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14 19a6 6 0 0 0-12 0h12Z"/><circle cx="18" cy="5" r="3"/><path d="M20.6 10a6 6 0 1 0-9.6 7.3"/></svg> {/* AI icon */}
                   Analyze Answer
                </Button>
              </Link>
          </CardContent>
        </Card>

         {/* Code Quality Analysis */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center gap-4">
             <Code className="w-8 h-8 text-accent" />
            <div>
              <CardTitle className="text-xl">Analyze Code Quality</CardTitle> {/* Smaller Title */}
              <CardDescription>Evaluate code snippets for quality, efficiency, and security.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Link href="/analyze/code" passHref>
              <Button variant="secondary">
                <Code className="mr-2 h-4 w-4" /> Analyze Code
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Take Sample Test */}
         <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center gap-4">
            <CheckSquare className="w-8 h-8 text-accent" />
            <div>
              <CardTitle className="text-xl">Take Sample Test</CardTitle> {/* Smaller Title */}
              <CardDescription>Experience the auto-grading feature with a sample test.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Link href="/tests/take/sample" passHref>
              <Button variant="outline">
                <CheckSquare className="mr-2 h-4 w-4" /> Take Sample
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Benchmarking (Placeholder/Future Feature) */}
         <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 opacity-70 cursor-not-allowed">
          <CardHeader className="flex flex-row items-center gap-4">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
            <div>
              <CardTitle className="text-xl text-muted-foreground">Performance Benchmarking</CardTitle> {/* Smaller Title */}
              <CardDescription className="text-muted-foreground">Compare candidate performance against benchmarks (Coming Soon).</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-end">
              <Button variant="outline" disabled>
                <BarChart3 className="mr-2 h-4 w-4" /> View Benchmarks
              </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
