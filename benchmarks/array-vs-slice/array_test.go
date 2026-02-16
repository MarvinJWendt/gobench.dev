package array_vs_slice

import "testing"

func BenchmarkArray_run(b *testing.B) {
	var arr [1000]int // Define an array of fixed size

	b.ResetTimer()

	for i := 0; i < 1_000; i++ {
		for j := range arr {
			arr[j] = i
		}

		arr = [1000]int{} // Reset the array
	}
}