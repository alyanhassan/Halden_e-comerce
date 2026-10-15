import React from 'react';
import { PolicyLayout } from '../components/layout/PolicyLayout';
import { usePageMeta } from '../hooks/usePageMeta';

export const RefundPolicyPage: React.FC = () => {
  usePageMeta({
    title: 'Refund Policy',
    description: '30-day return policy and garment exchange guidelines.',
  });
  const toc = [
    { id: 'window', label: '1. 30-Day Return Window' },
    { id: 'eligibility', label: '2. Garment Eligibility & Condition' },
    { id: 'procedure', label: '3. Step-by-Step Return Procedure' },
    { id: 'refunds', label: '4. Refund Processing & Timelines' },
    { id: 'exchanges', label: '5. Size & Colorway Exchanges' },
    { id: 'damaged', label: '6. Defective or Incorrect Items' },
  ];

  return (
    <PolicyLayout
      title="Refund & Return Policy"
      lastUpdated="October 2026"
      tableOfContents={toc}
    >
      <section id="window" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">1. 30-Day Return Window</h2>
        <p>
          We want you to evaluate our heavyweight fabrics and proportions with calm deliberation. Halden offers a 30-day return policy commencing from the date your package is marked delivered by the carrier.
        </p>
      </section>

      <section id="eligibility" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">2. Garment Eligibility & Condition</h2>
        <p>
          To qualify for a full commercial refund, returned garments must satisfy our standard inspection criteria:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 font-mono text-xs">
          <li>Unworn, unwashed, and free from any signs of wear, stretching, or alteration.</li>
          <li>Free from foreign odors (perfume, cologne, smoke) and marks (makeup, deodorant).</li>
          <li>Original woven interior brand labels and fabric composition tags intact.</li>
          <li>Repacked securely in protective paper wrap to prevent transport damage.</li>
        </ul>
      </section>

      <section id="procedure" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">3. Step-by-Step Return Procedure</h2>
        <ol className="list-decimal pl-5 space-y-2 font-mono text-xs">
          <li>
            <strong>Initiate Return:</strong> Navigate to your <a href="/account" className="underline font-bold">Account Orders</a> page or email returns@halden.com with your order reference (e.g. HLD-842910).
          </li>
          <li>
            <strong>Prepaid Shipping Label:</strong> For patrons within the United States, United Kingdom, and the European Union, a prepaid return shipping voucher will be issued automatically.
          </li>
          <li>
            <strong>Courier Handover:</strong> Affix the return label over original parcel markings and drop off at any authorized depot within 7 days of label generation.
          </li>
        </ol>
      </section>

      <section id="refunds" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">4. Refund Processing & Timelines</h2>
        <p>
          Once your return arrives at our central depot, our quality team conducts inspection within 48 business hours.
        </p>
        <p>
          Upon inspection approval, your refund is credited directly to the original payment method. Depending on your financial institution, funds appear on your bank statement within 3 to 7 business days.
        </p>
        <p>
          Original shipping charges ($8 Standard or $18 Express) are non-refundable unless the return is due to an authenticated mill fault or shipment error.
        </p>
      </section>

      <section id="exchanges" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">5. Size & Colorway Exchanges</h2>
        <p>
          Need a different size or fit? Size exchanges are complimentary within our 30-day window subject to catalog stock availability. We dispatch your replacement size as soon as courier tracking scans your return parcel.
        </p>
      </section>

      <section id="damaged" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">6. Defective or Incorrect Items</h2>
        <p>
          Every Halden garment undergoes multi-point inspection before dispatch. If you suspect a manufacturing flaw or received an incorrect size, contact concierge@halden.com with photographs. We provide instant replacement dispatch and cover all transit expenses.
        </p>
      </section>
    </PolicyLayout>
  );
};
