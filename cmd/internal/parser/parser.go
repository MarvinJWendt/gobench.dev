package parser

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"go/token"
	"log/slog"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"github.com/dave/dst"
	"github.com/dave/dst/decorator"
	"github.com/goccy/go-yaml"
	"github.com/marvinjwendt/gobench/cmd/internal/utils"
	"golang.org/x/tools/benchmark/parse"
)

// GenerateGroupJson marshals a single BenchmarkGroup to JSON.
func GenerateGroupJson(group BenchmarkGroup, pretty bool) ([]byte, error) {
	if pretty {
		return json.MarshalIndent(group, "", "  ")
	}

	return json.Marshal(group)
}

// parseSystemInfo reads the key: value header lines from a _bench.out file.
func parseSystemInfo(path string) (SystemInfo, error) {
	f, err := os.Open(path)
	if err != nil {
		return SystemInfo{}, fmt.Errorf("failed to open bench output for system info: %w", err)
	}
	defer f.Close()

	var info SystemInfo
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := scanner.Text()
		key, value, ok := strings.Cut(line, ":")
		if !ok {
			break // header section ended
		}
		value = strings.TrimSpace(value)
		switch key {
		case "goos":
			info.GoOS = value
		case "goarch":
			info.GoArch = value
		case "pkg":
			info.Pkg = value
		case "cpu":
			info.CPU = value
		}
	}

	return info, scanner.Err()
}

// processSingleGroup processes a single benchmark directory and returns the
// resulting BenchmarkGroup. It is extracted so that errors can be handled
// per-group without aborting the entire walk.
func processSingleGroup(logger *slog.Logger, path string) (BenchmarkGroup, error) {
	var benchmarkGroup BenchmarkGroup
	benchmarkGroup.Dir = path

	benchOutPath := path + string(os.PathSeparator) + "_bench.out"

	// Parse system info from the header
	sysInfo, err := parseSystemInfo(benchOutPath)
	if err != nil {
		return BenchmarkGroup{}, fmt.Errorf("failed to parse system info: %w", err)
	}
	benchmarkGroup.System = sysInfo

	f, err := os.Open(benchOutPath)
	if err != nil {
		return BenchmarkGroup{}, fmt.Errorf("failed to open benchmarkGroup file: %w", err)
	}

	set, err := parse.ParseSet(f)
	if err != nil {
		return BenchmarkGroup{}, fmt.Errorf("failed to parse benchmarkGroup file: %w", err)
	}

	// Init BenchmarkMeta
	var meta BenchmarkMeta
	meta.Name = filepath.Base(path)

	// Check if _meta.yml exists
	metaFilePath := path + string(os.PathSeparator) + "_meta.yml"
	if _, err := os.Stat(metaFilePath); err == nil {
		logger.Debug("meta file exists", "path", metaFilePath)

		// Open meta file
		metaFile, err := os.Open(metaFilePath)
		if err != nil {
			return BenchmarkGroup{}, fmt.Errorf("failed to open meta file: %w", err)
		}

		// Decode meta file
		err = yaml.NewDecoder(metaFile).Decode(&meta)
		if err != nil {
			return BenchmarkGroup{}, fmt.Errorf("failed to decode meta file: %w", err)
		}
	} else {
		logger.Warn("no meta file found", "path", metaFilePath)
	}

	// Get all *_test.go files
	err = filepath.Walk(path, func(path string, info os.FileInfo, err error) error {
		if strings.HasSuffix(path, ".go") {
			logger.Debug("found test file", "path", path)

			// Read test file
			b, err := os.ReadFile(path)
			if err != nil {
				return fmt.Errorf("failed to read test file: %w", err)
			}

			cC, err := cleanCode(string(b))
			if err != nil {
				return fmt.Errorf("failed to clean test file: %w", err)
			}

			benchmarkGroup.Code += cC

			consts, err := getConsts(string(b))
			if err != nil {
				return fmt.Errorf("failed to get consts: %w", err)
			}

			benchmarkGroup.Constants += consts
		}

		return nil
	})
	if err != nil {
		return BenchmarkGroup{}, fmt.Errorf("failed to walk test files: %w", err)
	}

	benchmarkGroup.Code = strings.TrimSpace(benchmarkGroup.Code)

	benchmarkGroup.Name = meta.Name
	benchmarkGroup.Description = meta.Description
	benchmarkGroup.Headline = meta.Headline

	var variations []Variation
	for s, i := range set {
		for _, b := range i {
			logger.Debug("adding variation", "name", s)
			variation := Variation{
				Benchmark: *b,
			}

			brNameParts := strings.Split(variation.Benchmark.Name, "_") // "BenchmarkName_VariationName" -> ["BenchmarkName", "VariationName"]
			logger.Debug("benchmark name parts", "parts", brNameParts)
			variation.Benchmark.Name = brNameParts[0] // Benchmark name is the first part.

			// If there are more parts, then the variation name is the second part.
			if len(brNameParts) > 1 {
				variation.Name = brNameParts[1]
				variation.Name = strings.ReplaceAll(variation.Name, "_", " ")
				variation.Name = strings.ReplaceAll(variation.Name, "-", " ")

				// Variation parts.
				brVariationParts := strings.Split(variation.Name, " ")
				logger.Debug("benchmark variation name parts", "parts", brVariationParts)
				variation.Name = strings.Join(brVariationParts[:len(brVariationParts)-1], " ")

				// The last part is the CPU count, if it exists.
				variation.CPUCount, err = strconv.Atoi(brVariationParts[len(brVariationParts)-1])
				if err != nil {
					variation.CPUCount = 1
					variation.Name = strings.Join(brVariationParts, " ")
				}
			}

			// Split name. "BenchmarkName" -> "BenchmarkGroup Name". Split happens at every uppercase letter.
			variation.Benchmark.Name = strings.Join(utils.SplitCamelCase(variation.Benchmark.Name)[1:], " ")
			logger.Debug("adding benchmark variation", "benchmark name", variation.Benchmark.Name, "variation name", variation.Name, "cpuCount", variation.CPUCount, "orig name", s)

			// Calculate ops per second by dividing ns/op by 1e9.
			variation.OpsPerSec = 1e9 / variation.NsPerOp

			variations = append(variations, variation)
		}
	}

	benchmarks := make(map[string][]Variation)
	for _, v := range variations {
		benchmarks[v.Benchmark.Name] = append(benchmarks[v.Benchmark.Name], v)
	}

	var results []Benchmark
	for name, variations := range benchmarks {
		var benchmark Benchmark
		benchmark.Name = name
		benchmark.Variations = variations

		for _, m := range meta.Meta {
			if m.Implementation == name {
				benchmark.Description = m.Description
			}
		}

		logger.Debug("getting code", "benchmark name", name)
		benchmark.Code, err = getCode(benchmarkGroup.Code, strings.ReplaceAll(name, " ", ""))
		if err != nil {
			return BenchmarkGroup{}, fmt.Errorf("failed to get benchmark code: %w", err)
		}

		logger.Debug("getting benchmark code", "benchmark name", name)
		benchmark.BenchmarkCode, err = getBenchmarkCode(benchmarkGroup.Code, strings.ReplaceAll(name, " ", ""))
		if err != nil {
			return BenchmarkGroup{}, fmt.Errorf("failed to get benchmark code: %w", err)
		}

		benchmark.Code = strings.TrimSpace(benchmark.Code)
		benchmark.BenchmarkCode = strings.TrimSpace(benchmark.BenchmarkCode)

		results = append(results, benchmark)
	}

	// sort results by name
	sort.Slice(results, func(i, j int) bool {
		return results[i].Name < results[j].Name
	})

	benchmarkGroup.Benchmarks = results

	return benchmarkGroup, nil
}

