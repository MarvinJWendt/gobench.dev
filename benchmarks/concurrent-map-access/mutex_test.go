package concurrent_map_access

import (
	"sync"
	"testing"
)

func BenchmarkMutex_write(b *testing.B) {
	var mu sync.RWMutex
	m := make(map[int]int)

	b.RunParallel(func(pb *testing.PB) {
		i := 0
		for pb.Next() {
			mu.Lock()
			m[i%mapSize] = i
			mu.Unlock()
			i++
		}
	})
}

func BenchmarkMutex_read(b *testing.B) {
	var mu sync.RWMutex
	m := make(map[int]int, mapSize)
	for i := range mapSize {
		m[i] = i
	}

	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		i := 0
		for pb.Next() {
			mu.RLock()
			_ = m[i%mapSize]
			mu.RUnlock()
			i++
		}
	})
}
