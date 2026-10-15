import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getNewArrivals } from '../services/productService';
import { Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { Img } from '../components/common/Img';
import { Marquee } from '../components/common/Marquee';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { TestimonialsSection } from '../components/reviews/TestimonialsSection';
import { heroImage, collectionImages, getImageUrl, px } from '../data/images';
import { usePageMeta } from '../hooks/usePageMeta';

gsap.registerPlugin(ScrollTrigger);

export const HomePage: React.FC = () => {
  usePageMeta({
    title: 'Everyday Basics',
    description: 'Everyday, done properly. Premium menswear basics constructed from heavyweight cottons and tailored European fabrics.',
  });

  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [homeCopied, setHomeCopied] = useState(false);
  const reducedMotion = useReducedMotion();

  const lookbookImgRef = useRef<HTMLDivElement>(null);
  const lookbookSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    getNewArrivals(4).then(setNewArrivals);
  }, []);

  // Lookbook subtle parallax (max 8%) on desktop only
  useEffect(() => {
    if (reducedMotion || !lookbookImgRef.current || !lookbookSectionRef.current) return;
    if (window.innerWidth < 1024) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lookbookImgRef.current,
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: lookbookSectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, lookbookSectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.includes('@')) {
      setNewsletterDone(true);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('HALDEN10');
    setHomeCopied(true);
    setTimeout(() => setHomeCopied(false), 2500);
  };

  const bentoCategories = [
    {
      id: 'hoodies',
      label: 'HOODIES COLLECTION',
      heading: 'Heavyweight comfort. Made to last.',
      subtext: '480gsm French terry and custom fleece.',
      btnText: 'EXPLORE HOODIES',
      path: '/collections/hoodies',
      photo: px(collectionImages.hoodies[0], 1600),
      gridSpan: 'lg:col-span-6 lg:row-span-2 h-[420px] lg:h-full',
      headingSize: 'text-2xl sm:text-3xl lg:text-4xl',
    },
    {
      id: 'shirts',
      label: 'SHIRTS COLLECTION',
      heading: 'Clean lines. Easy to wear.',
      subtext: 'Pinpoint oxford and relaxed poplin.',
      btnText: 'EXPLORE SHIRTS',
      path: '/collections/shirts',
      photo: px(collectionImages.shirts[0], 1600),
      gridSpan: 'lg:col-span-6 lg:row-span-1 h-[420px] lg:h-full',
      headingSize: 'text-xl sm:text-2xl lg:text-3xl',
    },
    {
      id: 'pants',
      label: 'PANTS COLLECTION',
      heading: 'Built for every day.',
      subtext: '11.5oz duck canvas and heavy twill.',
      btnText: 'EXPLORE PANTS',
      path: '/collections/pants',
      photo: px(collectionImages.pants[0], 1200),
      gridSpan: 'lg:col-span-3 lg:row-span-1 h-[420px] lg:h-full',
      headingSize: 'text-lg sm:text-xl lg:text-2xl',
    },
    {
      id: 'trousers',
      label: 'TROUSERS COLLECTION',
      heading: 'Tailored, never stiff.',
      subtext: 'Italian wool-blend and pleated drape.',
      btnText: 'EXPLORE TROUSERS',
      path: '/collections/trousers',
      photo: px(collectionImages.trousers[0], 1200),
      gridSpan: 'lg:col-span-3 lg:row-span-1 h-[420px] lg:h-full',
      headingSize: 'text-lg sm:text-xl lg:text-2xl',
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto pt-4 sm:pt-6">
        {/* MOBILE / TABLET HERO (< 1024px) - CURRENT LAYOUT UNCHANGED */}
        <div className="lg:hidden relative border border-[#111111] overflow-hidden">
          {/* Large Photo Area with Slow Scale (1.08 to 1) on load */}
          <div className="w-full h-[65vh] sm:h-[75vh] bg-[#CCD5AE] relative flex items-center justify-center overflow-hidden">
            <motion.div
              initial={reducedMotion ? false : { scale: 1.08 }}
              animate={reducedMotion ? false : { scale: 1 }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full will-change-transform"
            >
              <Img
                src={getImageUrl(heroImage, 1600)}
                alt="Halden Editorial Campaign — Everyday Done Properly"
                aspectRatio="16:9"
                size={1600}
                priority={true}
                objectPosition="center 25%"
                className="w-full h-full"
                imgClassName="w-full h-full object-cover"
              />
            </motion.div>

            {/* Editorial watermark badge inside image */}
            <div className="absolute top-6 right-6 hidden sm:block border border-[#111111] bg-[#FEFAE0] px-3 py-1.5 text-xs font-mono">
              SPRING / SUMMER 2026
            </div>
          </div>

          {/* Overlapping Cornsilk Panel in Bottom-Left Corner */}
          <div className="relative sm:absolute sm:bottom-0 sm:left-0 max-w-xl bg-[#FEFAE0] border-t sm:border-t-0 sm:border-r sm:border-t border-[#111111] p-6 sm:p-10 z-20">
            {/* Slogan */}
            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 15 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="font-slogan italic text-sm sm:text-base text-[#111111] mb-2"
            >
              Everyday, done properly.
            </motion.p>

            {/* Headline Lines Masked-Reveal One by One */}
            <h1 className="font-display text-3xl sm:text-5xl text-[#111111] leading-none mb-4 space-y-1">
              <span className="block overflow-hidden">
                <motion.span
                  initial={reducedMotion ? false : { y: 60 }}
                  animate={reducedMotion ? false : { y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  Uncompromised
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  initial={reducedMotion ? false : { y: 60 }}
                  animate={reducedMotion ? false : { y: 0 }}
                  transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  Wardrobe Basics
                </motion.span>
              </span>
            </h1>

            {/* Slogan details and CTA button */}
            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 15 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-xs sm:text-sm text-[#111111]/80 mb-6 leading-relaxed font-body"
            >
              Heavyweight cottons, tailored lines, and zero synthetic fillers. Garments made to wear seven days a week.
            </motion.p>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 15 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#111111] text-[#FEFAE0] font-cta text-sm uppercase border border-[#111111] hover:bg-[#333333] transition-colors"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* DESKTOP SPLIT HERO (>= 1024px) */}
        <div className="hidden lg:grid lg:grid-cols-2 border border-[#111111] overflow-hidden min-h-[calc(100vh-120px)] max-h-[820px] bg-[#FEFAE0]">
          {/* Left Column: Text Block on Cornsilk, vertically centered with generous padding */}
          <div className="p-10 xl:p-14 2xl:p-20 flex flex-col justify-center bg-[#FEFAE0] border-r border-[#111111] z-10">
            {/* Slogan */}
            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 15 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="font-slogan italic text-base xl:text-lg text-[#111111] mb-3"
            >
              Everyday, done properly.
            </motion.p>

            {/* Headline Lines Masked-Reveal One by One */}
            <h1 className="font-display text-4xl xl:text-5xl 2xl:text-6xl text-[#111111] leading-[1.05] mb-5 space-y-1">
              <span className="block overflow-hidden">
                <motion.span
                  initial={reducedMotion ? false : { y: 60 }}
                  animate={reducedMotion ? false : { y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  Uncompromised
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  initial={reducedMotion ? false : { y: 60 }}
                  animate={reducedMotion ? false : { y: 0 }}
                  transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  Wardrobe Basics
                </motion.span>
              </span>
            </h1>

            {/* Description */}
            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 15 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm xl:text-base text-[#111111]/80 mb-8 leading-relaxed font-body max-w-md"
            >
              Heavyweight cottons, tailored lines, and zero synthetic fillers. Garments made to wear seven days a week.
            </motion.p>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 15 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#111111] text-[#FEFAE0] font-cta text-sm uppercase border border-[#111111] hover:bg-[#333333] transition-colors"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Full Column Height Photo, object-position center 25% */}
          <div className="relative overflow-hidden bg-[#CCD5AE] h-full min-h-[calc(100vh-120px)] max-h-[820px]">
            <motion.div
              initial={reducedMotion ? false : { scale: 1.08 }}
              animate={reducedMotion ? false : { scale: 1 }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full will-change-transform"
            >
              <img
                src={getImageUrl(heroImage, 1600)}
                alt="Halden Editorial Campaign — Everyday Done Properly"
                loading="eager"
                decoding="async"
                style={{ objectPosition: 'center 25%' }}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Editorial watermark badge inside image */}
            <div className="absolute top-6 right-6 border border-[#111111] bg-[#FEFAE0] px-3 py-1.5 text-xs font-mono select-none z-10">
              SPRING / SUMMER 2026
            </div>
          </div>
        </div>
      </section>

      {/* 2. PHOTO-LED BENTO GRID FOR THE FOUR CATEGORIES */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="font-display text-3xl sm:text-4xl text-[#111111]">
            Collections
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-2 lg:h-[640px] gap-4">
          {bentoCategories.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={reducedMotion ? false : { opacity: 0, y: 25 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative rounded-[12px] overflow-hidden ${item.gridSpan} border border-[#111111] select-none`}
            >
              {/* Full-bleed photo background with 700ms scale to 1.05 on hover */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={item.photo}
                  alt={item.label}
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: 'center 20%' }}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Flat black overlay at 35% opacity (NO gradients) */}
              <div className="absolute inset-0 bg-black/35 pointer-events-none" />

              {/* Card content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-8">
                <span className="block font-body text-[11px] uppercase tracking-wider text-[#FEFAE0]/90 mb-1">
                  {item.label}
                </span>
                <h3 className={`font-display ${item.headingSize} text-[#FEFAE0] leading-tight mb-1.5`}>
                  {item.heading}
                </h3>
                <p className="font-body text-xs sm:text-sm text-[#FEFAE0]/85 mb-4 max-w-md">
                  {item.subtext}
                </p>
                <div>
                  <Link
                    to={item.path}
                    className="inline-block bg-[#FEFAE0] text-[#111111] font-cta text-xs uppercase px-4 py-2.5 rounded group-hover:bg-[#CCD5AE] transition-colors duration-300"
                  >
                    {item.btnText}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MARQUEE TICKER 1 (Between Sections, pauses on hover) */}
      <Marquee text="Everyday, done properly." />

      {/* 3. NEW ARRIVALS (Fade up in stagger) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-6 pb-2 border-b border-[#111111]">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl text-[#111111]">
              New Arrivals
            </h2>
            <p className="text-xs text-[#111111]/70 font-mono mt-0.5">
              Freshly woven staples recently inducted into the catalog.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-cta uppercase hover:underline flex items-center gap-1"
          >
            <span>All Garments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={reducedMotion ? false : { opacity: 0, y: 25 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. BIG BRAND STATEMENT (Solid black #111111 at all times) */}
      <section className="bg-[#FAEDCD] border-y border-[#111111] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-xs font-cta uppercase tracking-widest text-[#111111]">
            HALDEN PHILOSOPHY
          </p>

          <motion.blockquote
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-2xl sm:text-4xl lg:text-5xl text-[#111111] leading-tight text-balance"
          >
            We do not design for runways, seasons, or fleeting algorithms. Halden exists to make the most reliable, comfortable everyday clothing you will ever put on.
          </motion.blockquote>

          <div className="flex justify-center items-center gap-4 pt-2">
            <span className="w-12 h-px bg-[#111111]" />
            <p className="font-slogan italic text-sm sm:text-base text-[#111111]">
              Everyday, done properly.
            </p>
            <span className="w-12 h-px bg-[#111111]" />
          </div>
        </div>
      </section>

      {/* 5. SPLIT LOOKBOOK (Subtle parallax on image + text slide in) */}
      <section ref={lookbookSectionRef} className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 border-2 border-[#111111] bg-[#FEFAE0]">
          
          {/* Left: Lookbook image with subtle parallax (max 8%) */}
          <div className="lg:col-span-7 bg-[#E9EDC9] border-b-2 lg:border-b-0 lg:border-r-2 border-[#111111] min-h-[380px] sm:min-h-[480px] overflow-hidden relative">
            <div
              ref={lookbookImgRef}
              className="w-full h-full min-h-[380px] sm:min-h-[480px] will-change-transform"
            >
              <Img
                src={getImageUrl(collectionImages.trousers[0], 900)}
                alt="The Architecture of Terry Cotton — Lookbook Editorial"
                aspectRatio="4:5"
                size={900}
                objectPosition="center 15%"
                className="w-full h-full min-h-[380px] sm:min-h-[480px]"
                imgClassName="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Editorial Narrative with text sliding in */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 25 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-[#FAEDCD]"
          >
            <div className="space-y-4">
              <span className="text-[11px] font-cta uppercase tracking-widest text-[#111111]/60">
                Textile Study 02
              </span>
              <h3 className="font-display text-3xl sm:text-4xl text-[#111111]">
                Heavyweight Without The Stiff Weight.
              </h3>
              <p className="text-xs sm:text-sm text-[#111111]/80 leading-relaxed font-body">
                Most casual garments rely on polyester blending to achieve stretch and speed up drying. We rejected that shortcut completely.
              </p>
              <p className="text-xs sm:text-sm text-[#111111]/80 leading-relaxed font-body">
                By knitting 100% GOTS-certified ring-spun cotton at 480 grams per square meter, we produce a loopback knit that breathes effortlessly while providing natural weight and insulation.
              </p>
              <div className="pt-2 border-t border-[#111111]/20 grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <p className="text-[#111111]/60 uppercase text-[10px]">Spin Weight</p>
                  <p className="font-bold text-[#111111]">480 GSM Loopback</p>
                </div>
                <div>
                  <p className="text-[#111111]/60 uppercase text-[10px]">Mill Origin</p>
                  <p className="font-bold text-[#111111]">Guimarães, Portugal</p>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                to="/collections/hoodies"
                className="inline-block px-6 py-3.5 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors"
              >
                Explore The Heavyweight Fleece
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 6. WHY HALDEN (Items fade in) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-[#111111] bg-[#FAEDCD] p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="text-[11px] font-cta uppercase tracking-widest text-[#111111]/60">
              Our Commitments
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-[#111111] mt-1">
              Why Halden
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#111111]/20">
            
            {/* 1. Free Shipping */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 15 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="pt-6 md:pt-0 md:px-6 space-y-3"
            >
              <span className="font-mono text-xs font-bold bg-[#FEFAE0] px-2.5 py-1 border border-[#111111] inline-block">
                01
              </span>
              <h3 className="font-display text-xl text-[#111111] pt-1">
                Free Delivery Over $120
              </h3>
              <p className="text-xs text-[#111111]/80 leading-relaxed font-body">
                Every order over $120 ships free worldwide with full door-to-door courier tracking and plastic-free paper packaging.
              </p>
            </motion.div>

            {/* 2. Easy Returns */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 15 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="pt-6 md:pt-0 md:px-6 space-y-3"
            >
              <span className="font-mono text-xs font-bold bg-[#FEFAE0] px-2.5 py-1 border border-[#111111] inline-block">
                02
              </span>
              <h3 className="font-display text-xl text-[#111111] pt-1">
                30-Day Easy Returns
              </h3>
              <p className="text-xs text-[#111111]/80 leading-relaxed font-body">
                Try your garments in the calm comfort of home. Return or exchange any unworn item within 30 days without friction.
              </p>
            </motion.div>

            {/* 3. Quality Fabrics */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 15 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pt-6 md:pt-0 md:px-6 space-y-3"
            >
              <span className="font-mono text-xs font-bold bg-[#FEFAE0] px-2.5 py-1 border border-[#111111] inline-block">
                03
              </span>
              <h3 className="font-display text-xl text-[#111111] pt-1">
                Uncompromised Fabrics
              </h3>
              <p className="text-xs text-[#111111]/80 leading-relaxed font-body">
                Directly commissioned from multi-generational heritage mills in Northern Portugal and Italy. Built to outlive trend cycles.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 6.5. TESTIMONIALS SECTION */}
      <TestimonialsSection />

      {/* 7. NEWSLETTER SIGNUP */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 text-center">
        <div className="bg-[#CCD5AE] border-2 border-[#111111] p-8 sm:p-12">
          <p className="text-xs font-cta uppercase tracking-widest text-[#111111]">
            The Halden Register
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-[#111111] mt-2 mb-3">
            Get 10% off your first order
          </h2>
          <p className="text-xs text-[#111111]/80 max-w-md mx-auto mb-6 font-body">
            Subscribe to receive priority dispatch access, restock notifications, and 10% off your first order.
          </p>

          {newsletterDone ? (
            <div className="p-4 bg-[#FEFAE0] border border-[#111111] space-y-2 text-xs text-[#111111] max-w-md mx-auto">
              <p className="font-body">Thank you for subscribing. Use this code at checkout:</p>
              <div className="flex items-center justify-between gap-3 bg-[#111111] p-2.5 border border-[#111111]">
                <span className="font-mono text-sm tracking-widest text-[#FEFAE0] font-bold">
                  HALDEN10
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-1 bg-[#FEFAE0] text-[#111111] font-cta text-[11px] uppercase hover:bg-[#FAEDCD] transition-colors"
                >
                  {homeCopied ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-[#FEFAE0] border border-[#111111] text-xs text-[#111111] placeholder-[#111111]/50 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase border border-[#111111] hover:bg-[#333333] transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};