func ProcessBenchmarkGroups(logger *slog.Logger, benchmarksDir string) ([]BenchmarkGroup, error) {
	var groups []BenchmarkGroup

	err := utils.WalkOverBenchmarks(benchmarksDir, func(path string) error {
		logger.Debug("walking through benchmarks", "currentPath", path)

		group, err := processSingleGroup(logger, path)
		if err != nil {
			logger.Error("skipping benchmark group", "path", path, "error", err)
			return nil
		}

		groups = append(groups, group)
		return nil
	})
	if err != nil {
		return nil, err
	}

	return groups, nil
}

func cleanCode(src string) (string, error) {
	// Remove import blocks and lines that start with "package"
	re := regexp.MustCompile(`(?m)^import \([\s\S]*?\)\n|^import .*\n|^package .*\n`)
	src = re.ReplaceAllString(src, "")

	// Replace multiple consecutive newline characters with a single newline character
	re = regexp.MustCompile(`\n{3,}`)
	src = re.ReplaceAllString(src, "\n")

	src = strings.TrimSpace(src)
	src += "\n\n"

	if src == "\n\n" {
		src = ""
	}

	return src, nil
}

func getConsts(src string) (string, error) {
	file, err := decorator.Parse(src)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	newFile := &dst.File{}
	for _, decl := range file.Decls {
		switch decl := decl.(type) {
		case *dst.GenDecl:
			if decl.Tok == token.CONST {
				newFile.Decls = append(newFile.Decls, decl)
			}
		}
	}

	newFile.Name = dst.NewIdent("dummy")
	decorator.Fprint(&buf, newFile)
	return cleanCode(buf.String())
}

