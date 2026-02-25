import React from "react";
import { TouchableOpacity, Text, View, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useWishlist } from "../../context/WishlistContext";

// Component ảnh động hỗ trợ Shared Element Transition
const AnimatedImage = Animated.createAnimatedComponent(Image) as any;

interface ProductCardProps {
  item: any;
  onAddPress?: (product: any) => void; // Truyền toàn bộ item để Home/Chat lấy ảnh làm hiệu ứng bay
}

export default function ProductCard({ item, onAddPress }: ProductCardProps) {
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  // Chuẩn hóa ID từ dữ liệu Server (productId hoặc id)
  const finalId = item.id || item.productId;

  const handlePress = () => {
    // Rung nhẹ khi chạm vào thẻ
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    router.push({
      pathname: "/components/product/[id]",
      params: { 
        id: finalId,
        name: item.name || item.productName, 
        price: item.price || item.specialPrice, 
        image: typeof item.image === 'string' ? item.image : item.image?.uri, 
        desc: item.desc || item.description
      },
    });
  };

  const handleToggleWishlist = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleWishlist({
      productId: finalId,
      productName: item.productName || item.name,
      specialPrice: item.specialPrice || item.price,
      image: typeof item.image === 'string' ? item.image : item.image?.uri
    });
  };

  const handleAddCart = (e: any) => {
    // Ngăn chặn nổi bọt sự kiện (không nhảy vào trang chi tiết khi bấm nút thêm)
    e.stopPropagation(); 
    
    if (onAddPress) {
      // Gọi hàm xử lý từ component cha (kèm theo dữ liệu món ăn)
      onAddPress(item); 
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.card}
      activeOpacity={0.85}
    >
      <TouchableOpacity style={styles.cardHeart} onPress={handleToggleWishlist}>
        <Ionicons 
            name={isInWishlist(Number(finalId)) ? "heart" : "heart-outline"} 
            size={20} 
            color={isInWishlist(Number(finalId)) ? "#FF4B2B" : "#FF7622"} 
        />
      </TouchableOpacity>
      {/* ẢNH SẢN PHẨM: Sẽ là điểm bắt đầu của hiệu ứng bay */}
      <AnimatedImage
        source={typeof item.image === 'string' ? { uri: item.image } : item.image}
        style={styles.image}
        resizeMode="cover"
        sharedTransitionTag={`product-image-${finalId}`} 
      />

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name || item.productName}
        </Text>
        <Text style={styles.shop} numberOfLines={1}>
          {item.shop || "Gourmet Kitchen"}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.price}>
            {Number(item.price || item.specialPrice).toLocaleString("vi-VN")} 
            <Text style={styles.currency}> đ</Text>
          </Text>
          
          {/* NÚT THÊM: Thiết kế nhỏ gọn, sang trọng hơn */}
          <TouchableOpacity 
            onPress={handleAddCart}
            style={styles.addButton}
            activeOpacity={0.7}
          >
            <LinearGradient 
                colors={['#FF7622', '#FF4B2B']} 
                style={styles.gradientAdd}
            >
                <Ionicons name="add" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: "#fff", 
    borderRadius: 22, 
    marginBottom: 12, 
    elevation: 6, 
    shadowColor: "#000", 
    shadowOpacity: 0.08, 
    shadowRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#F0F0F0'
  },
  image: { 
    width: "100%", 
    height: 125, // Cân đối lại tỷ lệ ảnh
    borderTopLeftRadius: 22, 
    borderTopRightRadius: 22 
  },
  content: { 
    padding: 10, // Giảm padding một chút để thanh thoát hơn
  },
  name: { 
    fontWeight: "700", 
    fontSize: 14, 
    color: '#181C2E' 
  },
  shop: { 
    color: "#A0A5BA", 
    fontSize: 11, 
    marginTop: 2 
  },
  footer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 10, 
    alignItems: "center" 
  },
  price: { 
    fontWeight: "800", 
    color: "#FF7622", 
    fontSize: 14 
  },
  currency: { 
    fontSize: 10, 
    fontWeight: '600',
    color: "#FF7622"
  },
  addButton: { 
    borderRadius: 10, // Squircle gọn gàng
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#FF7622",
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  gradientAdd: { 
    width: 30, // Kích thước 30x30 tinh tế hơn
    height: 30, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  cardHeart: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  }
});