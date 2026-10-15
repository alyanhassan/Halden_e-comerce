import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  BarChart3,
  Package,
  ShoppingBag,
  Mail,
  RotateCcw,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  X,
  Search,
  ExternalLink,
  Lock,
  LogOut,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import {
  addProduct,
  deleteProduct,
  getProducts,
  resetDemoProducts,
  updateProduct,
  updateVariantStock,
} from '../services/productService';
import { getAllOrders, updateOrderStatus } from '../services/orderService';
import { getContactMessages, markMessageAsRead } from '../services/contactService';
import {
  listAllReviews,
  setReviewStatus,
  setFeatured,
  deleteReview,
  resetDemoReviews,
} from '../services/reviewService';
import {
  CollectionType,
  ContactMessage,
  Order,
  OrderStatus,
  Product,
  ProductSize,
  ProductColor,
  Review,
  ReviewStatus,
} from '../types';
import { formatCurrency } from '../utils/currency';
import { sanitizeText, validateAdminProductForm } from '../lib/validators';
import { ADMIN_CREDENTIALS, ADMIN_AUTH_KEY } from '../config/admin';
import { usePageMeta } from '../hooks/usePageMeta';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'messages' | 'reviews';

export const AdminPage: React.FC = () => {
  usePageMeta({
    title: 'Store Administration',
    description: 'Halden internal administration console for inventory and dispatch.',
  });

  // Admin Login Session
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Products Filter & Search
  const [productSearch, setProductSearch] = useState('');
  const [productCollectionFilter, setProductCollectionFilter] = useState<string>('all');

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [reviewSearch, setReviewSearch] = useState('');

  // Product Add / Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormErrors, setProductFormErrors] = useState<Record<string, string>>({});
  const [productFormData, setProductFormData] = useState<{
    name: string;
    slug: string;
    collection: CollectionType;
    price: number | string;
    description: string;
    isNew: boolean;
    image1: string;
    image2: string;
    materials: string;
    care: string;
    origin: string;
    sizes: ProductSize[];
    colors: ProductColor[];
    initialStock: number | string;
  }>({
    name: '',
    slug: '',
    collection: 'hoodies',
    price: '88.00',
    description: '',
    isNew: true,
    image1: 'https://images.pexels.com/photos/7945745/pexels-photo-7945745.jpeg?auto=compress&cs=tinysrgb&w=1200',
    image2: 'https://images.pexels.com/photos/7945751/pexels-photo-7945751.jpeg?auto=compress&cs=tinysrgb&w=1200',
    materials: '100% GOTS Organic Cotton',
    care: 'Cold wash gentle, line dry',
    origin: 'Northern Portugal',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'Chalk', hex: '#EBE9DE' },
    ],
    initialStock: 5,
  });

  // Variant Stock Modal
  const [stockEditProduct, setStockEditProduct] = useState<Product | null>(null);

  // Order Detail Modal
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Check existing session
  useEffect(() => {
    const session = localStorage.getItem(ADMIN_AUTH_KEY);
    if (session === 'true') {
      setIsAdminLoggedIn(true);
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    const [prods, ords, msgs, revs] = await Promise.all([
      getProducts(undefined, 'newest'),
      getAllOrders(),
      getContactMessages(),
      listAllReviews(),
    ]);
    setProducts(prods);
    setOrders(ords);
    setMessages(msgs);
    setReviews(revs);
    setLoading(false);
  };

  const handleUseDemoCredentials = () => {
    setAdminEmail(ADMIN_CREDENTIALS.email);
    setAdminPassword(ADMIN_CREDENTIALS.password);
    setLoginError(null);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const emailInput = adminEmail.trim().toLowerCase();
    const passInput = adminPassword.trim();
    if (
      emailInput === ADMIN_CREDENTIALS.email.toLowerCase() &&
      passInput === ADMIN_CREDENTIALS.password
    ) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setIsAdminLoggedIn(true);
      setLoginError(null);
      loadAdminData();
    } else {
      setLoginError('Invalid administrator credentials. Please check your email and password.');
      // Keep typed email intact as requested
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAdminLoggedIn(false);
    setAdminPassword('');
  };

  const handleResetDemoData = async () => {
    if (window.confirm('Reset catalog and reviews to initial seed data? Custom edits will be restored to defaults.')) {
      await Promise.all([resetDemoProducts(), resetDemoReviews()]);
      await loadAdminData();
      setFeedbackNotice('Store catalog and review data have been reset to demo defaults.');
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  // Review actions
  const pendingReviewsCount = useMemo(
    () => reviews.filter((r) => r.status === 'pending').length,
    [reviews]
  );

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (reviewStatusFilter !== 'all' && r.status !== reviewStatusFilter) {
        return false;
      }
      if (reviewSearch.trim()) {
        const q = reviewSearch.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesBody = r.body.toLowerCase().includes(q);
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesEmail = r.email.toLowerCase().includes(q);
        const prod = r.productId ? products.find((p) => p.id === r.productId) : null;
        const matchesProd = prod ? prod.name.toLowerCase().includes(q) : false;
        return matchesTitle || matchesBody || matchesName || matchesEmail || matchesProd;
      }
      return true;
    });
  }, [reviews, reviewStatusFilter, reviewSearch, products]);

  const handleApproveReview = async (id: string) => {
    await setReviewStatus(id, 'approved');
    const updated = await listAllReviews();
    setReviews(updated);
    setFeedbackNotice('Review approved and published immediately.');
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleRejectReview = async (id: string) => {
    await setReviewStatus(id, 'rejected');
    const updated = await listAllReviews();
    setReviews(updated);
    setFeedbackNotice('Review rejected and removed from store display.');
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleDeleteReview = async (id: string) => {
    if (window.confirm('Permanently delete this review record? This action cannot be undone.')) {
      await deleteReview(id);
      const updated = await listAllReviews();
      setReviews(updated);
      setFeedbackNotice('Review permanently deleted.');
      setTimeout(() => setFeedbackNotice(null), 3000);
    }
  };

  const handleToggleFeaturedReview = async (id: string, currentFeatured: boolean) => {
    await setFeatured(id, !currentFeatured);
    const updated = await listAllReviews();
    setReviews(updated);
    setFeedbackNotice(
      !currentFeatured
        ? 'Review marked as featured on homepage.'
        : 'Review un-featured from homepage.'
    );
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  // Product CRUD
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductFormErrors({});
    setProductFormData({
      name: '',
      slug: '',
      collection: 'hoodies',
      price: '88.00',
      description: '',
      isNew: true,
      image1: 'https://images.pexels.com/photos/7945745/pexels-photo-7945745.jpeg?auto=compress&cs=tinysrgb&w=1200',
      image2: 'https://images.pexels.com/photos/7945751/pexels-photo-7945751.jpeg?auto=compress&cs=tinysrgb&w=1200',
      materials: '100% GOTS Organic Cotton',
      care: 'Cold wash gentle, line dry',
      origin: 'Northern Portugal',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Black', hex: '#111111' },
        { name: 'Chalk', hex: '#EBE9DE' },
      ],
      initialStock: 5,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductFormErrors({});
    setProductFormData({
      name: prod.name,
      slug: prod.slug,
      collection: prod.collection,
      price: prod.price.toFixed(2),
      description: prod.description,
      isNew: prod.isNew,
      image1: prod.images[0]?.startsWith('http')
        ? prod.images[0]
        : 'https://images.pexels.com/photos/7945745/pexels-photo-7945745.jpeg?auto=compress&cs=tinysrgb&w=1200',
      image2: prod.images[1]?.startsWith('http')
        ? prod.images[1]
        : 'https://images.pexels.com/photos/7945751/pexels-photo-7945751.jpeg?auto=compress&cs=tinysrgb&w=1200',
      materials: prod.materialsAndCare.materials,
      care: prod.materialsAndCare.care,
      origin: prod.materialsAndCare.origin || 'Northern Portugal',
      sizes: prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['S', 'M', 'L', 'XL'],
      colors: prod.colors && prod.colors.length > 0 ? prod.colors : [{ name: 'Black', hex: '#111111' }],
      initialStock: prod.variants?.[0]?.stock ?? 5,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const candidateSlug =
      productFormData.slug ||
      productFormData.name.toLowerCase().replace(/[^a-z0-9-]+/g, '-');

    const validation = validateAdminProductForm(
      {
        name: productFormData.name,
        slug: candidateSlug,
        price: productFormData.price,
        description: productFormData.description,
        image1: productFormData.image1,
        image2: productFormData.image2,
        sizes: productFormData.sizes,
        colors: productFormData.colors,
        stock: productFormData.initialStock,
      },
      products,
      editingProduct ? editingProduct.id : null
    );

    if (!validation.isValid) {
      setProductFormErrors(validation.errors);
      return;
    }

    setProductFormErrors({});
    const clean = validation.sanitized;
    const finalMaterials = sanitizeText(productFormData.materials) || '100% GOTS Organic Cotton';
    const finalCare = sanitizeText(productFormData.care) || 'Cold wash gentle, line dry';
    const finalOrigin = sanitizeText(productFormData.origin) || 'Northern Portugal';

    if (editingProduct) {
      const newVariants = clean.colors.flatMap((c: ProductColor) =>
        clean.sizes.map((s: ProductSize) => {
          const existing = editingProduct.variants.find((v) => v.color === c.name && v.size === s);
          return {
            color: c.name,
            size: s,
            stock: existing ? existing.stock : clean.stock,
          };
        })
      );

      const updated: Product = {
        ...editingProduct,
        name: clean.name,
        slug: clean.slug,
        collection: productFormData.collection,
        price: clean.price,
        description: clean.description,
        isNew: productFormData.isNew,
        colors: clean.colors,
        sizes: clean.sizes,
        variants: newVariants,
        images: [clean.image1, clean.image2].filter(Boolean),
        materialsAndCare: {
          materials: finalMaterials,
          care: finalCare,
          origin: finalOrigin,
        },
      };

      await updateProduct(updated);
      setFeedbackNotice(`Garment "${updated.name}" updated successfully.`);
    } else {
      const generatedVariants = clean.colors.flatMap((c: ProductColor) =>
        clean.sizes.map((s: ProductSize) => ({
          color: c.name,
          size: s,
          stock: clean.stock,
        }))
      );

      await addProduct({
        name: clean.name,
        slug: clean.slug,
        collection: productFormData.collection,
        price: clean.price,
        description: clean.description,
        isNew: productFormData.isNew,
        colors: clean.colors,
        sizes: clean.sizes,
        variants: generatedVariants,
        images: [clean.image1, clean.image2].filter(Boolean),
        materialsAndCare: {
          materials: finalMaterials,
          care: finalCare,
          origin: finalOrigin,
        },
      });

      setFeedbackNotice(`Garment "${clean.name}" added to catalog.`);
    }

    setIsProductModalOpen(false);
    await loadAdminData();
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" from store catalog?`)) {
      await deleteProduct(id);
      await loadAdminData();
      setFeedbackNotice(`Garment "${name}" removed.`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  const handleToggleIsNew = async (prod: Product) => {
    const updated = { ...prod, isNew: !prod.isNew };
    await updateProduct(updated);
    await loadAdminData();
  };

  const handleUpdateStock = async (
    productId: string,
    size: ProductSize,
    color: string,
    newStock: number
  ) => {
    await updateVariantStock(productId, size, color, newStock);
    await loadAdminData();
    if (stockEditProduct && stockEditProduct.id === productId) {
      const refreshed = await getProducts();
      setStockEditProduct(refreshed.find((p) => p.id === productId) || null);
    }
  };

  // Order status changes
  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus, `Status updated to ${newStatus} in admin console.`);
    await loadAdminData();
    setFeedbackNotice(`Order ${orderId} updated to "${newStatus}". Changes reflected on tracking page.`);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  // Messages
  const handleMarkMessageRead = async (id: string) => {
    await markMessageAsRead(id);
    await loadAdminData();
  };

  // Stats calculation
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStockVariantsCount = products.reduce((acc, p) => {
    return acc + p.variants.filter((v) => v.stock <= 3).length;
  }, 0);
  const unreadMessagesCount = messages.filter((m) => m.status === 'unread').length;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.collection.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCollection =
      productCollectionFilter === 'all' || p.collection === productCollectionFilter;
    return matchesSearch && matchesCollection;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status.toLowerCase() === orderStatusFilter.toLowerCase();
  });

  // ==========================================
  // VIEW 1: ADMIN LOGIN SCREEN
  // ==========================================
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="border-2 border-[#111111] bg-[#FAEDCD] p-6 sm:p-8 space-y-6">
          <div className="text-center pb-2 border-b border-[#111111]">
            <div className="w-12 h-12 bg-[#CCD5AE] border border-[#111111] mx-auto flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-[#111111]" />
            </div>
            <h1 className="font-display text-3xl text-[#111111]">
              Halden Console
            </h1>
            <p className="font-mono text-xs text-[#111111]/70 mt-1">
              Storefront Management & Inventory Control
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-100 border border-red-800 text-red-900 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-cta uppercase mb-1">
                Admin Username / Email
              </label>
              <input
                type="email"
                required
                autoComplete="off"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@halden.com"
                className="w-full px-3 py-2 bg-[#FEFAE0] border border-[#111111] text-xs focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-cta uppercase">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowAdminPassword((prev) => !prev)}
                  className="text-[10px] font-cta uppercase text-[#111111] hover:underline"
                >
                  {showAdminPassword ? 'Hide Password' : 'Show Password'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#FEFAE0] border border-[#111111] text-xs focus:outline-none pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword((prev) => !prev)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-[#FAEDCD] border border-[#111111] text-[10px] font-cta uppercase hover:bg-[#E9EDC9]"
                >
                  {showAdminPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors"
            >
              Sign In To Console
            </button>
          </form>

          {/* DEMO CREDENTIALS HINT */}
          <div className="p-3.5 bg-[#E9EDC9] border border-[#111111] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-cta uppercase text-[10px] text-[#111111]">
                Demo Administrator Credentials
              </p>
              <button
                type="button"
                onClick={handleUseDemoCredentials}
                className="px-2.5 py-1 bg-[#111111] text-[#FEFAE0] font-cta text-[10px] uppercase hover:bg-[#333333] transition-colors"
              >
                Use Demo Credentials
              </button>
            </div>
            <p className="font-mono text-[11px] text-[#111111]">
              Email: <strong>{ADMIN_CREDENTIALS.email}</strong>
            </p>
            <p className="font-mono text-[11px] text-[#111111]">
              Password: <strong>{ADMIN_CREDENTIALS.password}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED ADMIN CONSOLE
  // ==========================================
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 pb-4 border-b-2 border-[#111111]">
        <div>
          <span className="text-[10px] font-cta uppercase tracking-widest text-[#111111]/60">
            Halden Operations
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-[#111111]">
            Store Administration
          </h1>
          <p className="text-xs font-mono text-[#111111]/80 mt-1">
            Real-time catalog edits, variant inventory, and customer dispatch controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleResetDemoData}
            className="px-4 py-2 border border-[#111111] bg-[#FAEDCD] text-xs font-cta uppercase hover:bg-[#E9EDC9] flex items-center gap-1.5"
            title="Restore catalog to original seed products"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="button"
            onClick={handleAdminLogout}
            className="px-4 py-2 border border-[#111111] bg-[#111111] text-[#FEFAE0] text-xs font-cta uppercase hover:bg-[#333333] flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackNotice && (
        <div className="p-3 bg-[#E9EDC9] border-2 border-[#111111] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#111111]" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b-2 border-[#111111] overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Dashboard & Metrics', icon: BarChart3 },
          { id: 'products', label: `Products (${products.length})`, icon: Package },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'messages', label: `Inquiries (${messages.length})`, icon: Mail },
          {
            id: 'reviews',
            label: `Reviews (${reviews.length})`,
            icon: Star,
            badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-5 py-3 font-cta text-xs uppercase flex items-center gap-2 border-t-2 border-r-2 border-l-2 transition-colors whitespace-nowrap -mb-0.5 ${
                activeTab === tab.id
                  ? 'bg-[#111111] text-[#FEFAE0] border-[#111111]'
                  : 'bg-[#FAEDCD] text-[#111111] border-[#111111]/40 hover:bg-[#E9EDC9]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className="px-1.5 py-0.5 bg-amber-800 text-[#FEFAE0] text-[10px] font-mono font-bold leading-none"
                  title={`${tab.badge} pending review approval`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DASHBOARD METRICS */}
      {/* ======================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Key Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border-2 border-[#111111] bg-[#FAEDCD] p-5">
              <p className="text-[10px] font-cta uppercase text-[#111111]/60 tracking-wider">
                Total Orders Placed
              </p>
              <p className="font-display text-4xl text-[#111111] mt-2">
                {orders.length}
              </p>
              <p className="text-xs font-mono text-[#111111]/70 mt-1">
                Synced with client checkout
              </p>
            </div>

            <div className="border-2 border-[#111111] bg-[#CCD5AE] p-5">
              <p className="text-[10px] font-cta uppercase text-[#111111]/70 tracking-wider">
                Gross Demo Revenue
              </p>
              <p className="font-display text-4xl text-[#111111] mt-2 font-mono">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-xs font-mono text-[#111111]/70 mt-1">
                Subtotals after promo codes
              </p>
            </div>

            <div className="border-2 border-[#111111] bg-[#FAEDCD] p-5">
              <p className="text-[10px] font-cta uppercase text-[#111111]/60 tracking-wider">
                Low Stock Variants
              </p>
              <p className="font-display text-4xl text-amber-900 mt-2 font-mono">
                {lowStockVariantsCount}
              </p>
              <p className="text-xs font-mono text-[#111111]/70 mt-1">
                Variants with stock ≤ 3 units
              </p>
            </div>

            <div className="border-2 border-[#111111] bg-[#E9EDC9] p-5">
              <p className="text-[10px] font-cta uppercase text-[#111111]/60 tracking-wider">
                Client Inquiries
              </p>
              <p className="font-display text-4xl text-[#111111] mt-2 font-mono">
                {unreadMessagesCount} unread
              </p>
              <p className="text-xs font-mono text-[#111111]/70 mt-1">
                {messages.length} total received
              </p>
            </div>
          </div>

          {/* Recent Orders Snapshot */}
          <div className="border border-[#111111] bg-[#FAEDCD] p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#111111]/20">
              <h2 className="font-display text-2xl text-[#111111]">Recent Orders</h2>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="text-xs font-cta uppercase underline"
              >
                View All Orders →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#111111] font-cta uppercase text-[10px]">
                    <th className="py-2">Order ID</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Recipient</th>
                    <th className="py-2">Items</th>
                    <th className="py-2">Total</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/15 font-mono">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id}>
                      <td className="py-2.5 font-bold">{o.id}</td>
                      <td className="py-2.5">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-2.5 font-body">{o.customer.name}</td>
                      <td className="py-2.5">{o.items.length} garments</td>
                      <td className="py-2.5 font-bold">{formatCurrency(o.total)}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 bg-[#111111] text-[#FEFAE0] font-cta text-[10px] uppercase">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PRODUCTS TABLE & CRUD */}
      {/* ======================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Controls: Search, Filter, Add */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by title..."
                  className="w-full px-3 py-2 pl-9 bg-[#FAEDCD] border border-[#111111] text-xs focus:outline-none"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#111111]/60" />
              </div>

              <select
                value={productCollectionFilter}
                onChange={(e) => setProductCollectionFilter(e.target.value)}
                className="px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs focus:outline-none font-body capitalize"
              >
                <option value="all">All Categories</option>
                <option value="hoodies">Hoodies</option>
                <option value="shirts">Shirts</option>
                <option value="pants">Pants</option>
                <option value="trousers">Trousers</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="px-5 py-2.5 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-[#333333]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Garment</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="border border-[#111111] bg-[#FAEDCD] overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#E9EDC9] border-b border-[#111111] font-cta uppercase text-[10px]">
                  <th className="p-3">Garment</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">New Badge</th>
                  <th className="p-3">Stock Overview</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]/20 font-mono">
                {filteredProducts.map((p) => {
                  const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
                  return (
                    <tr key={p.id} className="hover:bg-[#FEFAE0] transition-colors">
                      <td className="p-3 font-body">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/product/${p.slug}`}
                            target="_blank"
                            className="font-bold hover:underline flex items-center gap-1"
                          >
                            <span>{p.name}</span>
                            <ExternalLink className="w-3 h-3 opacity-40" />
                          </Link>
                          <span className="text-[10px] text-[#111111]/60 font-mono">({p.id})</span>
                        </div>
                      </td>
                      <td className="p-3 capitalize">{p.collection}</td>
                      <td className="p-3 font-bold">{formatCurrency(p.price)}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleToggleIsNew(p)}
                          className={`px-2 py-0.5 text-[10px] font-cta uppercase border ${
                            p.isNew
                              ? 'bg-[#111111] text-[#FEFAE0] border-[#111111]'
                              : 'bg-transparent text-[#111111]/40 border-[#111111]/30'
                          }`}
                        >
                          {p.isNew ? 'New: YES' : 'New: NO'}
                        </button>
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => setStockEditProduct(p)}
                          className="px-2 py-1 bg-[#FEFAE0] border border-[#111111] text-[11px] hover:bg-[#E9EDC9] flex items-center gap-1.5"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>{totalStock} units across variants</span>
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 bg-[#FEFAE0] border border-[#111111] hover:bg-[#E9EDC9]"
                            title="Edit Garment"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 bg-[#FEFAE0] border border-[#111111] hover:bg-red-100 text-red-800"
                            title="Delete Garment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ORDERS TABLE & STATUS CHANGE */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 pb-2">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'placed', label: 'Placed' },
              { id: 'processing', label: 'Processing' },
              { id: 'shipped', label: 'Shipped' },
              { id: 'out for delivery', label: 'Out for Delivery' },
              { id: 'delivered', label: 'Delivered' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setOrderStatusFilter(f.id)}
                className={`px-3 py-1.5 text-xs font-cta uppercase border ${
                  orderStatusFilter === f.id
                    ? 'bg-[#111111] text-[#FEFAE0] border-[#111111]'
                    : 'bg-[#FAEDCD] text-[#111111] border-[#111111] hover:bg-[#E9EDC9]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="border border-[#111111] bg-[#FAEDCD] overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#E9EDC9] border-b border-[#111111] font-cta uppercase text-[10px]">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Delivery</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Change Status</th>
                  <th className="p-3 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]/20 font-mono">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FEFAE0] transition-colors">
                    <td className="p-3 font-bold">{ord.id}</td>
                    <td className="p-3">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 font-body">
                      <div>
                        <p className="font-semibold">{ord.customer.name}</p>
                        <p className="text-[10px] text-[#111111]/70">{ord.customer.email}</p>
                      </div>
                    </td>
                    <td className="p-3">{ord.items.length} items</td>
                    <td className="p-3 capitalize">{ord.deliveryMethod || 'Standard'}</td>
                    <td className="p-3 font-bold">{formatCurrency(ord.total)}</td>
                    <td className="p-3">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          handleOrderStatusChange(ord.id, e.target.value as OrderStatus)
                        }
                        className="px-2 py-1 bg-[#FEFAE0] border border-[#111111] text-xs font-cta uppercase focus:outline-none cursor-pointer"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for delivery">Out for delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setViewingOrder(ord)}
                        className="px-3 py-1 bg-[#FEFAE0] border border-[#111111] text-xs font-cta uppercase hover:bg-[#E9EDC9]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CONTACT MESSAGES */}
      {/* ======================================================== */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#111111]">
            <h2 className="font-display text-2xl text-[#111111]">
              Inquiries from Storefront ({messages.length})
            </h2>
          </div>

          <div className="border border-[#111111] bg-[#FAEDCD] divide-y divide-[#111111]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 sm:p-6 transition-colors ${
                  msg.status === 'unread' ? 'bg-[#FAEDCD]' : 'bg-[#FEFAE0]/70'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm font-body">{msg.name}</span>
                    <span className="font-mono text-xs text-[#111111]/70">({msg.email})</span>
                    {msg.status === 'unread' && (
                      <span className="px-2 py-0.5 bg-[#CCD5AE] border border-[#111111] text-[10px] font-cta uppercase">
                        New
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-[#111111]/60">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="font-cta text-xs uppercase text-[#111111] mb-1">
                  Subject: {msg.subject}
                </p>
                <p className="text-xs text-[#111111]/85 leading-relaxed font-body">
                  {msg.message}
                </p>

                {msg.status === 'unread' && (
                  <div className="mt-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleMarkMessageRead(msg.id)}
                      className="px-3 py-1 bg-[#111111] text-[#FEFAE0] font-cta text-[10px] uppercase hover:bg-[#333333]"
                    >
                      Mark As Read
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: REVIEWS MODERATION & RATINGS */}
      {/* ======================================================== */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl text-[#111111]">
                Customer Reviews Moderation
              </h2>
              <p className="text-xs font-mono text-[#111111]/70 mt-0.5">
                Approve, reject, delete, or feature customer garment reviews. Approved reviews publish immediately.
              </p>
            </div>

            {/* Filter by Status & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  placeholder="Search reviews..."
                  className="px-3 py-2 pl-8 bg-[#FAEDCD] border border-[#111111] text-xs font-mono focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#111111]/50" />
              </div>

              <div className="flex border border-[#111111] bg-[#FEFAE0]">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setReviewStatusFilter(st)}
                    className={`px-3 py-2 text-xs font-cta uppercase transition-colors ${
                      reviewStatusFilter === st
                        ? 'bg-[#111111] text-[#FEFAE0]'
                        : 'text-[#111111] hover:bg-[#FAEDCD]'
                    }`}
                  >
                    {st}
                    {st === 'pending' && pendingReviewsCount > 0 && (
                      <span className="ml-1.5 px-1 bg-amber-800 text-[#FEFAE0] text-[9px] font-mono">
                        {pendingReviewsCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Table */}
          <div className="border border-[#111111] bg-[#FAEDCD] overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#E9EDC9] border-b border-[#111111] font-cta uppercase text-[10px] text-[#111111]">
                  <th className="p-3 border-r border-[#111111]/30">Product</th>
                  <th className="p-3 border-r border-[#111111]/30">Rating</th>
                  <th className="p-3 border-r border-[#111111]/30">Review Title & Body</th>
                  <th className="p-3 border-r border-[#111111]/30">Reviewer</th>
                  <th className="p-3 border-r border-[#111111]/30">Date</th>
                  <th className="p-3 border-r border-[#111111]/30">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]/20 font-body">
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs font-mono text-[#111111]/60">
                      No reviews found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((rev) => {
                    const prod = rev.productId ? products.find((p) => p.id === rev.productId) : null;
                    return (
                      <tr key={rev.id} className="hover:bg-[#FEFAE0]/60 transition-colors">
                        <td className="p-3 border-r border-[#111111]/30 font-mono text-[11px] align-top max-w-[150px]">
                          {prod ? (
                            <Link
                              to={`/product/${prod.slug}`}
                              className="font-bold underline hover:text-black block truncate"
                              title={prod.name}
                            >
                              {prod.name}
                            </Link>
                          ) : (
                            <span className="text-[#111111]/70 italic">General Store</span>
                          )}
                          <span className="text-[10px] text-[#111111]/50 block">ID: {rev.productId || 'store'}</span>
                        </td>

                        <td className="p-3 border-r border-[#111111]/30 align-top whitespace-nowrap">
                          <div className="flex items-center gap-0.5" aria-label={`${rev.rating} stars`}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= rev.rating ? 'fill-[#111111] text-[#111111]' : 'text-[#111111]/20'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-mono font-bold text-[11px] mt-0.5 block">{rev.rating}/5</span>
                        </td>

                        <td className="p-3 border-r border-[#111111]/30 align-top max-w-xs space-y-1">
                          <p className="font-bold font-display text-sm text-[#111111]">{rev.title}</p>
                          <p className="text-[11px] text-[#111111]/85 leading-relaxed">{rev.body}</p>
                          {rev.featured && rev.status === 'approved' && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#111111] text-[#FEFAE0] font-cta text-[9px] uppercase tracking-wider">
                              Featured on Homepage
                            </span>
                          )}
                        </td>

                        <td className="p-3 border-r border-[#111111]/30 align-top whitespace-nowrap">
                          <p className="font-bold text-xs">{rev.name}</p>
                          <p className="text-[10px] font-mono text-[#111111]/60">{rev.email}</p>
                          {rev.verifiedPurchase && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#CCD5AE] border border-[#111111] text-[#111111] text-[9px] font-bold font-mono">
                              Verified Buyer
                            </span>
                          )}
                        </td>

                        <td className="p-3 border-r border-[#111111]/30 align-top whitespace-nowrap font-mono text-[10px] text-[#111111]/70">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </td>

                        <td className="p-3 border-r border-[#111111]/30 align-top whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-cta uppercase border ${
                              rev.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-800'
                                : rev.status === 'rejected'
                                ? 'bg-red-100 text-red-900 border-red-800'
                                : 'bg-amber-100 text-amber-900 border-amber-800'
                            }`}
                          >
                            {rev.status}
                          </span>
                        </td>

                        <td className="p-3 align-top text-right whitespace-nowrap">
                          <div className="flex flex-col items-end gap-1.5">
                            {rev.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleApproveReview(rev.id)}
                                className="px-2.5 py-1 bg-emerald-800 text-[#FEFAE0] text-[10px] font-cta uppercase hover:bg-emerald-900 transition-colors"
                              >
                                Approve
                              </button>
                            )}

                            {rev.status === 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleToggleFeaturedReview(rev.id, rev.featured)}
                                className={`px-2 py-1 text-[10px] font-cta uppercase border transition-colors ${
                                  rev.featured
                                    ? 'bg-[#111111] text-[#FEFAE0] border-[#111111]'
                                    : 'bg-[#FAEDCD] text-[#111111] border-[#111111] hover:bg-[#E9EDC9]'
                                }`}
                              >
                                {rev.featured ? 'Unfeature' : 'Feature on Homepage'}
                              </button>
                            )}

                            {rev.status !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleRejectReview(rev.id)}
                                className="px-2.5 py-1 bg-amber-900 text-[#FEFAE0] text-[10px] font-cta uppercase hover:bg-amber-950 transition-colors"
                              >
                                Reject
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev.id)}
                              className="px-2 py-1 text-red-700 hover:text-red-900 text-[10px] font-cta uppercase underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {/* ======================================================== */}
      {isProductModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#111111]/60 flex items-center justify-center p-4"
        >
          <div className="bg-[#FEFAE0] border-2 border-[#111111] max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#111111]">
              <h3 className="font-display text-2xl text-[#111111]">
                {editingProduct ? 'Edit Garment Details' : 'Add New Garment to Catalog'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 hover:bg-[#FAEDCD] border border-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {Object.keys(productFormErrors).length > 0 && (
              <div className="p-3 bg-red-100 border border-red-800 text-xs text-red-900 space-y-1">
                <p className="font-bold font-cta uppercase text-[11px]">Validation Issues:</p>
                <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px]">
                  {Object.values(productFormErrors).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-cta uppercase">Garment Name *</label>
                  <span className="text-[10px] font-mono text-[#111111]/60">3-80 chars</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={productFormData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setProductFormData((prev) => ({
                      ...prev,
                      name: newName,
                      slug: editingProduct ? prev.slug : newName.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, ''),
                    }));
                  }}
                  className="w-full px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs"
                />
                {productFormErrors.name && (
                  <p className="text-[11px] font-mono text-red-700 mt-1">{productFormErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-cta uppercase mb-1">Unique Slug *</label>
                  <input
                    type="text"
                    required
                    value={productFormData.slug}
                    onChange={(e) => setProductFormData({ ...productFormData, slug: e.target.value })}
                    placeholder="e.g. heavyweight-fleece-hoodie"
                    className="w-full px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs font-mono"
                  />
                  {productFormErrors.slug && (
                    <p className="text-[11px] font-mono text-red-700 mt-1">{productFormErrors.slug}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-cta uppercase mb-1">Collection *</label>
                  <select
                    value={productFormData.collection}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        collection: e.target.value as CollectionType,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs capitalize"
                  >
                    <option value="hoodies">Hoodies</option>
                    <option value="shirts">Shirts</option>
                    <option value="pants">Pants</option>
                    <option value="trousers">Trousers</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-cta uppercase mb-1">Price (USD) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    value={productFormData.price}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, price: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs font-mono"
                  />
                  {productFormErrors.price && (
                    <p className="text-[11px] font-mono text-red-700 mt-1">{productFormErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-cta uppercase mb-1">Variant Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={productFormData.initialStock}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, initialStock: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs font-mono"
                  />
                  {productFormErrors.stock && (
                    <p className="text-[11px] font-mono text-red-700 mt-1">{productFormErrors.stock}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isNewCheck"
                    checked={productFormData.isNew}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, isNew: e.target.checked })
                    }
                    className="accent-[#111111]"
                  />
                  <label htmlFor="isNewCheck" className="text-xs font-cta uppercase cursor-pointer">
                    "New" Badge
                  </label>
                </div>
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="block text-xs font-cta uppercase mb-1">Garment Sizes * (At least one)</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['S', 'M', 'L', 'XL'] as ProductSize[]).map((sz) => {
                    const isChecked = productFormData.sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          const next = isChecked
                            ? productFormData.sizes.filter((s) => s !== sz)
                            : [...productFormData.sizes, sz];
                          setProductFormData({ ...productFormData, sizes: next });
                        }}
                        className={`py-2 border font-mono text-xs font-bold transition-colors ${
                          isChecked
                            ? 'bg-[#111111] text-[#FEFAE0] border-[#111111]'
                            : 'bg-[#FAEDCD] text-[#111111] border-[#111111]/40 hover:bg-[#E9EDC9]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
                {productFormErrors.sizes && (
                  <p className="text-[11px] font-mono text-red-700 mt-1">{productFormErrors.sizes}</p>
                )}
              </div>

              {/* Colors Selection */}
              <div>
                <label className="block text-xs font-cta uppercase mb-1">Color Options * (At least one)</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Black', hex: '#111111' },
                    { name: 'Chalk', hex: '#EBE9DE' },
                    { name: 'Washed Olive', hex: '#707A58' },
                    { name: 'Oatmeal', hex: '#D7D0BC' },
                    { name: 'Charcoal', hex: '#2C2D30' },
                    { name: 'Navy', hex: '#1F2937' },
                  ].map((col) => {
                    const isSelected = productFormData.colors.some((c) => c.name === col.name);
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? productFormData.colors.filter((c) => c.name !== col.name)
                            : [...productFormData.colors, col];
                          setProductFormData({ ...productFormData, colors: next });
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors ${
                          isSelected
                            ? 'bg-[#FEFAE0] border-[#111111] font-bold ring-1 ring-[#111111]'
                            : 'bg-[#FAEDCD]/70 border-[#111111]/30 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 border border-[#111111]" style={{ backgroundColor: col.hex }} />
                        <span>{col.name}</span>
                      </button>
                    );
                  })}
                </div>
                {productFormErrors.colors && (
                  <p className="text-[11px] font-mono text-red-700 mt-1">{productFormErrors.colors}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-cta uppercase mb-1">Editorial Description *</label>
                <textarea
                  rows={3}
                  required
                  value={productFormData.description}
                  onChange={(e) =>
                    setProductFormData({ ...productFormData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs"
                />
                {productFormErrors.description && (
                  <p className="text-[11px] font-mono text-red-700 mt-1">{productFormErrors.description}</p>
                )}
              </div>

              {/* Image URLs & Live Previews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-cta uppercase mb-1">Image URL 1 (https) *</label>
                  <input
                    type="url"
                    required
                    value={productFormData.image1}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, image1: e.target.value })
                    }
                    placeholder="https://images.pexels.com/..."
                    className="w-full px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs font-mono"
                  />
                  {productFormErrors.image1 && (
                    <p className="text-[11px] font-mono text-red-700 mt-1">{productFormErrors.image1}</p>
                  )}
                  {productFormData.image1 && (
                    <div className="mt-2 flex items-center gap-2 p-1.5 bg-[#FEFAE0] border border-[#111111]/40">
                      <div className="w-10 h-12 bg-gray-200 border border-[#111111] overflow-hidden flex-shrink-0">
                        <img
                          src={productFormData.image1}
                          alt="Primary Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-[#111111]/70 truncate">
                        Preview: {productFormData.image1}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-cta uppercase mb-1">Image URL 2 (https)</label>
                  <input
                    type="url"
                    value={productFormData.image2}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, image2: e.target.value })
                    }
                    placeholder="https://images.pexels.com/..."
                    className="w-full px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs font-mono"
                  />
                  {productFormErrors.image2 && (
                    <p className="text-[11px] font-mono text-red-700 mt-1">{productFormErrors.image2}</p>
                  )}
                  {productFormData.image2 && (
                    <div className="mt-2 flex items-center gap-2 p-1.5 bg-[#FEFAE0] border border-[#111111]/40">
                      <div className="w-10 h-12 bg-gray-200 border border-[#111111] overflow-hidden flex-shrink-0">
                        <img
                          src={productFormData.image2}
                          alt="Secondary Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-[#111111]/70 truncate">
                        Preview: {productFormData.image2}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-cta uppercase mb-1">Fabric Composition</label>
                  <input
                    type="text"
                    value={productFormData.materials}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, materials: e.target.value })
                    }
                    className="w-full px-2 py-1.5 bg-[#FAEDCD] border border-[#111111] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-cta uppercase mb-1">Care Advice</label>
                  <input
                    type="text"
                    value={productFormData.care}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, care: e.target.value })
                    }
                    className="w-full px-2 py-1.5 bg-[#FAEDCD] border border-[#111111] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-cta uppercase mb-1">Mill Origin</label>
                  <input
                    type="text"
                    value={productFormData.origin}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, origin: e.target.value })
                    }
                    className="w-full px-2 py-1.5 bg-[#FAEDCD] border border-[#111111] text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#111111]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-[#111111] bg-[#FAEDCD] text-xs font-cta uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#111111] text-[#FEFAE0] text-xs font-cta uppercase hover:bg-[#333333]"
                >
                  Save Garment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: VARIANT STOCK ADJUSTER */}
      {/* ======================================================== */}
      {stockEditProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#111111]/60 flex items-center justify-center p-4"
        >
          <div className="bg-[#FEFAE0] border-2 border-[#111111] max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#111111]">
              <div>
                <h3 className="font-display text-2xl text-[#111111]">
                  Adjust Variant Stock
                </h3>
                <p className="text-xs font-mono text-[#111111]/70">{stockEditProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setStockEditProduct(null)}
                className="p-1 hover:bg-[#FAEDCD] border border-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {stockEditProduct.variants.map((v, i) => (
                <div
                  key={`${v.color}-${v.size}-${i}`}
                  className="p-3 bg-[#FAEDCD] border border-[#111111] flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <span className="font-bold">{v.color}</span> · Size {v.size}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-[#111111]/70 font-cta uppercase">
                      Stock:
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) =>
                        handleUpdateStock(
                          stockEditProduct.id,
                          v.size,
                          v.color,
                          Number(e.target.value)
                        )
                      }
                      className="w-16 px-2 py-1 bg-[#FEFAE0] border border-[#111111] text-xs font-mono text-center"
                    />
                    {v.stock <= 3 && (
                      <span className="text-[10px] text-amber-900 font-bold">
                        {v.stock === 0 ? 'Out' : 'Low'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setStockEditProduct(null)}
                className="px-6 py-2 bg-[#111111] text-[#FEFAE0] text-xs font-cta uppercase hover:bg-[#333333]"
              >
                Close & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ORDER DETAIL INSPECTOR */}
      {/* ======================================================== */}
      {viewingOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#111111]/60 flex items-center justify-center p-4"
        >
          <div className="bg-[#FEFAE0] border-2 border-[#111111] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start pb-3 border-b border-[#111111]">
              <div>
                <p className="text-[10px] font-cta uppercase tracking-widest text-[#111111]/60">
                  Order Inspector
                </p>
                <h3 className="font-display text-3xl text-[#111111]">
                  {viewingOrder.id}
                </h3>
                <p className="text-xs font-mono text-[#111111]/70">
                  Placed on {new Date(viewingOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="p-1 hover:bg-[#FAEDCD] border border-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Control */}
            <div className="p-3 bg-[#CCD5AE] border border-[#111111] flex items-center justify-between text-xs">
              <span className="font-cta uppercase text-[#111111]">Current Order Status:</span>
              <select
                value={viewingOrder.status}
                onChange={(e) => {
                  const newSt = e.target.value as OrderStatus;
                  handleOrderStatusChange(viewingOrder.id, newSt);
                  setViewingOrder({ ...viewingOrder, status: newSt });
                }}
                className="px-3 py-1 bg-[#FEFAE0] border border-[#111111] font-cta uppercase text-xs focus:outline-none cursor-pointer"
              >
                <option value="Placed">Placed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            {/* Items */}
            <div className="border border-[#111111] bg-[#FAEDCD] divide-y divide-[#111111]">
              {viewingOrder.items.map((item, idx) => (
                <div key={idx} className="p-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="font-mono text-[#111111]/70">
                      Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-mono font-bold text-sm">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Address & Totals */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-[#FAEDCD] border border-[#111111] space-y-1 font-body">
                <p className="font-cta uppercase text-[10px]">Recipient & Address</p>
                <p className="font-bold">{viewingOrder.customer.name}</p>
                <p>{viewingOrder.customer.email}</p>
                <p>{viewingOrder.customer.address}</p>
                <p>{viewingOrder.customer.city}, {viewingOrder.customer.postalCode}</p>
              </div>

              <div className="p-3 bg-[#FAEDCD] border border-[#111111] space-y-1">
                <p className="font-cta uppercase text-[10px]">Financials</p>
                <p>Subtotal: {formatCurrency(viewingOrder.subtotal)}</p>
                <p>Discount: -{formatCurrency(viewingOrder.discount)}</p>
                <p>Shipping: {formatCurrency(viewingOrder.shipping)}</p>
                <p className="font-bold text-sm border-t border-[#111111]/20 pt-1">
                  Total: {formatCurrency(viewingOrder.total)}
                </p>
              </div>
            </div>

            {/* Status History Log */}
            {viewingOrder.statusHistory && (
              <div className="p-3 bg-[#FEFAE0] border border-[#111111] space-y-1 text-xs font-mono">
                <p className="font-cta uppercase text-[10px] text-[#111111]/70">
                  Status History Trail
                </p>
                {viewingOrder.statusHistory.map((h, i) => (
                  <p key={i}>
                    • <strong>{h.status}:</strong> {h.note || 'Milestone recorded'} ({new Date(h.timestamp).toLocaleTimeString()})
                  </p>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Link
                to={`/track?orderId=${viewingOrder.id}&email=${encodeURIComponent(viewingOrder.customer.email)}`}
                target="_blank"
                className="px-4 py-2 border border-[#111111] bg-[#FAEDCD] text-xs font-cta uppercase flex items-center gap-1"
              >
                <span>Open Public Tracking Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-6 py-2 bg-[#111111] text-[#FEFAE0] text-xs font-cta uppercase hover:bg-[#333333]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
