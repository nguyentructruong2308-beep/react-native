import { FontAwesome, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { POST_LOGIN } from "../../APIService";
import { useAuth } from "../components/context/AuthContext";
import { useCart } from "../components/cart/CartContext"; // [THÊM MỚI] Để lấy giỏ hàng ngay khi login

export default function SignInScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { fetchCart } = useCart(); // [THÊM MỚI] Lấy hàm fetchCart từ context

  // --- LOGIC GIỮ NGUYÊN ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("saved-email");
        const savedPassword = await AsyncStorage.getItem("saved-password");
        if (savedEmail) setEmail(savedEmail);
        if (savedPassword) setPassword(savedPassword);
      } catch (e) {
        console.error("Failed to load credentials", e);
      }
    };
    loadSavedCredentials();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }
    setLoading(true);

    // [THÊM MỚI] Làm sạch email trước khi xử lý (Chống lỗi User not found)
    const cleanEmail = email.trim().toLowerCase();

    try {
      const response = await POST_LOGIN(cleanEmail, password);
      const token = response?.["jwt-token"] || response?.token;

      if (!token) {
        Alert.alert("Thất bại", "Tài khoản hoặc mật khẩu không chính xác.");
        return;
      }

      // 1. Thực hiện login vào AuthContext
      await login(token, cleanEmail);

      // 2. [THÊM MỚI] Đồng bộ giỏ hàng ngay lập tức để lấy CartID của User này
      if (fetchCart) {
        await fetchCart(cleanEmail);
      }

      await AsyncStorage.setItem("saved-password", password);
      
      // Chuyển hướng sau khi đã chuẩn bị xong dữ liệu
      router.replace("/(home)");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      Alert.alert("Lỗi", "Tài khoản không tồn tại hoặc lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };
  // --- HẾT PHẦN LOGIC ---

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* PHẦN HEADER MÀU TỐI (Đồng bộ) */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Đăng Nhập</Text>
          <Text style={styles.headerSubtitle}>Vui lòng đăng nhập để tiếp tục</Text>
        </View>
      </View>

      {/* PHẦN FORM MÀU TRẮNG BO GÓC (Đồng bộ) */}
      <View style={styles.formSheet}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            {/* EMAIL INPUT */}
            <Text style={styles.inputLabel}>EMAIL</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#A0A5BA"
              />
              <MaterialCommunityIcons name="check" color={email.length > 5 ? "#FF7622" : "#A0A5BA"} size={20} />
            </View>

            {/* PASSWORD INPUT */}
            <Text style={styles.inputLabel}>MẬT KHẨU</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="* * * * * *"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#A0A5BA"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <MaterialCommunityIcons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  color={"#A0A5BA"}
                  size={20}
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity onPress={() => router.push("/auth/forgot")}>
              <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* NÚT ĐĂNG NHẬP */}
            <TouchableOpacity
              style={[styles.signInButton, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signInButtonText}>ĐĂNG NHẬP</Text>}
            </TouchableOpacity>

            {/* LINK ĐĂNG KÝ */}
            <View style={styles.footerLink}>
              <Text style={styles.footerText}>
                Bạn chưa có tài khoản?{" "}
                <Text style={styles.highlightText} onPress={() => router.push("/auth/register")}>
                  Đăng ký ngay
                </Text>
              </Text>
            </View>

            {/* SOCIAL LOGIN */}
            <View style={styles.socialDivider}>
                 <Text style={styles.socialDividerText}>Hoặc đăng nhập với</Text>
            </View>
            <View style={styles.socialLoginContainer}>
              <TouchableOpacity style={styles.socialCircle}>
                <FontAwesome name="facebook" size={24} color="#3b5998" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialCircle}>
                <FontAwesome name="google" size={24} color="#db4a39" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialCircle}>
                <FontAwesome name="apple" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {/* Padding bottom */}
            <View style={{height: 30}} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

// --- STYLE MỚI ĐỒNG BỘ ---
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#121223", 
  },
  headerContainer: {
    height: 180,
    paddingTop: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTextContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#A0A5BA",
  },
  formSheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#32343E",
    marginBottom: 8,
    marginTop: 10,
    textTransform: 'uppercase'
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5FA", 
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 60,
    marginBottom: 5
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1E1E2E",
    height: '100%'
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    color: "#A0A5BA",
    textAlign: "right",
    marginTop: 15,
    fontWeight: "500",
    marginBottom: 25
  },
  signInButton: {
    backgroundColor: "#FF7622", 
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#FF7622",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1
  },
  footerLink: {
    marginTop: 25,
    alignItems: 'center',
    marginBottom: 30
  },
  footerText: {
    color: '#A0A5BA',
    fontSize: 15,
  },
  highlightText: {
    color: '#FF7622',
    fontWeight: '700'
  },
  socialDivider: {
      alignItems: 'center',
      marginBottom: 20
  },
  socialDividerText: {
      color: '#A0A5BA',
      fontSize: 13
  },
  socialLoginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20 
  },
  socialCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F0F5FA', 
  },
});