import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { validateEmail } from '../../lib/validators';

const NEWSLETTER_STORAGE_KEY = 'halden_newsletter_subscribers';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const reducedMotion = useReducedMotion();

  const handleBlur = () => {
    setHasInteracted(true);
    if (!email.trim()) return;
    const res = validateEmail(email);
    if (!res.isValid) {
      setError(res.error || 'Please provide a valid email address.');
    } else {
      setError('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (hasInteracted) {
      const res = validateEmail(val);
      if (res.isValid) {
        setError('');
      }
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setHasInteracted(true);

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error || 'Please provide a valid email address.');
      return;
    }

    // Check duplicate
    try {
      const raw = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
      const subscribers: string[] = raw ? JSON.parse(raw) : [];
      if (subscribers.includes(emailCheck.value)) {
        setIsSubscribed(true);
        setError('');
        return;
      }
      subscribers.push(emailCheck.value);
      localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(subscribers));
    } catch {
      // ignore localStorage quota error
    }

    setError('');
    setIsSubscribed(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('HALDEN10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer className="bg-[#111111] text-[#FEFAE0] border-t border-[#111111] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        
        {/* Top Grid: Brand & Newsletter & Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 pb-16 border-b border-[#FEFAE0]/20">
          
          {/* Brand & Newsletter Column (spans 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="overflow-hidden">
              <motion.div
                initial={reducedMotion ? false : { y: 35, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to="/"
                  className="font-display text-4xl lg:text-5xl text-[#FEFAE0] block tracking-tight hover:opacity-85"
                >
                  Halden
                </Link>
              </motion.div>
            </div>

            <p className="font-slogan italic text-[#FEFAE0]/80 text-base max-w-sm">
              "Everyday, done properly."
            </p>
            <p className="text-xs text-[#FEFAE0]/70 leading-relaxed max-w-sm font-body">
              Essential menswear constructed from enduring, uncompromised European textiles. Built to wear every day, season after season.
            </p>

            {/* Newsletter Field */}
            <div className="pt-2 max-w-md">
              <p className="text-xs font-cta uppercase tracking-wider text-[#FEFAE0] mb-2">
                Get 10% off your first order
              </p>
              {isSubscribed ? (
                <div className="p-3.5 bg-[#FEFAE0]/10 border border-[#FEFAE0]/30 text-xs space-y-2">
                  <p className="text-[#CCD5AE] font-body">
                    Welcome to Halden. Use this code at checkout for 10% off:
                  </p>
                  <div className="flex items-center justify-between gap-3 bg-[#111111] p-2 border border-[#FEFAE0]/40">
                    <span className="font-mono text-sm tracking-widest text-[#FEFAE0] font-bold">
                      HALDEN10
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-3 py-1 bg-[#FEFAE0] text-[#111111] font-cta text-[11px] uppercase hover:bg-[#FAEDCD] transition-colors"
                    >
                      {copied ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-1.5" noValidate>
                  <div className="flex">
                    <input
                      type="email"
                      id="newsletter-email"
                      value={email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="your.email@domain.com"
                      aria-invalid={error ? 'true' : 'false'}
                      aria-describedby={error ? 'newsletter-error' : undefined}
                      className="flex-1 bg-[#1A1A1A] border border-[#FEFAE0]/30 px-3 py-2.5 text-xs text-[#FEFAE0] placeholder-[#FEFAE0]/40 focus:outline-none focus:border-[#FEFAE0]"
                      aria-label="Email for newsletter"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#FEFAE0] text-[#111111] font-cta text-xs uppercase border border-[#FEFAE0] hover:bg-[#FAEDCD] transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Join</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {error && (
                    <p id="newsletter-error" className="text-[11px] text-[#FAEDCD] pt-1" role="alert">{error}</p>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Column 1: Shop */}
          <div className="space-y-4">
            <h4 className="font-cta text-xs uppercase tracking-widest text-[#CCD5AE]">
              Shop
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FEFAE0]/80">
              <li>
                <Link to="/shop" className="hover-underline-animation text-[#FEFAE0]/80">
                  All Garments
                </Link>
              </li>
              <li>
                <Link to="/collections/hoodies" className="hover-underline-animation text-[#FEFAE0]/80">
                  Heavy Hoodies
                </Link>
              </li>
              <li>
                <Link to="/collections/shirts" className="hover-underline-animation text-[#FEFAE0]/80">
                  Woven Shirts & Tees
                </Link>
              </li>
              <li>
                <Link to="/collections/pants" className="hover-underline-animation text-[#FEFAE0]/80">
                  Everyday Pants
                </Link>
              </li>
              <li>
                <Link to="/collections/trousers" className="hover-underline-animation text-[#FEFAE0]/80">
                  Tailored Trousers
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover-underline-animation text-[#FEFAE0]/80">
                  Saved Items
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Help */}
          <div className="space-y-4">
            <h4 className="font-cta text-xs uppercase tracking-widest text-[#CCD5AE]">
              Help & Policies
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FEFAE0]/80">
              <li>
                <Link to="/shipping-policy" className="hover-underline-animation text-[#FEFAE0]/80">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover-underline-animation text-[#FEFAE0]/80">
                  30-Day Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="hover-underline-animation text-[#FEFAE0]/80">
                  Garment Sizing Matrix
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover-underline-animation text-[#FEFAE0]/80">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover-underline-animation text-[#FEFAE0]/80">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover-underline-animation text-[#FEFAE0]/80">
                  Customer Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-4">
            <h4 className="font-cta text-xs uppercase tracking-widest text-[#CCD5AE]">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FEFAE0]/80">
              <li>
                <Link to="/about" className="hover-underline-animation text-[#FEFAE0]/80">
                  The Halden Manifesto
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover-underline-animation text-[#FEFAE0]/80">
                  Account Overview
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover-underline-animation text-[#FEFAE0]/80">
                  Internal Demo Admin
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Large Editorial Wordmark Reveal */}
        <div className="py-12 border-b border-[#FEFAE0]/15 overflow-hidden text-center select-none">
          <motion.p
            initial={reducedMotion ? false : { y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 0.15 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-7xl sm:text-9xl lg:text-[14rem] text-[#FEFAE0] tracking-tighter leading-none"
          >
            HALDEN
          </motion.p>
        </div>

        {/* Bottom Small Print */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#FEFAE0]/60">
          <div className="space-y-1 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Halden Clothiers Ltd. All rights reserved.</p>
            <p className="text-[#CCD5AE]">Demo store. No real payments are processed.</p>
          </div>
          <div className="flex flex-wrap gap-6 items-center">
            <Link to="/privacy" className="hover-underline-animation text-[#FEFAE0]/80">Privacy Policy</Link>
            <Link to="/terms" className="hover-underline-animation text-[#FEFAE0]/80">Terms of Service</Link>
            <Link to="/cookies" className="hover-underline-animation text-[#FEFAE0]/80">Cookie Settings</Link>
            <Link to="/shipping-policy" className="hover-underline-animation text-[#FEFAE0]/80">Shipping</Link>
            <Link to="/refund-policy" className="hover-underline-animation text-[#FEFAE0]/80">Refunds</Link>
            <a
              href="https://www.pexels.com"
              target="_blank"
              rel="noreferrer"
              className="hover-underline-animation text-[#CCD5AE]"
            >
              Photography via Pexels
            </a>
            <span className="text-[#CCD5AE]">USD ($)</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
