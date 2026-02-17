package array_vs_slice

import "testing"

func BenchmarkArray_run(b *testing.B) {
	var arr [size]int

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		for j := 0; j < size; j++ {
			arr[j] = j
		}
	}

	sink = arr[size-1]
}
