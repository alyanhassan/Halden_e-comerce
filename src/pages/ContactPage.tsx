import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { sendContactMessage } from '../services/contactService';
import {
  validateName,
  validateEmail,
  validatePhone,
  formatPhoneAsYouType,
  validateMessage,
  sanitizeText,
} from '../lib/validators';
import { usePageMeta } from '../hooks/usePageMeta';

export const ContactPage: React.FC = () => {
  usePageMeta({
    title: 'Customer Care',
    description: 'Get in touch with the Halden customer care studio.',
  });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Field refs to auto-focus first invalid field
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const validateField = (field: string, val: string) => {
    let err = '';
    if (field === 'name') {
      const res = validateName(val, 'Your name');
      if (!res.isValid) err = res.error || 'Name is invalid.';
    } else if (field === 'email') {
      const res = validateEmail(val);
      if (!res.isValid) err = res.error || 'Email is invalid.';
    } else if (field === 'phone') {
      if (val.trim()) {
        const res = validatePhone(val);
        if (!res.isValid) err = res.error || 'Phone number is invalid.';
      }
    } else if (field === 'subject') {
      const clean = sanitizeText(val);
      if (!clean) err = 'Subject is required.';
      else if (clean.length < 3) err = 'Subject must be at least 3 characters.';
      else if (clean.length > 100) err = 'Subject cannot exceed 100 characters.';
    } else if (field === 'message') {
      const res = validateMessage(val, 10, 1000);
      if (!res.isValid) err = res.error || 'Message is invalid.';
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

  const handleChange = (field: string, val: string) => {
    if (field === 'name') setName(val);
    else if (field === 'email') setEmail(val);
    else if (field === 'phone') setPhone(formatPhoneAsYouType(val));
    else if (field === 'subject') setSubject(val);
    else if (field === 'message') setMessage(val);

    // If already touched/errored, live validate
    if (touched[field]) {
      validateField(field, val);
    }
  };

  const validateAll = () => {
    const errs: Record<string, string> = {};
    const nameRes = validateName(name, 'Your name');
    if (!nameRes.isValid) errs.name = nameRes.error!;

    const emailRes = validateEmail(email);
    if (!emailRes.isValid) errs.email = emailRes.error!;

    if (phone.trim()) {
      const phoneRes = validatePhone(phone);
      if (!phoneRes.isValid) errs.phone = phoneRes.error!;
    }

    const cleanSubject = sanitizeText(subject);
    if (!cleanSubject) errs.subject = 'Subject is required.';
    else if (cleanSubject.length < 3) errs.subject = 'Subject must be at least 3 characters.';
    else if (cleanSubject.length > 100) errs.subject = 'Subject cannot exceed 100 characters.';

    const msgRes = validateMessage(message, 10, 1000);
    if (!msgRes.isValid) errs.message = msgRes.error!;

    setErrors(errs);
    setTouched({
      name: true,
      email: true,
      phone: true,
      subject: true,
      message: true,
    });

    if (Object.keys(errs).length > 0) {
      if (errs.name) nameRef.current?.focus();
      else if (errs.email) emailRef.current?.focus();
      else if (errs.phone) phoneRef.current?.focus();
      else if (errs.subject) subjectRef.current?.focus();
      else if (errs.message) messageRef.current?.focus();
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // prevent double submits

    if (!validateAll()) return;

    setIsSubmitting(true);
    try {
      await sendContactMessage({
        name: sanitizeText(name),
        email: email.trim().toLowerCase(),
        phone: phone.trim() ? sanitizeText(phone) : undefined,
        subject: sanitizeText(subject),
        message: sanitizeText(message),
      });
      setIsSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
      setTouched({});
      setErrors({});
    } catch {
      // error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageCount = message.length;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="text-xs font-mono text-[#111111]/70 mb-4" aria-label="Breadcrumb">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-[#111111]">Contact</span>
      </nav>

      <div className="pb-4 border-b-2 border-[#111111] mb-8">
        <h1 className="font-display text-4xl sm:text-5xl text-[#111111]">
          Client Care & Inquiries
        </h1>
        <p className="text-xs sm:text-sm text-[#111111]/80 max-w-xl mt-1">
          Have a question regarding fiber specifications, garment fit, or order tracking? Our team responds within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Validated Contact Form (7 cols) */}
        <div className="lg:col-span-7 border-2 border-[#111111] bg-[#FAEDCD] p-6 sm:p-10">
          {isSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="inline-flex p-3 bg-[#CCD5AE] border border-[#111111] text-[#111111]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-display text-3xl text-[#111111]">
                Message Received
              </h2>
              <p className="text-xs text-[#111111]/80 max-w-md mx-auto leading-relaxed">
                Thank you for reaching out to Halden. Your inquiry has been forwarded directly to our support desk. We will respond via email promptly.
              </p>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="mt-4 px-6 py-2.5 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <h2 className="font-display text-2xl text-[#111111] pb-2 border-b border-[#111111]/20">
                Send A Message
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-cta uppercase mb-1">
                    Your Name *
                  </label>
                  <input
                    ref={nameRef}
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={(e) => handleBlur('name', e.target.value)}
                    placeholder="Julian Vance"
                    aria-required="true"
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                      errors.name ? 'border-red-700' : 'border-[#111111]'
                    }`}
                  />
                  {errors.name && (
                    <p id="contact-name-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-cta uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    ref={emailRef}
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={(e) => handleBlur('email', e.target.value)}
                    placeholder="julian@example.com"
                    aria-required="true"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                      errors.email ? 'border-red-700' : 'border-[#111111]'
                    }`}
                  />
                  {errors.email && (
                    <p id="contact-email-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-phone" className="block text-xs font-cta uppercase mb-1">
                    Telephone (Optional)
                  </label>
                  <input
                    ref={phoneRef}
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={(e) => handleBlur('phone', e.target.value)}
                    placeholder="+1 (555) 019-2834 or 0300 1234567"
                    aria-invalid={errors.phone ? 'true' : 'false'}
                    aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                    className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                      errors.phone ? 'border-red-700' : 'border-[#111111]'
                    }`}
                  />
                  {errors.phone && (
                    <p id="contact-phone-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-cta uppercase mb-1">
                    Subject *
                  </label>
                  <input
                    ref={subjectRef}
                    id="contact-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    onBlur={(e) => handleBlur('subject', e.target.value)}
                    placeholder="Sizing advice on French Terry Pullover"
                    aria-required="true"
                    aria-invalid={errors.subject ? 'true' : 'false'}
                    aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                    className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                      errors.subject ? 'border-red-700' : 'border-[#111111]'
                    }`}
                  />
                  {errors.subject && (
                    <p id="contact-subject-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                      {errors.subject}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="contact-message" className="block text-xs font-cta uppercase">
                    Message *
                  </label>
                  <span className={`text-[11px] font-mono ${
                    messageCount > 1000 ? 'text-red-700 font-bold' : 'text-[#111111]/60'
                  }`}>
                    {messageCount} / 1000 characters
                  </span>
                </div>
                <textarea
                  ref={messageRef}
                  id="contact-message"
                  rows={5}
                  value={message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  onBlur={(e) => handleBlur('message', e.target.value)}
                  placeholder="Tell us what you need assistance with (10 to 1,000 characters)..."
                  aria-required="true"
                  aria-invalid={errors.message ? 'true' : 'false'}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  className={`w-full px-3 py-2 bg-[#FEFAE0] border text-xs focus:outline-none transition-colors ${
                    errors.message ? 'border-red-700' : 'border-[#111111]'
                  }`}
                />
                {errors.message && (
                  <p id="contact-message-error" className="text-[11px] text-red-700 mt-1 font-mono" role="alert">
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Transmitting Note...' : 'Submit Inquiry'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Contact Metadata (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-2 border-[#111111] bg-[#FAEDCD] p-6 space-y-4">
            <h3 className="font-display text-2xl text-[#111111] pb-2 border-b border-[#111111]/20">
              Direct Contact
            </h3>

            <div className="space-y-4 text-xs font-body">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#111111]" />
                <div>
                  <p className="font-cta uppercase text-[11px]">General Inquiries</p>
                  <p className="font-mono text-[#111111]/80">care@haldenbasics.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#111111]" />
                <div>
                  <p className="font-cta uppercase text-[11px]">Central Atelier & Warehouse</p>
                  <p className="text-[#111111]/80">Halden Studio, 48 Mercer Street, New York, NY 10013</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#111111]" />
                <div>
                  <p className="font-cta uppercase text-[11px]">Customer Support Hours</p>
                  <p className="text-[#111111]/80">Monday – Friday: 9:00 AM – 6:00 PM EST</p>
                  <p className="text-[#111111]/80">Saturday – Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-[#111111] bg-[#E9EDC9] p-6 space-y-2 text-xs">
            <p className="font-cta uppercase font-bold text-[11px]">Self-Service Quick Links</p>
            <p className="text-[#111111]/80 leading-relaxed">
              Need immediate answers on shipping carriers, returns, or order tracking?
            </p>
            <div className="pt-2 flex flex-col gap-2 font-cta uppercase text-[11px]">
              <Link to="/track" className="underline hover:opacity-75">
                • Track an existing order
              </Link>
              <Link to="/shipping-policy" className="underline hover:opacity-75">
                • Shipping rates and timetables
              </Link>
              <Link to="/refund-policy" className="underline hover:opacity-75">
                • Review return & exchange instructions
              </Link>
              <Link to="/size-guide" className="underline hover:opacity-75">
                • Garment measurements matrix
              </Link>
              <Link to="/faq" className="underline hover:opacity-75">
                • Read FAQ regarding fabrics & sizing
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
