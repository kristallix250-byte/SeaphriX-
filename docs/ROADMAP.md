# SÆPHRIX-X Roadmap

**Phase 1 (MVP, begonnen):** Go-Backend (`backend/cmd`), Multi-KI-Client mit Fallback (`backend/internal/ai`), Psychologie-Modul (`backend/internal/psychology`).

Geplant: Phase 2 Wissensbasis/RAG, Business-Modul, VPN · Phase 3 Termux-CLI (Deutsch), Build-Tool iOS/Android, Selbstlernen · Phase 4 Public Beta · Phase 5 Öffentliche Zentrale.

## Start
```
go test ./...
go run ./backend/cmd        # http://127.0.0.1:8080/health
docker build -f docker/Dockerfile -t saephrix .
```

`POST /api/motivation` erwartet genau ein JSON-Objekt mit den Pflichtfeldern
`autonomy`, `competence` und `relatedness` (Zahlen von 0 bis 1 einschließlich).
`project` ist optional. Fehlende Werte, `null`, unbekannte Felder und zusätzliche
JSON-Werte werden mit HTTP 400 abgelehnt; Anfragen über 64 KiB mit HTTP 413.
Der Server begrenzt Header auf 5 Sekunden, Lesen und Schreiben auf je 15 Sekunden
und ungenutzte Keep-alive-Verbindungen auf 60 Sekunden.
