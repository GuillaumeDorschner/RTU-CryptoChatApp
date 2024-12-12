import { useEffect, useRef } from 'react';

type WebSocketMessageHandler = (event: MessageEvent) => void;

export const useWebSocket = (url: string, onMessage: WebSocketMessageHandler): WebSocket => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    console.log('WebSocket connection initialized');
    const connect = () => {
      const socket = new WebSocket(url);
      console.log('WebSocket connection initialized');
      wsRef.current = socket;

      socket.onmessage = onMessage;

      socket.onopen = () => {
        console.log('WebSocket connection established');
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed. Reconnecting...');
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, [url, onMessage]);

  if (!wsRef.current) {
    throw new Error('WebSocket connection is not initialized');
  }

  return wsRef.current;
};
