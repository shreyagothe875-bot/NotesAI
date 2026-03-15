import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import React from 'react';
import {
  Upload,
  FileText,
  Video,
  History,
  LayoutDashboard,
  BookOpen,
  BrainCircuit,
  HelpCircle,
  ChevronRight,
  Plus,
  Loader2,
  CheckCircle2,
  X,
  Zap,
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Copy,
  Download,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from './lib/utils';
import { processLectureContent, SummaryResult } from './services/gemini';
import Login from './components/Login';
import PreferencesModal, { UserPreferences } from './components/PreferencesModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { AuthProvider, useAuth } from './context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type Tab = 'summary' | 'flashcards' | 'quiz' | 'recall' | 'timer';

interface RecentSummary {
  id: string;
  title: string;
  date: string;
  result: SummaryResult;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, logout } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [showStats, setShowStats] = useState(false);
  const [currentResult, setCurrentResult] = useState<SummaryResult | null>(null);
  const [recentSummaries, setRecentSummaries] = useState<RecentSummary[]>([
    {
      id: '1',
      title: 'Introduction to Quantum Mechanics',
      date: '2 hours ago',
      result: {
        summary: '# Quantum Mechanics Intro\n\nQuantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.',
        flashcards: [{ question: 'What is wave-particle duality?', answer: 'The concept that every elementary particle or quantic entity may be partly described in terms not only of particles, but also of waves.' }],
        quiz: [{ question: 'Who proposed the uncertainty principle?', options: ['Einstein', 'Heisenberg', 'Bohr', 'Schrödinger'], correctAnswer: 'Heisenberg' }],
        quickRecall: ['Max Planck (1900)', 'E = hf', 'Schrödinger Equation', 'Copenhagen Interpretation', 'Quantum Entanglement'],
        criticalThinkingQuestion: 'How does the observer effect challenge our classical understanding of objective reality?',
        pomodoro: {
          workMinutes: 25,
          breakMinutes: 5,
          difficulty: 'Medium',
          reasoning: 'Quantum mechanics concepts require deep focus but frequent breaks to prevent cognitive overload.'
        }
      }
    }
  ]);

  const [isCopying, setIsCopying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const studyData = [
    { name: 'Mon', hours: 2.5 },
    { name: 'Tue', hours: 3.8 },
    { name: 'Wed', hours: 1.5 },
    { name: 'Thu', hours: 4.2 },
    { name: 'Fri', hours: 3.0 },
    { name: 'Sat', hours: 5.5 },
    { name: 'Sun', hours: 2.0 },
  ];

  const categoryData = [
    { name: 'Physics', value: 45, color: '#ff5a1f' },
    { name: 'Math', value: 30, color: '#f59e0b' },
    { name: 'History', value: 15, color: '#fbbf24' },
    { name: 'Bio', value: 10, color: '#10b981' },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const [stats, setStats] = useState({
    studyMinutes: 750,
    quizScore: 92,
    recallRate: 88
  });

  const [showPreferences, setShowPreferences] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (user) {
      const hasSeenPreferences = localStorage.getItem('has_seen_preferences');
      if (!hasSeenPreferences) {
        setShowPreferences(true);
      }
    }
  }, [user]);

  const handleSavePreferences = (prefs: UserPreferences) => {
    localStorage.setItem('user_preferences', JSON.stringify(prefs));
    localStorage.setItem('has_seen_preferences', 'true');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!currentResult) return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(currentResult.summary);
      setTimeout(() => setIsCopying(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setIsCopying(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!summaryRef.current || !currentResult) return;
    setIsExporting(true);
    try {
      const element = summaryRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#050505',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`NotesAI_Summary_${currentResult.summary.slice(0, 20).replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();

      const fileBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await processLectureContent(
        `Lecture: ${file.name}`,
        { data: fileBase64, mimeType: file.type }
      );

      setCurrentResult(result);
      const newSummary: RecentSummary = {
        id: Math.random().toString(36).substr(2, 9),
        title: file.name.replace(/\.[^/.]+$/, ""),
        date: 'Just now',
        result
      };
      setRecentSummaries(prev => [newSummary, ...prev]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to process file. Please ensure it's a valid PDF or Video.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Login />
        </motion.div>
      ) : (
        <div key="app" className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
          <PreferencesModal
            isOpen={showPreferences}
            onClose={() => setShowPreferences(false)}
            onSave={handleSavePreferences}
          />
          <PrivacyPolicy
            isOpen={showPrivacy}
            onClose={() => setShowPrivacy(false)}
          />
          <TermsOfService
            isOpen={showTerms}
            onClose={() => setShowTerms(false)}
          />
          {/* Sidebar */}
          <aside className="w-80 border-r border-white/10 flex flex-col bg-[#080808]">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#ff5a1f] flex items-center justify-center shadow-lg shadow-[#ff5a1f]/20">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-display font-bold tracking-tight">NotesAI</h1>
              </div>

              <button
                onClick={() => setCurrentResult(null)}
                className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span className="font-medium">New Lecture</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6">
              <div className="flex items-center gap-2 px-2 mb-4 text-white/40 text-xs font-semibold uppercase tracking-wider">
                <History className="w-4 h-4" />
                Recent Summaries
              </div>

              <div className="space-y-3">
                {recentSummaries.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setCurrentResult(item.result)}
                    className={cn(
                      "glass p-4 rounded-xl cursor-pointer transition-all group relative overflow-hidden",
                      "hover:border-[#ff5a1f]/50 hover:bg-white/5",
                      currentResult === item.result && "border-[#ff5a1f]/50 bg-[#ff5a1f]/5"
                    )}
                  >
                    <div className="relative z-10">
                      <h3 className="font-medium text-sm mb-1 truncate group-hover:text-[#ff5a1f] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-white/40">{item.date}</p>
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4 text-[#ff5a1f]" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-white/10">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-4">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#ff5a1f] to-[#f59e0b]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.displayName || user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-white/40 truncate">Pro Plan</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full py-2 px-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest transition-all mb-4"
              >
                Logout & Clear Session
              </button>
              <button
                onClick={() => setShowPrivacy(true)}
                className="w-full text-center text-[10px] font-bold text-white/20 hover:text-white/40 uppercase tracking-widest transition-colors mb-2"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setShowTerms(true)}
                className="w-full text-center text-[10px] font-bold text-white/20 hover:text-white/40 uppercase tracking-widest transition-colors"
              >
                Terms of Service
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col relative overflow-hidden">
            {/* Header */}
            <header className="h-20 border-bottom border-white/10 flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-8">
                <nav className="flex items-center gap-1">
                  {[
                    { id: 'summary', label: 'Smart Summary', icon: FileText },
                    { id: 'flashcards', label: 'Key Flashcards', icon: BookOpen },
                    { id: 'quiz', label: 'Auto-Quiz', icon: HelpCircle },
                    { id: 'recall', label: 'Quick Recall', icon: Zap },
                    { id: 'timer', label: 'Study Timer', icon: TimerIcon },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as Tab)}
                      disabled={!currentResult}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        activeTab === tab.id
                          ? "text-[#ff5a1f] bg-[#ff5a1f]/10"
                          : "text-white/40 hover:text-white/70 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-8 w-px bg-white/10" />
                <button
                  onClick={() => setShowStats(true)}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    showStats
                      ? "bg-[#ff5a1f] text-white shadow-lg shadow-[#ff5a1f]/20"
                      : "hover:bg-white/5 text-white/40 hover:text-white"
                  )}
                  title="Global Analytics"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
              <AnimatePresence mode="wait">
                {!currentResult && !isProcessing ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto w-full"
                  >
                    <div className="text-center mb-12">
                      <h2 className="text-4xl font-display font-bold mb-4 tracking-tight">
                        Transform your lectures into <span className="text-[#ff5a1f]">knowledge.</span>
                      </h2>
                      <p className="text-white/40 text-lg max-w-xl mx-auto">
                        Upload your lecture PDFs or video recordings and let NotesAI generate summaries, flashcards, and quizzes in seconds.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 w-full">
                      {[
                        { id: 'summary', label: 'Total Summaries', value: recentSummaries.length, icon: FileText, color: 'text-orange-400' },
                        { id: 'timer', label: 'Study Hours', value: `${(stats.studyMinutes / 60).toFixed(1)}h`, icon: History, color: 'text-amber-400' },
                        { id: 'quiz', label: 'Quiz Score', value: `${stats.quizScore}%`, icon: BrainCircuit, color: 'text-emerald-400' },
                        { id: 'recall', label: 'Recall Rate', value: `${stats.recallRate}%`, icon: Zap, color: 'text-yellow-400' },
                      ].map((stat, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={() => {
                            if (recentSummaries.length > 0) {
                              setCurrentResult(recentSummaries[0].result);
                              if (stat.id !== 'summary') setActiveTab(stat.id as Tab);
                            }
                          }}
                          className="glass p-6 rounded-3xl text-left transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] group w-full"
                        >
                          <stat.icon className={cn("w-5 h-5 mb-4 transition-transform group-hover:scale-110", stat.color)} />
                          <div className="text-2xl font-bold mb-1">{stat.value}</div>
                          <div className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</div>
                        </motion.button>
                      ))}
                    </div>

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        "w-full aspect-21/9 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-6 group relative overflow-hidden",
                        isDragging
                          ? "border-[#ff5a1f] bg-[#ff5a1f]/5 scale-[1.02]"
                          : "border-white/10 bg-white/2 hover:bg-white/4 hover:border-white/20"
                      )}
                    >
                      <div className="absolute inset-0 bg-linear-to-tr from-[#ff5a1f]/5 to-[#f59e0b]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Upload className="w-10 h-10 text-[#ff5a1f]" />
                      </div>

                      <div className="text-center relative z-10">
                        <p className="text-xl font-medium mb-2">Click to upload or drag and drop</p>
                        <p className="text-white/40 text-sm">PDF, MP4, or MOV (Max 100MB)</p>
                      </div>

                      <div className="flex gap-4 mt-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                          <FileText className="w-3 h-3" /> PDF
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                          <Video className="w-3 h-3" /> Video
                        </div>
                      </div>

                      <input
                        type="file"
                        aria-label="Upload lecture PDF or video file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      />
                    </div>
                  </motion.div>
                ) : isProcessing ? (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 blur-3xl bg-[#ff5a1f]/20 animate-pulse" />
                      <Loader2 className="w-16 h-16 text-[#ff5a1f] animate-spin relative z-10" />
                    </div>
                    <h3 className="text-2xl font-display font-semibold mt-8 mb-2">Processing Lecture</h3>
                    <p className="text-white/40 animate-pulse">Gemini is analyzing content and generating insights...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto w-full pb-20"
                  >
                    {activeTab === 'summary' && (
                      <div className="space-y-6">
                        <div ref={summaryRef} className="glass p-10 rounded-3xl prose prose-invert max-w-none border-white/5 shadow-2xl">
                          <ReactMarkdown>{currentResult?.summary || ''}</ReactMarkdown>
                        </div>

                        <div className="flex items-center justify-end gap-4">
                          <button
                            onClick={handleCopyToClipboard}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium group"
                          >
                            {isCopying ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400">Copied to Clipboard</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 text-white/60 group-hover:text-white" />
                                <span>Copy for Notion</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={handleDownloadPDF}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ff5a1f] hover:bg-[#ff7a4c] transition-all text-sm font-medium shadow-lg shadow-[#ff5a1f]/20 disabled:opacity-50"
                          >
                            {isExporting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Generating PDF...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                <span>Download PDF</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'flashcards' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentResult?.flashcards.map((card, idx) => (
                          <Flashcard key={idx} question={card.question} answer={card.answer} />
                        ))}
                      </div>
                    )}

                    {activeTab === 'quiz' && (
                      <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-4">
                          <BrainCircuit className="w-6 h-6 text-[#ff5a1f]" />
                          <h3 className="text-2xl font-display font-bold">Knowledge Check</h3>
                        </div>

                        {currentResult?.quiz.map((q, idx) => (
                          <QuizQuestion key={idx} question={q.question} options={q.options} correctAnswer={q.correctAnswer} />
                        ))}

                        {currentResult?.criticalThinkingQuestion && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-8 rounded-3xl border-[#ff5a1f]/20 bg-[#ff5a1f]/5"
                          >
                            <div className="flex items-center gap-2 mb-4 text-[#ff5a1f]">
                              <HelpCircle className="w-5 h-5" />
                              <span className="text-xs font-bold uppercase tracking-widest">Critical Thinking</span>
                            </div>
                            <h4 className="text-xl font-medium leading-relaxed italic">
                              "{currentResult.criticalThinkingQuestion}"
                            </h4>
                            <p className="mt-6 text-sm text-white/40">
                              Take a moment to reflect on this question.
                            </p>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {activeTab === 'recall' && (
                      <div className="max-w-2xl mx-auto">
                        <div className="glass p-8 rounded-3xl">
                          <h3 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
                            <Zap className="w-6 h-6 text-[#ff5a1f]" />
                            Quick-Recall List
                          </h3>
                          <div className="space-y-4">
                            {currentResult?.quickRecall.map((item, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#ff5a1f]/30 transition-all group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center text-[#ff5a1f] font-bold text-sm">
                                  {idx + 1}
                                </div>
                                <span className="text-lg font-medium text-white/90 group-hover:text-white transition-colors">
                                  {item}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'timer' && currentResult && (
                      <div className="max-w-4xl mx-auto">
                        <PomodoroTimer pomodoro={currentResult.pomodoro} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>

          {/* Global Stats Overlay */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-8"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="w-full max-w-6xl h-full max-h-[90vh] glass rounded-[2.5rem] overflow-hidden flex flex-col border-white/10"
                >
                  <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#ff5a1f] flex items-center justify-center shadow-lg shadow-[#ff5a1f]/20">
                        <LayoutDashboard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-display font-bold tracking-tight">Learning Analytics</h2>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowStats(false)}
                      aria-label="Close analytics dashboard"
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-8">
                        <div className="glass p-8 rounded-3xl border-white/5">
                          <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                              <TimerIcon className="w-5 h-5 text-[#ff5a1f]" />
                              Study Activity
                            </h3>
                          </div>
                          <div className="h-75 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={studyData}>
                                <defs>
                                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ff5a1f" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ff5a1f" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} />
                                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="hours" stroke="#ff5a1f" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}

function Flashcard({ question, answer }: { question: string, answer: string }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="perspective-1000 h-64 cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        <div className="absolute inset-0 backface-hidden glass p-8 rounded-3xl flex flex-col justify-center items-center text-center group-hover:border-[#ff5a1f]/30 transition-colors">
          <span className="text-[#ff5a1f] text-xs font-bold uppercase tracking-widest mb-4">Question</span>
          <p className="text-xl font-medium leading-relaxed">{question}</p>
          <div className="mt-8 text-white/20 text-xs flex items-center gap-2">
            Click to flip <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div className="absolute inset-0 backface-hidden glass p-8 rounded-3xl flex flex-col justify-center items-center text-center rotate-y-180 bg-[#ff5a1f]/5 border-[#ff5a1f]/20">
          <span className="text-[#ff5a1f] text-xs font-bold uppercase tracking-widest mb-4">Answer</span>
          <p className="text-lg text-white/80 leading-relaxed">{answer}</p>
        </div>
      </motion.div>
    </div>
  );
}

function QuizQuestion({ question, options, correctAnswer }: { question: string, options: string[], correctAnswer: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    setIsCorrect(option === correctAnswer);
  };

  return (
    <div className="glass p-8 rounded-3xl">
      <h4 className="text-xl font-medium mb-6">{question}</h4>
      <div className="grid grid-cols-1 gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={cn(
              "p-4 rounded-xl border text-left transition-all flex items-center justify-between group",
              !selected && "border-white/10 hover:border-white/30 hover:bg-white/5",
              selected === option && isCorrect && "border-emerald-500 bg-emerald-500/10 text-emerald-400",
              selected === option && !isCorrect && "border-rose-500 bg-rose-500/10 text-rose-400",
              selected && option === correctAnswer && selected !== option && "border-emerald-500/50 text-emerald-400/70",
              selected && option !== correctAnswer && selected !== option && "border-white/5 opacity-30"
            )}
          >
            <span>{option}</span>
            {selected === option && (
              isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function PomodoroTimer({ pomodoro }: { pomodoro: SummaryResult['pomodoro'] }) {
  const [timeLeft, setTimeLeft] = useState(pomodoro.workMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (isWorkSession) {
        setIsWorkSession(false);
        setTimeLeft(pomodoro.breakMinutes * 60);
      } else {
        setIsWorkSession(true);
        setTimeLeft(pomodoro.workMinutes * 60);
      }
      setIsActive(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, isWorkSession, pomodoro]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setIsWorkSession(true);
    setTimeLeft(pomodoro.workMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isWorkSession
    ? (timeLeft / (pomodoro.workMinutes * 60)) * 100
    : (timeLeft / (pomodoro.breakMinutes * 60)) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 glass p-12 rounded-[40px] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Swarajya Glow Overlay */}
        <div className={cn(
          "absolute inset-0 blur-[120px] opacity-20 transition-colors duration-1000",
          isWorkSession ? "bg-[#ff5a1f]" : "bg-emerald-500"
        )} />

        <div className="relative z-10 text-center">
          <span className={cn(
            "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8 inline-block",
            isWorkSession ? "bg-[#ff5a1f]/20 text-[#ff5a1f]" : "bg-emerald-500/20 text-emerald-400"
          )}>
            {isWorkSession ? 'Focus Session' : 'Break Time'}
          </span>

          <div className="text-[120px] font-display font-bold tracking-tighter leading-none mb-8 tabular-nums">
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={toggleTimer}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl",
                isActive
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-[#ff5a1f] text-white hover:bg-[#ff7a4c] shadow-[#ff5a1f]/40"
              )}
            >
              {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            <button
              onClick={resetTimer}
              aria-label="Reset timer to default"
              className="w-14 h-14 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-1.5 bg-white/5 w-full">
          <motion.div
            className={cn(
              "h-full transition-colors duration-1000",
              isWorkSession ? "bg-[#ff5a1f]" : "bg-emerald-500"
            )}
            initial={{ width: "100%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#ff5a1f]/10 flex items-center justify-center text-[#ff5a1f]">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h4 className="font-display font-bold">AI Recommendation</h4>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-[#ff5a1f]/5 border border-[#ff5a1f]/10 flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#ff5a1f] shrink-0" />
            <p className="text-sm text-white/60 leading-relaxed italic">
              "{pomodoro.reasoning}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}