import { Review, ReviewStatus } from '../types';
import { getOrdersByEmail } from './orderService';
import { sanitizeText, validateEmail, validateName, validateMessage } from '../lib/validators';

const REVIEWS_STORAGE_KEY = 'halden_reviews_catalog';

export const INITIAL_REVIEWS: Review[] = [
  // 1. Heavyweight Fleece Pullover (hld-hd-01) - Approved, Featured
  {
    id: 'rev-01',
    productId: 'hld-hd-01',
    rating: 5,
    title: 'The benchmark heavyweight hoodie',
    body: 'The 480gsm fleece has immense structure without feeling rigid. Keeps its architectural drape all day without bagging at the elbows.',
    name: 'Julian Vance',
    email: 'julian@halden.com',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    featured: true,
    verifiedPurchase: true,
  },
  // 2. Heavyweight Fleece Pullover (hld-hd-01) - Approved
  {
    id: 'rev-02',
    productId: 'hld-hd-01',
    rating: 5,
    title: 'Unmatched Portuguese mill quality',
    body: 'I have owned hoodies from nearly every luxury basics imprint. Halden loopback terry is in a different league entirely. Pre-washed with zero shrinkage.',
    name: 'Marcus Sterling',
    email: 'marcus.s@outlook.com',
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    featured: false,
    verifiedPurchase: true,
  },
  // 3. Relaxed Zip Hoodie (hld-hd-02) - Approved, Featured
  {
    id: 'rev-03',
    productId: 'hld-hd-02',
    rating: 5,
    title: 'Flawless two-way matte zipper',
    body: 'The two-way black metal zipper moves like butter. Deep hood that sits naturally when down. Will be buying the washed olive next.',
    name: 'Elias Thorne',
    email: 'elias.t@proton.me',
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    featured: true,
    verifiedPurchase: true,
  },
  // 4. Pinpoint Oxford Shirt (hld-sh-01) - Approved
  {
    id: 'rev-04',
    productId: 'hld-sh-01',
    rating: 4,
    title: 'Substantial oxford cloth with great collar roll',
    body: 'Natural mother-of-pearl buttons and dense 80s two-ply yarn. Collar roll is perfect under knitwear or worn open over a white tee.',
    name: 'Alexander Cole',
    email: 'acole@domain.com',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    featured: false,
    verifiedPurchase: true,
  },
  // 5. Heavyweight Box-Cut Tee (hld-sh-02) - Approved, Featured
  {
    id: 'rev-05',
    productId: 'hld-sh-02',
    rating: 5,
    title: 'Crisp collar that does not bacon',
    body: 'The 1x1 rib collar stays dead flat after multiple launderings. Boxy shoulder line provides clean drape without ballooning at the waist.',
    name: 'David Ramos',
    email: 'd.ramos@gmail.com',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    featured: true,
    verifiedPurchase: true,
  },
  // 6. Heavy Canvas Work Pant (hld-pa-01) - Approved
  {
    id: 'rev-06',
    productId: 'hld-pa-01',
    rating: 5,
    title: 'Tough 11.5oz duck canvas with clean tailoring',
    body: 'Bulletproof construction but cut with enough taper to wear with Derbies. Deep pocket bags that actually fit modern phones.',
    name: 'Sean Miller',
    email: 'sean.m@fastmail.com',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    featured: false,
    verifiedPurchase: false,
  },
  // 7. Structured Terry Sweatpant (hld-pa-02) - Approved
  {
    id: 'rev-07',
    productId: 'hld-pa-02',
    rating: 4,
    title: 'Sweatpants that feel like real trousers',
    body: 'The internal braided cotton drawstring and pintuck crease make these acceptable in casual studio meetings.',
    name: 'Gabriel Finch',
    email: 'gfinch@artisan.co',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    featured: false,
    verifiedPurchase: false,
  },
  // 8. Tropical Wool Pleated Trouser (hld-tr-01) - Approved
  {
    id: 'rev-08',
    productId: 'hld-tr-01',
    rating: 5,
    title: 'Biella mill wool is breathtaking',
    body: 'Super 120s high-twist wool that naturally sheds wrinkles. The single forward pleat adds vintage proportion with contemporary ease.',
    name: 'Thomas Wright',
    email: 'twright@designhouse.com',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    featured: false,
    verifiedPurchase: true,
  },
  // 9. Oversized Thermal Waffle Pullover (hld-hd-03) - Approved
  {
    id: 'rev-09',
    productId: 'hld-hd-03',
    rating: 5,
    title: 'Insanely soft interior honeycombing',
    body: 'Heavy waffle knit that traps warmth without weight. Layering piece of the season.',
    name: 'Arthur Pendelton',
    email: 'arthur.p@icloud.com',
    createdAt: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    featured: false,
    verifiedPurchase: true,
  },
  // 10. Washed Linen Camp Collar Shirt (hld-sh-03) - Approved
  {
    id: 'rev-10',
    productId: 'hld-sh-03',
    rating: 4,
    title: 'Natural unbleached flax texture',
    body: 'Cool to the touch and drapes naturally. Relaxed camp collar stands proud without wrinkling limp.',
    name: 'Liam Gallagher',
    email: 'liam.g@sound.org',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    featured: false,
    verifiedPurchase: false,
  },
  // 11. Relaxed Cotton Twill Chino (hld-pa-03) - Approved
  {
    id: 'rev-11',
    productId: 'hld-pa-03',
    rating: 5,
    title: 'My everyday uniform trouser',
    body: 'High-density twill weave that feels smooth against the legs. Sits at natural waist comfortably.',
    name: 'Nathaniel Drake',
    email: 'ndrake@explor.net',
    createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    featured: false,
    verifiedPurchase: true,
  },
  // 12. General Store Review - Approved, Featured
  {
    id: 'rev-12',
    productId: null,
    rating: 5,
    title: 'Packaging and fulfillment are sublime',
    body: 'Arrived in heavy unbleached paper boxes without a speck of single-use plastic. Every garment smells fresh from the European loom.',
    name: 'Christian Bale',
    email: 'christian@cinema.com',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    featured: true,
    verifiedPurchase: true,
  },

  // 13. Pending review 1
  {
    id: 'rev-13',
    productId: 'hld-hd-01',
    rating: 5,
    title: 'Best wardrobe investment of 2026',
    body: 'Holds its shape through constant travel. The ribbed side panels make mobility effortless.',
    name: 'Oliver Croft',
    email: 'oliver.c@studio.co',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    featured: false,
    verifiedPurchase: false,
  },
  // 14. Pending review 2
  {
    id: 'rev-14',
    productId: 'hld-tr-02',
    rating: 4,
    title: 'Deep waistband and sharp drape',
    body: 'Fabric feels durable yet soft. Waistband curtain construction is equal to bespoke Savile Row tailoring.',
    name: 'Henry Wallace',
    email: 'hwallace@law.org',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    featured: false,
    verifiedPurchase: false,
  },
  // 15. Pending review 3 (General Store)
  {
    id: 'rev-15',
    productId: null,
    rating: 5,
    title: 'Everyday, done properly is true',
    body: 'Customer care responded in fifteen minutes to swap my pant size before dispatch. Exemplary operation.',
    name: 'Kieran Scott',
    email: 'kscott@venture.io',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    featured: false,
    verifiedPurchase: true,
  },
];

