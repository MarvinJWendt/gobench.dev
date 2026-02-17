package commands

import (
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/marvinjwendt/gobench/cmd/internal/logger"
	"github.com/marvinjwendt/gobench/cmd/internal/utils"
	"github.com/spf13/cobra"
)

var runCmd = &cobra.Command{
	Use:   "run",
	Short: "Run benchmarks and save results",
	RunE: func(cmd *cobra.Command, args []string) error {
		debug, _ := cmd.Flags().GetBool("debug")
		all, _ := cmd.Flags().GetBool("all")
		count, _ := cmd.Flags().GetInt("count")
		logger := logger.New(debug)

		logger.Info("running benchmarks", "count", count)

		basePath := cmd.Flag("benchmarks").Value.String()
		logger.Debug("benchmarks directory", "basePath", basePath)
		if _, err := os.Stat(basePath); os.IsNotExist(err) {
			return fmt.Errorf("benchmarks directory does not exist: %s", basePath)
		}

		// Walk through the benchmarks directory
		err := utils.WalkOverBenchmarks(basePath, func(path string) error {
			return runBenchmark(logger, path, all, count)
		})

		return err
	},
}

func runBenchmark(logger *slog.Logger, path string, all bool, count int) error {
	outputFilePath := filepath.Join(path, "_bench.out")
	logger.Debug("running benchmark", "path", path)

	if _, err := os.Stat(outputFilePath); err == nil && !all {
		logger.Debug("benchmark output already exists, skipping", "path", path)
		return nil
	}

	maxCPU := runtime.NumCPU()
	logger.Debug("max cpu", "maxCPU", maxCPU)

	var cpuTests []string
	for i := 1; i <= maxCPU; i *= 2 {
		cpuTests = append(cpuTests, fmt.Sprint(i))
	}

	logger.Debug("cpu tests", "cpuTests", cpuTests)

	benchtimes := []string{"1000x", "2000x", "3000x", "4000x", "5000x", "6000x", "7000x", "8000x", "9000x", "10000x"}
	var output []byte

	// Run benchmarks sequentially count times to reduce variance.
	for run := range count {
		if run > 0 {
			logger.Debug("sleeping 1s between runs for CPU cooldown")
			time.Sleep(time.Second)
		}

		logger.Info("benchmark run", "run", run+1, "total", count, "path", path)

		for _, benchtime := range benchtimes {
			cmd := exec.Command("go", "test", "-bench", ".", "-benchmem", "-benchtime", benchtime, "-cpu", strings.Join(cpuTests, ","))
			logger.Debug("executing benchmark command", "command", cmd.String(), "path", path)
			cmd.Dir = path
			result, err := cmd.Output()
			if err != nil {
				logger.Error("failed to run benchmark", "path", path, "output", string(output))
				return fmt.Errorf("failed to run benchmark: %w", err)
			}
			output = append(output, result...)
		}
	}

	logger.Info("writing benchmark output", "path", path+string(os.PathSeparator)+"_bench.out")
	return os.WriteFile(outputFilePath, output, 0644)
}

func init() {
	runCmd.Flags().StringP("benchmarks", "b", "../benchmarks", "Filepath of the \"benchmarks\" directory")
	runCmd.Flags().BoolP("all", "a", false, "Re-run all benchmarks, overwriting existing output files")
	runCmd.Flags().IntP("count", "c", 10, "Number of times to run each benchmark (results are averaged)")

	rootCmd.AddCommand(runCmd)
}
