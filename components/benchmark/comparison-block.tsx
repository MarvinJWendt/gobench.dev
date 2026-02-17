"use client";

import { useMemo, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCpuSelection } from "./cpu-selection-context";
import { useBehavior } from "./behavior-context";
import {
  getComparisons,
  cpuCountLabel,
  capitalize,
} from "@/lib/benchmark-utils";
import { ComparisonText } from "./comparison-text";
import type { Benchmark } from "@/lib/benchmarks";

interface ComparisonBlockProps {
  benchmarkName: string;
  benchmarks: Benchmark[];
}

/** Renders the "X is N× faster/slower than Y" card for all selected CPU counts. */
export function ComparisonBlock({
  benchmarkName,
  benchmarks,
}: ComparisonBlockProps) {
  const { selectedCpus } = useCpuSelection();
  const behaviorCtx = useBehavior();

  const sections = useMemo(() => {
    return selectedCpus.map((cpu) => {
      const label = cpuCountLabel(cpu);

      if (behaviorCtx) {
        // Multi-behavior: one sub-section per behavior
        const behaviorItems = behaviorCtx.behaviors.map((b) => ({
          label: capitalize(b),
          comparison: getComparisons(benchmarks, b, cpu).find(
            (c) => c.name === benchmarkName,
          ),
        }));
        return { cpu, label, behaviorItems, comparison: null };
      }

      // Single behavior
      const comparison = getComparisons(benchmarks, undefined, cpu).find(
        (c) => c.name === benchmarkName,
      );
      return { cpu, label, behaviorItems: null, comparison };
    });
  }, [benchmarkName, benchmarks, selectedCpus, behaviorCtx]);

  // Check if there's anything to render
  const hasContent = sections.some((s) => {
    if (s.comparison) return s.comparison.vs.length > 0;
    if (s.behaviorItems)
      return s.behaviorItems.some(
        (bi) => bi.comparison && bi.comparison.vs.length > 0,
      );
    return false;
  });

  if (!hasContent) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Comparisons — {benchmarkName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((s, i) => (
          <Fragment key={s.cpu}>
            {i > 0 && <div className="border-t" />}
            <div className="space-y-2">
              {/* CPU count label */}
              <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>

              {/* Single-behavior comparison */}
              {s.comparison && <ComparisonText comparison={s.comparison} />}

              {/* Multi-behavior comparisons */}
              {s.behaviorItems?.map((bi) => {
                if (!bi.comparison || bi.comparison.vs.length === 0)
                  return null;
                return (
                  <div key={bi.label}>
                    <p className="mb-1 ml-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {bi.label}
                    </p>
                    <ComparisonText comparison={bi.comparison} />
                  </div>
                );
              })}
            </div>
          </Fragment>
        ))}
      </CardContent>
    </Card>
  );
}
