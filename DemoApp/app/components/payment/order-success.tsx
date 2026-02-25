import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
// Import thư viện hiệu ứng
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
// MotiView đã được thay thế bằng View thường

const COLORS = {
  bg: "#101010",        
  primary: "#FF7A00",   
  text: "#FFFFFF",
  subText: "#8E8E93",
};

export default function OrderSuccess() {
  const router = useRouter();
  const animation = useRef<LottieView>(null);

  useEffect(() => {
    // 1. Rung kiểu "Thông báo thành công" (Tạo cảm giác sướng tay)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // 2. Chạy animation
    animation.current?.play();
  }, []);

  const handleNavigation = () => {
    // Rung nhẹ khi bấm nút
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(home)"); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        {/* 3. Hiệu ứng nảy (Pop up) cho icon */}
        <View style={styles.lottieContainer}>
             {/* SỬ DỤNG FILE JSON NỘI BỘ BẠN VỪA TẢI */}
             <LottieView
                autoPlay
                loop={false}
                ref={animation}
                style={{ width: 200, height: 200 }}
                // Đường dẫn tương đối từ: components/payment/order-success.tsx ra assets
                source={require('../../../assets/animations/success.json')} 
             />
        </View>
        
        {/* 4. Hiệu ứng chữ trượt từ dưới lên (Stagger Animation) */}
        <View>
            <Text style={styles.title}>Xin chúc mừng!</Text>
            <Text style={styles.subText}>
            Thanh toán thành công!{'\n'}Đơn hàng của bạn đang được chuẩn bị.
            </Text>
        </View>
        
        {/* 5. Hiệu ứng Fade in cho bảng thông tin */}
        <View style={styles.infoBox}>
            <Text style={{color: COLORS.subText}}>Thời gian giao dự kiến</Text>
            <Text style={{color: COLORS.text, fontSize: 16, fontWeight: 'bold', marginTop: 4}}>30 - 45 Phút</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
            style={styles.btn}
            onPress={handleNavigation}
        >
            <Text style={styles.btnText}>THEO DÕI ĐƠN HÀNG</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
            style={styles.btnSecondary}
            onPress={handleNavigation}
        >
            <Text style={styles.btnSecondaryText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { 
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 
  },
  lottieContainer: {
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 12, textAlign: 'center' },
  subText: { 
    fontSize: 15, color: COLORS.subText, textAlign: 'center', lineHeight: 24 
  },
  infoBox: {
      marginTop: 40, alignItems: 'center', 
      padding: 16, backgroundColor: '#1C1C1E', borderRadius: 12, width: '100%'
  },
  footer: { width: '100%', paddingHorizontal: 24, paddingBottom: 40 },
  btn: {
    backgroundColor: COLORS.primary,
    height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 10,
    marginBottom: 16
  },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  btnSecondary: {
      height: 56, borderRadius: 16,
      alignItems: 'center', justifyContent: 'center',
  },
  btnSecondaryText: { color: COLORS.subText, fontSize: 16, fontWeight: '600' }
});