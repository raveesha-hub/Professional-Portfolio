import { useState } from 'react';
import {
  Bot,
  Lock,
  Menu,
  Moon,
  Orbit,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';

interface NavbarProps {
  name: string;
  activeSection: string;
  isDark: boolean;
  universeEnabled: boolean;
  onToggleTheme: () => void;
  onToggleUniverse: () => void;
  onOpenGalaxy: () => void;
  onOpenAssistant: () => void;
  onOpenAdmin: () => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'contact', label: 'Contact' },
];

export function Navbar({
  name,
  activeSection,
  isDark,
  universeEnabled,
  onToggleTheme,
  onToggleUniverse,
  onOpenGalaxy,
  onOpenAssistant,
  onOpenAdmin,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-30 px-3 sm:px-6 pt-3">
      <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-4 sm:px-5 h-16 flex items-center justify-between gap-3">
        {/* Left Brand Wordmark + Galaxy Navigation Launcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollTo('home');
            }}
            className="flex items-center gap-2.5 group"
          >
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-display font-extrabold text-lg shadow-md">
              R
            </span>
            <div className="leading-tight">
              <span className="font-display font-bold text-base tracking-tight text-slate-900 dark:text-white block">
                {name}
              </span>
              <span className="font-mono-tech text-[10px] uppercase tracking-widest text-purple-600 dark:text-purple-300 block">
                Beyond Digital
              </span>
            </div>
          </a>

          <button
            type="button"
            onClick={onOpenGalaxy}
            title="Open 3D Galaxy Navigation Map"
            aria-label="Open Interactive Galaxy Navigation"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 text-xs font-medium transition cursor-pointer"
          >
            <Orbit className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Galaxy</span>
          </button>
        </div>

        {/* Center Navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-1"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(item.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenAssistant}
            title="AI Portfolio Assistant"
            aria-label="Open AI Portfolio Assistant"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-200 hover:border-purple-400 transition cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">AI Guide</span>
          </button>

          <button
            type="button"
            onClick={onToggleUniverse}
            title={universeEnabled ? 'Pause 3D Universe' : 'Enable 3D Universe'}
            aria-label={universeEnabled ? 'Pause 3D Universe' : 'Enable 3D Universe'}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
              universeEnabled
                ? 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-200'
                : 'border-slate-400/25 bg-slate-500/10 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">3D Space</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="w-9 h-9 rounded-xl border border-purple-500/25 bg-white/70 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:border-purple-400 transition cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-purple-700" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenAdmin}
            title="Admin Dashboard"
            aria-label="Open Admin Dashboard"
            className="w-9 h-9 rounded-xl border border-purple-500/25 bg-white/70 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:border-purple-400 transition cursor-pointer"
          >
            <Lock className="w-4 h-4" />
          </button>

          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollTo('contact');
            }}
            className="hidden sm:inline-flex btn-primary-gradient px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0"
          >
            Contact Me
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle Menu"
            className="lg:hidden w-9 h-9 rounded-xl border border-purple-500/25 bg-white/70 dark:bg-white/5 flex items-center justify-center text-slate-800 dark:text-white cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden max-w-7xl mx-auto mt-2 glass-panel-strong rounded-2xl p-4 space-y-2">
          <div className="grid grid-cols-2 gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(item.id);
                  }}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-purple-500/10'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
          <div className="pt-2 border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenGalaxy();
              }}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-medium bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25 inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Orbit className="w-3.5 h-3.5" />
              Galaxy Map
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenAssistant();
              }}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-medium bg-purple-500/15 text-purple-700 dark:text-purple-200 border border-purple-500/25 inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              AI Guide
            </button>
            <button
              type="button"
              onClick={onToggleUniverse}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-medium bg-purple-500/15 text-purple-700 dark:text-purple-200 border border-purple-500/25 inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {universeEnabled ? '3D On' : '3D Off'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
