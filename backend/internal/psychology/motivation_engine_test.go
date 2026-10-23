package psychology

import "testing"

func TestWeakestNeed(t *testing.T) {
	if (Profile{0.9, 0.2, 0.5}).WeakestNeed() != Competence {
		t.Fatal("Kompetenz erwartet")
	}
	if (Profile{0.9, 0.8, 0.1}).WeakestNeed() != Relatedness {
		t.Fatal("Verbundenheit erwartet")
	}
	if Message(Profile{0.1, 0.5, 0.5}, "") == "" {
		t.Fatal("Nachricht erwartet")
	}
}
