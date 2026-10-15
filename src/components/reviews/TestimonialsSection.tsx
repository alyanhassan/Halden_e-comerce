import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Review } from '../../types';
import { listApprovedReviews } from '../../services/reviewService';
import { getProductById } from '../../services/productService';
import { ReviewModal } from './ReviewModal';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const TestimonialsSection: React.FC = () => {
  const [featuredReviews, setFeaturedReviews] = useState<Array<Review & { productTitle?: string }>>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const loadTestimonials = async () => {
    const approved = await listApprovedReviews();

    // 1. Prioritize reviews marked 'featured', then highest-rated approved ones
    const featured = approved.filter((r) => r.featured);
    const nonFeatured = approved
      .filter((r) => !r.featured)
      .sort((a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Use at least 6 approved reviews (featured first, then the highest-rated approved ones)
    const combined = [...featured, ...nonFeatured];
    const targetCount = Math.min(combined.length, Math.max(6, featured.length));
    const selected = combined.slice(0, targetCount);

    // Attach product title
    const withTitles = await Promise.all(
      selected.map(async (rev) => {
        if (!rev.productId) {
          return { ...rev, productTitle: 'General Store Experience' };
        }
        const product = await getProductById(rev.productId);
        return {
          ...rev,
          productTitle: product ? product.name : 'Core Collection',
        };
      })
    );

    setFeaturedReviews(withTitles);
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const renderReviewCard = (rev: Review & { productTitle?: string }, key: string) => (
    <article
      key={key}
      tabIndex={0}
      className="w-[300px] lg:w-[400px] flex-shrink-0 border border-[#111111] bg-[#FAEDCD] p-6 sm:p-8 flex flex-col justify-between hover:bg-[#E9EDC9] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
    >
      <div className="space-y-4">
        {/* Star Rating */}
        <div className="flex items-center gap-1" aria-label={`${rev.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3.5 h-3.5 ${
                s <= rev.rating ? 'fill-[#111111] text-[#111111]' : 'text-[#111111]/25'
              }`}
            />
          ))}
        </div>

        {/* Quote / Headline */}
        <blockquote className="font-display text-xl text-[#111111] leading-snug">
          "{rev.title}"
        </blockquote>

        {/* Body */}
        <p className="text-xs text-[#111111]/80 leading-relaxed font-body line-clamp-4">
          {rev.body}
        </p>
      </div>

      <div className="pt-6 mt-6 border-t border-[#111111]/20 flex items-center justify-between text-xs font-mono">
        <div>
          <p className="font-bold text-[#111111]">{rev.name}</p>
          <p className="text-[11px] text-[#111111]/60 truncate max-w-[180px]">
            {rev.productTitle}
          </p>
        </div>

        {rev.verifiedPurchase && (
          <span className="text-[10px] bg-[#CCD5AE] border border-[#111111] px-1.5 py-0.5 text-[#111111] font-bold">
            Verified
          </span>
        )}
      </div>
    </article>
  );

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12" aria-labelledby="testimonials-heading">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-3 border-b-2 border-[#111111]">
        <div>
          <p className="text-[10px] font-cta uppercase tracking-widest text-[#111111]/60">
            Patron Accounts
          </p>
          <h2 id="testimonials-heading" className="font-display text-3xl sm:text-4xl text-[#111111] mt-1">
            Worn Everyday, Tested Continuously
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors self-start sm:self-auto"
        >
          Write a Review
        </button>
      </div>

      {/* Marquee or Scrollable Row - Hard clipped edges (NO gradient edge fades) */}
      <div className="overflow-hidden w-full">
        {reducedMotion ? (
          // Reduced motion: horizontally scrollable row
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
            {featuredReviews.map((rev) => renderReviewCard(rev, rev.id))}
          </div>
        ) : (
          // Continuous LEFT-TO-RIGHT marquee: translateX -50% to 0, 45s linear, pause on hover/focus-within
          <div className="flex gap-6 w-max animate-marquee-ltr hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
            {/* First copy */}
            {featuredReviews.map((rev, idx) => renderReviewCard(rev, `rev-a-${rev.id}-${idx}`))}
            {/* Second copy for seamless loop */}
            {featuredReviews.map((rev, idx) => renderReviewCard(rev, `rev-b-${rev.id}-${idx}`))}
          </div>
        )}
      </div>

      {/* Write a general review modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={null}
        productName="Halden Everyday Basics"
        onReviewSubmitted={loadTestimonials}
      />
    </section>
  );
};
