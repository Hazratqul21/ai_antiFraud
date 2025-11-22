import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url, options = {}) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const websocketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const {
        onMessage,
        onConnect,
        onDisconnect,
        reconnectInterval = 3000,
        maxReconnectAttempts = 5
    } = options;

    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    const connect = () => {
        try {
            // Convert http to ws
            const wsUrl = url.replace('http://', 'ws://').replace('https://', 'wss://');

            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('✅ WebSocket connected');
                setIsConnected(true);
                setReconnectAttempts(0);
                if (onConnect) onConnect();

                // Send periodic ping to keep alive
                const pingInterval = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }));
                    }
                }, 30000);

                ws.pingInterval = pingInterval;
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastMessage(data);
                    if (onMessage) onMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
            };

            ws.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                setIsConnected(false);
                if (ws.pingInterval) clearInterval(ws.pingInterval);
                if (onDisconnect) onDisconnect();

                // Attempt reconnection
                if (reconnectAttempts < maxReconnectAttempts) {
                    console.log(`Reconnecting... Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        setReconnectAttempts(prev => prev + 1);
                        connect();
                    }, reconnectInterval);
                }
            };

            websocketRef.current = ws;

        } catch (error) {
            console.error('Failed to create WebSocket:', error);
        }
    };

    const disconnect = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (websocketRef.current) {
            websocketRef.current.close();
            websocketRef.current = null;
        }
    };

    const sendMessage = (message) => {
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            websocketRef.current.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket is not connected');
        }
    };

    useEffect(() => {
        if (url) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [url]);

    return {
        isConnected,
        lastMessage,
        sendMessage,
        disconnect,
        reconnect: connect
    };
}
