import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform, // Import Platform để kiểm tra môi trường
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// Import hàm API
import { POST_FORGOT_PASSWORD } from "../../APIService";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // --- LOGIC GỌI API THẬT ---
  const handleSendCode = async () => {
    // 1. Validate
    if (!email) {
      Alert.alert("Thông báo", "Vui lòng nhập địa chỉ email.");
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Định dạng email không hợp lệ.");
      return;
    }

    setLoading(true);

    try {
      // 2. Gọi API thật
      const response = await POST_FORGOT_PASSWORD(email);

      // Kiểm tra phản hồi (200 OK)
      if (response.status === 200 || response.status === 201) {
        
        // --- LOGIC XỬ LÝ CHO CẢ WEB VÀ APP ---
        if (Platform.OS === 'web') {
             // Trên Web: Dùng alert đơn giản để tránh lỗi chuyển trang
             alert(`Mã xác nhận đã gửi tới ${email}. Kiểm tra email nhé!`);
             router.push({ 
                pathname: "./VerifyOtpScreen", 
                params: { email: email } 
             });
        } else {
             // Trên App: Dùng Alert đẹp
             Alert.alert(
              "Đã gửi mã", 
              `Mã xác nhận đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư.`,
              [
                  { 
                    text: "Nhập mã ngay", 
                    onPress: () => {
                        router.push({ 
                          pathname: "/auth/VerifyOtpScreen", 
                          params: { email: email } 
                        });
                    }
                  }
              ]
            );
        }
      }
    } catch (error: any) {
      console.error("Forgot Password Error:", error);
      
      // Xử lý lỗi từ Server trả về
      if (error.response?.status === 404) {
        Alert.alert("Lỗi", "Email này chưa được đăng ký trong hệ thống.");
      } else {
        Alert.alert("Lỗi", "Không thể gửi yêu cầu. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER TỐI MÀU */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#121223" />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Quên Mật Khẩu</Text>
          <Text style={styles.headerSubtitle}>
            Nhập email của bạn để nhận mã xác nhận hoặc mật khẩu mới
          </Text>
        </View>
      </View>

      {/* FORM TRẮNG BO GÓC */}
      <View style={styles.formSheet}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined} 
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <Text style={styles.inputLabel}>EMAIL</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input} 
                placeholder="example@gmail.com" 
                placeholderTextColor="#A0A5BA" 
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Ionicons 
                name={email.length > 5 ? "checkmark-circle" : "mail-outline"} 
                size={24} 
                color={email.length > 5 ? "#FF7622" : "#A0A5BA"} 
              />
            </View>

            {/* BUTTON GỬI MÃ */}
            <TouchableOpacity 
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>GỬI MÃ</Text>
              )}
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#121223", // Màu nền tối header
  },
  
  // HEADER
  headerContainer: {
    height: 180,
    paddingTop: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 45,
    height: 45,
    backgroundColor: "#fff",
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10
  },
  headerTextContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#A0A5BA",
    textAlign: "center",
    lineHeight: 20
  },

  // FORM SHEET
  formSheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 50,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },

  // INPUT
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
    backgroundColor: "#F0F5FA", // Nền xám nhạt
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 20
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1E1E2E",
    height: '100%'
  },

  // BUTTON
  primaryBtn: {
    backgroundColor: "#FF7622", // Màu cam chủ đạo
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#FF7622",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5
  },
  primaryText: { 
    color: "#fff", 
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 1
  },
});