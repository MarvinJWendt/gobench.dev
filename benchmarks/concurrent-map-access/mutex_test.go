package concurrent_map_access

import (
	"sync"
	"testing"
)

func BenchmarkMutex_run(b *testing.B) {
	var m = make(map[int]int)
	var mutex sync.Mutex
	var wg sync.WaitGroup

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		wg.Add(2)

		go func() {
			mutex.Lock()
			m[i] = i
			mutex.Unlock()
			wg.Done()
		}()

		go func() {
			mutex.Lock()
			_ = m[i]
			mutex.Unlock()
			wg.Done()
		}()

		wg.Wait()
	}
}
