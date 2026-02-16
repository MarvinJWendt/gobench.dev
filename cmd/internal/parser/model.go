package parser

import "golang.org/x/tools/benchmark/parse"

// SystemInfo holds the Go toolchain and hardware info from the benchmark output header.
type SystemInfo struct {
	GoOS   string `json:"GoOS"`
	GoArch string `json:"GoArch"`
	Pkg    string `json:"Pkg"`
	CPU    string `json:"CPU"`
}

type BenchmarkGroup struct {
	Dir         string     `json:"-"` // Source directory path (not included in JSON)
	Name        string
	Headline    string
	Description string
	System      SystemInfo
	Benchmarks  []Benchmark
	Code        string
	Constants   string
}

type Benchmark struct {
	Name          string // Name of the benchmark
	Description   string // Description of the benchmark
	BenchmarkCode string
	Code          string
	Variations    []Variation
}

type Variation struct {
	parse.Benchmark
	Name      string  // Name of the variation
	CPUCount  int     // Number of CPU cores used
	OpsPerSec float64 // Performance of the benchmark compared to the fastest benchmark
}

// --- BenchmarkMeta Model ---

type BenchmarkMeta struct {
	Name         string   `json:"name"`
	Headline     string   `json:"headline"`
	Description  string   `json:"description"`
	Tags         []string `json:"tags"`
	Contributors []string `json:"contributors"`
	Meta         []struct {
		Implementation string `json:"implementation"`
		Description    string `json:"description"`
	} `json:"meta"`
}