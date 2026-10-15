import React from 'react';
import { PolicyLayout } from '../components/layout/PolicyLayout';
import { usePageMeta } from '../hooks/usePageMeta';

export const PrivacyPolicyPage: React.FC = () => {
  usePageMeta({
    title: 'Privacy Policy',
    description: 'Privacy policy and data protection practices at Halden.',
  });
  const toc = [
    { id: 'overview', label: '1. Overview & Data Philosophy' },
    { id: 'collection', label: '2. Information We Collect' },
    { id: 'usage', label: '3. How We Use Your Data' },
    { id: 'sharing', label: '4. Third-Party Disclosures' },
    { id: 'security', label: '5. Security & Storage' },
    { id: 'rights', label: '6. Your Rights & Data Portability' },
  ];

  return (
    <PolicyLayout
      title="Privacy Policy"
      lastUpdated="October 2026"
      tableOfContents={toc}
    >
      <section id="overview" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">1. Overview & Data Philosophy</h2>
        <p>
          Halden Clothiers Ltd. ("Halden", "we", "us") respects the fundamental privacy of every patron. We treat your personal data with the same restraint that guides our textile design: minimal, deliberate, and free from invasive surveillance algorithms.
        </p>
        <p>
          This policy details how we process contact, shipping, and transaction records when you browse halden.com, order from our mill batches, or contact our customer desk.
        </p>
      </section>

      <section id="collection" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">2. Information We Collect</h2>
        <p>We collect only the details necessary to deliver clothing and support your orders:</p>
        <ul className="list-disc pl-5 space-y-1.5 font-mono text-xs">
          <li><strong>Contact & Identity:</strong> Full name, email address, and telephone number provided during checkout or account registration.</li>
          <li><strong>Shipping Information:</strong> Physical mailing address, apartment or suite number, city, postal code, and country.</li>
          <li><strong>Transactional Metadata:</strong> Order timestamps, items ordered, size/color variant choices, delivery methods, and total amounts paid in USD.</li>
          <li><strong>Payment Tokens:</strong> We never store full credit card numbers or security CVV codes. Card transactions are processed securely through certified PCI-DSS Level 1 gateways; our database retains only the card brand and the final four digits for order identification.</li>
          <li><strong>Customer Communications:</strong> Inquiries sent via our contact desk and verified customer product reviews.</li>
        </ul>
      </section>

      <section id="usage" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">3. How We Use Your Data</h2>
        <p>Your data is used exclusively to fulfill our contractual commitments:</p>
        <ul className="list-disc pl-5 space-y-1.5 font-mono text-xs">
          <li>Assembling, packaging, and dispatching your garments from our Northern European dispatch terminal.</li>
          <li>Generating door-to-door courier tracking links and delivery status updates.</li>
          <li>Processing authorized returns, size exchanges, and refunds within our 30-day window.</li>
          <li>Sending the Halden Dispatch newsletter strictly when you have provided explicit opt-in consent.</li>
        </ul>
      </section>

      <section id="sharing" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">4. Third-Party Disclosures</h2>
        <p>
          We do not sell, rent, or trade your personal information to data brokers, advertising networks, or social media trackers. We share information strictly with essential fulfillment partners:
        </p>
        <p>
          <strong>Courier Services:</strong> Door-to-door logistics partners (e.g. DHL Express, FedEx, UPS) receive your name, address, and phone number solely to deliver parcels.
        </p>
        <p>
          <strong>Payment Infrastructure:</strong> PCI-compliant processors to authenticate and clear payment authorizations.
        </p>
      </section>

      <section id="security" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">5. Security & Storage</h2>
        <p>
          All transmitted data is encrypted in transit using industry-standard TLS 1.3 cryptographic protocols. Databases are stored behind hardened virtual private firewalls with strict role-based access controls.
        </p>
      </section>

      <section id="rights" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">6. Your Rights & Data Portability</h2>
        <p>
          Under applicable data protection laws (including GDPR and CCPA), you may request a copy of all personal records we hold about you, request rectification of inaccurate records, or request complete deletion of your account and personal history.
        </p>
        <p>
          To exercise your rights, email our compliance officer at privacy@halden.com.
        </p>
      </section>
    </PolicyLayout>
  );
};
