import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Zap, GitPullRequest } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b border-border/60 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/50 sticky top-0 z-50">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8 mx-auto">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-bold text-lg transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            <Zap className="h-4 w-4" />
          </div>
          <span className="bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            gobench.dev
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link
              href="https://github.com/MarvinJWendt/gobench.dev"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>

          <Separator orientation="vertical" className="mx-1.5 h-5" />

          <Button size="sm" className="rounded-full px-4" asChild>
            <Link
              href="https://github.com/MarvinJWendt/gobench.dev/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noreferrer"
            >
              <GitPullRequest className="mr-1.5 h-3.5 w-3.5" />
              Contribute
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
