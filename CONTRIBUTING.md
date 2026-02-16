# Contributing to gobench.dev

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/)
- [Go](https://go.dev/) (1.24+)
- [Task](https://taskfile.dev/) (optional, but recommended)

## Local development

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev
# or
task dev
```

The site runs at `http://localhost:3000`.

## Project structure

```
app/                  # Next.js pages (App Router)
  [slug]/page.tsx     # Dynamic benchmark detail page
  page.tsx            # Landing page
components/
  benchmark/          # Benchmark-specific components (charts, code blocks, etc.)
  ui/                 # shadcn/ui components
lib/
  benchmarks.ts       # Data access (reads _bench.json / _meta.yml)
  benchmark-utils.ts  # Chart data transforms, comparison math
  highlight.ts        # Shiki code highlighting
benchmarks/           # Go benchmark source + generated data
  {slug}/
    *_test.go         # Go benchmark files
    _meta.yml         # Metadata (name, description, tags, etc.)
    _bench.out        # Raw `go test -bench` output (generated)
    _bench.json       # Parsed benchmark data (generated)
cmd/                  # Go CLI that runs and parses benchmarks
```

## Adding a benchmark

1. Create a new directory under `benchmarks/` with a slug name (e.g. `benchmarks/map-vs-switch/`).

2. Add one or more `*_test.go` files with standard Go benchmark functions. Each benchmark function should follow the naming convention `BenchmarkName_variation`:

   ```go
   package map_vs_switch

   import "testing"

   func BenchmarkMap_run(b *testing.B) {
       // implementation
   }

   func BenchmarkSwitch_run(b *testing.B) {
       // implementation
   }
   ```

3. Create a `_meta.yml` file with metadata:

   ```yaml
   name: Map vs Switch
   headline: Short one-line description.
   description: >
     Longer description that appears on the benchmark page.

   tags:
     - map
     - switch

   contributors:
     - YourGitHubUsername

   meta:
     - implementation: Map
       description: >
         Description of the Map implementation.

     - implementation: Switch
       description: >
         Description of the Switch implementation.
   ```

   The `implementation` field in `meta` must match the benchmark function name (without the `Benchmark` prefix and `_variation` suffix).

4. Run the benchmarks and generate the JSON data:

   ```bash
   task bench
   ```

   This runs `go run . run` and `go run . generate` inside `cmd/`, which executes all benchmarks and writes `_bench.out` + `_bench.json` into each benchmark directory.

5. Start the dev server — your new benchmark appears automatically at `/{slug}`.

## UI components

The frontend uses [shadcn/ui](https://ui.shadcn.com/). To add a new component:

```bash
pnpm dlx shadcn@latest add <component>
```

Components are generated into `components/ui/`.
