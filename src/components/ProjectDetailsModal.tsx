import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  ExternalLink,
  Github,
  PlayCircle,
  X,
  ZoomIn,
} from 'lucide-react';
import type { ProjectItem } from '@/src/types/portfolio';

interface ProjectDetailsModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

function getSafeMediaUrl(url?: string): string {
  if (!url) return '';
  return /^(https?:\/\/|data:image\/|data:video\/|blob:)/i.test(url) ? url : '';
}

function getYouTubeId(url: string): string | null {
  const m = /(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/.exec(url);
  return m ? m[1] : null;
}

function getDriveId(url: string): string | null {
  const m = /drive\.google\.com\/file\/d\/([\w-]+)/.exec(url);
  return m ? m[1] : null;
}

export function ProjectDetailsModal({
  project,
  onClose,
}: ProjectDetailsModalProps) {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!project) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedImage) {
          setZoomedImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [project, zoomedImage, onClose]);

  if (!project) return null;

  const pics = (project.pics || []).map(getSafeMediaUrl).filter(Boolean);
  const videos = (
    project.videos?.length
      ? project.videos
      : project.video
      ? [project.video]
      : []
  )
    .map(getSafeMediaUrl)
    .filter(Boolean);

  const githubUrl = getSafeMediaUrl(project.github);
  const demoUrl = getSafeMediaUrl(project.demo || project.link);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={project.t}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#050712]/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 18 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-3xl max-h-[88vh] overflow-y-auto glass-panel-strong rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <span className="font-mono-tech text-xs uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">
                Project Overview
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                {project.t}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close project details"
              className="w-10 h-10 rounded-xl bg-white/70 dark:bg-white/10 border border-purple-500/25 flex items-center justify-center hover:border-purple-400 transition cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <div className="space-y-3 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            <p className="font-medium text-slate-900 dark:text-white">
              {project.d}
            </p>
            {project.fullDesc && project.fullDesc !== project.d && (
              <p>{project.fullDesc}</p>
            )}
          </div>

          {/* Technologies */}
          {project.tech && project.tech.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-mono-tech text-xs uppercase tracking-widest text-blue-600 dark:text-blue-300">
                Technologies Used
              </h4>
              <p className="font-mono-tech text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {project.tech.join('  ·  ')}
              </p>
            </div>
          )}

          {/* Key Features */}
          {project.features && project.features.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="font-mono-tech text-xs uppercase tracking-widest text-purple-600 dark:text-purple-300">
                Key Features
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {project.features.map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-purple-500/15"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Links */}
          {(githubUrl || demoUrl) && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {demoUrl && (
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary-gradient px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Live Demo / Link
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-panel px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 hover:border-purple-400 transition"
                >
                  <Github className="w-4 h-4" />
                  Source Code
                </a>
              )}
            </div>
          )}

          {/* Image Gallery */}
          {pics.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-mono-tech text-xs uppercase tracking-widest text-purple-600 dark:text-purple-300">
                Gallery ({pics.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {pics.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setZoomedImage(src)}
                    className="group relative aspect-video rounded-2xl overflow-hidden border border-purple-500/20 bg-slate-900/40 cursor-pointer"
                  >
                    <img
                      src={src}
                      alt={`${project.t} screenshot ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-lg bg-black/65 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <ZoomIn className="w-4 h-4" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Embedded Videos */}
          {videos.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-mono-tech text-xs uppercase tracking-widest text-blue-600 dark:text-blue-300 inline-flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                Video Walkthrough
              </h4>
              <div className="space-y-4">
                {videos.map((v, idx) => {
                  const yt = getYouTubeId(v);
                  const gd = getDriveId(v);
                  if (yt) {
                    return (
                      <iframe
                        key={idx}
                        src={`https://www.youtube.com/embed/${yt}`}
                        title={`${project.t} video ${idx + 1}`}
                        allowFullScreen
                        loading="lazy"
                        className="w-full aspect-video rounded-2xl border border-purple-500/20"
                      />
                    );
                  }
                  if (gd) {
                    return (
                      <iframe
                        key={idx}
                        src={`https://drive.google.com/file/d/${gd}/preview`}
                        title={`${project.t} drive video ${idx + 1}`}
                        allow="autoplay"
                        allowFullScreen
                        loading="lazy"
                        className="w-full aspect-video rounded-2xl border border-purple-500/20"
                      />
                    );
                  }
                  return (
                    <video
                      key={idx}
                      src={v}
                      controls
                      preload="metadata"
                      className="w-full rounded-2xl border border-purple-500/20 bg-black"
                    />
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Image Lightbox */}
        {zoomedImage && (
          <div
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <img
              src={zoomedImage}
              alt="Zoomed preview"
              className="max-w-full max-h-[90vh] rounded-2xl object-contain"
            />
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}
