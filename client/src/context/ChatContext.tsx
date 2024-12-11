import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

type Message = {
  text: string;
  senderId: string;
  time: Date;
};

type Chat = {
  id: number;
  AESkey: string;
  messages: Message[];
  name: string;
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
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const contextValue = useMemo(
    () => ({ user, setUser, chats, setChats, settings, setSettings }),
    [user, chats, settings],
  );

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within a ChatContextProvider');
  return context;
};
