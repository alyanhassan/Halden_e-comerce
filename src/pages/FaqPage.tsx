import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

interface FaqItem {
  q: string;
  a: string;
}

export const FaqPage: React.FC = () => {
  usePageMeta({
    title: 'Frequently Asked Questions',
    description: 'Frequently asked questions on sizing, garment care, shipping, and returns.',
  });
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'sizing-0': true,
    'shipping-0': true,
  });

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections: { title: string; items: FaqItem[] }[] = [
    {
      title: 'Sizing & Cut',
      items: [
        {
          q: 'How do Halden garments fit compared to standard retail sizing?',
          a: 'Our garments are designed true to European sizing with a relaxed, modern proportion. If you prefer a classic clean drape, order your normal size. If you prefer an exaggerated slouchy streetwear silhouette, size up one step.',
        },
        {
          q: 'Will Halden knitwear shrink after washing?',
          a: 'All our cotton and fleece garments undergo cold enzyme pre-washing at our mill in Portugal before cutting. Shrinkage across subsequent household cold washes is limited to less than 1.5%. Always air dry flat to preserve fabric memory.',
        },
        {
          q: 'Where can I find exact garment measurements?',
          a: 'Every product page features a "Size Guide" link right above the size selector chips, providing complete chest, waist, and length measurements in both inches and centimeters.',
        },
      ],
    },
    {
      title: 'Materials, Mills & Care',
      items: [
        {
          q: 'What makes 480gsm French terry superior to regular fleece?',
          a: 'Mainstream sweatshirts typically use 280-320gsm blends with high polyester content. Our 480gsm French terry uses dense, tightly spun combed organic cotton with unbrushed internal loopback knit. It breathes naturally, insulates without synthetic overheating, and will never pill.',
        },
        {
          q: 'How should I care for the Single Pleat Wool Trousers?',
          a: 'Because we use pure Super 120s tropical merino wool, they possess natural odor and stain resistance. We suggest gentle spot cleaning and hanging in a steamy bathroom between wears. Dry clean only when necessary.',
        },
        {
          q: 'Are any synthetic fibers or virgin plastics used?',
          a: 'Zero virgin polyester or nylon is used in our core garments. Our tags are unbleached cotton and our packaging is 100% recyclable unprinted kraft paper.',
        },
      ],
    },
    {
      title: 'Shipping & Delivery',
      items: [
        {
          q: 'What are your shipping rates and thresholds?',
          a: 'Standard Carbon-Neutral Delivery is $8 flat rate, and completely free on orders over $120. Express Priority Air Courier is $18 flat rate.',
        },
        {
          q: 'How quickly are orders dispatched from your warehouse?',
          a: 'Orders placed on business days before 2:00 PM EST are handed to the carrier on the same day. All other orders dispatch within 24 hours.',
        },
        {
          q: 'How can I track my shipment?',
          a: 'Visit our Track Order page (/track) at any time and enter your order number (e.g. HLD-XXXXXX) along with your email address to view live courier milestones.',
        },
      ],
    },
    {
      title: 'Returns & Guarantees',
      items: [
        {
          q: 'What is your return policy?',
          a: 'We offer a 30-day trial period from the date of delivery. All garments in unwashed, unworn condition with tags intact can be returned or exchanged without fees. Every shipment includes a prepaid return shipping label.',
        },
        {
          q: 'How long do refunds take to reflect?',
          a: 'Once your return parcel arrives at our depot, our intake team inspects it within 48 business hours. Funds are returned immediately to your original payment card or method.',
        },
      ],
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="text-xs font-mono text-[#111111]/70 mb-4">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-[#111111]">FAQ</span>
      </nav>

      <div className="pb-4 border-b-2 border-[#111111] mb-10">
        <h1 className="font-display text-4xl sm:text-5xl text-[#111111]">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-[#111111]/80 max-w-xl mt-1">
          Detailed answers regarding garment specifications, sizing guidance, and delivery policies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: FAQ Sections (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {sections.map((section, sIdx) => (
            <div key={section.title} className="space-y-4">
              <h2 className="font-display text-2xl text-[#111111] pb-2 border-b border-[#111111]">
                {section.title}
              </h2>

              <div className="border border-[#111111] bg-[#FAEDCD] divide-y divide-[#111111]">
                {section.items.map((item, iIdx) => {
                  const key = `${sIdx}-${iIdx}`;
                  const isOpen = Boolean(openItems[key]);

                  return (
                    <div key={item.q} className="p-4 sm:p-5">
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className="w-full flex justify-between items-start text-left gap-4"
                      >
                        <span className="font-cta text-xs uppercase tracking-wide text-[#111111]">
                          {item.q}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 flex-shrink-0 text-[#111111]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 flex-shrink-0 text-[#111111]" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="pt-3 text-xs sm:text-sm text-[#111111]/80 leading-relaxed font-body">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Support Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="border-2 border-[#111111] bg-[#FAEDCD] p-6 space-y-4">
            <h3 className="font-display text-2xl text-[#111111] pb-2 border-b border-[#111111]/20">
              Still Have A Question?
            </h3>
            <p className="text-xs text-[#111111]/80 leading-relaxed">
              If your question isn't answered in the matrix above, write to our client care team directly. We are happy to advise on measurements and care.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors"
            >
              <span>Contact Client Care</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="border border-[#111111] bg-[#E9EDC9] p-6 text-xs space-y-2">
            <p className="font-cta uppercase font-bold text-[11px]">Free Shipping Over $120</p>
            <p className="text-[#111111]/80">
              All domestic and international parcels qualifying for $120+ order totals ship free via standard insured carrier.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
