import { INITIAL_PRODUCTS } from '../data/products';
import { CollectionType, Product, ProductFilters, ProductSize, SortOption } from '../types';

const PRODUCTS_STORAGE_KEY = 'halden_products_catalog';

// Initialize catalog in storage if not already seeded or update legacy placeholders
export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed: Product[] = JSON.parse(raw);
    // If any product has old 'placeholder:' strings, replace with INITIAL_PRODUCTS images
    let hasLegacyPlaceholder = false;
    const migrated = parsed.map((p) => {
      const isPlaceholder = p.images?.some((img) => img.startsWith('placeholder:') || !img.startsWith('http'));
      if (isPlaceholder) {
        hasLegacyPlaceholder = true;
        const fresh = INITIAL_PRODUCTS.find((item) => item.id === p.id);
        if (fresh) {
          return { ...p, images: fresh.images };
        }
      }
      return p;
    });

    if (hasLegacyPlaceholder) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }

    return parsed;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch {
    // ignore
  }
}

export async function getProducts(
  filters?: ProductFilters,
  sort: SortOption = 'featured'
): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 30));

  let items = [...getStoredProducts()];

  if (filters) {
    if (filters.collection && filters.collection !== 'all') {
      items = items.filter((p) => p.collection === filters.collection);
    }

    if (filters.sizes && filters.sizes.length > 0) {
      items = items.filter((p) =>
        filters.sizes.some((size) =>
          p.variants.some((v) => v.size === size && v.stock > 0)
        )
      );
    }

    if (filters.colors && filters.colors.length > 0) {
      items = items.filter((p) =>
        filters.colors.some((colorName) =>
          p.colors.some(
            (c) => c.name.toLowerCase() === colorName.toLowerCase()
          )
        )
      );
    }

    if (filters.minPrice !== undefined) {
      items = items.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      items = items.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.isNewOnly) {
      items = items.filter((p) => p.isNew);
    }
  }

  // Sorting
  switch (sort) {
    case 'newest':
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case 'price-asc':
      items.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      items.sort((a, b) => b.price - a.price);
      break;
    case 'featured':
    default:
      items.sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return a.name.localeCompare(b.name);
      });
      break;
  }

  return items;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const products = getStoredProducts();
  return products.find((p) => p.slug === slug) || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const products = getStoredProducts();
  return products.find((p) => p.id === id) || null;
}

export async function getNewArrivals(limit = 4): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const products = getStoredProducts();
  const sorted = [...products].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return sorted.slice(0, limit);
}

export async function getRelatedProducts(
  currentProductId: string,
  limit = 3
): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const products = getStoredProducts();
  const current = products.find((p) => p.id === currentProductId);
  if (!current) return products.slice(0, limit);

  const sameCollection = products.filter(
    (p) => p.collection === current.collection && p.id !== currentProductId
  );
  if (sameCollection.length >= limit) {
    return sameCollection.slice(0, limit);
  }

  const others = products.filter(
    (p) => p.collection !== current.collection && p.id !== currentProductId
  );
  return [...sameCollection, ...others].slice(0, limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  const products = getStoredProducts();

  return products.filter((p) => {
    return (
      p.name.toLowerCase().includes(q) ||
      p.collection.toLowerCase().includes(q) ||
      p.colors.some((c) => c.name.toLowerCase().includes(q)) ||
      p.description.toLowerCase().includes(q)
    );
  });
}

export async function getAvailableFilterOptions(collection?: CollectionType | 'all'): Promise<{
  sizes: ProductSize[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
}> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  let products = getStoredProducts();
  if (collection && collection !== 'all') {
    products = products.filter((p) => p.collection === collection);
  }

  const colorSet = new Set<string>();
  let min = 99999;
  let max = 0;

  products.forEach((p) => {
    p.colors.forEach((c) => colorSet.add(c.name));
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  });

  return {
    sizes: ['S', 'M', 'L', 'XL'],
    colors: Array.from(colorSet).sort(),
    minPrice: min === 99999 ? 0 : min,
    maxPrice: max === 0 ? 120 : max,
  };
}

// Check stock for a specific variant
export async function checkVariantStock(
  productId: string,
  size: ProductSize,
  color: string,
  requestedQty: number
): Promise<{ available: boolean; currentStock: number; message?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  const products = getStoredProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return { available: false, currentStock: 0, message: 'Garment not found in catalog' };
  }

  const variant = product.variants.find((v) => v.size === size && v.color.toLowerCase() === color.toLowerCase());
  if (!variant) {
    return { available: false, currentStock: 0, message: `Variant ${color} / ${size} unavailable` };
  }

  if (variant.stock < requestedQty) {
    return {
      available: false,
      currentStock: variant.stock,
      message: variant.stock === 0
        ? `"${product.name}" (${color}, ${size}) is now out of stock.`
        : `Only ${variant.stock} left of "${product.name}" (${color}, ${size}).`,
    };
  }

  return { available: true, currentStock: variant.stock };
}

// Decrement stock upon successful order creation
export async function decrementStock(
  items: { productId: string; size: ProductSize; color: string; quantity: number }[]
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  const products = getStoredProducts();

  items.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      const variant = product.variants.find(
        (v) => v.size === item.size && v.color.toLowerCase() === item.color.toLowerCase()
      );
      if (variant) {
        variant.stock = Math.max(0, variant.stock - item.quantity);
      }
    }
  });

  saveProducts(products);
}

// Admin product mutation functions
export async function updateProduct(product: Product): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  const products = getStoredProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index > -1) {
    products[index] = product;
    saveProducts(products);
    return product;
  }
  throw new Error(`Product ${product.id} not found`);
}

export async function addProduct(
  data: Omit<Product, 'id' | 'createdAt'>
): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  const products = getStoredProducts();
  const idPrefix = data.collection === 'hoodies' ? 'hd' : data.collection === 'shirts' ? 'sh' : data.collection === 'pants' ? 'pa' : 'tr';
  const newProduct: Product = {
    ...data,
    id: `hld-${idPrefix}-${Math.floor(10 + Math.random() * 90)}`,
    createdAt: new Date().toISOString(),
  };

  products.unshift(newProduct);
  saveProducts(products);
  return newProduct;
}

export async function deleteProduct(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  const products = getStoredProducts();
  const filtered = products.filter((p) => p.id !== id);
  saveProducts(filtered);
}

export async function updateVariantStock(
  productId: string,
  size: ProductSize,
  color: string,
  newStock: number
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const products = getStoredProducts();
  const product = products.find((p) => p.id === productId);
  if (product) {
    const variant = product.variants.find(
      (v) => v.size === size && v.color.toLowerCase() === color.toLowerCase()
    );
    if (variant) {
      variant.stock = Math.max(0, newStock);
      saveProducts(products);
    }
  }
}

export async function resetDemoProducts(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
}
