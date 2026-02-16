# gobench.dev

**gobench.dev** is a website that compares the speed of different ways to do the same thing in Go. Each benchmark group pits multiple implementations against each other across varying iteration counts and CPU core counts, then visualises the results in interactive charts.

## Features

- **Interactive charts** - compare implementations side-by-side with a logarithmic scale, CPU core toggle, tooltips and clickable legends (Recharts via shadcn/ui)
- **Per-implementation detail** - see how each approach scales across CPU cores
- **Syntax-highlighted source code** - collapsible Go benchmark code (Shiki, catppuccin-mocha)
- **Automatic comparison text** - "X is 2.1× faster than Y" with colour-coded numbers
- **System info** - every benchmark records OS, architecture and CPU model
- **Static generation** - pages are pre-rendered at build time via Next.js SSG

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, RSC) |
| UI | shadcn/ui, Tailwind CSS |
| Charts | Recharts |
| Code highlighting | Shiki |
| Benchmarks | Go `testing.B`, parsed by a custom CLI in `cmd/` |

## Quick start

```bash
pnpm install
pnpm dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full development setup, how to add benchmarks, and more.
