import { CartItem, CartSummary, DeliveryMethod } from '../types';
import { calculateOrderPricing, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from '../utils/pricing';
import { addToWishlist } from './wishlistService';
import { getProductById } from './productService';

const CART_STORAGE_KEY = 'halden_cart_items';
const PROMO_STORAGE_KEY = 'halden_active_promo';
const DELIVERY_METHOD_KEY = 'halden_delivery_method';

export { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST };

function readItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeItems(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function readPromo(): string | null {
  try {
    return localStorage.getItem(PROMO_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writePromo(code: string | null): void {
  try {
    if (code) {
      localStorage.setItem(PROMO_STORAGE_KEY, code);
    } else {
      localStorage.removeItem(PROMO_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

function readDeliveryMethod(): DeliveryMethod {
  try {
    const raw = localStorage.getItem(DELIVERY_METHOD_KEY);
    return raw === 'express' ? 'express' : 'standard';
  } catch {
    return 'standard';
  }
}

function writeDeliveryMethod(method: DeliveryMethod): void {
  try {
    localStorage.setItem(DELIVERY_METHOD_KEY, method);
  } catch {
    // ignore
  }
}

function computeSummary(
  items: CartItem[],
  promoCode: string | null,
  deliveryMethod: DeliveryMethod
): CartSummary {
  const pricing = calculateOrderPricing(items, promoCode, deliveryMethod);

  return {
    items,
    subtotal: pricing.subtotal,
    discount: pricing.discount,
    shipping: pricing.shipping,
    total: pricing.total,
    promoCode: pricing.promoCode,
    deliveryMethod,
    qualifiesForFreeShipping: pricing.qualifiesForFreeShipping,
    freeShippingThreshold: pricing.freeShippingThreshold,
    amountNeededForFreeShipping: pricing.amountNeededForFreeShipping,
  };
}

export async function getCart(): Promise<CartSummary> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  const items = readItems();
  const promo = readPromo();
  const delivery = readDeliveryMethod();
  return computeSummary(items, promo, delivery);
}

export async function setDeliveryMethod(method: DeliveryMethod): Promise<CartSummary> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  writeDeliveryMethod(method);
  return computeSummary(readItems(), readPromo(), method);
}

export async function addToCart(
  item: Omit<CartItem, 'id'>
): Promise<CartSummary> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const items = readItems();

  // Verify stock
  const product = await getProductById(item.productId);
  const variant = product?.variants.find(
    (v) => v.size === item.size && v.color.toLowerCase() === item.color.toLowerCase()
  );
  const maxStock = variant ? variant.stock : 999;

  // Find if identical item exists (same productId, size, color)
  const existingIndex = items.findIndex(
    (i) =>
      i.productId === item.productId &&
      i.size === item.size &&
      i.color === item.color
  );

  if (existingIndex > -1) {
    const desiredQty = items[existingIndex].quantity + item.quantity;
    items[existingIndex].quantity = Math.min(desiredQty, maxStock);
  } else {
    const newItem: CartItem = {
      ...item,
      quantity: Math.min(item.quantity, maxStock),
      id: `${item.productId}-${item.size}-${item.color}-${Date.now()}`,
    };
    items.push(newItem);
  }

  writeItems(items);
  return computeSummary(items, readPromo(), readDeliveryMethod());
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<CartSummary> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  let items = readItems();

  if (quantity <= 0) {
    items = items.filter((i) => i.id !== itemId);
  } else {
    const targetItem = items.find((i) => i.id === itemId);
    if (targetItem) {
      // Respect stock
      const product = await getProductById(targetItem.productId);
      const variant = product?.variants.find(
        (v) => v.size === targetItem.size && v.color.toLowerCase() === targetItem.color.toLowerCase()
      );
      const maxStock = variant ? variant.stock : 999;
      const finalQty = Math.min(quantity, maxStock);

      items = items.map((i) => (i.id === itemId ? { ...i, quantity: finalQty } : i));
    }
  }

  writeItems(items);
  return computeSummary(items, readPromo(), readDeliveryMethod());
}

export async function removeCartItem(itemId: string): Promise<CartSummary> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  const items = readItems().filter((i) => i.id !== itemId);
  writeItems(items);
  return computeSummary(items, readPromo(), readDeliveryMethod());
}

export async function moveItemToWishlist(itemId: string): Promise<CartSummary> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const items = readItems();
  const target = items.find((i) => i.id === itemId);
  if (target) {
    await addToWishlist(target.productId);
    const updated = items.filter((i) => i.id !== itemId);
    writeItems(updated);
    return computeSummary(updated, readPromo(), readDeliveryMethod());
  }
  return computeSummary(items, readPromo(), readDeliveryMethod());
}

export async function applyPromoCode(
  code: string
): Promise<{ success: boolean; message: string; summary: CartSummary }> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const trimmed = code.trim().toUpperCase();
  const items = readItems();
  const delivery = readDeliveryMethod();

  if (trimmed === 'HALDEN10') {
    writePromo(trimmed);
    const summary = computeSummary(items, trimmed, delivery);
    return {
      success: true,
      message: 'Code HALDEN10 applied: 10% discount on order',
      summary,
    };
  }

  return {
    success: false,
    message: 'Invalid promo code. Try HALDEN10 for 10% off.',
    summary: computeSummary(items, readPromo(), delivery),
  };
}

export async function removePromoCode(): Promise<CartSummary> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  writePromo(null);
  return computeSummary(readItems(), null, readDeliveryMethod());
}

export async function clearCart(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  writeItems([]);
  writePromo(null);
}
