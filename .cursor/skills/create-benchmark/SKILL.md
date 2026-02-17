---
name: create-benchmark
description: Create, modify, and improve Go benchmarks for gobench.dev. Use when working with benchmark *_test.go files, _meta.yml metadata, benchmark correctness, or when the user asks to add, edit, or review a benchmark.
---

# Create Benchmark

Skill for creating, modifying, and reviewing Go benchmarks in the gobench.dev project.

## Quick Reference

- Benchmarks live in `benchmarks/{slug}/`
- Each benchmark needs: `*_test.go` files + `_meta.yml`
- Generated files (`_bench.out`, `_bench.json`) are created by `task bench`
- Shared constants go in `a-consts.go` (prefixed `a-` to sort first)

For full structural details and _meta.yml schema, see [reference.md](reference.md).

## Naming Convention (Critical)

Function format: `BenchmarkImplementationName_behavior`

The parser splits this into:
1. **Implementation name**: CamelCase after `Benchmark`, split into words at uppercase boundaries
   - `BenchmarkStringBuilder` → "String Builder"
   - `BenchmarkAtomicPointerCounter` → "Atomic Pointer Counter"
2. **Behavior suffix**: lowercase after the underscore
   - `_run` for single-behavior benchmarks
   - `_read`, `_write`, etc. for multi-behavior benchmarks

The `implementation` field in `_meta.yml` must **exactly match** the parsed implementation name (the CamelCase-to-space-separated form).

**All implementations must define the same set of behavior suffixes.** The UI auto-detects multiple behaviors and renders synced tabs.

## Writing Correct Benchmarks

### Essential Rules

1. **Always use `b.N` for the hot loop** — Go's benchmark framework controls iteration count:

```go
for i := 0; i < b.N; i++ {
    // code under test
}
```

2. **Use `b.ResetTimer()`** after expensive setup that should not count toward the measurement:

```go
func BenchmarkFoo_run(b *testing.B) {
    data := expensiveSetup()
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        process(data)
    }
}
```

3. **Prevent dead-code elimination** — the compiler may optimize away results. Assign to a package-level sink or use `b.N`-scoped variables:

```go
var sink int

func BenchmarkFoo_run(b *testing.B) {
    for i := 0; i < b.N; i++ {
        sink = compute()
    }
}
```

4. **Prevent loop hoisting** — don't let the compiler lift invariant work out of the loop. Vary inputs per iteration when the goal is to measure the operation itself:

```go
func BenchmarkLookup_run(b *testing.B) {
    m := buildMap()
    keys := allKeys(m)
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        _ = m[keys[i%len(keys)]]
    }
}
```

5. **Use `b.RunParallel`** for concurrent benchmarks (not raw goroutines):

```go
func BenchmarkConcurrent_run(b *testing.B) {
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            // concurrent work
        }
    })
}
```

6. **Keep setup fair** — all implementations in a group should operate on equivalent data sizes and conditions.

7. **Use `b.StopTimer()` / `b.StartTimer()`** only for per-iteration cleanup that is unavoidable. Prefer structuring the benchmark to avoid these.

8. **Report allocations** — the CLI runs with `-benchmem`, so `AllocedBytesPerOp` and `AllocsPerOp` are captured automatically. No need to call `b.ReportAllocs()`.

9. **Explain benchmark code** — use small comments to explain the benchmark code. Can be inline. Don't overdo it, only explain complex steps.

10. NEVER run `task bench`. It reruns all benchmarks. The user will run the benchmarks and generation logic. Only use the go tooling to verify that the benchmark works as intended.

### Common Mistakes to Watch For

- **Value receiver on mutable state**: `func (c IntCounter) increment()` modifies a copy, not the original. Use pointer receivers for mutable structs.
- **Benchmarking setup instead of work**: forgetting `b.ResetTimer()` after heavy initialization.
- **Inconsistent behavior suffixes**: if one implementation has `_read` and `_write`, all must.
- **Not using `b.N`**: using a fixed loop count instead of `b.N` produces invalid results.
- **Data-dependent timing**: creating new data inside the `b.N` loop skews results.
- **Shared mutable state leaking between iterations**: previous iteration's side-effects affecting the next.

## What Gets Displayed

The frontend visualizes three metrics:

| Metric | Field | Description |
|--------|-------|-------------|
| **Time** | `NsPerOp` | Nanoseconds per operation (primary metric) |
| **Memory** | `AllocedBytesPerOp` | Bytes allocated per operation |
| **Allocs** | `AllocsPerOp` | Allocations per operation |

Charts show:
- **Overview**: all implementations side-by-side across iteration counts (1K–10K)
- **Detail**: each implementation's scaling across CPU core counts (1, 2, 4, 8, …)
- **Comparisons**: "X is 2.1× faster than Y" (based on mean NsPerOp at CPU=1)
- **Badges**: "Fastest" / "Slowest" per behavior and CPU count

**What matters most**: NsPerOp is the primary comparison metric. Memory and allocations are secondary but very useful for understanding *why* one approach is faster.

## Workflow: Creating a New Benchmark

1. Create `benchmarks/{slug}/` directory (lowercase, hyphens)
2. Write `*_test.go` files with `BenchmarkName_behavior` functions
3. Add shared constants in `a-consts.go` if needed
4. Create `_meta.yml` (see [reference.md](reference.md) for schema)
5. Verify: `implementation` names in `_meta.yml` match parsed CamelCase names
6. Run `task bench` to generate `_bench.out` and `_bench.json`

## Workflow: Improving an Existing Benchmark

When asked to improve a benchmark, carefully evaluate:

1. **Correctness**: Is `b.N` used correctly? Is setup excluded via `b.ResetTimer()`?
2. **Fairness**: Do all implementations benchmark equivalent workloads?
3. **Dead-code elimination**: Are results consumed (sunk) properly?
4. **Receiver types**: Pointer vs value — does the method actually mutate state?
5. **Concurrency**: Is `b.RunParallel` used where concurrency matters?
6. **Meta sync**: Does `_meta.yml` match the actual benchmark functions?
7. **Descriptions**: Are implementation descriptions accurate and helpful?

Always update `_meta.yml` when renaming, adding, or removing benchmark functions.
