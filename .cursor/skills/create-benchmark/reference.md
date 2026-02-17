# Benchmark Reference

## Directory Structure

```
benchmarks/{slug}/
├── *_test.go       # One or more Go benchmark files
├── a-consts.go     # Optional: shared constants (a- prefix sorts first)
├── _meta.yml       # Required: metadata for the UI
├── _bench.out      # Generated: raw go test output
└── _bench.json     # Generated: parsed benchmark data
```

- Package name must match the slug with hyphens replaced by underscores: `map-vs-switch` → `package map_vs_switch`
- You can split implementations across multiple `*_test.go` files (one per implementation) or combine them in a single file

## _meta.yml Schema

```yaml
# Optional — hides the benchmark from the UI
hidden: false

# Display name shown in the UI
name: Map vs Switch

# One-line summary shown on the landing page card
headline: Short one-line description.

# Longer description shown on the benchmark detail page.
# Supports markdown-like backtick formatting in the UI.
description: >
  Longer description explaining what is being compared and why it matters.

# Tags for categorization / filtering
tags:
  - map
  - switch

# GitHub usernames of contributors
contributors:
  - GitHubUsername

# Per-implementation metadata — one entry per implementation
meta:
  - implementation: Map            # Must match parsed CamelCase name
    description: >
      Description of the Map implementation shown in the UI.

  - implementation: Switch
    description: >
      Description of the Switch implementation shown in the UI.
```

### Field Details

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `hidden` | No | `bool` | Default `false`. Set `true` to hide from the UI. |
| `name` | Yes | `string` | Display name. |
| `headline` | Yes | `string` | Single line, shown on landing page cards. |
| `description` | Yes | `string` | Multi-line, shown on detail page. Use YAML `>` for folded blocks. |
| `tags` | Yes | `string[]` | Lowercase, relevant keywords. |
| `contributors` | Yes | `string[]` | GitHub usernames. |
| `meta` | Yes | `object[]` | One entry per implementation. |
| `meta[].implementation` | Yes | `string` | Must match the CamelCase-split benchmark name. |
| `meta[].description` | Yes | `string` | Explains the approach. |

### Implementation Name Matching

The parser extracts the implementation name from `BenchmarkFooBar_suffix` by:
1. Stripping the `Benchmark` prefix → `FooBar`
2. Splitting CamelCase at uppercase boundaries → `Foo Bar`

The `implementation` field in `_meta.yml` must exactly match step 2's output.

Examples:
| Function | Parsed Name | `implementation` in YAML |
|----------|-------------|--------------------------|
| `BenchmarkStringBuilder_write` | String Builder | `String Builder` |
| `BenchmarkAtomicUintCounter_get` | Atomic Uint Counter | `Atomic Uint Counter` |
| `BenchmarkSync_read` | Sync | `Sync` |
| `BenchmarkIntCounterWithMutex_increment` | Int Counter With Mutex | `Int Counter With Mutex` |

## Benchmark Function Patterns

### Single Behavior (use `_run` suffix)

When benchmarking a single operation per implementation:

```go
package slug_name

import "testing"

func BenchmarkImplementation_run(b *testing.B) {
    // optional setup
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        // operation under test
    }
}
```

### Multiple Behaviors (custom suffixes)

When each implementation has distinct operations (e.g., read vs write):

```go
func BenchmarkImplementation_write(b *testing.B) {
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        // write operation
    }
}

func BenchmarkImplementation_read(b *testing.B) {
    // setup: populate data
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        // read operation
    }
}
```

**Every implementation must define the same set of suffixes.** The UI renders synced tabs (one per behavior plus a combined view).

### Concurrent Benchmarks

Use `b.RunParallel` — the framework scales goroutines with GOMAXPROCS:

```go
func BenchmarkConcurrentImpl_run(b *testing.B) {
    b.RunParallel(func(pb *testing.PB) {
        i := 0
        for pb.Next() {
            // concurrent work
            i++
        }
    })
}
```

### Shared Constants

Place shared constants in `a-consts.go` (the `a-` prefix ensures it sorts first and the parser includes it as `Constants` in the JSON output):

```go
package slug_name

const (
    mapSize   = 1000
    readCount = 10_000
)
```

## How Benchmarks Are Run

The CLI (`cmd/`) runs benchmarks with:
- **Iteration counts**: 1000x, 2000x, 3000x, … 10000x (`-benchtime`)
- **CPU counts**: 1, 2, 4, 8, … up to `runtime.NumCPU()` (`-cpu`)
- **Flags**: `-bench . -benchmem`
- **Repetitions**: 10 runs by default (`-count`), with 1s cooldown between runs

This means each benchmark function is called many times at different scales and core counts. The results are aggregated into `_bench.json`.

## Parsed JSON Structure

Each benchmark group in `_bench.json`:

```json
{
  "Name": "Counter",
  "Headline": "...",
  "Description": "...",
  "System": { "GoOS": "linux", "GoArch": "amd64", "Pkg": "...", "CPU": "..." },
  "Benchmarks": [
    {
      "Name": "Atomic Pointer Counter",
      "Description": "...",
      "BenchmarkCode": "...",
      "Code": "...",
      "Variations": [
        {
          "N": 1000,
          "NsPerOp": 0.365,
          "AllocedBytesPerOp": 0,
          "AllocsPerOp": 0,
          "MBPerS": 0,
          "Measured": 13,
          "Ord": 8,
          "Name": "get",
          "CPUCount": 4,
          "OpsPerSec": 2739726027.39726
        }
      ]
    }
  ],
  "Code": "...",
  "Constants": "..."
}
```

Key variation fields for the UI:
- `N`: iteration count (1000–10000)
- `NsPerOp`: primary performance metric
- `AllocedBytesPerOp`: memory per operation
- `AllocsPerOp`: allocations per operation
- `CPUCount`: number of CPU cores used
- `Name`: behavior name (e.g., "run", "read", "write")
