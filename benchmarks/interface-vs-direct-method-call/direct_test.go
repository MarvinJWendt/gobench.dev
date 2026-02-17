package interface_vs_direct_method_call

import "testing"

type DirectStruct struct{}

func (m DirectStruct) Method() {}

func BenchmarkDirectMethodCall_run(b *testing.B) {
	s := DirectStruct{}
	for i := 0; i < b.N; i++ {
		s.Method()
	}
}
