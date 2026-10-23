package main

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/kristallix250-byte/SeaphriX-/backend/internal/psychology"
)

const maxRequestBytes = 1 << 16

type motivationRequest struct {
	Project     string   `json:"project"`
	Autonomy    *float64 `json:"autonomy"`
	Competence  *float64 `json:"competence"`
	Relatedness *float64 `json:"relatedness"`
}

func validScore(score *float64) bool {
	return score != nil && *score >= 0 && *score <= 1
}

func inputError(w http.ResponseWriter, err error) {
	var tooLarge *http.MaxBytesError
	if errors.As(err, &tooLarge) {
		http.Error(w, "Anfrage ist größer als 64 KiB", http.StatusRequestEntityTooLarge)
		return
	}
	http.Error(w, "genau ein gültiges JSON-Objekt erwartet", http.StatusBadRequest)
}

func newHandler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})
	mux.HandleFunc("/api/motivation", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			http.Error(w, "nur POST", http.StatusMethodNotAllowed)
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, maxRequestBytes)
		defer r.Body.Close()
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		var req motivationRequest
		if err := decoder.Decode(&req); err != nil {
			inputError(w, err)
			return
		}
		// EOF validates the complete body, including trailing whitespace and size.
		if err := decoder.Decode(&struct{}{}); err != io.EOF {
			inputError(w, err)
			return
		}
		if !validScore(req.Autonomy) || !validScore(req.Competence) || !validScore(req.Relatedness) {
			http.Error(w, "autonomy, competence und relatedness müssen Zahlen zwischen 0 und 1 sein", http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"message": psychology.Message(
			psychology.Profile{Autonomy: *req.Autonomy, Competence: *req.Competence, Relatedness: *req.Relatedness}, req.Project)})
	})
	return mux
}

func newServer(addr string) *http.Server {
	return &http.Server{
		Addr:              addr,
		Handler:           newHandler(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
}

func main() {
	addr := os.Getenv("SAEPHRIX_ADDR")
	if addr == "" {
		addr = "127.0.0.1:8080"
	}
	log.Printf("SÆPHRIX-X lauscht auf %s", addr)
	log.Fatal(newServer(addr).ListenAndServe())
}
