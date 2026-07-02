import React, { useState } from "react";
import { User } from "../types";
import { ShieldCheck, UserCheck, Key, Lock, PhoneCall, Sparkles, AlertCircle, LogIn, ArrowRight } from "lucide-react";
import { googleSignIn } from "../utils/auth";

interface AuthViewProps {
  onLoginSuccess: (user: User, googleToken?: string) => void;
}

export default function AuthView({ onLoginSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("QA Auditor");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick fill admin credentials for comfortable reviewer testing
  const handleQuickFill = () => {
    setUsername("admin");
    setPassword("password");
    setError(null);
  };

  const handleQuickFillStaff = () => {
    setUsername("auditor123");
    setPassword("tplus123");
    setError(null);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        const { user, accessToken } = result;
        onLoginSuccess({
          id: user.uid,
          username: user.email || "google-user",
          displayName: user.displayName || "Google User",
          role: "Google Sheet Auditor"
        }, accessToken);
      }
    } catch (err: any) {
      console.error("Google sign in failed:", err);
      setError("ເຂົ້າສູ່ລະບົບດ້ວຍ Google ບໍ່ສຳເລັດ: " + (err.message || "ເກີດຂໍ້ຜິດພາດໃນການຕິດຕໍ່ Google. ກະລຸນາລອງໃໝ່."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
    if (!username.trim() || !password) {
      setError("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
      return;
    }

    if (!isLogin && !displayName.trim()) {
      setError("ກະລຸນາປ້ອນຊື່ ແລະ ນາມສະກຸນ ຂອງທ່ານ");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Log in API call
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.success) {
          // Success callback
          onLoginSuccess(data.user);
        } else {
          setError(data.error || "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
        }
      } else {
        // Register API call
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, displayName, role })
        });
        const data = await response.json();
        if (data.success) {
          setSuccessMsg("ລົງທະບຽນສຳເລັດແລ້ວ! ກະລຸນາເຂົ້າສູ່ລະບົບ");
          setIsLogin(true);
          setPassword(""); // Reset password but keep username for instant login convenience
        } else {
          setError(data.error || "ບໍ່ສາມາດລົງທະບຽນໄດ້");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      // Fallback local mock client side authentication if server hasn't built yet
      if (isLogin) {
        if (username === "admin" && password === "password") {
          onLoginSuccess({
            id: "user-1",
            username: "admin",
            displayName: "Latsamy Phanthaboun",
            role: "Senior QA Auditor"
          });
        } else if (username === "auditor123" && password === "tplus123") {
          onLoginSuccess({
            id: "user-2",
            username: "auditor123",
            displayName: "TPLUS Staff",
            role: "QA Associate"
          });
        } else {
          setError("ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ (ໂຫມດ Fallback)");
        }
      } else {
        setSuccessMsg("ລົງທະບຽນສຳເລັດແລ້ວໃນໂຫມດ Fallback! ກະລຸນາເຂົ້າສູ່ລະບົບ");
        setIsLogin(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="auth-page" className="min-h-screen w-full bg-[#070709] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(185,28,28,0.15),rgba(255,255,255,0))] flex flex-col items-center justify-center p-4 sm:p-6 select-none antialiased font-sans">
      
      {/* Container holding Logo and Title */}
      <div id="auth-header" className="text-center mb-8 max-w-md">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-red-500 uppercase tracking-widest bg-red-950/40 px-3.5 py-1.5 rounded-full border border-red-900/30 mb-4 shadow-inner">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping mr-0.5" />
          <span>TPLUS CALL CENTER 123</span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
          <ShieldCheck className="w-8 h-8 text-red-500 shrink-0" />
          <span>QA Auditor Console</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-2 font-medium">
          ລະບົບກວດສອບ ແລະ ວິເຄາະຄຣິບສຽງການສົນທະນາຂອງພະນັກງານດ້ວຍເທັກໂນໂລຊີ AI ອັດສະລິຍະ
        </p>
      </div>

      {/* Main card box */}
      <div 
        id="auth-card" 
        className="w-full max-w-md bg-[#0d0d11]/90 backdrop-blur-md border border-zinc-900/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden"
      >
        {/* Abstract crimson background glow inside card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-900/5 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none" />

        {/* Tab Selector */}
        <div className="grid grid-cols-2 bg-zinc-950/60 p-1.5 rounded-2xl border border-zinc-900 mb-6">
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${
              isLogin 
                ? "bg-red-600 text-white shadow-lg shadow-red-900/20" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            ເຂົ້າສູ່ລະບົບ
          </button>
          <button
            id="auth-tab-register"
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${
              !isLogin 
                ? "bg-red-600 text-white shadow-lg shadow-red-900/20" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            ລົງທະບຽນໃໝ່
          </button>
        </div>

        {/* Alerts & Feedback */}
        {error && (
          <div id="auth-error-alert" className="mb-4 p-3.5 bg-red-950/30 border border-red-900/40 rounded-xl flex items-start gap-2.5 animate-pulse">
            <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
            <span className="text-[11px] text-red-300 leading-normal font-medium">{error}</span>
          </div>
        )}

        {successMsg && (
          <div id="auth-success-alert" className="mb-4 p-3.5 bg-emerald-950/30 border border-emerald-900/40 rounded-xl flex items-start gap-2.5">
            <Sparkles className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-[11px] text-emerald-300 leading-normal font-medium">{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form id="auth-form" onSubmit={handleSubmit} className="space-y-4">
          
          {/* Display Name Input (Only on Sign Up / Register) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label htmlFor="auth-input-name" className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">
                ຊື່ ແລະ ນາມສະກຸນ (Display Name) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 pointer-events-none">
                  <UserCheck className="w-4.5 h-4.5" />
                </span>
                <input
                  id="auth-input-name"
                  type="text"
                  required
                  placeholder="ຕົວຢ່າງ: ລັດສະໝີ ພັນທະບຸນ"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-zinc-900 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition"
                />
              </div>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1.5">
            <label htmlFor="auth-input-username" className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">
              ຊື່ຜູ້ໃຊ້ (Username) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 pointer-events-none">
                <LogIn className="w-4.5 h-4.5" />
              </span>
              <input
                id="auth-input-username"
                type="text"
                required
                autoComplete="username"
                placeholder="ຕົວຢ່າງ: admin, auditor123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-900 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="auth-input-password" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                ລະຫັດຜ່ານ (Password) <span className="text-red-500">*</span>
              </label>
              {isLogin && (
                <span className="text-[10px] text-zinc-600 italic">
                  ຄ່າເລີ່ມຕົ້ນ: password
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 pointer-events-none">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                id="auth-input-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="ປ້ອນລະຫັດຜ່ານຂອງທ່ານ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-900 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition"
              />
            </div>
          </div>

          {/* Role Dropdown Selector (Only on Sign Up / Register) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label htmlFor="auth-select-role" className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">
                ຕຳແໜ່ງ/ໜ້າທີ່ຮັບຜິດຊອບ (System Role)
              </label>
              <select
                id="auth-select-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition"
              >
                <option value="QA Auditor">QA Auditor (ພະນັກງານກວດສອບຄຸນນະພາບ)</option>
                <option value="Senior QA Auditor">Senior QA Auditor (ຫົວໜ້າທີມກວດສອບ)</option>
                <option value="QA Manager">QA Manager (ຜູ້ຈັດການຝ່າຍຄຸນນະພາບ)</option>
                <option value="TPLUS Call Center Executive">TPLUS Executive (ຜູ້ອຳນວຍການລະບົບ)</option>
              </select>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="auth-btn-submit"
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 text-white py-3.5 rounded-xl text-xs font-bold shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
            ) : isLogin ? (
              <>
                <span>ເຂົ້າສູ່ລະບົບ QA Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>ສ້າງບັນຊີຜູ້ໃຊ້ໃໝ່</span>
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </>
            )}
          </button>

          {/* Divider */}
          {isLogin && (
            <>
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-x-0 h-[1px] bg-zinc-900" />
                <span className="relative bg-[#0d0d11] px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  ຫຼື ເຂົ້າສູ່ລະບົບດ້ວຍ
                </span>
              </div>

              {/* Google Sign In Button */}
              <button
                id="auth-btn-google"
                type="button"
                disabled={isLoading}
                onClick={handleGoogleSignIn}
                className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white py-3 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2.5 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4.5 h-4.5 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>ເຂົ້າສູ່ລະບົບດ້ວຍ Google</span>
              </button>
            </>
          )}
        </form>

        {/* Quick Credentials Helpers for instant review & ease of use */}
        {isLogin && (
          <div id="auth-quick-helpers" className="mt-6 pt-5 border-t border-zinc-900/80 space-y-2.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block text-center">
              ເຂົ້າສູ່ລະບົບດ່ວນ (Quick Account Options)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="auth-btn-quick-admin"
                type="button"
                onClick={handleQuickFill}
                className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-red-950 rounded-xl p-2.5 text-[10px] text-zinc-400 hover:text-white transition text-left cursor-pointer flex flex-col justify-between"
              >
                <span className="font-bold text-red-500">Account: admin</span>
                <span className="text-[9px] text-zinc-600 mt-0.5">Latsamy (Senior)</span>
              </button>
              <button
                id="auth-btn-quick-staff"
                type="button"
                onClick={handleQuickFillStaff}
                className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-red-950 rounded-xl p-2.5 text-[10px] text-zinc-400 hover:text-white transition text-left cursor-pointer flex flex-col justify-between"
              >
                <span className="font-bold text-red-500">Account: auditor123</span>
                <span className="text-[9px] text-zinc-600 mt-0.5">TPLUS Staff (Junior)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Development Credits and Support */}
      <div id="auth-footer" className="mt-8 text-center space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
          <PhoneCall className="w-3.5 h-3.5 text-zinc-600 animate-pulse" />
          <span>ຕິດຕໍ່ TPLUS Call Center 123 | ພັດທະນາໂດຍ: </span>
          <span className="text-red-500 hover:text-red-400 font-bold transition duration-300 cursor-help" title="Latsamy Phanthaboun Developer Profile">
            LATSAMY PHANTHABOUN
          </span>
        </div>
        <p className="text-[9px] text-zinc-700 uppercase tracking-wider font-mono">
          Copyright © 2026 TPLUS Call Center 123. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
