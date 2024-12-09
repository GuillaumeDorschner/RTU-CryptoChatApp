import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

type Message =
  | { type: 'generateUserId' }
  | { type: 'relayPublicKey'; senderId: string; recipientId: string; publicKey: string }
  | { type: 'relayEncryptedMessage'; senderId: string; recipientId: string; encryptedMessage: string };

type Response =
  | { type: 'userId'; userId: string }
  | { type: 'publicKey'; senderId: string; publicKey: string }
  | { type: 'encryptedMessage'; senderId: string; encryptedMessage: string };

const clients: Map<string, WebSocket> = new Map();

export const startWebSocketServer = (port: number) => {
  const wss = new WebSocketServer({ port });

  console.log(`WebSocket server running on ws://localhost:${port}`);

  const sendToClient = (recipientId: string, message: Response) => {
    const client = clients.get(recipientId);
    if (client && client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  };

  wss.on('connection', (ws) => {
    let userId: string | null = null;

    ws.on('message', (data) => {
      try {
        const message: Message = JSON.parse(data.toString());

        switch (message.type) {
          case 'generateUserId':
            userId = uuidv4();
            clients.set(userId, ws);
            ws.send(JSON.stringify({ type: 'userId', userId }));
            console.log(`User connected: ${userId}`);
            break;

          case 'relayPublicKey':
            const { senderId, recipientId, publicKey } = message;
            console.log(`Relaying public key from ${senderId} to ${recipientId}`);
            sendToClient(recipientId, { type: 'publicKey', senderId, publicKey });
            break;

          case 'relayEncryptedMessage':
            const { senderId: msgSenderId, recipientId: msgRecipientId, encryptedMessage } = message;
            console.log(`Relaying message from ${msgSenderId} to ${msgRecipientId}`);
            sendToClient(msgRecipientId, { type: 'encryptedMessage', senderId: msgSenderId, encryptedMessage });
            break;

          default:
            console.log('Unknown message type');
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        console.log(`User disconnected: ${userId}`);
        clients.delete(userId);
      }
    });
  });
};
