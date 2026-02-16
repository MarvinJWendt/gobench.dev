package logger

import (
	"log/slog"
	"os"

	"github.com/charmbracelet/log"
)

func New(debug bool) *slog.Logger {
	handler := log.New(os.Stderr)
	return slog.New(handler)
}
