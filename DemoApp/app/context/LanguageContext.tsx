import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🌐 Translations
const translations = {
  vi: {
    // Common
    home: 'Trang chủ',
    menu: 'Thực đơn',
    cart: 'Giỏ hàng',
    profile: 'Tài khoản',
    chat: 'Chat AI',
    search: 'Tìm kiếm',
    loading: 'Đang tải...',
    error: 'Lỗi',
    success: 'Thành công',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    save: 'Lưu',
    delete: 'Xóa',
    edit: 'Sửa',
    add: 'Thêm',
    close: 'Đóng',
    back: 'Quay lại',
    next: 'Tiếp',
    done: 'Xong',
    retry: 'Thử lại',
    
    // Home
    welcome: 'Xin chào',
    popularItems: 'Món phổ biến',
    categories: 'Danh mục',
    seeAll: 'Xem tất cả',
    featuredProducts: 'Sản phẩm nổi bật',
    
    // Products
    addToCart: 'Thêm vào giỏ',
    buyNow: 'Mua ngay',
    outOfStock: 'Hết hàng',
    price: 'Giá',
    quantity: 'Số lượng',
    description: 'Mô tả',
    reviews: 'Đánh giá',
    noReviews: 'Chưa có đánh giá',
    share: 'Chia sẻ',
    
    // Cart
    emptyCart: 'Giỏ hàng trống',
    total: 'Tổng cộng',
    subtotal: 'Tạm tính',
    shippingFee: 'Phí giao hàng',
    checkout: 'Thanh toán',
    removeItem: 'Xóa sản phẩm',
    
    // Orders
    myOrders: 'Đơn hàng của tôi',
    orderHistory: 'Lịch sử đơn hàng',
    orderDetail: 'Chi tiết đơn hàng',
    orderStatus: 'Trạng thái',
    pending: 'Chờ xác nhận',
    processing: 'Đang xử lý',
    shippingStatus: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
    cancelOrder: 'Hủy đơn',
    reorder: 'Đặt lại',
    
    // Profile
    editProfile: 'Chỉnh sửa hồ sơ',
    personalInfo: 'Thông tin cá nhân',
    addresses: 'Địa chỉ',
    settings: 'Cài đặt',
    logout: 'Đăng xuất',
    changePassword: 'Đổi mật khẩu',
    language: 'Ngôn ngữ',
    darkMode: 'Chế độ tối',
    notifications: 'Thông báo',
    
    // Auth
    login: 'Đăng nhập',
    register: 'Đăng ký',
    forgotPassword: 'Quên mật khẩu',
    email: 'Email',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
    fullName: 'Họ tên',
    phone: 'Số điện thoại',
    
    // Chat
    typeMessage: 'Nhập tin nhắn...',
    voiceMessage: 'Tin nhắn thoại',
    sendImage: 'Gửi ảnh',
    aiAssistant: 'Trợ lý AI',
    
    // Settings
    appearance: 'Giao diện',
    light: 'Sáng',
    dark: 'Tối',
    system: 'Theo hệ thống',
    vietnamese: 'Tiếng Việt',
    english: 'English',
  },
  en: {
    // Common
    home: 'Home',
    menu: 'Menu',
    cart: 'Cart',
    profile: 'Profile',
    chat: 'AI Chat',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    retry: 'Retry',
    
    // Home
    welcome: 'Hello',
    popularItems: 'Popular Items',
    categories: 'Categories',
    seeAll: 'See All',
    featuredProducts: 'Featured Products',
    
    // Products
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    outOfStock: 'Out of Stock',
    price: 'Price',
    quantity: 'Quantity',
    description: 'Description',
    reviews: 'Reviews',
    noReviews: 'No reviews yet',
    share: 'Share',
    
    // Cart
    emptyCart: 'Your cart is empty',
    total: 'Total',
    subtotal: 'Subtotal',
    shippingFee: 'Shipping',
    checkout: 'Checkout',
    removeItem: 'Remove Item',
    
    // Orders
    myOrders: 'My Orders',
    orderHistory: 'Order History',
    orderDetail: 'Order Detail',
    orderStatus: 'Status',
    pending: 'Pending',
    processing: 'Processing',
    shippingStatus: 'Shipping',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    cancelOrder: 'Cancel Order',
    reorder: 'Reorder',
    
    // Profile
    editProfile: 'Edit Profile',
    personalInfo: 'Personal Info',
    addresses: 'Addresses',
    settings: 'Settings',
    logout: 'Logout',
    changePassword: 'Change Password',
    language: 'Language',
    darkMode: 'Dark Mode',
    notifications: 'Notifications',
    
    // Auth
    login: 'Login',
    register: 'Register',
    forgotPassword: 'Forgot Password',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    phone: 'Phone',
    
    // Chat
    typeMessage: 'Type a message...',
    voiceMessage: 'Voice message',
    sendImage: 'Send image',
    aiAssistant: 'AI Assistant',
    
    // Settings
    appearance: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    vietnamese: 'Tiếng Việt',
    english: 'English',
  }
};

type Language = 'vi' | 'en';
type TranslationKey = keyof typeof translations.vi;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@app_language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('vi');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then(savedLang => {
      if (savedLang && ['vi', 'en'].includes(savedLang)) {
        setLanguageState(savedLang as Language);
      }
      setIsLoaded(true);
    });
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  if (!isLoaded) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { t } = useLanguage();
  return t;
};
