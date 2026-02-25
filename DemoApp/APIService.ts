import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse } from 'axios';
import { Platform } from 'react-native';

// ==========================================
// 1. CẤU HÌNH ĐỊA CHỈ SERVER
// ==========================================

// 👉 IP Backend Spring Boot (Dùng IP local)
const API_URL = "http://192.168.1.104:8080/api";

// 👉 IP Server Python chạy Gemini (Port 5000)
const AI_URL = "http://192.168.1.104:5000";

async function getToken() {
  return await AsyncStorage.getItem('jwt-token');
}

// ==========================================
// 2. HÀM GỌI API CHUNG (SPRING BOOT)
// ==========================================
export async function callApi(endpoint: string, method: string, data: any = null): Promise<AxiosResponse<any>> {
  const token = await getToken();
  const url = `${API_URL}/${endpoint}`;

  console.log(`>> Calling API: ${url} [${method}]`);

  const headers: any = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Bỏ qua trang xác nhận của ngrok free
  };

  // CHỈ thêm Authorization nếu có Token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    return await axios({
      method,
      url,
      data,
      headers: headers,
      timeout: 20000, // Timeout 20s
    });
  } catch (error: any) {
    if (error.response) {
      console.error('❌ Server Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error (Server từ chối):', error.message);
    } else {
      console.error('❌ Config Error:', error.message);
    }
    throw error;
  }
}

// ==========================================
// 3. CÁC HÀM API CHI TIẾT
// ==========================================

// --- SẢN PHẨM & DANH MỤC ---
export function GET_ALL(endpoint: string) { return callApi(endpoint, "GET"); }

export function GET_PAGE(endpoint: string, page: number = 0, size: number = 10, categoryId: string | null = null) {
  let url = `${endpoint}?pageNumber=${page}&pageSize=${size}`;
  if (categoryId !== null) {
    url += `&categoryId=${categoryId}`;
  }
  return callApi(url, "GET");
}

export function GET_ID(endpoint: string, id: string | number) { return callApi(`${endpoint}/${id}`, "GET"); }

// --- THÊM / SỬA / XÓA ---
export function POST_ADD(endpoint: string, data: any) { return callApi(endpoint, "POST", data); }
export function PUT_EDIT(endpoint: string, data: any) { return callApi(endpoint, "PUT", data); }
export function DELETE_ID(endpoint: string, id: string | number) { return callApi(`${endpoint}/${id}`, "DELETE"); }

// --- HÌNH ẢNH ---
export function GET_IMG(endpoint: string, imgName: string): string {
  // Cắt bỏ đuôi /api để lấy domain gốc cho ảnh
  const domain = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
  return `${domain}/api/image/${endpoint}/${imgName}`;
}

export const getProductImageUrl = (fileName: string) => {
  const domain = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
  return `${domain}/api/public/products/image/${fileName}`;
};

export const getUserImageUrl = (fileName: string) => {
  const domain = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
  return `${domain}/api/public/users/image/${fileName}`;
};

