import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUI } from '../../context/UIContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, closeSizeGuide } = useUI();
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const reducedMotion = useReducedMotion();

  const measurements = [
    { size: 'S', chestIn: '36 - 38', waistIn: '29 - 31', lengthIn: '27.5', chestCm: '91 - 96', waistCm: '74 - 79', lengthCm: '70' },
    { size: 'M', chestIn: '39 - 41', waistIn: '32 - 34', lengthIn: '28.5', chestCm: '99 - 104', waistCm: '81 - 86', lengthCm: '72' },
    { size: 'L', chestIn: '42 - 44', waistIn: '35 - 37', lengthIn: '29.5', chestCm: '107 - 112', waistCm: '89 - 94', lengthCm: '75' },
    { size: 'XL', chestIn: '45 - 48', waistIn: '38 - 41', lengthIn: '30.5', chestCm: '114 - 122', waistCm: '96 - 104', lengthCm: '77' },
  ];

  return (
    <AnimatePresence>
      {isSizeGuideOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Size Guide Modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-[#111111]/70"
            onClick={closeSizeGuide}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#FEFAE0] border-2 border-[#111111] max-w-xl w-full p-6 sm:p-8 relative z-10"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeSizeGuide}
              className="absolute top-4 right-4 p-2 border border-[#111111] hover:bg-[#FAEDCD] text-[#111111] transition-colors"
              aria-label="Close size guide"
            >
              <X className="w-5 h-5" />
            </button>

        {/* Header */}
        <div className="mb-6">
          <p className="text-[11px] font-cta uppercase tracking-widest text-[#111111]/60">
            Halden Sizing Matrix
          </p>
          <h2 className="font-display text-2xl sm:text-3xl text-[#111111] mt-1">
            Garment Dimensions
          </h2>
          <p className="text-xs text-[#111111]/80 mt-1">
            All Halden garments are cut true to European sizing with a relaxed, modern silhouette.
          </p>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center justify-end mb-4">
          <div className="border border-[#111111] p-0.5 bg-[#E9EDC9] flex">
            <button
              type="button"
              onClick={() => setUnit('in')}
              className={`px-3 py-1 text-xs font-cta uppercase transition-colors ${
                unit === 'in' ? 'bg-[#111111] text-[#FEFAE0]' : 'text-[#111111]'
              }`}
            >
              Inches
            </button>
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 text-xs font-cta uppercase transition-colors ${
                unit === 'cm' ? 'bg-[#111111] text-[#FEFAE0]' : 'text-[#111111]'
              }`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#111111]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAEDCD] border-b border-[#111111] font-cta uppercase">
                <th className="p-3 border-r border-[#111111]">Size</th>
                <th className="p-3 border-r border-[#111111]">Chest ({unit})</th>
                <th className="p-3 border-r border-[#111111]">Waist ({unit})</th>
                <th className="p-3">Length ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/20 font-mono">
              {measurements.map((row) => (
                <tr key={row.size} className="hover:bg-[#E9EDC9]/50 transition-colors">
                  <td className="p-3 font-bold border-r border-[#111111]/20 bg-[#FAEDCD]/40">
                    {row.size}
                  </td>
                  <td className="p-3 border-r border-[#111111]/20">
                    {unit === 'in' ? row.chestIn : row.chestCm}
                  </td>
                  <td className="p-3 border-r border-[#111111]/20">
                    {unit === 'in' ? row.waistIn : row.waistCm}
                  </td>
                  <td className="p-3">
                    {unit === 'in' ? row.lengthIn : row.lengthCm}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sizing Note */}
        <div className="mt-6 p-3 bg-[#E9EDC9] border border-[#111111] text-[11px] text-[#111111]">
          <strong>Fitting Advice:</strong> If you prefer an oversized boxy aesthetic, we suggest ordering one size up. All knitwear is pre-washed to reduce laundering shrinkage to under 2%.
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};
