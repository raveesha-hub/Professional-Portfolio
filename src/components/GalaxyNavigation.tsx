import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Code2,
  FolderKanban,
  GraduationCap,
  Home,
  Mail,
  Orbit,
  User,
  X,
} from 'lucide-react';

interface GalaxyNavigationProps {
  activeSection: string;
  isOpen: boolean;
  onClose: () => void;
}

interface PlanetNode {
  id: string;
  label: string;
  subtitle: string;
  icon: typeof Home;
  x: number;
  y: number;
  size: number;
  gradient: string;
  glow: string;
}

const PLANETS: PlanetNode[] = [
  {
    id: 'home',
    label: 'Home',
    subtitle: 'Digital Identity Core',
    icon: Home,
    x: 50,
    y: 48,
    size: 74,
    gradient: 'from-purple-600 via-violet-500 to-blue-500',
    glow: 'rgba(124, 58, 237, 0.7)',
  },
  {
    id: 'about',
    label: 'About',
    subtitle: 'Profile & Vision',
    icon: User,
    x: 22,
    y: 26,
    size: 56,
    gradient: 'from-violet-500 to-indigo-500',
    glow: 'rgba(167, 139, 250, 0.65)',
  },
  {
    id: 'skills',
    label: 'Skills',
    subtitle: '3D Tech Globe & Stack',
    icon: Code2,
    x: 78,
    y: 25,
    size: 60,
    gradient: 'from-blue-500 to-cyan-400',
    glow: 'rgba(59, 130, 246, 0.65)',
  },
  {
    id: 'projects',
    label: 'Projects',
    subtitle: '3D Cube & Holograms',
    icon: FolderKanban,
    x: 84,
    y: 62,
    size: 64,
    gradient: 'from-purple-500 to-blue-600',
    glow: 'rgba(124, 58, 237, 0.68)',
  },
  {
    id: 'education',
    label: 'Education',
    subtitle: 'SLIIT Timeline',
    icon: GraduationCap,
    x: 64,
    y: 82,
    size: 54,
    gradient: 'from-indigo-500 to-blue-500',
    glow: 'rgba(96, 165, 250, 0.65)',
  },
  {
    id: 'achievements',
    label: 'Achievements',
    subtitle: 'Certificates & Awards',
    icon: Award,
    x: 32,
    y: 80,
    size: 54,
    gradient: 'from-violet-600 to-purple-400',
    glow: 'rgba(167, 139, 250, 0.6)',
  },
  {
    id: 'contact',
    label: 'Contact',
    subtitle: 'Communication Portal',
    icon: Mail,
    x: 16,
    y: 56,
    size: 56,
    gradient: 'from-blue-600 to-violet-500',
    glow: 'rgba(59, 130, 246, 0.65)',
  },
];

export function GalaxyNavigation({
  activeSection,
  isOpen,
  onClose,
}: GalaxyNavigationProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const navigateTo = (id: string) => {
    onClose();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Interactive Galaxy Navigation"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#050712]/82 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-4xl glass-panel-strong rounded-3xl p-5 sm:p-8 text-white space-y-5 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                  <Orbit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl sm:text-2xl">
                    Galaxy Navigation Map
                  </h2>
                  <p className="font-mono-tech text-xs text-blue-300">
                    Select any orbital node to warp smoothly to that section
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Galaxy Navigation"
                className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center hover:border-purple-400 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Constellation Canvas (Desktop & Tablet) */}
            <div className="relative h-[380px] sm:h-[430px] rounded-2xl border border-purple-500/25 bg-[#070A18]/90 overflow-hidden hidden sm:block">
              {/* Orbital Rings & Constellation Connections */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <ellipse
                  cx="50"
                  cy="50"
                  rx="36"
                  ry="32"
                  fill="none"
                  stroke="rgba(167,139,250,0.22)"
                  strokeWidth="0.3"
                  strokeDasharray="1.5 1.5"
                />
                <ellipse
                  cx="50"
                  cy="50"
                  rx="24"
                  ry="20"
                  fill="none"
                  stroke="rgba(96,165,250,0.2)"
                  strokeWidth="0.25"
                />
                {PLANETS.slice(1).map((p) => (
                  <line
                    key={p.id}
                    x1="50"
                    y1="48"
                    x2={p.x}
                    y2={p.y}
                    stroke={
                      hovered === p.id || activeSection === p.id
                        ? 'rgba(96,165,250,0.65)'
                        : 'rgba(139,92,246,0.22)'
                    }
                    strokeWidth={hovered === p.id ? '0.45' : '0.25'}
                  />
                ))}
              </svg>

              {/* Orbiting Planet Nodes */}
              {PLANETS.map((planet) => {
                const Icon = planet.icon;
                const isActive = activeSection === planet.id;
                const isHover = hovered === planet.id;
                return (
                  <button
                    key={planet.id}
                    type="button"
                    onMouseEnter={() => setHovered(planet.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => navigateTo(planet.id)}
                    style={{
                      left: `${planet.x}%`,
                      top: `${planet.y}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center cursor-pointer focus:outline-none"
                  >
                    <div
                      style={{
                        width: planet.size,
                        height: planet.size,
                        boxShadow:
                          isActive || isHover
                            ? `0 0 28px ${planet.glow}`
                            : `0 0 14px ${planet.glow}`,
                      }}
                      className={`rounded-full bg-gradient-to-br ${planet.gradient} flex items-center justify-center border-2 transition-transform duration-300 ${
                        isActive
                          ? 'border-white scale-110'
                          : 'border-white/35 group-hover:scale-110 group-hover:border-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="mt-2 px-2.5 py-1 rounded-lg bg-[#080B1A]/90 border border-purple-400/25 text-center whitespace-nowrap">
                      <span className="font-display font-bold text-xs text-white block">
                        {planet.label}
                      </span>
                      <span className="font-mono-tech text-[10px] text-blue-300 block">
                        {planet.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Compact Responsive Grid for Mobile */}
            <div className="grid grid-cols-1 gap-2.5 sm:hidden max-h-[65vh] overflow-y-auto">
              {PLANETS.map((planet) => {
                const Icon = planet.icon;
                const isActive = activeSection === planet.id;
                return (
                  <button
                    key={planet.id}
                    type="button"
                    onClick={() => navigateTo(planet.id)}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600/40 to-blue-600/40 border-purple-400'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${planet.gradient} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="font-display font-bold text-sm block">
                        {planet.label}
                      </span>
                      <span className="font-mono-tech text-[11px] text-blue-300 block">
                        {planet.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
