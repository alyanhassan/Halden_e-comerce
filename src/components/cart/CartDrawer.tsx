import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, Check, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/currency';
import { Img } from '../common/Img';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    closeCartDrawer,
    updateItemQuantity,
    removeItem,
    applyPromo,
    removePromo,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    setPromoMessage(null);

    const result = await applyPromo(promoInput);
    setIsApplyingPromo(false);
    if (result.success) {
      setPromoMessage({ text: result.message, isError: false });
      setPromoInput('');
    } else {
      setPromoMessage({ text: result.message, isError: true });
    }
  };

  const handleRemovePromo = async () => {
    await removePromo();
    setPromoMessage(null);
  };

  const percentToFreeShipping = Math.min(
    100,
    Math.round((cart.subtotal / cart.freeShippingThreshold) * 100)
  );

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Cart Drawer"
          className="fixed inset-0 z-50 overflow-hidden"
        >
          {/* Backdrop with fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-[#111111]/60"
            onClick={closeCartDrawer}
            aria-hidden="true"
          />

          {/* Drawer Panel on Right */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { x: '100%' }}
              animate={{ x: 0, opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { x: '100%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-screen max-w-md bg-[#FEFAE0] border-l-2 border-[#111111] flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-[#111111] flex items-center justify-between bg-[#FAEDCD]">
            <div>
              <h2 className="font-display text-2xl text-[#111111]">Your Bag</h2>
              <p className="text-xs text-[#111111]/70 font-mono">
                {cart.items.reduce((s, i) => s + i.quantity, 0)} items
              </p>
            </div>
            <button
              type="button"
              onClick={closeCartDrawer}
              className="p-2 border border-[#111111] hover:bg-[#E9EDC9] text-[#111111] transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[#CCD5AE] px-4 sm:px-6 py-3 border-b border-[#111111] text-[#111111]">
            <div className="flex justify-between items-center text-xs font-cta uppercase mb-1.5">
              <span>
                {cart.qualifiesForFreeShipping
                  ? 'Free standard shipping unlocked!'
                  : `Add ${formatCurrency(cart.amountNeededForFreeShipping)} more for Free Shipping`}
              </span>
              <span className="font-mono text-[11px]">{percentToFreeShipping}%</span>
            </div>
            <div className="w-full h-2 bg-[#FEFAE0] border border-[#111111] overflow-hidden">
              <div
                className="h-full bg-[#111111] transition-all duration-300"
                style={{ width: `${percentToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item List / Empty State */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 border-2 border-[#111111] bg-[#FAEDCD] flex items-center justify-center mb-4">
                  <span className="font-display text-2xl text-[#111111]">0</span>
                </div>
                <h3 className="font-display text-2xl text-[#111111] mb-2">
                  Your bag is empty
                </h3>
                <p className="text-xs text-[#111111]/70 max-w-xs mb-6">
                  Quality garments made with purpose. Browse our collection of everyday basics.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/shop');
                  }}
                  className="px-6 py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase border border-[#111111] hover:bg-[#333333] transition-colors"
                >
                  Start Browsing
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-[#FAEDCD] border border-[#111111]"
                >
                  {/* Thumbnail */}
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

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          to={`/product/${item.productSlug}`}
                          onClick={closeCartDrawer}
                          className="font-semibold text-sm text-[#111111] hover:underline truncate pr-2"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[#111111]/60 hover:text-[#111111] p-1"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-[#111111]/70 mt-0.5">
                        Size: <span className="font-mono font-bold">{item.size}</span> · Color: {item.color}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#111111]/15">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#111111] bg-[#FEFAE0]">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#E9EDC9] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-[#E9EDC9] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <p className="text-sm font-mono tabular-nums text-[#111111] font-bold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Controls & Checkout */}
          {cart.items.length > 0 && (
            <div className="border-t-2 border-[#111111] bg-[#FEFAE0] p-4 sm:p-6 space-y-4">
              
              {/* Promo Code Box */}
              <div>
                {cart.promoCode ? (
                  <div className="flex items-center justify-between p-2.5 bg-[#CCD5AE] border border-[#111111] text-xs">
                    <div className="flex items-center gap-1.5 font-cta uppercase">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{cart.promoCode} (-10%)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="underline text-[11px] font-cta hover:opacity-75"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo Code (try HALDEN10)"
                      className="flex-1 px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs font-mono placeholder-[#111111]/50 uppercase focus:outline-none focus:bg-[#FEFAE0]"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingPromo}
                      className="px-4 py-2 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase border border-[#111111] hover:bg-[#333333] transition-colors whitespace-nowrap"
                    >
                      Apply
                    </button>
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

              {/* Price Calculation Rows */}
              <div className="space-y-1.5 text-xs border-t border-[#111111]/15 pt-3">
                <div className="flex justify-between text-[#111111]/80">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">{formatCurrency(cart.subtotal)}</span>
                </div>

                {cart.discount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>Discount (HALDEN10)</span>
                    <span className="font-mono tabular-nums">-{formatCurrency(cart.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#111111]/80">
                  <span>Shipping</span>
                  <span className="font-mono tabular-nums">
                    {cart.shipping === 0 ? 'FREE' : formatCurrency(cart.shipping)}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-[#111111] border-t border-[#111111] pt-2">
                  <span>Total</span>
                  <span className="font-mono tabular-nums">{formatCurrency(cart.total)}</span>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/cart"
                  onClick={closeCartDrawer}
                  className="py-3 px-4 text-center border-2 border-[#111111] bg-[#FAEDCD] text-[#111111] font-cta text-xs uppercase hover:bg-[#E9EDC9] transition-colors"
                >
                  View Cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={closeCartDrawer}
                  className="py-3 px-4 text-center border-2 border-[#111111] bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors flex items-center justify-center gap-1"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          )}

        </motion.div>
      </div>
    </div>
  )}
</AnimatePresence>
  );
};
