import { useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Mail,
  Phone,
  QrCode,
  Send,
  X,
} from 'lucide-react';
import { submitContactMessage } from '@/src/lib/firebase';
import type { ContactQR, PortfolioData } from '@/src/types/portfolio';

interface ContactSectionProps {
  data: PortfolioData;
}

function normalizeUrl(u?: string): string {
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

export function ContactSection({ data }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [activeQR, setActiveQR] = useState<ContactQR | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({
        type: 'error',
        text: 'Please fill in your name, email address, and message.',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus({
        type: 'error',
        text: 'Please provide a valid email address.',
      });
      return;
    }

    setSending(true);
    try {
      await submitContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || 'Portfolio Inquiry',
        message: message.trim(),
      });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setStatus({
        type: 'success',
        text: 'Message delivered! Thank you for reaching out — I will respond soon.',
      });
    } catch (err) {
      setStatus({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Could not send message right now. Please try email below.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="font-mono-tech text-xs uppercase tracking-[0.22em] text-purple-600 dark:text-purple-300 mb-2">
            06 · Communication Portal
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Get In <span className="gradient-text-brand">Touch</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3D Connection Portal, Direct Channels, Links & QR Codes */}
          <div className="lg:col-span-5 space-y-5">
            {/* Futuristic Holographic Connection Portal Visual */}
            <div className="glass-panel rounded-3xl p-5 flex items-center gap-4 overflow-hidden relative">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/60 animate-spin [animation-duration:10s]" />
                <span className="absolute inset-2 rounded-full border border-blue-400/70 animate-spin [animation-duration:6s] [animation-direction:reverse]" />
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 shadow-[0_0_24px_rgba(59,130,246,0.7)] flex items-center justify-center">
                  <Send className="w-3.5 h-3.5 text-white" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-mono-tech text-[11px] uppercase tracking-widest text-blue-600 dark:text-blue-300">
                  3D Connection Portal
                </p>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Open Communication Link
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Reach {data.name} via Firebase portal or direct social channels.
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Direct Channels
              </h3>

              <div className="space-y-3">
                {data.email && (
                  <a
                    href={`mailto:${data.email}`}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-purple-500/15 hover:border-purple-400/50 transition"
                  >
                    <span className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <span className="font-mono-tech text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Email
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white truncate block">
                        {data.email}
                      </span>
                    </div>
                  </a>
                )}

                {data.github && (
                  <a
                    href={normalizeUrl(data.github)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-purple-500/15 hover:border-purple-400/50 transition"
                  >
                    <span className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                      <Github className="w-5 h-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-mono-tech text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        GitHub
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white truncate block">
                        {data.github}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </a>
                )}

                {data.linkedin && (
                  <a
                    href={normalizeUrl(data.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-purple-500/15 hover:border-purple-400/50 transition"
                  >
                    <span className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                      <Linkedin className="w-5 h-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-mono-tech text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        LinkedIn
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white truncate block">
                        {data.linkedin}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </a>
                )}

                {data.link && (
                  <a
                    href={normalizeUrl(data.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-purple-500/15 hover:border-purple-400/50 transition"
                  >
                    <span className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-mono-tech text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Primary Link
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white truncate block">
                        {data.link}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </a>
                )}

                {data.phones.map((p, idx) =>
                  p.v ? (
                    <a
                      key={idx}
                      href={`tel:${p.v.replace(/[^\d+]/g, '')}`}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-purple-500/15 hover:border-purple-400/50 transition"
                    >
                      <span className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <span className="font-mono-tech text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                          {p.l || 'Phone'}
                        </span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white block">
                          {p.v}
                        </span>
                      </div>
                    </a>
                  ) : null
                )}

                {data.links.map((lk, idx) =>
                  lk.u ? (
                    <a
                      key={idx}
                      href={normalizeUrl(lk.u)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-purple-500/15 hover:border-purple-400/50 transition"
                    >
                      <span className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="font-mono-tech text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                          {lk.l || 'Social Link'}
                        </span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate block">
                          {lk.u}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </a>
                  ) : null
                )}
              </div>

              {data.qrs.length > 0 && (
                <div className="pt-3 border-t border-purple-500/15 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider text-purple-600 dark:text-purple-300">
                    <QrCode className="w-4 h-4" />
                    <span>Scan to Connect</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {data.qrs.map((qr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveQR(qr)}
                        className="p-2.5 rounded-2xl bg-white dark:bg-white/95 text-slate-900 text-center space-y-1 hover:scale-105 transition cursor-pointer shadow-sm"
                      >
                        <img
                          src={qr.src}
                          alt={qr.l || 'QR Code'}
                          className="w-20 h-20 object-contain"
                        />
                        <span className="text-[11px] font-medium block">
                          {qr.l || 'QR Code'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Validated Contact Form */}
          <div className="lg:col-span-7 glass-panel-strong rounded-3xl p-6 sm:p-8">
            <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-2">
              Send a Direct Message
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Interested in collaborating on a software, web, or IoT project? Drop a note below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-mono-tech uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
                  >
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Perera"
                    className="w-full px-4 py-3 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/20 focus:border-purple-500 focus:outline-none text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-mono-tech uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/20 focus:border-purple-500 focus:outline-none text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-mono-tech uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Project collaboration / Internship / Inquiry"
                  className="w-full px-4 py-3 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/20 focus:border-purple-500 focus:outline-none text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-msg"
                  className="block text-xs font-mono-tech uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="contact-msg"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me about your idea, opportunity, or question..."
                  className="w-full px-4 py-3 rounded-xl bg-white/75 dark:bg-white/5 border border-purple-500/20 focus:border-purple-500 focus:outline-none text-sm text-slate-900 dark:text-white resize-y"
                />
              </div>

              {status && (
                <div
                  className={`p-3.5 rounded-xl text-sm flex items-center gap-2.5 ${
                    status.type === 'success'
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {status.type === 'success' && (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{status.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="btn-primary-gradient px-6 py-3.5 rounded-2xl text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* QR Zoom Modal */}
      {activeQR && (
        <div
          onClick={() => setActiveQR(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel-strong rounded-3xl p-6 max-w-sm w-full text-center space-y-4 relative"
          >
            <button
              type="button"
              onClick={() => setActiveQR(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="font-display font-bold text-lg text-white">
              {activeQR.l || 'QR Code'}
            </h4>
            <div className="bg-white rounded-2xl p-4 inline-block">
              <img
                src={activeQR.src}
                alt={activeQR.l || 'QR Code'}
                className="w-60 h-60 object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
