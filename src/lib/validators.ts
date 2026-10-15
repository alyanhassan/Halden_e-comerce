import { parsePhoneNumberFromString, AsYouType, CountryCode } from 'libphonenumber-js';

/**
 * Strips HTML tags and script elements from input strings
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Email validation: proper format, no spaces, lowercase
 */
export function validateEmail(email: string): { isValid: boolean; error?: string; value: string } {
  const clean = email.trim().toLowerCase();
  if (!clean) {
    return { isValid: false, error: 'Email address is required.', value: '' };
  }
  if (/\s/.test(clean)) {
    return { isValid: false, error: 'Email address cannot contain spaces.', value: clean };
  }
  // Standard RFC 5322 simplified email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@domain.com).', value: clean };
  }
  return { isValid: true, value: clean };
}

/**
 * Phone number validation and formatting via libphonenumber-js
 * Handles Pakistan (03XX-XXXXXXX or +92 3XX XXXXXXX), US (10 digits), and international numbers.
 */
export function validatePhone(
  phone: string,
  countryCode?: string
): { isValid: boolean; error?: string; formatted: string } {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Phone number is required.', formatted: '' };
  }

  const cleanDigits = trimmed.replace(/\D/g, '');

  // Special handling for Pakistani local format (e.g. 03001234567)
  if ((!countryCode || countryCode === 'PK') && /^03\d{9}$/.test(cleanDigits)) {
    const formatted = `+92 ${cleanDigits.slice(1, 4)} ${cleanDigits.slice(4)}`;
    return { isValid: true, formatted };
  }

  // Special handling for US 10-digit number
  if ((!countryCode || countryCode === 'US') && cleanDigits.length === 10 && !trimmed.startsWith('+')) {
    const formatted = `+1 (${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6)}`;
    return { isValid: true, formatted };
  }

  try {
    const country = (countryCode?.toUpperCase() || 'US') as CountryCode;
    const parsed = parsePhoneNumberFromString(trimmed, country);

    if (parsed && parsed.isValid()) {
      return { isValid: true, formatted: parsed.formatInternational() };
    }
  } catch {
    // Fall back to general international check
  }

  // Fallback: 7-15 digits with optional leading +
  const intlRegex = /^\+?[0-9\s\-()]{7,20}$/;
  if (cleanDigits.length >= 7 && cleanDigits.length <= 15 && intlRegex.test(trimmed)) {
    return { isValid: true, formatted: trimmed };
  }

  return {
    isValid: false,
    error: 'Please enter a valid phone number (e.g., +1 555-0199 or 0300-1234567).',
    formatted: trimmed,
  };
}

/**
 * Auto-format phone as user types
 */
export function formatPhoneAsYouType(input: string, countryCode?: string): string {
  if (!input) return '';
  const country = (countryCode?.toUpperCase() || 'US') as CountryCode;
  try {
    const formatter = new AsYouType(country);
    return formatter.input(input);
  } catch {
    return input;
  }
}

/**
 * Name validation: letters (including accents), spaces, hyphens, apostrophes; 2-60 chars
 */
export function validateName(name: string, label = 'Full name'): { isValid: boolean; error?: string; value: string } {
  const clean = sanitizeText(name);
  if (!clean) {
    return { isValid: false, error: `${label} is required.`, value: '' };
  }
  if (clean.length < 2) {
    return { isValid: false, error: `${label} must be at least 2 characters.`, value: clean };
  }
  if (clean.length > 60) {
    return { isValid: false, error: `${label} cannot exceed 60 characters.`, value: clean };
  }
  // Letters (including unicode Latin accents), spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s'-]+$/;
  if (!nameRegex.test(clean)) {
    return {
      isValid: false,
      error: `${label} can only contain letters, spaces, hyphens, and apostrophes.`,
      value: clean,
    };
  }
  return { isValid: true, value: clean };
}

/**
 * Address validation: 5-100 characters
 */
export function validateAddressLine(address: string, label = 'Street address'): { isValid: boolean; error?: string; value: string } {
  const clean = sanitizeText(address);
  if (!clean) {
    return { isValid: false, error: `${label} is required.`, value: '' };
  }
  if (clean.length < 5) {
    return { isValid: false, error: `${label} must be at least 5 characters.`, value: clean };
  }
  if (clean.length > 100) {
    return { isValid: false, error: `${label} cannot exceed 100 characters.`, value: clean };
  }
  return { isValid: true, value: clean };
}

