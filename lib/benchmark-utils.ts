import type { Benchmark } from "./benchmarks";

// --- Behavior detection ---

/** Get unique variation names (behavior types) from benchmarks, sorted alphabetically. */
export function getVariationNames(benchmarks: Benchmark[]): string[] {
  const names = new Set<string>();
  for (const b of benchmarks) {
    for (const v of b.Variations) names.add(v.Name);
  }
  return [...names].sort();
}

/** Check if benchmarks have multiple distinct behaviors (not just "run"). */
export function hasMultipleBehaviors(benchmarks: Benchmark[]): boolean {
  return getVariationNames(benchmarks).length > 1;
}

/** Return a copy of the benchmark with only variations matching the given name. */
export function filterBenchmarkVariations(
  benchmark: Benchmark,
  variationName: string,
): Benchmark {
  return {
    ...benchmark,
    Variations: benchmark.Variations.filter((v) => v.Name === variationName),
  };
}

/** Create virtual benchmarks for the combined view: each (implementation, behavior) becomes its own benchmark. */
export function getCombinedBenchmarks(
  benchmarks: Benchmark[],
  variationNames: string[],
): Benchmark[] {
  const result: Benchmark[] = [];
  for (const b of benchmarks) {
    for (const name of variationNames) {
      const filtered = b.Variations.filter((v) => v.Name === name);
      if (filtered.length > 0) {
        result.push({
          ...b,
          Name: `${b.Name} (${name})`,
          Variations: filtered,
        });
      }
    }
  }
  return result;
}

/** Capitalize the first letter of a string. */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --- Chart data transforms ---

export interface OverviewDataPoint {
  N: number;
  [benchmarkName: string]: number;
}

/** Sanitize a name for use as a CSS-safe chart data key. */
export function chartKey(name: string): string {
  return name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
}

/** Transforms benchmark variations into Recharts-ready data for the overview comparison chart. */
export function getOverviewChartData(
  benchmarks: Benchmark[],
  cpuCount: number,
  variationName?: string,
): OverviewDataPoint[] {
  // Collect all unique N values
  const nValues = new Set<number>();
  for (const b of benchmarks) {
    for (const v of b.Variations) {
      if (v.CPUCount === cpuCount && (!variationName || v.Name === variationName))
        nValues.add(v.N);
    }
  }

  const sorted = [...nValues].sort((a, b) => a - b);

  return sorted.map((n) => {
    const point: OverviewDataPoint = { N: n };
    for (const b of benchmarks) {
      const v = b.Variations.find(
        (v) =>
          v.N === n &&
          v.CPUCount === cpuCount &&
          (!variationName || v.Name === variationName),
      );
      if (v) point[chartKey(b.Name)] = v.NsPerOp;
    }
    return point;
  });
}

export interface DetailDataPoint {
  N: number;
  [cpuLabel: string]: number;
}

/** Transforms one benchmark's variations into Recharts-ready data (one line per CPU count). */
export function getDetailChartData(
  benchmark: Benchmark,
  variationName?: string,
): DetailDataPoint[] {
  const variations = variationName
    ? benchmark.Variations.filter((v) => v.Name === variationName)
    : benchmark.Variations;

  const nValues = new Set<number>();
  const cpuCounts = new Set<number>();

  for (const v of variations) {
    nValues.add(v.N);
    cpuCounts.add(v.CPUCount);
  }

  const sorted = [...nValues].sort((a, b) => a - b);

  return sorted.map((n) => {
    const point: DetailDataPoint = { N: n };
    for (const cpu of [...cpuCounts].sort((a, b) => a - b)) {
      const v = variations.find((v) => v.N === n && v.CPUCount === cpu);
      if (v) point[cpuKey(cpu)] = v.NsPerOp;
    }
    return point;
  });
}

/** Transforms one benchmark's variations into Recharts data for combined mode (one line per behavior at a given CPU count). */
export function getCombinedDetailChartData(
  benchmark: Benchmark,
  cpuCount: number,
): DetailDataPoint[] {
  const nValues = new Set<number>();
  for (const v of benchmark.Variations) {
    if (v.CPUCount === cpuCount) nValues.add(v.N);
  }

  const sorted = [...nValues].sort((a, b) => a - b);

  return sorted.map((n) => {
    const point: DetailDataPoint = { N: n };
    for (const v of benchmark.Variations) {
      if (v.N === n && v.CPUCount === cpuCount) {
        point[chartKey(v.Name)] = v.NsPerOp;
      }
    }
    return point;
  });
}

