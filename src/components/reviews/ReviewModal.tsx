import React, { useState } from 'react';
import { X, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { submitReview } from '../../services/reviewService';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
  productName?: string;
  onReviewSubmitted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  const reducedMotion = useReducedMotion();

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!rating) errs.rating = 'Please choose a star rating.';
    if (!title.trim() || title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    } else if (title.trim().length > 80) {
      errs.title = 'Title cannot exceed 80 characters.';
    }

    if (!body.trim() || body.trim().length < 20) {
      errs.body = `Review must be at least 20 characters (currently ${body.trim().length}).`;
    } else if (body.trim().length > 1000) {
      errs.body = 'Review cannot exceed 1,000 characters.';
    } else if (/https?:\/\/|www\./i.test(body)) {
      errs.body = 'Links and URLs are not allowed.';
    }

    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Please provide your name (minimum 2 characters).';
    } else if (name.trim().length > 50) {
      errs.name = 'Name cannot exceed 50 characters.';
    }

    const emailTrim = email.trim().toLowerCase();
    if (!emailTrim || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      errs.email = 'Please provide a valid email address.';
    }

    return errs;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validate();
    setErrors((prev) => ({ ...prev, [field]: errs[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ rating: true, title: true, body: true, name: true, email: true });
      return;
    }

    setIsSubmitting(true);
    setServerMessage('');

    try {
      const res = await submitReview({
        productId,
        rating,
        title,
        body,
        name,
        email,
        honeypot,
      });

      if (res.success) {
        setIsSuccess(true);
        setServerMessage(res.message);
        if (onReviewSubmitted) onReviewSubmitted();
      } else {
        setServerMessage(res.message);
      }
    } catch {
      setServerMessage('An error occurred submitting your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setServerMessage('');
    setTitle('');
    setBody('');
    setName('');
    setEmail('');
    setRating(5);
    setErrors({});
    setTouched({});
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 bg-[#111111]/70"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-[#FEFAE0] border-2 border-[#111111] max-w-lg w-full p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 border border-[#111111] hover:bg-[#FAEDCD] text-[#111111] transition-colors"
            aria-label="Close review dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 bg-[#CCD5AE] border border-[#111111] mx-auto flex items-center justify-center text-[#111111]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 id="review-modal-title" className="font-display text-2xl sm:text-3xl text-[#111111]">
                Review Received
              </h2>
              <p className="text-xs sm:text-sm text-[#111111]/80 max-w-sm mx-auto font-body">
                {serverMessage || "Thanks. Your review will appear once it's approved."}
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase"
                >
                  Return to Store
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
              <div>
                <p className="text-[10px] font-cta uppercase tracking-widest text-[#111111]/60">
                  Customer Feedback
                </p>
                <h2 id="review-modal-title" className="font-display text-2xl sm:text-3xl text-[#111111]">
                  {productName ? `Review ${productName}` : 'Write a Review'}
                </h2>
                <p className="text-xs text-[#111111]/80 mt-1">
                  Share your honest impressions of the textile weight, fit, and craftsmanship.
                </p>
              </div>

              {/* Honeypot field for bot spam */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="opacity-0 absolute -z-10 h-0 w-0 pointer-events-none"
                aria-hidden="true"
              />

              {/* Rating selection (keyboard accessible) */}
              <div className="space-y-1.5 pt-1">
                <label className="block font-cta text-xs uppercase text-[#111111]">
                  Rating <span className="text-red-700">*</span>
                </label>
                <div
                  role="radiogroup"
                  aria-label="Star rating"
                  className="flex items-center gap-1.5"
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={rating === star}
                        aria-label={`${star} of 5 stars`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-none focus:ring-1 focus:ring-[#111111]"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            isFilled
                              ? 'fill-[#111111] text-[#111111]'
                              : 'text-[#111111]/30 hover:text-[#111111]'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="font-mono text-xs font-bold ml-2 text-[#111111]">
                    {rating} / 5
                  </span>
                </div>
                {errors.rating && (
                  <p role="alert" className="text-[11px] font-mono text-red-700">
                    {errors.rating}
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="rev-title" className="font-cta text-xs uppercase text-[#111111]">
                    Review Headline <span className="text-red-700">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#111111]/60">3-80 chars</span>
                </div>
                <input
                  id="rev-title"
                  type="text"
                  maxLength={80}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleBlur('title')}
                  placeholder="e.g. Exceptional fleece weight, true to size"
                  aria-invalid={touched.title && Boolean(errors.title)}
                  aria-describedby={touched.title && errors.title ? 'rev-title-err' : undefined}
                  className={`w-full px-3 py-2 text-xs bg-[#FEFAE0] border text-[#111111] focus:outline-none ${
                    touched.title && errors.title
                      ? 'border-red-600 bg-red-50/20'
                      : 'border-[#111111] focus:bg-[#FAEDCD]'
                  }`}
                />
                {touched.title && errors.title && (
                  <p id="rev-title-err" role="alert" className="text-[11px] font-mono text-red-700">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Review Body */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="rev-body" className="font-cta text-xs uppercase text-[#111111]">
                    Detailed Review <span className="text-red-700">*</span>
                  </label>
                  <span className={`text-[10px] font-mono ${body.length > 1000 ? 'text-red-700 font-bold' : 'text-[#111111]/60'}`}>
                    {body.length} / 1,000
                  </span>
                </div>
                <textarea
                  id="rev-body"
                  rows={4}
                  maxLength={1000}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onBlur={() => handleBlur('body')}
                  placeholder="Describe the fabric texture, laundering behavior, proportions, and how you style it..."
                  aria-invalid={touched.body && Boolean(errors.body)}
                  aria-describedby={touched.body && errors.body ? 'rev-body-err' : undefined}
                  className={`w-full px-3 py-2 text-xs bg-[#FEFAE0] border text-[#111111] focus:outline-none ${
                    touched.body && errors.body
                      ? 'border-red-600 bg-red-50/20'
                      : 'border-[#111111] focus:bg-[#FAEDCD]'
                  }`}
                />
                {touched.body && errors.body && (
                  <p id="rev-body-err" role="alert" className="text-[11px] font-mono text-red-700">
                    {errors.body}
                  </p>
                )}
              </div>

              {/* Name and Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="rev-name" className="font-cta text-xs uppercase text-[#111111]">
                    Display Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="rev-name"
                    type="text"
                    maxLength={50}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="e.g. Thomas W."
                    aria-invalid={touched.name && Boolean(errors.name)}
                    aria-describedby={touched.name && errors.name ? 'rev-name-err' : undefined}
                    className={`w-full px-3 py-2 text-xs bg-[#FEFAE0] border text-[#111111] focus:outline-none ${
                      touched.name && errors.name
                        ? 'border-red-600 bg-red-50/20'
                        : 'border-[#111111] focus:bg-[#FAEDCD]'
                    }`}
                  />
                  {touched.name && errors.name && (
                    <p id="rev-name-err" role="alert" className="text-[11px] font-mono text-red-700">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="rev-email" className="font-cta text-xs uppercase text-[#111111]">
                    Email Address <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="rev-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="name@domain.com"
                    aria-invalid={touched.email && Boolean(errors.email)}
                    aria-describedby="rev-email-privacy"
                    className={`w-full px-3 py-2 text-xs bg-[#FEFAE0] border text-[#111111] focus:outline-none ${
                      touched.email && errors.email
                        ? 'border-red-600 bg-red-50/20'
                        : 'border-[#111111] focus:bg-[#FAEDCD]'
                    }`}
                  />
                  <p id="rev-email-privacy" className="text-[10px] font-mono text-[#111111]/60">
                    Private · Never displayed publicly
                  </p>
                  {touched.email && errors.email && (
                    <p role="alert" className="text-[11px] font-mono text-red-700">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {serverMessage && !isSuccess && (
                <div className="p-3 bg-red-50 border border-red-300 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{serverMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-3 border border-[#111111] bg-[#FAEDCD] text-[#111111] font-cta text-xs uppercase hover:bg-[#E9EDC9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Review...' : 'Submit For Approval'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
