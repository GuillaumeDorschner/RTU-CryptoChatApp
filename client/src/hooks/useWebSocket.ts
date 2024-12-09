import { useEffect, useState } from 'react';

type WebSocketMessageHandler = (event: MessageEvent) => void;

export const useWebSocket = (url: string, onMessage: WebSocketMessageHandler) => {
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(url);
        setWs(socket);

        socket.onmessage = onMessage;

        socket.onopen = () => {
            console.log('WebSocket connection established.');
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed.');
        };

        return () => {
            socket.close();
        };
    }, [url, onMessage]);

    return ws;
};
