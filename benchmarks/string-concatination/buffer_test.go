package string_concatination

import (
	"bytes"
	"testing"
)

// BenchmarkBuffer uses bytes.Buffer which writes to an internal byte slice
// with amortized O(1) appends, similar to strings.Builder.
func BenchmarkBuffer_write(b *testing.B) {
	var buf bytes.Buffer
	for i := 0; i < b.N; i++ {
		buf.WriteString("a")
	}
	sink = buf.String()
}

func BenchmarkBuffer_read(b *testing.B) {
	var buf bytes.Buffer
	for i := 0; i < setupCount; i++ {
		buf.WriteString("a")
	}
	b.ResetTimer()

	// String() copies the internal buffer into a new string (allocates).
	for i := 0; i < b.N; i++ {
		sink = buf.String()
	}
}
