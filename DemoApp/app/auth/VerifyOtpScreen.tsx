import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
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
  StatusBar,
  ActivityIndicator
} from "react-native";

// Import API (nếu có)
import { POST_VERIFY_OTP } from "../../APIService";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams(); 

  // --- FIX 1: TĂNG LÊN 6 Ô (thay vì 4) ---
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 
  
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60); 
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // --- LOGIC ĐẾM NGƯỢC ---
  useEffect(() => {
    let interval: any; 
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  // --- HÀM XỬ LÝ NHẬP OTP (FIX LỖI NHẬP 1 RA 2) ---
  const handleOtpChange = (text: string, index: number) => {
    // Chỉ lấy ký tự cuối cùng vừa nhập (để tránh lỗi trên Web)
    const val = text.slice(-1);

    if (!/^\d+$/.test(val) && val !== "") return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Tự động nhảy sang ô tiếp theo (nếu chưa phải ô cuối cùng)
    if (val && index < 5) { 
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent: { key } }: any, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // --- HÀM XÁC THỰC ---
  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    // Kiểm tra đủ 6 số
    if (otpCode.length < 6) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ 6 số mã xác nhận.");
      return;
    }

    setLoading(true);
    try {
      // --- GỌI API THẬT ---
      const response = await POST_VERIFY_OTP(email as string, otpCode);
      
// Nếu API trả về thành công
if (response.status === 200 || response.status === 201) {
    
    // Cách xử lý thông minh cho cả Web và Điện thoại
    if (Platform.OS === 'web') {
        // --- NẾU LÀ WEB (Chrome/Cốc Cốc) ---
        // Dùng window.confirm của trình duyệt cho chắc chắn
        if (window.confirm("Xác thực thành công! Bấm OK để đặt lại mật khẩu.")) {
            router.replace(`/auth/reset-password?email=${email}`);
        }
    } else {
        // --- NẾU LÀ ĐIỆN THOẠI (Android/iOS) ---
        // Dùng Alert đẹp của React Native
        Alert.alert("Thành công", "Xác thực thành công!", [
            { 
                text: "OK", 
                onPress: () => {
                    // Chỉ chuyển trang khi người dùng đã bấm OK
                    router.replace({
                        pathname: "/auth/reset-password",
                        params: { email: email }
                    });
                }
            }
        ]);
    }
}
    } catch (error) {
      Alert.alert("Lỗi", "Mã xác nhận không chính xác hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(60);
    setOtp(['', '', '', '', '', '']); // Reset 6 ô
    inputRefs.current[0]?.focus();
    Alert.alert("Đã gửi lại", `Mã xác nhận mới đã được gửi tới ${email}`);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#121223" />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Xác Thực OTP</Text>
          <Text style={styles.headerSubtitle}>
            Chúng tôi đã gửi mã xác nhận đến email
          </Text>
          <Text style={styles.emailText}>{email || "example@gmail.com"}</Text>
        </View>
      </View>

      {/* FORM */}
      <View style={styles.formSheet}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.codeLabelContainer}>
                <Text style={styles.inputLabel}>MÃ CODE (6 SỐ)</Text>
                <TouchableOpacity onPress={handleResend} disabled={!canResend}>
                    <Text style={styles.resendText}>
                        {canResend ? <Text style={styles.highlightText}>Gửi lại mã</Text> : `Gửi lại sau ${timer}s`}
                    </Text>
                </TouchableOpacity>
            </View>
            
            {/* 6 Ô NHẬP OTP */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref: any) => (inputRefs.current[index] = ref)}
                  style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                  keyboardType="number-pad"
                  // maxLength={1} <-- Bỏ dòng này hoặc giữ cũng được vì đã xử lý slice(-1)
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>XÁC NHẬN</Text>
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
    backgroundColor: "#121223", 
  },
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
  },
  emailText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
      marginTop: 5
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
  codeLabelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      marginTop: 10
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#32343E",
    textTransform: 'uppercase'
  },
  resendText: {
      fontSize: 14,
      color: '#A0A5BA'
  },
  highlightText: {
      color: '#FF7622',
      fontWeight: 'bold',
      textDecorationLine: 'underline'
  },
  
  // OTP INPUTS (Đã chỉnh nhỏ lại để vừa 6 ô)
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Tự căn đều
    marginBottom: 30,
  },
  otpInput: {
    width: 45,   // FIX: Giảm từ 65 xuống 45 để vừa 6 ô
    height: 55,  // FIX: Giảm chiều cao chút cho cân đối
    borderRadius: 10,
    backgroundColor: "#F0F5FA", 
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E1E2E",
  },
  otpInputFilled: {
      backgroundColor: '#FFFFFF', 
      borderWidth: 2,
      borderColor: '#FF7622', 
      shadowColor: "#FF7622",
      elevation: 2
  },
  primaryBtn: {
    backgroundColor: "#FF7622", 
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#FF7622",
    elevation: 5
  },
  primaryText: { 
    color: "#fff", 
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 1
  },
});