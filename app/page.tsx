import Link from "next/link";
import { getAllBenchmarkSummaries } from "@/lib/benchmarks";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Zap,
  BarChart2,
  Code2,
  Cpu,
  ArrowRight,
  GitPullRequest
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "gobench.dev | High Performance Go Benchmarks",
  description: "Discover the fastest way to write Go code. Compare performance, memory allocation, and CPU usage of common Go patterns.",
  keywords: ["go", "golang", "benchmark", "performance", "optimization", "cpu", "memory", "allocation"],
  openGraph: {
    title: "gobench.dev | High Performance Go Benchmarks",
    description: "Discover the fastest way to write Go code. Compare performance, memory allocation, and CPU usage of common Go patterns.",
    type: "website",
  },
};

export default function Home() {
  const isDev = process.env.NODE_ENV === "development";
  const benchmarks = getAllBenchmarkSummaries().filter(
    (b) => isDev || !b.hidden,
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-16 px-6">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-40"></div>
        <div className="mx-auto max-w-5xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground pb-2">
            Write Faster Go Code.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
            Stop guessing. Start measuring. Compare the performance, memory allocation,
            and CPU efficiency of different Go implementation patterns.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
             <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="#benchmarks">
                Explore Benchmarks <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link href="https://github.com/MarvinJWendt/gobench.dev" target="_blank">
                <GitPullRequest className="mr-2 h-4 w-4" /> Contribute
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-6xl px-6 grid gap-8 md:grid-cols-3">
          <div className="bg-background/50 p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-colors">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Performance Focused</h3>
            <p className="text-muted-foreground">
              Detailed breakdown of nanoseconds per operation, memory allocations, and throughput.
            </p>
          </div>
          <div className="bg-background/50 p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-colors">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-primary">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-world Patterns</h3>
            <p className="text-muted-foreground">
              Benchmarks based on common scenarios developers face daily, not just theoretical loops.
            </p>
          </div>
          <div className="bg-background/50 p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-colors">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-primary">
              <BarChart2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Data Driven</h3>
            <p className="text-muted-foreground">
              Objective data generated from standard Go benchmarks running on consistent hardware.
            </p>
          </div>
        </div>
      </section>

      {/* Benchmarks Grid */}
      <section id="benchmarks" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/10 -z-10" />
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-4">
            <div className="space-y-2">
               <h2 className="text-4xl font-extrabold tracking-tight">Benchmarks</h2>
               <p className="text-lg text-muted-foreground max-w-2xl">
                 Explore our growing collection of performance comparisons.
                 Data-driven insights to help you write more efficient Go code.
               </p>
            </div>
            <Button size="lg" className="rounded-full hidden sm:flex" asChild>
              <Link href="https://github.com/MarvinJWendt/gobench.dev/issues/new" target="_blank">
                Request a Benchmark <ArrowRight className="ml-2 h-4 w-4"/>
              </Link>
            </Button>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {benchmarks.map((b) => (
            <Link key={b.slug} href={`/${b.slug}`} className="group h-full no-underline">
              <Card className="h-full hover:shadow-xl hover:border-primary transition-all duration-300 group-hover:-translate-y-1 bg-card border-muted-foreground/10">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">{b.name}</CardTitle>
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Cpu className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardDescription className="line-clamp-4 pt-3 text-base">{b.headline}</CardDescription>
                </CardHeader>
                {b.tags.length > 0 && (
                  <CardContent className="mt-auto pt-0">
                    <div className="flex flex-wrap gap-2">
                      {b.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm font-medium bg-secondary/50 hover:bg-secondary">
                          {tag}
                        </Badge>
                      ))}
                      {b.tags.length > 4 && (
                        <span className="text-xs text-muted-foreground self-center px-2">+{b.tags.length - 4}</span>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
        </div>
      </section>
    </div>
  );
}
