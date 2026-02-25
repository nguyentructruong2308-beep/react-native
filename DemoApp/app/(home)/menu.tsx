import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  RefreshControl,
  SafeAreaView,
  Platform,
  StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import ProductCard from "../components/product/ProductCard"; 
import { SkeletonProductCard } from "../components/common/Skeleton";
import { GET_PAGE, getProductImageUrl } from "../../APIService"; 
import HeaderCartButton from "../components/cart/HeaderCartButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PAGE_SIZE = 10; // 📦 Số sản phẩm mỗi trang

export default function AllProducts() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchData(0, true);
  }, []);

  const fetchData = async (pageNum: number, isRefresh: boolean = false) => {
    if (isRefresh) {
      setLoading(true);
    }
    
    try {
      const response = await GET_PAGE("public/products", pageNum, PAGE_SIZE);
      
      const data = response.data.content || response.data;
      const rawList = Array.isArray(data) ? data : [];
      const totalPages = response.data.totalPages || 1;

      // Format lại ảnh
      const formattedList = rawList.map((item: any) => ({
        ...item,
        image: item.image ? getProductImageUrl(item.image) : null
      }));

      if (isRefresh) {
        setProducts(formattedList);
        setPage(0);
      } else {
        setProducts(prev => [...prev, ...formattedList]);
      }
      
      // Kiểm tra còn trang tiếp không
      setHasMore(pageNum < totalPages - 1);
      
    } catch (error) {
      console.error("Lỗi lấy danh sách:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    fetchData(0, true);
  }, []);

  // 📜 Infinite Scroll - Load thêm khi cuộn đến cuối
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage, false);
  }, [loadingMore, hasMore, loading, page]);

  // Footer loading indicator
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#FF7622" />
        <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
      </View>
    );
  };

  // Skeleton loading cho lần đầu
  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <View key={i} style={styles.cardWrapper}>
          <SkeletonProductCard />
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tất cả món ngon</Text>
        <HeaderCartButton />
      </View>

      {/* Danh sách sản phẩm với Infinite Scroll */}
      {loading ? (
        renderSkeletons()
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) => `${item.id || item.productId}-${index}`}
          numColumns={2} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper} 
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FF7622"]} />
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
               <ProductCard item={item} />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="fast-food-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>Chưa có món ăn nào.</Text>
            </View>
          }
          // 📜 Infinite Scroll props
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA", 
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 15,
    backgroundColor: "#F8F9FA",
    zIndex: 10
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181C2E",
  },
  backButton: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  filterBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF0E3", 
    alignItems: "center", justifyContent: "center"
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 120, // Tăng padding để không bị tab bar che
  },
  columnWrapper: {
    justifyContent: "space-between", 
    marginBottom: 16, 
  },
  cardWrapper: {
    width: "48%", 
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    marginTop: 10,
    color: "#888",
    fontSize: 16,
  },
  // 📜 Infinite Scroll styles
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 10,
  },
  loadingMoreText: {
    color: "#888",
    fontSize: 14,
  },
  skeletonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
});