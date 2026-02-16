import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8 mx-auto">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2 font-bold">
            gobench.dev
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href="https://github.com/MarvinJWendt/gobench.dev"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <Button asChild variant="default" size="sm">
            <Link
              href="https://github.com/MarvinJWendt/gobench.dev/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noreferrer"
            >
              Contribute
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
