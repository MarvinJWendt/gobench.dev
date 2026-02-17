package fmt

import (
	"fmt"
	"os"
	"testing"
)

const s = "Hello, World!"

func BenchmarkFmt_println(b *testing.B) {
	os.Stdout, _ = os.Open(os.DevNull)

	for i := 0; i < b.N; i++ {
		fmt.Println(s)
	}
}

func BenchmarkFmt_print(b *testing.B) {
	os.Stdout, _ = os.Open(os.DevNull)

	for i := 0; i < b.N; i++ {
		fmt.Print(s)
	}
}

func BenchmarkFmt_printf(b *testing.B) {
	os.Stdout, _ = os.Open(os.DevNull)

	for i := 0; i < b.N; i++ {
		fmt.Printf("%s\n", s)
	}
}
