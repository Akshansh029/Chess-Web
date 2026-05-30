import Image from "next/image";
import ChatInterface from "@/components/chat/ChatInterface";
import { Trophy, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-2">
            <Zap size={14} className="fill-primary" />
            <span>Phase 1: Real-time Echo Server</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent italic">
            LIVE CHESS
          </h1>
          <p className="text-foreground/60 max-w-xl mx-auto text-lg">
            Experience the thrill of real-time strategy. Connect with players
            around the globe in a high-performance environment.
          </p>
        </div>

        {/* Chat Interface */}
        <ChatInterface />

        {/* Feature Grid (Phase 1 placeholders) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-16">
          <div className="glass-card p-6 border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all group">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
              <Users className="text-foreground/40 group-hover:text-primary transition-all" />
            </div>
            <h4 className="font-bold mb-2 text-foreground/80 lowercase tracking-tight">
              01. real-time matchmaking
            </h4>
            <p className="text-sm text-foreground/40 leading-relaxed">
              Integrated WebSocket matchmaking for instantaneous pairing across
              global servers.
            </p>
          </div>

          <div className="glass-card p-6 border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all group">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
              <Zap className="text-foreground/40 group-hover:text-primary transition-all" />
            </div>
            <h4 className="font-bold mb-2 text-foreground/80 lowercase tracking-tight">
              02. ultra-low latency
            </h4>
            <p className="text-sm text-foreground/40 leading-relaxed">
              Optimized STOMP protocol ensuring moves are reflected in under
              50ms.
            </p>
          </div>

          <div className="glass-card p-6 border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all group">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
              <Trophy className="text-foreground/40 group-hover:text-primary transition-all" />
            </div>
            <h4 className="font-bold mb-2 text-foreground/80 lowercase tracking-tight">
              03. rank progression
            </h4>
            <p className="text-sm text-foreground/40 leading-relaxed">
              Competitive ELO-based ranking system with seasonal rewards and
              achievements.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/5 mt-20 bg-black/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
            <Image src="/next.svg" alt="Next.js" width={80} height={20} />
          </div>
          <p className="text-foreground/20 text-xs font-mono uppercase tracking-[0.2em]">
            &copy; 2026 Live Chess Ecosystem / built with spring & next.js
          </p>
        </div>
      </footer>
    </div>
  );
}
