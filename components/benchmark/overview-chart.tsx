"use client";

import { useState, useMemo } from "react";
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
  chartKey,
  formatNs,
  formatN,
} from "@/lib/benchmark-utils";

const CHART_COLORS = [
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
  const cpuCounts = useMemo(() => getCpuCounts(benchmarks), [benchmarks]);
  const [cpuCount, setCpuCount] = useState(cpuCounts[0]?.toString() ?? "1");

  const data = useMemo(
    () => getOverviewChartData(benchmarks, Number(cpuCount)),
    [benchmarks, cpuCount],
  );

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    benchmarks.forEach((b, i) => {
      config[chartKey(b.Name)] = {
        label: b.Name,
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
    });
    return config;
  }, [benchmarks]);

  return (
    <div className="space-y-3">
      {/* CPU count selector */}
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
            scale="log"
            domain={["auto", "auto"]}
            allowDataOverflow
            tickFormatter={formatNs}
            label={{ value: "ns/op (log)", angle: -90, position: "insideLeft", offset: 5, style: { fill: "var(--color-muted-foreground)", fontSize: 12 } }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => `N = ${formatN(Number(value))}`}
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
          <ChartLegend content={<ChartLegendContent />} />
          {benchmarks.map((b, i) => (
            <Line
              key={b.Name}
              type="monotone"
              dataKey={chartKey(b.Name)}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
