import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Check, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ProductSize } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Img } from '../common/Img';
import { getProductApprovedReviewSummarySync } from '../../services/reviewService';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();
  const wishlisted = isInWishlist(product.id);
  const reviewSummary = useMemo(() => getProductApprovedReviewSummarySync(product.id), [product.id]);

  const [addedSize, setAddedSize] = useState<ProductSize | null>(null);
  const [heartAnimKey, setHeartAnimKey] = useState(0);

  const primaryImg = product.images?.[0] || '';
  const secondaryImg = product.images?.[1] || '';
  const primaryColorName = product.colors?.[0]?.name || '';

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    setHeartAnimKey((k) => k + 1);
    if (!wishlisted) {
      showToast(`Added "${product.name}" to wishlist.`, 'success');
    } else {
      showToast(`Removed "${product.name}" from wishlist.`, 'info');
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent, size: ProductSize) => {
    e.preventDefault();
    e.stopPropagation();

    const color = product.colors[0]?.name || 'Standard';
    const colorHex = product.colors[0]?.hex;

    await addItem({
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      collection: product.collection,
      price: product.price,
      size,
      color,
      colorHex,
      quantity: 1,
      image: product.images[0] || '',
      placeholderBg: product.placeholderBg,
    });

    setAddedSize(size);
    setTimeout(() => {
      setAddedSize(null);
    }, 1200);
  };

  return (
    <article
      className={`group relative flex flex-col bg-[#FAEDCD] border border-[#111111] transition-colors ${className}`}
    >
      {/* 4:5 Image Area with Crossfade on Hover */}
      <div className="relative w-full overflow-hidden aspect-[4/5] bg-[#E9EDC9]">
        <Link to={`/product/${product.slug}`} className="block w-full h-full focus:outline-none">
          {/* Primary image */}
          <div className="absolute inset-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <Img
              src={primaryImg}
              alt={`${product.name} in ${primaryColorName}`}
              aspectRatio="4:5"
              size={500}
              objectPosition="center 20%"
              className="w-full h-full"
            />
          </div>

          {/* Secondary image crossfade on desktop hover */}
          {secondaryImg && (
            <div className="absolute inset-0 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none">
              <Img
                src={secondaryImg}
                alt={`${product.name} detail view`}
                aspectRatio="4:5"
                size={500}
                objectPosition="center 20%"
                className="w-full h-full"
              />
            </div>
          )}
        </Link>

        {/* 'New' Badge if relevant */}
        {product.isNew && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#111111] text-[#FEFAE0] text-[10px] font-cta tracking-wider uppercase border border-[#111111] z-10">
            New
          </span>
        )}

        {/* Wishlist Heart Button with animated pop */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-2 right-2 p-2 bg-[#FEFAE0] border border-[#111111] hover:bg-[#E9EDC9] text-[#111111] transition-colors z-20"
        >
          <motion.div
            key={heartAnimKey}
            initial={reducedMotion ? false : { scale: 1 }}
            animate={reducedMotion ? false : { scale: [1, 1.4, 1] }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                wishlisted ? 'fill-[#111111] text-[#111111]' : 'text-[#111111]'
              }`}
            />
          </motion.div>
        </button>

        {/* Desktop Size Quick-Add Bar (slides up from bottom on hover) */}
        <div
          className={`hidden md:flex absolute bottom-0 left-0 right-0 z-20 bg-[#111111] text-[#FEFAE0] border-t border-[#111111] p-1.5 justify-between items-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            addedSize ? 'translate-y-0 bg-emerald-900' : 'translate-y-full group-hover:translate-y-0'
          }`}
        >
          {addedSize ? (
            <div className="w-full py-1 text-center font-cta text-[11px] uppercase flex items-center justify-center gap-1.5 text-[#FEFAE0]">
              <Check className="w-3.5 h-3.5" />
              <span>Added size {addedSize}</span>
            </div>
          ) : (
            <>
              <span className="text-[10px] font-cta uppercase pl-1.5 text-[#FEFAE0]/80">
                Quick Add:
              </span>
              <div className="flex gap-1">
                {(['S', 'M', 'L', 'XL'] as ProductSize[]).map((size) => {
                  const variant = product.variants.find((v) => v.size === size);
                  const isOutOfStock = variant ? variant.stock === 0 : false;

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => handleQuickAdd(e, size)}
                      className={`px-2 py-1 text-[11px] font-mono font-bold transition-colors ${
                        isOutOfStock
                          ? 'opacity-30 cursor-not-allowed line-through text-[#FEFAE0]/50'
                          : 'bg-[#FEFAE0]/15 hover:bg-[#FEFAE0] hover:text-[#111111] text-[#FEFAE0]'
                      }`}
                      title={isOutOfStock ? `${size} out of stock` : `Quick add size ${size}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 border-t border-[#111111] bg-[#FAEDCD]">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#111111]/60 font-cta mb-1">
            {product.collection}
          </p>

          <h3 className="text-sm font-semibold text-[#111111] leading-snug group-hover:underline">
            <Link to={`/product/${product.slug}`}>{product.name}</Link>
          </h3>

          {reviewSummary.totalCount > 0 && (
            <div
              className="flex items-center gap-1.5 pt-1"
              aria-label={`Rated ${reviewSummary.averageRating} out of 5 stars based on ${reviewSummary.totalCount} reviews`}
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3 h-3 ${
                      s <= Math.round(reviewSummary.averageRating)
                        ? 'fill-[#111111] text-[#111111]'
                        : 'text-[#111111]/25'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] text-[#111111]/70">
                ({reviewSummary.totalCount})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-sm font-mono tabular-nums text-[#111111]">
            {formatCurrency(product.price)}
          </p>

          <div className="flex items-center gap-1" aria-label="Available colors">
            {product.colors.map((color) => (
              <span
                key={color.name}
                className="w-3.5 h-3.5 border border-[#111111]/40"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};
