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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Benchmark } from "@/lib/benchmarks";
import {
  getDetailChartData,
  getCombinedDetailChartData,
  getCpuCounts,
  cpuKey,
  cpuLabel,
  chartKey,
  capitalize,
  METRICS,
  formatN,
} from "@/lib/benchmark-utils";
import { ScaleToggle, type ScaleType } from "@/components/benchmark/scale-toggle";
import { MetricToggle } from "@/components/benchmark/metric-toggle";
import { useBehavior } from "@/components/benchmark/behavior-context";
import { useMetric } from "@/components/benchmark/metric-context";
import { CHART_COLORS } from "@/components/benchmark/overview-chart";

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
  const behaviorCtx = useBehavior();

  // In combined mode, render the combined view
  if (behaviorCtx?.behavior === "combined") {
    return (
      <CombinedDetailChart
        benchmark={benchmark}
        behaviors={behaviorCtx.behaviors}
      />
    );
  }

  // For single behavior or standard benchmarks, filter variations
  const variationName = behaviorCtx?.behavior;

  return (
    <StandardDetailChart benchmark={benchmark} variationName={variationName} />
  );
}

// Standard detail chart: one line per CPU count
function StandardDetailChart({
  benchmark,
  variationName,
}: {
  benchmark: Benchmark;
  variationName?: string;
}) {
  const { metric } = useMetric();
  const metricCfg = METRICS[metric];

  const data = useMemo(
    () => getDetailChartData(benchmark, variationName, metricCfg.field),
    [benchmark, variationName, metricCfg.field],
  );
  const cpuCounts = useMemo(() => {
    const variations = variationName
      ? benchmark.Variations.filter((v) => v.Name === variationName)
      : benchmark.Variations;
    const s = new Set<number>();
    for (const v of variations) s.add(v.CPUCount);
    return [...s].sort((a, b) => a - b);
  }, [benchmark, variationName]);
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

  const yLabel = scale === "log" ? metricCfg.yAxisLogLabel : metricCfg.yAxisLabel;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <MetricToggle />
        <ScaleToggle value={scale} onChange={setScale} />
      </div>

      <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="N"
            tickFormatter={formatN}
            label={{
              value: "Iterations (N)",
              position: "insideBottom",
              offset: -2,
              style: { fill: "var(--color-muted-foreground)", fontSize: 12 },
            }}
          />
          <YAxis
            scale={scale}
            domain={scale === "log" ? ["auto", "auto"] : undefined}
            allowDataOverflow={scale === "log"}
            tickFormatter={metricCfg.format}
            label={{
              value: yLabel,
              angle: -90,
              position: "insideLeft",
              offset: 5,
              style: { fill: "var(--color-muted-foreground)", fontSize: 12 },
            }}
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
                      {metricCfg.format(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <ChartLegend
            content={
              <ChartLegendContent
                hiddenKeys={hiddenKeys}
                onToggle={toggleKey}
              />
            }
          />
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

// Combined detail chart: one line per behavior at a selected CPU count
function CombinedDetailChart({
  benchmark,
  behaviors,
}: {
  benchmark: Benchmark;
  behaviors: string[];
}) {
  const { metric } = useMetric();
  const metricCfg = METRICS[metric];

  const cpuCounts = useMemo(() => getCpuCounts([benchmark]), [benchmark]);
  const [cpuCount, setCpuCount] = useState(cpuCounts[0]?.toString() ?? "1");
  const [scale, setScale] = useState<ScaleType>("log");

  const data = useMemo(
    () =>
      getCombinedDetailChartData(benchmark, Number(cpuCount), metricCfg.field),
    [benchmark, cpuCount, metricCfg.field],
  );

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    behaviors.forEach((name, i) => {
      config[chartKey(name)] = {
        label: capitalize(name),
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
    });
    return config;
  }, [behaviors]);

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

  const yLabel = scale === "log" ? metricCfg.yAxisLogLabel : metricCfg.yAxisLabel;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <MetricToggle />
        <ScaleToggle value={scale} onChange={setScale} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">CPU:</span>
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
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="N"
            tickFormatter={formatN}
            label={{
              value: "Iterations (N)",
              position: "insideBottom",
              offset: -2,
              style: { fill: "var(--color-muted-foreground)", fontSize: 12 },
            }}
          />
          <YAxis
            scale={scale}
            domain={scale === "log" ? ["auto", "auto"] : undefined}
            allowDataOverflow={scale === "log"}
            tickFormatter={metricCfg.format}
            label={{
              value: yLabel,
              angle: -90,
              position: "insideLeft",
              offset: 5,
              style: { fill: "var(--color-muted-foreground)", fontSize: 12 },
            }}
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
                      {metricCfg.format(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <ChartLegend
            content={
              <ChartLegendContent
                hiddenKeys={hiddenKeys}
                onToggle={toggleKey}
              />
            }
          />
          {behaviors.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={chartKey(name)}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              hide={hiddenKeys.has(chartKey(name))}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
