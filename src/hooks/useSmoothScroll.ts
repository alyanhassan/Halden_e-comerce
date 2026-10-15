import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ALLOWED_SMOOTH_PATHS = [
  '/',
  '/shop',
  '/about',
];

function isSmoothScrollAllowed(pathname: string): boolean {
  if (ALLOWED_SMOOTH_PATHS.includes(pathname)) return true;
  if (pathname.startsWith('/collections/')) return true;
  if (pathname.startsWith('/product/')) return true;
  return false;
}

export function useSmoothScroll(reducedMotion: boolean) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable if reduced motion is requested
    if (reducedMotion) {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      return;
    }

    // Only allow on desktop (non-touch) and approved routes
    const isTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 1024);

    if (isTouch || !isSmoothScrollAllowed(pathname)) {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerCallback);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [pathname, reducedMotion]);
}