/**
 * City validation: letters only, 2-50 characters
 */
export function validateCity(city: string): { isValid: boolean; error?: string; value: string } {
  const clean = sanitizeText(city);
  if (!clean) {
    return { isValid: false, error: 'City is required.', value: '' };
  }
  if (clean.length < 2 || clean.length > 50) {
    return { isValid: false, error: 'City must be between 2 and 50 characters.', value: clean };
  }
  const cityRegex = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s.'-]+$/;
  if (!cityRegex.test(clean)) {
    return { isValid: false, error: 'City can only contain letters and standard punctuation.', value: clean };
  }
  return { isValid: true, value: clean };
}

/**
 * State/Province validation: required, 2-50 chars
 */
export function validateState(state: string): { isValid: boolean; error?: string; value: string } {
  const clean = sanitizeText(state);
  if (!clean) {
    return { isValid: false, error: 'State / Province is required.', value: '' };
  }
  if (clean.length < 2 || clean.length > 50) {
    return { isValid: false, error: 'State / Province must be between 2 and 50 characters.', value: clean };
  }
  return { isValid: true, value: clean };
}

/**
 * Postal code validation by country:
 * - US: 5 or 5+4 digits
 * - Pakistan: 5 digits
 * - Other: 3-10 alphanumeric
 */
export function validatePostalCode(postal: string, country = 'US'): { isValid: boolean; error?: string; value: string } {
  const clean = postal.trim().toUpperCase();
  if (!clean) {
    return { isValid: false, error: 'Postal code is required.', value: '' };
  }

  const countryUpper = country.toUpperCase();
  if (countryUpper === 'US' || countryUpper === 'UNITED STATES') {
    if (!/^\d{5}(-\d{4})?$/.test(clean)) {
      return { isValid: false, error: 'US ZIP code must be 5 digits (e.g. 90210 or 90210-1234).', value: clean };
    }
  } else if (countryUpper === 'PK' || countryUpper === 'PAKISTAN') {
    if (!/^\d{5}$/.test(clean)) {
      return { isValid: false, error: 'Pakistan postal code must be 5 digits (e.g. 54000).', value: clean };
    }
  } else {
    if (!/^[A-Z0-9 -]{3,10}$/.test(clean)) {
      return { isValid: false, error: 'Postal code must be 3-10 alphanumeric characters.', value: clean };
    }
  }

  return { isValid: true, value: clean };
}

/**
 * Luhn algorithm check for credit cards
 */
