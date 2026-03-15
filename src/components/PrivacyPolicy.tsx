import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Trash2, EyeOff, Database, X, ChevronRight, BrainCircuit } from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-3xl max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-white tracking-tight">Privacy Policy</h2>
                  <p className="text-emerald-400/60 text-xs font-bold uppercase tracking-widest">Plain English Version</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-2xl hover:bg-white/5 text-white/40 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  <EyeOff className="w-5 h-5 text-indigo-400" />
                  Data Minimization
                </h3>
                <p className="text-white/60 leading-relaxed">
                  We believe in taking only what's necessary. When you sign in, we only collect your <span className="text-white font-medium">Google email address and name</span>. We don't ask for your phone number, home address, or any other personal details.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  <Database className="w-5 h-5 text-purple-400" />
                  Zero-Training Policy
                </h3>
                <p className="text-white/60 leading-relaxed">
                  Your academic work is your intellectual property. We have a <span className="text-white font-medium">strict zero-training policy</span>. This means your uploaded PDFs, lecture videos, and transcripts are <span className="italic text-indigo-300">never</span> used to train our AI models or any third-party Large Language Models (LLMs).
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  Bank-Grade Encryption
                </h3>
                <p className="text-white/60 leading-relaxed">
                  Security isn't an afterthought. All your data is encrypted using <span className="text-white font-medium">AES-256 standards</span> both while it's traveling to our servers (in transit) and while it's stored (at rest). Your notes are as secure as a digital vault.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  Complete User Control
                </h3>
                <p className="text-white/60 leading-relaxed">
                  You own your data. If you decide to leave NotesAI, you can delete your account and all associated study data <span className="text-white font-medium">instantly with one click</span>. We don't keep "ghost" copies of your files once you hit delete.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  <BrainCircuit className="w-5 h-5 text-blue-400" />
                  Third-Party Processing
                </h3>
                <p className="text-white/60 leading-relaxed">
                  To provide smart summaries, we use the Google Gemini API. However, we <span className="text-white font-medium">never send your personal identifiers</span> (like your name or email) to the processing API. We only send the lecture content itself for analysis.
                </p>
              </section>

              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                <p className="text-sm text-white/40 italic text-center">
                  "Our mission is to help you learn faster, not to profit from your personal information. We're students of privacy as much as we are of technology."
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-center">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-black font-bold hover:bg-white/90 transition-all"
              >
                I Understand
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