// recvTypeName extracts the receiver type name from a method declaration.
// For pointer receivers (*T) it returns "T"; for value receivers (T) it returns "T".
func recvTypeName(fd *dst.FuncDecl) string {
	if fd.Recv == nil || len(fd.Recv.List) == 0 {
		return ""
	}
	switch expr := fd.Recv.List[0].Type.(type) {
	case *dst.StarExpr:
		if ident, ok := expr.X.(*dst.Ident); ok {
			return ident.Name
		}
	case *dst.Ident:
		return expr.Name
	}
	return ""
}

func getBenchmarkCode(src, name string) (string, error) {
	src, _ = cleanCode(src)
	src = "package dummy\n\n" + src
	file, err := decorator.Parse(src)
	if err != nil {
		return "", err
	}

	if file == nil {
		return "", fmt.Errorf("parsed file is nil")
	}

	// Index all locally-defined type names and standalone function names.
	typeNames := make(map[string]bool)
	funcNames := make(map[string]bool)
	for _, decl := range file.Decls {
		switch d := decl.(type) {
		case *dst.GenDecl:
			if d.Tok == token.TYPE {
				for _, spec := range d.Specs {
					if ts, ok := spec.(*dst.TypeSpec); ok {
						typeNames[ts.Name.Name] = true
					}
				}
			}
		case *dst.FuncDecl:
			if d.Recv == nil && !strings.HasPrefix(d.Name.Name, "Benchmark") {
				funcNames[d.Name.Name] = true
			}
		}
	}

	// Collect benchmark functions for this implementation.
	var benchFuncs []dst.Decl
	for _, decl := range file.Decls {
		if fd, ok := decl.(*dst.FuncDecl); ok {
			if strings.HasPrefix(fd.Name.Name, "Benchmark"+name+"_") {
				benchFuncs = append(benchFuncs, fd)
			}
		}
	}

	// Walk benchmark function bodies to collect all referenced identifiers.
	referencedIdents := make(map[string]bool)
	for _, decl := range benchFuncs {
		dst.Inspect(decl, func(n dst.Node) bool {
			if ident, ok := n.(*dst.Ident); ok {
				referencedIdents[ident.Name] = true
			}
			return true
		})
	}

	// Match referenced identifiers against local type and function names.
	refTypes := make(map[string]bool)
	refFuncs := make(map[string]bool)
	for id := range referencedIdents {
		if typeNames[id] {
			refTypes[id] = true
		}
		if funcNames[id] {
			refFuncs[id] = true
		}
	}

	// Build output: referenced types + their methods, then helper functions,
	// then benchmark functions. Source order is preserved within each group.
	newFile := &dst.File{Name: dst.NewIdent("dummy")}
	added := make(map[dst.Decl]bool)

	for _, decl := range file.Decls {
		switch d := decl.(type) {
		case *dst.GenDecl:
			if d.Tok == token.TYPE {
				for _, spec := range d.Specs {
					if ts, ok := spec.(*dst.TypeSpec); ok && refTypes[ts.Name.Name] {
						if !added[decl] {
							newFile.Decls = append(newFile.Decls, decl)
							added[decl] = true
						}
					}
				}
			}
		case *dst.FuncDecl:
			// Methods on referenced types.
			if d.Recv != nil && len(d.Recv.List) > 0 {
				if refTypes[recvTypeName(d)] && !added[decl] {
					newFile.Decls = append(newFile.Decls, decl)
					added[decl] = true
				}
			}
			// Referenced standalone helper functions.
			if d.Recv == nil && refFuncs[d.Name.Name] && !added[decl] {
				newFile.Decls = append(newFile.Decls, decl)
				added[decl] = true
			}
		}
	}

	// Append benchmark functions last.
	for _, fn := range benchFuncs {
		newFile.Decls = append(newFile.Decls, fn)
	}

	var buf bytes.Buffer
	decorator.Fprint(&buf, newFile)
	return cleanCode(buf.String())
}

func getCode(src, name string) (string, error) {
	src, _ = cleanCode(src)
	src = "package dummy\n\n" + src
	file, err := decorator.Parse(src)
	if err != nil {
		return "", err
	}

	if file == nil {
		return "", fmt.Errorf("parsed file is nil")
	}

	var buf bytes.Buffer
	newFile := &dst.File{}
	dst.Inspect(file, func(n dst.Node) bool {
		switch decl := n.(type) {
		case *dst.GenDecl:
			if decl.Tok == token.TYPE {
				for _, spec := range decl.Specs {
					typeSpec, ok := spec.(*dst.TypeSpec)
					if ok && typeSpec.Name.Name == name {
						newFile.Decls = append(newFile.Decls, decl)
					}
				}
			}
		case *dst.FuncDecl:
			if decl.Recv != nil && len(decl.Recv.List) > 0 {
				if recvTypeName(decl) == name {
					newFile.Decls = append(newFile.Decls, decl)
				}
			}
		}
		return true
	})

	newFile.Name = dst.NewIdent("dummy")
	decorator.Fprint(&buf, newFile)
	return cleanCode(buf.String())
}
