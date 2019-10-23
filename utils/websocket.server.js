const WebSocketServer = require('websocket').server;
const querystring = require('querystring');

const clientsMap = new Map();
let wsServer = null;

function initWsServer(server) {
  if (!wsServer) {
    wsServer = new WebSocketServer({
      httpServer: server,
      autoAcceptConnections: false,
    });
  }
  return wsServer;
}

function setConnectionToMap(client, queryStrings) {
  console.log(queryStrings);
  if (queryStrings) {
    const { id } = queryStrings;
    clientsMap.set(id, client);
  }
}

function getConnectionAndSendProgressToClient(data, clientId) {
  const browserClient = clientsMap.get(clientId);
  console.log(`[ws server] send ${JSON.stringify(data)} to client ${clientId}`);

  if (browserClient) {
    const serverClientId = `${data.parent_id}-${data.child_id}`;
    const serverClient = clientsMap.get(serverClientId);

    browserClient.send(JSON.stringify(data));
    if (data.progress >= 100) {
      console.log(`[ws server] file has been download successfully, progress is ${data.progress}`);
      console.log(`[ws server] ready to disconnect with server client id is ${serverClientId}`);
      clientsMap.delete(serverClientId);
      serverClient.send(JSON.stringify({ connectionId: serverClientId, event: 'complete' }));
      serverClient.close('download completed');
    }
  }
}

function closeConnection(clientId, data) {
  const client = clientsMap.get(clientId);
  const browserClient = clientsMap.get(data.browser_client_id);
  console.log(`[ws server] close client ${clientId}`);
  console.log(`[ws server] send message back to browser client ${data.browser_client_id}`);
  if (client && browserClient) {
    browserClient.send(JSON.stringify(data));
    clientsMap.delete(clientId);
    client.close(data.reason);
  }
}

function onMessage(message) {
  const data = JSON.parse(message.utf8Data);
  const id = data.client_id;

  if (data.event === 'close') {
    console.log('[ws server] close event');
    closeConnection(id, data);
  } else {
    getConnectionAndSendProgressToClient(data, id);
  }
}

const WsServer = {
  connectToServer(httpServer) {
    initWsServer(httpServer);
    wsServer.on('request', (request) => {
      console.log('[ws server] request');
      const connection = request.accept('echo-protocol', request.origin);
      const queryStrings = querystring.parse(request.resource.replace(/(^\/|\?)/g, ''));
      setConnectionToMap(connection, queryStrings);
      connection.on('message', onMessage);
      connection.on('close', (reasonCode, description) => {
        console.log(`[ws server] connection closed ${reasonCode} ${description}`);
      });
    });

    wsServer.on('close', (connection, reason, description) => {
      console.log('[ws server] some connection disconnect.');
      console.log(reason, description);
    });
  },
};

module.exports = WsServer;
