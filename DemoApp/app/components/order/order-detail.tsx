import React, { useState, useEffect, useCallback } from "react";
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Alert, ActivityIndicator, RefreshControl, Modal, TextInput
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Linking from 'expo-linking';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from 'expo-haptics';

// Import API
import { 
    getProductImageUrl, 
    PUT_CANCEL_ORDER, 
    callApi 
} from "../../../APIService";

// --- API FUNCTIONS ---
const POST_REPAY_ORDER = (email: string, orderId: number, paymentMethod: string, redirectUrl: string) => {
    const encodedUrl = encodeURIComponent(redirectUrl);
    return callApi(`public/users/${email}/orders/${orderId}/repay/${paymentMethod}?redirectUrl=${encodedUrl}`, "POST");
}

const PUT_UPDATE_PAYMENT_STATUS = (email: string, orderId: number) => {
    return callApi(`public/users/${email}/orders/${orderId}/payment-completed`, "PUT");
}

const GET_ORDER_DETAIL = (email: string, orderId: number) => {
    return callApi(`public/users/${email}/orders/${orderId}`, "GET");
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse dữ liệu an toàn
  let initialOrder = null;
  try {
      if (params.orderData) {
          initialOrder = JSON.parse(params.orderData as string);
      }
  } catch (e) {
      console.log("Parse error:", e);
  }

  const [order, setOrder] = useState<any>(initialOrder);
  const [loading, setLoading] = useState(false); 
  const [processingPayment, setProcessingPayment] = useState(false); 
  const [refreshing, setRefreshing] = useState(false);
  
  // ⭐ Rating Modal State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [shipperRating, setShipperRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  // 🔥 HÀM QUAN TRỌNG NHẤT: XỬ LÝ HIỂN THỊ ĐỊA CHỈ 🔥
  // Hàm này sẽ biến Object {street, city...} thành chuỗi "123 Đường A, HCM"
  const formatAddress = (orderData: any) => {
    if (!orderData) return "Đang tải...";

    const addr = orderData.address;

    // TRƯỜNG HỢP 1: Address là Object (Backend mới) - Đây là cái gây lỗi của bạn
    if (addr && typeof addr === 'object') {
        const parts = [
            addr.buildingName, 
            addr.street,       
            addr.ward,         
            addr.district,     
            addr.city,         
            addr.state,
            addr.country
        ].filter(p => p && String(p).trim() !== ''); // Lọc bỏ giá trị rỗng/null

        if (parts.length > 0) return parts.join(", ");
    }

    // TRƯỜNG HỢP 2: Address là chuỗi String (Backend cũ hoặc fallback)
    if (typeof addr === 'string' && addr.trim() !== '') {
        return addr;
    }

    // TRƯỜNG HỢP 3: Fallback sang shippingAddress nếu address chính bị null
    if (typeof orderData.shippingAddress === 'string' && orderData.shippingAddress.trim() !== '') {
        return orderData.shippingAddress;
    }

    return "Địa chỉ không tồn tại hoặc đã bị xóa";
  };

  // --- FETCH LATEST ORDER ---
  const fetchLatestOrder = async () => {
      try {
          const email = await AsyncStorage.getItem("saved-email");
          const targetOrderId = order?.orderId || initialOrder?.orderId;
          
          if (email && targetOrderId) {
              console.log(">> Fetching latest order data for ID:", targetOrderId);
              const res = await GET_ORDER_DETAIL(email, targetOrderId);
              if (res.data) {
                  setOrder(res.data);
              }
          }
      } catch (error) {
          console.log("Error fetching order:", error);
      }
  };

  useEffect(() => {
      fetchLatestOrder();
  }, []);

  const onRefresh = useCallback(async () => {
      setRefreshing(true);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await fetchLatestOrder();
      setRefreshing(false);
  }, [order?.orderId]);

  // --- PAYMENT SUCCESS HANDLER ---
  const handlePaymentSuccess = async () => {
      if (processingPayment) return;
      setProcessingPayment(true);

      try {
          const email = await AsyncStorage.getItem("saved-email");
          const pendingId = await AsyncStorage.getItem("PENDING_ORDER_ID");
          const currentOrderId = order?.orderId || initialOrder?.orderId;

          if (String(pendingId) === String(currentOrderId) && email) {
              await PUT_UPDATE_PAYMENT_STATUS(email, Number(currentOrderId));
              await new Promise(resolve => setTimeout(resolve, 800));
              await fetchLatestOrder();

              if (Platform.OS !== 'web') {
                  Alert.alert("Thành công", "Đơn hàng đã được thanh toán!");
              }
          }
      } catch (e) {
          console.log("Error handling payment success:", e);
      } finally {
          await AsyncStorage.removeItem("PENDING_ORDER_ID");
          setProcessingPayment(false);
          if (Platform.OS === 'web' && window.history.replaceState) {
              window.history.replaceState({}, '', window.location.pathname);
          }
      }
  };

  // --- WEB HANDLER ---
  useEffect(() => {
      if (Platform.OS === 'web') {
          const rawResultCode = Array.isArray(params.resultCode) ? params.resultCode[0] : params.resultCode;
          const resultCode = rawResultCode ? String(rawResultCode) : null;
          if (resultCode === '0') {
              handlePaymentSuccess();
          } else if (resultCode && resultCode !== '0') {
              alert("Giao dịch không thành công hoặc đã bị hủy.");
              AsyncStorage.removeItem("PENDING_ORDER_ID");
          }
      }
  }, [params.resultCode]);

  // --- APP HANDLER (Deep Linking) ---
  useEffect(() => {
      if (Platform.OS !== 'web') {
          const handleDeepLink = (event: { url: string }) => {
              if (!event.url) return;
              let { queryParams } = Linking.parse(event.url);
              const resParams = (queryParams || {}) as Record<string, any>;
              if (String(resParams.resultCode) === '0') {
                  handlePaymentSuccess();
              }
          };
          const sub = Linking.addEventListener('url', handleDeepLink);
          return () => sub.remove();
      }
  }, []);

  const handleBack = () => {
      if (router.canGoBack()) {
          router.back();
      } else {
          router.replace('/'); 
      }
  };

  if (!order) {
      return (
          <View style={styles.container}>
              <ActivityIndicator size="large" color="#FF7A00" style={{marginTop: 50}} />
              <Text style={{textAlign: 'center', marginTop: 10}}>Đang tải đơn hàng...</Text>
          </View>
      );
  }

  if (processingPayment) {
      return (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color="#FF7A00" />
              <Text style={{ marginTop: 20, fontSize: 16, fontWeight: 'bold' }}>Đang xác nhận thanh toán...</Text>
          </View>
      );
  }

  const handlePayNow = async () => {
      try {
          setLoading(true);
          const email = await AsyncStorage.getItem("saved-email");
          if (!email) { Alert.alert("Lỗi", "Vui lòng đăng nhập lại."); return; }

          await AsyncStorage.setItem("PENDING_ORDER_ID", String(order.orderId));
          const currentUrl = Platform.OS === 'web' ? window.location.origin + window.location.pathname : Linking.createURL('');
          const cleanUrl = currentUrl.split('?')[0]; 

          const response = await POST_REPAY_ORDER(email, order.orderId, "MOMO_WALLET", cleanUrl);
          const payUrl = response.data?.paymentUrl;

          if (payUrl) {
              if (Platform.OS === 'web') window.location.href = payUrl; 
              else await Linking.openURL(payUrl);
          }
      } catch (error: any) {
          Alert.alert("Lỗi", "Không thể thanh toán lúc này");
      } finally {
          setLoading(false);
      }
  };

  const executeCancel = async () => {
      try {
          setLoading(true);
          const email = await AsyncStorage.getItem("saved-email");
          if (!email) return;
          await PUT_CANCEL_ORDER(email, order.orderId);
          Alert.alert("Thành công", "Đã hủy đơn hàng.");
          await fetchLatestOrder();
      } catch (error) {
          Alert.alert("Lỗi", "Không thể hủy đơn hàng.");
      } finally {
          setLoading(false);
      }
  };

  const handleCancelOrder = () => {
      if (Platform.OS === 'web') {
          if (confirm("Xác nhận hủy đơn hàng này?")) executeCancel();
      } else {
          Alert.alert("Xác nhận", "Hủy đơn hàng?", [
              { text: "Không", style: "cancel" },
              { text: "Hủy đơn", style: "destructive", onPress: executeCancel }
          ]);
      }
  };

  const s = (order.orderStatus || "").toLowerCase();
  const isUnpaid = s === 'pending payment'; 
  const isCOD = s === 'pending confirmation';
  const isProcessing = s.includes('accepted') || s.includes('success') || s.includes('paid');
  const isCancelled = s.includes('cancel');

  const getStatusDisplay = () => {
      if (isCOD) return { label: 'Chờ xác nhận (COD)', color: '#FF9800', bg: '#FFF3E0', icon: 'timer-sand' };
      if (isUnpaid) return { label: 'Chờ thanh toán', color: '#FF3D00', bg: '#FFEBEE', icon: 'credit-card-clock' };
      if (isProcessing) return { label: 'Đã thanh toán', color: '#4CAF50', bg: '#E8F5E9', icon: 'check-circle' };
      if (s.includes('shipping')) return { label: 'Đang giao hàng', color: '#2196F3', bg: '#E3F2FD', icon: 'truck-delivery' };
      if (isCancelled) return { label: 'Đã hủy', color: '#F44336', bg: '#FFEBEE', icon: 'close-circle' };
      return { label: order.orderStatus, color: '#757575', bg: '#F5F5F5', icon: 'information' };
  };

  const statusInfo = getStatusDisplay();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng #{order.orderId}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={["#FF7A00"]} 
            tintColor="#FF7A00"
          />
        }
      >
        {/* TRẠNG THÁI */}
        <View style={[styles.section, { backgroundColor: statusInfo.bg, borderColor: statusInfo.bg }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name={statusInfo.icon as any} size={24} color={statusInfo.color} />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
            </View>
            <Text style={{ color: statusInfo.color, marginTop: 8, fontSize: 13, marginLeft: 32 }}>
                {isUnpaid ? 'Vui lòng thanh toán để xác nhận đơn hàng.' : 'Thông tin chi tiết đơn hàng.'}
            </Text>
        </View>

        {/* THÔNG TIN NGƯỜI NHẬN */}
        <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="person-circle" size={20} color="#FF7A00" />
                <Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: 8 }]}>Thông tin người nhận</Text>
            </View>
            <View style={styles.addressBox}>
                {/* Tên người nhận */}
                <View style={styles.infoRow}>
                    <Ionicons name="person" size={16} color="#666" />
                    <Text style={styles.addressName}>
                        {order.fullName || order.name || (order.user ? `${order.user.firstName} ${order.user.lastName}` : "Người nhận")}
                    </Text>
                </View>
                
                {/* Số điện thoại */}
                <View style={styles.infoRow}>
                    <Ionicons name="call" size={16} color="#666" />
                    <Text style={styles.addressPhone}>
                        {order.phone || order.phoneNumber || order.mobileNumber || "Chưa cập nhật SĐT"}
                    </Text>
                </View>
                
                {/* Email */}
                <View style={styles.infoRow}>
                    <Ionicons name="mail" size={16} color="#666" />
                    <Text style={styles.addressPhone}>
                        {order.email || "Chưa có email"}
                    </Text>
                </View>
                
                {/* Địa chỉ giao hàng */}
                <View style={[styles.infoRow, { alignItems: 'flex-start', marginTop: 8 }]}>
                    <Ionicons name="location-sharp" size={16} color="#FF7A00" style={{ marginTop: 2 }} />
                    <Text style={styles.addressText}>
                        {formatAddress(order)}
                    </Text>
                </View>
            </View>
        </View>

        {/* THANH TOÁN */}
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thanh toán</Text>
            <View style={styles.row}>
                <Text style={styles.label}>Phương thức:</Text>
                <Text style={styles.value}>{order.payment?.paymentMethod === 'MOMO_WALLET' ? 'Ví MoMo' : 'Tiền mặt'}</Text>
            </View>
        </View>

        {/* SẢN PHẨM */}
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Sản phẩm ({order.orderItems?.length || 0})</Text>
            {order.orderItems?.map((item: any, index: number) => (
                <View key={index} style={styles.productItem}>
                    <Image source={{ uri: getProductImageUrl(item.product?.image) }} style={styles.prodImg} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.prodName}>{item.product?.productName}</Text>
                        <Text style={styles.prodQty}>x{item.quantity}</Text>
                        <Text style={styles.prodPrice}>{Number(item.orderedProductPrice).toLocaleString('vi-VN')} đ</Text>
                    </View>
                </View>
            ))}
        </View>

        {/* TỔNG TIỀN */}
        <View style={styles.card}>
            <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                <Text style={styles.totalValue}>{Number(order.totalAmount).toLocaleString('vi-VN')} đ</Text>
            </View>
        </View>
      </ScrollView>

      {/* FOOTER ACTIONS */}
      {!isCancelled && !isProcessing && (
          <View style={styles.footer}>
              {loading ? <ActivityIndicator color="#FF7A00" /> : (
                  <View style={{flexDirection: 'row', gap: 10, justifyContent: 'flex-end'}}>
                      <TouchableOpacity style={styles.btnOutline} onPress={handleCancelOrder}>
                          <Text style={styles.btnOutlineText}>Hủy đơn</Text>
                      </TouchableOpacity>
                      {isUnpaid && (
                          <TouchableOpacity style={styles.btnPrimary} onPress={handlePayNow}>
                              <Text style={styles.btnPrimaryText}>Thanh toán ngay</Text>
                          </TouchableOpacity>
                      )}
                  </View>
              )}
          </View>
      )}

      {/* ⭐ Nút đánh giá cho đơn đã giao */}
      {(s.includes('delivered') || s.includes('completed')) && !hasRated && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.btnPrimary, { flex: 1 }]} 
            onPress={() => setShowRatingModal(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="star" size={18} color="#FFF" />
              <Text style={styles.btnPrimaryText}>Đánh giá đơn hàng</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* ⭐ RATING MODAL */}
      <Modal
        visible={showRatingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đánh giá đơn hàng</Text>
              <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Đánh giá Shipper */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>🚚 Người giao hàng</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setShipperRating(star)}>
                    <Ionicons 
                      name={star <= shipperRating ? "star" : "star-outline"} 
                      size={36} 
                      color={star <= shipperRating ? "#FFB800" : "#DDD"} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Đánh giá Món ăn */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>🍕 Chất lượng món ăn</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setFoodRating(star)}>
                    <Ionicons 
                      name={star <= foodRating ? "star" : "star-outline"} 
                      size={36} 
                      color={star <= foodRating ? "#FFB800" : "#DDD"} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Nhận xét */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>💬 Nhận xét</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                value={ratingComment}
                onChangeText={setRatingComment}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitRatingBtn, submittingRating && { opacity: 0.7 }]}
              disabled={submittingRating}
            onPress={async () => {
                setSubmittingRating(true);
                try {
                    const email = await AsyncStorage.getItem("saved-email");
                    if (!email || !order.orderItems || order.orderItems.length === 0) return;
                    
                    // Lấy sản phẩm đầu tiên của đơn hàng để review (đặc trưng cho đơn hàng này)
                    const firstProduct = order.orderItems[0].product;
                    const productId = firstProduct.productId;

                    const reviewData = {
                        rating: foodRating,
                        comment: ratingComment || "Đánh giá tuyệt vời!",
                        orderId: order.orderId
                    };

                    // Gọi API add review thật
                    await callApi(`public/users/${email}/products/${productId}/reviews`, "POST", reviewData);

                    setSubmittingRating(false);
                    setShowRatingModal(false);
                    setHasRated(true);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert("Cảm ơn!", "Đánh giá của bạn đã được ghi nhận. Bạn đã nhận được +50 điểm thưởng! 🎁");
                } catch (error) {
                    console.error("Lỗi gửi đánh giá:", error);
                    setSubmittingRating(false);
                    Alert.alert("Lỗi", "Không thể gửi đánh giá lúc này. Vui lòng thử lại sau.");
                }
            }}
            >
              {submittingRating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitRatingText}>Gửi đánh giá</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15, backgroundColor: "#fff" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  section: { padding: 16, borderRadius: 12, marginBottom: 12, marginHorizontal: 16, marginTop: 16, borderWidth: 1 },
  statusText: { fontSize: 16, fontWeight: "bold", marginLeft: 8 },
  card: { backgroundColor: "#fff", padding: 16, marginHorizontal: 16, marginBottom: 16, borderRadius: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  sectionTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 12, color: "#333" },
  addressBox: { paddingLeft: 0 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  addressName: { fontSize: 15, fontWeight: "bold", color: "#333", marginBottom: 2 },
  addressPhone: { fontSize: 14, color: "#666", marginBottom: 4 },
  addressText: { fontSize: 14, color: "#444", lineHeight: 20 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 14, color: "#666" },
  value: { fontSize: 14, color: "#333", fontWeight: "500" },
  productItem: { flexDirection: "row", marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0", paddingBottom: 12 },
  prodImg: { width: 60, height: 60, borderRadius: 8, backgroundColor: "#eee" },
  prodName: { fontSize: 14, fontWeight: "600", color: "#333" },
  prodQty: { fontSize: 13, color: "#888" },
  prodPrice: { fontSize: 14, color: "#FF7A00", fontWeight: "bold" },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#FF7A00" },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  btnPrimary: { backgroundColor: '#FF7A00', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20 },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold' },
  btnOutline: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20, borderWidth: 1, borderColor: '#FF3D00' },
  btnOutlineText: { color: '#FF3D00', fontWeight: 'bold' },
  
  // ⭐ Rating Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  commentInput: {
    backgroundColor: '#F5F5FA',
    borderRadius: 12,
    padding: 16,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  submitRatingBtn: {
    backgroundColor: '#FF7A00',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FF7A00',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitRatingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});