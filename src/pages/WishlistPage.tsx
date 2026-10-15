import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, X, AlertCircle } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getWishlistProducts } from '../services/wishlistService';
import { Product, ProductSize } from '../types';
import { formatCurrency } from '../utils/currency';
import { Img } from '../components/common/Img';
import { usePageMeta } from '../hooks/usePageMeta';

export const WishlistPage: React.FC = () => {
  usePageMeta({
    title: 'Wishlist',
    description: 'Saved garments in your Halden archive.',
  });

  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem, openCartDrawer } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Size selection modal state for moving to cart
  const [selectedProductForCart, setSelectedProductForCart] = useState<Product | null>(null);
  const [chosenSize, setChosenSize] = useState<ProductSize | null>(null);
  const [chosenColorIndex, setChosenColorIndex] = useState(0);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getWishlistProducts().then((items) => {
      if (isMounted) {
        setProducts(items);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [wishlistIds]);

  const handleOpenMoveToCart = (prod: Product) => {
    setSelectedProductForCart(prod);
    setChosenSize(null);
    setChosenColorIndex(0);
    setSizeError(false);
  };

  const handleConfirmMoveToCart = async () => {
    if (!selectedProductForCart) return;

    if (!chosenSize) {
      setSizeError(true);
      return;
    }

    const color = selectedProductForCart.colors[chosenColorIndex]?.name || selectedProductForCart.colors[0]?.name;
    const colorHex = selectedProductForCart.colors[chosenColorIndex]?.hex;

    // Add to cart
    await addItem({
      productId: selectedProductForCart.id,
      productSlug: selectedProductForCart.slug,
      name: selectedProductForCart.name,
      collection: selectedProductForCart.collection,
      price: selectedProductForCart.price,
      size: chosenSize,
      color,
      colorHex,
      quantity: 1,
      image: selectedProductForCart.images[0] || '',
      placeholderBg: selectedProductForCart.placeholderBg,
    });

    // Remove from wishlist
    await toggleWishlist(selectedProductForCart.id);

    // Close modal & open drawer
    setSelectedProductForCart(null);
    openCartDrawer();
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="text-xs font-mono text-[#111111]/70 mb-4">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-[#111111]">Wishlist</span>
      </nav>

      <div className="flex items-baseline justify-between pb-4 border-b-2 border-[#111111] mb-8">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl text-[#111111]">
            Saved Garments
          </h1>
          <p className="text-xs text-[#111111]/70 font-mono mt-1">
            Personal archive of items saved for consideration. Move items directly to your shopping bag.
          </p>
        </div>
        <p className="text-xs font-mono text-[#111111]/70">
          {products.length} {products.length === 1 ? 'Garment' : 'Garments'}
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center font-mono text-xs text-[#111111]">
          Loading saved garments...
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border-2 border-[#111111] bg-[#FAEDCD] flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* 4:5 Image */}
                <div className="relative overflow-hidden aspect-[4/5] bg-[#E9EDC9]">
                  <Link to={`/product/${product.slug}`} className="block w-full h-full">
                    <Img
                      src={product.images[0]}
                      alt={product.name}
                      aspectRatio="4:5"
                      size={500}
                      objectPosition="center 20%"
                      className="w-full h-full"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2 right-2 p-2 bg-[#FEFAE0] border border-[#111111] text-[#111111] hover:bg-[#FAEDCD]"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 space-y-1">
                  <p className="text-[10px] uppercase font-cta tracking-wider text-[#111111]/60">
                    {product.collection}
                  </p>
                  <h3 className="font-semibold text-sm text-[#111111] hover:underline">
                    <Link to={`/product/${product.slug}`}>{product.name}</Link>
                  </h3>
                  <p className="font-mono tabular-nums text-sm font-bold text-[#111111]">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>

              {/* Move to Cart Action Button */}
              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={() => handleOpenMoveToCart(product)}
                  className="w-full py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase border border-[#111111] hover:bg-[#333333] transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="border-2 border-[#111111] bg-[#FAEDCD] p-12 sm:p-16 text-center max-w-xl mx-auto space-y-4">
          <h2 className="font-display text-2xl sm:text-3xl text-[#111111]">
            Your wishlist is empty
          </h2>
          <p className="text-xs text-[#111111]/70 max-w-sm mx-auto">
            You haven't saved any garments yet. Click the heart icon on any product to curate your essentials.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors"
            >
              <span>Explore The Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* CHOOSE SIZE MODAL FOR MOVE TO CART */}
      {selectedProductForCart && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#111111]/60 flex items-center justify-center p-4"
        >
          <div className="bg-[#FEFAE0] border-2 border-[#111111] max-w-md w-full p-6 space-y-6">
            <div className="flex justify-between items-start pb-3 border-b border-[#111111]">
              <div>
                <p className="text-[10px] font-cta uppercase tracking-widest text-[#111111]/60">
                  Select Garment Specifications
                </p>
                <h3 className="font-display text-2xl text-[#111111]">
                  {selectedProductForCart.name}
                </h3>
                <p className="font-mono text-sm font-bold text-[#111111] mt-0.5">
                  {formatCurrency(selectedProductForCart.price)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductForCart(null)}
                className="p-1 hover:bg-[#FAEDCD] border border-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Color Selection */}
            {selectedProductForCart.colors.length > 1 && (
              <div>
                <label className="block text-xs font-cta uppercase mb-2">
                  Select Color: {selectedProductForCart.colors[chosenColorIndex]?.name}
                </label>
                <div className="flex gap-2">
                  {selectedProductForCart.colors.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setChosenColorIndex(i)}
                      className={`w-8 h-8 border-2 transition-transform ${
                        chosenColorIndex === i ? 'border-[#111111] scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-cta uppercase">
                  Select Size *
                </label>
                {chosenSize && <span className="font-mono text-xs font-bold">{chosenSize}</span>}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {selectedProductForCart.sizes.map((s) => {
                  const currentColorName = selectedProductForCart.colors[chosenColorIndex]?.name;
                  const variant = selectedProductForCart.variants.find(
                    (v) => v.size === s && (!currentColorName || v.color === currentColorName)
                  );
                  const isOutOfStock = variant ? variant.stock === 0 : false;

                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => {
                        setChosenSize(s);
                        setSizeError(false);
                      }}
                      className={`py-2.5 font-mono text-xs font-bold border transition-colors ${
                        isOutOfStock
                          ? 'opacity-30 cursor-not-allowed line-through bg-gray-200'
                          : chosenSize === s
                          ? 'bg-[#111111] text-[#FEFAE0] border-[#111111]'
                          : 'bg-[#FAEDCD] text-[#111111] border-[#111111] hover:bg-[#E9EDC9]'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              {sizeError && (
                <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-300 p-2 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Please choose a size to move this garment to your bag.</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-3 border-t border-[#111111]">
              <button
                type="button"
                onClick={() => setSelectedProductForCart(null)}
                className="flex-1 py-3 border border-[#111111] bg-[#FAEDCD] font-cta text-xs uppercase hover:bg-[#E9EDC9]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMoveToCart}
                className="flex-1 py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase border border-[#111111] hover:bg-[#333333]"
              >
                Add & Open Bag
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
