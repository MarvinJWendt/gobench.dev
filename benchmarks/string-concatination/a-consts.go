package string_concatination

const (
	// setupCount is the number of writes during setup for read benchmarks.
	setupCount = 10_000
)

// sink prevents the compiler from eliminating benchmark results.
var sink string
