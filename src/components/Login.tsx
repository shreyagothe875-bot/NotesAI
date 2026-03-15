import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Import the BrainCircuit icon from lucide-react
import { BrainCircuit } from 'lucide-react';

export default function Login() {
  const { login, signup, loginWithGoogle } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true); // Toggle between Login and Signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Do you need to sign up?");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please log in.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center p-4 font-sans">

      {/* Header section with BrainCircuit Icon */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-[#ff5a1f] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(255,90,31,0.3)]">
          <BrainCircuit className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-2">NotesAI</h1>
        <h2 className="text-[#ff5a1f] text-sm tracking-widest font-semibold uppercase mb-2">
          Secure Vault Access
        </h2>
        <p className="text-gray-400 text-xs uppercase tracking-wide max-w-xs mx-auto">
          Your knowledge, locked. We learn with you, never from you.
        </p>
      </div>

      <div className="w-full max-w-md space-y-6">

        {/* Error Message Box */}
        {error && (
          <div className="bg-red-950/50 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-start gap-3">
            <span className="mt-0.5">⚠️</span>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Google Auth Button */}
        <button
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-xl font-medium"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        {/* Privacy Notice */}
        <p className="text-[10px] text-gray-500 flex items-start gap-2 px-2">
          <span className="text-[#ff5a1f] text-sm">🛡️</span>
          We only access your basic profile (name and email) to create your personalized study dashboard. We <strong className="text-[#ff5a1f]">never</strong> access your Google Drive or private files.
        </p>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="grow border-t border-white/10"></div>
          <span className="shrink-0 mx-4 text-xs font-semibold tracking-widest text-gray-500 uppercase">
            Or {isLoginMode ? 'sign in' : 'sign up'} with email
          </span>
          <div className="grow border-t border-white/10"></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-5">

          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wider text-gray-400 uppercase ml-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff5a1f] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1 pr-1">
              <label className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Password</label>
              {isLoginMode && (
                <button type="button" className="text-xs font-bold text-[#ff5a1f] hover:text-[#ff7a4c] uppercase">
                  Forgot Password?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff5a1f] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ff5a1f] hover:bg-[#ff7a4c] text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,90,31,0.4)] transition-all flex justify-center items-center gap-2"
          >
            {isLoading ? "Processing..." : (isLoginMode ? "Enter Secure Workspace" : "Create Secure Account")}
            {!isLoading && <span>→</span>}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError(null);
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <span className="text-[#ff5a1f] font-semibold underline underline-offset-4 decoration-[#ff5a1f]/30">
              {isLoginMode ? "Sign up" : "Log in"}
            </span>
          </button>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-16 text-center space-y-2">
        <p className="text-xs font-bold tracking-widest text-[#ff5a1f] flex items-center justify-center gap-2">
          🛡️ AES-256 ENCRYPTED & PRIVACY-FIRST AI
        </p>
        <p className="text-[10px] tracking-[0.2em] text-gray-600 font-semibold">
          END-TO-END SECURE PROTOCOL
        </p>
      </div>

    </div>
  );
}