export const px = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const collectionImages = {
  hoodies: [7945745, 7945751],
  shirts: [16825851, 8217507],
  pants: [19461558, 19461567],
  trousers: [17938982, 11000250],
};

export const heroImage = 7945744;

/**
 * Builds sized URLs:
 * w=500 for cards and cart
 * w=900 for product gallery
 * w=1600 for hero
 */
export function getImageUrl(idOrUrl: number | string, w: 500 | 900 | 1600 = 900): string {
  if (typeof idOrUrl === 'number') {
    return px(idOrUrl, w);
  }
  if (!idOrUrl) return '';
  if (idOrUrl.startsWith('/')) return idOrUrl;

  // If it's a Pexels photo URL, adjust the &w= param
  if (idOrUrl.includes('images.pexels.com')) {
    try {
      const url = new URL(idOrUrl);
      url.searchParams.set('auto', 'compress');
      url.searchParams.set('cs', 'tinysrgb');
      url.searchParams.set('w', w.toString());
      return url.toString();
    } catch {
      return idOrUrl;
    }
  }

  return idOrUrl;
}

/**
 * Returns the pair of image URLs for a given collection,
 * alternating order based on index (even-numbered use [first, second], odd use [second, first]).
 */
export function getCollectionProductImages(
  collection: 'hoodies' | 'shirts' | 'pants' | 'trousers',
  index: number,
  w: 500 | 900 | 1600 = 900
): [string, string] {
  const ids = collectionImages[collection] || collectionImages.hoodies;
  const pair = index % 2 === 0 ? [ids[0], ids[1]] : [ids[1], ids[0]];
  return [px(pair[0], w), px(pair[1], w)];
}
