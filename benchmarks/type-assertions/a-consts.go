package type_assertions

// Doer is a minimal interface for benchmarking type assertion mechanisms.
type Doer interface {
	Do() int
}

type concreteDoer struct{}

func (concreteDoer) Do() int { return 42 }

// Sinks to prevent dead-code elimination.
var (
	sinkInt  int
	sinkBool bool
)
