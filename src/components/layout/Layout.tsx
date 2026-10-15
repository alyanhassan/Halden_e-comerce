import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { SearchOverlay } from '../search/SearchOverlay';
import { SizeGuideModal } from '../product/SizeGuideModal';
import { Preloader } from '../common/Preloader';
import { BackToTop } from '../common/BackToTop';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const reducedMotion = useReducedMotion();

  // Initialize Lenis smooth scroll on desktop for approved routes (Home, Shop, Collection, Product, About)
  useSmoothScroll(reducedMotion);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFAE0] text-[#111111] selection:bg-[#CCD5AE] selection:text-[#111111]">
      {/* Skip to Content accessible link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#111111] focus:text-[#FEFAE0] focus:font-cta focus:text-xs focus:uppercase focus:border focus:border-[#FEFAE0]"
      >
        Skip to content
      </a>

      <Preloader />
      <AnnouncementBar />
      <Header />
      <MobileNav />
      <SearchOverlay />
      <CartDrawer />
      <SizeGuideModal />

      <main id="main-content" className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};
