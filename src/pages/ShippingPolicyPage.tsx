import React from 'react';
import { PolicyLayout } from '../components/layout/PolicyLayout';
import { usePageMeta } from '../hooks/usePageMeta';

export const ShippingPolicyPage: React.FC = () => {
  usePageMeta({
    title: 'Shipping Policy',
    description: 'Comprehensive shipping terms, international duties, and courier timelines.',
  });
  const toc = [
    { id: 'rates', label: '1. Shipping Rates & Delivery Times' },
    { id: 'free-shipping', label: '2. Complimentary Delivery Over $120' },
    { id: 'dispatch', label: '3. Packaging & Fulfillment Time' },
    { id: 'tracking', label: '4. Real-Time Tracking' },
    { id: 'international', label: '5. International Shipments & Duties' },
    { id: 'damages', label: '6. Damaged or Lost Shipments' },
  ];

  return (
    <PolicyLayout
      title="Shipping Policy"
      lastUpdated="October 2026"
      tableOfContents={toc}
    >
      <section id="rates" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">1. Shipping Rates & Delivery Times</h2>
        <p>
          Halden ships worldwide from our central distribution hub in Northern Europe. We provide two tracked delivery methods:
        </p>
        <div className="border border-[#111111] bg-[#FAEDCD] p-4 font-mono text-xs space-y-2">
          <div className="flex justify-between items-center border-b border-[#111111]/20 pb-2">
            <div>
              <p className="font-bold text-[#111111]">Standard Ground Courier</p>
              <p className="text-[11px] text-[#111111]/70">3 to 6 business days</p>
            </div>
            <p className="font-bold text-sm text-[#111111]">$8.00 (Free over $120)</p>
          </div>
          <div className="flex justify-between items-center pt-1">
            <div>
              <p className="font-bold text-[#111111]">Priority Express Air</p>
              <p className="text-[11px] text-[#111111]/70">1 to 2 business days</p>
            </div>
            <p className="font-bold text-sm text-[#111111]">$18.00</p>
          </div>
        </div>
      </section>

      <section id="free-shipping" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">2. Complimentary Delivery Over $120</h2>
        <p>
          Orders whose subtotal equals or exceeds $120.00 USD after any applied promotional discounts qualify automatically for complimentary Standard Ground shipping.
        </p>
        <p>
          Free shipping thresholds apply before local duties and taxes are calculated.
        </p>
      </section>

      <section id="dispatch" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">3. Packaging & Fulfillment Time</h2>
        <p>
          Orders confirmed before 14:00 CET on business days are dispatched within 24 hours. Orders placed over weekends or international bank holidays ship the following Monday.
        </p>
        <p>
          <strong>Zero Plastic Packaging:</strong> Every garment is wrapped in unbleached FSC-certified tissue paper and sealed in heavy-duty kraft paperboard parcels fastened with reinforced water-activated paper tape. We use zero single-use plastics in our fulfillment stream.
        </p>
      </section>

      <section id="tracking" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">4. Real-Time Tracking</h2>
        <p>
          Upon courier scan at our facility, you will receive an automatic dispatch notice containing your unique door-to-door tracking number.
        </p>
        <p>
          You can also check the status of any active delivery on our live <a href="/track" className="underline font-bold">Track Order portal</a> by submitting your order number (e.g. HLD-842910) and account email.
        </p>
      </section>

      <section id="international" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">5. International Shipments & Duties</h2>
        <p>
          We deliver to over 45 countries worldwide. For deliveries into the United States, United Kingdom, and the European Union, standard orders under statutory de minimis limits enter customs duty-free.
        </p>
        <p>
          Any destination customs fees or import surcharges imposed by local customs authorities are the sole responsibility of the recipient.
        </p>
      </section>

      <section id="damages" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">6. Damaged or Lost Shipments</h2>
        <p>
          All shipments are fully insured against loss or courier damage. If your package arrives damaged or tracking ceases updating for more than 5 consecutive business days, notify concierge@halden.com immediately for priority replacement dispatch.
        </p>
      </section>
    </PolicyLayout>
  );
};
