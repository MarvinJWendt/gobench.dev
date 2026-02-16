package string_concatination

import (
	"bytes"
	"testing"
)

func BenchmarkBuffer_write(b *testing.B) {
	var buf bytes.Buffer
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		buf.WriteString("a")
	}
}

func BenchmarkBuffer_read(b *testing.B) {
	var buf bytes.Buffer
	for i := 0; i < readCount; i++ {
		buf.WriteString("a")
	}
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_ = buf.String()
	}
}
