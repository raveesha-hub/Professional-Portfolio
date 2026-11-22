import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Award,
  Code2,
  FolderKanban,
  GraduationCap,
} from 'lucide-react';
import type { PortfolioData } from '@/src/types/portfolio';

interface DigitalJourneySectionProps {
  data: PortfolioData;
}

type JourneyFilter = 'All' | 'Education' | 'Project' | 'Achievement' | 'Skill';

interface UnifiedMilestone {
  id: string;
  date: string;
  title: string;
  category: 'Education' | 'Project' | 'Achievement' | 'Skill';
  summary: string;
  tags?: string[];
}

export function DigitalJourneySection({ data }: DigitalJourneySectionProps) {
  const [filter, setFilter] = useState<JourneyFilter>('All');

  const totalTechModules = useMemo(
    () => data.skills.reduce((sum, s) => sum + s.i.length, 0),
    [data.skills]
  );

  const milestones = useMemo<UnifiedMilestone[]>(() => {
    const items: UnifiedMilestone[] = [];

    if (data.journey?.length) {
      data.journey.forEach((m) => {
        items.push({
          id: m.id,
          date: m.date,
          title: m.title,
          category: m.category,
          summary: m.summary,
        });
      });
    }

    data.education.forEach((edu, i) => {
      items.push({
        id: `edu_${edu.id || i}`,
        date: edu.period,
        title: `${edu.degree} — ${edu.institution}`,
        category: 'Education',
        summary: edu.description,
        tags: edu.highlights,
      });
    });

    data.projects.forEach((proj, i) => {
      items.push({
        id: `proj_${proj.id || i}`,
        date: proj.updatedAt || 'Portfolio Build',
        title: proj.t,
        category: 'Project',
        summary: proj.d,
        tags: proj.tech?.slice(0, 4),
      });
    });

    data.achievements.forEach((ach, i) => {
      items.push({
        id: `ach_${ach.id || i}`,
        date: ach.date || 'Certified',
        title: ach.t,
        category: 'Achievement',
        summary: ach.d || (ach.issuer ? `Issued by ${ach.issuer}` : 'Verified Credential'),
      });
    });

    data.skills.forEach((sk, i) => {
      items.push({
        id: `sk_${i}`,
        date: `${sk.i.length} Technologies`,
        title: sk.n,
        category: 'Skill',
        summary: sk.i.join(', '),
      });
    });

    return items;
  }, [data]);

  const filtered =
    filter === 'All'
      ? milestones
      : milestones.filter((m) => m.category === filter);

  const getCategoryIcon = (cat: UnifiedMilestone['category']) => {
    switch (cat) {
      case 'Education':
        return GraduationCap;
      case 'Project':
        return FolderKanban;
      case 'Achievement':
        return Award;
      case 'Skill':
        return Code2;
    }
  };

  return (
    <section id="journey" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="font-mono-tech text-xs uppercase tracking-[0.22em] text-purple-600 dark:text-purple-300 mb-2">
              Verified Activity &amp; Growth
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Digital <span className="gradient-text-brand">Journey</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['All', 'Education', 'Project', 'Achievement', 'Skill'] as JourneyFilter[]).map(
              (f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    filter === f
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm'
                      : 'glass-panel text-slate-700 dark:text-slate-300 hover:border-purple-400/50'
                  }`}
                >
                  {f}
                </button>
              )
            )}
          </div>
        </div>

        {/* Real Verified Summary Telemetry Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-2xl p-5 space-y-1">
            <span className="font-mono-tech text-[11px] uppercase tracking-wider text-purple-600 dark:text-purple-300 flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5" />
              Projects
            </span>
            <p className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
              {data.projects.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active 3D showcase builds
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-1">
            <span className="font-mono-tech text-[11px] uppercase tracking-wider text-blue-600 dark:text-blue-300 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              Tech Stack
            </span>
            <p className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
              {totalTechModules}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Across {data.skills.length} skill domains
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-1">
            <span className="font-mono-tech text-[11px] uppercase tracking-wider text-purple-600 dark:text-purple-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Education
            </span>
            <p className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
              {data.education.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {data.uni}
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-1">
            <span className="font-mono-tech text-[11px] uppercase tracking-wider text-blue-600 dark:text-blue-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Certificates
            </span>
            <p className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
              {data.achievements.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified portfolio honors
            </p>
          </div>
        </div>

        {/* Visual Milestone Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item, idx) => {
            const Icon = getCategoryIcon(item.category);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.24) }}
                className="glass-panel rounded-2xl p-5 sm:p-6 space-y-3 hover:border-purple-400/50 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 font-mono-tech text-xs uppercase tracking-wider text-purple-600 dark:text-purple-300">
                    <Icon className="w-4 h-4 text-blue-500" />
                    {item.category}
                  </span>
                  <span className="font-mono-tech text-[11px] text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                    <Activity className="w-3 h-3 text-purple-400" />
                    {item.date}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.summary}
                </p>

                {item.tags && item.tags.length > 0 && (
                  <p className="font-mono-tech text-[11px] text-blue-600 dark:text-blue-300 pt-1">
                    {item.tags.join(' · ')}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
