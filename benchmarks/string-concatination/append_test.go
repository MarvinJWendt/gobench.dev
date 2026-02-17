package string_concatination

import (
	"testing"
)

// BenchmarkSimpleAppend uses the + operator for string concatenation.
// Each append copies the entire string, making the total cost O(n²).
func BenchmarkSimpleAppend_write(b *testing.B) {
	var s string
	for i := 0; i < b.N; i++ {
		s += "a"
	}
	sink = s
}

func BenchmarkSimpleAppend_read(b *testing.B) {
	var s string
	for i := 0; i < setupCount; i++ {
		s += "a"
	}
	b.ResetTimer()

	// The result is already a string, so reading is essentially free.
	for i := 0; i < b.N; i++ {
		sink = s
	}
}
