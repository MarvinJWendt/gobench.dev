package string_concatination

import (
	"strings"
	"testing"
)

func BenchmarkAppendToSliceAndJoin_write(b *testing.B) {
	var s []string
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		s = append(s, "a")
	}
}

func BenchmarkAppendToSliceAndJoin_read(b *testing.B) {
	var s []string
	for i := 0; i < readCount; i++ {
		s = append(s, "a")
	}
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_ = strings.Join(s, "")
	}
}