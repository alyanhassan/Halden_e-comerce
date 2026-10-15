import React, { useState, useEffect, useMemo } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { Review } from '../../types';
import { listApprovedReviews, computeReviewSummary } from '../../services/reviewService';
import { ReviewModal } from './ReviewModal';

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productName,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    listApprovedReviews(productId).then((data) => {
      setReviews(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const summary = useMemo(() => computeReviewSummary(reviews), [reviews]);

  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (sortBy === 'newest') {
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (sortBy === 'highest') {
      return list.sort((a, b) => b.rating - a.rating);
    }
    if (sortBy === 'lowest') {
      return list.sort((a, b) => a.rating - b.rating);
    }
    return list;
  }, [reviews, sortBy]);

  return (
    <section className="mt-16 pt-12 border-t-2 border-[#111111]" aria-labelledby="reviews-section-heading">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#111111]">
        <div>
          <p className="text-[10px] font-cta uppercase tracking-widest text-[#111111]/60">
            Garment Ratings
          </p>
          <h2 id="reviews-section-heading" className="font-display text-3xl sm:text-4xl text-[#111111]">
            Customer Reviews ({summary.totalCount})
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors self-start sm:self-auto"
        >
          Write a Review
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center font-mono text-xs text-[#111111]/70">
          Loading garment reviews...
        </div>
      ) : summary.totalCount === 0 ? (
        <div className="py-12 text-center bg-[#FAEDCD] border border-[#111111] p-8 my-6 space-y-3">
          <p className="font-display text-2xl text-[#111111]">No reviews yet</p>
          <p className="text-xs text-[#111111]/80 max-w-sm mx-auto font-body">
            Be the first to review the {productName}. Share your evaluation of the fabric weight and fit.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase"
          >
            Leave the First Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-8 items-start">
          
          {/* Left Column: Summary and 5-to-1 Star distribution */}
          <div className="lg:col-span-4 bg-[#FAEDCD] border border-[#111111] p-6 space-y-6">
            <div className="text-center pb-4 border-b border-[#111111]/20">
              <p className="font-display text-5xl text-[#111111]">
                {summary.averageRating.toFixed(1)}
              </p>
              <div className="flex justify-center items-center gap-1 my-2" aria-label={`Rating: ${summary.averageRating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(summary.averageRating)
                        ? 'fill-[#111111] text-[#111111]'
                        : 'text-[#111111]/30'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs font-mono text-[#111111]/70">
                Based on {summary.totalCount} verified review{summary.totalCount === 1 ? '' : 's'}
              </p>
            </div>

            {/* 5-to-1 star distribution bars */}
            <div className="space-y-2">
              {([5, 4, 3, 2, 1] as Array<1 | 2 | 3 | 4 | 5>).map((star) => {
                const count = summary.distribution[star] || 0;
                const percentage = summary.totalCount > 0 ? (count / summary.totalCount) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-xs font-mono">
                    <span className="w-12 text-[#111111] font-bold">{star} stars</span>
                    <div className="flex-1 h-2 bg-[#FEFAE0] border border-[#111111]/30 overflow-hidden">
                      <div
                        className="h-full bg-[#111111] transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[#111111]/70">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Reviews List with Sorting */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#111111]">
              <span className="font-mono text-xs text-[#111111]">
                Showing {sortedReviews.length} review{sortedReviews.length === 1 ? '' : 's'}
              </span>

              <div className="flex items-center gap-2 text-xs">
                <label htmlFor="review-sort" className="font-cta uppercase text-[#111111]">
                  Sort By:
                </label>
                <select
                  id="review-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2 py-1 bg-[#FEFAE0] border border-[#111111] text-xs font-mono focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>

            {/* Reviews list */}
            <div className="divide-y divide-[#111111]/20">
              {sortedReviews.map((rev) => (
                <article key={rev.id} className="py-6 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5" aria-label={`${rev.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating
                              ? 'fill-[#111111] text-[#111111]'
                              : 'text-[#111111]/20'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#111111]/60">
                      <span>{new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#CCD5AE] border border-[#111111] text-[#111111] font-bold text-[10px] font-mono">
                          <CheckCircle2 className="w-3 h-3 text-[#111111]" />
                          Verified buyer
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-display text-lg text-[#111111]">
                    {rev.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#111111]/80 leading-relaxed font-body">
                    {rev.body}
                  </p>

                  <p className="text-xs font-mono font-bold text-[#111111] pt-1">
                    — {rev.name}
                  </p>
                </article>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Write a review modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        productName={productName}
        onReviewSubmitted={fetchReviews}
      />
    </section>
  );
};
