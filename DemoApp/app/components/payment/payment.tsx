import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput // 🎟️ Voucher input
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from 'expo-linking';

// Import thư viện hiệu ứng
import * as Haptics from "expo-haptics";
// MotiView đã được thay thế bằng View thường

// Import API
// 🔥 POST_PLACE_ORDER nhận 4 tham số: email, cartId, addressId, paymentMethod
import { POST_PLACE_ORDER, GET_USER_BY_EMAIL, callApi } from "../../../APIService"; 
import { useCart } from "../../components/cart/CartContext";

// --- ĐỊNH NGHĨA API MỚI ---
const POST_PAYMENT_SUCCESS = (email: string, cartId: number) => {
    return callApi(`public/users/${email}/carts/${cartId}/payment-success`, "POST");
}

const POST_REPAY_ORDER = (email: string, orderId: number, paymentMethod: string) => {
    return callApi(`public/users/${email}/orders/${orderId}/repay/${paymentMethod}`, "POST");
}

const PUT_UPDATE_PAYMENT_STATUS = (email: string, orderId: number) => {
    return callApi(`public/users/${email}/orders/${orderId}/payment-completed`, "PUT");
}

// --- HÀM TÍNH PHÍ SHIP TỰ ĐỘNG THEO ĐỊA CHỈ ---
const getShippingFeeByAddress = (addressString: string): number => {
    if (!addressString || addressString === "Đang tải địa chỉ...") return 30000;
    const addr = addressString.toLowerCase();
    
    // Quy tắc: Nội thành (HCM, Hà Nội, Đà Nẵng) -> 15k
    if (addr.includes("hồ chí minh") || addr.includes("hà nội") || addr.includes("đà nẵng") || addr.includes("hcm")) {
        return 15000;
    } 
    // Các tỉnh lân cận -> 25k
    else if (addr.includes("bình dương") || addr.includes("đồng nai") || addr.includes("long an") || addr.includes("vũng tàu")) {
        return 25000;
    }
    // Tỉnh xa khác -> 35k
    return 35000;
};

// --- CẤU HÌNH MÀU SẮC ---
const COLORS = {
  bg: "#101010",        
  cardBg: "#1C1C1E",    
  primary: "#FF7A00",   
  text: "#FFFFFF",
  subText: "#8E8E93",
  border: "#2C2C2E"
};

