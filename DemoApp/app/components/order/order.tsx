import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  ScrollView // Thêm ScrollView để làm thanh Tab cuộn ngang
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router"; // Thêm useLocalSearchParams
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GET_USER_ORDERS, getProductImageUrl, PUT_CANCEL_ORDER } from "../../../APIService";
import { useCart } from "../../components/cart/CartContext";

// Định nghĩa các Tab theo phong cách Shopee
const ORDER_TABS = [
  { id: "ALL", label: "Tất cả" },
  { id: "PENDING", label: "Chờ xác nhận" },
  { id: "CONFIRMED", label: "Chờ lấy hàng" },
  { id: "SHIPPING", label: "Đang giao" },
  { id: "COMPLETED", label: "Đã giao" },
  { id: "CANCELLED", label: "Đã hủy" },
];

export default function OrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); // Lấy params từ Profile truyền sang
  const cartContext = useCart();
  const addToCart = cartContext?.addToCart;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Thay đổi state activeTab để khớp với danh sách ORDER_TABS
  const [activeTab, setActiveTab] = useState<string>("ALL");

  // --- ĐỒNG BỘ TAB TỪ PROFILE ---
  useEffect(() => {
    if (params.activeTab) {
      setActiveTab(params.activeTab as string);
    }
  }, [params.activeTab]);

  const fetchOrders = async () => {
    try {
      const email = await AsyncStorage.getItem("saved-email");
      if (!email) {
        setLoading(false);
        return;
      }
      const response = await GET_USER_ORDERS(email);
      const data = response.data || [];
      const sorted = data.sort((a: any, b: any) => b.orderId - a.orderId);
      setOrders(sorted);
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // --- HÀM MUA LẠI (Giữ nguyên logic của bạn) ---
  const handleReOrder = async (orderItems: any[]) => {
    if (!addToCart) {
        const msg = "Lỗi: Chưa khởi tạo giỏ hàng.";
        if(Platform.OS === 'web') alert(msg);
        else Alert.alert("Lỗi", msg);
        return;
    }
    try {
        setLoading(true);
        let count = 0;
        for (const item of orderItems) {
            if (item.product) {
                await addToCart(item.product, item.quantity || 1);
                count++;
            }
        }
        if (count > 0) {
            if(Platform.OS === 'web') {
                const ok = window.confirm(`Đã thêm ${count} món vào giỏ. Đến giỏ hàng ngay?`);
                if(ok) router.push("/components/cart/cart");
            } else {
                Alert.alert("Thành công", `Đã thêm ${count} món vào giỏ hàng!`, [
                    { text: "Đến giỏ hàng", onPress: () => router.push("/components/cart/cart") },
                    { text: "Ở lại", style: "cancel" }
                ]);
            }
        }
    } catch (error) {
        console.log(error);
    } finally {
        setLoading(false);
    }
  };

  // --- HÀM HỦY ĐƠN (Giữ nguyên logic của bạn) ---
  const executeCancel = async (orderId: number) => {
    try {
        setLoading(true);
        const email = await AsyncStorage.getItem("saved-email");
        if (!email) return;
        await PUT_CANCEL_ORDER(email, orderId);
        if (Platform.OS === 'web') alert("Đã hủy đơn hàng thành công!");
        else Alert.alert("Thành công", "Đã hủy đơn hàng.");
        await fetchOrders(); 
    } catch (error: any) {
        const msg = error.response?.data?.message || "Không thể hủy đơn hàng này.";
        if (Platform.OS === 'web') alert("Lỗi: " + msg);
        else Alert.alert("Lỗi", msg);
    } finally {
        setLoading(false);
    }
  };

  const handleCancelOrder = (orderId: number) => {
      if (Platform.OS === 'web') {
          const shouldCancel = window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?");
          if (shouldCancel) executeCancel(orderId);
      } else {
          Alert.alert("Xác nhận hủy", "Bạn có chắc muốn hủy đơn không?", [
              { text: "Không", style: "cancel" },
              { text: "Hủy đơn", style: "destructive", onPress: () => executeCancel(orderId) }
          ]);
      }
  };

  // --- XỬ LÝ TRẠNG THÁI & LỌC ---
  const normalizeStatus = (status: string) => status ? status.toLowerCase().trim().replace('!', '') : "";

  const getStatusInfo = (status: string) => {
      const s = normalizeStatus(status);
      if (s.includes('pending payment')) return { text: "Chờ thanh toán", color: "#FF3D00" };
      if (s.includes('pending confirmation') || s === 'pending') return { text: "Chờ xác nhận", color: "#FF9800" }; 
      if (s.includes('accepted') || s.includes('confirmed')) return { text: "Chờ lấy hàng", color: "#2196F3" };
      if (s.includes('shipping') || s.includes('delivery')) return { text: "Đang giao hàng", color: "#2196F3" };
      if (s.includes('delivered') || s.includes('completed') || s.includes('success')) return { text: "Hoàn tất", color: "#4CAF50" };
      if (s.includes('cancel')) return { text: "Đã hủy", color: "#F44336" };
      return { text: status, color: "#757575" };
  };

  const filteredOrders = orders.filter((order) => {
      if (activeTab === "ALL") return true;
      const s = normalizeStatus(order.orderStatus);
      
      switch (activeTab) {
          case "PENDING": return s.includes("pending");
          case "CONFIRMED": return s.includes("accepted") || s.includes("confirmed");
          case "SHIPPING": return s.includes("shipping") || s.includes("delivery");
          case "COMPLETED": return s.includes("completed") || s.includes("success") || s.includes("delivered");
          case "CANCELLED": return s.includes("cancel");
          default: return true;
      }
  });

  const renderItem = ({ item }: { item: any }) => {
    const firstProduct = item.orderItems?.[0]?.product;
    const productName = firstProduct ? firstProduct.productName : "Đơn hàng";
    const productImg = firstProduct ? getProductImageUrl(firstProduct.image) : "https://via.placeholder.com/100";
    const itemCount = item.orderItems ? item.orderItems.length : 0;
    const statusInfo = getStatusInfo(item.orderStatus);
    const s = normalizeStatus(item.orderStatus);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Image source={{ uri: productImg }} style={styles.img} />
            <View style={styles.info}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={styles.title} numberOfLines={1}>{productName}</Text>
                    <Text style={styles.id}>#{item.orderId}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.price}>{Number(item.totalAmount).toLocaleString('vi-VN')} đ</Text>
                    <Text style={styles.items}> | {itemCount} Món</Text>
                </View>
                <Text style={[styles.status, { color: statusInfo.color }]}>{statusInfo.text}</Text>
            </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.btnRow}>
            <TouchableOpacity 
                style={styles.btnOutline}
                onPress={() => router.push({ pathname: "/components/order/order-detail", params: { orderData: JSON.stringify(item) } })}
            >
                <Text style={styles.btnOutlineText}>Chi tiết</Text>
            </TouchableOpacity>

            {/* Chỉ hiện nút Hủy nếu đơn đang chờ */}
            {s.includes("pending") && (
                <TouchableOpacity style={styles.btnCancel} onPress={() => handleCancelOrder(item.orderId)}>
                    <Text style={styles.btnCancelText}>Hủy đơn</Text>
                </TouchableOpacity>
            )}

            {/* Hiện nút mua lại nếu đơn đã xong hoặc đã hủy */}
            {(s.includes("completed") || s.includes("cancel") || s.includes("success")) && (
                <TouchableOpacity style={styles.btnPrimary} onPress={() => handleReOrder(item.orderItems)}>
                    <Text style={styles.btnPrimaryText}>Mua lại</Text>
                </TouchableOpacity>
            )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Feather name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* THANH TAB CUỘN NGANG KIỂU SHOPEE */}
      <View style={styles.tabWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            {ORDER_TABS.map((tab) => (
                <TouchableOpacity 
                    key={tab.id}
                    style={[styles.tab, activeTab === tab.id && styles.activeTab]} 
                    onPress={() => setActiveTab(tab.id)}
                >
                    <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
          </ScrollView>
      </View>

      {loading ? (
          <ActivityIndicator size="large" color="#FF7A00" style={{marginTop: 50}} />
      ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderItem}
            keyExtractor={(item) => item.orderId.toString()}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
                <View style={{alignItems: 'center', marginTop: 80}}>
                    <Ionicons name="receipt-outline" size={60} color="#ddd" />
                    <Text style={{color: '#999', marginTop: 10}}>Không có đơn hàng nào</Text>
                </View>
            }
          />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" }, 
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: "#fff" },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#181C2E" },
  
  // Tab Styles
  tabWrapper: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  tabScroll: { paddingHorizontal: 15 },
  tab: { paddingVertical: 15, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: "transparent" },
  activeTab: { borderBottomColor: "#FF7A00" },
  tabText: { fontSize: 14, color: "#A0A5BA", fontWeight: "600" },
  activeTabText: { color: "#FF7A00" },

  list: { padding: 15 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: "row", marginBottom: 15 },
  img: { width: 75, height: 75, borderRadius: 12, backgroundColor: "#f5f5f5" },
  info: { flex: 1, marginLeft: 15, justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "bold", color: "#181C2E" },
  id: { color: "#A0A5BA", fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  price: { fontSize: 15, fontWeight: "bold", color: "#FF7A00" },
  items: { color: "#A0A5BA", fontSize: 13 },
  status: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#F5F5F5", marginBottom: 12 },
  btnRow: { flexDirection: "row", gap: 10, justifyContent: 'flex-end' },
  btnPrimary: { backgroundColor: "#FF7A00", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18 },
  btnPrimaryText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  btnOutline: { backgroundColor: "#fff", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18, borderWidth: 1, borderColor: "#E8E8E8" },
  btnOutlineText: { color: "#666", fontWeight: "bold", fontSize: 13 },
  btnCancel: { backgroundColor: "#FFF1F0", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18, borderWidth: 1, borderColor: "#FFCCC7" },
  btnCancelText: { color: "#FF4D4F", fontWeight: "bold", fontSize: 13 },
});