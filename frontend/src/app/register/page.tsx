"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import { GameShell } from "@/components/layout/GameShell";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Key,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const { register, sendVerificationCode, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      toast.error("Please fill out all fields.");
      return;
    }

    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters long.");
      toast.error("Name must be at least 3 characters long.");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(name.trim())) {
      setError("Username can only contain letters, numbers, and underscores.");
      toast.error(
        "Username can only contain letters, numbers, and underscores.",
      );
      return;
    }

    try {
      const sent = await sendVerificationCode(email);
      if (sent) {
        setInfoMessage("Verification code sent to your email.");
        toast.success("Verification code sent to your email.");
        setStep(2);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg =
        err.message || "Failed to register or email already registered.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError("Please enter the verification code.");
      toast.error("Please enter the verification code.");
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        verificationCode: code,
      });
      toast.success("Profile created successfully! Welcome to ChessWeb.");
      router.push("/lobby");
    } catch (err: any) {
      console.error(err);
      const errMsg =
        err.message || "Invalid verification code. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleResend = async () => {
    setError(null);
    setInfoMessage(null);
    try {
      await sendVerificationCode(email);
      setInfoMessage("A new verification code has been sent.");
      toast.success("A new verification code has been sent.");
    } catch (err: any) {
      const errMsg = err.message || "Failed to resend verification code.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <GameShell>
      <div className="w-full max-w-md mx-auto flex flex-col justify-center items-center min-h-[calc(100vh-140px)] py-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass-card p-10 w-full relative overflow-hidden"
        >
          {/* Backing Icon */}
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <User size={120} />
          </div>

          <div className="relative z-10 flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30 shadow-lg shadow-primary/10">
              <User className="text-primary w-7 h-7" />
            </div>
            <h2 className="text-2xl font-light tracking-tight text-white">
              {step === 1 ? "Create Account" : "Verify Email"}
            </h2>
            <p className="text-foreground/40 text-xs font-normal mt-1">
              {step === 1
                ? "Enlist as a new strategist"
                : `Enter code sent to ${email}`}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-xs font-semibold relative z-10"
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {infoMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-start gap-3 text-xs font-semibold relative z-10"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 mt-0.5 shrink-0"
                fill="currentColor"
              >
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5H13V18H11V16.5M11,6H13V15H11V6Z" />
              </svg>
              <span>{infoMessage}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendCode}
                className="space-y-4 relative z-10"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40 ml-1">
                    Display Codename
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/30">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold placeholder:text-foreground/20 text-white text-sm"
                      placeholder="Ex: Kasparov-2026"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40 ml-1">
                    Secure Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/30">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold placeholder:text-foreground/20 text-white text-sm"
                      placeholder="name@domain.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40 ml-1">
                    Set Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/30">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-11 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold placeholder:text-foreground/20 text-white text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-foreground/30 hover:text-foreground/60 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-neutral-100 text-black font-semibold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-xs border border-white mt-6 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegister}
                className="space-y-5 relative z-10"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40 ml-1">
                    Verification OTP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/30">
                      <Key size={16} />
                    </div>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold placeholder:text-foreground/20 text-white text-sm tracking-[0.2em] text-center"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-neutral-100 text-black font-semibold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-xs border border-white mt-6 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Confirm & Create Profile
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>

                <div className="flex justify-between items-center text-xs mt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-foreground/40 hover:text-white transition-colors flex items-center gap-1.5 font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-primary hover:text-accent font-semibold transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center text-xs relative z-10">
            <p className="text-foreground/40 font-semibold uppercase tracking-wider">
              Already registered?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-accent font-semibold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </GameShell>
  );
}
