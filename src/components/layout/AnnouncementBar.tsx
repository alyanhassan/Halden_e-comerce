import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface Announcement {
  text: string;
  actionText?: string;
  link: string;
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    text: 'Free shipping on orders over $120',
    actionText: 'Shop Now',
    link: '/shop',
  },
  {
    text: 'Easy 30-day returns and exchanges',
    actionText: 'Learn More',
    link: '/shipping-returns',
  },
  {
    text: 'New arrivals: Freshly woven seasonal staples',
    actionText: 'Discover',
    link: '/shop',
  },
];

export const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, reducedMotion]);

  const current = ANNOUNCEMENTS[currentIndex];

  return (
    <aside
      aria-label="Promotional Announcement"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-[#CCD5AE] text-[#111111] py-2 px-4 text-center text-xs tracking-wider border-b border-[#111111] transition-colors overflow-hidden select-none"
    >
      <div className="container mx-auto h-5 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={reducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex items-center justify-center gap-2"
          >
            <span className="font-cta text-[11px] uppercase text-[#111111]">
              {current.text}
            </span>
            {current.actionText && (
              <>
                <span aria-hidden="true" className="opacity-40">·</span>
                <Link
                  to={current.link}
                  className="underline underline-offset-2 hover:opacity-75 text-[11px] font-cta uppercase transition-opacity"
                >
                  {current.actionText}
                </Link>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
};
