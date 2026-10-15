import React, { useState } from 'react';
import { PolicyLayout } from '../components/layout/PolicyLayout';
import { usePageMeta } from '../hooks/usePageMeta';

export const SizeGuidePage: React.FC = () => {
  usePageMeta({
    title: 'Size Guide',
    description: 'Detailed measurements and fit guide for Halden hoodies, shirts, pants, and trousers.',
  });

  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  const toc = [
    { id: 'hoodies', label: '1. Heavyweight Hoodies & Fleece' },
    { id: 'shirts', label: '2. Woven Shirts & Carded Tees' },
    { id: 'pants', label: '3. Everyday Pants & Canvas' },
    { id: 'trousers', label: '4. Tailored Wool & Linen Trousers' },
    { id: 'how-to-measure', label: '5. How to Measure Your Body' },
  ];

  return (
    <PolicyLayout
      title="Garment Sizing Matrix"
      lastUpdated="October 2026"
      tableOfContents={toc}
    >
      <div className="flex justify-between items-center bg-[#FAEDCD] p-4 border border-[#111111] mb-6">
        <div>
          <p className="font-cta text-xs uppercase text-[#111111]">Measurement Units</p>
          <p className="text-[11px] font-mono text-[#111111]/70">Toggle between imperial inches and metric centimeters</p>
        </div>

        <div className="flex border border-[#111111] bg-[#FEFAE0]">
          <button
            type="button"
            onClick={() => setUnit('in')}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors ${
              unit === 'in' ? 'bg-[#111111] text-[#FEFAE0]' : 'text-[#111111] hover:bg-[#FAEDCD]'
            }`}
          >
            Inches
          </button>
          <button
            type="button"
            onClick={() => setUnit('cm')}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors ${
              unit === 'cm' ? 'bg-[#111111] text-[#FEFAE0]' : 'text-[#111111] hover:bg-[#FAEDCD]'
            }`}
          >
            Centimeters
          </button>
        </div>
      </div>

      {/* 1. Hoodies */}
      <section id="hoodies" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">1. Heavyweight Hoodies & Fleece</h2>
        <p className="text-xs text-[#111111]/80">
          Cut with a relaxed European boxy drape, dropped shoulders, and pre-shrunk loopback fleece.
        </p>
        <div className="overflow-x-auto border border-[#111111]">
          <table className="w-full text-left text-xs font-mono border-collapse bg-[#FEFAE0]">
            <thead>
              <tr className="bg-[#FAEDCD] border-b border-[#111111] font-cta text-[11px]">
                <th className="p-3 border-r border-[#111111]">Size</th>
                <th className="p-3 border-r border-[#111111]">Chest ({unit})</th>
                <th className="p-3 border-r border-[#111111]">Body Length ({unit})</th>
                <th className="p-3 border-r border-[#111111]">Sleeve Length ({unit})</th>
                <th className="p-3">Shoulder Width ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/20">
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">S</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '42' : '107'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '26.5' : '67'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '33.5' : '85'}</td>
                <td className="p-3">{unit === 'in' ? '19.5' : '49.5'}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">M</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '45' : '114'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '27.5' : '70'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '34.5' : '88'}</td>
                <td className="p-3">{unit === 'in' ? '20.5' : '52'}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">L</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '48' : '122'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '28.5' : '72'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '35.5' : '90'}</td>
                <td className="p-3">{unit === 'in' ? '21.5' : '54.5'}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">XL</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '51' : '130'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '29.5' : '75'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '36.5' : '93'}</td>
                <td className="p-3">{unit === 'in' ? '22.5' : '57'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Shirts */}
      <section id="shirts" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">2. Woven Shirts & Carded Tees</h2>
        <p className="text-xs text-[#111111]/80">
          Tailored through the yoke with a straight side-seam and generous armhole allowance.
        </p>
        <div className="overflow-x-auto border border-[#111111]">
          <table className="w-full text-left text-xs font-mono border-collapse bg-[#FEFAE0]">
            <thead>
              <tr className="bg-[#FAEDCD] border-b border-[#111111] font-cta text-[11px]">
                <th className="p-3 border-r border-[#111111]">Size</th>
                <th className="p-3 border-r border-[#111111]">Neck Collar ({unit})</th>
                <th className="p-3 border-r border-[#111111]">Chest ({unit})</th>
                <th className="p-3 border-r border-[#111111]">Back Length ({unit})</th>
                <th className="p-3">Sleeve ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/20">
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">S</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '15.0' : '38'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '40' : '102'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '29.0' : '74'}</td>
                <td className="p-3">{unit === 'in' ? '33.0' : '84'}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">M</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '15.5' : '39.5'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '42' : '107'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '30.0' : '76'}</td>
                <td className="p-3">{unit === 'in' ? '34.0' : '86'}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">L</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '16.5' : '42'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '45' : '114'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '30.5' : '77.5'}</td>
                <td className="p-3">{unit === 'in' ? '35.0' : '89'}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">XL</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '17.5' : '44.5'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '48' : '122'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '31.5' : '80'}</td>
                <td className="p-3">{unit === 'in' ? '36.0' : '91'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Pants */}
      <section id="pants" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">3. Everyday Pants & Canvas</h2>
        <p className="text-xs text-[#111111]/80">
          Straight leg workwear silhouette engineered to break naturally over heavy boots and loafers.
        </p>
        <div className="overflow-x-auto border border-[#111111]">
          <table className="w-full text-left text-xs font-mono border-collapse bg-[#FEFAE0]">
            <thead>
              <tr className="bg-[#FAEDCD] border-b border-[#111111] font-cta text-[11px]">
                <th className="p-3 border-r border-[#111111]">Size</th>
                <th className="p-3 border-r border-[#111111]">Waist ({unit})</th>
                <th className="p-3 border-r border-[#111111]">Inseam ({unit})</th>
                <th className="p-3 border-r border-[#111111]">Thigh ({unit})</th>
                <th className="p-3">Leg Opening ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/20">
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">S (30)</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '30 - 31' : '76 - 79'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '31.5' : '80'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '24.0' : '61'}</td>
                <td className="p-3">{unit === 'in' ? '16.5' : '42'}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">M (32)</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '32 - 33' : '81 - 84'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '32.0' : '81'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '25.0' : '63.5'}</td>
                <td className="p-3">{unit === 'in' ? '17.0' : '43'}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">L (34)</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '34 - 35' : '86 - 89'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '32.5' : '82.5'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '26.0' : '66'}</td>
                <td className="p-3">{unit === 'in' ? '17.5' : '44.5'}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">XL (36)</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '36 - 38' : '91 - 96'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '33.0' : '84'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '27.5' : '70'}</td>
                <td className="p-3">{unit === 'in' ? '18.0' : '46'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Trousers */}
      <section id="trousers" className="space-y-3">
        <h2 className="font-display text-2xl text-[#111111]">4. Tailored Wool & Linen Trousers</h2>
        <p className="text-xs text-[#111111]/80">
          Mid-to-high rise tailored with an internal curtain waistband, single pleat, and 4cm blind hem allowance for tailor alterations.
        </p>
        <div className="overflow-x-auto border border-[#111111]">
          <table className="w-full text-left text-xs font-mono border-collapse bg-[#FEFAE0]">
            <thead>
              <tr className="bg-[#FAEDCD] border-b border-[#111111] font-cta text-[11px]">
                <th className="p-3 border-r border-[#111111]">Size</th>
                <th className="p-3 border-r border-[#111111]">Waist ({unit})</th>
                <th className="p-3 border-r border-[#111111]">Rise ({unit})</th>
                <th className="p-3 border-r border-[#111111]">Inseam ({unit})</th>
                <th className="p-3">Hem Opening ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/20">
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">S (EU 46)</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '31.0' : '79'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '11.5' : '29'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '32.0' : '81'}</td>
                <td className="p-3">{unit === 'in' ? '16.0' : '40.5'}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">M (EU 48)</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '33.0' : '84'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '12.0' : '30.5'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '32.5' : '82.5'}</td>
                <td className="p-3">{unit === 'in' ? '16.5' : '42'}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">L (EU 50)</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '35.0' : '89'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '12.5' : '32'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '33.0' : '84'}</td>
                <td className="p-3">{unit === 'in' ? '17.0' : '43'}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold border-r border-[#111111]">XL (EU 52)</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '37.0' : '94'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '13.0' : '33'}</td>
                <td className="p-3 border-r border-[#111111]">{unit === 'in' ? '33.5' : '85'}</td>
                <td className="p-3">{unit === 'in' ? '17.5' : '44.5'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. How to measure */}
      <section id="how-to-measure" className="space-y-4 pt-4 border-t border-[#111111]/20">
        <h2 className="font-display text-2xl text-[#111111]">5. How to Measure Your Body</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="border border-[#111111] p-4 bg-[#FAEDCD] space-y-2">
            <h3 className="font-cta text-xs uppercase text-[#111111]">Chest Measurement</h3>
            <p className="leading-relaxed">
              Wrap a flexible tailor tape measure under your armpits across the fullest crest of your chest. Keep the tape horizontal to the floor without pinching.
            </p>
          </div>
          <div className="border border-[#111111] p-4 bg-[#FAEDCD] space-y-2">
            <h3 className="font-cta text-xs uppercase text-[#111111]">Natural Waist</h3>
            <p className="leading-relaxed">
              Measure around your natural waistline, slightly above your hip bones where your body naturally creases when bending sideways.
            </p>
          </div>
          <div className="border border-[#111111] p-4 bg-[#FAEDCD] space-y-2">
            <h3 className="font-cta text-xs uppercase text-[#111111]">Trouser Inseam</h3>
            <p className="leading-relaxed">
              Measure vertically along the inner leg from the lowest point of the crotch seam straight down to your ankle bone.
            </p>
          </div>
          <div className="border border-[#111111] p-4 bg-[#FAEDCD] space-y-2">
            <h3 className="font-cta text-xs uppercase text-[#111111]">Sleeve Length</h3>
            <p className="leading-relaxed">
              With your arm slightly bent at a 90-degree angle, measure from the center-back base of your neck across your shoulder point and down to your wrist bone.
            </p>
          </div>
        </div>
      </section>
    </PolicyLayout>
  );
};
