"use client";

import { useMemo } from "react";
import { Trophy, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useBehavior } from "./behavior-context";
import {
  getFastestAndSlowest,
  slugify,
  capitalize,
  type FastSlow,
} from "@/lib/benchmark-utils";
import type { Benchmark } from "@/lib/benchmarks";

interface BehaviorSummaryCardProps {
  benchmarks: Benchmark[];
  maxCpu: number;
}

export function BehaviorSummaryCard({
  benchmarks,
  maxCpu,
}: BehaviorSummaryCardProps) {
  const ctx = useBehavior();
  if (!ctx) return null;

  const { behaviors } = ctx;
  const showMulti = maxCpu > 1;

  const summaries = useMemo(() => {
    return behaviors.map((b) => ({
      label: capitalize(b),
      single: getFastestAndSlowest(benchmarks, b, 1),
      multi: getFastestAndSlowest(benchmarks, b, maxCpu),
    }));
  }, [benchmarks, behaviors, maxCpu]);

  return (
    <Card>
      <CardContent className="space-y-4">
        {/* Single-core section */}
        <CpuSection
          label="Single-core"
          summaries={summaries.map((s) => ({
            label: s.label,
            data: s.single,
          }))}
        />

        {/* Multi-core section */}
        {showMulti && (
          <>
            <div className="border-t" />
            <CpuSection
              label={`Multi-core · ${maxCpu} CPUs`}
              summaries={summaries.map((s) => ({
                label: s.label,
                data: s.multi,
              }))}
            />
          </>
        )}
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

      {summaries.map((s, i) => (
        <div
          key={s.label}
          className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8 ${
            i > 0 ? "border-t border-dashed pt-3" : ""
          }`}
        >
          {/* Behavior label */}
          <div className="flex items-center sm:w-16">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {s.label}
            </span>
          </div>

          {/* Fastest */}
          <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-3">
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
        </div>
      ))}
    </div>
  );
}
