package type_assertions

import (
	"reflect"
	"testing"
)

func BenchmarkReflectionTypeOf_run(b *testing.B) {
	var d Doer = concreteDoer{}
	target := reflect.TypeOf(concreteDoer{})
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		// Reflection-based type check using reflect.TypeOf
		if reflect.TypeOf(d) == target {
			sinkInt = d.Do()
		}
	}
}
