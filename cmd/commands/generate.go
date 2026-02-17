package commands

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/marvinjwendt/gobench/cmd/internal/logger"
	"github.com/marvinjwendt/gobench/cmd/internal/parser"
	"github.com/spf13/cobra"
)

// variationKey uniquely identifies a variation for averaging across runs.
type variationKey struct {
	BenchmarkName string
	VariationName string
	N             int
	CPUCount      int
}

// medianVariations collapses duplicate variations (produced by multiple
// benchmark runs) into a single entry per unique key by taking the
// median of the numeric fields. Median is preferred over mean because
// benchmark data is prone to outlier spikes (GC, scheduling, etc.).
func medianVariations(group *parser.BenchmarkGroup) {
	for i, bench := range group.Benchmarks {
		grouped := make(map[variationKey][]parser.Variation)
		var order []variationKey

		for _, v := range bench.Variations {
			key := variationKey{
				BenchmarkName: v.Benchmark.Name,
				VariationName: v.Name,
				N:             v.Benchmark.N,
				CPUCount:      v.CPUCount,
			}
			if _, exists := grouped[key]; !exists {
				order = append(order, key)
			}
			grouped[key] = append(grouped[key], v)
		}

		result := make([]parser.Variation, 0, len(order))
		for _, key := range order {
			vars := grouped[key]

			// Use first entry as base (preserves Name, N, Measured, etc.)
			med := vars[0]

			med.NsPerOp = medianFloat(vars, func(v parser.Variation) float64 { return v.NsPerOp })
			med.MBPerS = medianFloat(vars, func(v parser.Variation) float64 { return v.MBPerS })
			med.AllocedBytesPerOp = medianUint64(vars, func(v parser.Variation) uint64 { return v.AllocedBytesPerOp })
			med.AllocsPerOp = medianUint64(vars, func(v parser.Variation) uint64 { return v.AllocsPerOp })
			med.OpsPerSec = 1e9 / med.NsPerOp

			result = append(result, med)
		}

		group.Benchmarks[i].Variations = result
	}
}

// medianFloat returns the median of a float64 field extracted from a slice of variations.
func medianFloat(vars []parser.Variation, field func(parser.Variation) float64) float64 {
	vals := make([]float64, len(vars))
	for i, v := range vars {
		vals[i] = field(v)
	}
	sort.Float64s(vals)

	n := len(vals)
	if n%2 == 1 {
		return vals[n/2]
	}
	return (vals[n/2-1] + vals[n/2]) / 2
}

// medianUint64 returns the median of a uint64 field extracted from a slice of variations.
func medianUint64(vars []parser.Variation, field func(parser.Variation) uint64) uint64 {
	vals := make([]uint64, len(vars))
	for i, v := range vars {
		vals[i] = field(v)
	}
	sort.Slice(vals, func(i, j int) bool { return vals[i] < vals[j] })

	n := len(vals)
	if n%2 == 1 {
		return vals[n/2]
	}
	return (vals[n/2-1] + vals[n/2]) / 2
}

// countVariations returns the total number of variations across all benchmarks in a group.
func countVariations(group *parser.BenchmarkGroup) int {
	total := 0
	for _, b := range group.Benchmarks {
		total += len(b.Variations)
	}
	return total
}

// countBenchmarkLines counts the number of benchmark result lines in a _bench.out file.
func countBenchmarkLines(path string) int {
	f, err := os.Open(path)
	if err != nil {
		return 0
	}
	defer f.Close()

	count := 0
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		if strings.HasPrefix(scanner.Text(), "Benchmark") {
			count++
		}
	}
	return count
}

var generateCmd = &cobra.Command{
	Use:     "generate",
	Aliases: []string{"gen"},
	Short:   "Generate benchmarks",
	RunE: func(cmd *cobra.Command, args []string) error {
		debug, _ := cmd.Flags().GetBool("debug")
		logger := logger.New(debug)

		benchmarksDir := cmd.Flag("benchmarks").Value.String()
		logger.Info("starting benchmark generation", "dir", benchmarksDir)

		if _, err := os.Stat(benchmarksDir); os.IsNotExist(err) {
			return fmt.Errorf("benchmarks directory does not exist: %s", benchmarksDir)
		}

		groups, err := parser.ProcessBenchmarkGroups(logger, benchmarksDir)
		if err != nil {
			return fmt.Errorf("failed to process benchmark groups: %w", err)
		}

		logger.Info("discovered benchmark groups", "count", len(groups))

		// Collapse duplicate variations from multiple runs using median
		totalRawVariations := 0
		totalCollapsedVariations := 0
		totalBenchmarkLines := 0
		totalBenchmarks := 0

		for i := range groups {
			benchOutPath := filepath.Join(groups[i].Dir, "_bench.out")
			lineCount := countBenchmarkLines(benchOutPath)
			totalBenchmarkLines += lineCount

			rawCount := countVariations(&groups[i])
			totalRawVariations += rawCount

			medianVariations(&groups[i])

			collapsedCount := countVariations(&groups[i])
			totalCollapsedVariations += collapsedCount
			totalBenchmarks += len(groups[i].Benchmarks)

			logger.Info("processed group",
				"group", groups[i].Name,
				"lines", lineCount,
				"variations_raw", rawCount,
				"variations_collapsed", collapsedCount,
				"benchmarks", len(groups[i].Benchmarks),
			)
		}

		logger.Info("benchmark processing summary",
			"total_lines", totalBenchmarkLines,
			"total_variations_raw", totalRawVariations,
			"total_variations_collapsed", totalCollapsedVariations,
			"total_benchmarks", totalBenchmarks,
		)

		// Write a _bench.json file for each benchmark group
		totalBytes := 0
		for _, group := range groups {
			j, err := parser.GenerateGroupJson(group, true)
			if err != nil {
				return fmt.Errorf("failed to generate json for %s: %w", group.Name, err)
			}

			outPath := filepath.Join(group.Dir, "_bench.json")
			logger.Info("writing json", "path", outPath, "benchmarks", len(group.Benchmarks), "size_bytes", len(j))
			if err := os.WriteFile(outPath, j, 0644); err != nil {
				return fmt.Errorf("failed to write json for %s: %w", group.Name, err)
			}
			totalBytes += len(j)
		}

		logger.Info("generation complete",
			"groups", len(groups),
			"json_files_written", len(groups),
			"total_bytes_written", totalBytes,
		)

		return nil
	},
}

func init() {
	generateCmd.Flags().StringP("benchmarks", "b", "../benchmarks", "Filepath of the \"benchmarks\" directory")

	rootCmd.AddCommand(generateCmd)
}
