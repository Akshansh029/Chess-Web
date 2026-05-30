"use client";

import React, { useState, useEffect, useRef } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { MessageType } from "@/types/chat";
import { gsap } from "gsap";
import { Send, User, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatInterface = () => {
  const { messages, connected, connect, sendMessage } = useWebSocket();
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      connect(username);
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && connected) {
      sendMessage(username, inputMessage);
      setInputMessage("");
    }
  };

  if (!isJoined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <User className="text-primary w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Welcome to Live Chess</h2>
            <p className="text-foreground/60 text-sm">
              Enter your name to join the lobby
            </p>
          </div>

          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Grandmaster"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Join Lobby
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="max-w-4xl mx-auto w-full h-[70vh] flex flex-col glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <MessageCircle className="text-primary w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">Lobby Chat</h3>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
              ></span>
              <span className="text-xs text-foreground/50">
                {connected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground/70">
            {username}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-dots"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x:
                  msg.type === MessageType.JOIN
                    ? 0
                    : msg.sender === username
                      ? 20
                      : -20,
              }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.type === MessageType.JOIN ? "justify-center" : msg.sender === username ? "justify-end" : "justify-start"}`}
            >
              {msg.type === MessageType.JOIN ? (
                <span className="text-xs bg-white/5 px-3 py-1 rounded-full text-foreground/40 border border-white/5">
                  {msg.sender} joined the arena
                </span>
              ) : (
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.sender === username
                      ? "bg-primary text-white rounded-tr-none"
                      : "glass text-white rounded-tl-none"
                  } shadow-lg`}
                >
                  {msg.sender !== username && (
                    <p className="text-[10px] font-bold opacity-50 mb-1">
                      {msg.sender}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-white/5 border-t border-white/10 flex gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={connected ? "Type a message..." : "Reconnecting..."}
          disabled={!connected}
          className="flex-1 bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!connected || !inputMessage.trim()}
          className="bg-primary hover:bg-primary/90 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 disabled:transform-none"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
