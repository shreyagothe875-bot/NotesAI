import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, BrainCircuit, Trash2, X, Check, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: UserPreferences) => void;
}

export interface UserPreferences {
  enhancedPersonalization: boolean;
  privacyMode: boolean;
}

export default function PreferencesModal({ isOpen, onClose, onSave }: PreferencesModalProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    enhancedPersonalization: true,
    privacyMode: false,
  });

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  const clearData = () => {
    if (confirm('Are you sure you want to clear all your study data? This cannot be undone.')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <BrainCircuit className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white">Setup Your Experience</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/40 text-sm">Customize how NotesAI handles your data and learning journey.</p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Enhanced Personalization */}
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">Enhanced Personalization</h3>
                    <div className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Recommended</div>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed">
                    Allow the AI to remember your past summaries and quiz results. This helps it provide much better context and personalized study tips tailored just for you.
                  </p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, enhancedPersonalization: !prev.enhancedPersonalization }))}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-all shrink-0 mt-1",
                    preferences.enhancedPersonalization ? "bg-indigo-500" : "bg-white/10"
                  )}
                >
                  <motion.div
                    animate={{ x: preferences.enhancedPersonalization ? 26 : 2 }}
                    className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>

              {/* Privacy Mode */}
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="font-semibold text-white">Privacy Mode</h3>
                  <p className="text-sm text-white/40 leading-relaxed">
                    Maximum security for shared devices. If enabled, all your session data, summaries, and AI history will be wiped from this browser the moment you log out.
                  </p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, privacyMode: !prev.privacyMode }))}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-all shrink-0 mt-1",
                    preferences.privacyMode ? "bg-indigo-500" : "bg-white/10"
                  )}
                >
                  <motion.div
                    animate={{ x: preferences.privacyMode ? 26 : 2 }}
                    className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>

              {/* Data Management */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 mb-4 text-white/60">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Data Management</span>
                </div>
                <button
                  onClick={clearData}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all group"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Clear My Data
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/30">
                <Info className="w-4 h-4" />
                <span className="text-[10px]">You can change these anytime in settings.</span>
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20"
              >
                Start Studying
                <Check className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
