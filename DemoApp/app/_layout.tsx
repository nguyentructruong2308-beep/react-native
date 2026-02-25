import './polyfills';
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, View, StatusBar, Platform } from "react-native";
import { useEffect } from "react";
import { CartProvider } from "./components/cart/CartContext";
import { AuthProvider, useAuth } from "./components/context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { WishlistProvider } from "./context/WishlistContext";

function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const first = segments[0];
    const inAuth = first === "auth";
    const inHome = first === "(home)";

    if (!isLoggedIn && inHome) {
      router.replace("/auth/login");
      return;
    }
    if (isLoggedIn && inAuth) {
      router.replace("/(home)");
      return;
    }
  }, [isLoggedIn, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="(home)" />

      {/* Auth */}
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="auth/forgot" />

      {/* Onboarding */}
      <Stack.Screen name="onboarding/step1" />
      <Stack.Screen name="onboarding/step2" />
      <Stack.Screen name="onboarding/step3" />
      <Stack.Screen name="onboarding/step4" />
      <Stack.Screen name="onboarding/step5" />

      {/* Main Features */}
      <Stack.Screen
        name="components/cart/cart"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen name="components/product/[id]" />

      {/* Payment Flow */}
      <Stack.Screen name="components/payment/payment" />
      <Stack.Screen
        name="components/payment/order-success"
        options={{ gestureEnabled: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ThemedApp />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// Component riêng để sử dụng useTheme (phải nằm trong ThemeProvider)
function ThemedApp() {
  const { theme } = useTheme();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle={theme.colors.statusBar} 
        backgroundColor={theme.colors.background} 
      />
      <RootNavigator />
    </SafeAreaView>
  );
}