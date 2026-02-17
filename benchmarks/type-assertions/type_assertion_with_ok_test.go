package type_assertions

import "testing"

func BenchmarkTypeAssertionWithOk_run(b *testing.B) {
	var d Doer = concreteDoer{}
	for i := 0; i < b.N; i++ {
		// Comma-ok assertion — safe, never panics on mismatch
		v, ok := d.(concreteDoer)
		if ok {
			sinkInt = v.Do()
		}
	}
}
