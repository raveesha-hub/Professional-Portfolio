import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  ZoomIn,
} from 'lucide-react';
import type { AchievementItem } from '@/src/types/portfolio';

interface AchievementsGalleryProps {
  achievements: AchievementItem[];
}

function safeUrl(u?: string): string {
  if (!u) return '';
  return /^(https?:\/\/|data:image\/|data:video\/|blob:)/i.test(u) ? u : '';
}

export function AchievementsGallery({
  achievements,
}: AchievementsGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoomedPic, setZoomedPic] = useState<string | null>(null);

  const activeItem =
    activeIndex !== null ? achievements[activeIndex] ?? null : null;

  useEffect(() => {
    if (activeIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedPic) setZoomedPic(null);
        else setActiveIndex(null);
      } else if (e.key === 'ArrowRight' && achievements.length > 1) {
        setActiveIndex((i) => ((i ?? 0) + 1) % achievements.length);
      } else if (e.key === 'ArrowLeft' && achievements.length > 1) {
        setActiveIndex(
          (i) => ((i ?? 0) - 1 + achievements.length) % achievements.length
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [activeIndex, zoomedPic, achievements.length]);

  return (
    <section id="achievements" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="font-mono-tech text-xs uppercase tracking-[0.22em] text-purple-600 dark:text-purple-300 mb-2">
            05 · Certifications &amp; Honors
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Achievements &amp;{' '}
            <span className="gradient-text-brand">Certificates</span>
          </h2>
        </div>

        {achievements.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center max-w-2xl mx-auto space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-400/30 flex items-center justify-center text-purple-500 dark:text-purple-300">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Certificates &amp; Milestones Ready to Showcase
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Upload your academic certifications, competition awards, and credential thumbnails in the Admin Dashboard to populate this interactive gallery.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((item, idx) => {
              const thumb = safeUrl(item.pics?.[0]);
              return (
                <motion.button
                  key={item.id || idx}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, delay: idx * 0.06 }}
                  onClick={() => setActiveIndex(idx)}
                  className="group text-left glass-panel rounded-3xl overflow-hidden hover:border-purple-400/60 transition cursor-pointer flex flex-col"
                >
                  <div className="aspect-[16/10] w-full bg-gradient-to-br from-purple-900/35 to-blue-900/35 relative overflow-hidden flex items-center justify-center">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={item.t}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <Award className="w-12 h-12 text-purple-300/75" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080B1A]/75 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-4 font-mono-tech text-[11px] uppercase tracking-wider text-blue-200">
                      {item.date || `Credential 0${idx + 1}`}
                    </span>
                  </div>

                  <div className="p-6 space-y-2 flex-1">
                    {item.issuer && (
                      <p className="font-mono-tech text-xs text-purple-600 dark:text-purple-300">
                        {item.issuer}
                      </p>
                    )}
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-300 transition">
                      {item.t}
                    </h3>
                    {item.d && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        {item.d}
                      </p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Achievement Lightbox Modal */}
      <AnimatePresence>
        {activeItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={activeItem.t}
          >
            <div
              onClick={() => setActiveIndex(null)}
              className="fixed inset-0 bg-[#050712]/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative z-10 w-full max-w-2xl max-h-[88vh] overflow-y-auto glass-panel-strong rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white space-y-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 font-mono-tech text-xs text-purple-600 dark:text-purple-300">
                    <Award className="w-4 h-4" />
                    <span>{activeItem.issuer || 'Achievement'}</span>
                    {activeItem.date && (
                      <>
                        <span className="text-slate-400">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {activeItem.date}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="font-display text-2xl font-bold">
                    {activeItem.t}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  aria-label="Close certificate preview"
                  className="w-9 h-9 rounded-xl bg-white/70 dark:bg-white/10 border border-purple-500/25 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activeItem.d && (
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeItem.d}
                </p>
              )}

              {(activeItem.pics || []).map(safeUrl).filter(Boolean).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(activeItem.pics || [])
                    .map(safeUrl)
                    .filter(Boolean)
                    .map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setZoomedPic(src)}
                        className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-purple-500/20 cursor-pointer"
                      >
                        <img
                          src={src}
                          alt={`${activeItem.t} certificate ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-black/65 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <ZoomIn className="w-4 h-4" />
                        </span>
                      </button>
                    ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {safeUrl(activeItem.link) ? (
                  <a
                    href={safeUrl(activeItem.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary-gradient px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Verify Credential
                  </a>
                ) : (
                  <span />
                )}

                {achievements.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex(
                          ((activeIndex ?? 0) - 1 + achievements.length) %
                            achievements.length
                        )
                      }
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/70 dark:bg-white/10 border border-purple-500/20 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex(
                          ((activeIndex ?? 0) + 1) % achievements.length
                        )
                      }
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/70 dark:bg-white/10 border border-purple-500/20 inline-flex items-center gap-1 cursor-pointer"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {zoomedPic && (
        <div
          onClick={() => setZoomedPic(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={zoomedPic}
            alt="Zoomed certificate"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain"
          />
        </div>
      )}
    </section>
  );
}
