import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Animated,
  FlatList,
  Easing,
} from "react-native";

import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GET_PAGE, getProductImageUrl } from "../../APIService";
import { useCart } from "../components/cart/CartContext";
import HeaderCartButton from "../components/cart/HeaderCartButton";

const { width, height } = Dimensions.get("window");

// Component Skeleton Loading cho thẻ sản phẩm
const ProductSkeleton = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity: pulseAnim }]}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonText} />
      <View style={styles.skeletonPrice} />
    </Animated.View>
  );
};

export default function ProductShowcase() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addToCart, cartItems } = useCart();
  
  const [products, setProducts] = useState<any[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  // Flying animation states
  const [isFlying, setIsFlying] = useState(false);
  const [flyingImage, setFlyingImage] = useState<string | null>(null);
  const flyAnim = useRef(new Animated.Value(0)).current;
  const cartBounceAnim = useRef(new Animated.Value(1)).current; // Cart bounce animation

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const categories = [
    { id: "all", name: "Tất cả", icon: "apps" },
    { id: "burger", name: "Burger", icon: "fast-food" },
    { id: "pizza", name: "Pizza", icon: "pizza" },
    { id: "sandwich", name: "Sandwich", icon: "restaurant" },
    { id: "drink", name: "Đồ uống", icon: "cafe" },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await GET_PAGE("public/products", 0, 20);
      const data = response.data.content || response.data;
      const rawList = Array.isArray(data) ? data : [];

      const formattedList = rawList.map((item: any) => ({
        id: item.productId,
        name: item.productName,
        originalPrice: item.price, // Giá gốc
        price: item.specialPrice || item.price, // Giá sau giảm
        discount: item.discount || 0, // Phần trăm giảm giá
        image: item.image ? getProductImageUrl(item.image) : null,
        description: item.description || "Món ăn ngon tuyệt vời từ đầu bếp của chúng tôi",
        rating: (Math.random() * 1 + 4).toFixed(1),
        reviews: Math.floor(Math.random() * 200 + 50),
        category: detectCategory(item.productName),
      }));

      setProducts(formattedList);
      if (formattedList.length > 0) {
        setFeaturedProduct(formattedList[0]);
      }

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]).start();

    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const detectCategory = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("burger") || lowerName.includes("hamburger")) return "burger";
    if (lowerName.includes("pizza")) return "pizza";
    if (lowerName.includes("sandwich")) return "sandwich";
    if (lowerName.includes("coca") || lowerName.includes("pepsi") || lowerName.includes("nước")) return "drink";
    return "all";
  };

  const handleAddToCart = async (product: any) => {
    // Set flying image
    setFlyingImage(product.image);
    setIsFlying(true);
    flyAnim.setValue(0);
    
    // Start flying animation
    Animated.timing(flyAnim, {
      toValue: 1, 
      duration: 800, 
      useNativeDriver: true,
    }).start(() => {
      setIsFlying(false);
      setFlyingImage(null);
      
      // Cart bounce animation - mượt và elastic
      Animated.sequence([
        Animated.timing(cartBounceAnim, { 
          toValue: 1.35, 
          duration: 150, 
          easing: Easing.out(Easing.ease),
          useNativeDriver: true 
        }),
        Animated.timing(cartBounceAnim, { 
          toValue: 0.9, 
          duration: 100, 
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true 
        }),
        Animated.timing(cartBounceAnim, { 
          toValue: 1.1, 
          duration: 80, 
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true 
        }),
        Animated.timing(cartBounceAnim, { 
          toValue: 1, 
          duration: 100, 
          easing: Easing.out(Easing.ease),
          useNativeDriver: true 
        }),
      ]).start();
    });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addToCart(product, 1);
  };

  // Lọc sản phẩm giảm giá
  const discountedProducts = products.filter(p => p.discount > 0);

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const renderProductCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.productCard}
      activeOpacity={0.9}
      onPress={() => router.push({
        pathname: "/components/product/[id]",
        params: { id: item.id, name: item.name, price: item.price, image: item.image, desc: item.description }
      })}
    >
      <View style={styles.cardImageWrapper}>
        <Image 
          source={item.image ? { uri: item.image } : require("../../assets/images/burger.webp")}
          style={styles.cardImage}
          resizeMode="cover"
        />
        {/* Badge giảm giá */}
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.favoriteBtn}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="heart-outline" size={18} color="#FF7622" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#FFB800" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewsText}>({item.reviews})</Text>
        </View>
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.cardPrice}>
              {Number(item.price).toLocaleString("vi-VN")}
              <Text style={styles.currency}>đ</Text>
            </Text>
            {/* Giá gốc gạch ngang nếu có giảm giá */}
            {item.discount > 0 && (
              <Text style={styles.originalPrice}>
                {Number(item.originalPrice).toLocaleString("vi-VN")}đ
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => handleAddToCart(item)}
          >
            <LinearGradient colors={["#FF7622", "#FF4B2B"]} style={styles.addBtnGradient}>
              <Ionicons name="add" size={18} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khám phá món ngon</Text>
        <HeaderCartButton />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        
        {/* FEATURED SECTION */}
        {loading ? (
          <View style={styles.featuredSkeleton}>
            <ActivityIndicator size="large" color="#FF7622" />
          </View>
        ) : featuredProduct && (
          <Animated.View style={[styles.featuredSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <LinearGradient 
              colors={["#FF7622", "#FF9A5A"]} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }}
              style={styles.featuredCard}
            >
              <View style={styles.featuredContent}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.badgeText}>🔥 HOT</Text>
                </View>
                <Text style={styles.featuredTitle}>{featuredProduct.name}</Text>
                <Text style={styles.featuredDesc} numberOfLines={2}>
                  {featuredProduct.description}
                </Text>
                <View style={styles.featuredPriceRow}>
                  <Text style={styles.featuredPrice}>
                    {Number(featuredProduct.price).toLocaleString("vi-VN")}đ
                  </Text>
                  <TouchableOpacity 
                    style={styles.orderNowBtn}
                    onPress={() => handleAddToCart(featuredProduct)}
                  >
                    <Text style={styles.orderNowText}>Đặt ngay</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FF7622" />
                  </TouchableOpacity>
                </View>
              </View>
              <Image 
                source={featuredProduct.image ? { uri: featuredProduct.image } : require("../../assets/images/burger.webp")}
                style={styles.featuredImage}
                resizeMode="contain"
              />
            </LinearGradient>
          </Animated.View>
        )}

        {/* CATEGORIES */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, activeCategory === cat.id && styles.categoryChipActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveCategory(cat.id);
                }}
              >
                <Ionicons 
                  name={cat.icon as any} 
                  size={18} 
                  color={activeCategory === cat.id ? "#FFF" : "#6B6E82"} 
                />
                <Text style={[styles.categoryText, activeCategory === cat.id && styles.categoryTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FLASH SALE - SẢN PHẨM GIẢM GIÁ */}
        {discountedProducts.length > 0 && (
          <View style={styles.flashSaleSection}>
            <View style={styles.flashSaleHeader}>
              <View style={styles.flashSaleTitleRow}>
                <Ionicons name="flash" size={22} color="#FF3B30" />
                <Text style={styles.flashSaleTitle}>Flash Sale</Text>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveText}>• LIVE</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flashSaleScroll}
            >
              {discountedProducts.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.flashSaleCard}
                  activeOpacity={0.9}
                  onPress={() => router.push({
                    pathname: "/components/product/[id]",
                    params: { id: item.id, name: item.name, price: item.price, image: item.image, desc: item.description }
                  })}
                >
                  <View style={styles.flashSaleImageWrapper}>
                    <Image 
                      source={item.image ? { uri: item.image } : require("../../assets/images/burger.webp")}
                      style={styles.flashSaleImage}
                      resizeMode="cover"
                    />
                    <View style={styles.flashSaleDiscountBadge}>
                      <Text style={styles.flashSaleDiscountText}>-{item.discount}%</Text>
                    </View>
                  </View>
                  <View style={styles.flashSaleContent}>
                    <Text style={styles.flashSaleName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.flashSalePriceRow}>
                      <Text style={styles.flashSalePrice}>
                        {Number(item.price).toLocaleString("vi-VN")}đ
                      </Text>
                      <Text style={styles.flashSaleOriginalPrice}>
                        {Number(item.originalPrice).toLocaleString("vi-VN")}đ
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.flashSaleAddBtn}
                      onPress={() => handleAddToCart(item)}
                    >
                      <Text style={styles.flashSaleAddText}>+ Thêm</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* PRODUCTS GRID */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tất cả món ngon</Text>
            <TouchableOpacity onPress={() => router.push("/(home)/menu")}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.skeletonGrid}>
              {[1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)}
            </View>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              <FlatList
                data={filteredProducts}
                renderItem={renderProductCard}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={styles.productRow}
                contentContainerStyle={styles.productGrid}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="food-off" size={60} color="#CCC" />
                    <Text style={styles.emptyText}>Không có món nào trong danh mục này</Text>
                  </View>
                }
              />
            </Animated.View>
          )}
        </View>

        {/* PROMO BANNER */}
        <View style={styles.promoBanner}>
          <LinearGradient 
            colors={["#6C5DD3", "#8B7EE5"]} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }}
            style={styles.promoCard}
          >
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Giảm 30%</Text>
              <Text style={styles.promoSubtitle}>cho đơn hàng đầu tiên</Text>
              <TouchableOpacity style={styles.promoBtn}>
                <Text style={styles.promoBtnText}>Đặt ngay</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.promoDecor}>
              <MaterialCommunityIcons name="sale" size={80} color="rgba(255,255,255,0.2)" />
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Flying Animation */}
      {isFlying && flyingImage && (
        <Animated.View style={[styles.flyingIcon, {
          transform: [
            { translateY: flyAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 0.85] }) },
            { translateX: flyAnim.interpolate({ inputRange: [0, 1], outputRange: [0, width * 0.35] }) },
            { scale: flyAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.15] }) },
            { rotate: flyAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }
          ],
          opacity: flyAnim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] })
        }]}>
          <Image source={{ uri: flyingImage }} style={styles.flyingImg} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181C2E",
  },
  cartButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // Featured Section
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  featuredSkeleton: {
    height: 180,
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 24,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  featuredCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    overflow: "hidden",
  },
  featuredContent: {
    flex: 1,
    paddingRight: 10,
  },
  featuredBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  badgeText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 12,
  },
  featuredTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  featuredDesc: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 15,
  },
  featuredPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  featuredPrice: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
  },
  orderNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 5,
  },
  orderNowText: {
    color: "#FF7622",
    fontWeight: "700",
    fontSize: 13,
  },
  featuredImage: {
    width: 130,
    height: 130,
    position: "absolute",
    right: 10,
    bottom: -10,
  },

  // Categories
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181C2E",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoriesScroll: {
    paddingLeft: 20,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryChipActive: {
    backgroundColor: "#FF7622",
  },
  categoryText: {
    color: "#6B6E82",
    fontWeight: "600",
    fontSize: 14,
  },
  categoryTextActive: {
    color: "#FFF",
  },

  // Products
  productsSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  seeAllText: {
    color: "#FF7622",
    fontWeight: "600",
    fontSize: 14,
  },
  productGrid: {
    paddingBottom: 10,
  },
  productRow: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
  productCard: {
    width: (width - 55) / 2,
    backgroundColor: "#FFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardImageWrapper: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 130,
  },
  favoriteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 12,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#181C2E",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#181C2E",
  },
  reviewsText: {
    fontSize: 11,
    color: "#A0A5BA",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FF7622",
  },
  currency: {
    fontSize: 12,
    fontWeight: "600",
  },
  addBtn: {
    borderRadius: 10,
    overflow: "hidden",
  },
  addBtnGradient: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Discount styles
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  originalPrice: {
    fontSize: 12,
    color: "#A0A5BA",
    textDecorationLine: "line-through",
    marginTop: 2,
  },

  // Flash Sale Styles
  flashSaleSection: {
    marginBottom: 25,
  },
  flashSaleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  flashSaleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  flashSaleTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#181C2E",
  },
  liveBadge: {
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    color: "#FF3B30",
    fontSize: 11,
    fontWeight: "700",
  },
  flashSaleScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  flashSaleCard: {
    width: 150,
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  flashSaleImageWrapper: {
    position: "relative",
  },
  flashSaleImage: {
    width: "100%",
    height: 100,
  },
  flashSaleDiscountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  flashSaleDiscountText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
  },
  flashSaleContent: {
    padding: 10,
  },
  flashSaleName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#181C2E",
    marginBottom: 6,
  },
  flashSalePriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  flashSalePrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FF7622",
  },
  flashSaleOriginalPrice: {
    fontSize: 11,
    color: "#A0A5BA",
    textDecorationLine: "line-through",
  },
  flashSaleAddBtn: {
    backgroundColor: "#FFF0E6",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  flashSaleAddText: {
    color: "#FF7622",
    fontWeight: "700",
    fontSize: 12,
  },

  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  skeletonCard: {
    width: (width - 55) / 2,
    height: 200,
    backgroundColor: "#E8E8E8",
    borderRadius: 20,
    marginBottom: 15,
    padding: 10,
  },
  skeletonImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#D8D8D8",
    borderRadius: 15,
  },
  skeletonText: {
    width: "80%",
    height: 14,
    backgroundColor: "#D8D8D8",
    borderRadius: 7,
    marginTop: 12,
  },
  skeletonPrice: {
    width: "50%",
    height: 14,
    backgroundColor: "#D8D8D8",
    borderRadius: 7,
    marginTop: 8,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 15,
    color: "#A0A5BA",
    fontSize: 14,
  },

  // Promo Banner
  promoBanner: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  promoCard: {
    borderRadius: 24,
    padding: 25,
    flexDirection: "row",
    overflow: "hidden",
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "800",
  },
  promoSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    marginTop: 5,
    marginBottom: 20,
  },
  promoBtn: {
    backgroundColor: "#FFF",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: "flex-start",
  },
  promoBtnText: {
    color: "#6C5DD3",
    fontWeight: "700",
    fontSize: 14,
  },
  promoDecor: {
    position: "absolute",
    right: 20,
    top: "50%",
    marginTop: -40,
    opacity: 0.5,
  },

  // Cart Badge
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },

  // Flying Animation
  flyingIcon: {
    position: "absolute",
    bottom: 150,
    alignSelf: "center",
    zIndex: 999,
  },
  flyingImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#FF7622",
  },
});