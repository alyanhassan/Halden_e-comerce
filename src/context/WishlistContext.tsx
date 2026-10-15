import React, { createContext, useContext, useEffect, useState } from 'react';
import { getWishlist, toggleWishlist as toggleWishlistService } from '../services/wishlistService';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const refreshWishlist = async () => {
    const ids = await getWishlist();
    setWishlistIds(ids);
  };

  useEffect(() => {
    refreshWishlist();
  }, []);

  const isInWishlist = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    const res = await toggleWishlistService(productId);
    setWishlistIds(res.ids);
    return res.inWishlist;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        isInWishlist,
        toggleWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
