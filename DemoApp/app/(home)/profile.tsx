import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter, useFocusEffect } from "expo-router"; // Thêm useFocusEffect
import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "../components/context/AuthContext";
import { useCart } from "../components/cart/CartContext"; 
import HeaderCartButton from "../components/cart/HeaderCartButton";
import { GET_USER_BY_EMAIL, GET_USER_ORDERS, getUserImageUrl, PUT_UPDATE_USER_IMAGE } from "../../APIService"; // Thêm hàm lấy đơn hàng
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth(); 
  const { clearCart } = useCart(); 
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // State lưu số lượng đơn hàng cho các Badge
  const [counts, setCounts] = useState({
    pending: 0,
    confirmed: 0,
    shipping: 0,
    completed: 0
  });

  // 🎁 Loyalty Points (Mock Data - thực tế cần API)
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const loyaltyTier = loyaltyPoints >= 5000 ? 'VIP' : loyaltyPoints >= 2000 ? 'Gold' : loyaltyPoints >= 500 ? 'Silver' : 'Bronze';
  const tierColor = loyaltyTier === 'VIP' ? '#9C27B0' : loyaltyTier === 'Gold' ? '#FFB300' : loyaltyTier === 'Silver' ? '#78909C' : '#CD7F32';

  // Load thông tin user (chỉ chạy 1 lần khi mount)
  useEffect(() => {
    fetchUserData();
  }, []);

  // Tự động cập nhật số lượng đơn hàng mỗi khi màn hình được Focus (quay lại tab này)
  useFocusEffect(
    useCallback(() => {
      updateOrderCounts();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem("saved-email");
      if (savedEmail) {
        const cleanEmail = savedEmail.trim().toLowerCase();
        const response = await GET_USER_BY_EMAIL(cleanEmail);
        if (response && response.data) {
           setUser(response.data);
           // 🎁 Dùng điểm từ Backend
           setLoyaltyPoints(response.data.loyaltyPoints || 0);
        }
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin user:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderCounts = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem("saved-email");
      if (!savedEmail) return;

      const response = await GET_USER_ORDERS(savedEmail.trim().toLowerCase());
      const orders = response.data || [];

      // Logic tính toán số lượng dựa trên orderStatus
      const newCounts = { pending: 0, confirmed: 0, shipping: 0, completed: 0 };
      
      orders.forEach((order: any) => {
        const status = (order.orderStatus || "").toLowerCase();
        if (status.includes("pending")) newCounts.pending++;
        else if (status.includes("confirmed") || status.includes("accepted")) newCounts.confirmed++;
        else if (status.includes("shipping") || status.includes("delivery")) newCounts.shipping++;
        else if (status.includes("completed") || status.includes("success") || status.includes("delivered")) newCounts.completed++;
      });

      setCounts(newCounts);
      // 🔥 KHÔNG dùng mock điểm nữa, Backend sẽ trả về trong User object
    } catch (error) {
      console.error("Lỗi cập nhật số lượng đơn:", error);
    }
  };

  // Component con cho từng mục trong danh sách (Giữ nguyên)
  const Item = ({
    label, icon, iconBg, screen, onPress, count
  }: {
    label: string; icon: React.ReactNode; iconBg: string; screen?: string; onPress?: () => void; count?: number;
  }) => (
    <TouchableOpacity
      style={styles.itemRow}
      activeOpacity={0.7}
      onPress={onPress ? onPress : () => screen && router.push(screen as any)}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <Text style={styles.itemLabel}>{label}</Text>
      {count !== undefined && count > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color="#bfc4d1" />
    </TouchableOpacity>
  );

  // Component con cho phần phân loại đơn hàng (CẬP NHẬT: Thêm Badge hiển thị số lượng)
  const OrderStatus = ({ label, icon, status, count }: { label: string; icon: any; status: string; count: number }) => (
    <TouchableOpacity 
      style={styles.statusItem}
      onPress={() => router.push({ pathname: "/components/order/order", params: { activeTab: status } } as any)}
    >
      <View style={styles.statusIconContainer}>
        <Ionicons name={icon} size={26} color="#4a4a4a" />
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
          </View>
        )}
      </View>
      <Text style={styles.statusText}>{label}</Text>
    </TouchableOpacity>
  );

  const performLogout = async () => {
    try {
      if (clearCart) {
        clearCart();
      }
      await AsyncStorage.removeItem("jwt-token");
      await AsyncStorage.removeItem("saved-email");
      await AsyncStorage.removeItem("saved-password");
      logout(); 
      router.replace("/auth/login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };
  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
      if (confirm) performLogout();
    } else {
      Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng xuất", style: "destructive", onPress: performLogout },
      ]);
    }
  };

  const pickImage = async () => {
    // Xin quyền truy cập thư viện ảnh
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thất bại', 'Chúng tôi cần quyền truy cập ảnh để đổi ảnh đại diện');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets[0].uri && user) {
      handleUploadImage(result.assets[0].uri);
    }
  };

  const handleUploadImage = async (uri: string) => {
    try {
      setUploading(true);
      const response = await PUT_UPDATE_USER_IMAGE(user.userId, uri);
      if (response && response.data) {
        setUser(response.data);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Thành công", "Đã cập nhật ảnh đại diện!");
      }
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      Alert.alert("Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
       <ActivityIndicator size="large" color="#ff8a4c" />
    </View>
  );

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={[styles.header, { marginTop: Math.max(insets.top, 15) }]}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#4a4a4a" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Hồ sơ</Text>
          <HeaderCartButton />
        </View>

        {/* User Info Section */}
        <View style={styles.userSection}>
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
            <View style={styles.avatarWrapper}>
              <Image
                source={user?.image ? { uri: getUserImageUrl(user.image) } : { uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
                style={styles.avatar}
              />
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>
            {user ? `${user.firstName} ${user.lastName}` : "Khách"}
          </Text>
          <Text style={styles.userBio}>
            {user?.email || "Chưa đăng nhập"}
          </Text>
        </View>

        {/* 🎁 LOYALTY POINTS CARD */}
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyHeader}>
            <View style={styles.loyaltyInfo}>
              <View style={styles.loyaltyIconWrapper}>
                <Ionicons name="gift" size={24} color="#FF7622" />
              </View>
              <View>
                <Text style={styles.loyaltyTitle}>Điểm thưởng</Text>
                <View style={styles.tierBadge}>
                  <Ionicons name="ribbon" size={12} color={tierColor} />
                  <Text style={[styles.tierText, { color: tierColor }]}>{loyaltyTier}</Text>
                </View>
              </View>
            </View>
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsNumber}>{loyaltyPoints.toLocaleString('vi-VN')}</Text>
              <Text style={styles.pointsLabel}>điểm</Text>
            </View>
          </View>
          
          <View style={styles.loyaltyProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: `${Math.min((loyaltyPoints / (loyaltyTier === 'Bronze' ? 500 : loyaltyTier === 'Silver' ? 2000 : 5000)) * 100, 100)}%` 
              }]} />
            </View>
            <Text style={styles.progressText}>
              {loyaltyTier === 'VIP' ? 'Hạng cao nhất!' : 
                `Còn ${((loyaltyTier === 'Bronze' ? 500 : loyaltyTier === 'Silver' ? 2000 : 5000) - loyaltyPoints).toLocaleString('vi-VN')} điểm nữa`}
            </Text>
          </View>
          
          <View style={styles.loyaltyActions}>
            <TouchableOpacity style={styles.loyaltyBtn}>
              <Ionicons name="gift-outline" size={16} color="#FF7622" />
              <Text style={styles.loyaltyBtnText}>Đổi quà</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loyaltyBtn}>
              <Ionicons name="time-outline" size={16} color="#FF7622" />
              <Text style={styles.loyaltyBtnText}>Lịch sử</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.loyaltyBtn, styles.loyaltyBtnPrimary]}>
              <Ionicons name="sparkles" size={16} color="#FFF" />
              <Text style={[styles.loyaltyBtnText, { color: '#FFF' }]}>Ưu đãi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PHẦN PHÂN LOẠI ĐƠN HÀNG (Đã tích hợp Badge) */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderTitle}>Đơn hàng của tôi</Text>
            <TouchableOpacity onPress={() => router.push("/components/order/order" as any)}>
              <Text style={styles.orderHistoryText}>Lịch sử mua hàng {">"}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusRow}>
            <OrderStatus label="Chờ xác nhận" icon="wallet-outline" status="PENDING" count={counts.pending} />
            <OrderStatus label="Chờ lấy hàng" icon="cube-outline" status="CONFIRMED" count={counts.confirmed} />
            <OrderStatus label="Đang giao" icon="bicycle-outline" status="SHIPPING" count={counts.shipping} />
            <OrderStatus label="Đã giao" icon="star-outline" status="COMPLETED" count={counts.completed} />
          </View>
        </View>

        {/* Các nhóm chức năng cũ */}
        <View style={styles.card}>
          <Item label="Thông tin cá nhân" icon={<Ionicons name="person-outline" size={20} color="#ff8a4c" />} iconBg="#ffe6d9" screen="/components/profile/personal-info" />
          <Item label="Địa chỉ giao hàng" icon={<Ionicons name="location-outline" size={20} color="#7d6cff" />} iconBg="#ebe7ff" screen="/components/profile/address" />
        </View>

        <View style={styles.card}>
          <Item label="Yêu thích" icon={<Ionicons name="heart-outline" size={20} color="#ff6b98" />} iconBg="#ffe0ea" screen="/favourite" />
          <Item label="Đánh giá của tôi" icon={<Ionicons name="star-outline" size={20} color="#FFB800" />} iconBg="#FFF8E1" screen="/components/profile/reviews" />
          <Item label="Thông báo" icon={<Ionicons name="notifications-outline" size={20} color="#ffa94d" />} iconBg="#ffe9d6" screen="/notifications" />
          <Item label="Phương thức thanh toán" icon={<Ionicons name="card-outline" size={20} color="#39c2ad" />} iconBg="#d9f5f1" screen="/payment" />
        </View>

        <View style={styles.card}>
          <Item label="FAQs" icon={<Ionicons name="help-circle-outline" size={20} color="#ff825c" />} iconBg="#ffe6dd" screen="/faq" />
          <Item label="Cài đặt" icon={<Ionicons name="settings-outline" size={20} color="#8b67ff" />} iconBg="#eee6ff" screen="/components/profile/settings" />
        </View>

        <View style={styles.card}>
          <Item label="Đăng xuất" icon={<Feather name="log-out" size={20} color="#ff6b6b" />} iconBg="#ffe1e1" onPress={handleLogout} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f8f9fa" },
  container: { padding: 18 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 26 },
  headerBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3 },
  headerText: { fontSize: 18, fontWeight: "600", color: "#2d2d2d" },
  userSection: { alignItems: "center", marginBottom: 22 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 82, height: 82, borderRadius: 41, borderWidth: 3, borderColor: "#fff" },
  uploadingOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    borderRadius: 41, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ff8a4c',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  userName: { marginTop: 10, fontSize: 17, fontWeight: "600", color: "#2d2d2d" },
  userBio: { marginTop: 4, fontSize: 13, color: "#8fa1b7" },
  
  orderCard: { backgroundColor: "#fff", borderRadius: 18, marginBottom: 16, paddingVertical: 16, elevation: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6 },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: "#f1f2f4", paddingBottom: 12 },
  orderTitle: { fontSize: 15, fontWeight: "600", color: "#2d2d2d" },
  orderHistoryText: { fontSize: 12, color: "#8fa1b7" },
  statusRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 16 },
  statusItem: { alignItems: "center", flex: 1 },
  
  // Style cho Badge số lượng
  statusIconContainer: { position: 'relative', marginBottom: 6, padding: 4 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: '#FF4D4F',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
    paddingHorizontal: 4
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  statusText: { fontSize: 11, color: "#4a4a4a", textAlign: "center" },

  card: { backgroundColor: "#fff", borderRadius: 18, marginBottom: 16, overflow: "hidden", elevation: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6 },
  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#f1f2f4" },
  iconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 14 },
  itemLabel: { fontSize: 15, flex: 1, color: "#2d2d2d" },
  
  // 🎁 Loyalty Points Styles
  loyaltyCard: { 
    backgroundColor: "#fff", 
    borderRadius: 18, 
    marginBottom: 16, 
    padding: 16, 
    elevation: 2, 
    shadowColor: "#FF7622", 
    shadowOpacity: 0.15, 
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#FFF0E3'
  },
  loyaltyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  loyaltyInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  loyaltyIconWrapper: { 
    width: 44, height: 44, borderRadius: 12, 
    backgroundColor: '#FFF0E3', 
    justifyContent: 'center', alignItems: 'center' 
  },
  loyaltyTitle: { fontSize: 14, color: '#666', marginBottom: 2 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tierText: { fontSize: 12, fontWeight: '700' },
  pointsContainer: { alignItems: 'flex-end' },
  pointsNumber: { fontSize: 24, fontWeight: '800', color: '#FF7622' },
  pointsLabel: { fontSize: 11, color: '#999' },
  loyaltyProgress: { marginTop: 16 },
  progressBar: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FF7622', borderRadius: 3 },
  progressText: { fontSize: 11, color: '#888', marginTop: 6, textAlign: 'center' },
  loyaltyActions: { flexDirection: 'row', marginTop: 16, gap: 10 },
  loyaltyBtn: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    gap: 6, paddingVertical: 10, borderRadius: 10, 
    backgroundColor: '#FFF0E3' 
  },
  loyaltyBtnPrimary: { backgroundColor: '#FF7622' },
  loyaltyBtnText: { fontSize: 12, fontWeight: '600', color: '#FF7622' },
  countBadge: { 
    backgroundColor: '#FF4D4F', 
    borderRadius: 10, 
    minWidth: 18, 
    height: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 4,
    marginRight: 8
  },
  countText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
});