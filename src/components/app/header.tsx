import Link from 'next/link';
import { CheckCircle, ChevronDown, Edit, Cpu, ClipboardList, Code, BarChart3, FileText } from 'lucide-react'; // Added icons
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold hover:opacity-90 transition-opacity">
          <CheckCircle className="w-6 h-6 text-accent" />
          SkillCheck Pro
        </Link>
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Create Test Dropdown */}
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sm font-medium hover:text-accent hover:bg-primary/10 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-1 h-auto md:px-3 md:py-1.5">
                Create Test <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>Test Creation Methods</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/skills/extract" passHref>
                <DropdownMenuItem>
                  <ClipboardList className="mr-2 h-4 w-4"/>
                  Extract Skills First
                </DropdownMenuItem>
              </Link>
               <Link href="/tests/generate" passHref>
                <DropdownMenuItem>
                  <Cpu className="mr-2 h-4 w-4"/>
                   Generate with AI
                </DropdownMenuItem>
              </Link>
              <Link href="/tests/create" passHref>
                <DropdownMenuItem>
                   <Edit className="mr-2 h-4 w-4"/>
                   Create Manually
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Analyze Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" className="text-sm font-medium hover:text-accent hover:bg-primary/10 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-1 h-auto md:px-3 md:py-1.5">
                 Analyze <ChevronDown className="ml-1 h-4 w-4" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
               <DropdownMenuLabel>Analysis Tools</DropdownMenuLabel>
               <DropdownMenuSeparator />
               <Link href="/analyze" passHref>
                <DropdownMenuItem>
                   <FileText className="mr-2 h-4 w-4"/> {/* Use FileText for consistency */}
                   Analyze Free-Form
                </DropdownMenuItem>
              </Link>
              <Link href="/analyze/code" passHref>
                <DropdownMenuItem>
                  <Code className="mr-2 h-4 w-4"/>
                  Analyze Code Quality
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

           {/* Sample Test Link */}
           <Link href="/tests/take/sample" className="hidden md:inline-block text-sm font-medium hover:text-accent transition-colors">
             Sample Test
          </Link>

           {/* Benchmarking (Disabled) */}
           <Button variant="ghost" disabled className="hidden lg:inline-flex text-sm font-medium hover:text-accent hover:bg-primary/10 px-2 py-1 h-auto md:px-3 md:py-1.5 opacity-50 cursor-not-allowed">
             <BarChart3 className="mr-2 h-4 w-4"/> Benchmarks
          </Button>
        </div>
      </nav>
    </header>
  );
}
