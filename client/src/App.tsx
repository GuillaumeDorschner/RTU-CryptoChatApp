import './App.css';
import { useState, useEffect } from 'react';

import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import ChatSettingsDrawer from './components/ChatSettingsDrawer';

import { useChatContext } from './context/ChatContext';

function App() {
  const { user, setUser, chats, setChats, settings, setSettings, ws } = useChatContext();
  const [usernameInput, setUsernameInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      const storedUserId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('userId='))
        ?.split('=')[1];
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const storedChats = localStorage.getItem('chats');
      const storedSettings = JSON.parse(localStorage.getItem('settings') || '{}');

      const user =
        storedUserId && storedUser
          ? { id: storedUserId, name: storedUser.name, openChatId: parseFloat(storedUser.openChatId) }
          : null;
      const chats = storedChats ? JSON.parse(storedChats) : [];
      const settings = {
        theme: storedSettings.theme || 'light',
        open: storedSettings.open || false,
      };

      setUser(user);
      setChats(chats);
      setSettings(settings);

      setIsLoading(false);
    };

    initializeData();
  }, [setUser, setChats, setSettings]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (chats.length) {
      localStorage.setItem('chats', JSON.stringify(chats));
    }
  }, [chats]);

  useEffect(() => {
    if (settings) {
      localStorage.setItem('settings', JSON.stringify(settings));
    }
  }, [settings]);

  const handleUsernameSubmit = () => {
    if (usernameInput.trim()) {
      // TODO send request to server to create new user
      ws?.send(
        JSON.stringify({
          type: 'generateUserId',
          name: usernameInput.trim(),
        }),
      );

      const newUserId = `user-${Math.random().toString(36).substr(2, 9)}`;
      document.cookie = `userId=${newUserId}; path=/`;
      setUser({ id: newUserId, name: usernameInput.trim(), openChatId: null });
      setUsernameInput('');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex justify-center items-center bg-bgGlobal text-text">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      {!user?.id ? (
        <div className="h-screen w-full flex overflow-hidden bg-bgGlobal p-4 text-text justify-center items-center">
          <div className="p-4 rounded-lg bg-bgCard h-max">
            <p>Username</p>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="flex-grow p-2 border-2 border-bgGlobal rounded-lg outline-text bg-bgCard focus:ring focus:ring-blue-300"
              placeholder="Enter your username"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUsernameSubmit();
              }}
            />
            <button
              className="p-2 mt-4 ml-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={handleUsernameSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div className="h-screen w-full flex overflow-hidden bg-bgGlobal p-4 text-text">
          <div className="flex-shrink-0 w-1/5">
            <Sidebar />
          </div>
          <div className="flex flex-col mx-6 flex-grow p-4 rounded-lg bg-bgCard">
            <ChatHeader />
            <div className="flex-grow overflow-y-auto">
              <ChatMessages />
            </div>
            <ChatInput />
          </div>
          {settings?.open && (
            <div className="flex-shrink-0 w-1/4 p-4 rounded-lg bg-bgCard">
              <ChatSettingsDrawer />
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;
