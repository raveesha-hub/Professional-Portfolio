import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  Bot,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import type { PortfolioData } from '@/src/types/portfolio';

interface PortfolioAssistantProps {
  data: PortfolioData;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const SUGGESTED_QUESTIONS = [
  'What technologies does Raveesha use?',
  'Tell me about his projects.',
  'What is his education background?',
  'How can I contact him?',
];

function buildCompactContext(data: PortfolioData) {
  return {
    name: data.name,
    role: data.role,
    uni: data.uni,
    wel: data.wel,
    about: data.about,
    email: data.email,
    github: data.github || '',
    linkedin: data.linkedin || '',
    link: data.link || '',
    careerGoals: data.careerGoals || '',
    interests: data.interests || [],
    skills: data.skills.map((s) => ({ n: s.n, i: s.i })),
    projects: data.projects.map((p) => ({
      t: p.t,
      d: p.d,
      fullDesc: p.fullDesc || '',
      tech: p.tech || [],
      features: p.features || [],
      github: p.github || '',
      demo: p.demo || p.link || '',
    })),
    education: data.education,
    achievements: data.achievements.map((a) => ({
      t: a.t,
      d: a.d,
      date: a.date || '',
      issuer: a.issuer || '',
      link: a.link || '',
    })),
    journey: data.journey || [],
    reflection: data.reflection,
    phones: data.phones,
    links: data.links,
  };
}

export function PortfolioAssistant({
  data,
  isOpen,
  onOpenChange,
}: PortfolioAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I'm ${data.name}'s verified portfolio assistant. Ask me about his verified skills, projects, SLIIT Matara Campus background, achievements, or contact details.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const compactContext = useMemo(() => buildCompactContext(data), [data]);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const askQuestion = async (rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (!question || loading) return;

    setError('');
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: question,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          history: nextHistory
            .filter((m) => m.id !== 'welcome')
            .slice(-6)
            .map((m) => ({ role: m.role, text: m.text })),
          portfolioContext: compactContext,
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        answer?: string;
        error?: string;
      };

      if (!res.ok || !payload.answer) {
        throw new Error(
          payload.error || 'Unable to get a response from the AI assistant.'
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m_${Date.now()}`,
          role: 'model',
          text: payload.answer!,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to reach AI assistant service.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    askQuestion(input);
  };

  return (
    <>
      {/* Floating Assistant Launcher Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => onOpenChange(!isOpen)}
          aria-label={isOpen ? 'Close AI Portfolio Assistant' : 'Open AI Portfolio Assistant'}
          className="btn-primary-gradient px-4 py-3 rounded-2xl shadow-[0_12px_36px_rgba(124,58,237,0.45)] flex items-center gap-2.5 text-sm font-semibold cursor-pointer"
        >
          <Bot className="w-5 h-5" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>
      </div>

      {/* Assistant Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            role="dialog"
            aria-label="AI Portfolio Assistant"
            className="fixed bottom-20 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[410px] max-h-[76vh] flex flex-col glass-panel-strong rounded-3xl overflow-hidden shadow-[0_24px_70px_rgba(8,11,26,0.65)]"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-purple-500/20 flex items-center justify-between gap-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    Portfolio AI Assistant
                  </h3>
                  <p className="font-mono-tech text-[11px] text-purple-700 dark:text-blue-300">
                    Verified Portfolio Knowledge Only
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close AI Assistant"
                className="w-8 h-8 rounded-xl bg-white/60 dark:bg-white/10 border border-purple-500/20 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-[240px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-purple-600/25 border border-purple-400/35 text-purple-600 dark:text-purple-200'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5" />
                    ) : (
                      <Bot className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-sm'
                        : 'bg-white/75 dark:bg-white/10 border border-purple-500/20 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-purple-600/25 border border-purple-400/35 flex items-center justify-center text-purple-600 dark:text-purple-200 shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/75 dark:bg-white/10 border border-purple-500/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:120ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:240ms]" />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* Suggested Prompts */}
            <div className="px-4 py-2.5 border-t border-purple-500/15 flex flex-wrap gap-1.5 bg-white/30 dark:bg-black/20">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={loading}
                  onClick={() => askQuestion(q)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white/75 dark:bg-white/5 border border-purple-500/20 text-slate-700 dark:text-slate-200 hover:border-purple-400/60 transition cursor-pointer disabled:opacity-50 text-left"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-purple-500/20 flex items-center gap-2 bg-white/50 dark:bg-[#080B1A]/75"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Raveesha's skills or projects..."
                maxLength={600}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/85 dark:bg-white/5 border border-purple-500/20 focus:border-purple-500 focus:outline-none text-xs sm:text-sm text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send question"
                className="w-10 h-10 rounded-xl btn-primary-gradient flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
