import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons"; 
import { useRouter, useLocalSearchParams } from "expo-router"; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from "../../components/cart/CartContext";
import { 
  GET_USER_BY_EMAIL, 
  PUT_UPDATE_QUANTITY, 
  DELETE_ID,
  DELETE_MULTIPLE_PRODUCTS,
  GET_USER_ADDRESSES 
} from "../../../APIService";

export default function Cart() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  
  const { state, updateQuantity, removeFromCart } = useCart();
  const items = state.items || [];
  
  const [address, setAddress] = useState("Đang tải địa chỉ...");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null); 
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState<number | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(false); 

  useEffect(() => {
    loadData();
  }, []);

  // 🔥 ĐỒNG BỘ ĐỊA CHỈ: Cập nhật giao diện ngay khi chọn từ AddressScreen quay lại
  // Chúng ta kiểm tra cả key 'addressId' và 'selectedAddressId' để khớp với code của "con kế bên"
  useEffect(() => {
    const newId = params.addressId || params.selectedAddressId;
    const newAddr = params.fullAddress || params.selectedAddressStr;

    if (newId) {
      setSelectedAddressId(Number(newId));
      if (newAddr) {
        setAddress(newAddr as string);
      }
    }
  }, [params.addressId, params.selectedAddressId, params.fullAddress, params.selectedAddressStr]);

  const loadData = async () => {
    try {
      const email = await AsyncStorage.getItem("saved-email");
      if (email) {
        try {
            const userRes = await GET_USER_BY_EMAIL(email); 
            const userData = userRes.data;
            
            if (userData.cart && userData.cart.cartId) {
                setCartId(userData.cart.cartId);
            }

            // 🔥 FIX QUAN TRỌNG: CHỈ lấy địa chỉ từ Profile nếu params TRỐNG
            // Điều này ngăn việc địa chỉ mặc định "đè" lên địa chỉ vừa chọn
            if (!params.addressId && !params.selectedAddressId) {
                let finalAddress = "Chưa cập nhật địa chỉ";
                const addr = userData.address; 
                
                if (addr) {
                    if (typeof addr === 'string') {
                        finalAddress = addr;
                    } else if (typeof addr === 'object') {
                        const parts = [
                            addr.buildingName, addr.street, addr.city, addr.state, addr.country
                        ].filter(part => part && String(part).trim() !== "");
                        if (parts.length > 0) finalAddress = parts.join(", ");
                        setSelectedAddressId(addr.addressId);
                    } else if (Array.isArray(addr) && addr.length > 0) {
                        const firstAddr = addr[0];
                        const parts = [
                            firstAddr.buildingName, firstAddr.street, firstAddr.city
                        ].filter(part => part && String(part).trim() !== "");
                        finalAddress = parts.join(", ");
                        setSelectedAddressId(firstAddr.addressId);
                    }
                }
                setAddress(finalAddress);
            }

        } catch (err) {
            console.log("Lỗi lấy Profile:", err);
            setAddress("Không tải được thông tin");
        }
      } else {
          if (Platform.OS !== 'web') {
              Alert.alert("Chưa đăng nhập", "Vui lòng đăng nhập để xem giỏ hàng.");
          }
      }
    } catch (error) {
      console.error("Lỗi tải trang giỏ hàng:", error);
    } finally {
      setLoading(false);
    }
  }

  const toggleSelectItem = (id: any) => {
    const numericId = Number(id);
    if (selectedIds.includes(numericId)) {
      setSelectedIds(selectedIds.filter(item => item !== numericId));
    } else {
      setSelectedIds([...selectedIds, numericId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      const allIds = items.map(item => Number(item.id));
      setSelectedIds(allIds);
    }
  };

  const getSelectedTotal = () => {
    return items
      .filter(item => selectedIds.includes(Number(item.id)))
      .reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  };

  const handleDeleteItem = async (productId: any) => {
      const confirmDelete = async () => {
          try {
              if (cartId) {
                  await DELETE_ID(`public/carts/${cartId}/product`, productId);
              }
              removeFromCart(productId);
              setSelectedIds(prev => prev.filter(id => id !== Number(productId)));
          } catch (e) {
              console.error(e);
              if (Platform.OS === 'web') alert("Lỗi: Không xóa được sản phẩm.");
              else Alert.alert("Lỗi", "Không xóa được sản phẩm.");
          }
      };

      if (Platform.OS === 'web') {
          if (window.confirm("Bạn muốn xóa sản phẩm này?")) confirmDelete();
      } else {
          Alert.alert("Xóa sản phẩm", "Bạn có chắc muốn xóa?", [
              { text: "Hủy", style: "cancel" },
              { text: "Xóa", style: "destructive", onPress: confirmDelete }
          ]);
      }
  }

  const handleDeleteMultiple = async () => {
    if (selectedIds.length === 0) {
      if (Platform.OS === 'web') alert("Vui lòng chọn sản phẩm cần xóa.");
      else Alert.alert("Thông báo", "Vui lòng chọn sản phẩm cần xóa.");
      return;
    }

    const confirmDeleteMultiple = async () => {
      try {
        if (cartId) {
          await DELETE_MULTIPLE_PRODUCTS(cartId, selectedIds);
        }
        selectedIds.forEach(id => removeFromCart(id));
        setSelectedIds([]); 
        setIsEditing(false); 
        if (Platform.OS === 'web') alert("Đã xóa các sản phẩm được chọn.");
        else Alert.alert("Thành công", "Đã xóa các sản phẩm được chọn.");
      } catch (e) {
        console.error("Lỗi xóa hàng loạt:", e);
      }
    };

    if (Platform.OS === 'web') {
        if (window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} món đã chọn?`)) confirmDeleteMultiple();
    } else {
        Alert.alert("Xác nhận", `Xóa ${selectedIds.length} sản phẩm đã chọn?`, [
            { text: "Hủy", style: "cancel" },
            { text: "Xóa", style: "destructive", onPress: confirmDeleteMultiple }
        ]);
    }
  }

  const handleQuantityChange = async (productId: string | number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) {
        handleDeleteItem(productId);
        return;
    }
    if (!cartId) {
        updateQuantity(productId, newQty);
        return;
    }
    try {
        await PUT_UPDATE_QUANTITY(cartId, productId, newQty);
        updateQuantity(productId, newQty);
    } catch (error) {
        console.error("Lỗi update:", error);
    }
  };

  const handlePlaceOrder = () => {
    if (!cartId) {
        loadData(); 
        return;
    }
    if (selectedIds.length === 0) {
        alert("Vui lòng chọn ít nhất 1 món để đặt hàng!");
        return;
    }
    if (!selectedAddressId) {
        alert("Vui lòng cập nhật địa chỉ giao hàng!");
        return;
    }

    // 🔥 TRUYỀN THÊM addressId VÀ fullAddress SANG TRANG PAYMENT
    router.push({
        pathname: "/components/payment/payment",
        params: { 
            cartId: cartId, 
            addressId: selectedAddressId, 
            fullAddress: address, // <--- Cực kỳ quan trọng để trang Payment hiện đúng
            totalAmount: getSelectedTotal(),
            selectedProductIds: JSON.stringify(selectedIds) 
        }
    });
  };

  const goToSelectAddress = () => {
    router.push({
      pathname: "/components/profile/address",
      params: { 
        mode: "select",
        cartId: cartId,
        totalAmount: getSelectedTotal(),
        selectedProductIds: JSON.stringify(selectedIds),
        currentId: selectedAddressId // Truyền ID hiện tại sang để highlight
      }
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng ({items.length})</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Text style={[styles.editBtn, isEditing && {color: '#FF4B4B'}]}>
                {isEditing ? "XONG" : "SỬA"}
            </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF7622" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {items.length > 0 ? (
                items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                    
                    <TouchableOpacity 
                      onPress={() => toggleSelectItem(item.id)}
                      style={styles.checkboxContainer}
                    >
                      <Ionicons 
                        name={selectedIds.includes(Number(item.id)) ? "checkbox" : "square-outline"} 
                        size={22} 
                        color={selectedIds.includes(Number(item.id)) ? "#FF7622" : "#5E6172"} 
                      />
                    </TouchableOpacity>

                    <Image 
                        source={typeof item.image === 'string' ? { uri: item.image } : item.image} 
                        style={styles.itemImage} 
                    />
                    
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                        <Text style={styles.itemSize}>Size: {item.size || "M"}</Text>
                        <Text style={styles.itemPrice}>
                             {Number(item.price).toLocaleString("vi-VN")} ₫
                        </Text>
                    </View>

                    <View style={styles.actionsColumn}>
                         <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.deleteBtn}>
                             <Feather name="x" size={16} color="#FF4B4B" />
                         </TouchableOpacity>

                         <View style={styles.qtyContainer}>
                            <TouchableOpacity 
                                onPress={() => handleQuantityChange(item.id, item.quantity, -1)}
                                style={styles.qtyButton}
                            >
                                <Feather name="minus" size={12} color="#FFF" />
                            </TouchableOpacity>
                            
                            <Text style={styles.qtyText}>{item.quantity}</Text>
                            
                            <TouchableOpacity 
                                onPress={() => handleQuantityChange(item.id, item.quantity, 1)}
                                style={styles.qtyButton}
                            >
                                <Feather name="plus" size={12} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                ))
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={80} color="#3A3D52" />
                    <Text style={styles.emptyText}>Giỏ hàng trống trơn</Text>
                    <Text style={styles.emptySub}>Hãy thêm món ngon vào nhé!</Text>
                </View>
            )}
            <View style={{height: 120}} /> 
        </ScrollView>
      )}

      {items.length > 0 && (
          <View style={styles.bottomSheet}>
            <View style={styles.selectAllRow}>
               <TouchableOpacity style={styles.selectAllBtn} onPress={toggleSelectAll}>
                  <Ionicons 
                    name={selectedIds.length === items.length ? "checkbox" : "square-outline"} 
                    size={20} 
                    color={selectedIds.length === items.length ? "#FF7622" : "#A0A5BA"} 
                  />
                  <Text style={styles.selectAllText}>Chọn tất cả ({items.length})</Text>
               </TouchableOpacity>
            </View>

            {!isEditing ? (
              <>
                <View style={styles.addressRow}>
                    <View style={{flex: 1}}>
                        <Text style={styles.addressLabel}>ĐỊA CHỈ GIAO HÀNG</Text>
                        <View style={styles.addressBox}>
                            <Text style={styles.addressText} numberOfLines={1}>{address}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={goToSelectAddress}>
                        <Text style={styles.editAddress}>SỬA</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.totalRow}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={styles.totalLabel}>TỔNG:</Text>
                        <Text style={styles.totalAmount}>
                            {getSelectedTotal().toLocaleString("vi-VN")} ₫
                        </Text>
                    </View>
                    <TouchableOpacity>
                        <Text style={styles.breakdown}>Chi tiết ({selectedIds.length} món) {'>'}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={[styles.placeOrderBtn, selectedIds.length === 0 && {backgroundColor: '#555'}]} 
                  onPress={handlePlaceOrder}
                  disabled={selectedIds.length === 0}
                >
                    <Text style={styles.placeOrderText}>ĐẶT HÀNG ({selectedIds.length})</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={[styles.placeOrderBtn, {backgroundColor: '#FF4B4B'}]} 
                onPress={handleDeleteMultiple}
                disabled={selectedIds.length === 0}
              >
                  <Text style={styles.placeOrderText}>XÓA CÁC MỤC ĐÃ CHỌN ({selectedIds.length})</Text>
              </TouchableOpacity>
            )}
          </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121223" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", 
    paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 20, marginBottom: 20
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#212035", 
    alignItems: "center", justifyContent: "center"
  },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "600", letterSpacing: 0.5 },
  editBtn: { color: "#FF7622", fontWeight: "700", fontSize: 14, textDecorationLine: "underline" },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 20 },
  itemCard: {
    flexDirection: "row", backgroundColor: "#1E1D2E", padding: 12, borderRadius: 16, marginBottom: 16, alignItems: 'center'
  },
  checkboxContainer: { paddingRight: 10 },
  itemImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: "#2A2C3E" },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
  itemName: { color: "#FFF", fontSize: 14, fontWeight: "600", marginBottom: 4, lineHeight: 18 },
  itemSize: { color: "#8E94A4", fontSize: 11, marginBottom: 4 },
  itemPrice: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  actionsColumn: { justifyContent: 'space-between', alignItems: 'flex-end', height: 70 },
  deleteBtn: { padding: 4, backgroundColor: 'rgba(255, 75, 75, 0.1)', borderRadius: 6 },
  qtyContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#2A2C3E", borderRadius: 20, paddingHorizontal: 4, paddingVertical: 2
  },
  qtyButton: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#404455", alignItems: "center", justifyContent: "center" },
  qtyText: { color: "#FFF", fontSize: 13, fontWeight: "600", marginHorizontal: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: "#FFF", fontSize: 20, fontWeight: "bold", marginTop: 20 },
  emptySub: { color: "#888", fontSize: 14, marginTop: 8 },
  bottomSheet: {
      position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: "#FFF", 
      borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 24, paddingTop: 15,
      paddingBottom: Platform.OS === 'ios' ? 40 : 20, shadowColor: "#000", shadowOffset: {width: 0, height: -5},
      shadowOpacity: 0.1, shadowRadius: 10, elevation: 20
  },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F5FA', paddingBottom: 10 },
  selectAllBtn: { flexDirection: 'row', alignItems: 'center' },
  selectAllText: { marginLeft: 8, color: '#32343E', fontWeight: '500', fontSize: 14 },
  addressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 },
  addressLabel: { color: "#A0A5BA", fontSize: 11, fontWeight: "600", marginBottom: 4, letterSpacing: 0.5 },
  addressBox: { backgroundColor: "#F0F5FA", padding: 8, borderRadius: 8, marginRight: 15, flex: 1 },
  addressText: { color: "#32343E", fontSize: 13, fontWeight: "500" },
  editAddress: { color: "#FF7622", fontWeight: "700", fontSize: 12, marginTop: 20 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  totalLabel: { color: "#32343E", fontSize: 15, fontWeight: "500", marginRight: 10 },
  totalAmount: { color: "#181C2E", fontSize: 22, fontWeight: "800" },
  breakdown: { color: "#FF7622", fontSize: 13, fontWeight: "500" },
  placeOrderBtn: { backgroundColor: "#FF7622", height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", shadowColor: "#FF7622", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  placeOrderText: { color: "#FFF", fontSize: 15, fontWeight: "800", letterSpacing: 1 }
});