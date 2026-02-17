package commands

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"

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

var generateCmd = &cobra.Command{
	Use:     "generate",
	Aliases: []string{"gen"},
	Short:   "Generate benchmarks",
	RunE: func(cmd *cobra.Command, args []string) error {
		debug, _ := cmd.Flags().GetBool("debug")
		logger := logger.New(debug)

		benchmarksDir := cmd.Flag("benchmarks").Value.String()

		if _, err := os.Stat(benchmarksDir); os.IsNotExist(err) {
			return fmt.Errorf("benchmarks directory does not exist: %s", benchmarksDir)
		}

		groups, err := parser.ProcessBenchmarkGroups(logger, benchmarksDir)
		if err != nil {
			return fmt.Errorf("failed to process benchmark groups: %w", err)
		}

		// Collapse duplicate variations and write JSON for each group
		totalBenchmarks := 0
		for i := range groups {
			medianVariations(&groups[i])
			totalBenchmarks += len(groups[i].Benchmarks)

			j, err := parser.GenerateGroupJson(groups[i], true)
			if err != nil {
				return fmt.Errorf("failed to generate json for %s: %w", groups[i].Name, err)
			}

			outPath := filepath.Join(groups[i].Dir, "_bench.json")
			if err := os.WriteFile(outPath, j, 0644); err != nil {
				return fmt.Errorf("failed to write json for %s: %w", groups[i].Name, err)
			}

			logger.Info("generated", "group", groups[i].Name, "benchmarks", len(groups[i].Benchmarks))
		}

		logger.Info("done", "groups", len(groups), "total_benchmarks", totalBenchmarks)

		return nil
	},
}

func init() {
	generateCmd.Flags().StringP("benchmarks", "b", "../benchmarks", "Filepath of the \"benchmarks\" directory")

	rootCmd.AddCommand(generateCmd)
}
