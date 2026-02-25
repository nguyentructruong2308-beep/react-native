import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Dimensions,
  Animated,
  Image,
  Easing,
  FlatList
} from "react-native";
// Animation đã được xử lý bằng react-native-reanimated
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GET_ALL, getProductImageUrl, GET_PAGE } from "../../APIService";
import { useCart } from "../../app/components/cart/CartContext";
import CategoryCard from "../../app/components/category/CategoryCard";
import ProductCard from "../../app/components/product/ProductCard";
import HeaderCartButton from "../../app/components/cart/HeaderCartButton";

const { width, height } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, addToCart, cartItems } = useCart();
  const cartCount = cartItems?.length || state.items.length;

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState<any[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<any[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Flying animation states
  const [isFlying, setIsFlying] = useState(false);
  const [flyingImage, setFlyingImage] = useState<string | null>(null);
  const flyAnim = useRef(new Animated.Value(0)).current;
  const cartBounceAnim = useRef(new Animated.Value(1)).current;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        GET_ALL("public/categories"),
        GET_PAGE("public/products", 0, 50)
      ]);
      const cats = catRes.data.content || [];
      const prods = prodRes.data.content || [];
      
      setCategories(cats);
      setProducts(prods);
      
      // Lọc sản phẩm giảm giá
      const discounted = prods.filter((p: any) => p.discount > 0);
      setDiscountedProducts(discounted);
      
      // Featured product - random từ discounted hoặc products
      if (discounted.length > 0) {
        setFeaturedProduct(discounted[Math.floor(Math.random() * discounted.length)]);
      } else if (prods.length > 0) {
        setFeaturedProduct(prods[0]);
      }

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]).start();

    } catch (error) {
      console.error("Lỗi lấy dữ liệu từ Server:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fetchInitialData();
  };

  const onAddToCartWithEffect = async (item: any) => {
    const imgUri = getProductImageUrl(item.image);
    setFlyingImage(imgUri);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setIsFlying(true);
    flyAnim.setValue(0);
    Animated.timing(flyAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      setIsFlying(false);
      setFlyingImage(null);
      
      // Cart bounce animation mượt
      Animated.sequence([
        Animated.timing(cartBounceAnim, { toValue: 1.35, duration: 150, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(cartBounceAnim, { toValue: 0.9, duration: 100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(cartBounceAnim, { toValue: 1.1, duration: 80, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(cartBounceAnim, { toValue: 1, duration: 100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    });

    await addToCart(item, 1);
  };

  const renderFlashSaleItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.flashSaleCard}
      activeOpacity={0.9}
      onPress={() => router.push({
        pathname: "/components/product/[id]",
        params: { id: item.productId, name: item.productName, price: item.specialPrice, image: getProductImageUrl(item.image), desc: item.description }
      })}
    >
      <View style={styles.flashSaleImageWrapper}>
        <Image 
          source={{ uri: getProductImageUrl(item.image) }}
          style={styles.flashSaleImage}
          resizeMode="cover"
        />
        <View style={styles.flashSaleDiscountBadge}>
          <Text style={styles.flashSaleDiscountText}>-{item.discount}%</Text>
        </View>
      </View>
      <View style={styles.flashSaleContent}>
        <Text style={styles.flashSaleName} numberOfLines={1}>{item.productName}</Text>
        <View style={styles.flashSalePriceRow}>
          <Text style={styles.flashSalePrice}>
            {Number(item.specialPrice).toLocaleString("vi-VN")}đ
          </Text>
          <Text style={styles.flashSaleOriginalPrice}>
            {Number(item.price).toLocaleString("vi-VN")}đ
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.flashSaleAddBtn}
          onPress={() => onAddToCartWithEffect(item)}
        >
          <Text style={styles.flashSaleAddText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F9FB" }}>
      <StatusBar barStyle="dark-content" />

      {/* Flying Animation */}
      {isFlying && flyingImage && (
        <Animated.View style={[styles.flyingIcon, {
          transform: [
            { translateY: flyAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 0.85] }) },
            { translateX: flyAnim.interpolate({ inputRange: [0, 1], outputRange: [0, width * 0.38] }) },
            { scale: flyAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.1] }) },
            { rotate: flyAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }
          ],
          opacity: flyAnim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] })
        }]}>
          <Image source={{ uri: flyingImage }} style={styles.flyImage} />
        </Animated.View>
      )}

      {/* FIXED HEADER - Không cuộn */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => Haptics.selectionAsync()}>
          <Ionicons name="grid-outline" size={22} color="#181C2E" />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={styles.deliverText}>GIAO ĐẾN</Text>
          <View style={styles.locationRow}>
             <Text style={styles.locationText}>Hồ Chí Minh, VN</Text>
             <Ionicons name="chevron-down" size={14} color="#FF7622" style={{marginLeft: 4}} />
          </View>
        </View>

        <HeaderCartButton />
      </View>
      
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7622" />}
      >
        <View style={styles.heroSection}>
          <Text style={styles.greeting}>Xin chào! 👋</Text>
          <Text style={styles.heroSub}>Bạn muốn ăn gì hôm nay?</Text>
        </View>

        {/* SEARCH BAR */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/components/search/search");
          }}
          style={styles.searchBar}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={20} color="#676767" />
          <Text style={styles.searchText}>Tìm kiếm món ngon...</Text>
          <LinearGradient colors={['#FF7622', '#FF4B2B']} style={styles.searchIconBtn}>
             <Ionicons name="options-outline" size={18} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* FEATURED PRODUCT BANNER */}
        {featuredProduct && (
          <Animated.View style={[styles.featuredSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <LinearGradient 
              colors={['#FF7622', '#FF9A5A']} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }}
              style={styles.featuredCard}
            >
              <View style={styles.featuredContent}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>🔥 HOT</Text>
                </View>
                <Text style={styles.featuredTitle} numberOfLines={1}>{featuredProduct.productName}</Text>
                <Text style={styles.featuredDesc} numberOfLines={2}>
                  {featuredProduct.description || "Món ăn ngon tuyệt vời từ đầu bếp"}
                </Text>
                <View style={styles.featuredPriceRow}>
                  <Text style={styles.featuredPrice}>
                    {Number(featuredProduct.specialPrice || featuredProduct.price).toLocaleString("vi-VN")}đ
                  </Text>
                  <TouchableOpacity 
                    style={styles.orderNowBtn}
                    onPress={() => onAddToCartWithEffect(featuredProduct)}
                  >
                    <Text style={styles.orderNowText}>Đặt ngay</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FF7622" />
                  </TouchableOpacity>
                </View>
              </View>
              <Image 
                source={{ uri: getProductImageUrl(featuredProduct.image) }}
                style={styles.featuredImage}
                resizeMode="contain"
              />
            </LinearGradient>
          </Animated.View>
        )}

        {/* CATEGORIES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Tất cả</Text></TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#FF7622" />
        ) : (
          <CategoryCard data={categories} />
        )}

        {/* FLASH SALE */}
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
              <TouchableOpacity onPress={() => router.push("/(home)/add")}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={discountedProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.productId.toString()}
              renderItem={renderFlashSaleItem}
              contentContainerStyle={styles.flashSaleScroll}
            />
          </View>
        )}

        {/* PRODUCTS GRID */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
          <TouchableOpacity onPress={() => router.push("/(home)/menu")}>
            <Text style={styles.seeAll}>Xem thêm</Text>
          </TouchableOpacity>      
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF7622" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.productGrid}>
            {products.slice(0, 6).map((item: any, index: number) => (
              <View
                key={item.productId}
                style={{ width: '48%' }}
              >
                <ProductCard 
                  item={{
                    id: item.productId,
                    name: item.productName,
                    price: item.specialPrice,
                    image: getProductImageUrl(item.image),
                    shop: "Gourmet Kitchen",
                    desc: item.description
                  }} 
                  onAddPress={() => onAddToCartWithEffect(item)}
                />
              </View>
            ))}
          </View>
        )}

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
              <TouchableOpacity style={styles.promoBtn} onPress={() => router.push("/(home)/add")}>
                <Text style={styles.promoBtnText}>Khám phá</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.promoDecor}>
              <MaterialCommunityIcons name="sale" size={80} color="rgba(255,255,255,0.2)" />
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* FLOATING AI BUTTON */}
      <TouchableOpacity 
        style={styles.chatButton}
        onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            router.push("/components/chat/ChatScreen");
        }}
      >
        <LinearGradient colors={['#FF7622', '#FF4B2B']} style={styles.chatGradient}>
            <Ionicons name="sparkles" size={28} color="#FFF" />
            <View style={styles.onlineDot} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 15, paddingHorizontal: 20, backgroundColor: "#F8F9FB" },
  headerBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 },
  deliverText: { color: "#FF7622", fontWeight: "800", fontSize: 10, letterSpacing: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontWeight: "700", fontSize: 14, color: '#181C2E' },
  
  heroSection: { marginTop: 10, marginBottom: 5 },
  greeting: { fontSize: 24, fontWeight: "400", color: '#181C2E' },
  heroSub: { fontSize: 24, fontWeight: "800", color: '#181C2E', marginTop: -5 },

  searchBar: { marginTop: 20, backgroundColor: "#FFF", height: 55, borderRadius: 18, flexDirection: "row", alignItems: "center", paddingLeft: 15, paddingRight: 5, elevation: 3, shadowColor: '#000', shadowOpacity: 0.06 },
  searchText: { marginLeft: 12, color: "#676767", fontSize: 15, flex: 1 },
  searchIconBtn: { width: 45, height: 45, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  // Featured Section
  featuredSection: { marginTop: 20 },
  featuredCard: { borderRadius: 24, padding: 20, flexDirection: "row", overflow: "hidden", minHeight: 160 },
  featuredContent: { flex: 1, paddingRight: 60 },
  featuredBadge: { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, alignSelf: "flex-start", marginBottom: 8 },
  featuredBadgeText: { color: "#FFF", fontWeight: "700", fontSize: 12 },
  featuredTitle: { color: "#FFF", fontSize: 18, fontWeight: "800", marginBottom: 6 },
  featuredDesc: { color: "rgba(255,255,255,0.85)", fontSize: 12, lineHeight: 16, marginBottom: 12 },
  featuredPriceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  featuredPrice: { color: "#FFF", fontSize: 20, fontWeight: "800" },
  orderNowBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 4 },
  orderNowText: { color: "#FF7622", fontWeight: "700", fontSize: 12 },
  featuredImage: { width: 120, height: 120, position: "absolute", right: 5, bottom: 5 },

  sectionHeader: { marginTop: 25, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  sectionTitle: { fontSize: 19, fontWeight: "800", color: "#181C2E" },
  seeAll: { color: "#FF7622", fontWeight: "700", fontSize: 14 },
  
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  
  cartBtn: { position: 'relative' },
  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#FF4B2B', borderRadius: 10, width: 20, height: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'white'
  },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '900' },

  // Flash Sale
  flashSaleSection: { marginTop: 25 },
  flashSaleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  flashSaleTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  flashSaleTitle: { fontSize: 18, fontWeight: "800", color: "#181C2E" },
  liveBadge: { backgroundColor: "#FFE5E5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  liveText: { color: "#FF3B30", fontSize: 11, fontWeight: "700" },
  flashSaleScroll: { paddingRight: 20 },
  flashSaleCard: { width: 150, backgroundColor: "#FFF", borderRadius: 16, marginRight: 12, overflow: "hidden", elevation: 3, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8 },
  flashSaleImageWrapper: { position: "relative" },
  flashSaleImage: { width: "100%", height: 100 },
  flashSaleDiscountBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "#FF3B30", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  flashSaleDiscountText: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  flashSaleContent: { padding: 10 },
  flashSaleName: { fontSize: 13, fontWeight: "700", color: "#181C2E", marginBottom: 6 },
  flashSalePriceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  flashSalePrice: { fontSize: 14, fontWeight: "800", color: "#FF7622" },
  flashSaleOriginalPrice: { fontSize: 11, color: "#A0A5BA", textDecorationLine: "line-through" },
  flashSaleAddBtn: { backgroundColor: "#FFF0E6", paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  flashSaleAddText: { color: "#FF7622", fontWeight: "700", fontSize: 12 },

  // Promo Banner
  promoBanner: { marginTop: 25 },
  promoCard: { borderRadius: 24, padding: 25, flexDirection: "row", overflow: "hidden" },
  promoContent: { flex: 1 },
  promoTitle: { color: "#FFF", fontSize: 26, fontWeight: "800" },
  promoSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 5, marginBottom: 15 },
  promoBtn: { backgroundColor: "#FFF", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, alignSelf: "flex-start" },
  promoBtnText: { color: "#6C5DD3", fontWeight: "700", fontSize: 13 },
  promoDecor: { position: "absolute", right: 20, top: "50%", marginTop: -40, opacity: 0.5 },

  chatButton: { position: 'absolute', bottom: 100, right: 25, width: 65, height: 65, zIndex: 9999 },
  chatGradient: { width: '100%', height: '100%', borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: "#FF7622", shadowOpacity: 0.4, shadowRadius: 10 },
  onlineDot: { position: 'absolute', top: 12, right: 12, width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#FFF' },

  flyingIcon: { position: 'absolute', bottom: 300, alignSelf: 'center', zIndex: 10001 },
  flyImage: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#FF7622' }
});