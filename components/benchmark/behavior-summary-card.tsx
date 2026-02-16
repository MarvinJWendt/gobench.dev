"use client";

import { useMemo } from "react";
import { Trophy, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useBehavior } from "./behavior-context";
import {
  getFastestAndSlowest,
  slugify,
  capitalize,
} from "@/lib/benchmark-utils";
import type { Benchmark } from "@/lib/benchmarks";

interface BehaviorSummaryCardProps {
  benchmarks: Benchmark[];
}

export function BehaviorSummaryCard({ benchmarks }: BehaviorSummaryCardProps) {
  const ctx = useBehavior();
  if (!ctx) return null;

  const { behaviors } = ctx;

  // Always show per-behavior fastest/slowest
  const summaries = useMemo(() => {
    return behaviors.map((b) => ({
      label: capitalize(b),
      ...getFastestAndSlowest(benchmarks, b),
    }));
  }, [benchmarks, behaviors]);

  return (
    <Card>
      <CardContent className="space-y-4">
        {summaries.map((s, i) => (
          <div
            key={s.label ?? "single"}
            className={`flex flex-col gap-4 sm:flex-row sm:gap-8 ${
              i > 0 ? "border-t pt-4" : ""
            }`}
          >
            {/* Behavior label for combined mode */}
            {s.label && (
              <div className="flex items-center sm:w-16">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </span>
              </div>
            )}

            {/* Fastest */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-400/10">
                <Trophy className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fastest</p>
                <a
                  href={`#${slugify(s.fastest)}`}
                  className="font-semibold text-green-400 link-underline"
                >
                  {s.fastest}
                </a>
              </div>
            </div>

            {/* Slowest */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Slowest</p>
                <a
                  href={`#${slugify(s.slowest)}`}
                  className="font-semibold text-destructive link-underline"
                >
                  {s.slowest}
                </a>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
