import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 380);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-40 px-3.5 py-2 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase tracking-wider border border-[#111111] hover:bg-[#CCD5AE] hover:text-[#111111] active:scale-[0.98] transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
        >
          TOP
        </motion.button>
      )}
    </AnimatePresence>
  );
};
