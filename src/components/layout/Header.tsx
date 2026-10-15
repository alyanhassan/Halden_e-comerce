import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useUI } from '../../context/UIContext';
import { useHeaderScroll } from '../../hooks/useHeaderScroll';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const Header: React.FC = () => {
  const { itemCount, openCartDrawer } = useCart();
  const { wishlistCount } = useWishlist();
  const { openSearch, openMobileNav } = useUI();
  const { isVisible, hasScrolled } = useHeaderScroll();
  const reducedMotion = useReducedMotion();

  // Cart count bump animation key
  const [bumpKey, setBumpKey] = useState(0);

  useEffect(() => {
    if (itemCount > 0) {
      setBumpKey((prev) => prev + 1);
    }
  }, [itemCount]);

  const navLinks = [
    { name: 'Shop', path: '/shop' },
    { name: 'Hoodies', path: '/collections/hoodies' },
    { name: 'Shirts', path: '/collections/shirts' },
    { name: 'Pants', path: '/collections/pants' },
    { name: 'Trousers', path: '/collections/trousers' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 bg-[#FEFAE0] transition-transform transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${hasScrolled ? 'border-b border-[#111111]' : 'border-b border-transparent'}`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Left: Desktop Nav Links & Mobile Hamburger */}
        <div className="flex items-center gap-4 flex-1">
          <button
            type="button"
            onClick={openMobileNav}
            className="lg:hidden p-2 text-[#111111] hover:bg-[#FAEDCD] border border-[#111111] transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm tracking-wider uppercase transition-colors pb-0.5 hover-underline-animation ${
                    isActive
                      ? 'active font-medium text-[#111111]'
                      : 'text-[#111111]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Center: "Halden" Wordmark in Abril Fatface */}
        <div className="flex-shrink-0 text-center px-4">
          <Link
            to="/"
            className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#111111] tracking-tight hover:opacity-85 transition-opacity"
            aria-label="Halden Homepage"
          >
            Halden
          </Link>
        </div>

        {/* Right: Actions (Search, Account, Wishlist, Cart with count) */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={openSearch}
            className="p-2 text-[#111111] hover:bg-[#FAEDCD] transition-colors rounded-none"
            aria-label="Open search overlay"
            title="Search products"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Account */}
          <Link
            to="/account"
            className="hidden sm:flex p-2 text-[#111111] hover:bg-[#FAEDCD] transition-colors"
            aria-label="Go to customer account"
            title="Account"
          >
            <User className="w-5 h-5" />
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative p-2 text-[#111111] hover:bg-[#FAEDCD] transition-colors"
            aria-label={`Wishlist (${wishlistCount} items)`}
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#CCD5AE] border border-[#111111] text-[#111111] text-[10px] font-mono flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart with live count + bump animation */}
          <button
            type="button"
            onClick={openCartDrawer}
            className="relative p-2 text-[#111111] hover:bg-[#FAEDCD] transition-colors flex items-center gap-1.5"
            aria-label={`Shopping cart with ${itemCount} items`}
            title="Open cart drawer"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <motion.span
                key={bumpKey}
                initial={reducedMotion ? false : { scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="w-5 h-5 bg-[#111111] text-[#FEFAE0] text-[11px] font-mono flex items-center justify-center font-bold"
              >
                {itemCount}
              </motion.span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
