import { WebSocketServer } from 'ws';

const userIdToSocket = new Map<string, WebSocket>();

interface IncomingMessage {
  type: string;
  data?: any;
}

export function WebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
      console.log(`Received: ${message}`);
      ws.send(`Echo: ${message}`);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  return wss;
}
