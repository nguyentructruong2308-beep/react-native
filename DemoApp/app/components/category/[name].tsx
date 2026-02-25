import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GET_PAGE, getProductImageUrl } from "../../../APIService";

export default function CategoryList() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Lấy dữ liệu từ màn hình trước
  const name = String(params.name ?? "Danh mục");
  const categoryId = params.id; 

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryId) {
      fetchProductsByCategory();
    }
  }, [categoryId]);

  const fetchProductsByCategory = async () => {
    setLoading(true);
    try {
      console.log(`Đang tải sản phẩm cho danh mục ID: ${categoryId} (${name})`);
      
      // 1. Gọi API lấy sản phẩm
      // Lấy 100 sản phẩm để đảm bảo đủ dữ liệu lọc
      const response = await GET_PAGE("public/products", 0, 100, String(categoryId));
      
      const allData = response.data.content || response.data || [];

      // 2. [FIX QUAN TRỌNG] Tự lọc lại ở phía App
      // Chỉ lấy sản phẩm nào có categoryId trùng với danh mục đang chọn
      const filteredData = allData.filter((p: any) => {
          // Kiểm tra an toàn: p.category có tồn tại không?
          if (p.category && p.category.categoryId) {
              return String(p.category.categoryId) === String(categoryId);
          }
          return false;
      });

      console.log(`Server trả về ${allData.length} món, sau khi lọc còn ${filteredData.length} món.`);
      setProducts(filteredData);

    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
        {/* ================= HEADER ================= */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 40, 
            marginBottom: 20
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} />
          </TouchableOpacity>

          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: "#f7f7f7",
            }}
          >
            <Text style={{ fontWeight: "600" }}>
              {name}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 14 }}>
            {/* [ĐÃ SỬA LỖI CHÍNH TẢ] seach -> search */}
            <TouchableOpacity onPress={() => router.push("/components/search/search")}>
              <Ionicons name="search" size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= LIST SẢN PHẨM ================= */}
        <Text style={{ fontSize: 20, fontWeight: "700" }}>
          Món ngon {name}
        </Text>

        {loading ? (
            <ActivityIndicator size="large" color="#FF7A00" style={{ marginTop: 50 }} />
        ) : (
            <View
            style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                marginTop: 14,
            }}
            >
            {products.length > 0 ? (
                products.map((item) => (
                    <TouchableOpacity
                    key={item.productId}
                    onPress={() =>
                        router.push({
                        pathname: "/components/product/[id]",
                        params: { id: item.productId },
                        })
                    }
                    style={{
                        width: "48%",
                        backgroundColor: "#fff",
                        padding: 12,
                        borderRadius: 20,
                        marginBottom: 16,
                        shadowColor: "#000",
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                    }}
                    >
                    <Image
                        source={{ uri: getProductImageUrl(item.image) }}
                        style={{
                        width: "100%",
                        height: 120,
                        borderRadius: 12,
                        resizeMode: 'cover'
                        }}
                    />

                    <Text
                        numberOfLines={1}
                        style={{
                        fontSize: 16,
                        fontWeight: "700",
                        marginTop: 10,
                        }}
                    >
                        {item.productName}
                    </Text>

                    <Text style={{ color: "#777", fontSize: 12 }}>
                        {item.category?.categoryName || "Cửa hàng"}
                    </Text>

                    <View
                        style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 10,
                        }}
                    >
                        {/* GIÁ VND */}
                        <Text style={{ fontSize: 16, fontWeight: "700", color: "#000" }}>
                        {Number(item.specialPrice).toLocaleString("vi-VN")} đ
                        </Text>

                        <View
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            backgroundColor: "#FF7A00",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                        >
                        <Text style={{ color: "#fff", fontWeight: "900" }}>+</Text>
                        </View>
                    </View>
                    </TouchableOpacity>
                ))
            ) : (
                <View style={{ width: '100%', alignItems: 'center', marginTop: 50 }}>
                    <Text style={{ color: '#777', fontSize: 16 }}>Không tìm thấy món nào thuộc {name}.</Text>
                </View>
            )}
            </View>
        )}
      </ScrollView>
    </>
  );
}