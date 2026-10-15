import React from 'react';
import { PolicyLayout } from '../components/layout/PolicyLayout';
import { usePageMeta } from '../hooks/usePageMeta';

export const TermsPage: React.FC = () => {
  usePageMeta({
    title: 'Terms of Service',
    description: 'Terms and legal conditions governing purchases and use of the Halden store.',
  });
  const toc = [
    { id: 'acceptance', label: '1. Acceptance of Terms' },
    { id: 'orders', label: '2. Orders & Commercial Pricing' },
    { id: 'shipping', label: '3. Delivery & Title Transfer' },
    { id: 'returns', label: '4. Returns & Inspection' },
    { id: 'ip', label: '5. Intellectual Property' },
    { id: 'limitation', label: '6. Limitation of Liability' },
  ];

  return (
    <PolicyLayout
      title="Terms of Service"
      lastUpdated="October 2026"
      tableOfContents={toc}
    >
      <section id="acceptance" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">1. Acceptance of Terms</h2>
        <p>
          By visiting Halden or purchasing garments from our catalog, you engage in our service and agree to be bound by the following terms and conditions. These terms govern all transactions, site visits, and interactions with Halden Clothiers Ltd.
        </p>
      </section>

      <section id="orders" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">2. Orders & Commercial Pricing</h2>
        <p>
          All pricing is stated in United States Dollars (USD). We reserve the right to correct typographical pricing discrepancies or inventory misallocations before dispatch.
        </p>
        <p>
          Because Halden produces in limited mill runs (typically 300 to 500 units per colorway), items are allocated strictly upon successful order confirmation. In the rare event an item is oversold due to simultaneous checkouts, we will notify you immediately and issue a complete refund.
        </p>
      </section>

      <section id="shipping" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">3. Delivery & Title Transfer</h2>
        <p>
          Standard delivery ($8, or complimentary on orders exceeding $120 after discounts) arrives within 3 to 6 business days. Express courier dispatch ($18) arrives within 1 to 2 business days.
        </p>
        <p>
          Title and risk of loss pass to the recipient upon confirmed handover by the carrier to the delivery address provided during checkout.
        </p>
      </section>

      <section id="returns" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">4. Returns & Inspection</h2>
        <p>
          Customers may return unworn, unwashed garments in original condition with intact woven labels within 30 days of documented delivery. Returns that display perfume scents, deodorant markings, or fabric wear cannot be approved for refund.
        </p>
      </section>

      <section id="ip" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">5. Intellectual Property</h2>
        <p>
          All garment silhouettes, typography pairings, photographic artwork, textile specification charts, and the Halden trademark wordmark are proprietary intellectual property of Halden Clothiers Ltd.
        </p>
      </section>

      <section id="limitation" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">6. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, Halden Clothiers Ltd. shall not be liable for incidental, indirect, or consequential damages resulting from the use or inability to use our products or web services.
        </p>
      </section>
    </PolicyLayout>
  );
};
