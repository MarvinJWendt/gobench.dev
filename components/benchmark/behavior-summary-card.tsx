"use client";

import { useMemo, Fragment } from "react";
import { Trophy, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useBehavior } from "./behavior-context";
import { useCpuSelection } from "./cpu-selection-context";
import {
  getFastestAndSlowest,
  cpuCountLabel,
  slugify,
  capitalize,
  type FastSlow,
} from "@/lib/benchmark-utils";
import type { Benchmark } from "@/lib/benchmarks";

interface BehaviorSummaryCardProps {
  benchmarks: Benchmark[];
}

export function BehaviorSummaryCard({ benchmarks }: BehaviorSummaryCardProps) {
  const ctx = useBehavior();
  const { selectedCpus } = useCpuSelection();
  if (!ctx) return null;

  const { behaviors } = ctx;

  const sections = useMemo(
    () =>
      selectedCpus.map((cpu) => ({
        cpu,
        label: cpuCountLabel(cpu),
        summaries: behaviors.map((b) => ({
          label: capitalize(b),
          data: getFastestAndSlowest(benchmarks, b, cpu),
        })),
      })),
    [benchmarks, behaviors, selectedCpus],
  );

  return (
    <Card>
      <CardContent className="space-y-4">
        {sections.map((section, i) => (
          <Fragment key={section.cpu}>
            {i > 0 && <div className="border-t" />}
            <CpuSection label={section.label} summaries={section.summaries} />
          </Fragment>
        ))}
      </CardContent>
    </Card>
  );
}

function CpuSection({
  label,
  summaries,
}: {
  label: string;
  summaries: { label: string; data: FastSlow }[];
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-x-8">
        {summaries.map((s, i) => (
          <Fragment key={s.label}>
            {/* Behavior label */}
            <span
              className={`text-xs font-medium uppercase tracking-wide text-muted-foreground py-3 ${
                i > 0 ? "border-t border-dashed" : ""
              }`}
            >
              {s.label}
            </span>

            {/* Fastest */}
            <div
              className={`flex items-center gap-3 py-3 ${
                i > 0 ? "border-t border-dashed" : ""
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-400/10">
                <Trophy className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fastest</p>
                <a
                  href={`#${slugify(s.data.fastest)}`}
                  className="font-semibold text-green-400 link-underline"
                >
                  {s.data.fastest}
                </a>
              </div>
            </div>

            {/* Slowest */}
            <div
              className={`flex items-center gap-3 py-3 ${
                i > 0 ? "border-t border-dashed" : ""
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Slowest</p>
                <a
                  href={`#${slugify(s.data.slowest)}`}
                  className="font-semibold text-destructive link-underline"
                >
                  {s.data.slowest}
                </a>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
