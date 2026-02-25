import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  GET_USER_CART, 
  getProductImageUrl, 
  callApi, 
  DELETE_MULTIPLE_PRODUCTS 
} from "../../../APIService"; 

// --- TYPES ---
export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: any;
  quantity: number;
  size?: string;
  description?: string;
  restaurantId?: string | number;
}

interface CartState {
  items: CartItem[];
  cartId: number | null; 
}

type CartAction =
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "SET_CART_FROM_SERVER"; payload: { items: CartItem[], cartId: number | null } }
  | { type: "REMOVE_FROM_CART"; payload: string | number }
  | { type: "UPDATE_QUANTITY"; payload: { id: string | number; quantity: number } }
  | { type: "CLEAR_CART" };

interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  cartItems: CartItem[];
  addToCart: (product: any, quantity?: number) => Promise<void>; 
  removeFromCart: (id: string | number) => Promise<void>; // Chuyển thành Promise để đồng bộ
  removeMultipleFromCart: (productIds: number[]) => Promise<void>; // Thêm mới cho tính năng chọn nhiều
  updateQuantity: (id: string | number, quantity: number) => Promise<void>; // Chuyển thành Promise
  clearCart: () => void;
  getTotal: () => number;
  fetchCart: (email: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

// --- REDUCER ---
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_CART_FROM_SERVER":
      return { 
          ...state, 
          items: action.payload.items,
          cartId: action.payload.cartId 
      };

    case "ADD_TO_CART": {
      const item = action.payload;
      const exist = state.items.find((i) => String(i.id) === String(item.id));
      if (exist) {
        return {
          ...state,
          items: state.items.map((i) =>
            String(i.id) === String(item.id)
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, item] };
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter((i) => String(i.id) !== String(action.payload)),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((i) =>
          String(i.id) === String(action.payload.id)
            ? { ...i, quantity: Math.max(1, action.payload.quantity) }
            : i
        ),
      };

    case "CLEAR_CART":
      return { ...state, items: [] };

    default:
      return state;
  }
}

// --- PROVIDER ---
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], cartId: null });

  // 1. Tải giỏ hàng từ Server
  const fetchCart = async (email: string) => {
    try {
      const response = await GET_USER_CART(email);
      let targetCart = response.data;
      
      if (Array.isArray(response.data)) {
          targetCart = response.data.length > 0 ? response.data[0] : null;
      }

      if (!targetCart) {
          dispatch({ type: "SET_CART_FROM_SERVER", payload: { items: [], cartId: null } });
          return;
      }
      
      const serverItems = targetCart.cartItems || targetCart.products || [];
      const mappedItems: CartItem[] = serverItems.map((item: any) => {
        const productObj = item.product || item;
        return {
            id: productObj.productId || productObj.id,
            name: productObj.productName || productObj.name,
            price: productObj.specialPrice || productObj.price,
            image: getProductImageUrl(productObj.image),
            quantity: item.quantity,
            size: "M",
        };
      });

      dispatch({ 
          type: "SET_CART_FROM_SERVER", 
          payload: { 
              items: mappedItems, 
              cartId: targetCart.cartId 
          } 
      });

    } catch (error) {
      console.error("Lỗi fetchCart:", error);
    }
  };

  // 2. Thêm vào giỏ (Đã fix lỗi 400)
  const addToCart = async (product: any, quantity: number = 1) => {
    const productId = product.productId || product.id;
    if (!productId) return;

    const finalImage = (typeof product.image === 'string' && !product.image.startsWith('http') && !product.image.startsWith('data:')) 
       ? getProductImageUrl(product.image) 
       : product.image;

    const item: CartItem = {
      id: productId,
      name: product.productName || product.name || "Sản phẩm",
      price: product.specialPrice || product.price || 0,
      image: finalImage,
      quantity: quantity,
      size: "M",
    };

    dispatch({ type: "ADD_TO_CART", payload: item });

    if (state.cartId) {
        try {
            const existInState = state.items.find((i) => String(i.id) === String(productId));
            if (existInState) {
                const newQty = existInState.quantity + quantity;
                await callApi(`public/carts/${state.cartId}/products/${productId}/quantity/${newQty}`, "PUT");
            } else {
                try {
                    await callApi(`public/carts/${state.cartId}/products/${productId}/quantity/${quantity}`, "POST");
                } catch (postError: any) {
                    // Nếu Server bảo đã tồn tại (dù Local chưa có), ta thử PUT để cập nhật
                    if (postError.response?.data?.message?.includes("already exists")) {
                        await callApi(`public/carts/${state.cartId}/products/${productId}/quantity/${quantity}`, "PUT");
                    } else {
                        throw postError;
                    }
                }
            }
        } catch (error) {
            console.error("❌ Lỗi đồng bộ Server (Add):", error);
        }
    }
  };

  // 3. Xóa đơn lẻ (Fix: Cập nhật Server ngay khi bấm xóa)
  const removeFromCart = async (id: string | number) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: id });
    if (state.cartId) {
      try {
        await callApi(`public/carts/${state.cartId}/product/${id}`, "DELETE");
      } catch (error) {
        console.error("❌ Lỗi xóa server:", error);
      }
    }
  };

  // 4. Xóa hàng loạt (Shopee style - Fix: Không xóa được khi chọn tất cả)
  const removeMultipleFromCart = async (productIds: number[]) => {
    productIds.forEach(id => dispatch({ type: "REMOVE_FROM_CART", payload: id }));
    if (state.cartId && productIds.length > 0) {
      try {
        await DELETE_MULTIPLE_PRODUCTS(state.cartId, productIds);
      } catch (error) {
        console.error("❌ Lỗi xóa hàng loạt server:", error);
      }
    }
  };

  // 5. Cập nhật số lượng
  const updateQuantity = async (id: string | number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
    if (state.cartId) {
      try {
        await callApi(`public/carts/${state.cartId}/products/${id}/quantity/${quantity}`, "PUT");
      } catch (error) {
        console.error("❌ Lỗi update quantity server:", error);
      }
    }
  };

  const clearCart = () => dispatch({ type: "CLEAR_CART" });
  const getTotal = () => state.items.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    const init = async () => {
        const email = await AsyncStorage.getItem("saved-email");
        if(email) fetchCart(email);
    };
    init();
  }, []);

  return (
    <CartContext.Provider 
      value={{ 
        state, 
        dispatch, 
        cartItems: state.items, 
        addToCart, 
        removeFromCart, 
        removeMultipleFromCart, // Cung cấp hàm xóa hàng loạt
        updateQuantity, 
        clearCart, 
        getTotal, 
        fetchCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};