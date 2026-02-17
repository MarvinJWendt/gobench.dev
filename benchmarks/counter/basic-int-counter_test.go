package counter

import (
	"testing"
)

type IntCounter struct {
	count uint64
}

func (c IntCounter) increment() {
	c.count++
}

func (c IntCounter) get() uint64 {
	return c.count
}

func BenchmarkIntCounter_increment(b *testing.B) {
	var counter IntCounter
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		counter.increment()
	}
}

func BenchmarkIntCounter_get(b *testing.B) {
	var counter IntCounter
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		counter.get()
	}
}