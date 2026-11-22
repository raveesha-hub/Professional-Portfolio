import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Orbit } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 180 : 900;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 240);
    }, duration);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const skip = () => {
    setVisible(false);
    onComplete();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080B1A] text-white px-6"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(124, 58, 237, 0.28), rgba(59, 130, 246, 0.14) 45%, transparent 72%)',
            }}
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-400/40 flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(124,58,237,0.45)]">
              <Orbit className="w-8 h-8 text-blue-300 animate-spin [animation-duration:6s]" />
            </div>

            <p className="font-mono-tech text-xs tracking-[0.28em] uppercase text-blue-300 mb-2">
              Project R · Beyond Digital
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-blue-300 bg-clip-text text-transparent">
              Raveesha
            </h1>

            <div className="mt-6 w-48 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="h-full w-full bg-gradient-to-r from-purple-500 via-blue-400 to-violet-400"
              />
            </div>

            <button
              type="button"
              onClick={skip}
              className="mt-6 text-xs font-mono-tech text-slate-400 hover:text-white transition cursor-pointer"
            >
              Enter Digital Universe →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
