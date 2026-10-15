import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, RefreshCw, ShieldCheck, ArrowRight, Package } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export const ShippingReturnsPage: React.FC = () => {
  usePageMeta({
    title: 'Shipping & Returns',
    description: 'Halden shipping courier times, worldwide rates, and 30-day return policy.',
  });
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      <nav className="text-xs font-mono text-[#111111]/70">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-[#111111]">Shipping & Returns</span>
      </nav>

      <div className="pb-4 border-b-2 border-[#111111]">
        <h1 className="font-display text-4xl sm:text-5xl text-[#111111]">
          Delivery & Returns Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#111111]/80 max-w-xl mt-1">
          Honest pricing, plastic-free fulfillment, and an effortless 30-day home trial process.
        </p>
      </div>

      {/* Grid of Key Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Policy 1: Shipping Methods */}
        <div className="border-2 border-[#111111] bg-[#FAEDCD] p-6 sm:p-8 space-y-4">
          <div className="w-10 h-10 bg-[#CCD5AE] border border-[#111111] flex items-center justify-center">
            <Truck className="w-5 h-5 text-[#111111]" />
          </div>
          <h2 className="font-display text-2xl text-[#111111]">
            1. Shipping Options & Rates
          </h2>
          <div className="space-y-3 text-xs leading-relaxed font-body text-[#111111]/90">
            <div className="p-3 bg-[#FEFAE0] border border-[#111111]">
              <p className="font-cta uppercase text-[11px]">Standard Carbon-Neutral Delivery</p>
              <p className="font-mono font-bold mt-0.5">$8.00 flat rate · FREE on orders over $120</p>
              <p className="text-[11px] text-[#111111]/70 mt-1">Transit time: 3–5 business days with door-to-door tracking.</p>
            </div>

            <div className="p-3 bg-[#FEFAE0] border border-[#111111]">
              <p className="font-cta uppercase text-[11px]">Express Priority Air Courier</p>
              <p className="font-mono font-bold mt-0.5">$18.00 flat rate</p>
              <p className="text-[11px] text-[#111111]/70 mt-1">Transit time: 1–2 business days with prioritized packing.</p>
            </div>

            <p className="pt-1">
              All orders placed before 2:00 PM EST on standard business days are transferred to our carrier partners on the exact same day.
            </p>
          </div>
        </div>

        {/* Policy 2: 30-Day Returns */}
        <div className="border-2 border-[#111111] bg-[#FAEDCD] p-6 sm:p-8 space-y-4">
          <div className="w-10 h-10 bg-[#CCD5AE] border border-[#111111] flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-[#111111]" />
          </div>
          <h2 className="font-display text-2xl text-[#111111]">
            2. The 30-Day Home Trial
          </h2>
          <div className="space-y-3 text-xs leading-relaxed font-body text-[#111111]/90">
            <p>
              Clothing should be assessed in your own lighting, paired with your own shoes, and worn calmly at home.
            </p>
            <p>
              You have 30 calendar days from the date of package delivery to return or exchange any garment.
            </p>
            <div className="p-3 bg-[#E9EDC9] border border-[#111111] space-y-1 font-mono text-[11px]">
              <p className="font-bold">Conditions for Full Refund:</p>
              <p>• Unwashed and unworn condition</p>
              <p>• Internal care tags attached and unaltered</p>
              <p>• Returned in original or suitable protective paper packaging</p>
            </div>
          </div>
        </div>

        {/* Policy 3: Return Instructions */}
        <div className="border-2 border-[#111111] bg-[#FAEDCD] p-6 sm:p-8 space-y-4">
          <div className="w-10 h-10 bg-[#CCD5AE] border border-[#111111] flex items-center justify-center">
            <Package className="w-5 h-5 text-[#111111]" />
          </div>
          <h2 className="font-display text-2xl text-[#111111]">
            3. How To Initiate A Return
          </h2>
          <div className="space-y-2 text-xs leading-relaxed font-body text-[#111111]/90">
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>Locate your order receipt:</strong> Have your order reference (HLD-XXXXXX) ready from your confirmation email.
              </li>
              <li>
                <strong>Apply the prepaid shipping label:</strong> Every Halden package contains an adhesive peel-and-stick prepaid return label inside the box.
              </li>
              <li>
                <strong>Hand off parcel:</strong> Drop the package off at any authorized regional postal or courier drop-box.
              </li>
              <li>
                <strong>Immediate inspection & refund:</strong> Once scanned at our depot, funds are released back to your card within 48 hours.
              </li>
            </ol>
          </div>
        </div>

        {/* Policy 4: Eco Packaging */}
        <div className="border-2 border-[#111111] bg-[#FAEDCD] p-6 sm:p-8 space-y-4">
          <div className="w-10 h-10 bg-[#CCD5AE] border border-[#111111] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#111111]" />
          </div>
          <h2 className="font-display text-2xl text-[#111111]">
            4. Plastic-Free Packaging
          </h2>
          <div className="space-y-3 text-xs leading-relaxed font-body text-[#111111]/90">
            <p>
              Traditional apparel shipping relies on individual poly-bags that end up in landfills. Halden wraps all garments in unbleached FSC-certified tissue paper and water-activated paper tape.
            </p>
            <p>
              Our outer shipping cartons are made from 100% recycled unprinted cardboard and are fully kerbside recyclable.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Track Order Callout */}
      <div className="p-8 bg-[#CCD5AE] border-2 border-[#111111] flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-display text-2xl text-[#111111]">Have an existing shipment en route?</h3>
          <p className="text-xs text-[#111111]/80 mt-1">
            Track your milestones from our logistics depot to your doorstep.
          </p>
        </div>
        <Link
          to="/track"
          className="px-6 py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <span>Track Order Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