// Cập nhật ảnh đại diện người dùng
export async function PUT_UPDATE_USER_IMAGE(userId: number | string, imageUri: string) {
  const token = await getToken();
  const formData = new FormData();
  
  const filename = imageUri.split('/').pop() || 'avatar.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1] : 'jpg';
  const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  
  if (Platform.OS === 'web') {
    // Trên Web, cần chuyển URI sang Blob để gửi Multipart thực sự
    const blobResponse = await fetch(imageUri);
    const blob = await blobResponse.blob();
    formData.append('image', blob, filename);
  } else {
    // Trên Mobile (Android/iOS)
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);
  }

  // Dùng fetch + POST để xử lý Multipart ổn định nhất
  const response = await fetch(`${API_URL}/public/users/${userId}/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { response: { data: errorData, status: response.status } };
  }

  const result = await response.json();
  return { data: result };
}

// --- XỬ LÝ ĐĂNG NHẬP ---
export async function POST_LOGIN(email: string, password: string): Promise<any> {
  try {
    const response = await callApi("login", "POST", { email, password });

    // Lấy token đúng key từ Server
    const token = response.data["jwt-token"];

    if (token) {
      await AsyncStorage.setItem("jwt-token", token);
      await AsyncStorage.setItem("saved-email", email);
      await AsyncStorage.setItem("saved-password", password);
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// --- THÔNG TIN USER ---
export function GET_USER_PROFILE(userId: number | string) { return callApi(`public/users/${userId}`, "GET"); }
export function GET_USER_CART(email: string) { return callApi(`public/users/${email}/carts`, "GET"); }
export function GET_USER_BY_EMAIL(email: string) { return callApi(`public/users/email/${email}`, "GET"); }

// --- ĐỔI MẬT KHẨU ---
export function POST_CHANGE_PASSWORD(userId: number | string, oldPassword: string, newPassword: string) {
  return callApi(`public/users/${userId}/change-password`, "POST", { oldPassword, newPassword });
}

// --- GIỎ HÀNG & ĐẶT HÀNG ---
export function PUT_UPDATE_QUANTITY(cartId: string | number, productId: string | number, quantity: number) {
  return callApi(`public/carts/${cartId}/products/${productId}/quantity/${quantity}`, "PUT");
}
export function GET_USER_ORDERS(email: string) { return callApi(`public/users/${email}/orders`, "GET"); }
// Sửa lại hàm đặt hàng để nhận thêm addressId và đối tượng orderRequest (voucher, scheduledTime, selectedProductIds)
export function POST_PLACE_ORDER(email: string, cartId: number, addressId: number, paymentMethod: string, orderRequest: any) {
  // Gửi orderRequest qua request body
  return callApi(`public/users/${email}/carts/${cartId}/addresses/${addressId}/payments/${paymentMethod}/order`, "POST", orderRequest || null);
}
export function PUT_CANCEL_ORDER(email: string, orderId: number) {
  return callApi(`public/users/${email}/orders/${orderId}/cancel`, "PUT");
}

// --- GIỎ HÀNG NÂNG CAO (Dùng để fix lỗi 400 khi thêm trùng sản phẩm) ---

/**
 * 👉 API Thêm mới sản phẩm vào giỏ (POST)
 * Dùng khi sản phẩm CHƯA tồn tại trong giỏ của người dùng
 */
export function POST_ADD_TO_CART(cartId: string | number, productId: string | number, quantity: number) {
  return callApi(`public/carts/${cartId}/products/${productId}/quantity/${quantity}`, "POST");
}

/**
 * 👉 API Cập nhật số lượng sản phẩm (PUT)
 * Dùng khi sản phẩm ĐÃ tồn tại (giúp tránh lỗi 'already exists' và đồng bộ số lượng)
 */
export function PUT_UPDATE_CART_QUANTITY(cartId: string | number, productId: string | number, quantity: number) {
  return callApi(`public/carts/${cartId}/products/${productId}/quantity/${quantity}`, "PUT");
}

/**
 * 👉 API Xóa một sản phẩm cụ thể khỏi giỏ hàng
 */
export function DELETE_PRODUCT_FROM_CART(cartId: string | number, productId: string | number) {
  return callApi(`public/carts/${cartId}/product/${productId}`, "DELETE");
}
/**
 * Xóa danh sách nhiều sản phẩm đã chọn
 * productIds: mảng các ID [1, 2, 3]
 */
export function DELETE_MULTIPLE_PRODUCTS(cartId: string | number, productIds: number[]) {
  return callApi(`public/carts/${cartId}/products`, "DELETE", productIds);
}

// --- QUÊN MẬT KHẨU & OTP ---
export function POST_FORGOT_PASSWORD(email: string) { return callApi("public/forgot-password", "POST", { email }); }
export function POST_VERIFY_OTP(email: string, otp: string) { return callApi("public/verify-otp", "POST", { email, otp }); }
export function POST_RESET_PASSWORD(email: string, newPassword: string) { return callApi("public/reset-password", "POST", { email, newPassword }); }


// Hàm đặt hàng nhanh từ Chat
export function POST_QUICK_ORDER(email: string, cartId: number, paymentMethod: string = "COD") {
  return callApi(`public/users/${email}/carts/${cartId}/payments/${paymentMethod}/order`, "POST");
}

export function POST_PAYMENT_SUCCESS(email: string, cartId: number) {
  return callApi(`public/users/${email}/carts/${cartId}/payment-success`, "POST");
}

export function DELETE_ORDER(email: string, orderId: number) {
    // Tận dụng hàm cancelOrder cũ nhưng Backend đã sửa thành xóa hẳn
    return callApi(`public/users/${email}/orders/${orderId}/cancel`, "PUT");
}

// --- QUẢN LÝ ĐỊA CHỈ (ADDRESS) ---

// Lấy danh sách địa chỉ của người dùng theo Email
export function GET_USER_ADDRESSES(email: string) {
  return callApi(`public/users/${email}/addresses`, "GET");
}

// Thêm địa chỉ mới
export function POST_ADD_ADDRESS(email: string, addressData: any) {
  return callApi(`public/users/${email}/addresses`, "POST", addressData);
}

// --- WISHLIST (YÊU THÍCH) ---
export function GET_WISHLIST(email: string) {
  return callApi(`public/wishlist/${email}`, "GET");
}
export function POST_TOGGLE_WISHLIST(email: string, productId: number) {
  return callApi(`public/wishlist/${email}/toggle/${productId}`, "POST");
}
// --- CẬP NHẬT ĐỊA CHỈ HIỆN CÓ ---
export function PUT_UPDATE_ADDRESS(email: string, addressId: number | string, addressData: any) {
  return callApi(`public/users/${email}/addresses/${addressId}`, "PUT", addressData);
}

// Xóa địa chỉ
export function DELETE_ADDRESS(email: string, addressId: number | string) {
  return callApi(`public/users/${email}/addresses/${addressId}`, "DELETE");
}

// --- ĐÁNH GIÁ SẢN PHẨM (REVIEWS) ---

// Lấy danh sách đánh giá của một sản phẩm
export function GET_PRODUCT_REVIEWS(productId: number | string) {
  return callApi(`public/products/${productId}/reviews`, "GET");
}

// Lấy tất cả đánh giá của một user
export function GET_USER_REVIEWS(email: string) {
  return callApi(`public/users/${email}/reviews`, "GET");
}

// Thêm đánh giá mới (sau khi đơn hàng hoàn thành)
export function POST_ADD_REVIEW(email: string, productId: number | string, reviewData: { rating: number; comment: string; orderId?: number }) {
  return callApi(`public/users/${email}/products/${productId}/reviews`, "POST", reviewData);
}

// Cập nhật đánh giá
export function PUT_UPDATE_REVIEW(email: string, reviewId: number | string, reviewData: { rating: number; comment: string }) {
  return callApi(`public/users/${email}/reviews/${reviewId}`, "PUT", reviewData);
}

// Xóa đánh giá
export function DELETE_REVIEW(email: string, reviewId: number | string) {
  return callApi(`public/users/${email}/reviews/${reviewId}`, "DELETE");
}

// Lấy đơn hàng đã hoàn thành để đánh giá
export function GET_COMPLETED_ORDERS_FOR_REVIEW(email: string) {
  return callApi(`public/users/${email}/orders?status=Delivered`, "GET");
}

// ==========================================
// 4. HÀM CHAT GEMINI (HỖ TRỢ ẢNH + ÂM THANH)
// ==========================================
export async function chatWithGemini(text: string, imageUri: string | null = null, userName: string = "Bạn", audioUri: string | null = null) {
  const formData = new FormData();

  // 1. Phải gửi message ngay cả khi chỉ gửi ảnh/audio (để tránh server báo rỗng)
  formData.append('message', text || (audioUri ? "Đây là tin nhắn thoại" : "Hình ảnh này là gì?"));
  formData.append('user_name', userName);

  if (imageUri) {
    try {
      // ��� FIX: Convert image URI to Blob for web/React Native compatibility
      console.log('📤 Converting image from URI:', imageUri.substring(0, 50) + '...');
      
      // Fetch image as blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const filename = imageUri.split('/').pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const extension = match ? match[1] : 'jpg';
      
      // Create File object from Blob
      const file = new File([blob], filename, { 
        type: `image/${extension}`,
        lastModified: Date.now(),
      });

      formData.append('image', file, filename);
      
      console.log('📤 Image converted to file:', {
        name: file.name,
        type: file.type,
        size: file.size,
      });
    } catch (error) {
      console.error('❌ Error converting image:', error);
      return "Lỗi khi xử lý hình ảnh. Vui lòng thử lại.";
    }
  }

  // 🎤 Xử lý audio nếu có
  if (audioUri) {
    try {
      console.log('📤 Converting audio from URI:', audioUri.substring(0, 50) + '...');
      
      const response = await fetch(audioUri);
      const blob = await response.blob();
      
      const filename = audioUri.split('/').pop() || "audio.m4a";
      
      const file = new File([blob], filename, { 
        type: 'audio/m4a',
        lastModified: Date.now(),
      });

      formData.append('audio', file, filename);
      
      console.log('📤 Audio converted to file:', {
        name: file.name,
        type: file.type,
        size: file.size,
      });
    } catch (error) {
      console.error('❌ Error converting audio:', error);
      return "Lỗi khi xử lý âm thanh. Vui lòng thử lại.";
    }
  }

  try {
    console.log('🤖 Calling AI at:', `${AI_URL}/chat`);
    
    const response = await fetch(`${AI_URL}/chat`, {
      method: 'POST',
      body: formData,
      // ⚠️ KHÔNG set Content-Type, để fetch tự động set cho multipart/form-data
    });
    
    console.log('✅ AI Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI Error response:', errorText);
      
      // Parse error message nếu có
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message?.includes('RESOURCE_EXHAUSTED')) {
          return "⚠️ API Gemini đã hết quota miễn phí hôm nay.\n\n💡 Giải pháp:\n1. Đợi 24h để quota reset\n2. Hoặc tạo API key mới tại: https://ai.google.dev";
        }
      } catch {}
      
      throw new Error(`AI server error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('💬 AI Reply received:', data.reply?.substring(0, 100) + '...');
    return data.reply;
  } catch (error: any) {
    console.error('❌ Chat AI Error:', error);
    if (error.message?.includes('Network request failed')) {
      return "⚠️ Không thể kết nối với AI Server.\n\n🔍 Kiểm tra:\n1. Server AI đã chạy chưa?\n   → cd c:\\DiDong2\\ServerAI\n   → python main.py\n\n2. IP đúng chưa? (" + AI_URL + ")";
    }
    return "Xin lỗi, AI đang gặp sự cố kỹ thuật. Vui lòng thử lại.";
  }
}