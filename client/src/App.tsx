import './App.css';
import { useState, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';

import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import ChatSettingsDrawer from './components/ChatSettingsDrawer';

function App() {
  const [showSetting, setShowSetting] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const handleWebSocketMessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data);

    switch (message.type) {
      case 'userId':
        setUserId(message.userId);
        console.log('User ID received:', message.userId);
        break;
      case 'publicKey':
        console.log('Public key received:', message);
        break;
      // case 'encryptedMessage':
      //   setMessages((prev) => [...prev, message]);
      //   break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  };

  const ws = useWebSocket('ws://localhost:3001', handleWebSocketMessage);

  const sendMessage = (data: object) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected.');
    }
  };

  useEffect(() => {
    const cookieId = document.cookie.split('; ').find((row) => row.startsWith('userId='));
    if (cookieId) {
      setUserId(cookieId.split('=')[1]);
    } else {
      setUserId(null);
    }
  });

  return (
    <div className="h-screen w-full flex overflow-hidden bg-bgGlobal p-4 text-text">
      {!userId ? (
        <>
          <input type="Username" />
        </>
      ) : (
        <>
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

          {showSetting && (
            <div className="flex-shrink-0 w-1/4 p-4 rounded-lg bg-bgCard">
              <ChatSettingsDrawer />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
