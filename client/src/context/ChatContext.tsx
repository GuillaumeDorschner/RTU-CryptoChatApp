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

      if (message.type === 'generatedUserId') {
        setUser((prevUser) => ({ ...prevUser, id: message.userId }));
      }

      // TODO: create a new chat i don't think this work
      if (message.type === 'publicKey') {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            user?.id === message.senderId
              ? {
                  ...chat,
                  AESkey: message.publicKey,
                }
              : chat,
          ),
        );
      }

      if (message.type === 'encryptedMessage') {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.participantId === message.senderId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    {
                      text: message.encryptedMessage,
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
