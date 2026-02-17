package counter

import (
	"sync/atomic"
	"testing"
)

var atomicUintCounterSink uint64

type AtomicUintCounter struct {
	count atomic.Uint64
}

func (c *AtomicUintCounter) increment() {
	c.count.Add(1)
}

func (c *AtomicUintCounter) get() uint64 {
	return c.count.Load()
}

func BenchmarkAtomicUintCounter_increment(b *testing.B) {
	var counter AtomicUintCounter

	for i := 0; i < b.N; i++ {
		counter.increment()
	}
}

func BenchmarkAtomicUintCounter_get(b *testing.B) {
	var counter AtomicUintCounter

	for i := 0; i < b.N; i++ {
		atomicUintCounterSink = counter.get()
	}
}
