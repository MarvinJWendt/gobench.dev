package concurrent_map_access

import (
	"sync"
	"testing"
)

func BenchmarkSync_run(b *testing.B) {
	var m sync.Map
	var wg sync.WaitGroup

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		wg.Add(2)

		go func() {
			m.Store(i, i)
			wg.Done()
		}()

		go func() {
			m.Load(i)
			wg.Done()
		}()

		wg.Wait()
	}
}