export function luhnCheck(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (sanitized.length < 12) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'generic';

export function detectCardBrand(number: string): CardBrand {
  const clean = number.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
  if (/^3[47]/.test(clean)) return 'amex';
  if (/^6(?:011|5)/.test(clean)) return 'discover';
  return 'generic';
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  const brand = detectCardBrand(digits);

  if (brand === 'amex') {
    // 4 - 6 - 5 format for Amex
    const p1 = digits.slice(0, 4);
    const p2 = digits.slice(4, 10);
    const p3 = digits.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(' ');
  }

  // 4 - 4 - 4 - 4 format
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

export function validateCardNumber(number: string): { isValid: boolean; brand: CardBrand; last4: string; error?: string } {
  const digits = number.replace(/\D/g, '');
  const brand = detectCardBrand(digits);

  if (!digits) {
    return { isValid: false, brand: 'generic', last4: '', error: 'Card number is required.' };
  }

  const expectedLength = brand === 'amex' ? 15 : 16;
  if (digits.length !== expectedLength && (digits.length < 13 || digits.length > 19)) {
    return {
      isValid: false,
      brand,
      last4: digits.slice(-4),
      error: `Card number must be ${expectedLength} digits.`,
    };
  }

  if (!luhnCheck(digits)) {
    return {
      isValid: false,
      brand,
      last4: digits.slice(-4),
      error: 'Invalid card number. Please check for typos.',
    };
  }

  return {
    isValid: true,
    brand,
    last4: digits.slice(-4),
  };
}

export function formatCardExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

export function validateCardExpiry(expiry: string): { isValid: boolean; error?: string } {
  const clean = expiry.trim();
  if (!clean) {
    return { isValid: false, error: 'Expiry date is required.' };
  }

  const match = clean.match(/^(\d{1,2})\/(\d{2})$/);
  if (!match) {
    return { isValid: false, error: 'Use format MM/YY (e.g. 08/28).' };
  }

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;

  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Month must be between 01 and 12.' };
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { isValid: false, error: 'Card has already expired.' };
  }

  if (year > currentYear + 20) {
    return { isValid: false, error: 'Expiry date cannot be more than 20 years in the future.' };
  }

  return { isValid: true };
}

export function validateCardCvc(cvc: string, brand: CardBrand = 'generic'): { isValid: boolean; error?: string } {
  const clean = cvc.replace(/\D/g, '');
  if (!clean) {
    return { isValid: false, error: 'Security code (CVC) is required.' };
  }

  const expectedLength = brand === 'amex' ? 4 : 3;
  if (clean.length !== expectedLength) {
    return { isValid: false, error: `${expectedLength}-digit security code required.` };
  }

  return { isValid: true };
}

/**
 * Password validation: min 8 with upper, lower, number
 */
export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
  strength: 'weak' | 'medium' | 'strong';
} {
  if (!password) {
    return { isValid: false, error: 'Password is required.', strength: 'weak' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters.', strength: 'weak' };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUpper || !hasLower || !hasNumber) {
    return {
      isValid: false,
      error: 'Must contain an uppercase letter, lowercase letter, and a number.',
      strength: 'weak',
    };
  }

  let strength: 'weak' | 'medium' | 'strong' = 'medium';
  if (password.length >= 12 && hasSpecial) {
    strength = 'strong';
  }

  return { isValid: true, strength };
}

export function validateConfirmPassword(password: string, confirm: string): { isValid: boolean; error?: string } {
  if (!confirm) {
    return { isValid: false, error: 'Please confirm your password.' };
  }
  if (password !== confirm) {
    return { isValid: false, error: 'Passwords do not match.' };
  }
  return { isValid: true };
}

/**
 * Message / Review validation
 */
export function validateMessage(
  message: string,
  min = 10,
  max = 1000
): { isValid: boolean; error?: string; value: string; charCount: number } {
  const clean = sanitizeText(message);
  const charCount = clean.length;

  if (!clean) {
    return { isValid: false, error: 'Message is required.', value: '', charCount: 0 };
  }

  if (charCount < min) {
    return { isValid: false, error: `Must be at least ${min} characters (currently ${charCount}).`, value: clean, charCount };
  }

  if (charCount > max) {
    return { isValid: false, error: `Cannot exceed ${max} characters (currently ${charCount}).`, value: clean, charCount };
  }

  // Reject links in reviews or messages to prevent spam
  if (/https?:\/\/|www\./i.test(clean)) {
    return { isValid: false, error: 'Links and URLs are not permitted.', value: clean, charCount };
  }

  return { isValid: true, value: clean, charCount };
}

/**
 * Review specific validator
 */
export function validateReviewForm(data: {
  rating: number;
  title: string;
  body: string;
  name: string;
  email: string;
  honeypot?: string;
}): { isValid: boolean; errors: Record<string, string>; sanitizedData?: any } {
  const errors: Record<string, string> = {};

  // Check honeypot field
  if (data.honeypot && data.honeypot.trim().length > 0) {
    errors.honeypot = 'Spam detected.';
    return { isValid: false, errors };
  }

  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.rating = 'Please select a rating between 1 and 5 stars.';
  }

  const titleClean = sanitizeText(data.title);
  if (!titleClean || titleClean.length < 3) {
    errors.title = 'Review title must be at least 3 characters.';
  } else if (titleClean.length > 80) {
    errors.title = 'Review title cannot exceed 80 characters.';
  } else if (/https?:\/\/|www\./i.test(titleClean)) {
    errors.title = 'Links are not permitted in review titles.';
  }

  const bodyCheck = validateMessage(data.body, 20, 1000);
  if (!bodyCheck.isValid) {
    errors.body = bodyCheck.error || 'Invalid review text.';
  }

  const nameCheck = validateName(data.name, 'Name');
  if (!nameCheck.isValid) {
    errors.name = nameCheck.error || 'Invalid name.';
  }

  const emailCheck = validateEmail(data.email);
  if (!emailCheck.isValid) {
    errors.email = emailCheck.error || 'Invalid email address.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      rating: data.rating,
      title: titleClean,
      body: bodyCheck.value,
      name: nameCheck.value,
      email: emailCheck.value,
    },
  };
}

