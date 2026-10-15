import React, { useState } from 'react';
import { getImageUrl } from '../../data/images';

export interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: '4:5' | '16:9' | '1:1' | '3:4' | 'auto';
  className?: string;
  imgClassName?: string;
  size?: 500 | 900 | 1600;
  priority?: boolean; // Eager load if true (e.g. Hero)
  objectPosition?: string;
}

export const Img: React.FC<ImgProps> = ({
  src,
  alt,
  aspectRatio = '4:5',
  className = '',
  imgClassName = '',
  size = 500,
  priority = false,
  objectPosition = 'center 20%',
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const aspectClass =
    aspectRatio === '4:5'
      ? 'aspect-[4/5]'
      : aspectRatio === '16:9'
      ? 'aspect-[16/9]'
      : aspectRatio === '1:1'
      ? 'aspect-square'
      : aspectRatio === '3:4'
      ? 'aspect-[3/4]'
      : '';

  const finalSrc = getImageUrl(src, size);

  return (
    <div
      className={`relative overflow-hidden w-full ${aspectClass} select-none bg-[#FAEDCD] ${className}`}
    >
      {/* Background placeholder while image decodes/loads */}
      <div
        className={`absolute inset-0 bg-[#FAEDCD] transition-opacity duration-300 pointer-events-none ${
          isLoaded && !hasError ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {finalSrc && !hasError ? (
        <img
          src={finalSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          style={{ objectPosition }}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
          {...rest}
        />
      ) : (
        /* Fallback to clean Papaya Whip block on error */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#FAEDCD] text-[#111111]/40 border border-[#111111]/10">
          <span className="font-mono text-[9px] uppercase tracking-widest">HALDEN</span>
          <span className="text-[10px] font-display text-[#111111]/60 text-center mt-1 truncate max-w-[80%]">
            {alt || 'Garment'}
          </span>
        </div>
      )}
    </div>
  );
};
