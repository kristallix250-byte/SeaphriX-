package ai

import (
	"context"
	"errors"
	"testing"
)

type fake struct {
	name string
	err  error
}

func (f fake) Name() string { return f.name }
func (f fake) Complete(context.Context, string) (string, error) {
	if f.err != nil {
		return "", f.err
	}
	return "ok", nil
}

func TestFallback(t *testing.T) {
	c := NewMultiClient(fake{"a", errors.New("down")}, fake{"b", nil})
	out, who, err := c.Complete(context.Background(), "hi")
	if err != nil || out != "ok" || who != "b" {
		t.Fatalf("unerwartet: %q %q %v", out, who, err)
	}
}

func TestAllFail(t *testing.T) {
	c := NewMultiClient(fake{"a", errors.New("x")})
	if _, _, err := c.Complete(context.Background(), "hi"); err == nil {
		t.Fatal("Fehler erwartet")
	}
	if _, _, err := NewMultiClient().Complete(context.Background(), "hi"); err == nil {
		t.Fatal("Fehler erwartet")
	}
}
