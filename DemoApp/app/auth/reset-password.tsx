import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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

// Import API
import { POST_RESET_PASSWORD } from "../../APIService";

export default function ResetPasswordScreen() {
    const router = useRouter();
    // Lấy email từ màn hình trước
    const { email } = useLocalSearchParams();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    // --- HÀM XỬ LÝ CHÍNH (ĐÃ SỬA DÙNG CẢ 2) ---
    const handleResetPassword = async () => {
        // 1. Validate dữ liệu
        if (!password || !confirmPassword) {
            Platform.OS === 'web' ? window.alert("Vui lòng nhập đủ thông tin") : Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        if (password.length < 6) {
            Platform.OS === 'web' ? window.alert("Mật khẩu phải từ 6 ký tự trở lên") : Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        if (password !== confirmPassword) {
            Platform.OS === 'web' ? window.alert("Mật khẩu xác nhận không khớp") : Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
            return;
        }

        setLoading(true);
        try {
            // 2. Gọi API
            const response = await POST_RESET_PASSWORD(email as string, password);

            if (response.status === 200) {
                // --- PHẦN QUAN TRỌNG: TÁCH LOGIC WEB VÀ MOBILE ---
                
                if (Platform.OS === 'web') {
                    // ==> NẾU LÀ WEB (Chrome, Cốc Cốc...)
                    // Dùng window.confirm để trình duyệt không chặn sự kiện chuyển trang
                    if (window.confirm("Thành công! Mật khẩu đã được đổi. Bấm OK để đăng nhập lại.")) {
                        // Kiểm tra đường dẫn đăng nhập của bạn (thường là /login hoặc /auth/login)
                        router.replace("/auth/login"); 
                    }
                } else {
                    // ==> NẾU LÀ ĐIỆN THOẠI (Android, iOS)
                    // Dùng Alert đẹp của React Native
                    Alert.alert("Thành công", "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", [
                        { 
                            text: "OK", 
                            onPress: () => router.replace("/auth/login") 
                        }
                    ]);
                }
            }
        } catch (error) {
            console.log("Lỗi đổi pass:", error);
            Platform.OS === 'web' 
                ? window.alert("Lỗi: Không thể đổi mật khẩu. Vui lòng thử lại.") 
                : Alert.alert("Lỗi", "Không thể đổi mật khẩu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" />

            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Feather name="chevron-left" size={24} color="#121223" />
                </TouchableOpacity>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Mật Khẩu Mới</Text>
                    <Text style={styles.headerSubtitle}>Nhập mật khẩu mới cho tài khoản</Text>
                    <Text style={styles.emailText}>{email}</Text>
                </View>
            </View>

            <View style={styles.formSheet}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        {/* MẬT KHẨU MỚI */}
                        <Text style={styles.inputLabel}>MẬT KHẨU MỚI</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="********"
                                placeholderTextColor="#A0A5BA"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#A0A5BA" />
                            </TouchableOpacity>
                        </View>

                        {/* XÁC NHẬN MẬT KHẨU */}
                        <Text style={styles.inputLabel}>XÁC NHẬN MẬT KHẨU</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="********"
                                placeholderTextColor="#A0A5BA"
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#A0A5BA" />
                            </TouchableOpacity>
                        </View>

                        {/* NÚT XÁC NHẬN */}
                        <TouchableOpacity
                            style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryText}>ĐỔI MẬT KHẨU</Text>
                            )}
                        </TouchableOpacity>

                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: "#121223" },
    headerContainer: { height: 180, paddingTop: 50, paddingHorizontal: 24, alignItems: 'center' },
    backButton: { position: 'absolute', top: 60, left: 24, width: 45, height: 45, backgroundColor: "#fff", borderRadius: 22.5, justifyContent: "center", alignItems: "center", zIndex: 10 },
    headerTextContainer: { marginTop: 15, alignItems: 'center' },
    headerTitle: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 8 },
    headerSubtitle: { fontSize: 14, color: "#A0A5BA", textAlign: "center" },
    emailText: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginTop: 5 },
    formSheet: { flex: 1, backgroundColor: "#FFFFFF", borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 40, overflow: 'hidden' },
    scrollContent: { paddingHorizontal: 24 },
    inputLabel: { fontSize: 12, fontWeight: "700", color: "#32343E", textTransform: 'uppercase', marginBottom: 8, marginTop: 10 },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0F5FA", borderRadius: 10, paddingHorizontal: 15, height: 56, marginBottom: 15 },
    input: { flex: 1, color: "#1E1E2E", fontSize: 14 },
    primaryBtn: { backgroundColor: "#FF7622", paddingVertical: 18, borderRadius: 12, alignItems: "center", marginTop: 20, shadowColor: "#FF7622", elevation: 5 },
    primaryText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 1 },
});