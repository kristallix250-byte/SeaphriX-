package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/kristallix250-byte/SeaphriX-/backend/internal/psychology"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})
	mux.HandleFunc("/api/motivation", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "nur POST", http.StatusMethodNotAllowed)
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, 1<<16)
		var req struct {
			Project                           string
			Autonomy, Competence, Relatedness float64
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "ungültige Eingabe", http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"message": psychology.Message(
			psychology.Profile{Autonomy: req.Autonomy, Competence: req.Competence, Relatedness: req.Relatedness}, req.Project)})
	})
	addr := os.Getenv("SAEPHRIX_ADDR")
	if addr == "" {
		addr = "127.0.0.1:8080"
	}
	log.Printf("SÆPHRIX-X lauscht auf %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
