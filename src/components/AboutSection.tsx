import { useState, type MouseEvent } from 'react';
import { motion } from 'motion/react';
import {
  Code2,
  Cpu,
  GraduationCap,
  Quote,
  Target,
  User,
} from 'lucide-react';
import type { PortfolioData } from '@/src/types/portfolio';

interface AboutSectionProps {
  data: PortfolioData;
}

export function AboutSection({ data }: AboutSectionProps) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const interests =
    data.interests && data.interests.length
      ? data.interests
      : [
          'Software Development & Programming',
          'IoT & Embedded Hardware Systems',
          'Web & Mobile Engineering',
        ];

  const onProfileMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 8, ry: x * 8 });
  };

  return (
    <section id="about" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono-tech text-xs uppercase tracking-[0.22em] text-purple-600 dark:text-purple-300 mb-2">
            01 · Profile Overview
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            About <span className="gradient-text-brand">Me</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3D Tilt Profile Card & University Identity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            onMouseMove={onProfileMove}
            onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
            style={{
              transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              transition: 'transform 0.18s ease-out',
            }}
            className="lg:col-span-5 glass-panel rounded-3xl p-6 space-y-6 hover:border-purple-400/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-blue-500 shrink-0 border border-purple-400/30 flex items-center justify-center">
                {data.pic ? (
                  <img
                    src={data.pic}
                    alt={data.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-9 h-9 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {data.name}
                </h3>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-300">
                  {data.role}
                </p>
                <p className="text-xs font-mono-tech text-slate-500 dark:text-slate-400 mt-1 inline-flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                  {data.uni}
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              {data.about}
            </p>

            {/* Quick Facts Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-purple-500/15">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/15">
                <span className="font-mono-tech text-[11px] uppercase tracking-wider text-purple-600 dark:text-purple-300 block">
                  Skill Domains
                </span>
                <span className="font-display font-bold text-2xl text-slate-900 dark:text-white mt-0.5 block">
                  {data.skills.length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/15">
                <span className="font-mono-tech text-[11px] uppercase tracking-wider text-blue-600 dark:text-blue-300 block">
                  Projects Built
                </span>
                <span className="font-display font-bold text-2xl text-slate-900 dark:text-white mt-0.5 block">
                  {data.projects.length}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Floating Glass Info Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.06 }}
              className="glass-panel rounded-3xl p-6 space-y-3 hover:border-purple-400/50 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/25 flex items-center justify-center text-purple-600 dark:text-purple-300">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Technology &amp; Programming
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {interests.slice(0, 2).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="glass-panel rounded-3xl p-6 space-y-3 hover:border-blue-400/50 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/25 flex items-center justify-center text-blue-600 dark:text-blue-300">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                IoT &amp; Embedded Focus
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {(interests.slice(2).length
                  ? interests.slice(2)
                  : [
                      'ESP32 & Arduino Sensor Networks',
                      'Real-time Cloud Telemetry & Control',
                    ]
                ).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="md:col-span-2 glass-panel rounded-3xl p-6 space-y-3 hover:border-purple-400/50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-400/25 flex items-center justify-center text-purple-600 dark:text-purple-300">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Career Goals
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {data.careerGoals ||
                  'Building a strong engineering foundation across software development, mobile applications, and connected IoT systems.'}
              </p>
            </motion.div>

            {data.reflection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="md:col-span-2 glass-panel rounded-3xl p-6 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-mono-tech uppercase tracking-widest text-purple-600 dark:text-purple-300">
                  <Quote className="w-4 h-4" />
                  <span>Personal Reflection</span>
                </div>
                <p className="text-sm sm:text-base italic text-slate-700 dark:text-slate-200 leading-relaxed">
                  &ldquo;{data.reflection}&rdquo;
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
