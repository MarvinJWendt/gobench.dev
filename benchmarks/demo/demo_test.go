package demo

import (
	"runtime"
	"sync"
	"testing"
)

func BenchmarkFasterOverTime_run(b *testing.B) {
	const maxWork = 5000
	for i := 0; i < b.N; i++ {
		// Work decreases as i grows, reaching zero after maxWork iterations
		work := maxWork - i
		if work < 0 {
			work = 0
		}
		s := 0
		for j := 0; j < work; j++ {
			s += j
		}
		runtime.KeepAlive(s)
	}
}

func BenchmarkSlowerOverTime_run(b *testing.B) {
	for i := 0; i < b.N; i++ {
		// Work increases linearly with each iteration
		s := 0
		for j := 0; j < i; j++ {
			s += j
		}
		runtime.KeepAlive(s)
	}
}

func BenchmarkFasterWithMoreCPUCores_run(b *testing.B) {
	var wg sync.WaitGroup
	wg.Add(b.N)
	for i := 0; i < b.N; i++ {
		go func() {
			defer wg.Done()
			// CPU-bound work that benefits from parallelism
			s := 0
			for j := 0; j < 50000; j++ {
				s += j
			}
			runtime.KeepAlive(s)
		}()
	}
	wg.Wait()
}
