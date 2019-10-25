const WebSocketServer = require('websocket').server;
const querystring = require('querystring');
const logger = require('../logger');

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
  logger.info(`[ws server] client from ${queryStrings.from} and id is ${queryStrings.id}`);
  if (queryStrings) {
    const { id } = queryStrings;
    clientsMap.set(id, client);
  }
}

function getConnectionAndSendProgressToClient(data, clientId) {
  const browserClient = clientsMap.get(clientId);
  // logger.info(`[ws server] send ${JSON.stringify(data)} to client ${clientId}`);

  if (browserClient) {
    const serverClientId = `${data.parent_id}-${data.child_id}`;
    const serverClient = clientsMap.get(serverClientId);

    browserClient.send(JSON.stringify(data));
    if (data.progress >= 100) {
      logger.info(`[ws server] file has been download successfully, progress is ${data.progress}`);
      logger.info(`[ws server] server client ${serverClientId} ready to disconnect`);
      clientsMap.delete(serverClientId);
      serverClient.send(JSON.stringify({ connectionId: serverClientId, event: 'complete' }));
      serverClient.close('download completed');
    }
  }
}

function closeConnection(clientId, data) {
  const client = clientsMap.get(clientId);
  const browserClient = clientsMap.get(data.browser_client_id);
  logger.info(`[ws server] close client ${clientId}`);
  logger.info(`[ws server] send message back to browser client ${data.browser_client_id}`);

  if (browserClient) {
    browserClient.send(JSON.stringify(data));
  }

  if (client) {
    clientsMap.delete(clientId);
    client.close(data.reason);
  }
}

function onMessage(message) {
  const data = JSON.parse(message.utf8Data);
  const id = data.client_id;

  if (data.event === 'close') {
    logger.info('[ws server] close event');
    closeConnection(id, data);
  } else {
    getConnectionAndSendProgressToClient(data, id);
  }
}

const WsServer = {
  connectToServer(httpServer) {
    initWsServer(httpServer);
    wsServer.on('request', (request) => {
      logger.info('[ws server] request');
      const connection = request.accept('echo-protocol', request.origin);
      const queryStrings = querystring.parse(request.resource.replace(/(^\/|\?)/g, ''));
      setConnectionToMap(connection, queryStrings);
      connection.on('message', onMessage);
      connection.on('close', (reasonCode, description) => {
        logger.info(`[ws server] connection closed ${reasonCode} ${description}`);
      });
    });

    wsServer.on('close', (connection, reason, description) => {
      logger.info('[ws server] some connection disconnect.');
      logger.info(reason, description);
    });
  },
};

module.exports = WsServer;
