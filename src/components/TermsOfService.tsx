import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, AlertTriangle, Activity, X, ChevronRight, BookOpen } from 'lucide-react';

interface TermsOfServiceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsOfService({ isOpen, onClose }: TermsOfServiceProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
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
            className="relative w-full max-w-2xl max-h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Scale className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-white tracking-tight">Terms of Service</h2>
                  <p className="text-amber-400/60 text-xs font-bold uppercase tracking-widest">Academic Guidelines</p>
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
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  Academic Integrity
                </h3>
                <p className="text-white/60 leading-relaxed">
                  NotesAI is designed to enhance your learning, not replace your effort. You are solely responsible for ensuring that your use of AI-generated summaries, flashcards, and quizzes aligns with your university's (e.g., JDIET's) academic honesty policies. Do not use this tool to circumvent original work requirements or for any form of academic misconduct.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  AI Limitations & Accuracy
                </h3>
                <p className="text-white/60 leading-relaxed">
                  This tool is a study aid powered by Large Language Models. While highly capable, AI can occasionally "hallucinate" or produce factual inaccuracies. We are not responsible for errors in the generated content. Always cross-reference AI-generated notes with your primary lecture materials and textbooks.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Usage Limits & API Abuse
                </h3>
                <p className="text-white/60 leading-relaxed">
                  To ensure fair access for all students and prevent API abuse, we reserve the right to limit the number of uploads, summaries, and queries per user. Attempting to scrape, automate, or bypass these limits may result in temporary or permanent suspension of your account.
                </p>
              </section>

              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                <p className="text-sm text-white/40 italic text-center">
                  "By using NotesAI, you agree to be a responsible learner. Use the power of AI to understand more, not to do less."
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-center">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-black font-bold hover:bg-white/90 transition-all"
              >
                Accept Terms
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
