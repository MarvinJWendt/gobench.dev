package string_concatination

import (
	"strings"
	"testing"
)

// BenchmarkAppendToSliceAndJoin collects strings in a slice and uses
// strings.Join to produce the final result.
func BenchmarkAppendToSliceAndJoin_write(b *testing.B) {
	var s []string
	for i := 0; i < b.N; i++ {
		s = append(s, "a")
	}
	sink = strings.Join(s, "")
}

func BenchmarkAppendToSliceAndJoin_read(b *testing.B) {
	var s []string
	for i := 0; i < setupCount; i++ {
		s = append(s, "a")
	}
	b.ResetTimer()

	// Join iterates through all elements and allocates the final string.
	for i := 0; i < b.N; i++ {
		sink = strings.Join(s, "")
	}
}
