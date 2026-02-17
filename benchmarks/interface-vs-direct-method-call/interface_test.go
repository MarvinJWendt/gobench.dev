package interface_vs_direct_method_call

import "testing"

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