function readReviews(): Review[] {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REVIEWS;
  }
}

function writeReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // ignore
  }
}

/**
 * Resets reviews to seed data
 */
export async function resetDemoReviews(): Promise<void> {
  await new Promise((r) => setTimeout(r, 40));
  writeReviews(INITIAL_REVIEWS);
}

/**
 * List approved reviews (customer-facing).
 * NEVER returns pending or rejected reviews.
 */
export async function listApprovedReviews(productId?: string | null): Promise<Review[]> {
  await new Promise((r) => setTimeout(r, 25));
  const reviews = readReviews();
  return reviews.filter((rev) => {
    if (rev.status !== 'approved') return false;
    if (productId !== undefined) {
      return rev.productId === productId;
    }
    return true;
  });
}

/**
 * List all reviews (admin portal)
 */
export async function listAllReviews(): Promise<Review[]> {
  await new Promise((r) => setTimeout(r, 25));
  return readReviews();
}

/**
 * Submit a customer review.
 * Always sets status to 'pending'.
 * Validates honeypot, links/HTML, email uniqueness per product, and checks verified buyer status.
 */
export async function submitReview(data: {
  productId: string | null;
  rating: number;
  title: string;
  body: string;
  name: string;
  email: string;
  honeypot?: string;
}): Promise<{ success: boolean; message: string; review?: Review }> {
  await new Promise((r) => setTimeout(r, 50));

  // 1. Honeypot check
  if (data.honeypot && data.honeypot.trim().length > 0) {
    return { success: false, message: 'Invalid submission.' };
  }

  // 2. Validate fields
  const titleClean = sanitizeText(data.title);
  const bodyClean = sanitizeText(data.body);
  const nameClean = sanitizeText(data.name);
  const emailValid = validateEmail(data.email);

  if (!emailValid.isValid) {
    return { success: false, message: emailValid.error || 'Valid email required.' };
  }

  if (data.rating < 1 || data.rating > 5) {
    return { success: false, message: 'Please provide a rating between 1 and 5 stars.' };
  }

  if (titleClean.length < 3 || titleClean.length > 80) {
    return { success: false, message: 'Title must be between 3 and 80 characters.' };
  }

  if (bodyClean.length < 20 || bodyClean.length > 1000) {
    return { success: false, message: 'Review must be between 20 and 1,000 characters.' };
  }

  if (/https?:\/\/|www\./i.test(titleClean) || /https?:\/\/|www\./i.test(bodyClean)) {
    return { success: false, message: 'External links are not permitted in reviews.' };
  }

  const reviews = readReviews();

  // 3. One review per email per product
  const normalizedEmail = emailValid.value.toLowerCase();
  const alreadyReviewed = reviews.some(
    (r) =>
      r.email.toLowerCase() === normalizedEmail &&
      r.productId === data.productId &&
      r.status !== 'rejected'
  );

  if (alreadyReviewed) {
    return {
      success: false,
      message: 'You have already submitted a review for this item.',
    };
  }

  // 4. Check if verified buyer based on email matching past orders
  let isVerified = false;
  if (data.productId) {
    try {
      const customerOrders = await getOrdersByEmail(normalizedEmail);
      isVerified = customerOrders.some((order) =>
        order.items.some((item) => item.productId === data.productId)
      );
    } catch {
      isVerified = false;
    }
  }

  const newReview: Review = {
    id: `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    productId: data.productId,
    rating: data.rating,
    title: titleClean,
    body: bodyClean,
    name: nameClean,
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
    status: 'pending',
    featured: false,
    verifiedPurchase: isVerified,
  };

  reviews.unshift(newReview);
  writeReviews(reviews);

  return {
    success: true,
    message: "Thanks. Your review will appear once it's approved.",
    review: newReview,
  };
}

/**
 * Admin action: Approve, Reject, or set status
 */
export async function setReviewStatus(
  id: string,
  status: ReviewStatus
): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 30));
  const reviews = readReviews();
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx === -1) return false;

  reviews[idx].status = status;
  // If rejected, un-feature
  if (status === 'rejected') {
    reviews[idx].featured = false;
  }
  writeReviews(reviews);
  return true;
}

/**
 * Admin action: Toggle featured on homepage
 */
export async function setFeatured(id: string, featured: boolean): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 25));
  const reviews = readReviews();
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx === -1) return false;

  // Only approved reviews can be featured
  if (featured && reviews[idx].status !== 'approved') {
    return false;
  }

  reviews[idx].featured = featured;
  writeReviews(reviews);
  return true;
}

/**
 * Admin action: Delete review
 */
export async function deleteReview(id: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 25));
  const reviews = readReviews();
  const filtered = reviews.filter((r) => r.id !== id);
  if (filtered.length === reviews.length) return false;

  writeReviews(filtered);
  return true;
}

/**
 * Review summary metrics for product page or card
 */
export interface ProductReviewSummary {
  averageRating: number;
  totalCount: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export function computeReviewSummary(reviews: Review[]): ProductReviewSummary {
  const approved = reviews.filter((r) => r.status === 'approved');
  if (approved.length === 0) {
    return {
      averageRating: 0,
      totalCount: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  approved.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[star] = (distribution[star] || 0) + 1;
    sum += r.rating;
  });

  return {
    averageRating: Math.round((sum / approved.length) * 10) / 10,
    totalCount: approved.length,
    distribution,
  };
}

export function getProductApprovedReviewSummarySync(productId: string): {
  averageRating: number;
  totalCount: number;
} {
  const reviews = readReviews();
  const approved = reviews.filter((r) => r.status === 'approved' && r.productId === productId);
  if (approved.length === 0) {
    return { averageRating: 0, totalCount: 0 };
  }
  const sum = approved.reduce((acc, r) => acc + r.rating, 0);
  return {
    averageRating: Math.round((sum / approved.length) * 10) / 10,
    totalCount: approved.length,
  };
}
