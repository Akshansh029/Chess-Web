import { useState, useCallback, useRef, useEffect } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ChatMessage, MessageType, GameSession, Color } from "@/types/game";

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
        webSocketFactory: () =>
          new SockJS(WS_URL, null, { transports: ["websocket"] }),
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

  const unsubscribeFromGame = useCallback(() => {
    if (subscriptionsRef.current.game) {
      subscriptionsRef.current.game.unsubscribe();
      delete subscriptionsRef.current.game;
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

  const sendMove = useCallback(
    (
      gameId: string,
      playerId: string,
      move: { from: string; to: string; piece: string; promotionPiece?: string },
      color: Color
    ) => {
      if (clientRef.current?.connected) {
        clientRef.current.publish({
          destination: "/app/game.move",
          body: JSON.stringify({
            gameId,
            playerId,
            move,
            color,
          }),
        });
      }
    },
    []
  );

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate({ force: true });
      clientRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (clientRef.current) {
        clientRef.current.deactivate({ force: true });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (clientRef.current) {
        clientRef.current.deactivate({ force: true });
      }
    };
  }, []);

  const sendResign = useCallback(
    (gameId: string, playerId: string, playerName: string) => {
      if (clientRef.current?.connected) {
        clientRef.current.publish({
          destination: "/app/game.resign",
          body: JSON.stringify({
            gameId,
            playerId,
            playerName,
          }),
        });
      }
    },
    []
  );

  const sendDrawOffer = useCallback(
    (
      gameId: string,
      playerId: string,
      playerName: string,
      opponentId: string,
      opponentName: string
    ) => {
      if (clientRef.current?.connected) {
        clientRef.current.publish({
          destination: "/app/game.draw.offer",
          body: JSON.stringify({
            gameId,
            playerId,
            playerName,
            opponentId,
            opponentName,
          }),
        });
      }
    },
    []
  );

  const sendDrawAccept = useCallback(
    (gameId: string, offerAccepterByPlayerId: string, offerAcceptedByPlayerName: string) => {
      if (clientRef.current?.connected) {
        clientRef.current.publish({
          destination: "/app/game.draw.accept",
          body: JSON.stringify({
            gameId,
            offerAccepterByPlayerId,
            offerAcceptedByPlayerName,
          }),
        });
      }
    },
    []
  );

  const sendDrawDecline = useCallback(
    (gameId: string, offerAccepterByPlayerId: string, offerAcceptedByPlayerName: string) => {
      if (clientRef.current?.connected) {
        clientRef.current.publish({
          destination: "/app/game.draw.decline",
          body: JSON.stringify({
            gameId,
            offerAccepterByPlayerId,
            offerAcceptedByPlayerName,
          }),
        });
      }
    },
    []
  );

  return {
    messages,
    gameSession,
    setGameSession,
    connected,
    connect,
    disconnect,
    sendMessage,
    sendMove,
    sendResign,
    sendDrawOffer,
    sendDrawAccept,
    sendDrawDecline,
    subscribeToGame,
    unsubscribeFromGame,
  };
};
