import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface MarqueeProps {
  text?: string;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({
  text = 'Everyday, done properly.',
  className = '',
}) => {
  const reducedMotion = useReducedMotion();

  // Create an array of repeating phrases
  const items = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div
      className={`group relative w-full overflow-hidden border-y border-[#111111] bg-[#CCD5AE] py-3 select-none ${className}`}
      aria-hidden="true"
    >
      <div
        className={`flex whitespace-nowrap will-change-transform ${
          reducedMotion ? '' : 'animate-marquee group-hover:[animation-play-state:paused]'
        }`}
      >
        {items.map((i) => (
          <div key={i} className="flex items-center gap-6 px-4">
            <span className="font-slogan italic text-sm tracking-wider text-[#111111] uppercase font-bold">
              "{text}"
            </span>
            <span className="text-[#111111] opacity-40 font-mono text-xs">·</span>
            <span className="font-cta text-xs uppercase tracking-widest text-[#111111]">
              Halden Clothiers
            </span>
            <span className="text-[#111111] opacity-40 font-mono text-xs">·</span>
          </div>
        ))}
      </div>
    </div>
  );
};
