import { WebSocketServer } from 'ws';

export function setupWebSocket(server: any) {
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
