package fmt

import (
	"fmt"
	"os"
	"testing"
)

const s = "Hello, World!"

func BenchmarkFmtPrintln_run(b *testing.B) {
	os.Stdout, _ = os.Open(os.DevNull)

	for i := 0; i < b.N; i++ {
		fmt.Println(s)
	}
}

func BenchmarkFmtPrint_run(b *testing.B) {
	os.Stdout, _ = os.Open(os.DevNull)

	for i := 0; i < b.N; i++ {
		fmt.Print(s)
	}
}

func BenchmarkFmtPrintf_run(b *testing.B) {
	os.Stdout, _ = os.Open(os.DevNull)

	for i := 0; i < b.N; i++ {
		fmt.Printf("%s\n", s)
	}
}
