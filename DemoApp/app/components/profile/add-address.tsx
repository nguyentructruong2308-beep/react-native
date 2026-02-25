import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { POST_ADD_ADDRESS, PUT_UPDATE_ADDRESS } from "../../../APIService"; 

export default function AddAddressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  
  const isEdit = !!params.addressId; 
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    street: (params.street as string) || "",
    buildingName: (params.buildingName as string) || "",
    city: (params.city as string) || "",
    state: (params.state as string) || "Vietnam", 
    country: (params.country as string) || "Vietnam",
    pincode: (params.pincode as string) || "",
  });

  const [label, setLabel] = useState((params.label as string) || "home");

  const handleSave = async () => {
    if (formData.street.length < 5) return Alert.alert("Lỗi", "Tên đường phải có ít nhất 5 ký tự");
    if (formData.buildingName.length < 5) return Alert.alert("Lỗi", "Tên tòa nhà phải có ít nhất 5 ký tự");
    if (formData.city.length < 4) return Alert.alert("Lỗi", "Tên thành phố phải có ít nhất 4 ký tự");
    if (formData.pincode.length < 6) return Alert.alert("Lỗi", "Mã bưu điện phải có ít nhất 6 ký tự");

    setLoading(true);
    try {
      const email = await AsyncStorage.getItem("saved-email");
      if (!email) {
        setLoading(false);
        return Alert.alert("Thông báo", "Vui lòng đăng nhập để thực hiện");
      }

      const payload = { ...formData, label };

      if (isEdit) {
        await PUT_UPDATE_ADDRESS(email, params.addressId as string, payload);
        Alert.alert("Thành công", "Đã cập nhật địa chỉ");
      } else {
        await POST_ADD_ADDRESS(email, payload);
        Alert.alert("Thành công", "Đã lưu địa chỉ mới");
      }
      router.back(); 
    } catch (error) {
      console.error("Lỗi API Address:", error);
      Alert.alert("Lỗi", "Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.mapBox}>
        <Feather name="map" size={48} color="#bbb" />
        <Text style={{ color: "#888", marginTop: 6 }}>Kéo ghim để chọn vị trí</Text>
        <TouchableOpacity style={styles.mapBackBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={22} color="#444" />
        </TouchableOpacity>
        <View style={styles.pin}>
          <Feather name="map-pin" size={36} color="#ff6b6b" />
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>TÒA NHÀ / SỐ NHÀ</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Landmark 81"
          value={formData.buildingName}
          onChangeText={(txt) => setFormData({ ...formData, buildingName: txt })}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>TÊN ĐƯỜNG</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Đường Lê Lợi" 
              value={formData.street}
              onChangeText={(txt) => setFormData({ ...formData, street: txt })}
            />
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>MÃ BƯU ĐIỆN</Text>
            <TextInput 
              style={styles.input} 
              placeholder="345678" 
              keyboardType="numeric"
              maxLength={6}
              value={formData.pincode}
              onChangeText={(txt) => setFormData({ ...formData, pincode: txt })}
            />
          </View>
        </View>

        <Text style={styles.label}>THÀNH PHỐ</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Hà Nội hoặc Hồ Chí Minh" 
          value={formData.city}
          onChangeText={(txt) => setFormData({ ...formData, city: txt })}
        />

        <Text style={styles.label}>LƯU ĐỊA CHỈ LÀ</Text>
        <View style={styles.labelRow}>
          {["Home", "Work", "Other"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setLabel(item.toLowerCase())}
              style={[styles.labelBtn, label === item.toLowerCase() && styles.labelBtnActive]}
            >
              <Text style={[styles.labelBtnText, label === item.toLowerCase() && styles.labelBtnTextActive]}>
                {item === "Home" ? "Nhà" : item === "Work" ? "Công ty" : "Khác"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>LƯU ĐỊA CHỈ</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f5f7fb" },
  mapBox: {
    height: 260,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  mapBackBtn: {
    position: "absolute",
    top: 50,
    left: 16,
    backgroundColor: "#fff",
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    zIndex: 10,
  },
  pin: {
    position: "absolute",
    top: "50%",
    marginTop: -36,
  },
  form: {
    flex: 1,
    marginTop: -20,
    backgroundColor: "#fff",
    padding: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  label: {
    color: "#7d8a9a",
    fontSize: 13,
    marginTop: 14,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#eef3f8",
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  row: { flexDirection: "row", marginTop: 6 },
  labelRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  labelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#eef3f8",
  },
  labelBtnActive: { backgroundColor: "#ff8a34" },
  labelBtnText: { color: "#7d8a9a", fontWeight: "600" },
  labelBtnTextActive: { color: "#fff" },
  saveBtn: {
    marginTop: 30,
    backgroundColor: "#ff8a34",
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    height: 56,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});