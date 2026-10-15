import React from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUI } from '../../context/UIContext';
import { useWishlist } from '../../context/WishlistContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const MobileNav: React.FC = () => {
  const { isMobileNavOpen, closeMobileNav } = useUI();
  const { wishlistCount } = useWishlist();
  const reducedMotion = useReducedMotion();

  const links = [
    { name: 'All Products', path: '/shop' },
    { name: 'Hoodies', path: '/collections/hoodies' },
    { name: 'Shirts', path: '/collections/shirts' },
    { name: 'Pants', path: '/collections/pants' },
    { name: 'Trousers', path: '/collections/trousers' },
  ];

  return (
    <AnimatePresence>
      {isMobileNavOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 bg-[#FEFAE0] flex flex-col justify-between overflow-y-auto"
        >
          {/* Top Header inside Menu */}
          <div className="flex items-center justify-between p-6 border-b border-[#111111]">
            <Link
              to="/"
              onClick={closeMobileNav}
              className="font-display text-3xl text-[#111111]"
            >
              Halden
            </Link>
            <button
              type="button"
              onClick={closeMobileNav}
              className="p-2 border border-[#111111] hover:bg-[#FAEDCD] text-[#111111]"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Navigation Links with Staggered Reveal */}
          <nav className="p-6 space-y-6 flex-1 flex flex-col justify-center">
            <div className="space-y-4">
              {links.map((link, idx) => (
                <motion.div
                  key={link.path}
                  initial={reducedMotion ? false : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: reducedMotion ? 0 : 0.08 * (idx + 1),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    to={link.path}
                    onClick={closeMobileNav}
                    className="flex items-center justify-between py-2 border-b border-[#111111]/20 font-display text-2xl text-[#111111] hover:pl-2 transition-all"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-5 h-5 opacity-60" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Secondary Account / Wishlist Links */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.45, duration: 0.3 }}
              className="pt-6 grid grid-cols-2 gap-3"
            >
              <Link
                to="/account"
                onClick={closeMobileNav}
                className="p-3 border border-[#111111] bg-[#FAEDCD] text-center font-cta text-xs uppercase"
              >
                Account
              </Link>
              <Link
                to="/wishlist"
                onClick={closeMobileNav}
                className="p-3 border border-[#111111] bg-[#FAEDCD] text-center font-cta text-xs uppercase flex items-center justify-center gap-1.5"
              >
                <span>Wishlist</span>
                {wishlistCount > 0 && <span>({wishlistCount})</span>}
              </Link>
            </motion.div>
          </nav>

          {/* Bottom Section */}
          <div className="p-6 bg-[#FAEDCD] border-t border-[#111111] text-xs space-y-2">
            <p className="font-slogan italic text-sm text-[#111111]">
              "Everyday, done properly."
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-[#111111]/80">
              <Link to="/about" onClick={closeMobileNav} className="hover:underline">About</Link>
              <Link to="/size-guide" onClick={closeMobileNav} className="hover:underline">Size Guide</Link>
              <Link to="/shipping-policy" onClick={closeMobileNav} className="hover:underline">Shipping</Link>
              <Link to="/refund-policy" onClick={closeMobileNav} className="hover:underline">Returns</Link>
              <Link to="/faq" onClick={closeMobileNav} className="hover:underline">FAQ</Link>
              <Link to="/contact" onClick={closeMobileNav} className="hover:underline">Contact</Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
