import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { UIProvider } from './context/UIContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';

// Pages
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { WishlistPage } from './pages/WishlistPage';
import { AccountPage } from './pages/AccountPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { ShippingReturnsPage } from './pages/ShippingReturnsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage';
import { RefundPolicyPage } from './pages/RefundPolicyPage';
import { CookiesPage } from './pages/CookiesPage';
import { SizeGuidePage } from './pages/SizeGuidePage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <UIProvider>
              <ToastProvider>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    {/* 1. Home */}
                    <Route index element={<HomePage />} />

                    {/* 2. Shop Catalog & Collections */}
                    <Route path="shop" element={<CatalogPage />} />
                    <Route path="collections/:name" element={<CatalogPage />} />

                    {/* 3. Product Detail */}
                    <Route path="product/:slug" element={<ProductPage />} />

                    {/* 4. Cart & Checkout */}
                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="order/:id" element={<OrderConfirmationPage />} />
                    <Route path="track" element={<TrackOrderPage />} />

                    {/* 5. Wishlist */}
                    <Route path="wishlist" element={<WishlistPage />} />

                    {/* 6. Account & Authentication */}
                    <Route path="account" element={<AccountPage />} />

                    {/* 7. Editorial & Support Pages */}
                    <Route path="about" element={<AboutPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="faq" element={<FaqPage />} />
                    <Route path="shipping-returns" element={<ShippingReturnsPage />} />
                    <Route path="shipping-policy" element={<ShippingPolicyPage />} />
                    <Route path="refund-policy" element={<RefundPolicyPage />} />
                    <Route path="privacy" element={<PrivacyPolicyPage />} />
                    <Route path="terms" element={<TermsPage />} />
                    <Route path="cookies" element={<CookiesPage />} />
                    <Route path="size-guide" element={<SizeGuidePage />} />

                    {/* 8. Admin Portal */}
                    <Route path="admin" element={<AdminPage />} />

                    {/* 9. 404 Catch-All */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </ToastProvider>
            </UIProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
