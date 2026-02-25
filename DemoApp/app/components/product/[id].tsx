import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  Alert, 
  StyleSheet,
  Platform,
  Image, // [BẮT BUỘC] Import Image từ react-native
  Share // 📤 Chia sẻ sản phẩm
} from "react-native";
// Import thư viện Animation & Rung
import Animated, { FadeInDown } from "react-native-reanimated";
// MotiView đã được thay thế bằng View thường
import * as Haptics from "expo-haptics";

import { useCart } from "../../components/cart/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import QuantitySelector from "../../components/home/QuantitySelector";
import SizeSelector from "../../components/home/SizeSelector";
import HeaderCartButton from "../../components/cart/HeaderCartButton";
import { GET_ID, getProductImageUrl, POST_ADD, PUT_UPDATE_QUANTITY, GET_USER_BY_EMAIL, GET_PRODUCT_REVIEWS } from "../../../APIService";
import AsyncStorage from '@react-native-async-storage/async-storage';

// [FIX] Tạo component ảnh động
// [FIX TUYỆT ĐỐI] Thêm 'as any' vào đây nữa
const AnimatedImage = Animated.createAnimatedComponent(Image) as any;

export default function ProductDetail() {
  // [LOGIC HIỆN ẢNH NGAY] Lấy params từ màn hình trước gửi sang
  const params = useLocalSearchParams(); 
  // Lấy id và image ngay từ params để hiển thị lập tức
  const { id, image: paramImage, name: paramName, price: paramPrice } = params;
  
  const router = useRouter();
  const { state, dispatch, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [item, setItem] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(4.8);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState("14");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [currentCartQty, setCurrentCartQty] = useState(0);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  useEffect(() => {
    if (state.items && state.items.length > 0) {
        const existingItem = state.items.find(
            (cartItem) => String(cartItem.id) === String(id)
        );
        if (existingItem) {
            setCurrentCartQty(existingItem.quantity);
        } else {
            setCurrentCartQty(0);
        }
    }
  }, [state.items, id]);

  const fetchProductDetail = async () => {
    try {
      const [prodRes, reviewRes] = await Promise.all([
        GET_ID("public/products", id as string),
        GET_PRODUCT_REVIEWS(id as string)
      ]);
      
      setItem(prodRes.data);
      if (reviewRes.data) {
        setReviews(reviewRes.data);
        if (reviewRes.data.length > 0) {
          const sum = reviewRes.data.reduce((acc: number, r: any) => acc + r.rating, 0);
          setAvgRating(sum / reviewRes.data.length);
        }
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết sản phẩm hoặc đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (type: 'inc' | 'dec') => {
      Haptics.selectionAsync(); 
      const maxQty = item ? item.quantity : 99;
      
      if (type === 'inc') {
          setQty(Math.min(qty + 1, maxQty));
      } else {
          setQty(Math.max(1, qty - 1));
      }
  };

  const handleAddToCart = async () => {
    if (!item) return;

    if (item.quantity <= 0) {
        Alert.alert("Thông báo", "Sản phẩm này hiện đã hết hàng.");
        return;
    }
    const totalQty = currentCartQty + qty;
    if (totalQty > item.quantity) {
        Alert.alert("Thông báo", `Kho chỉ còn ${item.quantity} sản phẩm. Bạn đã có ${currentCartQty} trong giỏ.`);
        return;
    }

    setAdding(true);
    try {
      const email = await AsyncStorage.getItem("saved-email");
      if (!email) {
          Alert.alert("Lỗi", "Bạn chưa đăng nhập!");
          router.replace("/auth/login");
          return;
      }

      const userRes = await GET_USER_BY_EMAIL(email);
      const cartId = userRes.data.cart?.cartId;

      if (!cartId) throw new Error("Không tìm thấy mã giỏ hàng.");

      if (currentCartQty > 0) {
          const newQuantity = currentCartQty + qty;
          await PUT_UPDATE_QUANTITY(cartId, item.productId, newQuantity);
          updateQuantity(item.productId, newQuantity);
      } else {
          await POST_ADD(`public/carts/${cartId}/products/${item.productId}/quantity/${qty}`, {});
          dispatch({
            type: "ADD_TO_CART",
            payload: {
              id: item.productId,
              name: item.productName,
              price: item.specialPrice,
              image: getProductImageUrl(item.image),
              quantity: qty,
              size,
            },
          });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (Platform.OS === 'web') {
         if(window.confirm("Đã thêm vào giỏ hàng thành công! Xem giỏ ngay?")) {
             router.push("/components/cart/cart");
         }
      } else {
          Alert.alert("Thành công", "Đã thêm vào giỏ hàng!", [
              { text: "Mua tiếp", style: "cancel" },
              { text: "Xem giỏ", onPress: () => router.push("/components/cart/cart") }
          ]);
      }

    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.log("Lỗi:", error);
      const msg = error.response?.data?.message || "Có lỗi xảy ra";
      Alert.alert("Lỗi", msg);
    } finally {
      setAdding(false);
    }
  };

  // [LOGIC HIỂN THỊ] 
  // Ưu tiên: Dữ liệu API (item) -> Dữ liệu params (param...) -> Mặc định
  const displayImage = item ? getProductImageUrl(item.image) : (paramImage as string);
  const displayName = item ? item.productName : paramName;
  const displayPrice = item ? item.specialPrice : paramPrice;
  const isOutOfStock = item && item.quantity <= 0;

  // Nếu không có ID thì báo lỗi (nhưng vẫn render View để không crash hook)
  if (!id) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy sản phẩm.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#FF7A00", marginTop: 10 }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: 18 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.push("/"))}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Chi tiết sản phẩm</Text>
          <HeaderCartButton />
        </View>

        {/* IMAGE AREA - Shared Transition */}
        <View style={styles.imageCard}>
          {/* [FIX LỖI ĐỎ] Thêm @ts-ignore */}
          {/* @ts-ignore */}
          <AnimatedImage
            source={{ uri: displayImage }}
            style={styles.productImage}
            // [QUAN TRỌNG] Dùng 'id' từ params để Tag khớp 100% với màn hình trước
            sharedTransitionTag={`product-image-${id}`} 
          />
          
          {isOutOfStock && (
              <View style={styles.outOfStockBadge}>
                  <Text style={styles.outOfStockText}>HẾT HÀNG</Text>
              </View>
          )}
          
          {/* 📤 Share Button */}
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={async () => {
              try {
                await Share.share({
                  message: `🍕 ${displayName || 'Sản phẩm'}\n💰 Giá: ${Number(displayPrice || 0).toLocaleString('vi-VN')}đ\n\nXem tại app nhà hàng!`,
                  title: displayName || 'Chia sẻ sản phẩm',
                });
              } catch (error) {
                console.error('Share error:', error);
              }
            }}
          >
            <Ionicons name="share-social-outline" size={22} color="#FF7A00" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.heartButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (item) {
                toggleWishlist({
                  productId: item.productId,
                  productName: item.productName,
                  specialPrice: item.specialPrice,
                  image: item.image
                });
              }
            }}
          >
            <MaterialCommunityIcons 
              name={isInWishlist(Number(id)) ? "heart" : "heart-outline"} 
              size={25} 
              color="#FF7A00" 
            />
          </TouchableOpacity>
        </View>

        {/* INFO AREA - Animation */}
        <View>
            <View style={styles.shopBadge}>
                <MaterialCommunityIcons name="storefront-outline" size={16} color="#FF7A00" />
                <Text style={{ marginLeft: 6, fontWeight: "600" }}>Cửa hàng chính hãng</Text>
            </View>

            <Text style={styles.title}>{displayName || "Đang tải..."}</Text>
            <Text style={styles.description}>{item ? item.description : "Đang cập nhật thông tin..."}</Text>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <MaterialCommunityIcons name="star" size={20} color="#FFB800" />
                    <Text style={{ marginLeft: 6 }}>{avgRating.toFixed(1)} ({reviews.length} đánh giá)</Text>
                </View>
                <View style={styles.statItem}>
                    <MaterialCommunityIcons name="truck-delivery-outline" size={20} color="#FF7A00" />
                    <Text style={{ marginLeft: 6 }}>Miễn phí</Text>
                </View>
            </View>

            <Text style={styles.sectionLabel}>KÍCH CỠ:</Text>
            <SizeSelector value={size} onChange={setSize} />
        </View>

        {/* PRICE & BUTTON */}
        <View style={styles.priceRow}>
          <View>
            <Text style={{ color: "#777", fontSize: 14 }}>Giá bán</Text>
            <Text style={styles.priceText}>
              {displayPrice ? Number(displayPrice).toLocaleString("vi-VN") : "0"} VND
            </Text>
            <Text style={{ marginTop: 6, color: isOutOfStock ? "#FF4444" : "#4CAF50", fontWeight: "700" }}>
                {isOutOfStock ? "Hết hàng" : (item ? `Còn hàng: ${item.quantity}` : "Đang kiểm tra kho...")}
            </Text>
          </View>

          {!isOutOfStock && (
              <QuantitySelector
                value={qty}
                onDecrease={() => handleQuantityChange('dec')}
                onIncrease={() => handleQuantityChange('inc')}
              />
          )}
        </View>

        <View>
            <TouchableOpacity 
            onPress={handleAddToCart} 
            style={[
                styles.addToCartBtn, 
                (adding || isOutOfStock || !item) && styles.disabledBtn
            ]}
            disabled={adding || isOutOfStock || !item}
            >
            {adding ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.addToCartText}>
                    {isOutOfStock ? "TẠM HẾT HÀNG" : "THÊM VÀO GIỎ HÀNG"}
                </Text>
            )}
            </TouchableOpacity>
        </View>

        {/* REVIEWS SECTION */}
        {reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đánh giá ({reviews.length})</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: "/components/profile/reviews", params: { productId: id } })}>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {reviews.slice(0, 3).map((review, index) => (
              <View key={review.reviewId} style={[styles.reviewItem, index === 0 && { marginTop: 10 }]}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{review.userName || "Khách"}</Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <MaterialCommunityIcons 
                        key={s} 
                        name={s <= review.rating ? "star" : "star-outline"} 
                        size={14} 
                        color="#FFB800" 
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewDate}>{new Date(review.reviewDate).toLocaleDateString("vi-VN")}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16, marginTop: 40 },
  headerText: { fontSize: 18, fontWeight: "600" },
  backButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
  imageCard: { backgroundColor: "#FFE3C4", padding: 22, borderRadius: 22, alignItems: "center", position: "relative" },
  productImage: { width: 250, height: 250, borderRadius: 125, resizeMode: "cover" },
  outOfStockBadge: {
      position: 'absolute', top: '40%', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, zIndex: 10
  },
  outOfStockText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  shareButton: { position: "absolute", left: 16, top: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 3 },
  heartButton: { position: "absolute", right: 16, top: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 3 },
  shopBadge: { flexDirection: "row", alignSelf: "flex-start", marginTop: 18, backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#eee" },
  title: { fontSize: 24, fontWeight: "700", marginTop: 14 },
  description: { color: "#777", marginTop: 8, lineHeight: 20 },
  statsRow: { flexDirection: "row", marginTop: 16, alignItems: "center" },
  statItem: { flexDirection: "row", alignItems: "center", marginRight: 22 },
  sectionLabel: { marginTop: 22, fontWeight: "700" },
  priceRow: { flexDirection: "row", marginTop: 24, justifyContent: "space-between", alignItems: "center", backgroundColor: "#F5F7FA", padding: 16, borderRadius: 16 },
  priceText: { fontSize: 22, fontWeight: "800", color: "#FF7A00" },
  addToCartBtn: { marginTop: 24, backgroundColor: "#FF7A00", paddingVertical: 18, borderRadius: 14, alignItems: "center", marginBottom: 30 },
  addToCartText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  disabledBtn: { backgroundColor: "#ccc", opacity: 0.8 },
  // Review Styles
  reviewsSection: { marginTop: 30, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  seeAllText: { color: '#FF7A00', fontWeight: '600' },
  reviewItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewUser: { fontWeight: '600', color: '#333' },
  reviewStars: { flexDirection: 'row' },
  reviewComment: { color: '#555', marginTop: 4, lineHeight: 18 },
  reviewDate: { color: '#999', fontSize: 12, marginTop: 4 }
});