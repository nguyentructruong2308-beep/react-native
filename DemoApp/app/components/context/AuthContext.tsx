import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 1. Thêm hasOnboarded và hàm finishOnboarding vào kiểu dữ liệu
type AuthContextType = {
  isLoggedIn: boolean;
  hasOnboarded: boolean; // <--- Mới
  isLoading: boolean;
  login: (token: string, email: string) => void;
  logout: () => void;
  finishOnboarding: () => void; // <--- Mới: Hàm gọi khi xong Step 5
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  hasOnboarded: false, // <--- Mặc định
  isLoading: true,
  login: () => {},
  logout: () => {},
  finishOnboarding: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false); // <--- State mới
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // Đọc cả 2 giá trị cùng lúc
      const token = await AsyncStorage.getItem("jwt-token");
      const onboarded = await AsyncStorage.getItem("hasLaunched"); // Key lưu trạng thái đã xem onboarding

      // Cập nhật trạng thái đăng nhập
      if (token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }

      // Cập nhật trạng thái Onboarding
      if (onboarded === "true") {
        setHasOnboarded(true);
      } else {
        setHasOnboarded(false);
      }

    } catch (e) {
      console.log("Lỗi kiểm tra trạng thái:", e);
      setIsLoggedIn(false);
      setHasOnboarded(false);
    } finally {
      // Đọc xong hết mới tắt loading
      setIsLoading(false); 
    }
  };

  const login = async (token: string, email: string) => {
    try {
      await AsyncStorage.setItem("jwt-token", token);
      await AsyncStorage.setItem("saved-email", email); 
      setIsLoggedIn(true);
    } catch (e) {
      console.log("Lỗi khi login:", e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("jwt-token");
      await AsyncStorage.removeItem("saved-email");
      await AsyncStorage.removeItem("saved-password");
      setIsLoggedIn(false); 
    } catch (e) {
      console.log("Lỗi khi logout:", e);
    }
  };

  // 2. Hàm mới: Đánh dấu đã xem xong Onboarding
  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasLaunched", "true");
      setHasOnboarded(true);
    } catch (e) {
      console.log("Lỗi lưu onboarding:", e);
    }
  };

  return (
    // 3. Truyền thêm hasOnboarded và finishOnboarding ra ngoài
    <AuthContext.Provider value={{ isLoggedIn, hasOnboarded, isLoading, login, logout, finishOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);