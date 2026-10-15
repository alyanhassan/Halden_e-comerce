import { Product } from '../types';
import { getProductById } from './productService';

const WISHLIST_STORAGE_KEY = 'halden_wishlist_ids';

function readWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeWishlist(ids: string[]): void {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export async function getWishlist(): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  return readWishlist();
}

export async function addToWishlist(productId: string): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  const current = readWishlist();
  if (!current.includes(productId)) {
    const updated = [...current, productId];
    writeWishlist(updated);
    return updated;
  }
  return current;
}

export async function removeFromWishlist(productId: string): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  const current = readWishlist();
  const updated = current.filter((id) => id !== productId);
  writeWishlist(updated);
  return updated;
}

export async function toggleWishlist(
  productId: string
): Promise<{ inWishlist: boolean; ids: string[] }> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  const current = readWishlist();
  const exists = current.includes(productId);
  let updated: string[];

  if (exists) {
    updated = current.filter((id) => id !== productId);
  } else {
    updated = [...current, productId];
  }

  writeWishlist(updated);
  return {
    inWishlist: !exists,
    ids: updated,
  };
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const current = readWishlist();
  return current.includes(productId);
}

export async function getWishlistProducts(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const ids = readWishlist();
  const products: Product[] = [];
  for (const id of ids) {
    const p = await getProductById(id);
    if (p) products.push(p);
  }
  return products;
}
