import React from 'react';

interface PlaceholderImageProps {
  label?: string;
  category?: string;
  aspectRatio?: '4:5' | '16:9' | '1:1' | '3:4';
  bgColor?: string;
  className?: string;
  alt?: string;
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  label,
  category,
  aspectRatio = '4:5',
  bgColor = '#E9EDC9',
  className = '',
  alt,
}) => {
  const aspectClass =
    aspectRatio === '4:5'
      ? 'aspect-[4/5]'
      : aspectRatio === '16:9'
      ? 'aspect-[16/9]'
      : aspectRatio === '1:1'
      ? 'aspect-square'
      : 'aspect-[3/4]';

  return (
    <div
      className={`relative w-full ${aspectClass} flex flex-col items-center justify-center p-4 border border-[#111111]/15 overflow-hidden select-none ${className}`}
      style={{ backgroundColor: bgColor }}
      role="img"
      aria-label={alt || label || 'Halden product placeholder'}
    >
      {/* Corner registration marks */}
      <span className="absolute top-2 left-2 text-[9px] font-mono tracking-widest text-[#111111]/40 uppercase pointer-events-none">
        HLD
      </span>
      <span className="absolute bottom-2 right-2 text-[9px] font-mono tracking-widest text-[#111111]/40 uppercase pointer-events-none">
        {aspectRatio}
      </span>

      {/* Center typography */}
      <div className="text-center px-2 z-10 pointer-events-none">
        {category && (
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#111111]/60 mb-1 font-cta">
            {category}
          </p>
        )}
        {label && (
          <p className="text-xs text-[#111111] font-display tracking-wide max-w-[80%] mx-auto">
            {label}
          </p>
        )}
      </div>

      {/* Subtle interior hairline */}
      <div className="absolute inset-3 border border-[#111111]/10 pointer-events-none" />
    </div>
  );
};
