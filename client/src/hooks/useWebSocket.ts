import { useEffect, useState } from 'react';

type WebSocketMessageHandler = (event: MessageEvent) => void;

export const useWebSocket = (url: string, onMessage: WebSocketMessageHandler): WebSocket | null => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(url);

      ws.onmessage = onMessage;
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setSocket(ws);
      };
      ws.onerror = (error) => console.error('WebSocket error:', error);
      ws.onclose = () => {
        console.log('WebSocket connection closed. Reconnecting...');
        setSocket(null);
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      socket?.close();
    };
  }, [url, onMessage]);

  return socket;
};
