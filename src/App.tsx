import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PORTFOLIO } from '@/src/data/defaults';
import {
  loadPortfolioData,
  subscribePortfolioChanges,
  testFirestoreConnection,
} from '@/src/lib/firebase';
import type { PortfolioData } from '@/src/types/portfolio';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { DigitalUniverseCanvas } from '@/src/components/three/DigitalUniverseCanvas';
import { CustomCursor } from '@/src/components/CustomCursor';
import { LoadingScreen } from '@/src/components/LoadingScreen';
import { Navbar } from '@/src/components/Navbar';
import { GalaxyNavigation } from '@/src/components/GalaxyNavigation';
import { HeroSection } from '@/src/components/HeroSection';
import { AboutSection } from '@/src/components/AboutSection';
import { SkillsSection } from '@/src/components/SkillsSection';
import { ProjectsSection } from '@/src/components/ProjectsSection';
import { DeveloperTerminal } from '@/src/components/DeveloperTerminal';
import { EducationTimeline } from '@/src/components/EducationTimeline';
import { DigitalJourneySection } from '@/src/components/DigitalJourneySection';
import { AchievementsGallery } from '@/src/components/AchievementsGallery';
import { ContactSection } from '@/src/components/ContactSection';
import { PortfolioAssistant } from '@/src/components/PortfolioAssistant';
import { AdminDashboard } from '@/src/components/AdminDashboard';

const SECTION_IDS = [
  'home',
  'about',
  'skills',
  'projects',
  'education',
  'achievements',
  'contact',
];

export default function App() {
  const [data, setData] = useState<PortfolioData>(DEFAULT_PORTFOLIO);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return (localStorage.getItem('raveesha_theme') || 'dark') === 'dark';
    } catch {
      return true;
    }
  });
  const [universeEnabled, setUniverseEnabled] = useState(true);
  const [galaxyOpen, setGalaxyOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [adminMode, setAdminMode] = useState<boolean>(
    () => window.location.hash === '#admin'
  );
  const [loaderDone, setLoaderDone] = useState(false);

  // Sync HTML class & localStorage when theme toggles
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.dataset.theme = 'dark';
    } else {
      root.classList.remove('dark');
      root.dataset.theme = 'light';
    }
    try {
      localStorage.setItem('raveesha_theme', isDark ? 'dark' : 'light');
    } catch {
      // Ignore
    }
  }, [isDark]);

  // Boot Firebase load & real-time listener
  useEffect(() => {
    testFirestoreConnection();
    loadPortfolioData().then(setData);
    const unsub = subscribePortfolioChanges(setData);
    return () => unsub();
  }, []);

  // Hash route sync for #admin
  useEffect(() => {
    const onHash = () => {
      setAdminMode(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Scroll spy for active nav highlighting
  useEffect(() => {
    if (adminMode) return;
    const onScroll = () => {
      const vh = window.innerHeight;
      let current = 'home';
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= vh * 0.42) {
          current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [adminMode]);

  const openAdmin = useCallback(() => {
    window.location.hash = '#admin';
    setAdminMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeAdmin = useCallback(() => {
    if (window.location.hash === '#admin') {
      history.replaceState(null, '', '#home');
    }
    setAdminMode(false);
  }, []);

  return (
    <ErrorBoundary>
      {!loaderDone && <LoadingScreen onComplete={() => setLoaderDone(true)} />}

      <CustomCursor />

      {/* Background Animated 3D Futuristic Digital Universe */}
      <DigitalUniverseCanvas
        enabled={universeEnabled && !adminMode}
        isDark={isDark}
      />

      {adminMode ? (
        <AdminDashboard
          data={data}
          onDataChange={setData}
          onClose={closeAdmin}
        />
      ) : (
        <div className="relative z-10 min-h-screen flex flex-col">
          <Navbar
            name={data.name}
            activeSection={activeSection}
            isDark={isDark}
            universeEnabled={universeEnabled}
            onToggleTheme={() => setIsDark((d) => !d)}
            onToggleUniverse={() => setUniverseEnabled((e) => !e)}
            onOpenGalaxy={() => setGalaxyOpen(true)}
            onOpenAssistant={() => setAssistantOpen((v) => !v)}
            onOpenAdmin={openAdmin}
          />

          <GalaxyNavigation
            activeSection={activeSection}
            isOpen={galaxyOpen}
            onClose={() => setGalaxyOpen(false)}
          />

          <main className="flex-1">
            <HeroSection data={data} onOpenGalaxy={() => setGalaxyOpen(true)} />
            <AboutSection data={data} />
            <SkillsSection skills={data.skills} isDark={isDark} />
            <ProjectsSection projects={data.projects} isDark={isDark} />
            <DeveloperTerminal data={data} />
            <EducationTimeline items={data.education} />
            <DigitalJourneySection data={data} />
            <AchievementsGallery achievements={data.achievements} />
            <ContactSection data={data} />
          </main>

          <PortfolioAssistant
            data={data}
            isOpen={assistantOpen}
            onOpenChange={setAssistantOpen}
          />

          <footer className="relative z-10 border-t border-purple-500/15 py-8 px-4 sm:px-6 text-center">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono-tech text-slate-600 dark:text-slate-400">
              <span>
                &copy; {new Date().getFullYear()} {data.name} · {data.uni}
              </span>
              <span>Project R · Beyond Digital</span>
            </div>
          </footer>
        </div>
      )}
    </ErrorBoundary>
  );
}
