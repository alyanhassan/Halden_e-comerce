import React from 'react';
import { Link } from 'react-router-dom';
import { Img } from '../components/common/Img';
import { collectionImages, getImageUrl } from '../data/images';
import { usePageMeta } from '../hooks/usePageMeta';

export const AboutPage: React.FC = () => {
  usePageMeta({
    title: 'The Manifesto',
    description: 'The architecture of ordinary garments. Halden philosophy and heritage fabric mills.',
  });
  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12">
      {/* 1. Header Banner */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-xs font-mono text-[#111111]/70 mb-4">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="font-bold text-[#111111]">About</span>
        </nav>

        <div className="border-2 border-[#111111] bg-[#FAEDCD] p-8 sm:p-14 space-y-4">
          <p className="font-slogan italic text-base text-[#111111]/80">
            "Everyday, done properly."
          </p>
          <h1 className="font-display text-4xl sm:text-6xl text-[#111111] leading-tight max-w-3xl">
            The Architecture of Ordinary Garments
          </h1>
          <p className="text-sm sm:text-base text-[#111111]/80 max-w-2xl leading-relaxed">
            Halden was founded on a simple dissatisfaction: the modern fashion industry produces disposable basics engineered to degrade quickly so customers buy replacements every season. We do the opposite.
          </p>
        </div>
      </section>

      {/* 2. Split Story Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 border-2 border-[#111111] bg-[#FEFAE0]">
          {/* Photo */}
          <div className="lg:col-span-7 bg-[#CCD5AE] border-b-2 lg:border-b-0 lg:border-r-2 border-[#111111]">
            <Img
              src={getImageUrl(collectionImages.shirts[0], 900)}
              alt="Heritage Textile Knitting Atelier"
              aspectRatio="4:5"
              size={900}
              objectPosition="center 20%"
              className="w-full h-full min-h-[380px] sm:min-h-[500px]"
              imgClassName="w-full h-full object-cover"
            />
          </div>

          {/* Text Story */}
          <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-[#FAEDCD] space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] font-cta uppercase tracking-widest text-[#111111]/60">
                Origins & Provenance
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#111111]">
                Heritage Mills, Not Anonymous Factories.
              </h2>
              <p className="text-xs sm:text-sm text-[#111111]/80 leading-relaxed font-body">
                Our fleece and terry knits are manufactured in Guimarães, Portugal, at a family-owned mill that has specialized in circular cotton knitting since 1974.
              </p>
              <p className="text-xs sm:text-sm text-[#111111]/80 leading-relaxed font-body">
                Our tailoring fabrics come from Biella, Italy, where century-old hydro-powered mills spin Super 120s tropical merino wool with natural water repellence and crease recovery.
              </p>
            </div>

            <div className="p-4 bg-[#E9EDC9] border border-[#111111] text-xs font-mono space-y-1">
              <p className="font-bold text-[#111111]">Our Fiber Commitment:</p>
              <p className="text-[#111111]/80">• 100% GOTS organic cottons</p>
              <p className="text-[#111111]/80">• 0% virgin polyester or synthetic blends in our main garments</p>
              <p className="text-[#111111]/80">• Natural horn and corozo nut buttons</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mill Craft Photo & Core Values */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-2 border-[#111111] bg-[#FAEDCD] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-center space-y-4">
            <span className="text-[10px] font-cta uppercase tracking-widest text-[#111111]/60">
              Pattern Discipline
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#111111]">
              Engineered For The Real Human Form.
            </h2>
            <p className="text-xs sm:text-sm text-[#111111]/80 leading-relaxed font-body">
              Every curve, shoulder drop, and gusset is prototyped in multiple iterations. We test garments by wearing and laundering them repeatedly before approving any batch for production.
            </p>
          </div>
          <div className="lg:col-span-7 bg-[#E9EDC9] border-t-2 lg:border-t-0 lg:border-l-2 border-[#111111]">
            <Img
              src={getImageUrl(collectionImages.hoodies[0], 900)}
              alt="Halden Garment Craft and Fit Study"
              aspectRatio="16:9"
              size={900}
              objectPosition="center 20%"
              className="w-full h-full min-h-[300px] sm:min-h-[400px]"
              imgClassName="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="border border-[#111111] bg-[#FAEDCD] p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="text-[11px] font-cta uppercase tracking-widest text-[#111111]/60">
              Foundational Principles
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-[#111111] mt-1">
              The Three Halden Tenets
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#111111]/20">
            <div className="pt-6 md:pt-0 md:px-6 space-y-3">
              <span className="font-mono text-xs font-bold bg-[#FEFAE0] px-2.5 py-1 border border-[#111111]">
                01
              </span>
              <h3 className="font-display text-xl text-[#111111] pt-2">
                Uncompromised Gauge
              </h3>
              <p className="text-xs text-[#111111]/80 leading-relaxed">
                We specify yarn weights 30% denser than mainstream retail (480gsm fleece, 260gsm jersey) so garments maintain structural integrity through years of washing.
              </p>
            </div>

            <div className="pt-6 md:pt-0 md:px-6 space-y-3">
              <span className="font-mono text-xs font-bold bg-[#FEFAE0] px-2.5 py-1 border border-[#111111]">
                02
              </span>
              <h3 className="font-display text-xl text-[#111111] pt-2">
                Zero Logo Clutter
              </h3>
              <p className="text-xs text-[#111111]/80 leading-relaxed">
                No printed logos, rubber patches, or marketing tags on garment exteriors. You are wearing your own style, not advertising a company.
              </p>
            </div>

            <div className="pt-6 md:pt-0 md:px-6 space-y-3">
              <span className="font-mono text-xs font-bold bg-[#FEFAE0] px-2.5 py-1 border border-[#111111]">
                03
              </span>
              <h3 className="font-display text-xl text-[#111111] pt-2">
                Radical Permanence
              </h3>
              <p className="text-xs text-[#111111]/80 leading-relaxed">
                We do not create quarterly discount sales or artificial dead-stock panics. Our catalog remains permanent, restocked continuously in small conscious batches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA */}
      <section className="max-w-2xl mx-auto px-4 text-center space-y-4">
        <h3 className="font-display text-3xl text-[#111111]">
          Ready to experience the difference?
        </h3>
        <p className="text-xs text-[#111111]/80">
          Try any garment at home. Enjoy complimentary shipping on orders over $120 and 30-day hassle-free returns.
        </p>
        <div className="pt-2">
          <Link
            to="/shop"
            className="inline-block px-8 py-3.5 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors"
          >
            Shop The Core Matrix
          </Link>
        </div>
      </section>
    </div>
  );
};
