import React, { useState } from 'react';
import { PolicyLayout } from '../components/layout/PolicyLayout';
import { usePageMeta } from '../hooks/usePageMeta';

export const CookiesPage: React.FC = () => {
  usePageMeta({
    title: 'Cookie Settings',
    description: 'Cookie categories and data tracking preferences.',
  });
  const [analyticsOptOut, setAnalyticsOptOut] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const toc = [
    { id: 'definition', label: '1. What Are Cookies' },
    { id: 'categories', label: '2. Cookie Categories We Use' },
    { id: 'third-party', label: '3. Third-Party Technologies' },
    { id: 'management', label: '4. Managing Your Preferences' },
  ];

  const handleSavePreferences = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <PolicyLayout
      title="Cookie Policy"
      lastUpdated="October 2026"
      tableOfContents={toc}
    >
      <section id="definition" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">1. What Are Cookies</h2>
        <p>
          Cookies and local browser storage are small text data elements saved on your computing device when loading websites. They remember your active shopping basket, saved wishlist garments, and security authentication credentials across browsing sessions.
        </p>
      </section>

      <section id="categories" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">2. Cookie Categories We Use</h2>
        <div className="space-y-4">
          <div className="border border-[#111111] bg-[#FAEDCD] p-4">
            <h3 className="font-cta text-xs uppercase text-[#111111]">A. Essential Operational Storage (Strictly Necessary)</h3>
            <p className="text-xs text-[#111111]/80 mt-1">
              Required to allow you to navigate the store, add hoodies and trousers to your bag, remember active promotional vouchers (such as HALDEN10), and complete checkout. These cannot be disabled.
            </p>
          </div>

          <div className="border border-[#111111] bg-[#FAEDCD] p-4">
            <h3 className="font-cta text-xs uppercase text-[#111111]">B. Functional Preferences</h3>
            <p className="text-xs text-[#111111]/80 mt-1">
              Maintains your persistent wishlist items, recently viewed filters, and preferred sizing units (inches versus centimeters).
            </p>
          </div>

          <div className="border border-[#111111] bg-[#FAEDCD] p-4">
            <h3 className="font-cta text-xs uppercase text-[#111111]">C. Anonymized Performance Metrics</h3>
            <p className="text-xs text-[#111111]/80 mt-1">
              Measures page rendering velocity, browser rendering bottlenecks, and error rates to help our engineering team keep browsing smooth and responsive.
            </p>
          </div>
        </div>
      </section>

      <section id="third-party" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">3. Third-Party Technologies</h2>
        <p>
          Halden rejects invasive cross-site tracking pixels and third-party advertising retargeting cookies. We do not deploy third-party advertising cookies that track you across outside digital properties.
        </p>
      </section>

      <section id="management" className="space-y-4">
        <h2 className="font-display text-2xl text-[#111111]">4. Managing Your Preferences</h2>
        <p>
          You can toggle performance analytics tracking for this browser session below:
        </p>

        <div className="p-6 border-2 border-[#111111] bg-[#FAEDCD] space-y-4 max-w-lg">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={analyticsOptOut}
              onChange={(e) => setAnalyticsOptOut(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#111111]"
            />
            <div>
              <p className="font-cta text-xs uppercase text-[#111111]">Opt-out of anonymous performance metrics</p>
              <p className="text-[11px] text-[#111111]/70 font-mono mt-0.5">
                Disable diagnostic telemetry for this browser session.
              </p>
            </div>
          </label>

          <button
            type="button"
            onClick={handleSavePreferences}
            className="px-5 py-2.5 bg-[#111111] text-[#FEFAE0] font-cta text-xs uppercase hover:bg-[#333333] transition-colors"
          >
            Save Cookie Preferences
          </button>

          {savedMessage && (
            <p className="text-xs font-mono text-emerald-800 font-bold">
              ✓ Preferences updated for this browser.
            </p>
          )}
        </div>
      </section>
    </PolicyLayout>
  );
};
