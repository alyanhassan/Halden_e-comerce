import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUI } from '../../context/UIContext';
import { searchProducts } from '../../services/productService';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { Img } from '../common/Img';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const SearchOverlay: React.FC = () => {
  const { isSearchOpen, closeSearch } = useUI();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);
    searchProducts(query).then((items) => {
      if (isMounted) {
        setResults(items);
        setIsSearching(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [query]);

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Search Catalog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-none flex flex-col justify-start"
        >
          {/* Search Container Panel */}
          <motion.div
            initial={reducedMotion ? false : { y: -25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? undefined : { y: -25, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#FEFAE0] border-b border-[#111111] max-w-4xl w-full mx-auto shadow-none"
          >
            {/* Top Input Bar */}
            <div className="p-4 sm:p-6 border-b border-[#111111] flex items-center gap-4">
              <Search className="w-6 h-6 text-[#111111] flex-shrink-0" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hoodies, shirts, trousers, fabrics..."
                className="w-full bg-transparent text-xl sm:text-2xl text-[#111111] font-display placeholder-[#111111]/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="p-2 border border-[#111111] hover:bg-[#FAEDCD] text-[#111111] transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

        {/* Live Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          {query.trim() === '' ? (
            <div className="py-6 text-center text-[#111111]/70">
              <p className="text-sm font-cta uppercase tracking-wider mb-2">
                Popular Searches
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {['Heavyweight Hoodie', 'Oxford Shirt', 'Work Pant', 'Pleated Trouser'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1 bg-[#FAEDCD] border border-[#111111] text-xs hover:bg-[#E9EDC9] transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : isSearching ? (
            <div className="py-8 text-center text-sm font-mono text-[#111111]">
              Searching catalog...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider font-cta text-[#111111]/70 mb-4">
                Found {results.length} {results.length === 1 ? 'match' : 'matches'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.slug}`}
                    onClick={closeSearch}
                    className="flex items-center gap-3 p-3 border border-[#111111] bg-[#FAEDCD] hover:bg-[#E9EDC9] transition-colors group"
                  >
                    <div className="w-14 h-18 flex-shrink-0 overflow-hidden border border-[#111111]/30">
                      <Img
                        src={product.images[0]}
                        alt={product.name}
                        aspectRatio="4:5"
                        size={500}
                        objectPosition="center 20%"
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-[#111111]/60 font-cta">
                        {product.collection}
                      </p>
                      <h4 className="text-sm font-semibold truncate text-[#111111] group-hover:underline">
                        {product.name}
                      </h4>
                      <p className="text-xs font-mono tabular-nums text-[#111111] mt-0.5">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#111111] opacity-40 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="font-display text-xl text-[#111111] mb-1">
                No matching garments
              </p>
              <p className="text-xs text-[#111111]/70 max-w-sm mx-auto">
                We couldn't find anything matching "{query}". Try checking the spelling or browse our full collection.
              </p>
              <Link
                to="/shop"
                onClick={closeSearch}
                className="inline-block mt-4 px-4 py-2 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase"
              >
                Browse All Products
              </Link>
            </div>
          )}
          </div>
        </motion.div>

        {/* Click outside backdrop to close */}
        <div className="flex-1" onClick={closeSearch} aria-hidden="true" />
      </motion.div>
    )}
  </AnimatePresence>
  );
};
