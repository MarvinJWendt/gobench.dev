package type_assertions

import "testing"

func BenchmarkTypeAssertion_run(b *testing.B) {
	var d Doer = concreteDoer{}
	for i := 0; i < b.N; i++ {
		// Direct type assertion — panics if the type doesn't match
		v := d.(concreteDoer)
		sinkInt = v.Do()
	}
}
