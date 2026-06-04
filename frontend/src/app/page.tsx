"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Color } from "@/types/game";
import { GameShell } from "@/components/layout/GameShell";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Shield,
  Play,
  Lock,
  UserPlus,
  Users,
  Trophy,
  Tv,
} from "lucide-react";
import Link from "next/link";

// WebGL Interactive Shader Background Component
function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    function syncSize() {
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    window.addEventListener("resize", syncSize);
    syncSize();

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      varying vec2 v_texCoord;

      void main() {
        vec2 uv = v_texCoord;
        vec2 m = u_mouse / u_resolution;
        
        // Background base: Deep obsidian to sapphire gradient
        vec3 color = mix(vec3(0.02, 0.05, 0.12), vec3(0.01, 0.02, 0.05), uv.y);
        
        // Animate light leaks
        float time = u_time * 0.2;
        vec2 p1 = uv + vec2(sin(time), cos(time)) * 0.1;
        float leak1 = smoothstep(0.8, 0.0, length(p1 - vec2(0.8, 0.2)));
        color += leak1 * vec3(0.1, 0.25, 0.6) * 0.35;
        
        vec2 p2 = uv + vec2(cos(time * 0.8), sin(time * 1.2)) * 0.15;
        float leak2 = smoothstep(1.0, 0.0, length(p2 - vec2(0.2, 0.8)));
        color += leak2 * vec3(0.25, 0.1, 0.45) * 0.3;
        
        // Interactive mouse glow
        float dist = length(uv - m);
        float glow = smoothstep(0.5, 0.0, dist);
        color += glow * vec3(0.05, 0.2, 0.4) * 0.45;
        
        // Subtle digital grid flicker
        float grid = (sin(uv.x * 60.0) + sin(uv.y * 60.0)) * 0.008;
        color += grid * 0.12;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function compileShader(type: number, src: string) {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    if (!prog) return;

    const vertexShader = compileShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fs);
    if (!vertexShader || !fragmentShader) return;

    gl.attachShader(prog, vertexShader);
    gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animFrame: number;
    function render(t: number) {
      if (!gl || !canvas) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animFrame = requestAnimationFrame(render);
    }
    animFrame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", syncSize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-70 pointer-events-none z-0"
    />
  );
}

export default function Home() {
  const { connect } = useGame();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // If already authenticated, send to lobby
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      connect();
      router.push("/lobby");
    }
  }, [isAuthenticated, isLoading, connect, router]);

  if (isLoading) {
    return (
      <GameShell>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-foreground/40 text-xs font-black uppercase tracking-widest">
            Loading Arena...
          </p>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col justify-center items-center py-10 px-4 overflow-hidden">
        {/* WebGL Interactive Shader Background */}
        <ShaderBackground />

        {/* 3D Chess Board Overlay blending in the background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-screen bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDj7-mGF8xoipXD8X8gAo-RHUeilPWJhUYy4r4su0G8NKCsE_wIGLVT3XSJF8ptNxevf1Gq6I7Ghry93du5n0j-OLbAFa4Lth_LndOL-rm7bdygWCN_h7Fu7n5iIGDHMuiKOgjVmWslV4Vrh-jU3Jd5fe3eXz8IxmUnqPBi6IHhOMrEpzncRtcWPAPV43q5I9sx_nOW7GijeIISSwVQ7O98PvumD2TLfjIZYdwH8b7uPVrUD5C8uTElDXK1lWP2t0Aj5-1-6Z5gxQI')",
          }}
        />

        {/* Content Container */}
        <div className="relative z-10 max-w-4xl w-full mx-auto flex flex-col items-center gap-10 text-center">
          {/* Logo & Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            {/* ChessWeb Logo Image */}
            <div className="w-24 h-24 md:w-32 md:h-32 relative mb-2">
              <img
                alt="ChessWeb Logo"
                className="w-full h-full object-contain rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.3)] border border-white/10"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuARgJ5VJfN8rFnT6Hl-mkJhdzmJaVOXRNCFocXJqo0h-CE0CmF5oOtmdObnneSm7b9wZRCq8dUk53XMoHEfrYYiBsKiDn-F3tDSSjU7-wPYTGPsC0WC79IshMUXSbyU8b6sF2ngaa_KzWIm3Xh-wH_EFDd_He0aJ1pP2_jNj1tlVg5VEvQRGLpMgo1c9BabSCU__PiJnIbyxQstuvLIUO3zM2Fv3CWGt6-o9VJrlJuzbznCJpEzEu4eVlJDUN74L7xzGy0smT3XDJE"
              />
            </div>

            <h1 className="font-extrabold text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 drop-shadow-md tracking-tight leading-tight uppercase italic">
              Intellectual Luxury
              <br />
              in Every Move
            </h1>
            <p className="text-foreground/60 text-sm md:text-base max-w-xl mx-auto font-medium tracking-wide">
              Enter the high-stakes command center of competitive chess. Analyze
              deeply, move decisively, and ascend the ranks in our
              precision-engineered arena.
            </p>
          </motion.div>

          {/* Glassmorphic Console */}
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-slate-950/60 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col gap-4"
            >
              <Link
                href="/register"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:brightness-110 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs border border-white/10 active:scale-98"
              >
                <UserPlus size={16} />
                Register Now
              </Link>

              <Link
                href="/login"
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs active:scale-98"
              >
                <Lock size={16} />
                Log In
              </Link>
            </motion.div>
          </div>

          {/* Quick Stats Bento Grid */}
          {/* <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mt-4"
          >
            <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-xl p-5 flex flex-col items-center justify-center gap-1 shadow-xl">
              <Users className="text-blue-400 w-6 h-6 mb-1" />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Players Online</span>
              <span className="text-xl font-extrabold text-blue-200">14,208</span>
            </div>

            <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-xl p-5 flex flex-col items-center justify-center gap-1 shadow-xl">
              <Trophy className="text-emerald-400 w-6 h-6 mb-1" />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Active Tourneys</span>
              <span className="text-xl font-extrabold text-emerald-200">32</span>
            </div>

            <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-xl p-5 flex flex-row items-center justify-between col-span-2 relative overflow-hidden group shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent z-0"></div>
              <div className="relative z-10 flex flex-col items-start text-left">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">Live Broadcast</span>
                <span className="text-sm font-bold text-white mt-0.5">Grandmaster Invitational</span>
              </div>
              <button className="relative z-10 w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.4)] cursor-pointer">
                <Tv size={16} />
              </button>
            </div>
          </motion.div> */}
        </div>
      </div>
    </GameShell>
  );
}
