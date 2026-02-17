package parser

import (
	"strings"
	"testing"
)

func TestGetBenchmarkCode_withStructDeps(t *testing.T) {
	src := `
type AtomicPointerCounter struct {
	count uint64
}

func (c *AtomicPointerCounter) increment() {
	// increment logic
}

func (c *AtomicPointerCounter) get() uint64 {
	return 0
}

func BenchmarkAtomicPointerCounter_increment(b *testing.B) {
	var counter AtomicPointerCounter
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		counter.increment()
	}
}

func BenchmarkAtomicPointerCounter_get(b *testing.B) {
	var counter AtomicPointerCounter
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		counter.get()
	}
}
`

	got, err := getBenchmarkCode(src, "AtomicPointerCounter")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Should include the struct definition
	if !strings.Contains(got, "type AtomicPointerCounter struct") {
		t.Error("expected struct definition in output")
	}

	// Should include receiver methods
	if !strings.Contains(got, "func (c *AtomicPointerCounter) increment()") {
		t.Error("expected increment method in output")
	}
	if !strings.Contains(got, "func (c *AtomicPointerCounter) get()") {
		t.Error("expected get method in output")
	}

	// Should include benchmark functions
	if !strings.Contains(got, "func BenchmarkAtomicPointerCounter_increment") {
		t.Error("expected benchmark increment function in output")
	}
	if !strings.Contains(got, "func BenchmarkAtomicPointerCounter_get") {
		t.Error("expected benchmark get function in output")
	}

	// Struct should appear before benchmark functions
	structIdx := strings.Index(got, "type AtomicPointerCounter struct")
	benchIdx := strings.Index(got, "func BenchmarkAtomicPointerCounter_increment")
	if structIdx > benchIdx {
		t.Error("struct definition should appear before benchmark functions")
	}

	t.Logf("output:\n%s", got)
}

func TestGetBenchmarkCode_withInterfaceDeps(t *testing.T) {
	src := `
type Interface interface {
	Method()
}

type InterfaceStruct struct{}

func (m InterfaceStruct) Method() {}

func BenchmarkInterfaceMethodCall_run(b *testing.B) {
	var s Interface = InterfaceStruct{}
	for i := 0; i < b.N; i++ {
		s.Method()
	}
}
`

	got, err := getBenchmarkCode(src, "InterfaceMethodCall")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Should include both the interface and the struct
	if !strings.Contains(got, "type Interface interface") {
		t.Error("expected Interface definition in output")
	}
	if !strings.Contains(got, "type InterfaceStruct struct") {
		t.Error("expected InterfaceStruct definition in output")
	}
	if !strings.Contains(got, "func (m InterfaceStruct) Method()") {
		t.Error("expected Method receiver in output")
	}
	if !strings.Contains(got, "func BenchmarkInterfaceMethodCall_run") {
		t.Error("expected benchmark function in output")
	}

	t.Logf("output:\n%s", got)
}

func TestGetBenchmarkCode_simpleNoDeps(t *testing.T) {
	src := `
func BenchmarkSimpleAppend_write(b *testing.B) {
	var s string
	for i := 0; i < b.N; i++ {
		s = s + "a"
	}
}

func BenchmarkSimpleAppend_read(b *testing.B) {
	var s string
	s = s + "a"
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = s
	}
}
`

	got, err := getBenchmarkCode(src, "SimpleAppend")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Should include both benchmark functions
	if !strings.Contains(got, "func BenchmarkSimpleAppend_write") {
		t.Error("expected write benchmark in output")
	}
	if !strings.Contains(got, "func BenchmarkSimpleAppend_read") {
		t.Error("expected read benchmark in output")
	}

	// Should NOT include any type definitions
	if strings.Contains(got, "type ") {
		t.Error("simple benchmark should not include type definitions")
	}

	t.Logf("output:\n%s", got)
}

func TestGetBenchmarkCode_withHelperFunc(t *testing.T) {
	src := `
func helperSetup() []int {
	return []int{1, 2, 3}
}

func unrelatedFunc() {}

func BenchmarkCustom_run(b *testing.B) {
	data := helperSetup()
	for i := 0; i < b.N; i++ {
		_ = data
	}
}
`

	got, err := getBenchmarkCode(src, "Custom")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Should include the referenced helper
	if !strings.Contains(got, "func helperSetup()") {
		t.Error("expected helperSetup function in output")
	}

	// Should NOT include the unrelated function
	if strings.Contains(got, "unrelatedFunc") {
		t.Error("should not include unrelated functions")
	}

	// Should include the benchmark
	if !strings.Contains(got, "func BenchmarkCustom_run") {
		t.Error("expected benchmark function in output")
	}

	t.Logf("output:\n%s", got)
}

func TestGetBenchmarkCode_doesNotIncludeUnrelatedTypes(t *testing.T) {
	src := `
type BubbleSort struct{}

func (s *BubbleSort) sort(data []int) {}

type QuickSort struct{}

func (s *QuickSort) sort(data []int) {}

func BenchmarkBubbleSort_sort(b *testing.B) {
	var s BubbleSort
	for i := 0; i < b.N; i++ {
		s.sort(nil)
	}
}

func BenchmarkQuickSort_sort(b *testing.B) {
	var s QuickSort
	for i := 0; i < b.N; i++ {
		s.sort(nil)
	}
}
`

	got, err := getBenchmarkCode(src, "BubbleSort")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Should include BubbleSort and its method
	if !strings.Contains(got, "type BubbleSort struct") {
		t.Error("expected BubbleSort definition in output")
	}
	if !strings.Contains(got, "func (s *BubbleSort) sort") {
		t.Error("expected BubbleSort sort method in output")
	}

	// Should NOT include QuickSort
	if strings.Contains(got, "QuickSort") {
		t.Error("should not include QuickSort in BubbleSort benchmark code")
	}

	// Should include the benchmark function
	if !strings.Contains(got, "func BenchmarkBubbleSort_sort") {
		t.Error("expected benchmark function in output")
	}

	// Should NOT include QuickSort's benchmark
	if strings.Contains(got, "BenchmarkQuickSort") {
		t.Error("should not include QuickSort benchmark")
	}

	t.Logf("output:\n%s", got)
}
