import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, CreditCard, Banknote, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { formatCurrency } from '../utils/currency';
import { calculateOrderPricing, EXPRESS_SHIPPING_COST, STANDARD_SHIPPING_COST } from '../utils/pricing';
import { DeliveryMethod, PaymentMethod } from '../types';
import { Img } from '../components/common/Img';
import {
  validateEmail,
  validatePhone,
  formatPhoneAsYouType,
  validateName,
  validateAddressLine,
  validateCity,
  validateState,
  validatePostalCode,
  validateCardNumber,
  formatCardNumber,
  validateCardExpiry,
  formatCardExpiry,
  validateCardCvc,
  detectCardBrand,
  sanitizeText,
} from '../lib/validators';
import { usePageMeta } from '../hooks/usePageMeta';

export const CheckoutPage: React.FC = () => {
  usePageMeta({
    title: 'Checkout',
    description: 'Secure customer dispatch and payment details.',
  });

  const { cart, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Contact form
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Shipping address
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('United States');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Delivery & Payment methods
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(cart.deliveryMethod || 'standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Validation tracking: touched state & errors
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stockError, setStockError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field refs for focusing first invalid input on submit
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const postalCodeRef = useRef<HTMLInputElement>(null);
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const cardNameRef = useRef<HTMLInputElement>(null);
  const cardExpiryRef = useRef<HTMLInputElement>(null);
  const cardCvcRef = useRef<HTMLInputElement>(null);

  // Prefill for logged-in users with saved default address
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setFullName(user.name || '');

      const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      if (defaultAddr) {
        setFullName(defaultAddr.fullName || user.name);
        setAddress(defaultAddr.address || '');
        setApartment(defaultAddr.apartment || '');
        setCity(defaultAddr.city || '');
        setState(defaultAddr.state || '');
        setPostalCode(defaultAddr.postalCode || '');
        setCountry(defaultAddr.country || 'United States');
        if (defaultAddr.phone) setPhone(defaultAddr.phone);
      }
    }
  }, [user]);

  // Recalculate pricing with selected delivery method
  const pricing = calculateOrderPricing(cart.items, cart.promoCode, deliveryMethod);

  // Country code helper for phone & postal code
  const getCountryCode = (c: string): string => {
    const lower = c.toLowerCase();
    if (lower.includes('pakistan')) return 'PK';
    if (lower.includes('kingdom') || lower.includes('uk')) return 'GB';
    if (lower.includes('canada')) return 'CA';
    if (lower.includes('france')) return 'FR';
    if (lower.includes('germany')) return 'DE';
    if (lower.includes('portugal')) return 'PT';
    if (lower.includes('italy')) return 'IT';
    if (lower.includes('japan')) return 'JP';
    if (lower.includes('australia')) return 'AU';
    return 'US';
  };

  const validateField = (field: string, val: string) => {
    let err = '';
    const cCode = getCountryCode(country);

    if (field === 'email') {
      const res = validateEmail(val);
      if (!res.isValid) err = res.error || 'Invalid email address.';
    } else if (field === 'phone') {
      if (val.trim()) {
        const res = validatePhone(val, cCode);
        if (!res.isValid) err = res.error || 'Invalid phone number.';
      }
    } else if (field === 'fullName') {
      const res = validateName(val, 'Recipient name');
      if (!res.isValid) err = res.error || 'Invalid recipient name.';
    } else if (field === 'address') {
      const res = validateAddressLine(val, 'Street address');
      if (!res.isValid) err = res.error || 'Invalid street address.';
    } else if (field === 'city') {
      const res = validateCity(val);
      if (!res.isValid) err = res.error || 'Invalid city name.';
    } else if (field === 'state') {
      const res = validateState(val);
      if (!res.isValid) err = res.error || 'Invalid state/province.';
    } else if (field === 'postalCode') {
      const res = validatePostalCode(val, country);
      if (!res.isValid) err = res.error || 'Invalid postal code.';
    } else if (field === 'cardNumber' && paymentMethod === 'card') {
      const res = validateCardNumber(val);
      if (!res.isValid) err = res.error || 'Invalid card number.';
    } else if (field === 'cardName' && paymentMethod === 'card') {
      const res = validateName(val, 'Name on card');
      if (!res.isValid) err = res.error || 'Invalid name on card.';
    } else if (field === 'cardExpiry' && paymentMethod === 'card') {
      const res = validateCardExpiry(val);
      if (!res.isValid) err = res.error || 'Invalid expiration date.';
    } else if (field === 'cardCvc' && paymentMethod === 'card') {
      const brand = detectCardBrand(cardNumber);
      const res = validateCardCvc(val, brand);
      if (!res.isValid) err = res.error || 'Invalid security code.';
    }

    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });

    return !err;
  };

  const handleBlur = (field: string, val: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, val);
  };

  const handleInputChange = (field: string, val: string) => {
    if (field === 'email') setEmail(val);
    else if (field === 'phone') setPhone(formatPhoneAsYouType(val, getCountryCode(country)));
    else if (field === 'fullName') setFullName(val);
    else if (field === 'address') setAddress(val);
    else if (field === 'apartment') setApartment(val);
    else if (field === 'city') setCity(val);
    else if (field === 'state') setState(val);
    else if (field === 'postalCode') setPostalCode(val);
    else if (field === 'cardNumber') setCardNumber(formatCardNumber(val));
    else if (field === 'cardName') setCardName(val);
    else if (field === 'cardExpiry') setCardExpiry(formatCardExpiry(val));
    else if (field === 'cardCvc') setCardCvc(val.replace(/\D/g, '').slice(0, 4));

    if (touched[field]) {
      validateField(field, val);
    }
  };

  // Validate entire form & focus first error
  const validateAll = () => {
    const errs: Record<string, string> = {};
    const cCode = getCountryCode(country);

    const emailRes = validateEmail(email);
    if (!emailRes.isValid) errs.email = emailRes.error!;

    if (phone.trim()) {
      const phoneRes = validatePhone(phone, cCode);
      if (!phoneRes.isValid) errs.phone = phoneRes.error!;
    }

    const nameRes = validateName(fullName, 'Recipient name');
    if (!nameRes.isValid) errs.fullName = nameRes.error!;

    const addressRes = validateAddressLine(address, 'Street address');
    if (!addressRes.isValid) errs.address = addressRes.error!;

    const cityRes = validateCity(city);
    if (!cityRes.isValid) errs.city = cityRes.error!;

    const stateRes = validateState(state);
    if (!stateRes.isValid) errs.state = stateRes.error!;

    const postalRes = validatePostalCode(postalCode, country);
    if (!postalRes.isValid) errs.postalCode = postalRes.error!;

    if (paymentMethod === 'card') {
      const cardNumRes = validateCardNumber(cardNumber);
      if (!cardNumRes.isValid) errs.cardNumber = cardNumRes.error!;

      const cardNameRes = validateName(cardName, 'Name on card');
      if (!cardNameRes.isValid) errs.cardName = cardNameRes.error!;

      const cardExpRes = validateCardExpiry(cardExpiry);
      if (!cardExpRes.isValid) errs.cardExpiry = cardExpRes.error!;

      const brand = detectCardBrand(cardNumber);
      const cardCvcRes = validateCardCvc(cardCvc, brand);
      if (!cardCvcRes.isValid) errs.cardCvc = cardCvcRes.error!;
    }

    setErrors(errs);
    setTouched({
      email: true,
      phone: true,
      fullName: true,
      address: true,
      city: true,
      state: true,
      postalCode: true,
      cardNumber: true,
      cardName: true,
      cardExpiry: true,
      cardCvc: true,
    });

    if (Object.keys(errs).length > 0) {
      if (errs.email) emailRef.current?.focus();
      else if (errs.phone) phoneRef.current?.focus();
      else if (errs.fullName) fullNameRef.current?.focus();
      else if (errs.address) addressRef.current?.focus();
      else if (errs.city) cityRef.current?.focus();
      else if (errs.state) stateRef.current?.focus();
      else if (errs.postalCode) postalCodeRef.current?.focus();
      else if (errs.cardNumber) cardNumberRef.current?.focus();
      else if (errs.cardName) cardNameRef.current?.focus();
      else if (errs.cardExpiry) cardExpiryRef.current?.focus();
      else if (errs.cardCvc) cardCvcRef.current?.focus();
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submits
    setStockError(null);

    if (cart.items.length === 0) {
      navigate('/shop');
      return;
    }

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // If card payment, detect brand and last 4, NEVER store full card or CVC
      const cleanDigits = cardNumber.replace(/\D/g, '');
      const cardBrand = detectCardBrand(cleanDigits);
      const last4 = cleanDigits.slice(-4);

      const order = await createOrder({
        customer: {
          name: sanitizeText(fullName),
          email: email.trim().toLowerCase(),
          phone: phone.trim() ? sanitizeText(phone) : undefined,
          address: sanitizeText(address),
          apartment: apartment.trim() ? sanitizeText(apartment) : undefined,
          city: sanitizeText(city),
          state: sanitizeText(state),
          postalCode: postalCode.trim().toUpperCase(),
          country,
        },
        items: cart.items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
        })),
        deliveryMethod,
        paymentMethod,
        paymentDetails: paymentMethod === 'card' ? { brand: cardBrand, last4 } : undefined,
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        shipping: pricing.shipping,
        total: pricing.total,
        promoCode: cart.promoCode || undefined,
      });

      // Clear cart upon successful order creation
      await clear();
      navigate(`/order/${order.id}`);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'An error occurred during checkout.';
      setStockError(msg);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-display text-3xl text-[#111111]">Your bag is empty</h2>
        <p className="text-xs text-[#111111]/70">
          You need garments in your shopping bag before you can proceed to checkout.
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const detectedBrand = detectCardBrand(cardNumber);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-xs font-cta uppercase hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Shopping Bag</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b-2 border-[#111111] mb-8">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl text-[#111111]">
            Checkout
          </h1>
          <p className="text-xs font-mono text-[#111111]/70 mt-1">
            Complete your order. All orders ship in plastic-free packaging.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono bg-[#E9EDC9] px-3 py-1.5 border border-[#111111] w-fit">
          <Lock className="w-3.5 h-3.5" />
          <span>Encrypted Secure Checkout</span>
        </div>
      </div>

      {/* Stock Error Banner */}
      {stockError && (
        <div className="mb-8 p-4 bg-red-100 border-2 border-red-800 text-red-900 flex items-start gap-3" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-800" />
          <div>
            <p className="font-bold font-cta text-xs uppercase">Inventory Alert</p>
            <p className="text-xs mt-0.5">{stockError}</p>
            <p className="text-[11px] text-red-800/80 mt-1">
              Please review your cart to adjust variant quantities before placing order.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Stacked Sections (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handlePlaceOrder} className="space-y-8" noValidate>
            
            {/* SECTION 1: CONTACT */}
            <div className="border border-[#111111] bg-[#FAEDCD] p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#111111]/20">
                <h2 className="font-display text-xl text-[#111111]">
                  1. Contact Information
                </h2>
                {!user && (
                  <Link
                    to="/account"
                    className="text-[11px] font-cta uppercase underline hover:opacity-75"
                  >
                    Log In for Saved Details
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout-email" className="block text-xs font-cta uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    ref={emailRef}
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={(e) => handleBlur('email', e.target.value)}
                    placeholder="julian@example.com"
                    aria-required="true"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'checkout-email-error' : undefined}
                    className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                      errors.email ? 'border-red-700' : 'border-[#111111]'
                    }`}
                  />
                  {errors.email && (
                    <p id="checkout-email-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="checkout-phone" className="block text-xs font-cta uppercase mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    ref={phoneRef}
                    id="checkout-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onBlur={(e) => handleBlur('phone', e.target.value)}
                    placeholder={country === 'Pakistan' ? '0300 1234567' : '+1 (555) 000-0000'}
                    aria-invalid={errors.phone ? 'true' : 'false'}
                    aria-describedby={errors.phone ? 'checkout-phone-error' : 'checkout-phone-hint'}
                    className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                      errors.phone ? 'border-red-700' : 'border-[#111111]'
                    }`}
                  />
                  {errors.phone ? (
                    <p id="checkout-phone-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                      {errors.phone}
                    </p>
                  ) : (
                    <p id="checkout-phone-hint" className="text-[10px] text-[#111111]/60 mt-0.5">
                      For delivery courier SMS updates only.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: SHIPPING ADDRESS */}
            <div className="border border-[#111111] bg-[#FAEDCD] p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#111111]/20">
                <h2 className="font-display text-xl text-[#111111]">
                  2. Shipping Destination
                </h2>
                {user && user.addresses?.length > 0 && (
                  <span className="text-[11px] font-mono text-emerald-800">
                    ✓ Saved address prefilled
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="checkout-name" className="block text-xs font-cta uppercase mb-1">
                  Full Name *
                </label>
                <input
                  ref={fullNameRef}
                  id="checkout-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  onBlur={(e) => handleBlur('fullName', e.target.value)}
                  placeholder="Julian Vance"
                  aria-required="true"
                  aria-invalid={errors.fullName ? 'true' : 'false'}
                  aria-describedby={errors.fullName ? 'checkout-name-error' : undefined}
                  className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                    errors.fullName ? 'border-red-700' : 'border-[#111111]'
                  }`}
                />
                {errors.fullName && (
                  <p id="checkout-name-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="checkout-country" className="block text-xs font-cta uppercase mb-1">
                  Country *
                </label>
                <select
                  id="checkout-country"
                  value={country}
                  onChange={(e) => {
                    const nextCountry = e.target.value;
                    setCountry(nextCountry);
                    // Revalidate postal code if touched
                    if (touched.postalCode) {
                      validatePostalCode(postalCode, nextCountry);
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#FEFAE0] border border-[#111111] text-xs focus:outline-none font-body"
                >
                  <option value="United States">United States</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Italy">Italy</option>
                  <option value="Japan">Japan</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-address" className="block text-xs font-cta uppercase mb-1">
                    Street Address *
                  </label>
                  <input
                    ref={addressRef}
                    id="checkout-address"
                    type="text"
                    value={address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    onBlur={(e) => handleBlur('address', e.target.value)}
                    placeholder="148 Mercer Street"
                    aria-required="true"
                    aria-invalid={errors.address ? 'true' : 'false'}
                    aria-describedby={errors.address ? 'checkout-address-error' : undefined}
                    className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                      errors.address ? 'border-red-700' : 'border-[#111111]'
                    }`}
                  />
                  {errors.address && (
                    <p id="checkout-address-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                      {errors.address}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-apartment" className="block text-xs font-cta uppercase mb-1">
                    Apartment / Suite
                  </label>
                  <input
                    id="checkout-apartment"
                    type="text"
                    value={apartment}
                    onChange={(e) => handleInputChange('apartment', e.target.value)}
                    placeholder="Apt 4B"
                    className="w-full px-3 py-2 bg-[#FEFAE0] border border-[#111111] text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="checkout-city" className="block text-xs font-cta uppercase mb-1">
                    City *
                  </label>
                  <input
                    ref={cityRef}
                    id="checkout-city"
                    type="text"
                    value={city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    onBlur={(e) => handleBlur('city', e.target.value)}
                    placeholder="New York"
                    aria-required="true"
                    aria-invalid={errors.city ? 'true' : 'false'}
                    aria-describedby={errors.city ? 'checkout-city-error' : undefined}
                    className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                      errors.city ? 'border-red-700' : 'border-[#111111]'
                    }`}
                  />
                  {errors.city && (
                    <p id="checkout-city-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                      {errors.city}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-state" className="block text-xs font-cta uppercase mb-1">
                    State / Region *
                  </label>
                  <input
                    ref={stateRef}
                    id="checkout-state"
                    type="text"
                    value={state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    onBlur={(e) => handleBlur('state', e.target.value)}
                    placeholder="NY"
                    aria-required="true"
                    aria-invalid={errors.state ? 'true' : 'false'}
                    aria-describedby={errors.state ? 'checkout-state-error' : undefined}
                    className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                      errors.state ? 'border-red-700' : 'border-[#111111]'
                    }`}
                  />
                  {errors.state && (
                    <p id="checkout-state-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                      {errors.state}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-postal" className="block text-xs font-cta uppercase mb-1">
                    Postal Code *
                  </label>
                  <input
                    ref={postalCodeRef}
                    id="checkout-postal"
                    type="text"
                    value={postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    onBlur={(e) => handleBlur('postalCode', e.target.value)}
                    placeholder={country === 'Pakistan' ? '54000' : '10012'}
                    aria-required="true"
                    aria-invalid={errors.postalCode ? 'true' : 'false'}
                    aria-describedby={errors.postalCode ? 'checkout-postal-error' : undefined}
                    className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none font-mono transition-colors ${
                      errors.postalCode ? 'border-red-700' : 'border-[#111111]'
                    }`}
                  />
                  {errors.postalCode && (
                    <p id="checkout-postal-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                      {errors.postalCode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: DELIVERY METHOD */}
            <div className="border border-[#111111] bg-[#FAEDCD] p-6 space-y-4">
              <h2 className="font-display text-xl text-[#111111] pb-2 border-b border-[#111111]/20">
                3. Delivery Method
              </h2>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 bg-[#FEFAE0] border border-[#111111] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="checkoutDelivery"
                      checked={deliveryMethod === 'standard'}
                      onChange={() => setDeliveryMethod('standard')}
                      className="accent-[#111111]"
                    />
                    <div>
                      <p className="font-semibold text-xs">Standard Carbon-Neutral Delivery</p>
                      <p className="text-[11px] text-[#111111]/70">
                        Estimated arrival: 3–5 business days via regional postal courier.
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold">
                    {pricing.qualifiesForFreeShipping ? 'FREE' : formatCurrency(STANDARD_SHIPPING_COST)}
                  </span>
                </label>

                <label className="flex items-center justify-between p-3.5 bg-[#FEFAE0] border border-[#111111] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="checkoutDelivery"
                      checked={deliveryMethod === 'express'}
                      onChange={() => setDeliveryMethod('express')}
                      className="accent-[#111111]"
                    />
                    <div>
                      <p className="font-semibold text-xs">Express Priority Air Courier</p>
                      <p className="text-[11px] text-[#111111]/70">
                        Estimated arrival: 1–2 business days with priority dispatch.
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold">
                    {formatCurrency(EXPRESS_SHIPPING_COST)}
                  </span>
                </label>
              </div>
            </div>

            {/* SECTION 4: PAYMENT METHOD */}
            <div className="border border-[#111111] bg-[#FAEDCD] p-6 space-y-4">
              <h2 className="font-display text-xl text-[#111111] pb-2 border-b border-[#111111]/20">
                4. Payment Method
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 text-xs font-cta uppercase border flex items-center justify-center gap-2 transition-colors ${
                    paymentMethod === 'card'
                      ? 'bg-[#111111] text-[#FEFAE0] border-[#111111]'
                      : 'bg-[#FEFAE0] text-[#111111] border-[#111111]'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 text-xs font-cta uppercase border flex items-center justify-center gap-2 transition-colors ${
                    paymentMethod === 'cod'
                      ? 'bg-[#111111] text-[#FEFAE0] border-[#111111]'
                      : 'bg-[#FEFAE0] text-[#111111] border-[#111111]'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Cash on Delivery</span>
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="space-y-4 p-4 bg-[#FEFAE0] border border-[#111111]">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="checkout-cardnum" className="block text-xs font-cta uppercase">
                        Card Number *
                      </label>
                      {detectedBrand !== 'generic' && (
                        <span className="text-[11px] font-mono font-bold uppercase text-[#111111] bg-[#FAEDCD] px-2 py-0.5 border border-[#111111]">
                          {detectedBrand}
                        </span>
                      )}
                    </div>
                    <input
                      ref={cardNumberRef}
                      id="checkout-cardnum"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      onBlur={(e) => handleBlur('cardNumber', e.target.value)}
                      placeholder="4532 •••• •••• 8892"
                      maxLength={19}
                      aria-required="true"
                      aria-invalid={errors.cardNumber ? 'true' : 'false'}
                      aria-describedby={errors.cardNumber ? 'checkout-cardnum-error' : undefined}
                      className={`w-full px-3 py-2 bg-white border text-xs font-mono focus:outline-none transition-colors ${
                        errors.cardNumber ? 'border-red-700' : 'border-[#111111]'
                      }`}
                    />
                    {errors.cardNumber && (
                      <p id="checkout-cardnum-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="checkout-cardname" className="block text-xs font-cta uppercase mb-1">
                      Name on Card *
                    </label>
                    <input
                      ref={cardNameRef}
                      id="checkout-cardname"
                      type="text"
                      value={cardName}
                      onChange={(e) => handleInputChange('cardName', e.target.value)}
                      onBlur={(e) => handleBlur('cardName', e.target.value)}
                      placeholder="Julian Vance"
                      aria-required="true"
                      aria-invalid={errors.cardName ? 'true' : 'false'}
                      aria-describedby={errors.cardName ? 'checkout-cardname-error' : undefined}
                      className={`w-full px-3 py-2 bg-white border text-xs focus:outline-none transition-colors ${
                        errors.cardName ? 'border-red-700' : 'border-[#111111]'
                      }`}
                    />
                    {errors.cardName && (
                      <p id="checkout-cardname-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                        {errors.cardName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="checkout-expiry" className="block text-xs font-cta uppercase mb-1">
                        Expiry Date * (MM/YY)
                      </label>
                      <input
                        ref={cardExpiryRef}
                        id="checkout-expiry"
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                        onBlur={(e) => handleBlur('cardExpiry', e.target.value)}
                        placeholder="11/28"
                        maxLength={5}
                        aria-required="true"
                        aria-invalid={errors.cardExpiry ? 'true' : 'false'}
                        aria-describedby={errors.cardExpiry ? 'checkout-expiry-error' : undefined}
                        className={`w-full px-3 py-2 bg-white border text-xs font-mono focus:outline-none transition-colors ${
                          errors.cardExpiry ? 'border-red-700' : 'border-[#111111]'
                        }`}
                      />
                      {errors.cardExpiry && (
                        <p id="checkout-expiry-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                          {errors.cardExpiry}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="checkout-cvc" className="block text-xs font-cta uppercase mb-1">
                        CVC Security Code *
                      </label>
                      <input
                        ref={cardCvcRef}
                        id="checkout-cvc"
                        type="text"
                        value={cardCvc}
                        onChange={(e) => handleInputChange('cardCvc', e.target.value)}
                        onBlur={(e) => handleBlur('cardCvc', e.target.value)}
                        placeholder={detectedBrand === 'amex' ? '1234' : '742'}
                        maxLength={detectedBrand === 'amex' ? 4 : 3}
                        aria-required="true"
                        aria-invalid={errors.cardCvc ? 'true' : 'false'}
                        aria-describedby={errors.cardCvc ? 'checkout-cvc-error' : undefined}
                        className={`w-full px-3 py-2 bg-white border text-xs font-mono focus:outline-none transition-colors ${
                          errors.cardCvc ? 'border-red-700' : 'border-[#111111]'
                        }`}
                      />
                      {errors.cardCvc && (
                        <p id="checkout-cvc-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                          {errors.cardCvc}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#111111]/70 font-mono pt-1">
                    🔒 PCI-DSS Certified. Full card numbers and CVCs are encrypted and never stored in plain text.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-[#E9EDC9] border border-[#111111] text-xs space-y-1.5">
                  <p className="font-bold font-cta uppercase">Cash On Delivery Terms</p>
                  <p className="text-[#111111]/80 leading-relaxed">
                    You can pay the courier directly upon doorstep delivery via cash or wireless card terminal. Please have exact change ready if paying with cash.
                  </p>
                </div>
              )}
            </div>

            {/* PLACE ORDER SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#111111] text-[#FEFAE0] font-cta text-sm uppercase border border-[#111111] hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? 'Validating & Placing Order...'
                : `Place Order · ${formatCurrency(pricing.total)}`}
            </button>

            {/* Demo honesty notice */}
            <p className="text-center text-xs font-mono text-[#111111]/70 pt-2">
              Demo store. No real payments are processed.
            </p>
          </form>
        </div>

        {/* Right Column: Sticky Order Summary (5 cols) */}
        <div className="lg:col-span-5 border-2 border-[#111111] bg-[#FAEDCD] p-6 space-y-6 lg:sticky lg:top-24">
          <h2 className="font-display text-2xl text-[#111111] pb-3 border-b border-[#111111]">
            Order Review ({cart.items.reduce((s, i) => s + i.quantity, 0)} items)
          </h2>

          {/* Line Items Snapshot */}
          <div className="divide-y divide-[#111111]/20 max-h-72 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-14 flex-shrink-0 overflow-hidden border border-[#111111]/30">
                    <Img
                      src={item.image}
                      alt={item.name}
                      aspectRatio="4:5"
                      size={500}
                      objectPosition="center 20%"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#111111] truncate">{item.name}</p>
                    <p className="text-[#111111]/70 font-mono mt-0.5">
                      Qty: {item.quantity} · Size: {item.size} · {item.color}
                    </p>
                  </div>
                </div>
                <p className="font-mono tabular-nums font-bold text-sm whitespace-nowrap">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Pricing Totals (No Tax line) */}
          <div className="border-t border-[#111111] pt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">{formatCurrency(pricing.subtotal)}</span>
            </div>

            {pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-800">
                <span>Discount ({pricing.promoCode})</span>
                <span className="font-mono tabular-nums">-{formatCurrency(pricing.discount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>
                Shipping ({deliveryMethod === 'express' ? 'Express Courier' : 'Standard Delivery'})
              </span>
              <span className="font-mono tabular-nums">
                {pricing.shipping === 0 ? 'FREE' : formatCurrency(pricing.shipping)}
              </span>
            </div>

            <div className="flex justify-between text-xl font-bold text-[#111111] border-t border-[#111111] pt-3">
              <span>Total</span>
              <span className="font-mono tabular-nums">{formatCurrency(pricing.total)}</span>
            </div>
          </div>

          <div className="p-3 bg-[#E9EDC9] border border-[#111111] text-[11px] space-y-1">
            <p className="font-bold font-cta uppercase">The Halden Guarantee</p>
            <p className="text-[#111111]/80">
              Free 30-day returns with prepaid return postage label included in your box.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
