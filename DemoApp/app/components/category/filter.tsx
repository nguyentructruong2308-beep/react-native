import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Định nghĩa kiểu dữ liệu cho bộ lọc
export type FilterValue = {
  offer: string | null;
  onlinePayment: boolean;
  time: string;
  price: string;
  rating: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (value: FilterValue) => void;
};

export default function FilterModal({ visible, onClose, onApply }: Props) {
  // State quản lý giá trị
  const [offer, setOffer] = useState<string | null>("Delivery");
  const [onlinePayment, setOnlinePayment] = useState(false);
  const [time, setTime] = useState("10-15");
  const [price, setPrice] = useState("$$");
  const [rating, setRating] = useState(4);

  // --- COMPONENT: CHIP (Nút bấm hình viên thuốc) ---
  const RenderChip = ({
    label,
    active,
    onPress,
    style,
    textStyle,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
    style?: any;
    textStyle?: any;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive, style]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive, textStyle]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // --- COMPONENT: CIRCLE BUTTON (Nút hình tròn cho Pricing/Rating) ---
  const RenderCircleBtn = ({
    active,
    onPress,
    children,
    isRating = false, // Biến cờ để xử lý style riêng cho Rating
  }: {
    active: boolean;
    onPress: () => void;
    children: React.ReactNode;
    isRating?: boolean;
  }) => {
    // Với Rating, style active chỉ đổi màu icon chứ không đổi màu nền (theo ảnh mẫu)
    // Với Pricing, style active đổi màu nền sang cam
    const containerStyle = isRating 
        ? styles.circleBtn // Rating luôn nền trắng
        : [styles.circleBtn, active && styles.circleBtnActive]; // Pricing đổi nền

    return (
      <TouchableOpacity onPress={onPress} style={containerStyle}>
        {children}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter your search</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#181C2E" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            
            {/* 1. OFFERS SECTION */}
            <Text style={styles.sectionLabel}>OFFERS</Text>
            <View style={styles.chipRow}>
              {["Delivery", "Pick Up", "Offer"].map((item) => (
                <RenderChip
                  key={item}
                  label={item}
                  active={offer === item}
                  onPress={() => setOffer(item)}
                />
              ))}
            </View>
            
            {/* Nút Online Payment riêng biệt */}
            <RenderChip
               label="Online payment available"
               active={onlinePayment}
               onPress={() => setOnlinePayment(!onlinePayment)}
               style={{ alignSelf: 'flex-start', marginBottom: 20 }}
            />

            {/* 2. DELIVER TIME SECTION */}
            <Text style={styles.sectionLabel}>DELIVER TIME</Text>
            <View style={styles.chipRow}>
              {["10-15 min", "20 min", "30 min"].map((t) => {
                 const rawVal = t.split(" ")[0]; // Lấy giá trị số để so sánh state
                 return (
                  <RenderChip
                    key={t}
                    label={t}
                    active={time === rawVal}
                    onPress={() => setTime(rawVal)}
                  />
                );
              })}
            </View>

            {/* 3. PRICING SECTION */}
            <Text style={styles.sectionLabel}>PRICING</Text>
            <View style={styles.circleRow}>
              {["$", "$$", "$$$"].map((p) => (
                <RenderCircleBtn
                  key={p}
                  active={price === p}
                  onPress={() => setPrice(p)}
                >
                  <Text style={[styles.priceText, price === p && styles.priceTextActive]}>
                    {p}
                  </Text>
                </RenderCircleBtn>
              ))}
            </View>

            {/* 4. RATING SECTION */}
            <Text style={styles.sectionLabel}>RATING</Text>
            <View style={styles.circleRow}>
              {[1, 2, 3, 4, 5].map((item) => (
                <RenderCircleBtn
                  key={item}
                  active={rating >= item} // Logic: sao sáng nếu rating >= item
                  onPress={() => setRating(item)}
                  isRating={true}
                >
                   <Ionicons 
                      name="star" 
                      size={18} 
                      // Icon màu cam nếu được chọn, màu xám nhạt nếu không
                      color={rating >= item ? "#FF7622" : "#DCDCDC"} 
                   />
                </RenderCircleBtn>
              ))}
            </View>
            
            <View style={{ height: 20 }} />
          </ScrollView>

          {/* BUTTON FILTER */}
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => {
              onApply({ offer, onlinePayment, time, price, rating });
              onClose();
            }}
          >
            <Text style={styles.applyBtnText}>FILTER</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)", // Màu nền tối mờ đậm hơn chút cho nổi bật modal
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "90%",
  },
  
  // Header Style
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181C2E",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ECF0F4", // Màu xám tròn nền nút đóng
    justifyContent: "center",
    alignItems: "center",
  },

  // Labels (OFFERS, PRICING...)
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#32343E",
    marginTop: 10,
    marginBottom: 15,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  
  // Chip Styles
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 15,
  },
  chip: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EBEBEB", // Viền xám nhạt
  },
  chipActive: {
    backgroundColor: "#FF7622", // Màu cam active
    borderColor: "#FF7622",
  },
  chipText: {
    fontSize: 14,
    color: "#606060",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Circle Button Styles
  circleRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 25,
  },
  circleBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EBEBEB",
    justifyContent: "center",
    alignItems: "center",
    // Shadow nhẹ giống ảnh
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  circleBtnActive: {
    backgroundColor: "#FF7622",
    borderColor: "#FF7622",
  },
  
  // Text inside Pricing Circle
  priceText: {
      fontSize: 15,
      color: "#606060",
      fontWeight: '500',
  },
  priceTextActive: {
      color: "#FFF",
      fontWeight: '700',
  },

  // Filter Button Bottom
  applyBtn: {
    backgroundColor: "#FF7622",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#FF7622",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  applyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});