package string_concatination

import (
	"strings"
	"testing"
)

func BenchmarkStringBuilder_write(b *testing.B) {
	var s strings.Builder
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		s.WriteString("a")
	}
}

func BenchmarkStringBuilder_read(b *testing.B) {
	var s strings.Builder
	for i := 0; i < readCount; i++ {
		s.WriteString("a")
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_ = s.String()
	}
}
