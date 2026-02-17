package array_vs_slice

import "testing"

func BenchmarkPreallocatedSlice_run(b *testing.B) {
	slice := make([]int, size)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		for j := 0; j < size; j++ {
			slice[j] = j
		}
	}

	sink = slice[size-1]
}
