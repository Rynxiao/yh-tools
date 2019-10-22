import CONFIG from '../../build/config';
import { clientId } from './index';

export default {
  socket: null,
  getSocket() {
    if (!this.socket) {
      this.socket = new WebSocket(
        `ws://localhost:${CONFIG.PORT}?from=client&id=${clientId}`,
        'echo-protocol',
      );
    }
    return this.socket;
  },
  async connect(onmessage, onerror) {
    const socket = this.getSocket();
    return new Promise((resolve) => {
      const onError = (error) => console.log(`[error] ${error.message}`);

      socket.onopen = () => {
        socket.onmessage = onmessage;
        resolve();
      };

      socket.onclose = (event) => {
        if (event.wasClean) {
          console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
          console.log('[close] Connection died');
        }
      };

      socket.onerror = onerror || onError;
    });
  },
  send(message) {
    let msg = message;
    if (typeof msg !== 'string') {
      try {
        msg = JSON.stringify(msg);
      } catch (e) {
        console.error(e.message);
      }
    }
    const socket = this.getSocket();
    socket.send(msg);
  },
};
