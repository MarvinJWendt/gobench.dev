<div align="center">

<img src="public/header.png" alt="GoBench.dev — Write Faster Go Code" width="100%" />

<br />

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel&logoColor=white)](https://gobench.dev)
[![Go](https://img.shields.io/badge/Go-1.24+-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

**Compare the speed of different ways to do the same thing in Go.**
<br />
Each benchmark pits multiple implementations against each other across varying iteration counts and CPU core counts, then visualises the results in interactive charts.

[**Visit gobench.dev →**](https://gobench.dev)

</div>

---

## ✨ Features

- **Interactive charts** — compare implementations side-by-side with logarithmic scale, CPU core toggle, tooltips and clickable legends
- **Per-implementation detail** — see how each approach scales across CPU cores
- **Syntax-highlighted source code** — collapsible Go benchmark code with Catppuccin Mocha theme
- **Automatic comparisons** — _"X is 2.1× faster than Y"_ with colour-coded numbers
- **System info** — every benchmark records OS, architecture and CPU model
- **Static generation** — pages are pre-rendered at build time via Next.js SSG for instant loads

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router, RSC) |
| **UI** | [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Code Highlighting** | [Shiki](https://shiki.style/) |
| **Benchmarks** | Go [`testing.B`](https://pkg.go.dev/testing#B), parsed by a custom CLI in `cmd/` |
| **Deployment** | [Vercel](https://vercel.com/) |

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

The site will be running at **http://localhost:3000**.

## 📂 Project Structure

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
    _bench.out        # Raw go test -bench output (generated)
    _bench.json       # Parsed benchmark data (generated)
cmd/                  # Go CLI that runs and parses benchmarks
```

## 🤝 Contributing

Contributions are welcome! See [**CONTRIBUTING.md**](CONTRIBUTING.md) for the full development setup, how to add benchmarks, and project guidelines.
