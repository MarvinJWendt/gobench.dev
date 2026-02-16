package array_vs_slice

import "testing"

func BenchmarkPreallocatedSlice_run(b *testing.B) {
	slice := make([]int, 1000) // Define a slice with the same size as the array

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		for j := range slice {
			slice[j] = i
		}

		slice = make([]int, 1000) // Reset the slice
	}
}
