import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Eye, EyeOff, Loader2, ArrowLeft, ShieldAlert, Terminal, KeyRound, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "../components/Toast.jsx";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Advanced Multi-Layer Security States
  const [gatewayUnlocked, setGatewayUnlocked] = useState(false);
  const [gatewayCode, setGatewayCode] = useState("");
  const [gateLoading, setGateLoading] = useState(false);
  const [gateError, setGateError] = useState(false);

  const handleVerifyGate = (e) => {
    e.preventDefault();
    if (gatewayCode === "2121" || gatewayCode.toLowerCase() === "habtamu") {
      setGateLoading(true);
      setGateError(false);
      setTimeout(() => {
        setGateLoading(false);
        setGatewayUnlocked(true);
        toast("Port authorized! Direct secure pathway opened.", "success");
      }, 1000);
    } else {
      setGateError(true);
      toast("Security rejection: Invalid signature code.", "error");
      setTimeout(() => setGateError(false), 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast("Please enter both username and password", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        onLogin(data.token, data.user);
        toast("Access granted! Authenticated securely.", "success");
        navigate("/admin");
      } else {
        const err = await res.json();
        toast(err.error || "Authentication failed. Invalid keys.", "error");
      }
    } catch (error) {
      toast("SQL Server handshake failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white flex items-center justify-center p-6 overflow-hidden transition-colors duration-300">
      
      {/* Background glow overlay */}

      {/* Back to Home shortcut */}
      

      <div className="max-w-md w-full relative z-10">
        <AnimatePresence mode="wait">
          {!gatewayUnlocked ? (
            /* Gateway Lock Stage */
            <motion.div
              key="gateway-lock"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 dark:bg-[#0c0c0c] rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-red-500/15 shadow-2xl relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

              <div className="flex flex-col items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 pointer-events-none"
                  title="Secure Gate"
                >
                  <KeyRound className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-mono text-xs uppercase tracking-widest text-red-500 font-bold mb-1 flex items-center justify-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-500" /> Port Access Denied
                  </h2>
                  <p className="text-[10px] text-gray-500 font-mono">ENCRYPTED ADMINISTRATOR ROUTE DETECTED</p>
                </div>
              </div>

              <form onSubmit={handleVerifyGate} className="flex flex-col gap-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    System Handshake Passkey
                  </label>
                  <div className="relative">
                    <Terminal className="w-4 h-4 text-red-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={gatewayCode}
                      onChange={(e) => setGatewayCode(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-black border rounded focus:outline-none focus:border-red-500 text-sm text-gray-900 dark:text-white font-mono placeholder-gray-400 dark:placeholder-gray-800 transition-colors ${
                        gateError ? "border-red-500 ring-1 ring-red-500/20" : "border-gray-300 dark:border-white/10"
                      }`}
                      placeholder="Enter Gateway PIN"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={gateLoading}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded uppercase tracking-widest font-mono flex items-center justify-center gap-2 transition duration-300 disabled:opacity-50"
                >
                  {gateLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Signature...</span>
                    </>
                  ) : (
                    <span>Unlock Pathway</span>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            /* Login Form Stage */
            <motion.div
              key="login-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 dark:bg-[#0c0c0c] rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gold-500/15 shadow-2xl relative overflow-hidden text-left"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient" />

              {/* Secure Port Status Banner */}
              <div
                className="mb-6 p-2 rounded bg-emerald-500/5 border border-emerald-500/10 text-[9px] text-emerald-500 uppercase tracking-widest font-mono flex items-center gap-1.5 select-none"
                title="Secure Diagnostic Link"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Path Cleared • Port Session Restored Successfully</span>
              </div>

              <div className="flex flex-col items-center gap-3 mb-6 text-center">
                <span className="font-serif text-3xl font-extrabold tracking-widest text-gray-900 dark:text-white">
                  HABTAMU<span className="text-gold-500">.</span>
                </span>
                <span className="text-xs uppercase font-mono tracking-widest text-gold-600 dark:text-gold-500 font-semibold bg-gold-500/5 px-3 py-1 rounded border border-gold-500/10">
                  Secure Admin Gateway
                </span>
              </div>

              <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold-500" /> Authorized Sign-In
              </h2>
              <p className="text-xs text-gray-500 font-mono mb-6">PROMPT FOR RELATIONAL PERSISTENT DATABASE SESSION</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-600 dark:text-gray-400">Username</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-white/10 rounded focus:outline-none focus:border-gold-500 text-sm text-gray-900 dark:text-white font-mono placeholder-gray-400 dark:placeholder-gray-800"
                      placeholder="e.g. Habtamu simeneh"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-600 dark:text-gray-400">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-white dark:bg-black border border-gray-300 dark:border-white/10 rounded focus:outline-none focus:border-gold-500 text-sm text-gray-900 dark:text-white font-mono placeholder-gray-400 dark:placeholder-gray-800"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gold-gradient text-black font-semibold text-xs rounded uppercase tracking-wider font-mono flex items-center justify-center gap-2 hover-gold-glow disabled:opacity-50 transition duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Synchronizing Handshake...</span>
                      </>
                    ) : (
                      <span>Verify Credentials</span>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
