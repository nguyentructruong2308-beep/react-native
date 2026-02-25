import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  RefreshControl,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
// MotiView đã được thay thế bằng View thường

import { 
  GET_USER_ORDERS, 
  GET_USER_REVIEWS, 
  POST_ADD_REVIEW, 
  getProductImageUrl 
} from "../../../APIService";

const { width } = Dimensions.get("window");

// Star Rating Component
const StarRating = ({ rating, size = 20, onRate, interactive = false }: any) => {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          disabled={!interactive}
          onPress={() => {
            if (interactive && onRate) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onRate(star);
            }
          }}
        >
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color={star <= rating ? "#FFB800" : "#D4D4D4"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function Reviews() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pending" | "reviewed">("pending");
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const email = await AsyncStorage.getItem("saved-email");
      if (!email) {
        setLoading(false);
        return;
      }

      // Lấy đơn hàng đã hoàn thành để đánh giá
      const ordersRes = await GET_USER_ORDERS(email);
      const orders = ordersRes.data?.content || ordersRes.data || [];
      
      // Lọc đơn hàng đã giao (Delivered) để lấy sản phẩm chờ đánh giá
      const deliveredOrders = orders.filter((o: any) => o.orderStatus === "Delivered");
      
      // Trích xuất sản phẩm từ đơn hàng đã giao
      const pendingProducts: any[] = [];
      deliveredOrders.forEach((order: any) => {
        order.orderItems?.forEach((item: any) => {
          pendingProducts.push({
            id: item.product?.productId,
            orderId: order.orderId,
            name: item.product?.productName,
            image: item.product?.image ? getProductImageUrl(item.product.image) : null,
            price: item.orderedProductPrice,
            quantity: item.quantity,
            orderDate: order.orderDate,
          });
        });
      });
      
      // Lấy danh sách đánh giá từ Backend
      const reviewsRes = await GET_USER_REVIEWS(email);
      const reviewsData = reviewsRes.data || [];
      
      // Mapping dữ liệu từ Backend sang format UI
      const mappedReviews = reviewsData.map((review: any) => ({
        id: review.productId,
        orderId: review.orderId,
        name: review.productName,
        image: review.productImage ? getProductImageUrl(review.productImage) : null,
        rating: review.rating,
        comment: review.comment,
        reviewDate: review.reviewDate,
      }));
      setMyReviews(mappedReviews);
      
      // Lọc bỏ sản phẩm đã đánh giá khỏi pending list
      // Dùng cặp {productId, orderId} để kiểm tra
      const reviewedKeys = new Set(mappedReviews.map((r: any) => `${r.id}-${r.orderId}`));
      const filteredPending = pendingProducts.filter(
        (p: any) => !reviewedKeys.has(`${p.id}-${p.orderId}`)
      );
      setPendingReviews(filteredPending);

      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchData();
  };

  const openReviewModal = (product: any) => {
    setSelectedProduct(product);
    setRating(5);
    setComment("");
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedProduct) return;
    
    try {
      setSubmitting(true);
      const email = await AsyncStorage.getItem("saved-email");
      
      if (!email) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để đánh giá");
        return;
      }

      await POST_ADD_REVIEW(email, selectedProduct.id, {
        rating,
        comment,
        orderId: selectedProduct.orderId,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá sản phẩm!");
      
      // Sau khi gửi thành công, tải lại dữ liệu từ server để đồng bộ
      fetchData();
      setShowReviewModal(false);
      
    } catch (error: any) {
      console.error("Error submitting review:", error);
      
      // Nếu server báo đã đánh giá rồi (400 Bad Request)
      if (error.response?.status === 400 && error.response?.data?.message?.includes("đã đánh giá")) {
        Alert.alert("Thông báo", "Bạn đã đánh giá sản phẩm này rồi!");
        fetchData(); // Refresh để cập nhật UI
        setShowReviewModal(false);
      } else {
        Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const renderPendingItem = (item: any, index: number) => (
    <View key={`${item.id}-${item.orderId}-${index}`}>
      <View style={styles.productCard}>
        <Image
          source={item.image ? { uri: item.image } : require("../../../assets/images/burger.webp")}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.orderInfo}>Đơn #{item.orderId} • {formatDate(item.orderDate)}</Text>
          <Text style={styles.productPrice}>{Number(item.price).toLocaleString("vi-VN")}đ x{item.quantity}</Text>
        </View>
        <TouchableOpacity
          style={styles.reviewBtn}
          onPress={() => openReviewModal(item)}
        >
          <LinearGradient colors={["#FF7622", "#FF9A5A"]} style={styles.reviewBtnGradient}>
            <Text style={styles.reviewBtnText}>Đánh giá</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReviewedItem = (item: any, index: number) => (
    <View key={`reviewed-${item.id}-${index}`}>
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Image
            source={item.image ? { uri: item.image } : require("../../../assets/images/burger.webp")}
            style={styles.reviewProductImage}
          />
          <View style={styles.reviewProductInfo}>
            <Text style={styles.reviewProductName} numberOfLines={1}>{item.name}</Text>
            <StarRating rating={item.rating} size={16} />
          </View>
          <Text style={styles.reviewDate}>{formatDate(item.reviewDate)}</Text>
        </View>
        {item.comment && (
          <Text style={styles.reviewComment}>"{item.comment}"</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá của tôi</Text>
        <View style={{ width: 45 }} />
      </View>

      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{pendingReviews.length}</Text>
          <Text style={styles.statLabel}>Chờ đánh giá</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{myReviews.length}</Text>
          <Text style={styles.statLabel}>Đã đánh giá</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <Ionicons 
            name="time-outline" 
            size={18} 
            color={activeTab === "pending" ? "#FF7622" : "#6B6E82"} 
          />
          <Text style={[styles.tabText, activeTab === "pending" && styles.activeTabText]}>
            Chờ đánh giá ({pendingReviews.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "reviewed" && styles.activeTab]}
          onPress={() => setActiveTab("reviewed")}
        >
          <Ionicons 
            name="star" 
            size={18} 
            color={activeTab === "reviewed" ? "#FF7622" : "#6B6E82"} 
          />
          <Text style={[styles.tabText, activeTab === "reviewed" && styles.activeTabText]}>
            Đã đánh giá ({myReviews.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7622" />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF7622" />
          </View>
        ) : activeTab === "pending" ? (
          pendingReviews.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="star-check" size={60} color="#D4D4D4" />
              <Text style={styles.emptyTitle}>Không có sản phẩm chờ đánh giá</Text>
              <Text style={styles.emptySubtitle}>Mua hàng và hoàn thành đơn để đánh giá sản phẩm</Text>
            </View>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              {pendingReviews.map((item, index) => renderPendingItem(item, index))}
            </Animated.View>
          )
        ) : myReviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={60} color="#D4D4D4" />
            <Text style={styles.emptyTitle}>Chưa có đánh giá nào</Text>
            <Text style={styles.emptySubtitle}>Đánh giá sản phẩm sau khi nhận hàng</Text>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {myReviews.map((item, index) => renderReviewedItem(item, index))}
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đánh giá sản phẩm</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Ionicons name="close" size={24} color="#181C2E" />
              </TouchableOpacity>
            </View>

            {selectedProduct && (
              <>
                <View style={styles.modalProduct}>
                  <Image
                    source={selectedProduct.image ? { uri: selectedProduct.image } : require("../../../assets/images/burger.webp")}
                    style={styles.modalProductImage}
                  />
                  <Text style={styles.modalProductName} numberOfLines={2}>{selectedProduct.name}</Text>
                </View>

                <View style={styles.ratingSection}>
                  <Text style={styles.ratingLabel}>Chất lượng sản phẩm</Text>
                  <StarRating rating={rating} size={36} interactive onRate={setRating} />
                  <Text style={styles.ratingText}>
                    {rating === 5 ? "Tuyệt vời!" : rating === 4 ? "Hài lòng" : rating === 3 ? "Bình thường" : rating === 2 ? "Chưa tốt" : "Tệ"}
                  </Text>
                </View>

                <View style={styles.commentSection}>
                  <Text style={styles.commentLabel}>Bình luận (tùy chọn)</Text>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                    placeholderTextColor="#A0A5BA"
                    multiline
                    numberOfLines={4}
                    value={comment}
                    onChangeText={setComment}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                  onPress={submitReview}
                  disabled={submitting}
                >
                  <LinearGradient 
                    colors={submitting ? ["#CCC", "#AAA"] : ["#FF7622", "#FF4B2B"]} 
                    style={styles.submitBtnGradient}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.submitBtnText}>Gửi đánh giá</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
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

  // Stats Banner
  statsBanner: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FF7622",
  },
  statLabel: {
    fontSize: 13,
    color: "#6B6E82",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E8E8E8",
    marginHorizontal: 20,
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: "#FFF",
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#FFF0E6",
    borderWidth: 1,
    borderColor: "#FF7622",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B6E82",
  },
  activeTabText: {
    color: "#FF7622",
  },

  // Scroll View
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Product Card (Pending)
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#181C2E",
    marginBottom: 4,
  },
  orderInfo: {
    fontSize: 12,
    color: "#A0A5BA",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FF7622",
  },
  reviewBtn: {
    marginLeft: 10,
  },
  reviewBtnGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  reviewBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // Review Card (Reviewed)
  reviewCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewProductImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
  },
  reviewProductInfo: {
    flex: 1,
  },
  reviewProductName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#181C2E",
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 11,
    color: "#A0A5BA",
  },
  reviewComment: {
    marginTop: 12,
    fontSize: 13,
    color: "#6B6E82",
    fontStyle: "italic",
    lineHeight: 20,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#181C2E",
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#A0A5BA",
    marginTop: 5,
    textAlign: "center",
  },

  // Loading
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181C2E",
  },
  modalProduct: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalProductImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    marginBottom: 12,
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#181C2E",
    textAlign: "center",
  },
  ratingSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 14,
    color: "#6B6E82",
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFB800",
    marginTop: 8,
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 14,
    color: "#6B6E82",
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: "#F8F9FB",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#181C2E",
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  submitBtn: {},
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});