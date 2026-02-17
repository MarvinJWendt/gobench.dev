"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useBehavior } from "./behavior-context";
import {
  getFastestAndSlowest,
  getBadges,
  sortByPerformance,
  capitalize,
} from "@/lib/benchmark-utils";
import type { Benchmark } from "@/lib/benchmarks";

interface BenchmarkSectionHeaderProps {
  benchmarkName: string;
  benchmarks: Benchmark[];
  maxCpu: number;
}

export function BenchmarkSectionHeader({
  benchmarkName,
  benchmarks,
  maxCpu,
}: BenchmarkSectionHeaderProps) {
  const ctx = useBehavior();

  const { rank, badges } = useMemo(() => {
    if (!ctx) return { rank: 0, badges: [] as { isFastest: boolean; label: string }[] };

    if (ctx.behavior === "combined") {
      // Show per-behavior badges with single/multi awareness
      const badgeList: { isFastest: boolean; label: string }[] = [];
      for (const b of ctx.behaviors) {
        const single = getFastestAndSlowest(benchmarks, b, 1);
        const multi = getFastestAndSlowest(benchmarks, b, maxCpu);
        const identical =
          single.fastest === multi.fastest && single.slowest === multi.slowest;

        if (identical) {
          if (benchmarkName === single.fastest)
            badgeList.push({ isFastest: true, label: `Fastest (${capitalize(b)})` });
          if (benchmarkName === single.slowest)
            badgeList.push({ isFastest: false, label: `Slowest (${capitalize(b)})` });
        } else {
          if (benchmarkName === single.fastest)
            badgeList.push({ isFastest: true, label: `Fastest (${capitalize(b)}, Single)` });
          if (benchmarkName === multi.fastest)
            badgeList.push({ isFastest: true, label: `Fastest (${capitalize(b)}, Multi)` });
          if (benchmarkName === single.slowest)
            badgeList.push({ isFastest: false, label: `Slowest (${capitalize(b)}, Single)` });
          if (benchmarkName === multi.slowest)
            badgeList.push({ isFastest: false, label: `Slowest (${capitalize(b)}, Multi)` });
        }
      }
      return { rank: 0, badges: badgeList };
    }

    // Single behavior: rank + single/multi badges
    const sorted = sortByPerformance(benchmarks, ctx.behavior);
    const r = sorted.findIndex((b) => b.Name === benchmarkName) + 1;
    const single = getFastestAndSlowest(benchmarks, ctx.behavior, 1);
    const multi = getFastestAndSlowest(benchmarks, ctx.behavior, maxCpu);
    return { rank: r, badges: getBadges(benchmarkName, single, multi) };
  }, [benchmarkName, benchmarks, ctx, maxCpu]);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
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
            badge.isFastest
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