const SkeletonItem = ({ width, height, style }: any) => (
  <View
    style={[{ 
        width: width, height: height, 
        backgroundColor: '#2C2C2E', borderRadius: 6 
    }, style]}
  />
);

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { fetchCart, state } = useCart(); 

  // ==========================================
  // 1. NHẬN PARAMS VÀ KHỞI TẠO STATE
  // ==========================================
  const rawCartId = params.cartId;
  const cartId = String(rawCartId); 

  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true); 
  const [paymentMethod, setPaymentMethod] = useState("MOMO_WALLET");
  const [email, setEmail] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  
  // 🎟️ Voucher/Mã giảm giá
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  // 🕒 Đặt hàng theo lịch
  const [deliveryMode, setDeliveryMode] = useState("ASAP"); // ASAP or SCHEDULED
  const [scheduledTime, setScheduledTime] = useState("");
  const timeSlots = ["10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00"];
  // 🔥 FIX CỐT LÕI: Ưu tiên params.fullAddress ngay khi khởi tạo
  const [deliveryInfo, setDeliveryInfo] = useState({
      name: "Đang tải...",
      phone: "...",
      address: params.fullAddress ? String(params.fullAddress) : "Đang tải địa chỉ..."
  });
  
  // 🔥 FIX PHÍ SHIP: Tính toán dựa trên địa chỉ hiện có
  const [shippingFee, setShippingFee] = useState(getShippingFeeByAddress(deliveryInfo.address));

  const rawTotal = params.totalAmount as string || "0";
  const subTotal = parseInt(rawTotal, 10);
  
  // Tổng thanh toán = Tiền hàng + Phí ship - Giảm giá
  const totalPayment = cartId === "-1" ? subTotal : Math.max(0, subTotal + shippingFee - discount);

  const selectedProductIds = params.selectedProductIds 
    ? JSON.parse(params.selectedProductIds as string) 
    : [];

  const selectedItems = state.items.filter(item => 
    selectedProductIds.includes(Number(item.id))
  );

  // 🔥 EFFECT 1: LOAD PROFILE (TÊN & SĐT) - KHÔNG ĐƯỢC ĐÈ ĐỊA CHỈ NẾU CÓ PARAMS
  useEffect(() => {
    const initUserData = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("saved-email");
        if (savedEmail) {
          setEmail(savedEmail);
          const userRes = await GET_USER_BY_EMAIL(savedEmail);
          
          if (userRes && userRes.data) {
             const userData = userRes.data;
             const finalPhone = userData.mobileNumber || userData.phoneNumber || "Chưa có SĐT";
             const finalName = (userData.firstName && userData.lastName) 
                                ? `${userData.firstName} ${userData.lastName}`
                                : (userData.fullName || userData.username || "Khách hàng");

             // 🔥 CHỈ CẬP NHẬT ĐỊA CHỈ NẾU params.fullAddress TRỐNG
             let addressToSet = deliveryInfo.address;
             if (!params.fullAddress) {
                const addr = userData.address;
                if (addr) {
                    if (typeof addr === 'string') addressToSet = addr;
                    else if (typeof addr === 'object') {
                        const parts = [addr.buildingName, addr.street, addr.city].filter(p => p);
                        if (parts.length > 0) addressToSet = parts.join(", ");
                    }
                }
             }

             setDeliveryInfo({
                 name: finalName,
                 phone: finalPhone,
                 address: addressToSet 
             });
             
             // Nếu lấy địa chỉ profile thì phải tính lại ship
             if (!params.fullAddress) {
                setShippingFee(getShippingFeeByAddress(addressToSet));
             }
          }
        }
      } catch (error) {
        console.log("Lỗi tải thông tin user:", error);
      } finally {
        setIsFetching(false);
      }
    };

    initUserData();
  }, []);

  // 🔥 EFFECT 2: LẮNG NGHE ĐỊA CHỈ MỚI KHI QUAY LẠI TỪ ADDRESS_SCREEN
  useEffect(() => {
    if (params.fullAddress) {
        const newAddr = String(params.fullAddress);
        setDeliveryInfo(prev => ({ ...prev, address: newAddr }));
        setShippingFee(getShippingFeeByAddress(newAddr));
    }
  }, [params.fullAddress]);

  // 🔥 LOGIC DEEP LINK MOMO
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      let { queryParams } = Linking.parse(event.url);
      const resParams = (queryParams || {}) as Record<string, any>;
      const pendingOrderId = await AsyncStorage.getItem("PENDING_ORDER_ID");
      const currentEmail = await AsyncStorage.getItem("saved-email"); 

      if (resParams.resultCode === '0' || resParams.resultCode === 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          try {
              // 🔥 Backend đã xóa sản phẩm được chọn - chỉ cần refresh giỏ hàng
              if (currentEmail) {
                  await fetchCart(currentEmail);
              }
              await AsyncStorage.removeItem("PENDING_ORDER_ID");
              router.replace("/components/payment/order-success"); 
          } catch (e) {
              router.replace("/components/payment/order-success"); 
          }
      } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert("Thanh toán thất bại", "Giao dịch đã bị hủy.");
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  const handleConfirmPayment = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 

    if (cartId !== "-1" && selectedItems.length === 0) {
        Alert.alert("Giỏ hàng rỗng", "Vui lòng chọn sản phẩm.");
        return;
    }

    // 🔥 Dùng addressId từ params (vừa chọn) hoặc mặc định
    const finalAddressId = params.addressId; 
    if (cartId !== "-1" && !finalAddressId) {
        Alert.alert("Thông báo", "Vui lòng chọn địa chỉ giao hàng.");
        return;
    }

    try {
      setLoading(true);
      let response;

      if (cartId === "-1") {
          const existingOrderId = params.existingOrderId; 
          response = await POST_REPAY_ORDER(email, Number(existingOrderId), paymentMethod);
      } else {
          // 🔥 GỌI API VỚI OrderRequest - Gửi Voucher & Scheduled Time
          const orderRequest = {
            selectedProductIds: selectedProductIds,
            voucherCode: discount > 0 ? voucherCode : null,
            scheduledTime: deliveryMode === 'SCHEDULED' ? scheduledTime : "ASAP"
          };

          response = await POST_PLACE_ORDER(
              email, 
              Number(cartId), 
              Number(finalAddressId), 
              paymentMethod,
              orderRequest
          );
          
          if (response.data && response.data.orderId) {
              await AsyncStorage.setItem("PENDING_ORDER_ID", String(response.data.orderId)); 
          }
      }

      if (paymentMethod === "MOMO_WALLET") {
          const payUrl = response.data?.paymentUrl; 
          if (payUrl) Linking.openURL(payUrl);
      } else {
          // 🔥 COD: Backend đã xóa SP được chọn - chỉ cần refresh giỏ hàng
          if (email) {
              await fetchCart(email); 
          }
          router.replace("/components/payment/order-success");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const PaymentCard = ({ id, icon, title, sub }: any) => {
    const isSelected = paymentMethod === id;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setPaymentMethod(id)}
        style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}
      >
        <View style={styles.cardLeft}>
            <View style={[styles.iconContainer, isSelected && {backgroundColor: '#FFF'}]}>
                <MaterialCommunityIcons name={icon} size={24} color={isSelected ? COLORS.primary : "#FFF"} />
            </View>
            <View style={{marginLeft: 12}}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardSub}>{sub}</Text>
            </View>
        </View>
        <View style={styles.radioOuter}>{isSelected && <View style={styles.radioInner} />}</View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh Toán</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={styles.sectionLabel}>Địa chỉ nhận hàng</Text>
        <View style={styles.addressContainer}>
            {isFetching ? (
                <SkeletonItem width="100%" height={60} />
            ) : (
                <View>
                    <View style={styles.addressRow}>
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <Ionicons name="location" size={18} color={COLORS.primary} style={{marginRight:5}} />
                            <Text style={styles.addressName}>{deliveryInfo.name}</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push({
                            pathname: "/components/profile/address",
                            params: { 
                                mode: "select", 
                                cartId: cartId,
                                totalAmount: subTotal,
                                selectedProductIds: params.selectedProductIds,
                                addressId: params.addressId 
                            }
                        })}>
                            <Text style={styles.editBtn}>Thay đổi</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.addressDetail}>{deliveryInfo.address}</Text>
                    <Text style={styles.addressDetail}>{deliveryInfo.phone}</Text>
                </View>
            )}
        </View>

        {/* 🕒 Đặt hàng theo lịch */}
        <Text style={[styles.sectionLabel, { marginTop: 30 }]}>Thời gian giao hàng</Text>
        <View style={styles.scheduleContainer}>
            <View style={styles.scheduleTabs}>
                <TouchableOpacity 
                    style={[styles.scheduleTab, deliveryMode === 'ASAP' && styles.scheduleTabActive]}
                    onPress={() => setDeliveryMode('ASAP')}
                >
                    <Ionicons name="flash-outline" size={18} color={deliveryMode === 'ASAP' ? '#FFF' : '#666'} />
                    <Text style={[styles.scheduleTabText, deliveryMode === 'ASAP' && styles.scheduleTabTextActive]}>Giao ngay</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.scheduleTab, deliveryMode === 'SCHEDULED' && styles.scheduleTabActive]}
                    onPress={() => {
                        setDeliveryMode('SCHEDULED');
                        if (!scheduledTime) setScheduledTime(timeSlots[0]);
                    }}
                >
                    <Ionicons name="calendar-outline" size={18} color={deliveryMode === 'SCHEDULED' ? '#FFF' : '#666'} />
                    <Text style={[styles.scheduleTabText, deliveryMode === 'SCHEDULED' && styles.scheduleTabTextActive]}>Đặt lịch</Text>
                </TouchableOpacity>
            </View>

            {deliveryMode === 'SCHEDULED' && (
                <View style={styles.timeSlotsWrapper}>
                    <Text style={styles.timeSlotHint}>Chọn khung giờ giao hàng (hôm nay):</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeSlotsList}>
                        {timeSlots.map(slot => (
                            <TouchableOpacity 
                                key={slot} 
                                style={[styles.timeSlotItem, scheduledTime === slot && styles.timeSlotItemActive]}
                                onPress={() => setScheduledTime(slot)}
                            >
                                <Text style={[styles.timeSlotText, scheduledTime === slot && styles.timeSlotTextActive]}>{slot}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>

        <Text style={[styles.sectionLabel, {marginTop: 30}]}>Sản phẩm</Text>
        <View style={styles.productListContainer}>
            {cartId !== "-1" ? (
                selectedItems.map((item) => (
                    <View key={item.id} style={styles.productRow}>
                        <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.productThumb} />
                        <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.productQty}>Số lượng: {item.quantity}</Text>
                        </View>
                        <Text style={styles.productPrice}>{(item.price * item.quantity).toLocaleString("vi-VN")} đ</Text>
                    </View>
                ))
            ) : (
                <Text style={{color: COLORS.subText, textAlign: 'center', padding: 10}}>Thanh toán lại đơn cũ</Text>
            )}
        </View>

        {/* 🎟️ Mã giảm giá / Voucher */}
        {cartId !== "-1" && (
          <View style={styles.voucherSection}>
            <Text style={[styles.sectionLabel, {marginTop: 20, marginBottom: 10}]}>Mã giảm giá</Text>
            <View style={styles.voucherRow}>
              <TextInput
                style={styles.voucherInput}
                placeholder="Nhập mã giảm giá..."
                placeholderTextColor="#666"
                value={voucherCode}
                onChangeText={setVoucherCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity 
                style={[styles.voucherBtn, applyingVoucher && { opacity: 0.7 }]}
                disabled={applyingVoucher || !voucherCode.trim()}
                onPress={async () => {
                  setApplyingVoucher(true);
                  setVoucherMessage("");
                  try {
                    const code = voucherCode.toUpperCase().trim();
                    // Gọi API check voucher thật
                    const res = await callApi(`public/vouchers/check/${code}?amount=${subTotal}`, "GET");
                    
                    if (res.status === 200) {
                      const v = res.data;
                      let d = 0;
                      if (v.discountType === "PERCENTAGE") {
                        d = Math.floor(subTotal * (v.discountAmount / 100));
                      } else {
                        d = v.discountAmount;
                      }
                      
                      // Đặc biệt cho FREESHIP
                      if (code === "FREESHIP") {
                          d = shippingFee;
                      }

                      setDiscount(d);
                      setVoucherMessage(`✅ Áp dụng thành công (-${d.toLocaleString('vi-VN')}đ)`);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                  } catch (error: any) {
                    setDiscount(0);
                    const errorMsg = error.response?.data || "Mã không hợp lệ";
                    setVoucherMessage(`❌ ${errorMsg}`);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  } finally {
                    setApplyingVoucher(false);
                  }
                }}
              >
                {applyingVoucher ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.voucherBtnText}>Áp dụng</Text>
                )}
              </TouchableOpacity>
            </View>
            {voucherMessage ? (
              <Text style={[styles.voucherMessage, { color: discount > 0 ? '#4CAF50' : '#FF5252' }]}>
                {voucherMessage}
              </Text>
            ) : null}
          </View>
        )}

        <Text style={[styles.sectionLabel, {marginTop: 30}]}>Phương thức thanh toán</Text>
        <PaymentCard id="MOMO_WALLET" icon="wallet-outline" title="Ví MoMo" sub="Thanh toán nhanh & An toàn" />
        <PaymentCard id="CASH_ON_DELIVERY" icon="cash-multiple" title="Tiền mặt (COD)" sub="Thanh toán khi nhận hàng" />

        <View style={styles.billContainer}>
            {isFetching ? (
                <SkeletonItem width="100%" height={80} />
            ) : (
                <View>
                    {cartId !== "-1" && (
                        <>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Tạm tính</Text>
                                <Text style={styles.billValue}>{subTotal.toLocaleString("vi-VN")} đ</Text>
                            </View>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Phí vận chuyển</Text>
                                <Text style={[styles.billValue, {color: COLORS.primary}]}>
                                    {shippingFee.toLocaleString("vi-VN")} đ
                                </Text>
                            </View>
                            {discount > 0 && (
                              <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Giảm giá</Text>
                                <Text style={[styles.billValue, {color: '#4CAF50'}]}>
                                    -{discount.toLocaleString("vi-VN")} đ
                                </Text>
                              </View>
                            )}
                            <View style={styles.divider} />
                        </>
                    )}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                        <Text style={styles.totalValue}>{totalPayment.toLocaleString("vi-VN")} đ</Text>
                    </View>
                </View>
            )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payBtn} onPress={handleConfirmPayment} disabled={loading || isFetching}>
            {loading ? <ActivityIndicator color="#FFF" /> : (
                <Text style={styles.payBtnText}>
                    {paymentMethod === 'MOMO_WALLET' ? "THANH TOÁN MOMO" : "XÁC NHẬN ĐẶT HÀNG"}
                </Text>
            )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '600' },
  backBtn: { padding: 4, backgroundColor: COLORS.cardBg, borderRadius: 10 },
  sectionLabel: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  productListContainer: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 12 },
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  productThumb: { width: 50, height: 50, borderRadius: 10, backgroundColor: COLORS.border },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  productQty: { color: COLORS.subText, fontSize: 12, marginTop: 2 },
  productPrice: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  paymentCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.cardBg, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBg },
  paymentCardSelected: { borderColor: COLORS.primary, backgroundColor: '#1E1611' },
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#2C2C2E', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  cardSub: { color: COLORS.subText, fontSize: 12, marginTop: 2 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  addressContainer: { backgroundColor: COLORS.cardBg, padding: 16, borderRadius: 16 },
  addressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  addressName: { color: COLORS.text, fontWeight: '600', fontSize: 15 },
  editBtn: { color: COLORS.primary, fontWeight: 'bold' },
  addressDetail: { color: COLORS.subText, fontSize: 14, lineHeight: 22 },
  billContainer: { marginTop: 30, marginBottom: 100 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billLabel: { color: COLORS.subText, fontSize: 15 },
  billValue: { color: COLORS.text, fontSize: 15, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  totalLabel: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
  totalValue: { color: COLORS.primary, fontSize: 22, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border },
  payBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 10 },
  payBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  // 🎟️ Voucher styles
  voucherSection: { marginTop: 10 },
  voucherRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  voucherInput: { 
    flex: 1, 
    backgroundColor: COLORS.cardBg, 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    color: COLORS.text, 
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border 
  },
  voucherBtn: { 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 20, 
    paddingVertical: 14, 
    borderRadius: 12,
    minWidth: 90,
    alignItems: 'center'
  },
  voucherBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  voucherMessage: { marginTop: 8, fontSize: 13, fontWeight: '500' },
  // 🕒 Scheduling styles
  scheduleContainer: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 12 },
  scheduleTabs: { flexDirection: 'row', gap: 10 },
  scheduleTab: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: '#2C2C2E' 
  },
  scheduleTabActive: { backgroundColor: COLORS.primary },
  scheduleTabText: { color: '#8E8E93', fontSize: 14, fontWeight: '600' },
  scheduleTabTextActive: { color: '#FFF' },
  timeSlotsWrapper: { marginTop: 15, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 15 },
  timeSlotHint: { color: '#8E8E93', fontSize: 12, marginBottom: 12 },
  timeSlotsList: { gap: 10, paddingRight: 20 },
  timeSlotItem: { 
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, 
    backgroundColor: '#2C2C2E', borderWidth: 1, borderColor: '#2C2C2E' 
  },
  timeSlotItemActive: { borderColor: COLORS.primary, backgroundColor: '#1E1611' },
  timeSlotText: { color: '#8E8E93', fontSize: 13 },
  timeSlotTextActive: { color: COLORS.primary, fontWeight: 'bold' }
});