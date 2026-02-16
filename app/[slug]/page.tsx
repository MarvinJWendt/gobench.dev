import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Cpu, Monitor, Box } from "lucide-react";
import {
  getAllSlugs,
  getBenchmarkGroup,
  getBenchmarkMeta,
} from "@/lib/benchmarks";
import {
  getFastestAndSlowest,
  getComparisons,
  sortByPerformance,
  slugify,
} from "@/lib/benchmark-utils";
import { highlightGo } from "@/lib/highlight";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewChart } from "@/components/benchmark/overview-chart";
import { DetailChart } from "@/components/benchmark/detail-chart";
import { CodeBlock } from "@/components/benchmark/code-block";
import { ComparisonText } from "@/components/benchmark/comparison-text";
import { SummaryCard } from "@/components/benchmark/summary-card";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const group = getBenchmarkGroup(slug);

  return {
    title: `${group.Name} – gobench.dev`,
    description: group.Headline,
  };
}

export default async function BenchmarkPage({ params }: PageProps) {
  const { slug } = await params;

  if (!getAllSlugs().includes(slug)) {
    notFound();
  }

  const group = getBenchmarkGroup(slug);
  const meta = getBenchmarkMeta(slug);
  const { fastest, slowest } = getFastestAndSlowest(group.Benchmarks);
  const comparisons = getComparisons(group.Benchmarks);
  const sortedBenchmarks = sortByPerformance(group.Benchmarks);

  // Pre-highlight all code blocks on the server
  const highlightedCode = new Map<string, string>();
  for (const bench of sortedBenchmarks) {
    if (bench.BenchmarkCode) {
      highlightedCode.set(bench.Name, await highlightGo(bench.BenchmarkCode));
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-16">
      {/* Back link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground link-underline hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All Benchmarks
      </Link>

      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{group.Name}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{group.Headline}</p>

        {meta.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {meta.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <p className="mt-4 leading-relaxed">{group.Description.trim()}</p>

        {/* System info */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Monitor className="h-3.5 w-3.5" />
            {group.System.GoOS}/{group.System.GoArch}
          </span>
          <span className="inline-flex items-center gap-1">
            <Cpu className="h-3.5 w-3.5" />
            {group.System.CPU}
          </span>
          <a
            href={`https://github.com/MarvinJWendt/gobench.dev/tree/main/${group.System.Pkg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 link-underline hover:text-primary"
          >
            <Box className="h-3.5 w-3.5" />
            {group.System.Pkg}
          </a>
        </div>
      </header>

      <Separator />

      {/* Summary: fastest / slowest */}
      <section className="mt-8">
        <SummaryCard fastest={fastest} slowest={slowest} />
      </section>

      {/* Overview comparison chart */}
      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <OverviewChart benchmarks={sortedBenchmarks} />
          </CardContent>
        </Card>
      </section>

      <Separator className="mt-10" />

      {/* Individual benchmark sections */}
      <div className="mt-10 space-y-12">
        {sortedBenchmarks.map((bench, index) => {
          const comparison = comparisons.find((c) => c.name === bench.Name);
          const html = highlightedCode.get(bench.Name);

          return (
            <section key={bench.Name} id={slugify(bench.Name)}>
              {/* Section heading */}
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                  {index + 1}
                </span>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {bench.Name}
                </h2>
                {bench.Name === fastest && (
                  <Badge variant="default" className="bg-green-400/15 text-green-400 border-green-400/25">
                    Fastest
                  </Badge>
                )}
                {bench.Name === slowest && (
                  <Badge variant="default" className="bg-destructive/15 text-destructive border-destructive/25">
                    Slowest
                  </Badge>
                )}
              </div>

              {bench.Description && (
                <p className="mb-6 text-muted-foreground">
                  {bench.Description.trim()}
                </p>
              )}

              {/* Detail chart: CPU scaling */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">
                    CPU Scaling — {bench.Name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DetailChart benchmark={bench} />
                </CardContent>
              </Card>

              {/* Source code */}
              {html && (
                <div className="mb-6">
                  <CodeBlock
                    highlightedHtml={html}
                    title={`Benchmark Code — ${bench.Name}`}
                  />
                </div>
              )}

              {/* Comparison text */}
              {comparison && (
                <div className="rounded-lg border bg-secondary/30 px-4 py-3">
                  <ComparisonText comparison={comparison} />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
