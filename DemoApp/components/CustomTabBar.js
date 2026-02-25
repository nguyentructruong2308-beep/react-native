import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Platform, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../app/context/ThemeContext";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");

const icons = {
  index: "grid",
  menu: "menu",
  add: "plus",
  bell: "bell",
  profile: "user",
};

export default function CustomTabBar({ state, descriptors, navigation }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom, 15) }]}>
      <View style={[styles.tabBar, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const iconName = icons[route.name];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const isAdd = route.name === "add";

          if (isAdd) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.8}
                style={styles.centerBtnContainer}
              >
                <View style={[styles.centerBtn, { backgroundColor: colors.primary }]}>
                  <Feather name="plus" size={30} color="#FFF" />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabItem}
            >
              <View style={styles.iconWrapper}>
                <Feather
                  name={iconName}
                  size={24}
                  color={isFocused ? colors.primary : colors.textMuted}
                />
                {isFocused && (
                  <View style={[styles.activeIndicator, { backgroundColor: colors.primaryLight }]} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
  },
  tabBar: {
    flexDirection: "row",
    width: width * 0.92,
    height: 70,
    borderRadius: 35,
    justifyContent: "space-around",
    alignItems: 'center',
    
    // Shadow for iOS
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    
    // Elevation for Android
    elevation: 15,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    height: '100%',
    width: width * 0.18,
  },
  iconWrapper: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    zIndex: -1,
  },
  centerBtnContainer: {
    width: width * 0.2, // Tăng độ rộng chiếm diện tích ở giữa
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -40, // Đẩy nút lên cao
    
    // Shadow for center button
    shadowColor: "#FF7622",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    
    borderWidth: 4,
    borderColor: "#FFF",
    marginBottom: Platform.OS === 'ios' ? 10 : 0, // Slight adjustment for iOS center button
  },
});