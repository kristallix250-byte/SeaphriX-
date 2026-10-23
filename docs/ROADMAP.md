# SÆPHRIX-X Roadmap

**Phase 1 (MVP, begonnen):** Go-Backend (`backend/cmd`), Multi-KI-Client mit Fallback (`backend/internal/ai`), Psychologie-Modul (`backend/internal/psychology`).

Geplant: Phase 2 Wissensbasis/RAG, Business-Modul, VPN · Phase 3 Termux-CLI (Deutsch), Build-Tool iOS/Android, Selbstlernen · Phase 4 Public Beta · Phase 5 Öffentliche Zentrale.

## Start
```
go test ./...
go run ./backend/cmd        # http://127.0.0.1:8080/health
docker build -f docker/Dockerfile -t saephrix .
```
