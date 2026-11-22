import { useState, type MouseEvent } from 'react';
import { motion } from 'motion/react';
import {
  Code2,
  Cpu,
  Globe,
  Smartphone,
  Terminal,
  Wrench,
} from 'lucide-react';
import { TechGlobe3D } from '@/src/components/three/TechGlobe3D';
import type { SkillCategory } from '@/src/types/portfolio';

interface SkillsSectionProps {
  skills: SkillCategory[];
  isDark: boolean;
}

function getCategoryIcon(name: string) {
  if (/iot|embed|hardware/i.test(name)) return Cpu;
  if (/mobile|app|flutter/i.test(name)) return Smartphone;
  if (/web/i.test(name)) return Globe;
  if (/tool|tech|ide/i.test(name)) return Wrench;
  if (/program|language/i.test(name)) return Code2;
  return Terminal;
}

function TiltSkillCard({
  category,
  index,
}: {
  category: SkillCategory;
  index: number;
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const Icon = getCategoryIcon(category.n);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 8, ry: x * 8 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: 'transform 0.2s ease-out',
      }}
      className="group glass-panel rounded-3xl p-6 space-y-5 hover:border-purple-400/55"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/25 to-blue-600/25 border border-purple-400/30 flex items-center justify-center text-purple-600 dark:text-purple-300 shrink-0 group-hover:scale-105 transition">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-snug">
              {category.n}
            </h3>
            <p className="font-mono-tech text-xs text-slate-500 dark:text-slate-400">
              {category.i.length} {category.i.length === 1 ? 'Technology' : 'Technologies'}
            </p>
          </div>
        </div>
      </div>

      {/* Subtle ambient divider bar (pure visual accent, no invented percentage) */}
      <div className="h-px w-full bg-gradient-to-r from-purple-500/45 via-blue-500/40 to-transparent" />

      {/* Clean scannable verified skill list */}
      <ul className="space-y-2.5">
        {category.i.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-400 mt-2 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function SkillsSection({ skills, isDark }: SkillsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const visibleSkills =
    selectedCategory === 'ALL'
      ? skills
      : skills.filter((s) => s.n === selectedCategory);

  return (
    <section id="skills" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="font-mono-tech text-xs uppercase tracking-[0.22em] text-purple-600 dark:text-purple-300 mb-2">
              02 · Technology Universe
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Technical <span className="gradient-text-brand">Skills</span>
            </h2>
          </div>

          {/* Interactive Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'glass-panel text-slate-700 dark:text-slate-300 hover:border-purple-400/50'
              }`}
            >
              All Categories
            </button>
            {skills.map((cat) => (
              <button
                key={cat.n}
                type="button"
                onClick={() => setSelectedCategory(cat.n)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat.n
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'glass-panel text-slate-700 dark:text-slate-300 hover:border-purple-400/50'
                }`}
              >
                {cat.n}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive 3D Rotating Technology Globe */}
        <TechGlobe3D skills={skills} isDark={isDark} />

        {/* Structured Skill Category Cards (zero invented percentages) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleSkills.map((cat, idx) => (
            <TiltSkillCard key={cat.n} category={cat} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
