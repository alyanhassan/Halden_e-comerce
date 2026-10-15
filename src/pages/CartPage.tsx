import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, Tag, ArrowLeft, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { Img } from '../components/common/Img';
import { getProductById } from '../services/productService';
import { DeliveryMethod } from '../types';
import { usePageMeta } from '../hooks/usePageMeta';

export const CartPage: React.FC = () => {
  usePageMeta({
    title: 'Shopping Bag',
    description: 'Review garments currently in your Halden shopping bag.',
  });

  const {
    cart,
    updateItemQuantity,
    removeItem,
    moveToWishlist,
    changeDeliveryMethod,
    applyPromo,
    removePromo,
  } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [itemStockMap, setItemStockMap] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  // Load variant stocks for cart items
  useEffect(() => {
    let isMounted = true;
    const fetchStocks = async () => {
      const stocks: Record<string, number> = {};
      for (const item of cart.items) {
        const prod = await getProductById(item.productId);
        const variant = prod?.variants.find(
          (v) => v.size === item.size && v.color.toLowerCase() === item.color.toLowerCase()
        );
        stocks[item.id] = variant ? variant.stock : 99;
      }
      if (isMounted) {
        setItemStockMap(stocks);
      }
    };
    fetchStocks();
    return () => {
      isMounted = false;
    };
  }, [cart.items]);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = await applyPromo(promoInput);
    if (res.success) {
      setPromoMessage({ text: res.message, isError: false });
      setPromoInput('');
    } else {
      setPromoMessage({ text: res.message, isError: true });
    }
  };

  const percentToFreeShipping = Math.min(
    100,
    Math.round(((cart.subtotal - cart.discount) / cart.freeShippingThreshold) * 100)
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav className="text-xs font-mono text-[#111111]/70 mb-4">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-[#111111]">Shopping Bag</span>
      </nav>

      <div className="flex items-baseline justify-between pb-4 border-b-2 border-[#111111] mb-8">
        <h1 className="font-display text-4xl sm:text-5xl text-[#111111]">
          Your Shopping Bag
        </h1>
        <p className="text-xs font-mono text-[#111111]/70">
          {cart.items.reduce((s, i) => s + i.quantity, 0)} Items
        </p>
      </div>

      {cart.items.length === 0 ? (
        <div className="border-2 border-[#111111] bg-[#FAEDCD] p-12 sm:p-20 text-center max-w-2xl mx-auto space-y-4">
          <h2 className="font-display text-3xl text-[#111111]">Your bag is empty</h2>
          <p className="text-xs text-[#111111]/80 max-w-sm mx-auto">
            You have not added any garments to your bag yet. Explore our collection of heavy cottons and wool trousers.
          </p>
          <div className="pt-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Items Table (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Free Shipping Alert Banner */}
            <div className="bg-[#CCD5AE] border border-[#111111] p-4 text-[#111111]">
              <div className="flex justify-between items-center text-xs font-cta uppercase mb-2">
                <span>
                  {cart.qualifiesForFreeShipping
                    ? 'Free Standard Shipping Unlocked ($120+ order)'
                    : `Add ${formatCurrency(cart.amountNeededForFreeShipping)} more to unlock Free Standard Shipping`}
                </span>
                <span className="font-mono">{percentToFreeShipping}%</span>
              </div>
              <div className="w-full h-2.5 bg-[#FEFAE0] border border-[#111111]">
                <div
                  className="h-full bg-[#111111] transition-all duration-300"
                  style={{ width: `${percentToFreeShipping}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="border border-[#111111] bg-[#FAEDCD] divide-y divide-[#111111]">
              {cart.items.map((item) => {
                const maxStock = itemStockMap[item.id] ?? 99;
                const isMaxReached = item.quantity >= maxStock;

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
                  >
                    <div className="flex gap-4 items-center flex-1 min-w-0">
                      <div className="w-20 h-24 flex-shrink-0 overflow-hidden border border-[#111111]/30">
                        <Img
                          src={item.image}
                          alt={item.name}
                          aspectRatio="4:5"
                          size={500}
                          objectPosition="center 20%"
                          className="w-full h-full"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-widest text-[#111111]/60 font-cta">
                          {item.collection}
                        </p>
                        <h3 className="font-semibold text-base text-[#111111] hover:underline truncate">
                          <Link to={`/product/${item.productSlug}`}>{item.name}</Link>
                        </h3>
                        <p className="text-xs text-[#111111]/80 mt-1">
                          Size: <span className="font-mono font-bold">{item.size}</span> · Color: {item.color}
                        </p>
                        <p className="text-xs font-mono text-[#111111]/70 mt-0.5">
                          Unit price: {formatCurrency(item.price)}
                        </p>

                        {/* Secondary Actions: Move to Wishlist & Remove */}
                        <div className="flex items-center gap-4 mt-2">
                          <button
                            type="button"
                            onClick={() => moveToWishlist(item.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-cta uppercase hover:underline text-[#111111]/80 hover:text-[#111111]"
                          >
                            <Heart className="w-3.5 h-3.5" />
                            <span>Move to Wishlist</span>
                          </button>
                          <span className="text-[#111111]/30">·</span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-[11px] font-cta uppercase hover:underline text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper & Subtotal */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#111111]/20">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center border border-[#111111] bg-[#FEFAE0]">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-[#E9EDC9]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={isMaxReached}
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className={`p-2 transition-colors ${
                              isMaxReached
                                ? 'opacity-30 cursor-not-allowed bg-gray-200'
                                : 'hover:bg-[#E9EDC9]'
                            }`}
                            aria-label="Increase quantity"
                            title={isMaxReached ? `Maximum available stock reached (${maxStock})` : 'Add one more'}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {isMaxReached && (
                          <span className="text-[10px] text-amber-900 font-mono mt-1">
                            Max stock ({maxStock})
                          </span>
                        )}
                      </div>

                      <div className="text-right min-w-[70px]">
                        <p className="text-base font-mono tabular-nums font-bold text-[#111111]">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover:bg-[#E9EDC9] border border-[#111111] text-[#111111]"
                        aria-label={`Remove ${item.name}`}
                        title="Remove garment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-xs font-cta uppercase hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary (4 cols) */}
          <div className="lg:col-span-4 border-2 border-[#111111] bg-[#FAEDCD] p-6 space-y-6">
            <h2 className="font-display text-2xl text-[#111111] pb-3 border-b border-[#111111]">
              Order Summary
            </h2>

            {/* Promo Code Input */}
            <div>
              {cart.promoCode ? (
                <div className="flex items-center justify-between p-3 bg-[#CCD5AE] border border-[#111111] text-xs">
                  <div className="flex items-center gap-1.5 font-cta uppercase">
                    <Tag className="w-4 h-4" />
                    <span>{cart.promoCode} (-10%)</span>
                  </div>
                  <button
                    type="button"
                    onClick={removePromo}
                    className="underline text-xs font-cta hover:opacity-75"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo Code (HALDEN10)"
                      className="flex-1 px-3 py-2 bg-[#FEFAE0] border border-[#111111] text-xs font-mono uppercase focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333]"
                    >
                      Apply
                    </button>
                  </div>
                </form>
              )}
              {promoMessage && (
                <p
                  className={`text-[11px] mt-1.5 ${
                    promoMessage.isError ? 'text-red-700' : 'text-emerald-800'
                  }`}
                >
                  {promoMessage.text}
                </p>
              )}
            </div>

            {/* Delivery Method Estimate Selection */}
            <div className="space-y-2 border-t border-[#111111]/20 pt-4">
              <p className="text-xs font-cta uppercase text-[#111111]">
                Delivery Method Estimate
              </p>
              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between p-2.5 bg-[#FEFAE0] border border-[#111111] cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="delivery"
                      checked={cart.deliveryMethod === 'standard'}
                      onChange={() => changeDeliveryMethod('standard')}
                      className="accent-[#111111]"
                    />
                    <div>
                      <p className="font-semibold">Standard Shipping (3-5 days)</p>
                      <p className="text-[10px] text-[#111111]/70">
                        {cart.qualifiesForFreeShipping ? 'Free over $120' : '$8 flat rate'}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold">
                    {cart.qualifiesForFreeShipping ? 'FREE' : '$8'}
                  </span>
                </label>

                <label className="flex items-center justify-between p-2.5 bg-[#FEFAE0] border border-[#111111] cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="delivery"
                      checked={cart.deliveryMethod === 'express'}
                      onChange={() => changeDeliveryMethod('express')}
                      className="accent-[#111111]"
                    />
                    <div>
                      <p className="font-semibold">Express Courier (1-2 days)</p>
                      <p className="text-[10px] text-[#111111]/70">Priority dispatch & tracking</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold">$18</span>
                </label>
              </div>
            </div>

            {/* Pricing Breakdown (USD, No tax line) */}
            <div className="space-y-2 text-xs border-t border-[#111111]/20 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">{formatCurrency(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <span>Discount (HALDEN10 - 10%)</span>
                  <span className="font-mono tabular-nums">-{formatCurrency(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping ({cart.deliveryMethod === 'express' ? 'Express' : 'Standard'})</span>
                <span className="font-mono tabular-nums">
                  {cart.shipping === 0 ? 'FREE' : formatCurrency(cart.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-[#111111] border-t border-[#111111] pt-3">
                <span>Total</span>
                <span className="font-mono tabular-nums">{formatCurrency(cart.total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase border border-[#111111] hover:bg-[#333333] transition-colors flex items-center justify-center gap-2"
            >
              <span>Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="p-3 bg-[#E9EDC9] border border-[#111111] text-[11px] space-y-1">
              <p className="font-bold">Guaranteed Delivery Promise</p>
              <p className="text-[#111111]/80">
                All garments dispatched in 100% plastic-free packaging with prepaid 30-day return shipping.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
