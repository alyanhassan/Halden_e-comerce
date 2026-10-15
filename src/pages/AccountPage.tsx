import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  Key,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getOrdersByEmail } from '../services/orderService';
import { Address, Order } from '../types';
import { formatCurrency } from '../utils/currency';
import { WishlistPage } from './WishlistPage';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validateAddressLine,
  validateCity,
  validateState,
  validatePostalCode,
  validatePhone,
  sanitizeText,
} from '../lib/validators';
import { usePageMeta } from '../hooks/usePageMeta';

type AccountTab = 'orders' | 'wishlist' | 'addresses' | 'profile';

export const AccountPage: React.FC = () => {
  usePageMeta({
    title: 'Customer Account',
    description: 'Manage your Halden profile, saved delivery addresses, and past orders.',
  });

  const {
    user,
    loading: authLoading,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuth();

  const { addItem, openCartDrawer } = useCart();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState<AccountTab>('orders');

  // Auth form state (when logged out)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Field validation states for Auth
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [loginTouched, setLoginTouched] = useState<Record<string, boolean>>({});
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [signupTouched, setSignupTouched] = useState<Record<string, boolean>>({});

  const loginEmailRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);
  const signupNameRef = useRef<HTMLInputElement>(null);
  const signupEmailRef = useRef<HTMLInputElement>(null);
  const signupPasswordRef = useRef<HTMLInputElement>(null);
  const signupConfirmPasswordRef = useRef<HTMLInputElement>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Address modal/form state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
    fullName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [addressTouched, setAddressTouched] = useState<Record<string, boolean>>({});

  // Profile forms
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileTouched, setProfileTouched] = useState<Record<string, boolean>>({});

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [pwFeedback, setPwFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwTouched, setPwTouched] = useState<Record<string, boolean>>({});

  // Prefill profile when user loads
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      loadUserOrders(user.email);
    }
  }, [user]);

  const loadUserOrders = async (email: string) => {
    setOrdersLoading(true);
    const ords = await getOrdersByEmail(email);
    setOrders(ords);
    setOrdersLoading(false);
  };

  // Auth handlers with robust live-after-blur validation
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingAuth) return;
    setAuthError(null);

    const errs: Record<string, string> = {};
    const emailRes = validateEmail(loginEmail);
    if (!emailRes.isValid) errs.email = emailRes.error!;
    if (!loginPassword.trim()) errs.password = 'Password is required.';

    setLoginErrors(errs);
    setLoginTouched({ email: true, password: true });

    if (Object.keys(errs).length > 0) {
      if (errs.email) loginEmailRef.current?.focus();
      else if (errs.password) loginPasswordRef.current?.focus();
      return;
    }

    setIsSubmittingAuth(true);
    try {
      await login(emailRes.value, loginPassword);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingAuth) return;
    setAuthError(null);

    const errs: Record<string, string> = {};
    const nameRes = validateName(signupName, 'Full name');
    if (!nameRes.isValid) errs.name = nameRes.error!;

    const emailRes = validateEmail(signupEmail);
    if (!emailRes.isValid) errs.email = emailRes.error!;

    const pwRes = validatePassword(signupPassword);
    if (!pwRes.isValid) errs.password = pwRes.error!;

    const confirmRes = validateConfirmPassword(signupPassword, signupConfirmPassword);
    if (!confirmRes.isValid) errs.confirmPassword = confirmRes.error!;

    setSignupErrors(errs);
    setSignupTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (Object.keys(errs).length > 0) {
      if (errs.name) signupNameRef.current?.focus();
      else if (errs.email) signupEmailRef.current?.focus();
      else if (errs.password) signupPasswordRef.current?.focus();
      else if (errs.confirmPassword) signupConfirmPasswordRef.current?.focus();
      return;
    }

    setIsSubmittingAuth(true);
    try {
      await signup(nameRes.value, emailRes.value, signupPassword);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleQuickDemoFill = () => {
    setLoginEmail('julian@halden.com');
    setLoginPassword('password123');
    setLoginErrors({});
    setAuthError(null);
  };

  // Profile handlers
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);

    const errs: Record<string, string> = {};
    const nameRes = validateName(profileName, 'Full name');
    if (!nameRes.isValid) errs.name = nameRes.error!;

    const emailRes = validateEmail(profileEmail);
    if (!emailRes.isValid) errs.email = emailRes.error!;

    setProfileErrors(errs);
    setProfileTouched({ name: true, email: true });

    if (Object.keys(errs).length > 0) return;

    try {
      await updateProfile(nameRes.value, emailRes.value);
      setProfileFeedback('Profile information successfully saved.');
    } catch (err: unknown) {
      setProfileFeedback(err instanceof Error ? err.message : 'Error updating profile');
    }
  };

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwFeedback(null);

    const errs: Record<string, string> = {};
    if (!currentPw) errs.currentPw = 'Current password is required.';
    const pwRes = validatePassword(newPw);
    if (!pwRes.isValid) errs.newPw = pwRes.error!;

    const confirmPwRes = validateConfirmPassword(newPw, confirmNewPw);
    if (!confirmPwRes.isValid) errs.confirmNewPw = confirmPwRes.error!;

    setPwErrors(errs);
    setPwTouched({ currentPw: true, newPw: true, confirmNewPw: true });

    if (Object.keys(errs).length > 0) return;

    try {
      await changePassword(currentPw, newPw);
      setPwFeedback({ text: 'Password successfully changed.', isError: false });
      setCurrentPw('');
      setNewPw('');
      setConfirmNewPw('');
      setPwErrors({});
      setPwTouched({});
    } catch (err: unknown) {
      setPwFeedback({ text: err instanceof Error ? err.message : 'Failed to change password.', isError: true });
    }
  };

  // Address handlers
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: user?.name || '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      phone: '',
      isDefault: user ? user.addresses.length === 0 : true,
    });
    setAddressErrors({});
    setAddressTouched({});
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      fullName: addr.fullName,
      address: addr.address,
      apartment: addr.apartment || '',
      city: addr.city,
      state: addr.state || '',
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone || '',
      isDefault: addr.isDefault,
    });
    setAddressErrors({});
    setAddressTouched({});
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    const nameRes = validateName(addressForm.fullName, 'Recipient name');
    if (!nameRes.isValid) errs.fullName = nameRes.error!;

    const addrRes = validateAddressLine(addressForm.address, 'Street address');
    if (!addrRes.isValid) errs.address = addrRes.error!;

    const cityRes = validateCity(addressForm.city);
    if (!cityRes.isValid) errs.city = cityRes.error!;

    const stateRes = validateState(addressForm.state || '');
    if (!stateRes.isValid) errs.state = stateRes.error!;

    const postalRes = validatePostalCode(addressForm.postalCode, addressForm.country);
    if (!postalRes.isValid) errs.postalCode = postalRes.error!;

    if (addressForm.phone?.trim()) {
      const phoneRes = validatePhone(addressForm.phone);
      if (!phoneRes.isValid) errs.phone = phoneRes.error!;
    }

    setAddressErrors(errs);
    setAddressTouched({
      fullName: true,
      address: true,
      city: true,
      state: true,
      postalCode: true,
      phone: true,
    });

    if (Object.keys(errs).length > 0) return;

    const sanitizedAddress = {
      ...addressForm,
      fullName: nameRes.value,
      address: addrRes.value,
      apartment: addressForm.apartment ? sanitizeText(addressForm.apartment) : '',
      city: cityRes.value,
      state: stateRes.value,
      postalCode: postalRes.value,
      phone: addressForm.phone?.trim() ? sanitizeText(addressForm.phone) : '',
    };

    if (editingAddress) {
      await updateAddress({ ...sanitizedAddress, id: editingAddress.id });
    } else {
      await addAddress(sanitizedAddress);
    }
    setIsAddressModalOpen(false);
  };

  // "Buy Again" handler
  const handleBuyAgain = async (ord: Order) => {
    for (const item of ord.items) {
      await addItem({
        productId: item.productId,
        productSlug: item.name.toLowerCase().replace(/\s+/g, '-'),
        name: item.name,
        collection: 'hoodies',
        price: item.price,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        image: '',
      });
    }
    openCartDrawer();
  };

  if (authLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-24 text-center font-mono text-xs text-[#111111]">
        Verifying account authentication session...
      </div>
    );
  }

  // ==========================================
  // VIEW 1: AUTHENTICATION FORM (WHEN LOGGED OUT)
  // ==========================================
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="border-2 border-[#111111] bg-[#FAEDCD] p-6 sm:p-8 space-y-6">
          
          <div className="text-center pb-2 border-b border-[#111111]">
            <h1 className="font-display text-3xl sm:text-4xl text-[#111111]">
              Halden Account
            </h1>
            <p className="font-slogan italic text-xs text-[#111111]/80 mt-1">
              "Everyday, done properly."
            </p>
          </div>

          {/* Tab Switcher: Login / Register */}
          <div className="grid grid-cols-2 border border-[#111111] bg-[#FEFAE0]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
              className={`py-2.5 text-xs font-cta uppercase transition-colors ${
                authMode === 'login' ? 'bg-[#111111] text-[#FEFAE0]' : 'text-[#111111]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setAuthError(null);
              }}
              className={`py-2.5 text-xs font-cta uppercase transition-colors ${
                authMode === 'signup' ? 'bg-[#111111] text-[#FEFAE0]' : 'text-[#111111]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="p-3 bg-red-100 border border-red-800 text-red-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="login-email" className="block text-xs font-cta uppercase mb-1">
                  Email Address *
                </label>
                <input
                  ref={loginEmailRef}
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (loginTouched.email) {
                      const res = validateEmail(e.target.value);
                      setLoginErrors((p) => ({ ...p, email: res.isValid ? '' : res.error || '' }));
                    }
                  }}
                  onBlur={() => {
                    setLoginTouched((p) => ({ ...p, email: true }));
                    const res = validateEmail(loginEmail);
                    setLoginErrors((p) => ({ ...p, email: res.isValid ? '' : res.error || '' }));
                  }}
                  placeholder="julian@halden.com"
                  aria-required="true"
                  aria-invalid={loginErrors.email ? 'true' : 'false'}
                  aria-describedby={loginErrors.email ? 'login-email-error' : undefined}
                  className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                    loginErrors.email ? 'border-red-700' : 'border-[#111111]'
                  }`}
                />
                {loginErrors.email && (
                  <p id="login-email-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                    {loginErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-cta uppercase mb-1">
                  Password *
                </label>
                <input
                  ref={loginPasswordRef}
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (loginTouched.password) {
                      setLoginErrors((p) => ({ ...p, password: e.target.value.trim() ? '' : 'Password is required.' }));
                    }
                  }}
                  onBlur={() => {
                    setLoginTouched((p) => ({ ...p, password: true }));
                    setLoginErrors((p) => ({ ...p, password: loginPassword.trim() ? '' : 'Password is required.' }));
                  }}
                  placeholder="••••••••"
                  aria-required="true"
                  aria-invalid={loginErrors.password ? 'true' : 'false'}
                  aria-describedby={loginErrors.password ? 'login-pw-error' : undefined}
                  className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                    loginErrors.password ? 'border-red-700' : 'border-[#111111]'
                  }`}
                />
                {loginErrors.password && (
                  <p id="login-pw-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                    {loginErrors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full py-3.5 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingAuth ? 'Signing In...' : 'Sign In'}
              </button>

              {/* Demo Fill Helper Hint */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="text-[11px] underline font-mono text-[#111111]/80 hover:text-[#111111]"
                >
                  Quick Demo: Fill with julian@halden.com
                </button>
              </div>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="signup-name" className="block text-xs font-cta uppercase mb-1">
                  Full Name *
                </label>
                <input
                  ref={signupNameRef}
                  id="signup-name"
                  type="text"
                  value={signupName}
                  onChange={(e) => {
                    setSignupName(e.target.value);
                    if (signupTouched.name) {
                      const res = validateName(e.target.value, 'Full name');
                      setSignupErrors((p) => ({ ...p, name: res.isValid ? '' : res.error || '' }));
                    }
                  }}
                  onBlur={() => {
                    setSignupTouched((p) => ({ ...p, name: true }));
                    const res = validateName(signupName, 'Full name');
                    setSignupErrors((p) => ({ ...p, name: res.isValid ? '' : res.error || '' }));
                  }}
                  placeholder="Julian Vance"
                  aria-required="true"
                  aria-invalid={signupErrors.name ? 'true' : 'false'}
                  aria-describedby={signupErrors.name ? 'signup-name-error' : undefined}
                  className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                    signupErrors.name ? 'border-red-700' : 'border-[#111111]'
                  }`}
                />
                {signupErrors.name && (
                  <p id="signup-name-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                    {signupErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-xs font-cta uppercase mb-1">
                  Email Address *
                </label>
                <input
                  ref={signupEmailRef}
                  id="signup-email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    if (signupTouched.email) {
                      const res = validateEmail(e.target.value);
                      setSignupErrors((p) => ({ ...p, email: res.isValid ? '' : res.error || '' }));
                    }
                  }}
                  onBlur={() => {
                    setSignupTouched((p) => ({ ...p, email: true }));
                    const res = validateEmail(signupEmail);
                    setSignupErrors((p) => ({ ...p, email: res.isValid ? '' : res.error || '' }));
                  }}
                  placeholder="your.email@example.com"
                  aria-required="true"
                  aria-invalid={signupErrors.email ? 'true' : 'false'}
                  aria-describedby={signupErrors.email ? 'signup-email-error' : undefined}
                  className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                    signupErrors.email ? 'border-red-700' : 'border-[#111111]'
                  }`}
                />
                {signupErrors.email && (
                  <p id="signup-email-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                    {signupErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-xs font-cta uppercase mb-1">
                  Create Password *
                </label>
                <input
                  ref={signupPasswordRef}
                  id="signup-password"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => {
                    setSignupPassword(e.target.value);
                    if (signupTouched.password) {
                      const res = validatePassword(e.target.value);
                      setSignupErrors((p) => ({ ...p, password: res.isValid ? '' : res.error || '' }));
                    }
                  }}
                  onBlur={() => {
                    setSignupTouched((p) => ({ ...p, password: true }));
                    const res = validatePassword(signupPassword);
                    setSignupErrors((p) => ({ ...p, password: res.isValid ? '' : res.error || '' }));
                  }}
                  placeholder="Min 8 chars, with uppercase, lowercase, number"
                  aria-required="true"
                  aria-invalid={signupErrors.password ? 'true' : 'false'}
                  aria-describedby={signupErrors.password ? 'signup-pw-error' : 'signup-pw-hint'}
                  className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                    signupErrors.password ? 'border-red-700' : 'border-[#111111]'
                  }`}
                />
                {signupErrors.password ? (
                  <p id="signup-pw-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                    {signupErrors.password}
                  </p>
                ) : (
                  <p id="signup-pw-hint" className="text-[10px] text-[#111111]/60 font-mono mt-1">
                    At least 8 characters with upper, lower, and a number.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full py-3.5 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingAuth ? 'Creating Profile...' : 'Create Account'}
              </button>
            </form>
          )}

          <div className="p-3 bg-[#E9EDC9] border border-[#111111] text-[11px] text-[#111111]/80 leading-relaxed">
            <strong>Mock Auth Note:</strong> Client-side authentication stored in local state. Swappable with Supabase Auth or Firebase Auth in future database step.
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: LOGGED-IN ACCOUNT DASHBOARD
  // ==========================================
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 pb-6 border-b-2 border-[#111111] mb-8">
        <div>
          <span className="text-[10px] font-cta uppercase tracking-widest text-[#111111]/60">
            Customer Dashboard
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-[#111111]">
            Welcome, {user.name}
          </h1>
          <p className="text-xs font-mono text-[#111111]/80 mt-1">
            {user.email} · Member since {new Date(user.createdAt).getFullYear()}
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#111111] bg-[#FAEDCD] text-xs font-cta uppercase hover:bg-[#E9EDC9] w-fit"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Grid: Tabs Left, Content Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Tab Controls */}
        <aside className="lg:col-span-3 border border-[#111111] bg-[#FAEDCD] divide-y divide-[#111111]">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`w-full p-4 text-left text-xs font-cta uppercase flex items-center justify-between transition-colors ${
              activeTab === 'orders' ? 'bg-[#111111] text-[#FEFAE0]' : 'text-[#111111] hover:bg-[#E9EDC9]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>Orders & History</span>
            </div>
            <span className="font-mono text-[11px]">{orders.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`w-full p-4 text-left text-xs font-cta uppercase flex items-center justify-between transition-colors ${
              activeTab === 'wishlist' ? 'bg-[#111111] text-[#FEFAE0]' : 'text-[#111111] hover:bg-[#E9EDC9]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4" />
              <span>Saved Wishlist</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`w-full p-4 text-left text-xs font-cta uppercase flex items-center justify-between transition-colors ${
              activeTab === 'addresses' ? 'bg-[#111111] text-[#FEFAE0]' : 'text-[#111111] hover:bg-[#E9EDC9]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
            </div>
            <span className="font-mono text-[11px]">{user.addresses?.length || 0}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full p-4 text-left text-xs font-cta uppercase flex items-center justify-between transition-colors ${
              activeTab === 'profile' ? 'bg-[#111111] text-[#FEFAE0]' : 'text-[#111111] hover:bg-[#E9EDC9]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4" />
              <span>Profile & Password</span>
            </div>
          </button>
        </aside>

        {/* Right Column: Active Tab Content (9 cols) */}
        <main className="lg:col-span-9">
          
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-[#111111]">
                <h2 className="font-display text-2xl text-[#111111]">
                  Order History ({orders.length})
                </h2>
                <span className="text-xs font-mono text-[#111111]/70">
                  Guest orders matching {user.email} are linked
                </span>
              </div>

              {ordersLoading ? (
                <div className="py-12 text-center font-mono text-xs">
                  Loading order history...
                </div>
              ) : orders.length === 0 ? (
                <div className="border border-[#111111] bg-[#FAEDCD] p-10 text-center space-y-3">
                  <p className="font-display text-2xl text-[#111111]">No Orders Yet</p>
                  <p className="text-xs text-[#111111]/70 max-w-sm mx-auto">
                    Any orders placed under {user.email} will automatically appear in your ledger.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-block px-6 py-2.5 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => {
                    const isExpanded = expandedOrderId === ord.id;
                    return (
                      <div
                        key={ord.id}
                        className="border-2 border-[#111111] bg-[#FAEDCD] overflow-hidden"
                      >
                        {/* Order Header Row */}
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-[#FAEDCD]">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold font-mono text-sm">{ord.id}</span>
                              <span className="px-2 py-0.5 bg-[#111111] text-[#FEFAE0] font-cta text-[10px] uppercase">
                                {ord.status}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-[#111111]/70 mt-1">
                              Placed on {new Date(ord.createdAt).toLocaleDateString()} · {ord.items.length} garments
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-sm">
                              {formatCurrency(ord.total)}
                            </span>

                            <button
                              type="button"
                              onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                              className="px-3 py-1.5 border border-[#111111] bg-[#FEFAE0] text-xs font-cta uppercase hover:bg-[#E9EDC9]"
                            >
                              {isExpanded ? 'Hide Details' : 'View Details'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleBuyAgain(ord)}
                              className="px-3 py-1.5 border border-[#111111] bg-[#111111] text-[#FEFAE0] text-xs font-cta uppercase hover:bg-[#333333] flex items-center gap-1"
                              title="Re-add items to shopping bag"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Buy Again</span>
                            </button>
                          </div>
                        </div>

                        {/* Expanded Order Detail View */}
                        {isExpanded && (
                          <div className="border-t border-[#111111] p-4 sm:p-6 bg-[#FEFAE0] space-y-4">
                            <div className="divide-y divide-[#111111]/15 border border-[#111111] bg-[#FAEDCD]">
                              {ord.items.map((item, idx) => (
                                <div key={idx} className="p-3 flex justify-between items-center text-xs">
                                  <div>
                                    <p className="font-bold text-[#111111]">{item.name}</p>
                                    <p className="font-mono text-[#111111]/70 mt-0.5">
                                      Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                                    </p>
                                  </div>
                                  <p className="font-mono font-bold">
                                    {formatCurrency(item.price * item.quantity)}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                              <div className="text-xs text-[#111111]/80">
                                <strong>Shipped to:</strong> {ord.customer.address}, {ord.customer.city}
                              </div>
                              <Link
                                to={`/track?orderId=${ord.id}&email=${encodeURIComponent(ord.customer.email)}`}
                                className="inline-flex items-center gap-1.5 text-xs font-cta uppercase underline hover:opacity-75"
                              >
                                <span>Track Live Courier Timeline</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-[#111111] flex justify-between items-center">
                <h2 className="font-display text-2xl text-[#111111]">Saved Wishlist</h2>
                <Link to="/wishlist" className="text-xs font-cta uppercase underline">
                  Open Full Wishlist Page
                </Link>
              </div>
              <WishlistPage />
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-[#111111]">
                <h2 className="font-display text-2xl text-[#111111]">
                  Saved Addresses ({user.addresses?.length || 0})
                </h2>
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="px-4 py-2 border border-[#111111] bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase flex items-center gap-1.5 hover:bg-[#333333]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {(!user.addresses || user.addresses.length === 0) ? (
                <div className="border border-[#111111] bg-[#FAEDCD] p-8 text-center space-y-2">
                  <p className="font-display text-xl text-[#111111]">No Addresses Saved</p>
                  <p className="text-xs text-[#111111]/70">
                    Add a default shipping address to prefill during checkout.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="border-2 border-[#111111] bg-[#FAEDCD] p-4 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-sm text-[#111111]">{addr.fullName}</p>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 bg-[#CCD5AE] border border-[#111111] text-[10px] font-cta uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <p>{addr.address} {addr.apartment && `· ${addr.apartment}`}</p>
                        <p>{addr.city}, {addr.state || ''} {addr.postalCode}</p>
                        <p>{addr.country}</p>
                        {addr.phone && <p className="font-mono text-[11px] pt-1">Tel: {addr.phone}</p>}
                      </div>

                      <div className="pt-2 border-t border-[#111111]/20 flex items-center justify-between text-xs">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-[11px] font-cta uppercase underline hover:opacity-75"
                          >
                            Set as Default
                          </button>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="p-1 hover:bg-[#E9EDC9]"
                            title="Edit address"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAddress(addr.id)}
                            className="p-1 hover:bg-[#E9EDC9] text-red-800"
                            title="Delete address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE & PASSWORD */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              
              {/* Profile Details */}
              <div className="border border-[#111111] bg-[#FAEDCD] p-6 space-y-4">
                <h2 className="font-display text-2xl text-[#111111] pb-2 border-b border-[#111111]/20">
                  Profile Details
                </h2>

                {profileFeedback && (
                  <div className="p-3 bg-[#E9EDC9] border border-[#111111] text-xs">
                    {profileFeedback}
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-4" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="profile-name" className="block text-xs font-cta uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        id="profile-name"
                        type="text"
                        value={profileName}
                        onChange={(e) => {
                          setProfileName(e.target.value);
                          if (profileTouched.name) {
                            const res = validateName(e.target.value, 'Full name');
                            setProfileErrors((p) => ({ ...p, name: res.isValid ? '' : res.error || '' }));
                          }
                        }}
                        onBlur={() => {
                          setProfileTouched((p) => ({ ...p, name: true }));
                          const res = validateName(profileName, 'Full name');
                          setProfileErrors((p) => ({ ...p, name: res.isValid ? '' : res.error || '' }));
                        }}
                        aria-required="true"
                        aria-invalid={profileErrors.name ? 'true' : 'false'}
                        aria-describedby={profileErrors.name ? 'profile-name-error' : undefined}
                        className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                          profileErrors.name ? 'border-red-700' : 'border-[#111111]'
                        }`}
                      />
                      {profileErrors.name && (
                        <p id="profile-name-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                          {profileErrors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="profile-email" className="block text-xs font-cta uppercase mb-1">
                        Email Address *
                      </label>
                      <input
                        id="profile-email"
                        type="email"
                        value={profileEmail}
                        onChange={(e) => {
                          setProfileEmail(e.target.value);
                          if (profileTouched.email) {
                            const res = validateEmail(e.target.value);
                            setProfileErrors((p) => ({ ...p, email: res.isValid ? '' : res.error || '' }));
                          }
                        }}
                        onBlur={() => {
                          setProfileTouched((p) => ({ ...p, email: true }));
                          const res = validateEmail(profileEmail);
                          setProfileErrors((p) => ({ ...p, email: res.isValid ? '' : res.error || '' }));
                        }}
                        aria-required="true"
                        aria-invalid={profileErrors.email ? 'true' : 'false'}
                        aria-describedby={profileErrors.email ? 'profile-email-error' : undefined}
                        className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                          profileErrors.email ? 'border-red-700' : 'border-[#111111]'
                        }`}
                      />
                      {profileErrors.email && (
                        <p id="profile-email-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                          {profileErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              </div>

              {/* Password Change */}
              <div className="border border-[#111111] bg-[#FAEDCD] p-6 space-y-4">
                <h2 className="font-display text-2xl text-[#111111] pb-2 border-b border-[#111111]/20">
                  Update Security Password
                </h2>

                {pwFeedback && (
                  <div
                    className={`p-3 border text-xs ${
                      pwFeedback.isError
                        ? 'bg-red-100 border-red-800 text-red-900'
                        : 'bg-[#E9EDC9] border-[#111111] text-[#111111]'
                    }`}
                  >
                    {pwFeedback.text}
                  </div>
                )}

                <form onSubmit={handleChangePw} className="space-y-4 max-w-md" noValidate>
                  <div>
                    <label htmlFor="current-pw" className="block text-xs font-cta uppercase mb-1">
                      Current Password *
                    </label>
                    <input
                      id="current-pw"
                      type="password"
                      value={currentPw}
                      onChange={(e) => {
                        setCurrentPw(e.target.value);
                        if (pwTouched.currentPw) {
                          setPwErrors((p) => ({ ...p, currentPw: e.target.value ? '' : 'Current password is required.' }));
                        }
                      }}
                      onBlur={() => {
                        setPwTouched((p) => ({ ...p, currentPw: true }));
                        setPwErrors((p) => ({ ...p, currentPw: currentPw ? '' : 'Current password is required.' }));
                      }}
                      placeholder="••••••••"
                      aria-required="true"
                      aria-invalid={pwErrors.currentPw ? 'true' : 'false'}
                      aria-describedby={pwErrors.currentPw ? 'current-pw-error' : undefined}
                      className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                        pwErrors.currentPw ? 'border-red-700' : 'border-[#111111]'
                      }`}
                    />
                    {pwErrors.currentPw && (
                      <p id="current-pw-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                        {pwErrors.currentPw}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="new-pw" className="block text-xs font-cta uppercase mb-1">
                      New Password *
                    </label>
                    <input
                      id="new-pw"
                      type="password"
                      value={newPw}
                      onChange={(e) => {
                        setNewPw(e.target.value);
                        if (pwTouched.newPw) {
                          const res = validatePassword(e.target.value);
                          setPwErrors((p) => ({ ...p, newPw: res.isValid ? '' : res.error || '' }));
                        }
                      }}
                      onBlur={() => {
                        setPwTouched((p) => ({ ...p, newPw: true }));
                        const res = validatePassword(newPw);
                        setPwErrors((p) => ({ ...p, newPw: res.isValid ? '' : res.error || '' }));
                      }}
                      placeholder="Min 8 chars, uppercase, lowercase, number"
                      aria-required="true"
                      aria-invalid={pwErrors.newPw ? 'true' : 'false'}
                      aria-describedby={pwErrors.newPw ? 'new-pw-error' : 'new-pw-hint'}
                      className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                        pwErrors.newPw ? 'border-red-700' : 'border-[#111111]'
                      }`}
                    />
                    {pwErrors.newPw ? (
                      <p id="new-pw-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                        {pwErrors.newPw}
                      </p>
                    ) : (
                      <p id="new-pw-hint" className="text-[10px] text-[#111111]/60 font-mono mt-1">
                        Must be at least 8 characters with upper, lower, and a number.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors"
                  >
                    Update Password
                  </button>
                </form>
              </div>

            </div>
          )}

        </main>

      </div>

      {/* ADDRESS MODAL (ADD / EDIT) */}
      {isAddressModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#111111]/60 flex items-center justify-center p-4"
        >
          <div className="bg-[#FEFAE0] border-2 border-[#111111] max-w-lg w-full p-6 sm:p-8 space-y-4">
            <h3 className="font-display text-2xl text-[#111111]">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-cta uppercase mb-1">Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-cta uppercase mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-cta uppercase mb-1">Apartment / Suite</label>
                  <input
                    type="text"
                    value={addressForm.apartment}
                    onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-cta uppercase mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-cta uppercase mb-1">State / Province *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-cta uppercase mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAEDCD] border border-[#111111] text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="defaultAddressCheckbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="accent-[#111111]"
                />
                <label htmlFor="defaultAddressCheckbox" className="text-xs font-body cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#111111]">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 border border-[#111111] bg-[#FAEDCD] text-xs font-cta uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#111111] text-[#FEFAE0] text-xs font-cta uppercase"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
