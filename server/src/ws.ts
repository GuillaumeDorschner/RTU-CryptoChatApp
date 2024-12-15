import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';

type Message =
  | { type: 'connect'; userId: string }
  | {
      type: 'relayPublicKey';
      keyType: 'publicKeyOne' | 'publicKeyTwo';
      senderId: string;
      recipientId: string;
      publicKey: string;
      senderName: string;
    }
  | { type: 'relayEncryptedMessage'; senderId: string; recipientId: string; encryptedMessage: string };

type Response =
  | { type: 'publicKeyOne' | 'publicKeyTwo'; senderId: string; publicKey: string; senderName: string }
  | { type: 'encryptedMessage'; senderId: string; encryptedMessage: string };

const clients: Map<string, WebSocket> = new Map();

export const startWebSocketServer = (port: number) => {
  const wss = new WebSocketServer({ port });

  console.log(`WebSocket server running on ws://localhost:${port}`);

  const sendToClient = (recipientId: string, message: Response) => {
    const client = clients.get(recipientId);
    if (client && client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    } else {
      console.warn(`Recipient ${recipientId} is not connected.`);
    }
  };

  wss.on('connection', (ws) => {
    let userId: string | null = null;

    console.log('New WebSocket connection established.');

    ws.on('message', (data) => {
      try {
        const message: Message = JSON.parse(data.toString());

        switch (message.type) {
          case 'connect':
            if (!clients.has(message.userId)) {
              userId = message.userId;
              clients.set(userId, ws);
              console.log(`User connected: ${userId}`);
            } else {
              console.warn(`User ID ${message.userId} is already connected.`);
            }
            break;

          case 'relayPublicKey': {
            const { keyType, senderId, recipientId, publicKey, senderName } = message;
            console.log(`Relaying ${keyType} from ${senderId} to ${recipientId}`);
            sendToClient(recipientId, { type: keyType, senderId, publicKey, senderName });
            break;
          }

          case 'relayEncryptedMessage': {
            const { senderId, recipientId, encryptedMessage } = message;
            console.log(`Relaying message from ${senderId} to ${recipientId}`);
            sendToClient(recipientId, { type: 'encryptedMessage', senderId, encryptedMessage });
            break;
          }

          default:
            console.warn('Unknown message type:');
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
