import { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

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
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const handleWebSocketMessage = useCallback(
    (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (message.type === 'relayEncryptedMessage') {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === message.recipientId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    {
                      text: message.encryptedMessage, // TODO: Decrypt message
                      senderId: message.senderId,
                      time: new Date(),
                    },
                  ],
                }
              : chat,
          ),
        );
      }
    },
    [setChats],
  );

  const ws = useWebSocket('ws://localhost:3001', handleWebSocketMessage);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      chats,
      setChats,
      settings,
      setSettings,
      ws,
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
