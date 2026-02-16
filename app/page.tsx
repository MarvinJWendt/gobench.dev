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

export default function Home() {
  const benchmarks = getAllBenchmarkSummaries();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">gobench.dev</h1>
        <p className="mt-2 text-muted-foreground">
          Compare the speed of different ways to do the same thing in Go.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {benchmarks.map((b) => (
          <Link key={b.slug} href={`/${b.slug}`}>
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <CardTitle>{b.name}</CardTitle>
                <CardDescription>{b.headline}</CardDescription>
              </CardHeader>
              {b.tags.length > 0 && (
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {b.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
