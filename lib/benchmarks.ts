import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

// --- Types mirroring Go models (cmd/internal/parser/model.go) ---

export interface BenchmarkVariation {
  N: number;
  NsPerOp: number;
  AllocedBytesPerOp: number;
  AllocsPerOp: number;
  MBPerS: number;
  Measured: number;
  Ord: number;
  Name: string;
  CPUCount: number;
  OpsPerSec: number;
}

export interface Benchmark {
  Name: string;
  Description: string;
  BenchmarkCode: string;
  Code: string;
  Variations: BenchmarkVariation[];
}

export interface SystemInfo {
  GoOS: string;
  GoArch: string;
  Pkg: string;
  CPU: string;
}

export interface BenchmarkGroup {
  Name: string;
  Headline: string;
  Description: string;
  System: SystemInfo;
  Benchmarks: Benchmark[];
  Code: string;
  Constants: string;
}

// Matches _meta.yml structure
export interface BenchmarkMeta {
  name: string;
  headline: string;
  description: string;
  tags: string[];
  contributors: string[];
  meta: {
    implementation: string;
    description: string;
  }[];
}

// Lightweight type for listing benchmarks on the landing page
export interface BenchmarkSummary {
  slug: string;
  name: string;
  headline: string;
  description: string;
  tags: string[];
}

// --- Data access functions ---

function getBenchmarksDir(): string {
  return path.join(process.cwd(), "benchmarks");
}

/** Returns all benchmark slugs (directory names that contain a _bench.json). */
export function getAllSlugs(): string[] {
  const dir = getBenchmarksDir();
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        fs.existsSync(path.join(dir, entry.name, "_bench.json")),
    )
    .map((entry) => entry.name);
}

/** Parses the _bench.json for a given benchmark slug. */
export function getBenchmarkGroup(slug: string): BenchmarkGroup {
  const filePath = path.join(getBenchmarksDir(), slug, "_bench.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as BenchmarkGroup;
}

/** Parses the _meta.yml for a given benchmark slug. */
export function getBenchmarkMeta(slug: string): BenchmarkMeta {
  const filePath = path.join(getBenchmarksDir(), slug, "_meta.yml");
  const raw = fs.readFileSync(filePath, "utf-8");
  return yaml.load(raw) as BenchmarkMeta;
}

/** Returns a summary of every benchmark for the landing page. */
export function getAllBenchmarkSummaries(): BenchmarkSummary[] {
  return getAllSlugs().map((slug) => {
    const group = getBenchmarkGroup(slug);
    const meta = getBenchmarkMeta(slug);

    return {
      slug,
      name: group.Name,
      headline: group.Headline,
      description: group.Description,
      tags: meta.tags ?? [],
    };
  });
}
