import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// 1. Import thư viện lưu trữ
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Step5() {
  const router = useRouter();

  // 2. Viết hàm xử lý lưu trạng thái
  const handleGetStarted = async () => {
    try {
      // Lưu đánh dấu "đã xem xong" (hasLaunched = true)
      await AsyncStorage.setItem('hasLaunched', 'true');
      
      // Lưu xong thì mới chuyển trang
      router.replace("/auth/login");
    } catch (error) {
      console.log("Lỗi lưu data:", error);
      // Nếu lỗi thì cứ cho qua luôn
      router.replace("/auth/login");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/onboarding_3.jpg")}
        style={styles.image}
      />

      <Text style={styles.title}>Free delivery offers</Text>
      <Text style={styles.desc}>
        Get all your loved foods in one place, you just place the order we do the rest
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={handleGetStarted} // 3. Gọi hàm mới ở đây
      >
        <Text style={styles.btnText}>GET STARTED</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", backgroundColor: "#fff" },
  image: { width: 260, height: 260, marginTop: 40, resizeMode: "contain" },
  title: { fontSize: 22, fontWeight: "700", marginTop: 20 },
  desc: { textAlign: "center", color: "#555", marginVertical: 10, paddingHorizontal: 20 },
  btn: { backgroundColor: "#ff7300", padding: 14, borderRadius: 10, width: "80%", marginTop: 20 },
  btnText: { color: "#fff", textAlign: "center", fontSize: 16 },
});