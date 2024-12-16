// TODO: remove shared folder
import './App.css';
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import ChatSettingsDrawer from './components/ChatSettingsDrawer';

import { useChatContext } from './context/ChatContext';

function App() {
  const { user, setUser, setChats, settings, setSettings, setWebSocket } = useChatContext();
  const [usernameInput, setUsernameInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  const initializeWebSocket = (userId: string) => {
    if (!wsRef.current) {
      const host = window.location.hostname;
      const socketUrl = `ws://${host}:3001`;
      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        ws.send(JSON.stringify({ type: 'connect', userId }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Received WebSocket message:', message);
        // Handle ChatContext
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        wsRef.current = null;
      };

      setWebSocket(ws);
    }
  };

  const initializeUser = () => {
    const storedUserId = document.cookie
      .split('; ')
      .find((row) => row.startsWith('userId='))
      ?.split('=')[1];
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const storedChats = localStorage.getItem('chats') || '[]';
    const storedSettings = JSON.parse(localStorage.getItem('settings') || '{}');

    if (storedUserId) {
      const newUser = {
        id: storedUserId,
        name: storedUser.name || usernameInput.trim(),
        openChatId: storedUser.openChatId || null,
      };

      const newSettings = {
        theme: storedSettings.theme || 'light',
        open: storedSettings.open || false,
      };

      setUser(newUser);
      setChats(JSON.parse(storedChats));
      setSettings(newSettings);
      initializeWebSocket(storedUserId);
    }
    setIsLoading(false);
  };

  const handleUsernameSubmit = () => {
    if (usernameInput.trim()) {
      const userId = uuidv4();
      document.cookie = `userId=${userId}; path=/`;
      initializeWebSocket(userId);
      initializeUser();
      setUsernameInput('');
    } else {
      console.warn('Username cannot be empty.');
    }
  };

  useEffect(() => {
    initializeUser();
  }, []);

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
