package main

import (
	"encoding/json"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestMotivationRejectsInvalidRequests(t *testing.T) {
	valid := `{"project":"SÆPHRIX","autonomy":0.2,"competence":0.5,"relatedness":0.8}`
	cases := []struct {
		name string
		body string
		want int
	}{
		{"empty body", "", http.StatusBadRequest},
		{"empty object", `{}`, http.StatusBadRequest},
		{"null object", `null`, http.StatusBadRequest},
		{"missing autonomy", `{"competence":0.5,"relatedness":0.8}`, http.StatusBadRequest},
		{"missing competence", `{"autonomy":0.2,"relatedness":0.8}`, http.StatusBadRequest},
		{"missing relatedness", `{"autonomy":0.2,"competence":0.5}`, http.StatusBadRequest},
		{"null score", `{"autonomy":null,"competence":0.5,"relatedness":0.8}`, http.StatusBadRequest},
		{"negative autonomy", `{"autonomy":-0.1,"competence":0.5,"relatedness":0.8}`, http.StatusBadRequest},
		{"high competence", `{"autonomy":0.2,"competence":1.1,"relatedness":0.8}`, http.StatusBadRequest},
		{"negative relatedness", `{"autonomy":0.2,"competence":0.5,"relatedness":-1}`, http.StatusBadRequest},
		{"string score", `{"autonomy":"0.2","competence":0.5,"relatedness":0.8}`, http.StatusBadRequest},
		{"overflow", `{"autonomy":1e999,"competence":0.5,"relatedness":0.8}`, http.StatusBadRequest},
		{"unknown field", strings.TrimSuffix(valid, "}") + `,"extra":true}`, http.StatusBadRequest},
		{"second object", valid + `{}`, http.StatusBadRequest},
		{"second null", valid + `null`, http.StatusBadRequest},
		{"trailing garbage", valid + `invalid`, http.StatusBadRequest},
		{"oversized project", `{"project":"` + strings.Repeat("x", 1<<16) + `","autonomy":0.2,"competence":0.5,"relatedness":0.8}`, http.StatusRequestEntityTooLarge},
		{"oversized whitespace", valid + strings.Repeat(" ", 1<<16), http.StatusRequestEntityTooLarge},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			response := httptest.NewRecorder()
			newHandler().ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/api/motivation", strings.NewReader(tc.body)))
			if response.Code != tc.want {
				t.Fatalf("status = %d, want %d; body = %q", response.Code, tc.want, response.Body.String())
			}
		})
	}
}

func TestMotivationAcceptsBoundariesAndSelectsNeed(t *testing.T) {
	cases := []struct {
		name string
		body string
		text string
	}{
		{"zero autonomy", `{"project":"SÆPHRIX","autonomy":0,"competence":1,"relatedness":1}`, "Du entscheidest"},
		{"zero competence", `{"project":"SÆPHRIX","autonomy":1,"competence":0,"relatedness":1}`, "Ein kleiner nächster Schritt"},
		{"zero relatedness", `{"project":"SÆPHRIX","autonomy":1,"competence":1,"relatedness":0}`, "nicht allein"},
		{"optional project", `{"autonomy":1,"competence":1,"relatedness":1}` + "\n\t ", "dein Projekt"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			response := httptest.NewRecorder()
			newHandler().ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/api/motivation", strings.NewReader(tc.body)))
			if response.Code != http.StatusOK {
				t.Fatalf("status = %d; body = %q", response.Code, response.Body.String())
			}
			if response.Header().Get("Content-Type") != "application/json" {
				t.Fatal("JSON content type expected")
			}
			var result struct{ Message string }
			if err := json.Unmarshal(response.Body.Bytes(), &result); err != nil || !strings.Contains(result.Message, tc.text) {
				t.Fatalf("unexpected response: %q, %v", response.Body.String(), err)
			}
		})
	}
}

func TestHealthAndMethodContract(t *testing.T) {
	handler := newHandler()
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/health", nil))
	if response.Code != http.StatusOK || strings.TrimSpace(response.Body.String()) != `{"status":"ok"}` {
		t.Fatalf("unexpected health response: %d %q", response.Code, response.Body.String())
	}
	response = httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/api/motivation", nil))
	if response.Code != http.StatusMethodNotAllowed || response.Header().Get("Allow") != "POST" {
		t.Fatalf("expected 405 with Allow: POST; got %d", response.Code)
	}
}

func TestSlowHeadersAreClosed(t *testing.T) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	server := newServer(listener.Addr().String())
	done := make(chan error, 1)
	go func() { done <- server.Serve(listener) }()
	t.Cleanup(func() {
		server.Close()
		if err := <-done; err != http.ErrServerClosed {
			t.Errorf("server exited: %v", err)
		}
	})
	conn, err := net.Dial("tcp", listener.Addr().String())
	if err != nil {
		t.Fatal(err)
	}
	defer conn.Close()
	if err := conn.SetDeadline(time.Now().Add(7 * time.Second)); err != nil {
		t.Fatal(err)
	}
	if _, err := io.WriteString(conn, "GET /health HTTP/1.1\r\nHost: localhost\r\nX-Slow: "); err != nil {
		t.Fatal(err)
	}
	if _, err := io.ReadAll(conn); err != nil {
		t.Fatalf("server did not close the unfinished request within its header limit: %v", err)
	}
}
