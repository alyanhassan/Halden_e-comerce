import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Plus, Minus, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, ShieldCheck, Ruler, Check, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getProductBySlug, getRelatedProducts } from '../services/productService';
import { Product, ProductColor, ProductSize } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUI } from '../context/UIContext';
import { formatCurrency } from '../utils/currency';
import { ProductCard } from '../components/product/ProductCard';
import { Img } from '../components/common/Img';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { ProductReviewsSection } from '../components/reviews/ProductReviewsSection';
import { getProductApprovedReviewSummarySync } from '../services/reviewService';
import { usePageMeta } from '../hooks/usePageMeta';

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  usePageMeta({
    title: product ? product.name : 'Garment Details',
    description: product?.description || 'Everyday basics engineered with precision.',
    ogImage: product?.images?.[0],
  });

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery active index
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Selections
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Error validation & Feedback
  const [sizeError, setSizeError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Refs & Hooks
  const mainButtonRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Accordion open states
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');

  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openSizeGuide } = useUI();

  // Load product
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setSizeError(false);
    setSelectedSize(null);
    setQuantity(1);
    setActiveImageIndex(0);

    if (slug) {
      getProductBySlug(slug).then((item) => {
        if (isMounted) {
          setProduct(item);
          if (item && item.colors.length > 0) {
            setSelectedColor(item.colors[0]);
          }
          setLoading(false);

          if (item) {
            getRelatedProducts(item.id, 3).then((rel) => {
              if (isMounted) setRelatedProducts(rel);
            });
          }
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Variant lookup
  const currentVariant = useMemo(() => {
    if (!product || !selectedColor || !selectedSize) return null;
    return (
      product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor.name
      ) || null
    );
  }, [product, selectedColor, selectedSize]);

  // Stock status
  const stockForSelected = currentVariant ? currentVariant.stock : null;

  // Check which sizes are in-stock for currently selected color
  const sizeStockMap = useMemo(() => {
    const map: Record<ProductSize, number> = { S: 0, M: 0, L: 0, XL: 0 };
    if (!product || !selectedColor) return map;
    product.variants.forEach((v) => {
      if (v.color === selectedColor.name) {
        map[v.size] = v.stock;
      }
    });
    return map;
  }, [product, selectedColor]);

  // Review Summary
  const reviewSummary = useMemo(() => {
    if (!product) return { averageRating: 0, totalCount: 0 };
    return getProductApprovedReviewSummarySync(product.id);
  }, [product]);

  const handleSizeSelect = (size: ProductSize) => {
    setSelectedSize(size);
    setSizeError(false);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!product || !selectedColor) return;

    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    if (stockForSelected === 0) return;

    await addItem({
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      collection: product.collection,
      price: product.price,
      size: selectedSize,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
      quantity,
      image: product.images[0] || '',
      placeholderBg: product.placeholderBg,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  // Scroll observer to show sticky bar when main button scrolls out of view
  useEffect(() => {
    if (!mainButtonRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(mainButtonRef.current);
    return () => observer.disconnect();
  }, [product, loading]);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-24 text-center font-mono text-sm text-[#111111]">
        Retrieving garment specifications...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-display text-3xl text-[#111111]">Garment Not Found</h2>
        <p className="text-xs text-[#111111]/70">
          The requested garment might have been archived or moved.
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 md:pb-16">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-xs font-mono text-[#111111]/70 mb-6">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:underline">Shop</Link>
        <span className="mx-2">/</span>
        <Link to={`/collections/${product.collection}`} className="capitalize hover:underline">
          {product.collection}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-[#111111] truncate">{product.name}</span>
      </nav>

      {/* Main Product Layout (Gallery Left, Sticky Details Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left: Gallery (Thumbnails + Main Image) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible flex-shrink-0">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 h-20 sm:w-20 sm:h-24 border-2 transition-colors relative flex-shrink-0 overflow-hidden ${
                  activeImageIndex === idx
                    ? 'border-[#111111] bg-[#FAEDCD]'
                    : 'border-[#111111]/20 hover:border-[#111111]/60 bg-[#E9EDC9]'
                }`}
                aria-label={`View perspective ${idx + 1}`}
              >
                <Img
                  src={img}
                  alt={`${product.name} angle 0${idx + 1}`}
                  aspectRatio="4:5"
                  size={500}
                  objectPosition="center 20%"
                  className="w-full h-full"
                />
                {activeImageIndex === idx && (
                  <motion.div
                    layoutId="activeThumbIndicator"
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute -inset-[3px] border-2 border-[#111111] pointer-events-none z-10"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Main Large Image */}
          <div className="flex-1 border-2 border-[#111111] bg-[#FAEDCD] overflow-hidden relative">
            <motion.div
              key={activeImageIndex}
              initial={reducedMotion ? false : { opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full"
            >
              <Img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={`${product.name} perspective ${activeImageIndex + 1}`}
                aspectRatio="4:5"
                size={900}
                priority={true}
                objectPosition="center 20%"
                className="w-full h-full min-h-[420px] sm:min-h-[560px]"
                imgClassName="w-full h-full object-cover"
              />
            </motion.div>
            {product.isNew && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-[#111111] text-[#FEFAE0] text-xs font-cta uppercase z-10">
                New Arrival
              </span>
            )}
          </div>
        </div>

        {/* Right: Purchase Module & Specifications */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 bg-[#FEFAE0]">
          
          {/* Header & Price */}
          <div className="border-b border-[#111111] pb-4">
            <p className="text-xs uppercase tracking-widest text-[#111111]/60 font-cta mb-1">
              {product.collection} · Code: {product.id}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl text-[#111111] leading-tight">
              {product.name}
            </h1>

            {reviewSummary.totalCount > 0 && (
              <a
                href="#reviews-section"
                className="inline-flex items-center gap-2 mt-2 group hover:opacity-80 transition-opacity"
                aria-label={`Rated ${reviewSummary.averageRating} out of 5 stars based on ${reviewSummary.totalCount} reviews`}
              >
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= Math.round(reviewSummary.averageRating)
                          ? 'fill-[#111111] text-[#111111]'
                          : 'text-[#111111]/25'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs font-bold text-[#111111]">
                  {reviewSummary.averageRating.toFixed(1)}
                </span>
                <span className="font-mono text-xs text-[#111111]/60 underline">
                  ({reviewSummary.totalCount} {reviewSummary.totalCount === 1 ? 'review' : 'reviews'})
                </span>
              </a>
            )}

            <p className="text-2xl font-mono tabular-nums text-[#111111] font-bold mt-2">
              {formatCurrency(product.price)}
            </p>
          </div>

          {/* Color Swatches */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-cta uppercase text-[#111111]">
                Color: <span className="font-normal font-mono">{selectedColor?.name}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              {product.colors.map((color) => {
                const isSelected = selectedColor?.name === color.name;
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color);
                      // If the currently chosen size is out of stock in this color, reset size
                      if (selectedSize && sizeStockMap[selectedSize] === 0) {
                        setSelectedSize(null);
                      }
                    }}
                    className={`group relative p-1 border-2 transition-all ${
                      isSelected
                        ? 'border-[#111111] scale-105'
                        : 'border-transparent hover:border-[#111111]/40'
                    }`}
                    aria-label={`Select color ${color.name}`}
                  >
                    <span
                      className="block w-7 h-7 border border-[#111111]"
                      style={{ backgroundColor: color.hex }}
                    />
                    {isSelected && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#111111]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Chips & Size Guide Link */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-cta uppercase text-[#111111]">
                Select Size: {selectedSize && <span className="font-mono">{selectedSize}</span>}
              </span>
              <button
                type="button"
                onClick={openSizeGuide}
                className="text-xs underline flex items-center gap-1 font-cta uppercase hover:opacity-75"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Guide</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(['S', 'M', 'L', 'XL'] as ProductSize[]).map((size) => {
                const stock = sizeStockMap[size];
                const isOutOfStock = stock === 0;
                const isSelected = selectedSize === size;

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => handleSizeSelect(size)}
                    className={`py-3 text-sm font-mono font-bold border-2 transition-colors relative ${
                      isOutOfStock
                        ? 'bg-[#FAEDCD]/40 text-[#111111]/30 border-[#111111]/20 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-[#111111] text-[#FEFAE0] border-[#111111]'
                        : 'bg-[#FAEDCD] text-[#111111] border-[#111111] hover:bg-[#E9EDC9]'
                    }`}
                    aria-label={`Size ${size} ${isOutOfStock ? '(Out of stock)' : ''}`}
                  >
                    <span>{size}</span>
                  </button>
                );
              })}
            </div>

            {/* Inline Size Missing Error */}
            {sizeError && (
              <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-300 p-2 mt-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Please select a size before adding to cart.</span>
              </div>
            )}
          </div>

          {/* Stock Message Alert */}
          {selectedSize && (
            <div className="text-xs font-mono">
              {stockForSelected === 0 ? (
                <p className="text-red-700 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Currently out of stock in size {selectedSize}
                </p>
              ) : stockForSelected !== null && stockForSelected <= 3 ? (
                <p className="text-amber-800 font-bold flex items-center gap-1.5 bg-[#FAEDCD] p-2 border border-[#111111]">
                  <AlertCircle className="w-4 h-4" />
                  Only {stockForSelected} left in size {selectedSize} — order soon
                </p>
              ) : (
                <p className="text-[#111111]/80 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                  In stock and ready to ship within 24 hours
                </p>
              )}
            </div>
          )}

          {/* Quantity Stepper & Add to Cart & Wishlist */}
          <div ref={mainButtonRef} className="space-y-3 pt-2">
            <div className="flex gap-3">
              {/* Stepper */}
              <div className="flex items-center border-2 border-[#111111] bg-[#FAEDCD]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-3 hover:bg-[#E9EDC9] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-mono font-bold text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => {
                      if (stockForSelected && q >= stockForSelected) return q;
                      return q + 1;
                    })
                  }
                  className="px-3 py-3 hover:bg-[#E9EDC9] transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Main ADD TO CART Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={stockForSelected === 0}
                className={`flex-1 py-4 px-6 border-2 border-[#111111] font-cta text-sm uppercase transition-colors ${
                  isAdded
                    ? 'bg-[#CCD5AE] text-[#111111] border-[#111111]'
                    : stockForSelected === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'
                    : 'bg-[#111111] text-[#FEFAE0] hover:bg-[#333333]'
                }`}
              >
                {isAdded ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added</span>
                  </span>
                ) : stockForSelected === 0 ? (
                  'Out of Stock'
                ) : (
                  'Add to Cart'
                )}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`p-4 border-2 border-[#111111] hover:bg-[#FAEDCD] transition-colors ${
                  isWishlisted ? 'bg-[#FAEDCD]' : 'bg-[#FEFAE0]'
                }`}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWishlisted ? 'fill-[#111111] text-[#111111]' : 'text-[#111111]'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Accordions (Description, Materials & Care, Delivery & Returns) */}
          <div className="border-t-2 border-[#111111] divide-y divide-[#111111] pt-2">
            
            {/* 1. Description */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion('desc')}
                className="w-full py-4 flex items-center justify-between text-left font-cta text-xs uppercase"
              >
                <span>Description & Cut</span>
                {openAccordion === 'desc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <AnimatePresence initial={false}>
                {openAccordion === 'desc' && (
                  <motion.div
                    key="desc-accordion"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pb-4 text-xs sm:text-sm text-[#111111]/80 leading-relaxed font-body">
                      <p>{product.description}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Materials & Care */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion('care')}
                className="w-full py-4 flex items-center justify-between text-left font-cta text-xs uppercase"
              >
                <span>Materials & Craftsmanship</span>
                {openAccordion === 'care' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <AnimatePresence initial={false}>
                {openAccordion === 'care' && (
                  <motion.div
                    key="care-accordion"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pb-4 text-xs space-y-2 font-mono text-[#111111]/80">
                      <p><strong>Composition:</strong> {product.materialsAndCare.materials}</p>
                      <p><strong>Care Routine:</strong> {product.materialsAndCare.care}</p>
                      {product.materialsAndCare.origin && (
                        <p><strong>Assembly:</strong> {product.materialsAndCare.origin}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Delivery & Returns */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion('shipping')}
                className="w-full py-4 flex items-center justify-between text-left font-cta text-xs uppercase"
              >
                <span>Delivery & Complimentary Returns</span>
                {openAccordion === 'shipping' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <AnimatePresence initial={false}>
                {openAccordion === 'shipping' && (
                  <motion.div
                    key="shipping-accordion"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pb-4 text-xs space-y-2 text-[#111111]/80 leading-relaxed">
                      <p>• Free carbon-neutral shipping on orders over $120.</p>
                      <p>• Dispatched within 24 business hours from our central warehouse.</p>
                      <p>• 30 days to try at home with prepaid return label included.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>

      {/* Product Reviews Section */}
      <div id="reviews-section">
        <ProductReviewsSection productId={product.id} productName={product.name} />
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t-2 border-[#111111]">
          <div className="flex items-baseline justify-between mb-6 pb-2 border-b border-[#111111]">
            <h2 className="font-display text-2xl sm:text-3xl text-[#111111]">
              Complementary Staples
            </h2>
            <Link
              to={`/collections/${product.collection}`}
              className="text-xs font-cta uppercase hover:underline"
            >
              More in {product.collection}
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* STICKY BOTTOM ADD TO CART BAR (appears when main button scrolls out of view) */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={reducedMotion ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={reducedMotion ? undefined : { y: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 left-0 right-0 z-30 bg-[#FEFAE0] border-t-2 border-[#111111] p-3 shadow-none"
          >
            <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs truncate text-[#111111]">{product.name}</p>
                <p className="font-mono text-xs font-bold text-[#111111]">
                  {formatCurrency(product.price)} {selectedSize && `· Size ${selectedSize}`}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={stockForSelected === 0}
                className={`px-6 py-2.5 font-cta text-xs uppercase border border-[#111111] flex-shrink-0 transition-colors ${
                  isAdded
                    ? 'bg-[#CCD5AE] text-[#111111]'
                    : stockForSelected === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#111111] text-[#FEFAE0] hover:bg-[#333333]'
                }`}
              >
                {isAdded ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Added
                  </span>
                ) : stockForSelected === 0 ? (
                  'Out of Stock'
                ) : selectedSize ? (
                  'Add to Cart'
                ) : (
                  'Choose Size'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
