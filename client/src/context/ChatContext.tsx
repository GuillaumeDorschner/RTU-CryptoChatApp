import { createContext, useContext, useState, useMemo, ReactNode, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
        // TODO: key pair generation ECDH
        const ownPublicKey = Math.floor(Math.random() * 1000); // TODO: remove
        const ownPrivateKey = Math.floor(Math.random() * 1000); // TODO: remove
        const remotePublicKey = message.publicKey;

        //TODO: calculate shared key otherPubicKey * privateKey  sharedSecret(publicKey, privateKey);
        const sharedKey = 'one';

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

        const newChat = {
          id: randomId,
          name: message.senderName,
          participantId: message.senderId,
          cryptographie: {
            AESkey: sharedKey,
            publicKey: ownPublicKey,
            privateKey: ownPrivateKey,
          },
          messages: [],
        };

        setChats([...chats, newChat]);

        const chat = chats.find((chat) => chat.participantId === message.senderId);

        if (!chat) return;
      }

      if (message.type === 'publicKeyTwo') {
        console.log('public key received', message);

        const remotePublicKey = message.publicKey;
        const name = message.senderName;

        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.participantId === message.senderId) {
              const ownPrivateKey = chat.cryptographie.privateKey;

              const sharedKey = 'Two'; //TODO: calculate shared key remotePublicKey * ownPrivateKey

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

        const sharedKey = chat?.cryptographie.AESkey;
        const decryptedMessage = message.encryptedMessage; // TODO: Decrypt message using AES

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
      localStorage.setItem('chats', JSON.stringify(chats));
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
