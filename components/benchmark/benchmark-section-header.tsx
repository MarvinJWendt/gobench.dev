"use client";

import { useMemo, Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { useBehavior } from "./behavior-context";
import {
  getFastestAndSlowest,
  sortByPerformance,
  capitalize,
} from "@/lib/benchmark-utils";
import type { Benchmark } from "@/lib/benchmarks";

interface BenchmarkSectionHeaderProps {
  benchmarkName: string;
  benchmarks: Benchmark[];
}

export function BenchmarkSectionHeader({
  benchmarkName,
  benchmarks,
}: BenchmarkSectionHeaderProps) {
  const ctx = useBehavior();

  const { rank, badges } = useMemo(() => {
    if (!ctx) return { rank: 0, badges: [] as { fastest: boolean; label: string }[] };

    if (ctx.behavior === "combined") {
      // Show per-behavior badges, no rank
      const badgeList: { fastest: boolean; label: string }[] = [];
      for (const b of ctx.behaviors) {
        const { fastest, slowest } = getFastestAndSlowest(benchmarks, b);
        if (benchmarkName === fastest)
          badgeList.push({ fastest: true, label: `Fastest (${capitalize(b)})` });
        if (benchmarkName === slowest)
          badgeList.push({ fastest: false, label: `Slowest (${capitalize(b)})` });
      }
      return { rank: 0, badges: badgeList };
    }

    // Single behavior: rank + fastest/slowest badges
    const sorted = sortByPerformance(benchmarks, ctx.behavior);
    const r = sorted.findIndex((b) => b.Name === benchmarkName) + 1;
    const { fastest, slowest } = getFastestAndSlowest(benchmarks, ctx.behavior);
    const badgeList: { fastest: boolean; label: string }[] = [];
    if (benchmarkName === fastest)
      badgeList.push({ fastest: true, label: "Fastest" });
    if (benchmarkName === slowest)
      badgeList.push({ fastest: false, label: "Slowest" });
    return { rank: r, badges: badgeList };
  }, [benchmarkName, benchmarks, ctx]);

  return (
    <div className="mb-4 flex items-center gap-3">
      {rank > 0 && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
          {rank}
        </span>
      )}
      <h2 className="text-2xl font-semibold tracking-tight">{benchmarkName}</h2>
      {badges.map((badge) => (
        <Badge
          key={badge.label}
          variant="default"
          className={
            badge.fastest
              ? "bg-green-400/15 text-green-400 border-green-400/25"
              : "bg-destructive/15 text-destructive border-destructive/25"
          }
        >
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}
