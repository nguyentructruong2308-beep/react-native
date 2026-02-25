import React from 'react';
import { View, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
import { useColors } from '../../context/ThemeContext';

// 🦴 Skeleton Loading Component
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton = ({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) => {
  const colors = useColors();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

// 🦴 Skeleton cho Product Card
export const SkeletonProductCard = () => {
  const colors = useColors();
  
  return (
    <View style={[styles.productCard, { backgroundColor: colors.card }]}>
      <Skeleton width="100%" height={120} borderRadius={12} />
      <View style={styles.productInfo}>
        <Skeleton width="80%" height={16} style={{ marginTop: 12 }} />
        <Skeleton width="50%" height={14} style={{ marginTop: 8 }} />
        <Skeleton width="40%" height={18} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
};

// 🦴 Skeleton cho danh sách sản phẩm
export const SkeletonProductList = ({ count = 4 }: { count?: number }) => {
  return (
    <View style={styles.productList}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonProductCard key={index} />
      ))}
    </View>
  );
};

// 🦴 Skeleton cho Order Card
export const SkeletonOrderCard = () => {
  const colors = useColors();
  
  return (
    <View style={[styles.orderCard, { backgroundColor: colors.card }]}>
      <View style={styles.orderHeader}>
        <Skeleton width={60} height={60} borderRadius={8} />
        <View style={styles.orderInfo}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="50%" height={14} style={{ marginTop: 6 }} />
          <Skeleton width="30%" height={14} style={{ marginTop: 6 }} />
        </View>
      </View>
      <View style={styles.orderFooter}>
        <Skeleton width="40%" height={20} />
        <Skeleton width={80} height={32} borderRadius={16} />
      </View>
    </View>
  );
};

// 🦴 Skeleton cho Chat Message
export const SkeletonChatMessage = ({ isUser = false }: { isUser?: boolean }) => {
  const colors = useColors();
  
  return (
    <View style={[styles.chatMessage, isUser ? styles.userMessage : styles.aiMessage]}>
      <View style={[styles.messageBubble, { backgroundColor: isUser ? colors.primary : colors.surface }]}>
        <Skeleton width={150} height={14} />
        <Skeleton width={100} height={14} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: '48%',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productInfo: {
    padding: 12,
  },
  productList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  chatMessage: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
});

export default Skeleton;
