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
  getVariationNames,
  hasMultipleBehaviors,
  sortByPerformance,
  getCpuCounts,
  slugify,
} from "@/lib/benchmark-utils";
import { highlightGo, renderDescription } from "@/lib/highlight";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewChart } from "@/components/benchmark/overview-chart";
import { DetailChart } from "@/components/benchmark/detail-chart";
import { CodeBlock } from "@/components/benchmark/code-block";
import { SummaryCard } from "@/components/benchmark/summary-card";
import { BehaviorProvider } from "@/components/benchmark/behavior-context";
import { BehaviorTabs } from "@/components/benchmark/behavior-tabs";
import { BehaviorSummaryCard } from "@/components/benchmark/behavior-summary-card";
import { BenchmarkSectionHeader } from "@/components/benchmark/benchmark-section-header";
import { MetricProvider } from "@/components/benchmark/metric-context";
import { CpuSelectionProvider } from "@/components/benchmark/cpu-selection-context";
import { CpuSelectionToggle } from "@/components/benchmark/cpu-selection-toggle";
import { ComparisonBlock } from "@/components/benchmark/comparison-block";
import { Contributors } from "@/components/benchmark/contributors";
import { SITE_URL, BASE_KEYWORDS } from "@/lib/seo";

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
  const meta = getBenchmarkMeta(slug);

  const title = `${group.Name} — Go Benchmark`;
  const description = `${group.Headline} Compare performance, memory allocation, and CPU scaling with interactive charts.`;
  const url = `${SITE_URL}/${slug}`;

  return {
    title,
    description,
    keywords: [
      ...BASE_KEYWORDS,
      ...meta.tags,
      `go ${group.Name.toLowerCase()}`,
    ],
    openGraph: {
      title: `${title} — gobench.dev`,
      description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — gobench.dev`,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function BenchmarkPage({ params }: PageProps) {
  const { slug } = await params;

  if (!getAllSlugs().includes(slug)) {
    notFound();
  }

  const group = getBenchmarkGroup(slug);
  const meta = getBenchmarkMeta(slug);
  const variationNames = getVariationNames(group.Benchmarks);
  const multiBehavior = hasMultipleBehaviors(group.Benchmarks);

  // Sort by the first behavior for consistent section ordering
  const sortVariation = multiBehavior ? variationNames[0] : undefined;
  const sortedBenchmarks = sortByPerformance(group.Benchmarks, sortVariation);

  // Available CPU counts for the selection toggle
  const cpuCounts = getCpuCounts(group.Benchmarks);

  // Pre-render descriptions and code blocks on the server
  const groupDescriptionHtml = await renderDescription(group.Description.trim());

  const highlightedCode = new Map<string, string>();
  const benchDescriptionHtml = new Map<string, string>();
  for (const bench of sortedBenchmarks) {
    if (bench.BenchmarkCode) {
      const code = group.Constants
        ? group.Constants.trimEnd() + "\n\n" + bench.BenchmarkCode
        : bench.BenchmarkCode;
      highlightedCode.set(bench.Name, await highlightGo(code));
    }
    if (bench.Description) {
      benchDescriptionHtml.set(
        bench.Name,
        await renderDescription(bench.Description.trim()),
      );
    }
  }

  // Shared page content from CPU toggle downward
  const pageContent = (
    <>
      {/* CPU selection toggle */}
      <section className="mt-8">
        <CpuSelectionToggle />
      </section>

      {/* Summary: fastest / slowest */}
      <section className="mt-4">
        {multiBehavior ? (
          <BehaviorSummaryCard benchmarks={group.Benchmarks} />
        ) : (
          <SummaryCard benchmarks={group.Benchmarks} />
        )}
      </section>

      {/* Overview comparison chart */}
      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {multiBehavior && <BehaviorTabs />}
            <OverviewChart benchmarks={sortedBenchmarks} />
          </CardContent>
        </Card>
      </section>

      <Separator className="mt-10" />

      {/* Individual benchmark sections */}
      <div className="mt-10 space-y-12">
        {sortedBenchmarks.map((bench, index) => {
          const html = highlightedCode.get(bench.Name);

          return (
            <section key={bench.Name} id={slugify(bench.Name)}>
              {/* Section heading with dynamic badges */}
              <BenchmarkSectionHeader
                benchmarkName={bench.Name}
                benchmarks={group.Benchmarks}
                index={multiBehavior ? undefined : index + 1}
              />

              {benchDescriptionHtml.has(bench.Name) && (
                <p
                  className="mb-6 text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: benchDescriptionHtml.get(bench.Name)!,
                  }}
                />
              )}

              {/* Detail chart */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">
                    {multiBehavior
                      ? `Performance — ${bench.Name}`
                      : `CPU Scaling — ${bench.Name}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {multiBehavior && <BehaviorTabs />}
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
              <ComparisonBlock
                benchmarkName={bench.Name}
                benchmarks={group.Benchmarks}
              />
            </section>
          );
        })}
      </div>
    </>
  );

  // JSON-LD structured data for the benchmark page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${group.Name} — Go Benchmark`,
    description: group.Headline,
    url: `${SITE_URL}/${slug}`,
    author: {
      "@type": "Person",
      name: "Marvin Wendt",
      url: "https://mjw.dev",
    },
    publisher: {
      "@type": "Organization",
      name: "gobench.dev",
      url: SITE_URL,
    },
    about: {
      "@type": "SoftwareSourceCode",
      programmingLanguage: "Go",
    },
    keywords: meta.tags.join(", "),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
        <h1 className="text-3xl font-bold tracking-tight">
          {group.Name}{" "}
          <span className="text-muted-foreground font-normal text-xl">
            — Go Benchmark
          </span>
        </h1>
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

        <p
          className="mt-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: groupDescriptionHtml }}
        />

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

      <CpuSelectionProvider cpuCounts={cpuCounts}>
        <MetricProvider>
          {multiBehavior ? (
            <BehaviorProvider behaviors={variationNames}>
              {pageContent}
            </BehaviorProvider>
          ) : (
            pageContent
          )}
        </MetricProvider>
      </CpuSelectionProvider>

      {/* Contributors */}
      <Contributors contributors={meta.contributors} />
    </div>
  );
}
