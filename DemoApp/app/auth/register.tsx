import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from "react-native";
import { POST_ADD } from "../../APIService";

export default function SignUpScreen() {
  const router = useRouter();
  
  // --- LOGIC GIỮ NGUYÊN KHÔNG ĐỔI ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState({
    street: "", buildingName: "", city: "", state: "", country: "", pincode: ""
  });

  const registerUser = async () => {
    if (!email || !password || !firstName || !mobileNumber) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }
    if (address.buildingName.length < 5) {
      Alert.alert("Lỗi địa chỉ", "Tên tòa nhà phải có ít nhất 5 ký tự.");
      return;
    }
    if (address.street.length < 5) {
      Alert.alert("Lỗi địa chỉ", "Tên đường phải có ít nhất 5 ký tự.");
      return;
    }
    if (address.pincode.length < 6) {
      Alert.alert("Lỗi địa chỉ", "Mã bưu điện phải có ít nhất 6 ký tự.");
      return;
    }

    const payload = {
      userId: 0,
      firstName,
      lastName,
      mobileNumber,
      email,
      password,
      roles: [{ roleId: 101, roleName: "ADMIN" }],
      address: { addressId: 0, ...address }
    };

    try {
      const response = await POST_ADD("register", payload);
      if (response.status === 201 || response.status === 200) {
        Alert.alert("Thành công", "Tài khoản của bạn đã được tạo thành công!");
        router.replace("/auth/login");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.response?.status === 400) {
        Alert.alert("Lỗi dữ liệu", "Dữ liệu không hợp lệ.");
      } else {
        Alert.alert("Lỗi kết nối", "Không thể kết nối đến máy chủ.");
      }
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* PHẦN HEADER MÀU TỐI */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#121223" />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Đăng Ký</Text>
          <Text style={styles.headerSubtitle}>Vui lòng điền thông tin để bắt đầu</Text>
        </View>
      </View>

      {/* PHẦN FORM MÀU TRẮNG BO GÓC */}
      <View style={styles.formSheet}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined} 
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            
            {/* HỌ VÀ TÊN */}
            <Text style={styles.label}>TÊN</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nhập tên của bạn" 
              value={firstName} 
              onChangeText={setFirstName} 
              placeholderTextColor="#A0A5BA"
            />

            <Text style={styles.label}>HỌ</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nhập họ" 
              value={lastName} 
              onChangeText={setLastName} 
              placeholderTextColor="#A0A5BA"
            />

            {/* EMAIL & SĐT */}
            <Text style={styles.label}>EMAIL</Text>
            <TextInput 
              style={styles.input} 
              placeholder="example@gmail.com" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              autoCapitalize="none" 
              placeholderTextColor="#A0A5BA"
            />

            <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
            <TextInput 
              style={styles.input} 
              placeholder="09xx..." 
              value={mobileNumber} 
              onChangeText={setMobileNumber} 
              keyboardType="phone-pad" 
              placeholderTextColor="#A0A5BA"
            />
            
            {/* MẬT KHẨU */}
            <Text style={styles.label}>MẬT KHẨU</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
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
                  size={24} 
                />
              </TouchableOpacity>
            </View>

            {/* ĐỊA CHỈ - Gom nhóm */}
            <View style={styles.dividerBox}>
              <Text style={styles.sectionTitle}>ĐỊA CHỈ GIAO HÀNG</Text>
            </View>

            <Text style={styles.label}>ĐƯỜNG & TÒA NHÀ</Text>
            <TextInput style={styles.input} placeholder="Tên đường (ít nhất 5 ký tự)" value={address.street} onChangeText={(text) => setAddress({ ...address, street: text })} placeholderTextColor="#A0A5BA"/>
            <TextInput style={styles.input} placeholder="Tên tòa nhà (ít nhất 5 ký tự)" value={address.buildingName} onChangeText={(text) => setAddress({ ...address, buildingName: text })} placeholderTextColor="#A0A5BA"/>
            
            <Text style={styles.label}>THÀNH PHỐ & TỈNH</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <TextInput style={[styles.input, {flex: 0.48}]} placeholder="Thành phố" value={address.city} onChangeText={(text) => setAddress({ ...address, city: text })} placeholderTextColor="#A0A5BA"/>
                <TextInput style={[styles.input, {flex: 0.48}]} placeholder="Tỉnh/State" value={address.state} onChangeText={(text) => setAddress({ ...address, state: text })} placeholderTextColor="#A0A5BA"/>
            </View>

            <Text style={styles.label}>QUỐC GIA & ZIPCODE</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <TextInput style={[styles.input, {flex: 0.48}]} placeholder="Quốc gia" value={address.country} onChangeText={(text) => setAddress({ ...address, country: text })} placeholderTextColor="#A0A5BA"/>
                <TextInput style={[styles.input, {flex: 0.48}]} placeholder="Mã bưu điện" value={address.pincode} onChangeText={(text) => setAddress({ ...address, pincode: text })} placeholderTextColor="#A0A5BA"/>
            </View>

            {/* NÚT ĐĂNG KÝ */}
            <TouchableOpacity style={styles.signUpButton} onPress={registerUser}>
              <Text style={styles.signUpButtonText}>ĐĂNG KÝ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.back()} style={styles.footerLink}>
              <Text style={styles.footerText}>
                Đã có tài khoản? <Text style={styles.highlightText}>Đăng nhập</Text>
              </Text>
            </TouchableOpacity>

            {/* Padding bottom để scroll hết */}
            <View style={{height: 50}} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#121223", // Màu nền tối cho Header
  },
  // --- HEADER STYLE ---
  headerContainer: {
    height: 180, // Chiều cao phần màu tối
    paddingTop: 50,
    paddingHorizontal: 24,
    alignItems: 'center', // Căn giữa nội dung
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    width: 45,
    height: 45,
    backgroundColor: "#fff", // Nút back tròn màu trắng
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10
  },
  headerTextContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.7,
  },

  // --- FORM STYLE ---
  formSheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30, // Bo góc giống ảnh
    borderTopRightRadius: 30,
    paddingTop: 30,
    overflow: 'hidden', // Để bo góc hoạt động tốt
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  
  // LABEL & INPUT
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#32343E",
    marginBottom: 8,
    marginTop: 5,
    textTransform: 'uppercase' // Chữ in hoa tiêu đề
  },
  input: {
    backgroundColor: "#F0F5FA", // Màu nền xám nhạt
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1E1E2E",
    marginBottom: 16,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F0F5FA",
    borderRadius: 10,
    marginBottom: 16,
    paddingRight: 10
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1E1E2E",
  },
  eyeIcon: {
    padding: 10,
  },

  // SECTION DIVIDER
  dividerBox: {
    marginTop: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F5FA',
    paddingBottom: 5
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF7622",
  },

  // BUTTONS
  signUpButton: {
    backgroundColor: "#FF7622", // Cam đậm
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1
  },
  footerLink: {
    marginTop: 20,
    alignItems: 'center'
  },
  footerText: {
    color: '#A0A5BA',
    fontSize: 15,
  },
  highlightText: {
    color: '#FF7622',
    fontWeight: '700'
  }
});