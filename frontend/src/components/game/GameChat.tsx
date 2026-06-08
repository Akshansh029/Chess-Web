"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { MessageType } from "@/types/game";
import { Send } from "lucide-react";

export const GameChat: React.FC = () => {
  const { messages, sendMessage, playerName } = useGame();
  const [inputText, setInputText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(playerName, inputText.trim());
    setInputText("");
  };

  useEffect(() => {
    // Auto scroll to bottom of the messages container only
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[280px] bg-transparent font-sans">
      {/* Messages List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-white/5"
      >
        {messages.map((msg, index) => {
          const isSystem =
            msg.type === MessageType.JOIN || msg.type === MessageType.LEAVE;
          const isSelf = msg.sender === playerName;

          if (isSystem) {
            const systemText =
              msg.type === MessageType.JOIN
                ? `${msg.sender} entered the arena`
                : `${msg.sender} left the arena`;

            return (
              <div
                key={index}
                className="text-center text-[9px] font-semibold uppercase tracking-wider text-foreground/30 py-1.5 border-y border-white/1 my-2"
              >
                {systemText}
              </div>
            );
          }

          return (
            <div
              key={index}
              className={`flex flex-col max-w-[80%] ${
                isSelf ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              {/* Sender Name */}
              {!isSelf && (
                <span className="text-[10px] font-medium text-foreground/40 mb-1 pl-1">
                  {msg.sender}
                </span>
              )}
              {/* Message Bubble */}
              <div
                className={`px-3 py-2 text-xs rounded-2xl wrap-break-word whitespace-pre-wrap leading-relaxed shadow-sm ${
                  isSelf
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-white/5 border border-white/5 text-foreground/80 rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-[10px] uppercase font-semibold text-foreground/20 tracking-wider">
            No communications yet
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-white/5 flex gap-2 bg-black/10"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-foreground/35 outline-none focus:border-primary/50 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-white text-black hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer border border-white active:scale-95"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};
