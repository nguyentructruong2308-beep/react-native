import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Step3() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/images/onboarding_1.png")} style={styles.image} />

      <Text style={styles.title}>All your favorites</Text>
      <Text style={styles.desc}>
        Get all your loved foods in one place, you just place the order we do the rest
      </Text>

      <TouchableOpacity style={styles.btn} onPress={() => router.push("/onboarding/step4")}>
        <Text style={styles.btnText}>NEXT</Text>
      </TouchableOpacity>

      <Text style={styles.skip}>Skip</Text>
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
  skip: { marginTop: 10, color: "#999" }
});
