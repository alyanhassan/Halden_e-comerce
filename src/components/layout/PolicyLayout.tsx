import React from 'react';
import { Link } from 'react-router-dom';

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  tableOfContents: Array<{ id: string; label: string }>;
  children: React.ReactNode;
}

export const PolicyLayout: React.FC<PolicyLayoutProps> = ({
  title,
  lastUpdated,
  tableOfContents,
  children,
}) => {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-xs font-mono text-[#111111]/70 mb-6">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-[#111111]">{title}</span>
      </nav>

      {/* Header */}
      <header className="border-b-2 border-[#111111] pb-8 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-cta uppercase tracking-widest text-[#111111]/60">
              Halden Legal & Governance
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#111111] mt-2">
              {title}
            </h1>
          </div>
          <div className="text-right sm:text-right font-mono text-xs text-[#111111]/70">
            <p>Last updated: {lastUpdated}</p>
            <p className="text-[11px] text-amber-900 font-bold bg-[#FAEDCD] px-2 py-0.5 mt-1 border border-[#111111] inline-block">
              Demo store. Placeholder policy text.
            </p>
          </div>
        </div>
      </header>

      {/* Content Grid: Left Sticky TOC, Right Policy Copy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        
        {/* Sticky Table of Contents (Desktop) */}
        {tableOfContents.length > 0 && (
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 border border-[#111111] bg-[#FAEDCD] p-6">
            <h2 className="font-cta text-xs uppercase tracking-wider text-[#111111] mb-4 pb-2 border-b border-[#111111]/30">
              Table of Contents
            </h2>
            <nav aria-label="Table of contents">
              <ul className="space-y-2.5 text-xs font-mono">
                {tableOfContents.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-[#111111]/80 hover:text-[#111111] hover:underline block transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-8 pt-4 border-t border-[#111111]/20 text-[11px] text-[#111111]/70 font-body">
              Questions? Contact our care team at{' '}
              <Link to="/contact" className="underline font-bold text-[#111111]">
                concierge@halden.com
              </Link>
            </div>
          </aside>
        )}

        {/* Policy Body */}
        <article className={`space-y-10 text-xs sm:text-sm font-body leading-relaxed text-[#111111]/90 ${
          tableOfContents.length > 0 ? 'lg:col-span-8 max-w-3xl' : 'lg:col-span-12 max-w-4xl mx-auto'
        }`}>
          {children}

          {/* Footer note */}
          <div className="pt-10 border-t border-[#111111]/30 font-mono text-xs text-[#111111]/60">
            <p>Demo store. Placeholder policy text.</p>
            <p className="mt-1">Halden Clothiers Ltd. · Northern European Dispatch Terminal</p>
          </div>
        </article>

      </div>
    </div>
  );
};
