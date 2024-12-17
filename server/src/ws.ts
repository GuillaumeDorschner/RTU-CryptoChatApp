import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import { WordArray } from '../../client/src/CryptoAlgs/Utils/WordArray';

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
  | { type: 'relayEncryptedMessage'; senderId: string; recipientId: string; encryptedMessage: string; salt: WordArray };

type Response =
  | { type: 'publicKeyOne' | 'publicKeyTwo'; senderId: string; publicKey: string; senderName: string }
  | { type: 'encryptedMessage'; senderId: string; encryptedMessage: string; salt: WordArray };

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
              console.log('\x1b[32m%s\x1b[0m', `User connected: ${userId}`);
            } else {
              console.warn('\x1b[33m%s\x1b[0m', `User ID ${message.userId} is already connected.`);
            }
            break;

          case 'relayPublicKey': {
            const { keyType, senderId, recipientId, publicKey, senderName } = message;
            console.log(`Relaying ${keyType} from ${senderId} to ${recipientId}`);
            sendToClient(recipientId, { type: keyType, senderId, publicKey, senderName });
            break;
          }

          case 'relayEncryptedMessage': {
            const { senderId, recipientId, encryptedMessage, salt } = message;
            console.log(`Relaying message from ${senderId} to ${recipientId}`);
            sendToClient(recipientId, { type: 'encryptedMessage', senderId, encryptedMessage, salt });
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
        console.log('\x1b[31m%s\x1b[0m', `User disconnected: ${userId}`);
        clients.delete(userId);
      }
    });
  });
};
