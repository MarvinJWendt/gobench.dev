package string_concatination

import (
	"strings"
	"testing"
)

// BenchmarkStringBuilder uses strings.Builder which writes to an internal
// byte slice with amortized O(1) appends.
func BenchmarkStringBuilder_write(b *testing.B) {
	var s strings.Builder
	for i := 0; i < b.N; i++ {
		s.WriteString("a")
	}
	sink = s.String()
}

func BenchmarkStringBuilder_read(b *testing.B) {
	var s strings.Builder
	for i := 0; i < setupCount; i++ {
		s.WriteString("a")
	}
	b.ResetTimer()

	// String() uses an unsafe conversion — no allocation.
	for i := 0; i < b.N; i++ {
		sink = s.String()
	}
}
