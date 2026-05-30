import { useState, useCallback, useRef, useEffect } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ChatMessage, MessageType, GameSession } from "@/types/game";

const WS_URL = "http://localhost:8080/ws";

export const useWebSocket = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<{
    [key: string]: { unsubscribe: () => void };
  }>({});

  const onPublicMessageReceived = useCallback((payload: IMessage) => {
    const message = JSON.parse(payload.body) as ChatMessage;
    setMessages((prev) => [...prev, message]);
  }, []);

  const onGameUpdateReceived = useCallback((payload: IMessage) => {
    const session = JSON.parse(payload.body) as GameSession;
    setGameSession(session);
  }, []);

  const connect = useCallback(
    (onConnectedCallback?: () => void) => {
      if (clientRef.current?.active) return;

      const client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        onConnect: () => {
          setConnected(true);
          client.subscribe("/topic/public", onPublicMessageReceived);
          if (onConnectedCallback) onConnectedCallback();
        },
        onDisconnect: () => {
          setConnected(false);
        },
        debug: (str) => {
          console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.activate();
      clientRef.current = client;
    },
    [onPublicMessageReceived],
  );

  const subscribeToGame = useCallback(
    (gameId: string) => {
      if (clientRef.current?.connected) {
        // Unsubscribe from previous game if any
        if (subscriptionsRef.current.game) {
          subscriptionsRef.current.game.unsubscribe();
        }

        const sub = clientRef.current.subscribe(
          `/topic/game.${gameId}`,
          onGameUpdateReceived,
        );
        subscriptionsRef.current.game = sub;
      }
    },
    [onGameUpdateReceived],
  );

  const sendMessage = useCallback((username: string, content: string) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: "/app/sendMessage",
        body: JSON.stringify({
          sender: username,
          content,
          type: MessageType.CHAT,
        }),
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  return {
    messages,
    gameSession,
    setGameSession,
    connected,
    connect,
    disconnect,
    sendMessage,
    subscribeToGame,
  };
};
