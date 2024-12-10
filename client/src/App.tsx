import './App.css';
import { useState, useEffect, useRef } from 'react';
// import { useWebSocket } from './hooks/useWebSocket';

import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import ChatSettingsDrawer from './components/ChatSettingsDrawer';

import { useChatContext } from './ChatContext';

function App() {
  const { user, setUser, chats, setChats, settings, setSettings } = useChatContext();
  const [usernameInput, setUsernameInput] = useState('');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const initializeUser = () => {
      const storedUserId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('userId='))
        ?.split('=')[1];
      const storedName = localStorage.getItem('username');
      if (storedUserId && storedName) {
        setUser({ id: storedUserId, name: storedName, openChatId: null });
      }
    };

    const initializeChats = () => {
      const storedChats = localStorage.getItem('chats');
      if (storedChats) {
        setChats(JSON.parse(storedChats));
      } else {
        setChats([]);
      }
    };

    const initializeSettings = () => {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        setSettings({ ...settings, theme: storedTheme });
      }
    };

    initializeUser();
    initializeChats();
    initializeSettings();
  }, [setUser, setChats, setSettings, settings]);

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('theme', settings.theme);
  }, [settings.theme]);

  const handleUsernameSubmit = () => {
    if (usernameInput.trim()) {
      const newUserId = `user-${Math.random().toString(36).substr(2, 9)}`;
      document.cookie = `userId=${newUserId}; path=/`;
      setUser({ id: newUserId, name: usernameInput.trim(), openChatId: null });
      localStorage.setItem('username', usernameInput.trim());
      setUsernameInput('');
    }
  };

  return (
    <>
      {!user?.id ? (
        <div className="h-screen w-full flex overflow-hidden bg-bgGlobal p-4 text-text justify-center items-center">
          <div className="p-4 rounded-lg bg-bgCard h-max ">
            <p>Username</p>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="flex-grow p-2 border-2 border-bgGlobal rounded-lg outline-text bg-bgCard focus:ring focus:ring-blue-300"
              placeholder="Enter your username"
            />
            <button
              className="p-2 mt-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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

          {settings.open && (
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
