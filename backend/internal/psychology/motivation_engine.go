// Package psychology enthält die Motivations-Engine (Selbstbestimmungstheorie: Autonomie, Kompetenz, Verbundenheit).
package psychology

import "strings"

// Need ist ein Grundbedürfnis nach der Selbstbestimmungstheorie.
type Need string

const (
	Autonomy    Need = "autonomy"
	Competence  Need = "competence"
	Relatedness Need = "relatedness"
)

// Profile beschreibt den Nutzer; Werte jeweils 0..1.
type Profile struct {
	Autonomy, Competence, Relatedness float64
}

// WeakestNeed liefert das am schwächsten erfüllte Bedürfnis.
func (p Profile) WeakestNeed() Need {
	n, v := Autonomy, p.Autonomy
	if p.Competence < v {
		n, v = Competence, p.Competence
	}
	if p.Relatedness < v {
		n = Relatedness
	}
	return n
}

// Message liefert eine passende Motivationsnachricht auf Deutsch.
func Message(p Profile, project string) string {
	project = strings.TrimSpace(project)
	if project == "" {
		project = "dein Projekt"
	}
	switch p.WeakestNeed() {
	case Autonomy:
		return "Du entscheidest, wie es mit " + project + " weitergeht. Welchen nächsten Schritt wählst du?"
	case Competence:
		return "Du hast bei " + project + " schon viel geschafft. Ein kleiner nächster Schritt reicht heute."
	default:
		return "Du bist mit " + project + " nicht allein – ich begleite dich bis zur Fertigstellung."
	}
}
