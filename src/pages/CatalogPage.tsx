import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getProducts, getAvailableFilterOptions } from '../services/productService';
import { CollectionType, Product, ProductFilters, ProductSize, SortOption } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { formatCurrency } from '../utils/currency';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { usePageMeta } from '../hooks/usePageMeta';

export const CatalogPage: React.FC = () => {
  const { name } = useParams<{ name?: string }>();
  const isCollectionRoute = Boolean(name);
  const reducedMotion = useReducedMotion();

  // Validate collection name
  const currentCollection = useMemo<CollectionType | 'all'>(() => {
    if (name && ['hoodies', 'shirts', 'pants', 'trousers'].includes(name.toLowerCase())) {
      return name.toLowerCase() as CollectionType;
    }
    return 'all';
  }, [name]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCollection, setSelectedCollection] = useState<CollectionType | 'all'>(
    currentCollection
  );
  const [selectedSizes, setSelectedSizes] = useState<ProductSize[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Available filter choices
  const [filterMeta, setFilterMeta] = useState<{
    sizes: ProductSize[];
    colors: string[];
    minPrice: number;
    maxPrice: number;
  }>({
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [],
    minPrice: 40,
    maxPrice: 120,
  });

  // Keep collection filter synced with route parameter
  useEffect(() => {
    setSelectedCollection(currentCollection);
  }, [currentCollection]);

  // Load filter metadata
  useEffect(() => {
    getAvailableFilterOptions(selectedCollection).then(setFilterMeta);
  }, [selectedCollection]);

  // Fetch products whenever filters or sort changes (simulating 300ms loading)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const activeFilters: ProductFilters = {
      collection: selectedCollection,
      sizes: selectedSizes,
      colors: selectedColors,
      minPrice,
      maxPrice,
    };

    const timer = setTimeout(() => {
      getProducts(activeFilters, sortOption).then((items) => {
        if (isMounted) {
          setProducts(items);
          setLoading(false);
        }
      });
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedCollection, selectedSizes, selectedColors, minPrice, maxPrice, sortOption]);

  // Toggle filter helpers
  const toggleSize = (size: ProductSize) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const clearAllFilters = () => {
    if (!isCollectionRoute) {
      setSelectedCollection('all');
    }
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
  };

  // Check if any filters are active
  const hasActiveFilters =
    (!isCollectionRoute && selectedCollection !== 'all') ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined;

  // Heading & description
  const pageTitle = useMemo(() => {
    if (selectedCollection === 'hoodies') return 'Heavy Hoodies';
    if (selectedCollection === 'shirts') return 'Woven Shirts & Tops';
    if (selectedCollection === 'pants') return 'Everyday Pants';
    if (selectedCollection === 'trousers') return 'Tailored Trousers';
    return 'All Garments';
  }, [selectedCollection]);

  const pageDescription = useMemo(() => {
    if (selectedCollection === 'hoodies')
      return '480gsm French terry and fleece, double-needle stitched for maximum longevity.';
    if (selectedCollection === 'shirts')
      return 'Tailored pinpoint oxfords, crisp washed linens, and dense carded jersey tees.';
    if (selectedCollection === 'pants')
      return 'Tough cotton canvas and structured sweatpants constructed for daily resilience.';
    if (selectedCollection === 'trousers')
      return 'Fine Merino tropical wool and pleated Irish linens cut with architectural proportion.';
    return 'The complete Halden matrix of everyday fundamentals. Free from logos and trend cycles.';
  }, [selectedCollection]);

  usePageMeta({
    title: pageTitle,
    description: pageDescription,
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="text-xs font-mono text-[#111111]/70 mb-4">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:underline">Shop</Link>
        {isCollectionRoute && (
          <>
            <span className="mx-2">/</span>
            <span className="capitalize font-bold text-[#111111]">{name}</span>
          </>
        )}
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-2 border-[#111111] mb-8">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl text-[#111111]">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#111111]/80 max-w-xl mt-2 leading-relaxed">
            {pageDescription}
          </p>
        </div>

        {/* Results count & Sort dropdown */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <p className="text-xs font-mono text-[#111111]/70">
            {products.length} {products.length === 1 ? 'Garment' : 'Garments'}
          </p>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs font-cta uppercase text-[#111111]">
              Sort:
            </label>
            <div className="relative">
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="appearance-none bg-[#FAEDCD] border border-[#111111] px-3 py-1.5 pr-8 text-xs font-mono text-[#111111] focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#111111]" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Trigger Button */}
      <div className="lg:hidden mb-6">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="w-full py-3 px-4 bg-[#FAEDCD] border border-[#111111] font-cta text-xs uppercase flex items-center justify-center gap-2 hover:bg-[#E9EDC9] transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters & Refinements {hasActiveFilters && '• Active'}</span>
        </button>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-2 pb-4 border-b border-[#111111]/15">
          <span className="text-[11px] font-cta uppercase text-[#111111]/70 mr-1">
            Active:
          </span>

          {!isCollectionRoute && selectedCollection !== 'all' && (
            <button
              onClick={() => setSelectedCollection('all')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAEDCD] border border-[#111111] text-xs capitalize hover:bg-[#E9EDC9]"
            >
              <span>{selectedCollection}</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {selectedSizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAEDCD] border border-[#111111] text-xs font-mono hover:bg-[#E9EDC9]"
            >
              <span>Size: {size}</span>
              <X className="w-3 h-3" />
            </button>
          ))}

          {selectedColors.map((color) => (
            <button
              key={color}
              onClick={() => toggleColor(color)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAEDCD] border border-[#111111] text-xs hover:bg-[#E9EDC9]"
            >
              <span>{color}</span>
              <X className="w-3 h-3" />
            </button>
          ))}

          {(minPrice !== undefined || maxPrice !== undefined) && (
            <button
              onClick={() => {
                setMinPrice(undefined);
                setMaxPrice(undefined);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAEDCD] border border-[#111111] text-xs font-mono hover:bg-[#E9EDC9]"
            >
              <span>
                {minPrice ? `$${minPrice}` : '$0'} - {maxPrice ? `$${maxPrice}` : 'Max'}
              </span>
              <X className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs underline text-[#111111] hover:opacity-70 ml-2 font-cta uppercase text-[11px]"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Grid: Left Sidebar (Desktop) + Products (3 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 space-y-8 sticky top-24 border border-[#111111] bg-[#FAEDCD] p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#111111]">
            <h3 className="font-cta text-xs uppercase tracking-wider text-[#111111]">
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] underline hover:opacity-75 font-mono"
              >
                Reset
              </button>
            )}
          </div>

          {/* 1. Collection Filter (if on /shop or general view) */}
          {!isCollectionRoute && (
            <div className="space-y-3">
              <h4 className="font-cta text-[11px] uppercase tracking-wider text-[#111111]/70">
                Collection
              </h4>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Collections' },
                  { id: 'hoodies', label: 'Heavy Hoodies' },
                  { id: 'shirts', label: 'Shirts & Tees' },
                  { id: 'pants', label: 'Everyday Pants' },
                  { id: 'trousers', label: 'Tailored Trousers' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedCollection(item.id as CollectionType | 'all')}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors border ${
                      selectedCollection === item.id
                        ? 'bg-[#111111] text-[#FEFAE0] border-[#111111]'
                        : 'bg-[#FEFAE0] text-[#111111] border-[#111111]/20 hover:border-[#111111]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {selectedCollection === item.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Size Filter */}
          <div className="space-y-3">
            <h4 className="font-cta text-[11px] uppercase tracking-wider text-[#111111]/70">
              Size
            </h4>
            <div className="grid grid-cols-4 gap-1.5">
              {(['S', 'M', 'L', 'XL'] as ProductSize[]).map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`py-2 text-xs font-mono font-bold border transition-colors ${
                      isSelected
                        ? 'bg-[#111111] text-[#FEFAE0] border-[#111111]'
                        : 'bg-[#FEFAE0] text-[#111111] border-[#111111]/30 hover:border-[#111111]'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Color Filter */}
          <div className="space-y-3">
            <h4 className="font-cta text-[11px] uppercase tracking-wider text-[#111111]/70">
              Color
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {filterMeta.colors.map((color) => {
                const isSelected = selectedColors.includes(color);
                return (
                  <label
                    key={color}
                    className="flex items-center gap-2.5 text-xs text-[#111111] cursor-pointer hover:underline py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleColor(color)}
                      className="w-3.5 h-3.5 accent-[#111111] rounded-none border-[#111111]"
                    />
                    <span>{color}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Price Filter */}
          <div className="space-y-3">
            <h4 className="font-cta text-[11px] uppercase tracking-wider text-[#111111]/70">
              Price Range
            </h4>
            <div className="flex items-center gap-2 text-xs font-mono">
              <input
                type="number"
                placeholder="Min"
                value={minPrice ?? ''}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-2 py-1.5 bg-[#FEFAE0] border border-[#111111] focus:outline-none"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice ?? ''}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-2 py-1.5 bg-[#FEFAE0] border border-[#111111] focus:outline-none"
              />
            </div>
          </div>
        </aside>

        {/* Products Grid: 3 columns desktop, 2 columns mobile */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-[#111111] bg-[#FAEDCD] flex flex-col animate-soft-pulse overflow-hidden"
                >
                  <div className="w-full aspect-[4/5] bg-[#E9EDC9] border-b border-[#111111] flex items-center justify-center">
                    <div className="w-20 h-4 bg-[#CCD5AE]/60" />
                  </div>
                  <div className="p-4 space-y-3 bg-[#FAEDCD]">
                    <div className="w-16 h-2.5 bg-[#CCD5AE]/70" />
                    <div className="w-3/4 h-3.5 bg-[#CCD5AE]/90" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="w-12 h-3 bg-[#CCD5AE]/80" />
                      <div className="flex gap-1">
                        <div className="w-3.5 h-3.5 bg-[#CCD5AE]/60" />
                        <div className="w-3.5 h-3.5 bg-[#CCD5AE]/60" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <motion.div
                  layout
                  key={product.id}
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Empty State */
            <div className="border-2 border-[#111111] bg-[#FAEDCD] p-12 text-center space-y-4">
              <h3 className="font-display text-2xl sm:text-3xl text-[#111111]">
                No matching garments found
              </h3>
              <p className="text-xs text-[#111111]/80 max-w-sm mx-auto">
                No items in this collection match your selected filters. Try broadening your criteria.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-6 py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filters Slide-Up Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 bg-[#111111]/60"
              onClick={() => setIsMobileFiltersOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={reducedMotion ? false : { y: '100%' }}
              animate={{ y: 0 }}
              exit={reducedMotion ? undefined : { y: '100%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-[#FEFAE0] border-t-2 border-[#111111] max-h-[85vh] overflow-y-auto p-6 space-y-6 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#111111]">
                <h3 className="font-display text-2xl text-[#111111]">Refine Collection</h3>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2 border border-[#111111] hover:bg-[#FAEDCD]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Collections */}
              {!isCollectionRoute && (
                <div className="space-y-2">
                  <p className="font-cta text-xs uppercase">Category</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'all', label: 'All Garments' },
                      { id: 'hoodies', label: 'Hoodies' },
                      { id: 'shirts', label: 'Shirts' },
                      { id: 'pants', label: 'Pants' },
                      { id: 'trousers', label: 'Trousers' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedCollection(item.id as CollectionType | 'all')}
                        className={`p-2 text-xs border text-left font-mono ${
                          selectedCollection === item.id
                            ? 'bg-[#111111] text-[#FEFAE0] border-[#111111]'
                            : 'bg-[#FAEDCD] text-[#111111] border-[#111111]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Sizes */}
              <div className="space-y-2">
                <p className="font-cta text-xs uppercase">Size</p>
                <div className="grid grid-cols-4 gap-2">
                  {(['S', 'M', 'L', 'XL'] as ProductSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`py-2 text-xs font-mono font-bold border ${
                        selectedSizes.includes(size)
                          ? 'bg-[#111111] text-[#FEFAE0] border-[#111111]'
                          : 'bg-[#FAEDCD] text-[#111111] border-[#111111]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Colors */}
              <div className="space-y-2">
                <p className="font-cta text-xs uppercase">Color</p>
                <div className="flex flex-wrap gap-2">
                  {filterMeta.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={`px-3 py-1.5 text-xs border ${
                        selectedColors.includes(color)
                          ? 'bg-[#111111] text-[#FEFAE0] border-[#111111]'
                          : 'bg-[#FAEDCD] text-[#111111] border-[#111111]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#111111] flex gap-3">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex-1 py-3 border border-[#111111] bg-[#FAEDCD] font-cta text-xs uppercase"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex-1 py-3 border border-[#111111] bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase"
                >
                  View {products.length} Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
