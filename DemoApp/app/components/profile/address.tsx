import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Alert 
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GET_USER_ADDRESSES, DELETE_ADDRESS } from "../../../APIService"; 

export default function AddressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 KIỂM TRA CHẾ ĐỘ CHỌN: Đảm bảo mode là 'select' từ trang trước truyền sang
  const isSelecting = params.mode === "select";

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const email = await AsyncStorage.getItem("saved-email");
      if (email) {
        const response = await GET_USER_ADDRESSES(email);
        setAddresses(response.data); 
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách địa chỉ:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 HÀM XỬ LÝ CHỌN ĐỊA CHỈ: Sửa lỗi bấm chọn và quay về đúng trang Giỏ Hàng
  const handleAddressPress = (item: any) => {
    if (isSelecting) {
      // Ghép chuỗi địa chỉ đầy đủ để hiển thị ngay bên phía trang nhận
      const fullAddressString = `${item.buildingName}, ${item.street}, ${item.city}`;
      
      // 🔥 QUAY LẠI TRANG GIỎ HÀNG (Sửa từ /payment thành /cart theo ý bạn)
      // Điều này giúp cập nhật địa chỉ ở giỏ hàng trước khi người dùng bấm thanh toán
      router.push({
        pathname: "/components/cart/cart", 
        params: { 
          addressId: item.addressId, // Truyền ID địa chỉ vừa chọn
          fullAddress: fullAddressString, // Truyền chuỗi địa chỉ để hiển thị luôn
          // Trả lại các params cũ để giữ trạng thái giỏ hàng
          cartId: params.cartId,
          totalAmount: params.totalAmount,
          selectedProductIds: params.selectedProductIds 
        }
      });
    } else {
      // Nếu không ở chế độ chọn, bấm vào thì cho phép sửa nhanh
      router.push({ pathname: "/components/profile/add-address", params: item });
    }
  };

  const handleDelete = (addressId: number) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa địa chỉ này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const email = await AsyncStorage.getItem("saved-email");
            if (email) {
              await DELETE_ADDRESS(email, addressId);
              fetchAddresses(); 
            }
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa địa chỉ lúc này.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.card, 
        // Highlight viền cam nếu địa chỉ này đang khớp với ID đang chọn
        params.addressId === String(item.addressId) && { borderColor: '#ff8a34', borderWidth: 1.5 }
      ]} 
      activeOpacity={0.7}
      onPress={() => handleAddressPress(item)} 
    >
      <View style={item.label === "work" ? styles.iconBoxWork : styles.iconBoxHome}>
        <Ionicons 
          name={item.label === "work" ? "briefcase-outline" : "home-outline"} 
          size={22} 
          color={item.label === "work" ? "#b871e5" : "#6c9dfd"} 
        />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.addrTitle}>{item.label?.toUpperCase() || "KHÁC"}</Text>
          {isSelecting && (
            <View style={styles.selectTag}>
              <Text style={styles.selectTagText}>CHỌN</Text>
            </View>
          )}
        </View>
        <Text style={styles.addrText} numberOfLines={2}>
          {`${item.buildingName}, ${item.street}, ${item.city}`}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          onPress={() => router.push({ pathname: "/components/profile/add-address", params: item })}
          style={styles.iconCircle}
        >
          <Feather name="edit-3" size={16} color="#6c9dfd" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.iconCircle, { marginLeft: 12 }]} 
          onPress={() => handleDelete(item.addressId)}
        >
          <Feather name="trash-2" size={16} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={22} color="#444" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isSelecting ? "Chọn địa chỉ giao hàng" : "Địa chỉ của tôi"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ff8a34" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.addressId.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="map-pin" size={50} color="#ccc" />
              <Text style={styles.emptyText}>Bạn chưa có địa chỉ nào được lưu.</Text>
            </View>
          }
        />
      )}

      {/* NÚT THÊM ĐỊA CHỈ MỚI */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push("/components/profile/add-address")}
      >
        <Text style={styles.addBtnText}>THÊM ĐỊA CHỈ MỚI</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f5f7fb", padding: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20, marginTop: 40 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#eef1f5", justifyContent: "center", alignItems: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700", color: "#222" },
  card: { backgroundColor: "#fff", padding: 16, marginTop: 12, borderRadius: 16, flexDirection: "row", alignItems: "center", elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  iconBoxHome: { backgroundColor: "#eaf1ff", padding: 10, borderRadius: 12 },
  iconBoxWork: { backgroundColor: "#f5e8ff", padding: 10, borderRadius: 12 },
  addrTitle: { fontSize: 12, color: "#7d8a9a", fontWeight: "700", letterSpacing: 0.5 },
  addrText: { marginTop: 4, color: "#333", fontSize: 14, lineHeight: 20 },
  actionRow: { flexDirection: "row", alignItems: "center", marginLeft: 10 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center' },
  emptyBox: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 10, color: "#888", fontSize: 14 },
  addBtn: { position: "absolute", bottom: 30, left: 16, right: 16, backgroundColor: "#ff8a34", paddingVertical: 16, borderRadius: 14, elevation: 5 },
  addBtnText: { textAlign: "center", color: "#fff", fontSize: 16, fontWeight: "700" },
  selectTag: { backgroundColor: '#ff8a34', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  selectTagText: { color: '#fff', fontSize: 9, fontWeight: 'bold' }
});