package array_vs_slice

import "testing"

func BenchmarkDynamicSlice_run(b *testing.B) {
	for i := 0; i < b.N; i++ {
		var slice []int
		for j := 0; j < size; j++ {
			slice = append(slice, j)
		}
		sink = slice[size-1]
	}
}
