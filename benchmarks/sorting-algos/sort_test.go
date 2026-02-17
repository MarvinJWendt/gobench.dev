package sorting_algos

import (
	"math/rand"
	"sort"
	"testing"
)

type BuiltinSort struct{}

func (s *BuiltinSort) sort(data []int) {
	sort.Ints(data)
}

func BenchmarkBuiltinSort_sort(b *testing.B) {
	var s BuiltinSort
	for i := 0; i < b.N; i++ {
		data := rand.Perm(1000)
		s.sort(data)
	}
}

type BubbleSort struct{}

func (s *BubbleSort) sort(data []int) {
	n := len(data)
	for i := 0; i < n; i++ {
		for j := 0; j < n-i-1; j++ {
			if data[j] > data[j+1] {
				data[j], data[j+1] = data[j+1], data[j]
			}
		}
	}
}

func BenchmarkBubbleSort_sort(b *testing.B) {
	var s BubbleSort
	for i := 0; i < b.N; i++ {
		data := rand.Perm(1000)
		s.sort(data)
	}
}

type InsertionSort struct{}

func (s *InsertionSort) sort(data []int) {
	for i := 1; i < len(data); i++ {
		key := data[i]
		j := i - 1

		for j >= 0 && data[j] > key {
			data[j+1] = data[j]
			j--
		}
		data[j+1] = key
	}
}

func BenchmarkInsertionSort_sort(b *testing.B) {
	var s InsertionSort
	for i := 0; i < b.N; i++ {
		data := rand.Perm(1000)
		s.sort(data)
	}
}

type SelectionSort struct{}

func (s *SelectionSort) sort(data []int) {
	n := len(data)
	for i := 0; i < n; i++ {
		minIdx := i
		for j := i + 1; j < n; j++ {
			if data[j] < data[minIdx] {
				minIdx = j
			}
		}
		data[i], data[minIdx] = data[minIdx], data[i]
	}
}

func BenchmarkSelectionSort_sort(b *testing.B) {
	var s SelectionSort
	for i := 0; i < b.N; i++ {
		data := rand.Perm(1000)
		s.sort(data)
	}
}

type QuickSort struct{}

func (s *QuickSort) sort(data []int) {
	if len(data) < 2 {
		return
	}

	left, right := 0, len(data)-1
	pivotIndex := rand.Int() % len(data)
	data[pivotIndex], data[right] = data[right], data[pivotIndex]
	for i := range data {
		if data[i] < data[right] {
			data[i], data[left] = data[left], data[i]
			left++
		}
	}
	data[left], data[right] = data[right], data[left]
	s.sort(data[:left])
	s.sort(data[left+1:])
}

func BenchmarkQuickSort_sort(b *testing.B) {
	var s QuickSort
	for i := 0; i < b.N; i++ {
		data := rand.Perm(1000)
		s.sort(data)
	}
}

type MergeSort struct{}

func (s *MergeSort) sort(data []int) []int {
	if len(data) <= 1 {
		return data
	}

	// Divide the array in half
	middle := len(data) / 2
	left := s.sort(data[:middle])
	right := s.sort(data[middle:])

	return s.merge(left, right)
}

func (s *MergeSort) merge(left, right []int) []int {
	var result []int
	leftIndex, rightIndex := 0, 0

	for leftIndex < len(left) && rightIndex < len(right) {
		if left[leftIndex] < right[rightIndex] {
			result = append(result, left[leftIndex])
			leftIndex++
		} else {
			result = append(result, right[rightIndex])
			rightIndex++
		}
	}

	// Append any remaining elements
	result = append(result, left[leftIndex:]...)
	result = append(result, right[rightIndex:]...)

	return result
}

func BenchmarkMergeSort_sort(b *testing.B) {
	var s MergeSort
	for i := 0; i < b.N; i++ {
		data := rand.Perm(1000)
		s.sort(data)
	}
}
