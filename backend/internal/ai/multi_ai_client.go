// Package ai bietet eine einheitliche Schnittstelle für mehrere KI-Anbieter mit Fallback.
package ai

import (
	"context"
	"errors"
	"fmt"
)

// Provider ist ein KI-Anbieter (OpenAI, Anthropic, Gemini, Meta/Ollama, ...).
type Provider interface {
	Name() string
	Complete(ctx context.Context, prompt string) (string, error)
}

// MultiClient probiert Anbieter in Reihenfolge, bis einer antwortet.
type MultiClient struct {
	providers []Provider
}

func NewMultiClient(providers ...Provider) *MultiClient {
	return &MultiClient{providers: providers}
}

// Complete liefert Antwort und Name des antwortenden Anbieters.
func (m *MultiClient) Complete(ctx context.Context, prompt string) (string, string, error) {
	if len(m.providers) == 0 {
		return "", "", errors.New("keine KI-Anbieter konfiguriert")
	}
	var errs []error
	for _, p := range m.providers {
		if err := ctx.Err(); err != nil {
			return "", "", err
		}
		out, err := p.Complete(ctx, prompt)
		if err == nil {
			return out, p.Name(), nil
		}
		errs = append(errs, fmt.Errorf("%s: %w", p.Name(), err))
	}
	return "", "", errors.Join(errs...)
}
