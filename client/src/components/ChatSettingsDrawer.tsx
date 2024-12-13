import { useEffect, useState } from 'react';
import { useChatContext } from '../context/ChatContext';

const ChatSettingsDrawer = () => {
  const { user, chats, setChats } = useChatContext();
  const [key, setKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    const id = user?.openChatId;
    const chat = chats.find((chat) => chat.id === id);
    if (chat) {
      setKey(chat.AESkey);
    }
  }, [user?.id, chats]);

  const handleDeleteChat = () => {
    const id = user?.openChatId;
    const updatedChats = chats.filter((chat) => chat.id !== id);
    setChats(updatedChats);
  };
  const handleLogout = () => {
    document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="flex flex-col">
      <p className="py-2 text-xl">Settings</p>
      <p className="py-2 text-lg">Key</p>
      <p>{key}</p>
      <p className="py-2 text-lg">Danger</p>
      <button onClick={handleDeleteChat} className="py-2 px-4 bg-red-500 text-white rounded-lg">
        Delete the chat
      </button>
      <p>the logout boutton will delete all data on the app</p>
      <button onClick={handleLogout} className="py-2 px-4 bg-red-500 text-white rounded-lg">
        Logout
      </button>
    </div>
  );
};

export default ChatSettingsDrawer;
