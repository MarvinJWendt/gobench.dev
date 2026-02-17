package counter

import (
	"sync"
	"testing"
)

var intCounterWithMutexSink uint64

type IntCounterWithMutex struct {
	count uint64
	mu    sync.Mutex
}

func (c *IntCounterWithMutex) increment() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.count++
}

func (c *IntCounterWithMutex) get() uint64 {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.count
}

func BenchmarkIntCounterWithMutex_increment(b *testing.B) {
	var counter IntCounterWithMutex

	for i := 0; i < b.N; i++ {
		counter.increment()
	}
}

func BenchmarkIntCounterWithMutex_get(b *testing.B) {
	var counter IntCounterWithMutex

	for i := 0; i < b.N; i++ {
		intCounterWithMutexSink = counter.get()
	}
}
