import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface ScrollWordRevealProps {
  text: string;
  className?: string;
}

export const ScrollWordReveal: React.FC<ScrollWordRevealProps> = ({
  text,
  className = '',
}) => {
  const containerRef = useRef<HTMLQuoteElement>(null);
  const reducedMotion = useReducedMotion();
  const words = text.split(' ');

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    const el = containerRef.current;
    const wordSpans = el.querySelectorAll('.reveal-word');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordSpans,
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'bottom 55%',
            scrub: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [reducedMotion]);

  if (reducedMotion) {
    return <blockquote className={className}>{text}</blockquote>;
  }

  return (
    <blockquote ref={containerRef} className={className}>
      {words.map((word, index) => (
        <span key={index} className="inline-block mr-[0.28em] reveal-word will-change-[opacity]">
          {word}
        </span>
      ))}
    </blockquote>
  );
};
