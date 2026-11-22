import { useState, type MouseEvent } from 'react';
import { ArrowUpRight, Box, Cpu, Layers, Sparkles } from 'lucide-react';
import { ProjectsCube3D } from '@/src/components/three/ProjectsCube3D';
import { ProjectDetailsModal } from '@/src/components/ProjectDetailsModal';
import type { ProjectItem } from '@/src/types/portfolio';

interface ProjectsSectionProps {
  projects: ProjectItem[];
  isDark: boolean;
}

function safeImageUrl(u?: string): string {
  if (!u) return '';
  return /^(https?:\/\/|data:image\/|blob:)/i.test(u) ? u : '';
}

function ProjectHologramCard({
  project,
  index,
  onSelect,
}: {
  project: ProjectItem;
  index: number;
  onSelect: () => void;
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const coverPic = safeImageUrl(project.pics?.[0]);

  const onMove = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 7, ry: x * 7 });
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      style={{
        transform: `perspective(950px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: 'transform 0.18s ease-out',
      }}
      className="group relative text-left glass-panel rounded-3xl overflow-hidden hover:border-blue-400/60 transition cursor-pointer flex flex-col"
    >
      {/* Top Hologram Viewport */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-[#080B1A] via-[#13173A] to-[#0D1024] border-b border-purple-500/20 flex items-center justify-center">
        {coverPic ? (
          <img
            src={coverPic}
            alt={project.t}
            loading="lazy"
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="relative flex flex-col items-center justify-center gap-2 p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/30 to-blue-500/30 border border-blue-400/40 flex items-center justify-center shadow-[0_0_28px_rgba(59,130,246,0.35)]">
              <Cpu className="w-7 h-7 text-blue-300" />
            </div>
            <span className="font-mono-tech text-[11px] uppercase tracking-widest text-blue-300/90">
              Hologram Blueprint · 0{index + 1}
            </span>
          </div>
        )}

        {/* Holographic Corner Reticles & Scan Gradient */}
        <div
          className="pointer-events-none absolute inset-0 opacity-35 group-hover:opacity-65 transition"
          style={{
            backgroundImage:
              'linear-gradient(180deg, transparent 55%, rgba(59, 130, 246, 0.25) 100%)',
          }}
        />
        <span className="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-blue-400/70 rounded-tl-sm" />
        <span className="pointer-events-none absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-purple-400/70 rounded-tr-sm" />
        <span className="pointer-events-none absolute bottom-3 left-3 font-mono-tech text-[11px] px-2.5 py-1 rounded-lg bg-[#080B1A]/80 border border-purple-400/30 text-blue-200 inline-flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-purple-300" />
          Hologram 0{index + 1}
        </span>
      </div>

      {/* Hologram Card Body */}
      <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-tech text-xs text-purple-600 dark:text-purple-300 inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              3D Showcase Node
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>

          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-purple-500 dark:group-hover:text-blue-300 transition">
            {project.t}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {project.d}
          </p>
        </div>

        {project.tech && project.tech.length > 0 && (
          <p className="font-mono-tech text-[11px] text-blue-600 dark:text-blue-300 pt-2 border-t border-purple-500/15">
            {project.tech.slice(0, 4).join(' · ')}
          </p>
        )}
      </div>
    </button>
  );
}

export function ProjectsSection({ projects, isDark }: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    null
  );

  return (
    <section id="projects" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="font-mono-tech text-xs uppercase tracking-[0.22em] text-purple-600 dark:text-purple-300 mb-2">
              03 · Interactive 3D Showcase
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Featured <span className="gradient-text-brand">Projects</span>
            </h2>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md flex items-center gap-2">
            <Box className="w-4 h-4 text-purple-500 shrink-0" />
            <span>
              Rotate the 3D cube in any direction or inspect a hologram preview below for full architecture, media, and links.
            </span>
          </p>
        </div>

        {/* Interactive 3D Projects Cube */}
        <ProjectsCube3D
          projects={projects}
          isDark={isDark}
          onSelectProject={(proj) => setSelectedProject(proj)}
        />

        {/* Interactive Project Hologram Previews */}
        {projects.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-mono-tech text-xs uppercase tracking-widest text-purple-600 dark:text-blue-300">
                Project Hologram Previews ({projects.length})
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj, idx) => (
                <ProjectHologramCard
                  key={proj.id || idx}
                  project={proj}
                  index={idx}
                  onSelect={() => setSelectedProject(proj)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <ProjectDetailsModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
