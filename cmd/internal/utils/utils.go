package utils

import (
	"os"
	"path/filepath"
	"unicode"
)

func WalkOverBenchmarks(basePath string, f func(path string) error) error {
	return filepath.Walk(basePath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip the base benchmarks directory
		if path == basePath {
			return nil
		}

		if info.IsDir() {
			return f(path)
		}

		return nil
	})
}

func SplitCamelCase(src string) []string {
	var result []string
	var wordStart int
	var lastIsUpper bool

	for i, r := range src {
		isUpper := unicode.IsUpper(r)
		if isUpper && !lastIsUpper && i != wordStart {
			result = append(result, src[wordStart:i])
			wordStart = i
		} else if !isUpper && lastIsUpper && i != wordStart+1 {
			result = append(result, src[wordStart:i-1])
			wordStart = i - 1
		}
		if i == len(src)-1 {
			result = append(result, src[wordStart:])
		}
		lastIsUpper = isUpper
	}

	return result
}

func allCaps(s string) bool {
	for _, r := range s {
		if !unicode.IsUpper(r) {
			return false
		}
	}
	return true
}
