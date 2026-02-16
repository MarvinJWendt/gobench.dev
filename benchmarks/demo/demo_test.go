package demo

import (
	"testing"
	"time"
)

func BenchmarkSlowerOverTime_run(b *testing.B) {
	for i := 0; i < b.N; i++ {
		time.Sleep(time.Duration(i/50) * time.Nanosecond)
	}
}

func BenchmarkFasterOverTime_run(b *testing.B) {
	const maxDelay = 1000 // Maximum delay in nanoseconds
	for i := 0; i < b.N; i++ {
		// Calculate the sleep duration, ensuring it's never less than 0
		delay := maxDelay - i
		if delay < 0 {
			delay = 0
		}
		time.Sleep(time.Duration(delay) * time.Nanosecond)
	}
}

func BenchmarkFasterWithMoreCPUCores_run(b *testing.B) {
	done := make(chan bool)

	for i := 0; i < b.N; i++ {
		go func() {
			// Increase the workload inside the goroutine
			time.Sleep(10000000 * time.Nanosecond)

			done <- true
		}()
	}

	// Wait for all goroutines to finish
	for i := 0; i < b.N; i++ {
		<-done
	}
}