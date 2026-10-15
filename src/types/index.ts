export type CollectionType = 'hoodies' | 'shirts' | 'pants' | 'trousers';

export type ProductSize = 'S' | 'M' | 'L' | 'XL';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Variant {
  size: ProductSize;
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  collection: CollectionType;
  price: number;
  colors: ProductColor[];
  sizes: ProductSize[];
  variants: Variant[];
  images: string[];
  placeholderBg?: string;
  description: string;
  materialsAndCare: {
    materials: string;
    care: string;
    origin?: string;
  };
  isNew: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  name: string;
  collection: CollectionType;
  price: number;
  size: ProductSize;
  color: string;
  colorHex?: string;
  quantity: number;
  image: string;
  placeholderBg?: string;
}

export type DeliveryMethod = 'standard' | 'express';
export type PaymentMethod = 'card' | 'cod';

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string | null;
  deliveryMethod: DeliveryMethod;
  qualifiesForFreeShipping: boolean;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  size: ProductSize;
  color: string;
  quantity: number;
}

export type OrderStatus =
  | 'Placed'
  | 'Processing'
  | 'Shipped'
  | 'Out for delivery'
  | 'Delivered';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone?: string;
  address: string;
  apartment?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface OrderPaymentDetails {
  brand?: string;
  last4?: string;
}

export interface Order {
  id: string; // format HLD-XXXXXX
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  paymentDetails?: OrderPaymentDetails;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode?: string;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
}

export interface Address {
  id: string;
  fullName: string;
  address: string;
  apartment?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  addresses: Address[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read';
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  productId: string | null; // null for general store reviews
  rating: number; // 1 - 5
  title: string;
  body: string;
  name: string;
  email: string; // private, never displayed publicly
  createdAt: string;
  status: ReviewStatus;
  featured: boolean;
  verifiedPurchase: boolean;
}

export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc';

export interface ProductFilters {
  collection?: CollectionType | 'all';
  sizes: ProductSize[];
  colors: string[];
  minPrice?: number;
  maxPrice?: number;
  isNewOnly?: boolean;
}
