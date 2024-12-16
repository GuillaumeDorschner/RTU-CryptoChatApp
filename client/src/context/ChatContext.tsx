import { createContext, useContext, useState, useMemo, ReactNode, useCallback, useEffect } from 'react';

type Message = {
  text: string;
  senderId: string;
  time: Date;
};

type Chat = {
  id: number;
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

        // TODO: use ecdh
        const randomId = Math.floor(Math.random() * 1000); // TODO: remove
        const randomPublic = Math.floor(Math.random() * 1000); // TODO: remove
        const randomPrivate = Math.floor(Math.random() * 1000); // TODO: remove

        const data = {
          type: 'relayPublicKey',
          keyType: 'publicKeyTwo',
          senderId: user?.id,
          recipientId: message.senderId,
          publicKey: randomPublic,
          senderName: user?.name,
        };

        ws?.send(JSON.stringify(data));

        console.log('public key sent', data);

        const newChat = {
          id: randomId,
          name: message.senderName,
          participantId: message.senderId,
          cryptographie: {
            AESkey: 'One',
            publicKey: randomPublic,
            privateKey: randomPrivate,
          },
          messages: [],
        };

        setChats([...chats, newChat]);

        const publicKey = message.publicKey;
        const chat = chats.find((chat) => chat.participantId === message.senderId);

        if (!chat) return;

        const privateKey = chat.cryptographie.privateKey;

        //TODO: calculate shared key otherPubicKey * privateKey
        chat.cryptographie.AESkey = 'one'; // sharedSecret(publicKey, privateKey);
      }

      if (message.type === 'publicKeyTwo') {
        console.log('public key received', message);

        const publicKey = message.publicKey;
        const name = message.senderName;
        const chat = chats.find((chat) => chat.participantId === message.senderId);

        const newChat = {
          id: message.senderId,
          name: name,
          participantId: message.senderId,
          cryptographie: {
            AESkey: 'Two',
            publicKey: 'jhfjkdsfh',
            privateKey: 'kfhjdskjfh',
          },
          messages: [],
        };

        console.log(name);

        setChats([...chats, newChat]);
      }

      if (message.type === 'encryptedMessage') {
        console.log('encrypted message received', message);
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