/**
 * Promo code validator: trimmed, case-insensitive
 */
export function validatePromoCodeFormat(code: string): { isValid: boolean; error?: string; normalized: string } {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { isValid: false, error: 'Please enter a promotional code.', normalized: '' };
  }
  if (!/^[A-Z0-9_-]{3,20}$/.test(normalized)) {
    return { isValid: false, error: 'Invalid promotional code format.', normalized };
  }
  return { isValid: true, normalized };
}

/**
 * Admin Product Form Validator
 * - name: 3-80 chars
 * - price: > 0 with up to 2 decimals
 * - stock integers >= 0
 * - at least one size and color
 * - unique slug
 * - image URLs must be https
 * - strip HTML tags from all free-text inputs
 */
export function validateAdminProductForm(
  data: {
    name: string;
    slug: string;
    price: number | string;
    description: string;
    image1: string;
    image2: string;
    sizes: string[];
    colors: Array<{ name: string; hex: string }>;
    stock?: number | string;
  },
  existingProducts: Array<{ id: string; slug: string }>,
  editingProductId?: string | null
): { isValid: boolean; errors: Record<string, string>; sanitized?: any } {
  const errors: Record<string, string> = {};

  const cleanName = sanitizeText(data.name);
  if (!cleanName || cleanName.length < 3) {
    errors.name = 'Garment name must be at least 3 characters.';
  } else if (cleanName.length > 80) {
    errors.name = 'Garment name cannot exceed 80 characters.';
  }

  const priceStr = String(data.price).trim();
  const priceNum = parseFloat(priceStr);
  if (!priceStr || isNaN(priceNum) || priceNum <= 0) {
    errors.price = 'Price must be greater than $0.00.';
  } else if (!/^\d+(\.\d{1,2})?$/.test(priceStr)) {
    errors.price = 'Price can have at most 2 decimal places (e.g. 88.00).';
  }

  const cleanSlug = sanitizeText(data.slug)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!cleanSlug) {
    errors.slug = 'A URL slug is required.';
  } else {
    const isDuplicate = existingProducts.some(
      (p) => p.slug === cleanSlug && p.id !== editingProductId
    );
    if (isDuplicate) {
      errors.slug = 'This slug is already used by another garment.';
    }
  }

  if (!data.sizes || data.sizes.length === 0) {
    errors.sizes = 'Select at least one garment size.';
  }

  if (!data.colors || data.colors.length === 0) {
    errors.colors = 'Select at least one color swatch.';
  }

  if (data.stock !== undefined && data.stock !== '') {
    const stockNum = Number(data.stock);
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      errors.stock = 'Stock must be an integer greater than or equal to 0.';
    }
  }

  // Image URLs must be https
  const httpsRegex = /^https:\/\/.+/i;
  if (!data.image1 || !httpsRegex.test(data.image1.trim())) {
    errors.image1 = 'Primary image URL must be a valid https:// web address.';
  }

  if (data.image2 && data.image2.trim() && !httpsRegex.test(data.image2.trim())) {
    errors.image2 = 'Secondary image URL must be a valid https:// web address.';
  }

  const cleanDesc = sanitizeText(data.description);
  if (!cleanDesc || cleanDesc.length < 10) {
    errors.description = 'Editorial description must be at least 10 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      name: cleanName,
      slug: cleanSlug,
      price: priceNum,
      description: cleanDesc,
      image1: (data.image1 || '').trim(),
      image2: (data.image2 || '').trim(),
      sizes: data.sizes,
      colors: data.colors,
      stock: data.stock !== undefined ? Math.max(0, Math.floor(Number(data.stock))) : 5,
    },
  };
}
