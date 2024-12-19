import "./App.css";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import ChatSettingsDrawer from "./components/ChatSettingsDrawer";

import { useChatContext } from "./context/ChatContext";

function App() {
  const { user, setUser, setChats, settings, setSettings, setWebSocket } =
    useChatContext();
  const [usernameInput, setUsernameInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  const initializeWebSocket = (userId: string) => {
    if (!wsRef.current) {
      const host = window.location.hostname;
      const socketUrl = `ws://${host}:3001`;
      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        ws.send(JSON.stringify({ type: "connect", userId }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("Received WebSocket message:", message);
        // Handle ChatContext
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        wsRef.current = null;
      };

      setWebSocket(ws);
    }
  };

  const initializeUser = () => {
    const storedUserId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userId="))
      ?.split("=")[1];
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const storedChats = localStorage.getItem("chats") || "[]";
    const storedSettings = JSON.parse(localStorage.getItem("settings") || "{}");

    if (storedUserId) {
      const newUser = {
        id: storedUserId,
        name: storedUser.name || usernameInput.trim(),
        openChatId: storedUser.openChatId || null,
      };

      const newSettings = {
        theme: storedSettings.theme || "light",
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
      setUsernameInput("");
    } else {
      console.warn("Username cannot be empty.");
    }
  };

  useEffect(() => {
    initializeUser();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bgGlobal text-text">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      {!user?.id ? (
        <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-bgGlobal p-4 text-text">
          <div className="h-max rounded-lg bg-bgCard p-4">
            <p>Username</p>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="flex-grow rounded-lg border-2 border-bgGlobal bg-bgCard p-2 outline-text focus:ring focus:ring-blue-300"
              placeholder="Enter your username"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUsernameSubmit();
              }}
            />
            <button
              className="ml-2 mt-4 rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-600"
              onClick={handleUsernameSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div className="flex h-screen w-full overflow-hidden bg-bgGlobal p-4 text-text">
          <div className="w-1/5 flex-shrink-0">
            <Sidebar />
          </div>
          <div className="mx-6 flex flex-grow flex-col rounded-lg bg-bgCard p-4">
            <ChatHeader />
            <div className="flex-grow overflow-y-auto">
              <ChatMessages />
            </div>
            <ChatInput />
          </div>
          {settings?.open && (
            <div className="w-1/4 flex-shrink-0 rounded-lg bg-bgCard p-4">
              <ChatSettingsDrawer />
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;
