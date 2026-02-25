import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
// MotiView đã được thay thế bằng View thường

import { GET_USER_ORDERS, getProductImageUrl } from "../../APIService";
import HeaderCartButton from "../components/cart/HeaderCartButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Promo notifications (giả lập)
const promoNotifications = [
  {
    id: "promo1",
    type: "promo",
    title: "🔥 Flash Sale bắt đầu!",
    message: "Giảm đến 30% cho tất cả món Pizza. Đặt ngay!",
    time: "2 giờ trước",
    icon: "flash",
    color: "#FF3B30",
    read: false,
  },
  {
    id: "promo2",
    type: "voucher",
    title: "🎁 Voucher mới dành cho bạn",
    message: "Giảm 20.000đ cho đơn hàng từ 100.000đ",
    time: "5 giờ trước",
    icon: "gift",
    color: "#6C5DD3",
    read: false,
  },
  {
    id: "promo3",
    type: "system",
    title: "Cập nhật ứng dụng",
    message: "Phiên bản mới 2.0 đã sẵn sàng với nhiều tính năng hấp dẫn",
    time: "1 ngày trước",
    icon: "sparkles",
    color: "#FF7622",
    read: true,
  },
];

// Map order status to notification
const getOrderNotification = (order: any) => {
  const statusMap: any = {
    // Status tiếng Anh từ API
    "Delivered": { title: "Đơn hàng đã giao thành công", icon: "checkmark-done-circle-outline", color: "#4CAF50" },
    "Order Accepted!": { title: "Đơn hàng đã được xác nhận", icon: "checkmark-circle-outline", color: "#4CAF50" },
    "Order Placed": { title: "Đơn hàng đang chờ xác nhận", icon: "time-outline", color: "#FFB800" },
    "Shipping": { title: "Đơn hàng đang được giao", icon: "bicycle-outline", color: "#2196F3" },
    "Cancelled": { title: "Đơn hàng đã bị hủy", icon: "close-circle-outline", color: "#FF3B30" },
    // Status uppercase backup
    PENDING: { title: "Đơn hàng đang chờ xác nhận", icon: "time-outline", color: "#FFB800" },
    CONFIRMED: { title: "Đơn hàng đã được xác nhận", icon: "checkmark-circle-outline", color: "#4CAF50" },
    SHIPPING: { title: "Đơn hàng đang được giao", icon: "bicycle-outline", color: "#2196F3" },
    COMPLETED: { title: "Đơn hàng đã giao thành công", icon: "checkmark-done-circle-outline", color: "#4CAF50" },
    CANCELLED: { title: "Đơn hàng đã bị hủy", icon: "close-circle-outline", color: "#FF3B30" },
  };
  
  // Debug log để xem API trả về gì
  console.log("📦 Order status:", order.orderStatus, "| Order:", order);
  
  // Normalize status (uppercase để so sánh)
  const rawStatus = order.orderStatus || order.status || "PENDING";
  const normalizedStatus = rawStatus.toUpperCase();
  
  // Tìm status phù hợp
  const status = statusMap[rawStatus] || statusMap[normalizedStatus] || statusMap.PENDING;
  const firstProduct = order.orderItems?.[0];
  
  return {
    id: `order-${order.orderId}`,
    type: "order",
    orderId: order.orderId,
    title: status.title,
    message: `Đơn #${order.orderId} - ${order.totalAmount?.toLocaleString("vi-VN")}đ`,
    time: formatTime(order.orderDate),
    icon: status.icon,
    color: status.color,
    image: firstProduct?.product?.image ? getProductImageUrl(firstProduct.product.image) : null,
    status: rawStatus,
    read: rawStatus === "Delivered" || rawStatus === "Cancelled" || normalizedStatus === "COMPLETED" || normalizedStatus === "CANCELLED",
  };
};

const formatTime = (dateString: string) => {
  if (!dateString) return "Vừa xong";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};

