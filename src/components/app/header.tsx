import Link from 'next/link';
import { CheckCircle } from 'lucide-react'; // Example icon

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold hover:opacity-90 transition-opacity">
          <CheckCircle className="w-6 h-6 text-accent" />
          SkillCheck Pro
        </Link>
        <div className="space-x-4">
           <Link href="/tests/create" className="hover:text-accent transition-colors text-sm font-medium">
            Create Test
          </Link>
          <Link href="/analyze" className="hover:text-accent transition-colors text-sm font-medium">
            Analyze Answer
          </Link>
          <Link href="/tests/take/sample" className="hover:text-accent transition-colors text-sm font-medium">
            Sample Test
          </Link>
        </div>
      </nav>
    </header>
  );
}
