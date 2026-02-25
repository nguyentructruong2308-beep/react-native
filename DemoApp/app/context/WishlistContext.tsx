import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GET_WISHLIST, POST_TOGGLE_WISHLIST, getProductImageUrl } from '../../APIService';

interface WishlistItem {
  productId: number;
  productName: string;
  specialPrice: number;
  image: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  toggleWishlist: (item: WishlistItem) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Load wishlist from Backend + Storage on mount
  useEffect(() => {
    const initWishlist = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("saved-email");
        if (savedEmail) {
            // Priority 1: Backend
            const res = await GET_WISHLIST(savedEmail);
            if (res.data && Array.isArray(res.data)) {
                const mappedData: WishlistItem[] = res.data.map((item: any) => ({
                    productId: item.product.productId,
                    productName: item.product.productName,
                    specialPrice: item.product.specialPrice,
                    image: getProductImageUrl(item.product.image)
                }));
                setWishlist(mappedData);
                await AsyncStorage.setItem('user_wishlist', JSON.stringify(mappedData));
                return;
            }
        }

        // Priority 2: local cache
        const stored = await AsyncStorage.getItem('user_wishlist');
        if (stored) {
          setWishlist(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load wishlist", e);
      }
    };
    initWishlist();
  }, []);

  // Save wishlist to storage whenever it changes
  useEffect(() => {
    const saveWishlist = async () => {
      try {
        await AsyncStorage.setItem('user_wishlist', JSON.stringify(wishlist));
      } catch (e) {
        console.error("Failed to save wishlist", e);
      }
    };
    saveWishlist();
  }, [wishlist]);

  const addToWishlist = async (item: WishlistItem) => {
    if (!isInWishlist(item.productId)) {
      setWishlist(prev => [...prev, item]);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    setWishlist(prev => prev.filter(item => item.productId !== productId));
  };

  const toggleWishlist = async (item: WishlistItem) => {
    const inWishlist = isInWishlist(item.productId);
    
    // Optimistic Update
    if (inWishlist) {
      await removeFromWishlist(item.productId);
    } else {
      await addToWishlist(item);
    }

    try {
        const email = await AsyncStorage.getItem("saved-email");
        if (email) {
            await POST_TOGGLE_WISHLIST(email, item.productId);
        }
    } catch (error) {
        console.error("Sync wishlist error:", error);
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some(item => item.productId === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
