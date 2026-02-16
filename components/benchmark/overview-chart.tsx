"use client";

import { useState, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Benchmark } from "@/lib/benchmarks";
import {
  getOverviewChartData,
  getCpuCounts,
  getCombinedBenchmarks,
  filterBenchmarkVariations,
  chartKey,
  formatNs,
  formatN,
} from "@/lib/benchmark-utils";
import { ScaleToggle, type ScaleType } from "@/components/benchmark/scale-toggle";
import { useBehavior } from "@/components/benchmark/behavior-context";

export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

interface OverviewChartProps {
  benchmarks: Benchmark[];
}

export function OverviewChart({ benchmarks }: OverviewChartProps) {
  const behaviorCtx = useBehavior();

  // Filter benchmarks based on active behavior
  const displayBenchmarks = useMemo(() => {
    if (!behaviorCtx) return benchmarks;

    if (behaviorCtx.behavior === "combined") {
      return getCombinedBenchmarks(benchmarks, behaviorCtx.behaviors);
    }

    return benchmarks.map((b) =>
      filterBenchmarkVariations(b, behaviorCtx.behavior),
    );
  }, [benchmarks, behaviorCtx]);

  const cpuCounts = useMemo(
    () => getCpuCounts(displayBenchmarks),
    [displayBenchmarks],
  );
  const [cpuCount, setCpuCount] = useState(cpuCounts[0]?.toString() ?? "1");
  const [scale, setScale] = useState<ScaleType>("log");

  const data = useMemo(
    () => getOverviewChartData(displayBenchmarks, Number(cpuCount)),
    [displayBenchmarks, cpuCount],
  );

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    displayBenchmarks.forEach((b, i) => {
      config[chartKey(b.Name)] = {
        label: b.Name,
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
    });
    return config;
  }, [displayBenchmarks]);

  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  const toggleKey = useCallback((key: string) => {
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">CPU Cores:</span>
          <ToggleGroup
            type="single"
            value={cpuCount}
            onValueChange={(v) => {
              if (v) setCpuCount(v);
            }}
            variant="outline"
            size="sm"
          >
            {cpuCounts.map((c) => (
              <ToggleGroupItem key={c} value={c.toString()}>
                {c}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <ScaleToggle value={scale} onChange={setScale} />
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="N"
            tickFormatter={formatN}
            label={{ value: "Iterations (N)", position: "insideBottom", offset: -2, style: { fill: "var(--color-muted-foreground)", fontSize: 12 } }}
          />
          <YAxis
            scale={scale}
            domain={scale === "log" ? ["auto", "auto"] : undefined}
            allowDataOverflow={scale === "log"}
            tickFormatter={formatNs}
            label={{ value: scale === "log" ? "ns/op (log)" : "ns/op", angle: -90, position: "insideLeft", offset: 5, style: { fill: "var(--color-muted-foreground)", fontSize: 12 } }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_value, payload) => {
                  const n = payload?.[0]?.payload?.N;
                  return `N = ${n != null ? formatN(n) : "—"}`;
                }}
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      {chartConfig[String(name)]?.label ?? name}
                    </span>
                    <span className="font-mono font-medium tabular-nums">
                      {formatNs(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent hiddenKeys={hiddenKeys} onToggle={toggleKey} />} />
          {displayBenchmarks.map((b, i) => (
            <Line
              key={b.Name}
              type="monotone"
              dataKey={chartKey(b.Name)}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              hide={hiddenKeys.has(chartKey(b.Name))}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
