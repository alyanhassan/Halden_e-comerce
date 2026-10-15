import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const PRELOADER_STORAGE_KEY = 'halden_session_preloaded';
const LETTERS = ['H', 'a', 'l', 'd', 'e', 'n'];

export const Preloader: React.FC = () => {
  const { pathname } = useLocation();
  const reducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If reduced motion is preferred or navigating directly to an inner page, skip preloader
    if (reducedMotion || pathname !== '/') {
      try {
        sessionStorage.setItem(PRELOADER_STORAGE_KEY, 'true');
      } catch {
        // sessionStorage unavailable
      }
      return;
    }

    try {
      const alreadyLoaded = sessionStorage.getItem(PRELOADER_STORAGE_KEY);
      if (!alreadyLoaded) {
        setIsVisible(true);
        sessionStorage.setItem(PRELOADER_STORAGE_KEY, 'true');

        // Automatically lift away after 1.4s (well within max 1.8s)
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 1400);

        return () => clearTimeout(timer);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, [reducedMotion, pathname]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="halden-preloader"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 bg-[#FEFAE0] flex flex-col items-center justify-center pointer-events-auto select-none"
          aria-hidden="true"
        >
          {/* Letter by letter reveal */}
          <div className="flex items-baseline overflow-hidden">
            {LETTERS.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.1 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="font-display text-6xl sm:text-7xl lg:text-8xl text-[#111111] inline-block tracking-tight"
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Subtitle / Slogan Reveal */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.65, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-slogan italic text-xs sm:text-sm text-[#111111] mt-3"
          >
            "Everyday, done properly."
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