/** Returns all unique CPU counts from a set of benchmarks. */
export function getCpuCounts(benchmarks: Benchmark[]): number[] {
  const s = new Set<number>();
  for (const b of benchmarks) {
    for (const v of b.Variations) s.add(v.CPUCount);
  }
  return [...s].sort((a, b) => a - b);
}

/** CSS-safe key for a CPU count. */
export function cpuKey(cpu: number): string {
  return `cpu_${cpu}`;
}

/** Display label for a CPU count. */
export function cpuLabel(cpu: number): string {
  return `${cpu} CPU${cpu > 1 ? "s" : ""}`;
}

// --- Comparison math ---

/** Average NsPerOp for a benchmark at a given CPU count, optionally filtered by variation name. */
export function getMeanNsPerOp(
  benchmark: Benchmark,
  cpuCount: number,
  variationName?: string,
): number {
  let vars = benchmark.Variations.filter((v) => v.CPUCount === cpuCount);
  if (variationName) vars = vars.filter((v) => v.Name === variationName);
  if (vars.length === 0) return 0;
  return vars.reduce((sum, v) => sum + v.NsPerOp, 0) / vars.length;
}

export interface ComparisonEntry {
  other: string;
  ratio: number; // e.g. 2.1 means "2.1x"
  percentage: number; // e.g. 110 means "110%"
  faster: boolean;
}

export interface BenchmarkComparisons {
  name: string;
  meanNsPerOp: number;
  vs: ComparisonEntry[];
}

/** Computes comparison data for each benchmark against every other, optionally for a specific behavior. */
export function getComparisons(
  benchmarks: Benchmark[],
  variationName?: string,
): BenchmarkComparisons[] {
  return benchmarks.map((b) => {
    const myMean = getMeanNsPerOp(b, 1, variationName);

    const vs: ComparisonEntry[] = benchmarks
      .filter((other) => other.Name !== b.Name)
      .map((other) => {
        const otherMean = getMeanNsPerOp(other, 1, variationName);

        if (myMean <= otherMean) {
          const ratio = otherMean / myMean;
          return {
            other: other.Name,
            ratio: Math.round(ratio * 10) / 10,
            percentage: Math.round((ratio - 1) * 100),
            faster: true,
          };
        } else {
          const ratio = myMean / otherMean;
          return {
            other: other.Name,
            ratio: Math.round(ratio * 10) / 10,
            percentage: Math.round((ratio - 1) * 100),
            faster: false,
          };
        }
      });

    return { name: b.Name, meanNsPerOp: myMean, vs };
  });
}

export interface FastSlow {
  fastest: string;
  slowest: string;
}

/** Returns the fastest and slowest benchmark names (by mean NsPerOp at CPUCount=1). */
export function getFastestAndSlowest(
  benchmarks: Benchmark[],
  variationName?: string,
): FastSlow {
  let fastest = benchmarks[0];
  let slowest = benchmarks[0];

  for (const b of benchmarks) {
    if (
      getMeanNsPerOp(b, 1, variationName) <
      getMeanNsPerOp(fastest, 1, variationName)
    )
      fastest = b;
    if (
      getMeanNsPerOp(b, 1, variationName) >
      getMeanNsPerOp(slowest, 1, variationName)
    )
      slowest = b;
  }

  return { fastest: fastest.Name, slowest: slowest.Name };
}

/** Sorts benchmarks from fastest to slowest by mean NsPerOp at CPUCount=1. */
export function sortByPerformance(
  benchmarks: Benchmark[],
  variationName?: string,
): Benchmark[] {
  return [...benchmarks].sort(
    (a, b) =>
      getMeanNsPerOp(a, 1, variationName) -
      getMeanNsPerOp(b, 1, variationName),
  );
}

// --- Formatting ---

/** Smart-format nanoseconds into ns, µs, or ms. */
export function formatNs(ns: number): string {
  if (ns < 1_000) return `${Math.round(ns * 100) / 100} ns`;
  if (ns < 1_000_000) return `${Math.round((ns / 1_000) * 100) / 100} µs`;
  return `${Math.round((ns / 1_000_000) * 100) / 100} ms`;
}

/** Format N values as 1K, 2K etc. */
export function formatN(n: number): string {
  if (n >= 1000) return `${n / 1000}K`;
  return String(n);
}

/** Slugify a benchmark name for use as an anchor ID. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
