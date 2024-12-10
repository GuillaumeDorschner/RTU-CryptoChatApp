import './App.css';
import { useState, useEffect, useRef } from 'react';
// import { useWebSocket } from './hooks/useWebSocket';

import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import ChatSettingsDrawer from './components/ChatSettingsDrawer';

function App() {
  const [showSetting, setShowSetting] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const enterUserName = () => {
    document.cookie = 'userId=123';
    setUserId('123');
  };

  const sendMessage = () => {
    if (socketRef.current && connected) {
      socketRef.current.send(JSON.stringify({ type: 'message', content: message }));
      console.log('Message sent:', message);
      setMessage(''); // Clear the input after sending
    } else {
      console.error('WebSocket is not connected.');
    }
  };

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connection established.');
      setConnected(true);
      socket.send(JSON.stringify({ type: 'generateUserId' }));
    };

    socket.onmessage = (event) => {
      console.log('Received message:', event.data);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed.');
      setConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    const cookieId = document.cookie.split('; ').find((row) => row.startsWith('userId='));
    if (cookieId) {
      setUserId(cookieId.split('=')[1]);
    } else {
      setUserId(null);
    }
  }, []);

  return (
    <>
      {!userId ? (
        <div className="h-screen w-full flex overflow-hidden bg-bgGlobal p-4 text-text justify-center items-center">
          <div className="p-4 rounded-lg bg-bgCard h-max ">
            <p>Username</p>
            <input
              type="text"
              className="flex-grow p-2 border-2 border-bgGlobal rounded-lg outline-text bg-bgCard focus:ring focus:ring-blue-300"
            />
            <button className="p-2 mt-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onClick={enterUserName} />
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

          {showSetting && (
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
