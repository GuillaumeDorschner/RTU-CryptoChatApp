import { createContext, useContext, useState, useMemo, ReactNode, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Point } from '../CryptoAlgs/ECC/point';
import { Secp256k1 } from '../CryptoAlgs/ECC/curve';
import { ECC } from '../CryptoAlgs/ECC/ecc';
import { AESImpl } from '../CryptoAlgs/AES/AES';
import { aesConstants } from '../CryptoAlgs/AES/AESConstants';
import { WordArray } from '../CryptoAlgs/Utils/WordArray';

type Message = {
  text: string;
  senderId: string;
  time: Date;
};

type Chat = {
  id: string;
  name: string;
  participantId: string;
  cryptographie: {
    AESkey: string;
    publicKey: string;
    privateKey: string;
  };
  messages: Message[];
};

type User = {
  name: string;
  id: string;
  openChatId: number | null;
};

type Settings = {
  theme: string;
  open: boolean;
};

type ChatContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  settings: Settings | null;
  setSettings: (settings: Settings) => void;
  ws: WebSocket | null;
  setWebSocket: (ws: WebSocket) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

function getOrThrowStr(input: string | undefined): string {
  if (typeof input === 'string') {
    return input;
  }
  throw new Error('string was undefined');
}

function getByteLengthUtf16(input: string): number {
  let byteLength = 0;
  for (const char of input) {
    byteLength += char.charCodeAt(0) > 0xffff ? 4 : 2;
  }
  return byteLength;
}

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [ws, setWebSocket] = useState<WebSocket | null>(null);

  const handleWebSocketMessage = useCallback(
    (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (message.type === 'publicKeyOne') {
        console.log('public key received', message);

        const randomId = uuidv4();

        const ecc = new ECC();

        const ownPublicKey: string = ecc.getPublicKey();
        const ownPrivateKey: string = ecc.sk.toString();
        const remotePublicKey = message.publicKey;

        console.log('Remote pk: ' + remotePublicKey);
        const sharedKey: string = Point.publicKeyToPoint(remotePublicKey, new Secp256k1())
          .scalarMul(ecc.sk)
          .x.toString();

        console.log('Shared key: ' + sharedKey);

        const data = {
          type: 'relayPublicKey',
          keyType: 'publicKeyTwo',
          senderId: user?.id,
          recipientId: message.senderId,
          publicKey: ownPublicKey,
          senderName: user?.name,
        };

        ws?.send(JSON.stringify(data));

        console.log('public key sent', data);
        console.log('Private key type:' + typeof ownPrivateKey);

        setChats((prevChats) => [
          ...prevChats,
          {
            id: randomId,
            name: message.senderName,
            participantId: message.senderId,
            cryptographie: {
              AESkey: sharedKey,
              publicKey: ownPublicKey,
              privateKey: ownPrivateKey,
            },
            messages: [],
          },
        ]);
      }

      if (message.type === 'publicKeyTwo') {
        console.log('public key received', message);

        const remotePublicKey = message.publicKey;
        const name = message.senderName;

        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.participantId === message.senderId) {
              const ownPrivateKey: string = chat.cryptographie.privateKey;

              console.log('ownPrivateKey: ' + ownPrivateKey);
              const sharedKey: string = Point.publicKeyToPoint(remotePublicKey, new Secp256k1())
                .scalarMul(BigInt(ownPrivateKey))
                .x.toString();
              console.log('shared Key 2: ' + sharedKey);

              return {
                ...chat,
                name: name || chat.name,
                cryptographie: {
                  ...chat.cryptographie,
                  AESkey: sharedKey,
                },
              };
            }
            return chat;
          }),
        );
      }

      if (message.type === 'encryptedMessage') {
        console.log('encrypted message received', message);
        const chat = chats.find((chat) => chat.participantId === message.senderId);

        const sharedKey: string = getOrThrowStr(chat?.cryptographie.AESkey);
        console.log('sharedKey 3: ' + sharedKey);
        console.log('Encrypted message: ' + message.encryptedMessage);
        const salt = new WordArray([-939201693, 719097864], 8); //TODO: Retrieve slat from message
        const decryptedMessage: string = new AESImpl()
          .init(getOrThrowStr(sharedKey), getByteLengthUtf16(sharedKey), aesConstants, salt)
          .decryptMessage(WordArray.parseBase64(message.encryptedMessage), aesConstants);
        console.log('Decrypted message: ' + decryptedMessage);

        const newMessage = {
          text: decryptedMessage,
          senderId: message.senderId,
          time: new Date(),
        };

        if (!chat) return;

        setChats((prevChats) => {
          return prevChats.map((c) =>
            c.participantId === message.senderId ? { ...c, messages: [...c.messages, newMessage] } : c,
          );
        });
      }
    },
    [user],
  );

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (chats && chats.length > 0) {
      console.log('chats:' + chats);
      localStorage.setItem(
        'chats',
        JSON.stringify(chats, (key, value) => {
          value = key == 'privateKey' ? value.toString() : value;
          console.log(key, value, typeof value);
          return value;
        }),
      );
    }
  }, [chats]);

  useEffect(() => {
    if (settings) {
      localStorage.setItem('settings', JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    console.log('User:', user);
    console.log('Chats:', chats);
    console.log('Settings', settings);
  }, [user, chats, settings]);

  useEffect(() => {
    if (ws) {
      ws.onmessage = handleWebSocketMessage;
    }
  }, [ws, handleWebSocketMessage]);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      chats,
      setChats,
      settings,
      setSettings,
      ws,
      setWebSocket,
    }),
    [user, chats, settings, ws],
  );

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatContextProvider');
  }
  return context;
};
