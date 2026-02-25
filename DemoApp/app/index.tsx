// app/index.tsx
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "./components/context/AuthContext";

export default function Index() {
  // Lấy thêm biến isLoading
  const { isLoggedIn, hasOnboarded, isLoading } = useAuth();

  // 1. Nếu đang đọc dữ liệu từ ổ cứng -> Hiện vòng quay
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  // 2. Đọc xong rồi mới quyết định đi đâu
  if (!hasOnboarded) {
    return <Redirect href="/onboarding/step1" />;
  }

  if (!isLoggedIn) {
    return <Redirect href="/auth/login" />;
  }

  return <Redirect href="/(home)" />;
}