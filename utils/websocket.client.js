const WebSocketClient = require('websocket').client;
const CONFIG = require('../build/config');

const connectionMaps = new Map();
const wsMaps = new Map();

function geWebsocketClient(connectionId) {
  if (connectionMaps.has(connectionId)) {
    return connectionMaps.get(connectionId);
  }
  const wsClient = new WebSocketClient();
  wsClient.connect(`ws://localhost:${CONFIG.PORT}/from=server&id=${connectionId}`, 'echo-protocol');
  connectionMaps.set(connectionId, wsClient);
  return wsClient;
}

function getWs(connectionId) {
  if (wsMaps.has(connectionId)) {
    return wsMaps.get(connectionId);
  }
  return null;
}

function removeConnectionFromMap(connectionId) {
  wsMaps.delete(connectionId);
  connectionMaps.delete(connectionId);
}

const WsClient = {
  connect(connectionId) {
    const clientInstance = geWebsocketClient(connectionId);

    return new Promise((resolve) => {
      clientInstance.on('connectFailed', (error) => {
        console.log(`[ws client] Connect Error: ${error.toString()}`);
      });

      clientInstance.on('connect', (ws) => {
        console.log(`[ws client] set ws with connection_id: ${connectionId}`);
        wsMaps.set(connectionId, ws);

        ws.on('error', (error) => {
          console.error(`[ws client] connection Error: ${error.toString()}`);
        });

        ws.on('close', () => {
          console.log('[ws client] echo-protocol Connection Closed');
        });

        ws.on('message', (message) => {
          if (message.type === 'utf8') {
            console.log(`[ws client] Received: '${message.utf8Data}'`);
            const data = JSON.parse(message.utf8Data);
            if (data.event === 'complete') {
              removeConnectionFromMap(data.connectionId);
            }
          }
        });

        resolve(ws);
      });
    });
  },
  send(ws, message) {
    let msg = message;
    if (typeof msg !== 'string') {
      try {
        msg = JSON.stringify(msg);
      } catch (e) {
        console.error('[ws client] send message error', e);
      }
    }

    ws.sendUTF(msg);
  },
  close(browserClientId, connectionId, reason) {
    const ws = getWs(connectionId);
    if (ws) {
      removeConnectionFromMap(connectionId);
      ws.sendUTF(JSON.stringify({
        client_id: connectionId,
        browser_client_id: browserClientId,
        connectionId,
        reason,
        event: 'close',
      }));
    }
  },
};

module.exports = WsClient;
