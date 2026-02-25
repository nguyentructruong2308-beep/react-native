import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Platform,
  StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/product/ProductCard";
import { getProductImageUrl } from "../../APIService";
import HeaderCartButton from "../components/cart/HeaderCartButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FavouriteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { wishlist } = useWishlist();

  // Chuyển đổi dữ liệu từ storage sang format cho ProductCard
  const products = wishlist.map(item => ({
    ...item,
    productId: item.productId,
    productName: item.productName,
    specialPrice: item.specialPrice,
    image: item.image
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Món ăn yêu thích</Text>
        <HeaderCartButton />
      </View>

      {/* Danh sách yêu thích */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.productId.toString()}
        numColumns={2} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper} 
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
             <ProductCard item={item} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="heart-dislike-outline" size={60} color="#FF7622" />
              </View>
              <Text style={styles.emptyTitle}>Danh sách trống</Text>
              <Text style={styles.emptyText}>Hãy thêm món bạn yêu thích vào đây để xem lại nhé!</Text>
              
              <TouchableOpacity 
                style={styles.exploreBtn}
                onPress={() => router.push("/(home)/menu")}
              >
                <Text style={styles.exploreBtnText}>Khám phá món ngon</Text>
              </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA", 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 15,
    backgroundColor: "#F8F9FA",
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
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#FFEFE5',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20
  },
  emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#181C2E',
      marginBottom: 10
  },
  emptyText: {
    color: "#888",
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30
  },
  exploreBtn: {
      backgroundColor: '#FF7622',
      paddingHorizontal: 30,
      paddingVertical: 14,
      borderRadius: 14,
      shadowColor: "#FF7622",
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5
  },
  exploreBtnText: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 16
  }
});
