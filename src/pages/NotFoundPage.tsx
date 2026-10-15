import React from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

export const NotFoundPage: React.FC = () => {
  usePageMeta({
    title: 'Page Not Found',
    description: 'The requested garment or document was not found.',
  });
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 sm:py-28 text-center space-y-6">
      <div className="inline-block p-4 bg-[#FAEDCD] border-2 border-[#111111]">
        <p className="font-display text-6xl text-[#111111]">404</p>
      </div>

      <h1 className="font-display text-3xl sm:text-4xl text-[#111111]">
        Page Not Found
      </h1>

      <p className="text-xs sm:text-sm text-[#111111]/80 max-w-md mx-auto leading-relaxed">
        The garment or page you are searching for does not exist in the Halden directory. It may have been archived or the link might be incorrect.
      </p>

      <div className="pt-4 flex justify-center">
        <Link
          to="/shop"
          className="px-8 py-4 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase border border-[#111111] hover:bg-[#333333] transition-colors"
        >
          Explore The Catalog
        </Link>
      </div>
    </div>
  );
};
