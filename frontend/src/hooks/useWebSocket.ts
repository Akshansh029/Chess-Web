import { useState, useCallback, useRef, useEffect } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ChatMessage, MessageType } from "@/types/chat";

const WS_URL = "http://localhost:8080/ws"; // Assuming backend runs on 8080

export const useWebSocket = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  const onMessageReceived = useCallback((payload: IMessage) => {
    const message = JSON.parse(payload.body) as ChatMessage;
    setMessages((prev) => [...prev, message]);
  }, []);

  const sendJoinMessage = useCallback((username: string) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: "/app/addUser",
        body: JSON.stringify({
          sender: username,
          type: MessageType.JOIN,
        }),
      });
    }
  }, []);

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

  const connect = useCallback(
    (username: string) => {
      if (clientRef.current) return;

      const client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        onConnect: () => {
          setConnected(true);
          client.subscribe("/topic/public", onMessageReceived);

          // Automatically send join message once connected
          client.publish({
            destination: "/app/addUser",
            body: JSON.stringify({
              sender: username,
              type: MessageType.JOIN,
            }),
          });
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
    [onMessageReceived],
  );

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  return {
    messages,
    connected,
    connect,
    disconnect,
    sendMessage,
    sendJoinMessage,
  };
};
