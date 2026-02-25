import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router"; // [MỚI] Import useFocusEffect
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { GET_USER_BY_EMAIL } from "../../../APIService"; 

export default function PersonalInfo() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hàm tải dữ liệu
  const fetchUserData = async () => {
    // Không set loading=true ở đây để tránh nháy màn hình khi quay lại
    try {
      const email = await AsyncStorage.getItem("saved-email");
      if (!email) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      const response = await GET_USER_BY_EMAIL(email);
      setUser(response.data);
    } catch (error) {
      console.error("Lỗi tải User:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // [MỚI] Tự động chạy lại hàm này mỗi khi màn hình được "Focus" (quay lại từ trang khác)
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData();
  }, []);

  if (loading && !user) {
    return (
      <View style={[styles.page, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#ff8a34" />
      </View>
    );
  }

  const displayUser = user || {
    firstName: "User",
    lastName: "Name",
    email: "email@example.com",
    mobileNumber: "..."
  };

  return (
    <ScrollView 
      style={styles.page} 
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={22} color="#444" />
        </TouchableOpacity>

        <Text style={styles.title}>Thông tin cá nhân</Text>

        <TouchableOpacity
          onPress={() => router.push("/components/profile/edit-profile")}
        >
          <Text style={styles.editText}>SỬA</Text>
        </TouchableOpacity>
      </View>

      {/* USER INFO */}
      <View style={styles.profileBox}>
        <Image
          source={require("../../../assets/images/avatar.png")}
          style={styles.avatar}
        />

        <Text style={styles.name}>{displayUser.firstName} {displayUser.lastName}</Text>
        <Text style={styles.bio}>Yêu thích ẩm thực</Text>
      </View>

      {/* INFO CARD */}
      <View style={styles.card}>
        {/* FULL NAME */}
        <View style={styles.item}>
          <View style={styles.iconBox}>
            <Ionicons name="person-outline" size={20} color="#ff9e5e" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemLabel}>HỌ VÀ TÊN</Text>
            <Text style={styles.itemValue}>{displayUser.firstName} {displayUser.lastName}</Text>
          </View>
        </View>

        {/* EMAIL */}
        <View style={styles.item}>
          <View style={styles.iconBox}>
            <Ionicons name="mail-outline" size={20} color="#6c9dfd" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemLabel}>EMAIL</Text>
            <Text style={styles.itemValue}>{displayUser.email}</Text>
          </View>
        </View>

        {/* PHONE */}
        <View style={styles.item}>
          <View style={styles.iconBox}>
            <Ionicons name="call-outline" size={20} color="#5ecf92" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemLabel}>SỐ ĐIỆN THOẠI</Text>
            <Text style={styles.itemValue}>{displayUser.mobileNumber}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// [STYLE CHUẨN GỐC - Đã bỏ paddingTop 50]
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    padding: 25, // [ĐÃ SỬA] Quay về padding gốc, bỏ paddingTop: 50
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eef1f5",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },
  editText: {
    fontSize: 14,
    color: "#ff8a34",
    fontWeight: "700",
  },

  profileBox: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  bio: {
    color: "#7d8a9a",
    marginTop: 4,
    fontSize: 14,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  iconBox: {
    width: 42,
    height: 42,
    backgroundColor: "#eef3f8",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  itemLabel: {
    fontSize: 12,
    color: "#9aa4b2",
    fontWeight: "600",
  },

  itemValue: {
    fontSize: 15,
    color: "#333",
    marginTop: 3,
  },
});