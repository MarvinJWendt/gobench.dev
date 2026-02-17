package type_assertions

import "testing"

func BenchmarkTypeSwitch_run(b *testing.B) {
	var d Doer = concreteDoer{}
	for i := 0; i < b.N; i++ {
		// Type switch to determine the concrete type
		switch v := d.(type) {
		case concreteDoer:
			sinkInt = v.Do()
		}
	}
}
