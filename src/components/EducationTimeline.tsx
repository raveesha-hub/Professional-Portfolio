import { motion } from 'motion/react';
import { Calendar, GraduationCap } from 'lucide-react';
import type { EducationItem } from '@/src/types/portfolio';

interface EducationTimelineProps {
  items: EducationItem[];
}

export function EducationTimeline({ items }: EducationTimelineProps) {
  return (
    <section id="education" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <p className="font-mono-tech text-xs uppercase tracking-[0.22em] text-purple-600 dark:text-purple-300 mb-2">
            04 · Academic Path
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Education <span className="gradient-text-brand">Timeline</span>
          </h2>
        </div>

        <div className="relative pl-7 sm:pl-10 space-y-8">
          {/* Glowing Vertical Timeline Track */}
          <div
            className="absolute left-2.5 sm:left-3.5 top-2 bottom-2 w-0.5 rounded-full"
            style={{
              background:
                'linear-gradient(180deg, #7C3AED 0%, #3B82F6 65%, rgba(96, 165, 250, 0.15) 100%)',
            }}
          />

          {items.map((edu, idx) => (
            <motion.div
              key={edu.id || idx}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="relative"
            >
              {/* Timeline Node Marker */}
              <div className="absolute -left-[25px] sm:-left-[33px] top-6 w-5 h-5 rounded-full bg-[#080B1A] border-2 border-purple-400 shadow-[0_0_16px_rgba(124,58,237,0.8)] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
              </div>

              <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-3 hover:border-purple-400/50 transition">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider text-purple-600 dark:text-purple-300">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    <span>{edu.institution}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono-tech text-slate-600 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                    <span>{edu.period}</span>
                    {edu.status && (
                      <>
                        <span className="text-slate-400">·</span>
                        <span className="text-blue-600 dark:text-blue-300 font-semibold">
                          {edu.status}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
                  {edu.degree}
                </h3>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {edu.description}
                </p>

                {edu.highlights && edu.highlights.length > 0 && (
                  <p className="font-mono-tech text-xs text-purple-600 dark:text-blue-300 pt-1">
                    {edu.highlights.join('  ·  ')}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
