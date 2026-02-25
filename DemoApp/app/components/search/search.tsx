import { Ionicons } from "@expo/vector-icons"; // Chỉ cần import Ionicons
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
} from "react-native";
// Import API
import { GET_PAGE, getProductImageUrl } from "../../../APIService";
// Import Context để lấy số lượng giỏ hàng (nếu có)
import { useCart } from "../../components/cart/CartContext";
import HeaderCartButton from "../../components/cart/HeaderCartButton";

const RECENT_KEYWORDS = ["Burger", "Pizza", "Coca", "Sandwich"];

function removeVietnameseTones(str: string) {
    if (!str) return "";
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");
    str = str.replace(/đ/g,"d");
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return str.toLowerCase().trim();
}

export default function SearchScreen() {
  const router = useRouter();
  
  // Lấy số lượng từ giỏ hàng
  let cartCount = 0;
  try {
     const { state } = useCart();
     cartCount = state.items.length;
  } catch (e) { cartCount = 0; }

  const [keyword, setKeyword] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
        try {
            const response = await GET_PAGE("public/products", 0, 100);
            const data = response.data.content || response.data || [];
            setAllProducts(data);
        } catch (e) { console.log("Lỗi tải dữ liệu nền:", e); }
    };
    fetchAllData();
  }, []);

  const handleType = (text: string) => {
      setKeyword(text);
      setHasSearched(false);
      if (text.trim().length > 0) {
          setIsTyping(true);
          const normalizedText = removeVietnameseTones(text);
          const guesses = allProducts.filter((item: any) => {
              const name = removeVietnameseTones(item.productName);
              return name.includes(normalizedText);
          }).slice(0, 5);
          setSuggestions(guesses);
      } else {
          setIsTyping(false);
          setSuggestions([]);
      }
  };

  const performSearch = (text: string) => {
    if (!text.trim()) return;
    setKeyword(text);
    setIsTyping(false);
    Keyboard.dismiss(); 
    setLoading(true);
    setHasSearched(true);

    setTimeout(() => {
        const normalizedKeyword = removeVietnameseTones(text);
        const filtered = allProducts.filter((item: any) => {
            const name = removeVietnameseTones(item.productName);
            const category = removeVietnameseTones(item.category?.categoryName);
            const desc = removeVietnameseTones(item.description);
            return name.includes(normalizedKeyword) || category.includes(normalizedKeyword) || desc.includes(normalizedKeyword);
        });
        setResults(filtered);
        setLoading(false);
    }, 300);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 18, paddingBottom: 0 }}>
        
        {/* ================= HEADER ================= */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Tìm kiếm</Text>

          {/* [ĐÃ SỬA] Dùng Ionicons cart-outline để giống hình mẫu */}
          <HeaderCartButton />
        </View>

        {/* INPUT TÌM KIẾM */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            placeholder="Tìm Pizza, Burger, ..."
            value={keyword}
            onChangeText={handleType}
            onSubmitEditing={() => performSearch(keyword)} 
            returnKeyType="search"
            style={styles.input}
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => { setKeyword(""); setIsTyping(false); setHasSearched(false); setResults([]); }}>
              <Ionicons name="close-circle" size={18} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* GỢI Ý THÔNG MINH */}
      {isTyping && suggestions.length > 0 && (
          <View style={styles.suggestionBox}>
              <Text style={styles.suggestionTitle}>Gợi ý nhanh</Text>
              {suggestions.map((item) => (
                  <TouchableOpacity 
                    key={item.productId} 
                    style={styles.suggestionItem}
                    onPress={() => performSearch(item.productName)}
                  >
                      <Ionicons name="search-outline" size={16} color="#aaa" style={{ marginRight: 10 }} />
                      <Text style={{ flex: 1, fontSize: 14, color: '#333' }}>{item.productName}</Text>
                  </TouchableOpacity>
              ))}
          </View>
      )}

      <ScrollView style={{ flex: 1, paddingHorizontal: 18 }} keyboardShouldPersistTaps="handled">
        {/* TỪ KHÓA PHỔ BIẾN */}
        {!hasSearched && !isTyping && (
          <>
            <Text style={{ fontWeight: "700", marginBottom: 10, fontSize: 16 }}>Từ khóa gần đây</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {RECENT_KEYWORDS.map((k) => (
                <TouchableOpacity
                  key={k}
                  onPress={() => performSearch(k)}
                  style={styles.tag}
                >
                  <Text style={{ color: '#555' }}>{k}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* KẾT QUẢ TÌM KIẾM */}
        {loading ? (
           <ActivityIndicator size="large" color="#FF7A00" style={{ marginTop: 20 }} />
        ) : (
           <View>
              {hasSearched && (
                  <Text style={{ fontWeight: "700", marginVertical: 14, fontSize: 16 }}>
                     Tìm thấy {results.length} kết quả
                  </Text>
              )}

              {results.map((p) => (
                <TouchableOpacity
                  key={p.productId}
                  onPress={() => router.push({ pathname: "/components/product/[id]", params: { id: p.productId } })}
                  style={styles.resultCard}
                >
                  <Image source={{ uri: getProductImageUrl(p.image) }} style={styles.resultImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{p.productName}</Text>
                    <Text style={styles.shopName} numberOfLines={1}>
                      {p.category?.categoryName || "Cửa hàng"} • {p.description || "Ngon"}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                        <Text style={styles.price}>
                        {Number(p.specialPrice).toLocaleString("vi-VN")} đ
                        </Text>
                        <TouchableOpacity style={styles.miniAddBtn}>
                            <Ionicons name="add" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {hasSearched && results.length === 0 && (
                 <View style={{ alignItems: 'center', marginTop: 50 }}>
                     <Ionicons name="search-outline" size={60} color="#ccc" />
                     <Text style={{ color: "#999", marginTop: 10 }}>Không tìm thấy sản phẩm nào.</Text>
                 </View>
              )}
           </View>
        )}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 18, marginTop: 30, justifyContent: 'space-between' },
    iconBtn: { 
        width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1F1F1", 
        alignItems: "center", justifyContent: "center" 
    },
    headerTitle: { fontSize: 18, fontWeight: "700", flex: 1, textAlign: 'center' },
    badge: {
        position: "absolute", top: -2, right: -2, width: 16, height: 16,
        borderRadius: 8, backgroundColor: "#FF7A00", alignItems: "center", justifyContent: "center",
        borderWidth: 1.5, borderColor: '#fff'
    },
    badgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },

    searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#F6F6F6", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 },
    input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },
    
    tag: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: "#EBEBEB", marginRight: 10, marginBottom: 10 },
    
    resultCard: { flexDirection: "row", marginBottom: 16, backgroundColor: "#fff", padding: 12, borderRadius: 20, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 10, elevation: 1 },
    resultImage: { width: 80, height: 80, borderRadius: 16, marginRight: 14, backgroundColor: '#f0f0f0' },
    productName: { fontWeight: "700", fontSize: 16, marginBottom: 4, color: '#181C2E' },
    shopName: { color: "#A0A5BA", fontSize: 13 },
    price: { color: "#181C2E", fontWeight: "700", fontSize: 16 },
    miniAddBtn: { marginLeft: 'auto', backgroundColor: '#FF7A00', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },

    suggestionBox: {
        position: 'absolute', top: 140, left: 18, right: 18, 
        backgroundColor: '#fff', borderRadius: 16, 
        zIndex: 999, elevation: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 20,
        padding: 10
    },
    suggestionTitle: { fontSize: 12, color: '#aaa', marginBottom: 8, marginLeft: 8, fontWeight: '600' },
    suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' }
});