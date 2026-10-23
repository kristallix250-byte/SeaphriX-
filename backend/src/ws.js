'use strict';
const { WebSocketServer } = require('ws');
const { verify } = require('./middleware/auth');
const { runChat } = require('./chat');
const log = require('./logger');

// Authentifizierung über Sec-WebSocket-Protocol: "bearer, <jwt>" (kein Token in der URL/Logs).
function attachWebSocket(server, allowedOrigins) {
  const wss = new WebSocketServer({
    server, path: '/ws', maxPayload: 64 * 1024,
    handleProtocols: (protocols) => (protocols.has('bearer') ? 'bearer' : false),
    verifyClient: ({ origin }) => !origin || !allowedOrigins.length || allowedOrigins.includes(origin),
  });
  wss.on('connection', (ws, req) => {
    let userId;
    try {
      const token = String(req.headers['sec-websocket-protocol'] || '').split(',').map((s) => s.trim())[1];
      userId = verify(token).sub;
    } catch {
      return ws.close(4401, 'unauthorized');
    }
    let busy = false;
    ws.on('message', async (raw) => {
      if (busy) return ws.send(JSON.stringify({ type: 'error', error: 'Anfrage läuft bereits' }));
      busy = true;
      try {
        const msg = JSON.parse(raw.toString());
        ws.send(JSON.stringify({ type: 'result', ...(await runChat(userId, msg)) }));
      } catch (e) {
        log.warn('ws error', { error: e.message });
        ws.send(JSON.stringify({ type: 'error', error: e.status && e.status < 500 ? e.message : 'Interner Fehler' }));
      } finally { busy = false; }
    });
  });
  return wss;
}

module.exports = { attachWebSocket };
