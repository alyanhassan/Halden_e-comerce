import { CartItem, DeliveryMethod } from '../types';

export const FREE_SHIPPING_THRESHOLD = 120;
export const STANDARD_SHIPPING_COST = 8;
export const EXPRESS_SHIPPING_COST = 18;

export interface PricingCalculationResult {
  subtotal: number;
  discount: number;
  netSubtotal: number;
  shipping: number;
  total: number;
  qualifiesForFreeShipping: boolean;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  promoCode: string | null;
  deliveryMethod: DeliveryMethod;
}

export function calculateOrderPricing(
  items: CartItem[] | { price: number; quantity: number }[],
  promoCode: string | null = null,
  deliveryMethod: DeliveryMethod = 'standard'
): PricingCalculationResult {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Promo code: HALDEN10 gives 10% off
  let discount = 0;
  if (promoCode && promoCode.trim().toUpperCase() === 'HALDEN10') {
    discount = Math.round(subtotal * 0.1);
  }

  const netSubtotal = Math.max(0, subtotal - discount);
  const qualifiesForFreeShipping = netSubtotal >= FREE_SHIPPING_THRESHOLD;

  let shipping = 0;
  if (items.length > 0) {
    if (deliveryMethod === 'express') {
      shipping = EXPRESS_SHIPPING_COST;
    } else {
      // Standard: free if netSubtotal >= 120, else $8
      shipping = qualifiesForFreeShipping ? 0 : STANDARD_SHIPPING_COST;
    }
  }

  const total = Math.max(0, netSubtotal + shipping);
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - netSubtotal);

  return {
    subtotal,
    discount,
    netSubtotal,
    shipping,
    total,
    qualifiesForFreeShipping,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountNeededForFreeShipping,
    promoCode: promoCode ? promoCode.trim().toUpperCase() : null,
    deliveryMethod,
  };
}
