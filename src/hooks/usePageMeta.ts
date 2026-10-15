import { useEffect } from 'react';
import { heroImage, px } from '../data/images';

interface PageMetaOptions {
  title?: string;
  description?: string;
  ogImage?: string;
}

export function usePageMeta({
  title,
  description = 'Everyday, done properly. Premium menswear basics constructed from heavyweight cottons and tailored European fabrics.',
  ogImage = px(heroImage, 1600),
}: PageMetaOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Halden` : 'Halden — Everyday Basics';
    document.title = fullTitle;

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }

    // OG Title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', fullTitle);
    }

    // OG Description
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description);
    }

    // OG Image
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) {
      ogImg.setAttribute('content', ogImage);
    }
  }, [title, description, ogImage]);
}
