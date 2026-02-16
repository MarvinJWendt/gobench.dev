import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllSlugs,
  getBenchmarkGroup,
  getBenchmarkMeta,
} from "@/lib/benchmarks";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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

  // Validate slug exists
  if (!getAllSlugs().includes(slug)) {
    notFound();
  }

  const group = getBenchmarkGroup(slug);
  const meta = getBenchmarkMeta(slug);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
      <header className="mb-8">
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
      </header>

      <Separator />

      {/* Individual benchmarks */}
      <section className="mt-8 space-y-8">
        {group.Benchmarks.map((bench) => (
          <div key={bench.Name}>
            <h2 className="text-xl font-semibold">{bench.Name}</h2>
            {bench.Description && (
              <p className="mt-1 text-muted-foreground">
                {bench.Description.trim()}
              </p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
