package concurrent_map_access

import (
	"sync"
	"testing"
)

func BenchmarkSync_write(b *testing.B) {
	var m sync.Map

	b.RunParallel(func(pb *testing.PB) {
		i := 0
		for pb.Next() {
			m.Store(i%mapSize, i)
			i++
		}
	})
}

func BenchmarkSync_read(b *testing.B) {
	var m sync.Map
	for i := range mapSize {
		m.Store(i, i)
	}

	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		i := 0
		for pb.Next() {
			m.Load(i % mapSize)
			i++
		}
	})
}
