package counter

import (
	"sync/atomic"
	"testing"
)

type AtomicPointerCounter struct {
	count uint64
}

func (c *AtomicPointerCounter) increment() {
	atomic.AddUint64(&c.count, 1)
}

func (c *AtomicPointerCounter) get() uint64 {
	return atomic.LoadUint64(&c.count)
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
