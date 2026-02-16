package commands

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/marvinjwendt/gobench/cmd/internal/logger"
	"github.com/marvinjwendt/gobench/cmd/internal/parser"
	"github.com/spf13/cobra"
)

var generateCmd = &cobra.Command{
	Use:     "generate",
	Aliases: []string{"gen"},
	Short:   "Generate benchmarks",
	RunE: func(cmd *cobra.Command, args []string) error {
		debug, _ := cmd.Flags().GetBool("debug")
		logger := logger.New(debug)

		benchmarksDir := cmd.Flag("benchmarks").Value.String()
		logger.Debug("flags", "benchmarkDir", benchmarksDir)

		logger.Debug("checking if benchmarks directory exists")
		if _, err := os.Stat(benchmarksDir); os.IsNotExist(err) {
			return fmt.Errorf("benchmarks directory does not exist: %s", benchmarksDir)
		}

		groups, err := parser.ProcessBenchmarkGroups(logger, benchmarksDir)
		if err != nil {
			return fmt.Errorf("failed to process benchmark groups: %w", err)
		}

		// Write a _bench.json file for each benchmark group
		for _, group := range groups {
			j, err := parser.GenerateGroupJson(group, true)
			if err != nil {
				return fmt.Errorf("failed to generate json for %s: %w", group.Name, err)
			}

			outPath := filepath.Join(group.Dir, "_bench.json")
			logger.Info("writing json file", "path", outPath)
			if err := os.WriteFile(outPath, j, 0644); err != nil {
				return fmt.Errorf("failed to write json for %s: %w", group.Name, err)
			}
		}

		return nil
	},
}

func init() {
	generateCmd.Flags().StringP("benchmarks", "b", "../benchmarks", "Filepath of the \"benchmarks\" directory")

	rootCmd.AddCommand(generateCmd)
}
