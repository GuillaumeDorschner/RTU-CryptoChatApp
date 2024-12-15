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
  AESkey: string;
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

      // TODO: create a new chat i don't think this work
      if (message.type === 'publicKeyOne') {
        console.log('public key received', message);

        console.log(user);

        const newMessage = {
          type: 'relayPublicKey',
          keyType: 'publicKeyTwo',
          senderId: user?.id,
          recipientId: message.senderId,
          publicKey: 'heyydfskjfhsdkj 2',
          senderName: user?.name,
        };

        ws?.send(JSON.stringify(newMessage));

        console.log('public key sent', newMessage);
      }

      if (message.type === 'publicKeyTwo') {
        console.log('public key received', message);
      }

      if (message.type === 'encryptedMessage') {
        console.log('encrypted message received', message);
      }
    },
    [setChats, user],
  );

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
