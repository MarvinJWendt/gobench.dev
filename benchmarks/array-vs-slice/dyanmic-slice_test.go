package array_vs_slice

import "testing"

func BenchmarkDynamicSlice_run(b *testing.B) {
	var slice []int // Define a dynamic slice

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		for j := 0; j < 1000; j++ {
			slice = append(slice, i)
		}

		slice = []int{} // Reset the slice
	}
}