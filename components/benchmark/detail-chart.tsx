"use client";

import { useMemo, useState, useCallback } from "react";
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
import type { Benchmark } from "@/lib/benchmarks";
import {
  getDetailChartData,
  getCpuCounts,
  cpuKey,
  cpuLabel,
  formatNs,
  formatN,
} from "@/lib/benchmark-utils";
import { ScaleToggle, type ScaleType } from "@/components/benchmark/scale-toggle";

const CPU_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-primary)",
];

interface DetailChartProps {
  benchmark: Benchmark;
}

export function DetailChart({ benchmark }: DetailChartProps) {
  const data = useMemo(() => getDetailChartData(benchmark), [benchmark]);
  const cpuCounts = useMemo(() => getCpuCounts([benchmark]), [benchmark]);
  const [scale, setScale] = useState<ScaleType>("log");

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    cpuCounts.forEach((cpu, i) => {
      config[cpuKey(cpu)] = {
        label: cpuLabel(cpu),
        color: CPU_COLORS[i % CPU_COLORS.length],
      };
    });
    return config;
  }, [cpuCounts]);

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
      <ScaleToggle value={scale} onChange={setScale} />
      <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
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
        {cpuCounts.map((cpu, i) => (
          <Line
            key={cpu}
            type="monotone"
            dataKey={cpuKey(cpu)}
            stroke={CPU_COLORS[i % CPU_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            hide={hiddenKeys.has(cpuKey(cpu))}
          />
        ))}
      </LineChart>
    </ChartContainer>
    </div>
  );
}
