import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// [MỚI] Import bộ icon để đồng bộ giao diện
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';

// Import API
import { GET_USER_BY_EMAIL, PUT_EDIT, POST_CHANGE_PASSWORD } from "../../../APIService";

export default function EditProfile() {
  const router = useRouter();

  // State dữ liệu
  const [userId, setUserId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState(""); 
  const [lastName, setLastName] = useState("");   
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("Yêu thích ẩm thực"); 
  
  // State đổi mật khẩu
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Tải dữ liệu thật
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem("saved-email");
      if (!savedEmail) {
        setLoading(false);
        return;
      }

      const response = await GET_USER_BY_EMAIL(savedEmail);
      const u = response.data;
      
      setUserId(u.userId);
      setFirstName(u.firstName);
      setLastName(u.lastName);
      setEmail(u.email);
      setPhone(u.mobileNumber);

    } catch (error) {
      console.error("Lỗi tải thông tin:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Lưu thay đổi
  const handleSave = async () => {
    if (!firstName || !lastName || !phone) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đủ Họ, Tên và SĐT");
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        userId: userId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        mobileNumber: phone,
        password: "password-giu-nguyen", 
        roles: []
      };

      await PUT_EDIT(`public/users/${userId}`, updateData);

      Alert.alert("Thành công", "Đã cập nhật hồ sơ!", [
        { text: "OK", onPress: () => router.back() }
      ]);

    } catch (error) {
      console.error("Lỗi lưu:", error);
      Alert.alert("Lỗi", "Không thể lưu thay đổi.");
    } finally {
      setSaving(false);
    }
  };

  // 3. Đổi mật khẩu
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ thông tin mật khẩu");
      return;
    }

    if (newPassword !== confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Lỗi", "Mật khẩu mới và xác nhận không khớp");
      return;
    }

    if (newPassword.length < 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setSaving(true);
    try {
      await POST_CHANGE_PASSWORD(userId!, oldPassword, newPassword);

      // Hiệu ứng rung thành công
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Hiển thị animation thành công
      setPasswordChangeSuccess(true);
      
      // Reset các trường sau 1.5s
      setTimeout(() => {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordChangeSuccess(false);
      }, 2000);

    } catch (error: any) {
      console.error("Lỗi đổi mật khẩu:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMsg = error.response?.data?.message || "Mật khẩu cũ không đúng hoặc có lỗi xảy ra";
      Alert.alert("Lỗi", errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.page, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color="#ff8a34" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
      <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
              {/* [ĐÃ ĐỔI] Dùng Feather Icon giống trang PersonalInfo */}
              <Feather name="chevron-left" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>

            <View style={{ width: 38 }} /> 
          </View>

          {/* AVATAR */}
          <View style={styles.avatarBox}>
            <View style={styles.avatarCircle}>
              <Image
                source={require("../../../assets/images/avatar.png")}
                style={styles.avatar}
              />
            </View>

            <TouchableOpacity style={styles.editIcon}>
              {/* [ĐÃ ĐỔI] Dùng Icon cây bút thay vì text */}
              <Feather name="edit-2" size={14} color="white" />
            </TouchableOpacity>
          </View>

          {/* FORM INPUTS */}
          
          <Text style={styles.label}>HỌ (LAST NAME)</Text>
          <TextInput
            style={styles.input}
            value={firstName} 
            onChangeText={setFirstName}
          />

          <Text style={styles.label}>TÊN (FIRST NAME)</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={[styles.input, {color: '#999'}]} 
            value={email}
            editable={false}
          />

          <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>GIỚI THIỆU (BIO)</Text>
          <TextInput
            style={[styles.input, { height: 90 }]}
            value={bio}
            multiline
            onChangeText={setBio}
          />

          {/* PHẦN ĐỔI MẬT KHẨU */}
          <View style={styles.passwordSection}>
            <View style={styles.sectionHeader}>
              <Feather name="lock" size={18} color="#ff8a34" />
              <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
            </View>
            
            {passwordChangeSuccess && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.successText}>Mật khẩu đã được cập nhật thành công!</Text>
              </View>
            )}
            
            <Text style={styles.label}>MẬT KHẨU CŨ</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry={!showOldPassword}
                placeholder="Nhập mật khẩu cũ"
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                <Ionicons name={showOldPassword ? "eye-off" : "eye"} size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>MẬT KHẨU MỚI</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>XÁC NHẬN MẬT KHẨU MỚI</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.changePasswordBtn, passwordChangeSuccess && styles.changePasswordBtnSuccess]} 
              onPress={handleChangePassword}
              disabled={saving || passwordChangeSuccess}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : passwordChangeSuccess ? (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.changePasswordText}>Đã cập nhật!</Text>
                </>
              ) : (
                <Text style={styles.changePasswordText}>ĐỔI MẬT KHẨU</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity 
            style={styles.saveBtn} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
               <ActivityIndicator color="white" />
            ) : (
               <Text style={styles.saveText}>LƯU</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  container: {
    padding: 18,
    paddingTop: 50, 
  },

  /** HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  headerBtn: {
    width: 40, // [ĐÃ CHỈNH] Tăng nhẹ kích thước cho icon nằm giữa đẹp hơn
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eef1f5", // [ĐÃ CHỈNH] Màu nền xám nhạt giống trang PersonalInfo
    justifyContent: "center",
    alignItems: "center",
  },
  // headerIcon: Đã xóa style này vì dùng Vector Icon trực tiếp
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },

  /** AVATAR SECTION */
  avatarBox: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ffe2d3",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ff8a34",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: -2,
    right: 120 / 2 - 15,
    borderWidth: 2, // Thêm viền trắng mỏng để tách biệt với avatar
    borderColor: '#f5f7fb'
  },

  /** FORM INPUTS */
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#e9eef4",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 0, 
    color: "#333",
  },

  /** SAVE BUTTON */
  saveBtn: {
    backgroundColor: "#ff8a34",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 30,
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  /** PASSWORD SECTION */
  passwordSection: {
    marginTop: 30,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 2,
    borderTopColor: "#ffe8d9",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: -4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  successText: {
    flex: 1,
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "600",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fc",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#e5e8ef",
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  changePasswordBtn: {
    backgroundColor: "#ff8a34",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#ff8a34",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  changePasswordBtnSuccess: {
    backgroundColor: "#4CAF50",
    shadowColor: "#4CAF50",
  },
  changePasswordText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
