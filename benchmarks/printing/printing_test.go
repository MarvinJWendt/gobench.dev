package printing

import (
	"fmt"
	"io"
	"os"
	"testing"
)

const s = "Hello, World!"

// Print writes to stdout.
func BenchmarkPrint_run(b *testing.B) {
	os.Stdout, _ = os.Open(os.DevNull)

	for i := 0; i < b.N; i++ {
		fmt.Print(s)
	}
}

// Println writes to stdout with a trailing newline.
func BenchmarkPrintln_run(b *testing.B) {
	os.Stdout, _ = os.Open(os.DevNull)

	for i := 0; i < b.N; i++ {
		fmt.Println(s)
	}
}

// Printf writes a formatted string to stdout.
func BenchmarkPrintf_run(b *testing.B) {
	os.Stdout, _ = os.Open(os.DevNull)

	for i := 0; i < b.N; i++ {
		fmt.Printf("%s\n", s)
	}
}

// Fprint writes to an io.Writer.
func BenchmarkFprint_run(b *testing.B) {
	for i := 0; i < b.N; i++ {
		fmt.Fprint(io.Discard, s)
	}
}

// Fprintln writes to an io.Writer with a trailing newline.
func BenchmarkFprintln_run(b *testing.B) {
	for i := 0; i < b.N; i++ {
		fmt.Fprintln(io.Discard, s)
	}
}

// Fprintf writes a formatted string to an io.Writer.
func BenchmarkFprintf_run(b *testing.B) {
	for i := 0; i < b.N; i++ {
		fmt.Fprintf(io.Discard, "%s\n", s)
	}
}