export default function Notifications() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"all" | "orders" | "promos">("all");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [orderNotifications, setOrderNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const email = await AsyncStorage.getItem("saved-email");
      if (email) {
        const response = await GET_USER_ORDERS(email);
        const orders = response.data?.content || response.data || [];
        
        // Chuyển đổi orders thành notifications
        const orderNotifs = orders.slice(0, 10).map((order: any) => getOrderNotification(order));
        setOrderNotifications(orderNotifs);
        
        // Kết hợp với promo notifications
        const allNotifs = [...orderNotifs, ...promoNotifications].sort((a, b) => {
          // Ưu tiên chưa đọc lên đầu
          if (a.read !== b.read) return a.read ? 1 : -1;
          return 0;
        });
        setNotifications(allNotifs);
      } else {
        setNotifications(promoNotifications);
      }

      // Animate in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications(promoNotifications);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchNotifications();
  };

  const handleNotificationPress = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.type === "order") {
      router.push("/components/order/order");
    } else if (item.type === "promo" || item.type === "voucher") {
      router.push("/(home)/add");
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "orders":
        return notifications.filter(n => n.type === "order");
      case "promos":
        return notifications.filter(n => n.type !== "order");
      default:
        return notifications;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotificationItem = (item: any, index: number) => (
    <View
      key={item.id}
    >
      <TouchableOpacity
        style={[styles.notificationCard, !item.read && styles.unreadCard]}
        activeOpacity={0.8}
        onPress={() => handleNotificationPress(item)}
      >
        {/* Icon/Image */}
        <View style={[styles.iconWrapper, { backgroundColor: item.color + "20" }]}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.productImage} />
          ) : (
            <Ionicons name={item.icon} size={24} color={item.color} />
          )}
        </View>

        {/* Content */}
        <View style={styles.contentWrapper}>
          <View style={styles.titleRow}>
            <Text style={[styles.notifTitle, !item.read && styles.unreadTitle]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>

        {/* Arrow */}
        <Ionicons name="chevron-forward" size={18} color="#A0A5BA" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <HeaderCartButton />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>
            Tất cả
          </Text>
          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "orders" && styles.activeTab]}
          onPress={() => setActiveTab("orders")}
        >
          <Text style={[styles.tabText, activeTab === "orders" && styles.activeTabText]}>
            Đơn hàng
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "promos" && styles.activeTab]}
          onPress={() => setActiveTab("promos")}
        >
          <Text style={[styles.tabText, activeTab === "promos" && styles.activeTabText]}>
            Ưu đãi
          </Text>
        </TouchableOpacity>
      </View>

      {/* Promo Banner */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => router.push("/(home)/add")}>
        <LinearGradient
          colors={["#FF7622", "#FF9A5A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.promoBanner}
        >
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>🎉 Ưu đãi hôm nay</Text>
            <Text style={styles.promoSubtitle}>Giảm 30% cho đơn đầu tiên</Text>
          </View>
          <MaterialCommunityIcons name="party-popper" size={40} color="rgba(255,255,255,0.3)" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Notifications List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7622" />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <View style={styles.skeletonIcon} />
                <View style={styles.skeletonContent}>
                  <View style={styles.skeletonTitle} />
                  <View style={styles.skeletonMessage} />
                </View>
              </View>
            ))}
          </View>
        ) : getFilteredNotifications().length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {getFilteredNotifications().map((item, index) => renderNotificationItem(item, index))}
          </Animated.View>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181C2E",
  },
  settingsBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 25,
    backgroundColor: "#FFF",
  },
  activeTab: {
    backgroundColor: "#FF7622",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B6E82",
  },
  activeTabText: {
    color: "#FFF",
  },
  countBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  countText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },

  // Promo Banner
  promoBanner: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  promoContent: {},
  promoTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  promoSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 4,
  },

  // List
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Notification Card
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF7622",
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 14,
  },
  contentWrapper: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#181C2E",
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF7622",
    marginLeft: 8,
  },
  notifMessage: {
    fontSize: 13,
    color: "#6B6E82",
    marginTop: 4,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: "#A0A5BA",
    marginTop: 4,
  },

  // Loading
  loadingContainer: {},
  skeletonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  skeletonIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#D8D8D8",
    marginRight: 12,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonTitle: {
    width: "60%",
    height: 14,
    borderRadius: 7,
    backgroundColor: "#D8D8D8",
    marginBottom: 8,
  },
  skeletonMessage: {
    width: "80%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D8D8D8",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 15,
    color: "#A0A5BA",
  },
});
