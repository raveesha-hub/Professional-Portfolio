import { useState, type MouseEvent } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  Cpu,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  Orbit,
  User,
} from 'lucide-react';
import type { PortfolioData } from '@/src/types/portfolio';

interface HeroSectionProps {
  data: PortfolioData;
  onOpenGalaxy: () => void;
}

function normalizeUrl(url?: string): string {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function HeroSection({ data, onOpenGalaxy }: HeroSectionProps) {
  const [cardTilt, setCardTilt] = useState({ rx: 0, ry: 0 });

  const githubUrl =
    normalizeUrl(data.github) ||
    normalizeUrl(data.links.find((l) => /github/i.test(l.l || l.u))?.u) ||
    (data.link && /github/i.test(data.link) ? normalizeUrl(data.link) : '');

  const linkedinUrl =
    normalizeUrl(data.linkedin) ||
    normalizeUrl(data.links.find((l) => /linkedin/i.test(l.l || l.u))?.u) ||
    (data.link && /linkedin/i.test(data.link) ? normalizeUrl(data.link) : '');

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCardMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCardTilt({ rx: -y * 12, ry: x * 12 });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-28 pb-16 px-4 sm:px-6"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Futuristic Identity & CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="inline-flex items-center gap-2.5 text-xs font-mono-tech uppercase tracking-[0.2em] text-purple-700 dark:text-purple-300">
            <GraduationCap className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span>{data.role}</span>
            <span className="text-slate-400">·</span>
            <span>{data.uni}</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.04] text-slate-900 dark:text-white">
            Hi, I&apos;m{' '}
            <span className="gradient-text-brand">{data.name}</span>
          </h1>

          <p className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-200 max-w-2xl leading-relaxed">
            {data.wel}
          </p>

          <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            {data.about}
          </p>

          {/* Primary Actions: View Projects, About Me, Contact Me */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={() => scrollTo('projects')}
              className="btn-primary-gradient px-6 py-3.5 rounded-2xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              View Projects
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => scrollTo('about')}
              className="glass-panel px-5 py-3.5 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white hover:border-purple-400/60 transition inline-flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4 text-purple-500" />
              About Me
            </button>

            <button
              type="button"
              onClick={() => scrollTo('contact')}
              className="glass-panel px-5 py-3.5 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white hover:border-blue-400/60 transition cursor-pointer"
            >
              Contact Me
            </button>

            <button
              type="button"
              onClick={onOpenGalaxy}
              className="px-4 py-3.5 rounded-2xl text-xs font-mono-tech uppercase tracking-wider border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Orbit className="w-3.5 h-3.5" />
              Galaxy Nav
            </button>
          </div>

          {/* Social Links Row */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            {githubUrl ? (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 transition"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            ) : (
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('contact');
                }}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 transition"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            )}

            <span className="text-slate-400">·</span>

            {linkedinUrl ? (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 transition"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            ) : (
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('contact');
                }}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 transition"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            )}

            {data.email && (
              <>
                <span className="text-slate-400">·</span>
                <a
                  href={`mailto:${data.email}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 transition"
                >
                  <Mail className="w-4 h-4" />
                  <span>{data.email}</span>
                </a>
              </>
            )}
          </div>
        </motion.div>

        {/* Right Column: Interactive 3D Floating Digital Identity Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.12, ease: 'easeOut' }}
          className="lg:col-span-5 flex justify-center lg:justify-end"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-full max-w-[390px]"
            onMouseMove={handleCardMove}
            onMouseLeave={() => setCardTilt({ rx: 0, ry: 0 })}
          >
            {/* Ambient purple-blue aura behind 3D identity card */}
            <div
              className="absolute -inset-4 rounded-[2rem] opacity-70 blur-2xl pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(124, 58, 237, 0.45), rgba(59, 130, 246, 0.42))',
              }}
            />

            <div
              style={{
                transform: `perspective(1000px) rotateX(${cardTilt.rx}deg) rotateY(${cardTilt.ry}deg)`,
                transition: 'transform 0.18s ease-out',
              }}
              className="relative glass-panel-strong rounded-[2rem] p-4 sm:p-5 space-y-4"
            >
              {/* Digital Card Header Strip */}
              <div className="flex items-center justify-between text-[11px] font-mono-tech uppercase tracking-wider text-purple-600 dark:text-blue-300 px-1">
                <span className="inline-flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-500" />
                  Digital Identity
                </span>
                <span>ID · PROJECT-R</span>
              </div>

              <div className="aspect-[4/4.6] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-purple-950/60 via-[#0D1024] to-blue-950/60 border border-white/15 relative flex items-center justify-center">
                {data.pic ? (
                  <img
                    src={data.pic}
                    alt={`${data.name} portrait`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-display font-extrabold text-5xl shadow-[0_0_40px_rgba(124,58,237,0.5)]">
                      {data.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <p className="font-display font-bold text-xl text-white">
                        {data.name}
                      </p>
                      <p className="font-mono-tech text-xs text-blue-300">
                        {data.role}
                      </p>
                      <p className="font-mono-tech text-[11px] text-purple-300">
                        {data.uni}
                      </p>
                    </div>
                  </div>
                )}

                {/* Subtle bottom holographic metadata strip */}
                <div className="absolute inset-x-3 bottom-3 rounded-xl px-3.5 py-2.5 bg-[#080B1A]/80 border border-white/15 flex items-center justify-between text-xs text-white">
                  <span className="font-mono-tech text-purple-300">
                    {data.skills.length} Domains
                  </span>
                  <span className="font-mono-tech text-blue-300">
                    {data.projects.length} {data.projects.length === 1 ? 'Project' : 'Projects'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2">
        <button
          type="button"
          onClick={() => scrollTo('about')}
          aria-label="Scroll to About section"
          className="inline-flex flex-col items-center gap-1.5 text-xs font-mono-tech text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-300 transition cursor-pointer"
        >
          <span>Explore Universe</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
