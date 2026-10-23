# SÆPHRIX-X – KI-Startzentrale

Statische Website (`index.html`, Netlify) plus neues **Backend** (`backend/`): Node.js/Express, PostgreSQL, Multi-KI mit Fallback, JWT, WebSocket.

## Schnellstart (Docker)
```bash
cp backend/.env.example backend/.env
# JWT_SECRET und ENCRYPTION_KEY setzen: openssl rand -hex 32
export POSTGRES_PASSWORD=$(openssl rand -hex 16)
docker compose up -d --build                  # Backend + Postgres
docker compose --profile local-ai up -d       # + Ollama (offline-Modelle)
docker compose exec ollama ollama pull llama3.1
curl localhost:3000/health
```
Ohne Docker: `cd backend && npm ci && npm start` (benötigt `DATABASE_URL`). Tests: `npm test`.
Migrationen laufen automatisch beim Start (`npm run migrate` manuell).

## KI-Provider
OpenAI, Anthropic, Gemini, Meta (Llama über OpenAI-kompatiblen Endpunkt via `META_BASE_URL`) und lokal Ollama. `AI_PROVIDER_ORDER` bestimmt die Fallback-Kette; fehlschlagende Provider werden übersprungen. Für reinen Offline-Betrieb nur Ollama konfigurieren (`AI_PROVIDER_ORDER=ollama`, keine API-Keys).

## API
Swagger/OpenAPI: `GET /api/openapi.json` (in https://editor.swagger.io ladbar).
- `POST /api/auth/register|login` → JWT
- `GET/POST /api/projects`, `DELETE /api/projects/:id`
- `POST /api/ai/chat {prompt, provider?, projectId?}`, `GET /api/ai/history`, `GET /api/ai/providers`
- WebSocket `/ws`: Subprotokoll `bearer, <JWT>`, Nachricht `{"prompt":"..."}`

## Sicherheit
JWT (HS256, 12 h), bcrypt, Rate-Limiting, Helmet, CORS-Whitelist (`CORS_ORIGINS`), Eingabevalidierung, Prompts/Antworten werden AES-256-GCM-verschlüsselt gespeichert. Das Backend bindet im Compose nur an `127.0.0.1` – für externen Zugriff Reverse-Proxy mit TLS oder VPN verwenden.

## VPN-Setup
1. `docker compose --profile vpn up -d wireguard` (Konfig landet in `vpn/wireguard`; Peers via `PEERS`-Variable des linuxserver-Images) oder OpenVPN: `docker compose run --rm openvpn ovpn_genconfig -u udp://vpn.example.com && docker compose run --rm openvpn ovpn_initpki`.
2. Client-Vorlagen: `vpn/wg0.conf.example`, `vpn/client.ovpn.example` (enthalten DNS-Leak-Schutz und Kill-Switch). Port 51820/udp bzw. 1194/udp in der Firewall freigeben.
3. Test: `curl https://ifconfig.me` und https://dnsleaktest.com über den Tunnel prüfen.
Private Schlüssel/Zertifikate niemals committen (`.gitignore` schützt `vpn/wireguard`, `vpn/openvpn-data`).

## Troubleshooting
- Start bricht ab mit „JWT_SECRET muss…": Secrets ≥ 32 Zeichen setzen.
- `/health` 503: Postgres nicht erreichbar → `docker compose logs db`.
- 503 „Kein KI-Provider": Keys oder `OLLAMA_BASE_URL` setzen; `GET /api/ai/providers` prüfen.
- 502: alle Provider fehlgeschlagen (Details in Logs, Key/Modellname/Netzwerk prüfen).
- WebSocket 4401: JWT fehlt/abgelaufen; Origin muss in `CORS_ORIGINS` stehen.
- Ollama langsam/fehlt Modell: `ollama pull <modell>`.

## Hinweis
Ein eigenes Betriebssystem ist nicht Teil dieses Backends; die Plattform dient als KI-gestützte Zentrale zur Projektführung (Projekte + Chat-Verlauf).
