import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { Terminal } from 'lucide-react';
import type { PortfolioData } from '@/src/types/portfolio';

interface DeveloperTerminalProps {
  data: PortfolioData;
}

interface TerminalEntry {
  id: string;
  command?: string;
  lines: string[];
  tone?: 'normal' | 'accent' | 'error';
}

const COMMAND_LIST = [
  'help',
  'about',
  'skills',
  'projects',
  'education',
  'achievements',
  'contact',
  'clear',
] as const;

export function DeveloperTerminal({ data }: DeveloperTerminalProps) {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    {
      id: 'boot',
      lines: [
        'Project R Interactive CLI · Beyond Digital Universe',
        `Loaded verified portfolio profile for ${data.name} (${data.role} @ ${data.uni}).`,
        'Type "help" or click a suggested command below to inspect portfolio data.',
      ],
      tone: 'accent',
    },
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = outputRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [entries]);

  const executeCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    setCmdHistory((prev) => [cmd, ...prev].slice(0, 30));
    setHistoryIdx(-1);
    setInput('');

    if (cmd === 'clear') {
      setEntries([]);
      return;
    }

    let lines: string[] = [];
    let tone: 'normal' | 'accent' | 'error' = 'normal';

    switch (cmd) {
      case 'help':
        tone = 'accent';
        lines = [
          'Available Commands:',
          '  about         — Profile summary, university, and career goals',
          '  skills        — Verified skill domains and technologies',
          '  projects      — Projects showcased in the 3D Portfolio Cube',
          '  education     — Academic timeline and coursework',
          '  achievements  — Certifications, honors, and awards',
          '  contact       — Email, GitHub, LinkedIn, and contact links',
          '  clear         — Clear terminal output buffer',
        ];
        break;

      case 'about':
        lines = [
          `Name: ${data.name}`,
          `Role: ${data.role}`,
          `University: ${data.uni}`,
          '',
          data.about,
          '',
          data.careerGoals ? `Career Focus: ${data.careerGoals}` : '',
        ].filter((x, i, arr) => !(x === '' && arr[i - 1] === ''));
        break;

      case 'skills':
        lines = data.skills.flatMap((cat) => [
          `[${cat.n}]`,
          `  • ${cat.i.join(', ')}`,
        ]);
        break;

      case 'projects':
        if (!data.projects.length) {
          lines = ['No projects are currently listed.'];
        } else {
          lines = data.projects.flatMap((p, idx) => [
            `${idx + 1}. ${p.t}`,
            `   ${p.d}`,
            p.tech?.length ? `   Stack: ${p.tech.join(', ')}` : '',
            p.github ? `   GitHub: ${p.github}` : '',
            p.demo || p.link ? `   Demo: ${p.demo || p.link}` : '',
          ]).filter(Boolean);
        }
        break;

      case 'education':
        lines = data.education.flatMap((e) => [
          `${e.degree} — ${e.institution}`,
          `  Period: ${e.period}${e.status ? ` (${e.status})` : ''}`,
          `  ${e.description}`,
          e.highlights?.length ? `  Focus: ${e.highlights.join(' | ')}` : '',
        ]).filter(Boolean);
        break;

      case 'achievements':
        if (!data.achievements.length) {
          lines = [
            'No external certificates uploaded yet — manage them anytime in Admin Dashboard (#admin).',
          ];
        } else {
          lines = data.achievements.flatMap((a, idx) => [
            `${idx + 1}. ${a.t}${a.issuer ? ` — ${a.issuer}` : ''}${a.date ? ` (${a.date})` : ''}`,
            a.d ? `   ${a.d}` : '',
            a.link ? `   Verify: ${a.link}` : '',
          ]).filter(Boolean);
        }
        break;

      case 'contact':
        lines = [
          data.email ? `Email:    ${data.email}` : '',
          data.github ? `GitHub:   ${data.github}` : '',
          data.linkedin ? `LinkedIn: ${data.linkedin}` : '',
          data.link ? `Website:  ${data.link}` : '',
          ...data.phones.map((p) => `${p.l || 'Phone'}: ${p.v}`),
          ...data.links.map((l) => `${l.l || 'Link'}: ${l.u}`),
        ].filter(Boolean);
        if (!lines.length) {
          lines = ['Use the Contact form below to reach out directly.'];
        }
        break;

      default:
        tone = 'error';
        lines = [
          `Command not recognized: "${cmd}"`,
          'Type "help" to list supported portfolio commands.',
        ];
        break;
    }

    setEntries((prev) => [
      ...prev,
      {
        id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        command: cmd,
        lines,
        tone,
      },
    ]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    executeCommand(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!cmdHistory.length) return;
      const nextIdx = Math.min(historyIdx + 1, cmdHistory.length - 1);
      setHistoryIdx(nextIdx);
      setInput(cmdHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx <= 0) {
        setHistoryIdx(-1);
        setInput('');
      } else {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.trim().toLowerCase();
      if (!partial) return;
      const match = COMMAND_LIST.find((c) => c.startsWith(partial));
      if (match) setInput(match);
    }
  };

  return (
    <section id="terminal" className="relative py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-mono-tech text-xs uppercase tracking-[0.22em] text-purple-600 dark:text-purple-300 mb-2">
              Interactive CLI Console
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Developer <span className="gradient-text-brand">Terminal</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-mono-tech text-slate-600 dark:text-slate-300">
            Tab to autocomplete · Up/Down for history
          </p>
        </div>

        <div
          onClick={() => inputRef.current?.focus()}
          className="rounded-3xl overflow-hidden border border-purple-500/35 bg-[#070A18]/95 text-slate-100 shadow-[0_24px_70px_rgba(8,11,26,0.55)]"
        >
          {/* Window Chrome Bar */}
          <div className="px-5 py-3.5 bg-[#0D1024] border-b border-purple-500/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
              <span className="ml-2 font-mono-tech text-xs text-slate-300 inline-flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                raveesha@beyond-digital:~
              </span>
            </div>

            {/* Quick Command Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {COMMAND_LIST.map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    executeCommand(cmd);
                  }}
                  className="px-2.5 py-1 rounded-lg font-mono-tech text-[11px] bg-white/5 hover:bg-purple-500/25 border border-purple-400/25 text-blue-200 transition cursor-pointer"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Output Buffer */}
          <div
            ref={outputRef}
            className="p-5 sm:p-6 h-80 overflow-y-auto font-mono-tech text-xs sm:text-sm space-y-4 leading-relaxed"
          >
            {entries.map((entry) => (
              <div key={entry.id} className="space-y-1.5">
                {entry.command && (
                  <div className="flex items-center gap-2 text-blue-300">
                    <span className="text-purple-400">❯</span>
                    <span>{entry.command}</span>
                  </div>
                )}
                <div
                  className={`space-y-0.5 pl-1 ${
                    entry.tone === 'error'
                      ? 'text-rose-300'
                      : entry.tone === 'accent'
                      ? 'text-purple-200'
                      : 'text-slate-200'
                  }`}
                >
                  {entry.lines.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap break-words">
                      {line || '\u00A0'}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Prompt Input Line */}
          <form
            onSubmit={handleSubmit}
            className="px-5 py-3.5 border-t border-purple-500/20 bg-[#0A0E21] flex items-center gap-2.5 font-mono-tech text-xs sm:text-sm"
          >
            <span className="text-purple-400 shrink-0">raveesha@portfolio:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Terminal command input"
              placeholder='Type command (e.g. "help", "projects", "skills")'
              className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
            />
          </form>
        </div>
      </div>
    </section>
  );
}
