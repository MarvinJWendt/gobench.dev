"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useBehavior } from "./behavior-context";
import { useCpuSelection } from "./cpu-selection-context";
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
  /** Explicit 1-based rank (used for non-multi-behavior pages). */
  index?: number;
}

export function BenchmarkSectionHeader({
  benchmarkName,
  benchmarks,
  index,
}: BenchmarkSectionHeaderProps) {
  const behaviorCtx = useBehavior();
  const { selectedCpus } = useCpuSelection();

  const { rank, badges } = useMemo(() => {
    // Multi-behavior, combined view: per-behavior badges
    if (behaviorCtx?.behavior === "combined") {
      const badgeList: { isFastest: boolean; label: string }[] = [];
      for (const b of behaviorCtx.behaviors) {
        const results = selectedCpus.map((cpu) => ({
          cpu,
          data: getFastestAndSlowest(benchmarks, b, cpu),
        }));
        badgeList.push(...getBadges(benchmarkName, results, capitalize(b)));
      }
      return { rank: 0, badges: badgeList };
    }

    // Multi-behavior single view or non-multi-behavior
    const variationName = behaviorCtx?.behavior;
    const sorted = sortByPerformance(benchmarks, variationName);
    const r = behaviorCtx
      ? sorted.findIndex((b) => b.Name === benchmarkName) + 1
      : 0;

    const results = selectedCpus.map((cpu) => ({
      cpu,
      data: getFastestAndSlowest(benchmarks, variationName, cpu),
    }));

    return {
      rank: r || (index ?? 0),
      badges: getBadges(benchmarkName, results),
    };
  }, [benchmarkName, benchmarks, behaviorCtx, selectedCpus, index]);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {rank > 0 && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
          {rank}
        </span>
      )}
      <h2 className="text-2xl font-semibold tracking-tight">
        {benchmarkName}
      </h2>
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
