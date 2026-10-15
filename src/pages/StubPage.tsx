import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

interface StubPageProps {
  title: string;
  subtitle: string;
  category?: string;
  details?: string;
}

export const StubPage: React.FC<StubPageProps> = ({
  title,
  subtitle,
  category = 'Halden Archive',
  details,
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-cta uppercase hover:underline mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>

      <div className="border-2 border-[#111111] bg-[#FAEDCD] p-8 sm:p-12 space-y-6">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[#CCD5AE] border border-[#111111] text-[10px] font-cta uppercase tracking-wider text-[#111111]">
            Step 2 Architecture
          </span>
          <span className="text-xs font-mono text-[#111111]/60">
            {category}
          </span>
        </div>

        <div>
          <h1 className="font-display text-4xl sm:text-5xl text-[#111111] leading-tight">
            {title}
          </h1>
          <p className="font-slogan italic text-sm text-[#111111]/80 mt-1">
            "Everyday, done properly."
          </p>
        </div>

        <p className="text-sm text-[#111111]/80 leading-relaxed font-body">
          {subtitle}
        </p>

        {details && (
          <div className="p-4 bg-[#FEFAE0] border border-[#111111] text-xs font-mono space-y-1">
            <p className="font-bold text-[#111111]">Route Specification:</p>
            <p className="text-[#111111]/80">{details}</p>
          </div>
        )}

        <div className="p-4 bg-[#E9EDC9] border border-[#111111] flex items-center gap-3 text-xs">
          <Clock className="w-5 h-5 flex-shrink-0 text-[#111111]" />
          <div>
            <p className="font-bold uppercase font-cta">Coming in the next step</p>
            <p className="text-[#111111]/80">
              This module will be connected with full database models and persistence in the subsequent iteration.
            </p>
          </div>
        </div>

        <div className="pt-2 flex gap-4">
          <Link
            to="/shop"
            className="px-6 py-3 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};
