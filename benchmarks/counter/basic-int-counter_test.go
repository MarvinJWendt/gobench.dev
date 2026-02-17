package counter

import (
	"testing"
)

// sink prevents dead-code elimination by the compiler.
var intCounterSink uint64

type IntCounter struct {
	count uint64
}

func (c *IntCounter) increment() {
	c.count++
}

func (c *IntCounter) get() uint64 {
	return c.count
}

func BenchmarkIntCounter_increment(b *testing.B) {
	var counter IntCounter

	for i := 0; i < b.N; i++ {
		counter.increment()
	}
}

func BenchmarkIntCounter_get(b *testing.B) {
	var counter IntCounter

	for i := 0; i < b.N; i++ {
		intCounterSink = counter.get()
	}
}
