"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (msg: string, duration?: number) => void;
    error: (msg: string, duration?: number) => void;
    info: (msg: string, duration?: number) => void;
    show: (msg: string, type: ToastType, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastType, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string, dur?: number) => show(msg, "success", dur), [show]);
  const error = useCallback((msg: string, dur?: number) => show(msg, "error", dur), [show]);
  const info = useCallback((msg: string, dur?: number) => show(msg, "info", dur), [show]);

  return (
    <ToastContext.Provider value={{ toast: { success, error, info, show } }}>
      {children}

      {/* Toast Portal Container */}
      <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`pointer-events-auto flex items-start justify-between gap-3 px-4 py-3.5 rounded-xl border glass text-sm font-semibold shadow-lg ${
                t.type === "error"
                  ? "border-red-500/20 bg-red-950/45 text-red-200 shadow-red-500/5"
                  : t.type === "success"
                  ? "border-green-500/20 bg-green-950/45 text-green-200 shadow-green-500/5"
                  : "border-primary/20 bg-slate-900/60 text-blue-200 shadow-primary/5"
              }`}
            >
              <div className="flex gap-2.5 items-start">
                <div className="mt-0.5 flex-shrink-0">
                  {t.type === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
                  {t.type === "success" && <CheckCircle className="w-4 h-4 text-green-400" />}
                  {t.type === "info" && <Info className="w-4 h-4 text-primary" />}
                </div>
                <span className="leading-snug break-words pr-2">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-foreground/40 hover:text-white transition-colors mt-0.5 p-0.5 rounded-md hover:bg-white/5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
