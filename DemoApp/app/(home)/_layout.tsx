import { Tabs } from "expo-router";
import { View } from "react-native";
import CustomTabBar from "../../components/CustomTabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ 
        headerShown: false,
        // Ép nền trong suốt cho hệ thống Tabs
        tabBarBackground: () => <View style={{ backgroundColor: 'transparent' }} />,
        // Ẩn đường viền mặc định nếu có
        tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0, // Bỏ bóng trên Android
            position: 'absolute', // Để nền App tràn xuống dưới Tab Bar
            bottom: 0,
        }
      }}
    >
      <Tabs.Screen name="index" options={{ title: "" }} />
      <Tabs.Screen name="menu" options={{ title: "" }} />
      <Tabs.Screen name="add" options={{ title: "" }} />
      <Tabs.Screen name="bell" options={{ title: "" }} />
      <Tabs.Screen name="profile" options={{ title: "" }} />
    </Tabs>
  );
}