import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, Animated, Dimensions, Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import API
import { chatWithGemini, getProductImageUrl, POST_PLACE_ORDER, GET_USER_ADDRESSES, GET_USER_BY_EMAIL } from '../../../APIService';
import ProductCard from '../product/ProductCard';
import { useCart } from '../cart/CartContext';

const { width, height } = Dimensions.get('window');

// --- COMPONENT TIN NHẮN ANIMATION ---
const AnimatedMessage = ({ children, isUser }: { children: React.ReactNode, isUser: boolean }) => {
  const slideAnim = useRef(new Animated.Value(isUser ? 30 : -30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{
      opacity: opacityAnim,
      transform: [{ translateX: slideAnim }],
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      width: '100%'
    }}>
      {children}
    </Animated.View>
  );
};

// --- COMPONENT SKELETON AI (Màu Xanh Messenger) ---
const AISkeleton = () => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.msgContainer}>
      <View style={styles.aiAvatarWrapper}>
        <LinearGradient colors={['#FF7622', '#FF4B2B']} style={styles.aiAvatarGradient}>
          <Ionicons name="sparkles" size={14} color="#FFF" />
        </LinearGradient>
      </View>
      <View style={[styles.bubble, styles.aiBubble]}>
        <Animated.View style={{ opacity: pulseAnim, flexDirection: 'row' }}>
          <View style={styles.dot} /><View style={[styles.dot, { marginHorizontal: 4 }]} /><View style={styles.dot} />
        </Animated.View>
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const router = useRouter();
  const { state, cartItems, addToCart, getTotal, clearCart } = useCart();
  
  const [userName, setUserName] = useState("Anh/Chị");
  const [messages, setMessages] = useState<any[]>([
    { id: '1', text: 'Chào anh/chị! Em là Đệ anh Trường đây. Anh/chị cần em giúp gì ạ? 🥗✨', sender: 'ai' }
  ]);

  useEffect(() => {
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    try {
      const email = await AsyncStorage.getItem("saved-email");
      if (email) {
        const res = await GET_USER_BY_EMAIL(email);
        if (res.data && res.data.lastName) {
          const name = res.data.lastName; 
          setUserName(name);
          setMessages(prev => {
            const newMsgs = [...prev];
            if (newMsgs.length > 0 && newMsgs[0].id === '1') {
              newMsgs[0].text = `Chào ${name}! Em là Đệ anh Trường đây. ${name} cần em giúp gì ạ? 🥗✨`;
            }
            return newMsgs;
          });
        }
      }
    } catch (e) {
      console.log("Error fetching user name:", e);
    }
  };

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true); // TTS toggle
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingStartTime = useRef<number>(0); // Thời điểm bắt đầu ghi
  const flatListRef = useRef<FlatList>(null);

  // Animation bay vào giỏ
  const flyAnim = useRef(new Animated.Value(0)).current;
  const [isFlying, setIsFlying] = useState(false);
  const [flyingImage, setFlyingImage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300);
    return () => clearTimeout(timer);
  }, [messages, loading]);

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để gửi ảnh.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', allowsEditing: true, quality: 0.6,
    });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  // 🎤 Nhận dạng giọng nói bằng Web Speech API (chính xác hơn)
  const recognitionRef = useRef<any>(null);
  
  const startRecording = async () => {
    console.log('🎤 [DEBUG] startRecording called');
    
    // Kiểm tra Web Speech API hỗ trợ
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    console.log('🎤 [DEBUG] SpeechRecognition available:', !!SpeechRecognition);
    
    if (SpeechRecognition) {
      try {
        // Web: Dùng Web Speech API
        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.continuous = true;  // 🎤 Tiếp tục lắng nghe cho đến khi user nhấn dừng
        recognition.interimResults = true;  // Hiển thị kết quả tạm thời
        console.log('🎤 [DEBUG] Recognition created, lang:', recognition.lang);
        
        recognition.onstart = () => {
          console.log('🎤 [DEBUG] Recognition STARTED - Hãy nói đi!');
        };
        
        let finalTranscript = '';
        
        recognition.onresult = (event: any) => {
          // Gom tất cả kết quả thành một transcript
          let interim = '';
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          console.log('🎤 [DEBUG] Đang nghe:', finalTranscript + interim);
        };
        
        recognition.onerror = (event: any) => {
          console.error('🎤 [DEBUG] Recognition ERROR:', event.error);
          if (event.error === 'not-allowed') {
            Alert.alert("Lỗi", "Vui lòng cho phép truy cập microphone trong trình duyệt.");
          } else if (event.error !== 'aborted') {
            Alert.alert("Lỗi", `Không thể nhận dạng: ${event.error}`);
          }
          setIsRecording(false);
        };
        
        recognition.onend = async () => {
          console.log('🎤 [DEBUG] Recognition ENDED, transcript:', finalTranscript.trim());
          setIsRecording(false);
          
          const transcript = finalTranscript.trim();
          if (transcript) {
            const userMsg = { id: Date.now().toString(), text: `🎤 ${transcript}`, sender: 'user' };
            setMessages(prev => [...prev, userMsg]);
            setLoading(true);
            
            try {
              const aiReplyText = await chatWithGemini(transcript, null, userName);
              
              // Xử lý auto-add
              const autoAddRegex = /\[ADD_TO_CART:\s*({[\s\S]*?})\]/g;
              const autoAddMatches = Array.from(aiReplyText?.matchAll(autoAddRegex) || []);
              for (const match of autoAddMatches) {
                try {
                  const product = JSON.parse((match as any)[1]);
                  const mappedProduct = {
                    id: product.id,
                    name: product.name || product.n,
                    price: product.price || product.p,
                    image: product.image || product.i
                  };
                  const qty = parseInt(product.q || product.quantity || 1);
                  await handleAddToCart(mappedProduct, qty);
                  await new Promise(resolve => setTimeout(resolve, 300));
                } catch (e) { console.error("Lỗi parse auto add:", e); }
              }
              
              setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiReplyText || "Lỗi", sender: 'ai' }]);
              speakAIResponse(aiReplyText || "");
            } catch (error) {
              console.error('🎤 [DEBUG] Error calling AI:', error);
              setMessages(prev => [...prev, { id: 'err', text: "Đệ anh Trường đang bận!", sender: 'ai' }]);
            } finally {
              setLoading(false);
            }
          }
        };
        
        recognitionRef.current = recognition;
        recognition.start();
        console.log('🎤 [DEBUG] recognition.start() called');
        setIsRecording(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (err) {
        console.error('🎤 [DEBUG] Exception:', err);
        Alert.alert("Lỗi", "Không thể khởi tạo nhận dạng giọng nói.");
      }
    } else {
      console.log('🎤 [DEBUG] Web Speech API NOT supported');
      Alert.alert("Thông báo", "Trình duyệt không hỗ trợ nhận dạng giọng nói. Vui lòng dùng Chrome.");
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    return null;
  };

  // 🔊 Đọc to phản hồi AI
  const speakAIResponse = (text: string) => {
    if (!voiceEnabled) return;
    // Loại bỏ các tag để đọc
    const cleanText = text
      .replace(/\[ADD_TO_CART:[\s\S]*?\]/g, '')
      .replace(/\[PRODUCT_CARD:[\s\S]*?\]/g, '')
      .replace(/\[CHECKOUT_CARD\]/g, '')
      .trim();
    
    if (cleanText) {
      Speech.speak(cleanText, { language: 'vi-VN', rate: 1.0 });
    }
  };

  const handleAddToCart = async (product: any, quantity: number = 1) => {
    const imgUri = getProductImageUrl(product.image);
    setFlyingImage(imgUri);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setIsFlying(true);
    flyAnim.setValue(0);
    Animated.timing(flyAnim, {
      toValue: 1, duration: 1000, useNativeDriver: true,
    }).start(() => {
      setIsFlying(false);
      setFlyingImage(null);
    });
    await addToCart(product, quantity);
  };

  const handleQuickCheckout = async () => {
    if (cartItems.length === 0) {
      return Alert.alert("Thông báo", "Giỏ hàng của bạn đang trống.");
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem("saved-email");
      if (email && state.cartId) {
        const addrRes = await GET_USER_ADDRESSES(email);
        if (!addrRes.data || addrRes.data.length === 0) {
            setLoading(false);
            return Alert.alert("Thiếu địa chỉ", "Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ trong Profile.");
        }
        const defaultAddressId = addrRes.data[0].addressId;
        const res = await POST_PLACE_ORDER(email, state.cartId, defaultAddressId, "CASH", null);
        
        if (res.status === 201 || res.status === 200) {
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            text: `🎉 Tuyệt vời! Đơn hàng #${res.data.orderId} đã được đặt thành công. Bếp đang chuẩn bị món ngay! 👨‍🍳`, 
            sender: 'ai' 
          }]);
          clearCart();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error("Quick checkout error:", error);
      Alert.alert("Lỗi", "Thanh toán thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !selectedImage) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user', image: selectedImage };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);
    setLoading(true);

    try {
      const aiReplyText = await chatWithGemini(userMsg.text, userMsg.image, userName);
      
      // --- XỬ LÝ TỰ ĐỘNG THÊM VÀO GIỎ (TUẦN TỰ để tránh deadlock) ---
      const autoAddRegex = /\[ADD_TO_CART:\s*({[\s\S]*?})\]/g;
      const autoAddMatches = Array.from(aiReplyText?.matchAll(autoAddRegex) || []);
      
      for (const match of autoAddMatches) {
        try {
          const product = JSON.parse((match as any)[1]);
          const mappedProduct = {
            id: product.id,
            name: product.name || product.n,
            price: product.price || product.p,
            image: product.image || product.i
          };
          const qty = parseInt(product.q || product.quantity || 1);
          await handleAddToCart(mappedProduct, qty);
          // Đợi 300ms giữa mỗi sản phẩm để tránh deadlock
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (e) {
          console.error("Lỗi parse auto add:", e);
        }
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiReplyText || "Lỗi phản hồi từ AI", sender: 'ai' }]);
      // TTS: Không đọc to khi user gõ văn bản (chỉ đọc khi dùng giọng nói)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); 
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', text: "Đệ anh Trường đang bận, bạn thử lại sau nhé!", sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isUser = item.sender === 'user';
    const isCheckout = item.text?.includes("[CHECKOUT_CARD]");
    const cardRegex = /\[PRODUCT_CARD:\s*({[\s\S]*?})\]/g;
    const addRegex = /\[ADD_TO_CART:\s*({[\s\S]*?})\]/g;
    
    const matches: RegExpMatchArray[] = Array.from(item.text?.matchAll(cardRegex) || []);
    
    // Xóa sạch tất cả các loại tag khi hiển thị text
    const cleanText = (item.text || "")
      .replace(cardRegex, "")
      .replace(addRegex, "")
      .replace("[CHECKOUT_CARD]", "")
      .trim();
    
    // Tổng hợp danh sách hiển thị card (có thể gộp cả card auto-add nếu muốn hiện card cho đẹp)
    const productList = matches.map((m: RegExpMatchArray) => {
      try { return JSON.parse(m[1]); } catch { return null; }
    }).filter(p => p !== null);

    return (
      <AnimatedMessage isUser={isUser}>
        <View style={[styles.msgContainer, isUser ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
          {!isUser && (
             <View style={styles.aiAvatarWrapper}>
                <LinearGradient colors={['#FF7622', '#FF4B2B']} style={styles.aiAvatarGradient}>
                    <Ionicons name="sparkles" size={14} color="#FFF" />
                </LinearGradient>
             </View>
          )}
          
          <View style={{ maxWidth: isUser ? '75%' : '90%', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
            {/* 1. ẢNH */}
            {item.image && (
              <View style={styles.standaloneImageContainer}>
                <Image source={{ uri: item.image }} style={styles.msgImage} resizeMode="cover" />
              </View>
            )}
            
            {/* 2. TEXT */}
            {cleanText ? (
                <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.msgText, isUser ? styles.userText : styles.aiText]}>{cleanText}</Text>
                </View>
            ) : null}

            {/* 3. CHECKOUT CARD */}
            {isCheckout && (
              <View style={styles.standaloneCardContainer}>
                <View style={styles.receiptHeader}>
                  <MaterialCommunityIcons name="basket-check" size={20} color="#FFF" style={{marginRight: 8}} />
                  <Text style={styles.receiptTitle}>Xác nhận đơn hàng</Text>
                </View>

                <View style={styles.receiptBody}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Trạng thái</Text>
                    <Text style={styles.receiptValueHighlight}>Chờ thanh toán</Text>
                  </View>
                  <View style={styles.dashedLine} />
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptTotalLabel}>Tổng cộng</Text>
                    <Text style={styles.receiptTotalPrice}>{getTotal().toLocaleString()}đ</Text>
                  </View>

                  <TouchableOpacity onPress={handleQuickCheckout} disabled={loading} style={{marginTop: 15}}>
                    <LinearGradient colors={['#FF7622', '#FF4B2B']} style={styles.payBtnGradient}>
                      {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.payBtnText}>MUA NGAY</Text>}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 4. CAROUSEL SẢN PHẨM (Đã sửa từ ScrollView thành FlatList) */}
            {productList.length > 0 && (
              <View style={styles.carouselWrapper}>
                <FlatList
                  data={productList}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(p, idx) => `${item.id}-prod-${idx}`}
                  renderItem={({ item: p }) => {
                    if (!p || !p.id) return null;
                    const productImage = p.image && p.image !== 'undefined' ? getProductImageUrl(p.image) : 'https://via.placeholder.com/200';
                    return (
                      <View style={styles.standaloneProductCard}>
                        <ProductCard 
                          onAddPress={() => handleAddToCart(p)}
                          item={{ id: p.id, name: p.name, price: p.price, image: productImage, description: "" }} 
                        />
                      </View>
                    );
                  }}
                  contentContainerStyle={styles.carouselContent}
                />
              </View>
            )}
          </View>
        </View>
      </AnimatedMessage>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerAction}>
            <Ionicons name="chevron-back" size={26} color="#FF7622" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Đệ anh Trường</Text>
            <View style={styles.statusRow}>
              <View style={styles.dotActive} />
              <Text style={styles.statusText}>Đang hoạt động</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/components/cart/cart')} style={styles.headerAction}>
          <Ionicons name="cart" size={26} color="#FF7622" />
          {cartItems.length > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{cartItems.length}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingVertical: 15, paddingBottom: 160 }}
        ListFooterComponent={loading ? <AISkeleton /> : null}
        showsVerticalScrollIndicator={false}
      />

      {/* Animation Bay */}
      {isFlying && flyingImage && (
        <Animated.View style={[styles.flyingIcon, {
          transform: [
            { translateY: flyAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 0.85] }) },
            { translateX: flyAnim.interpolate({ inputRange: [0, 1], outputRange: [0, width * 0.4] }) },
            { scale: flyAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.1] }) },
            { rotate: flyAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }
          ],
          opacity: flyAnim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] })
        }]}>
          <Image source={{ uri: flyingImage }} style={styles.flyingImg} />
        </Animated.View>
      )}

      {/* Footer Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.footerContainer}
      >
        <View style={styles.inputContainer}>
          {selectedImage && (
            <View style={styles.previewBox}>
              <Image source={{ uri: selectedImage }} style={styles.previewImg} />
              <TouchableOpacity style={styles.previewClose} onPress={() => setSelectedImage(null)}>
                <Ionicons name="close-circle" size={26} color="#FA3E3E" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <TouchableOpacity onPress={pickImage} style={styles.iconBtn}>
              <Ionicons name="images" size={26} color="#FF7622" />
            </TouchableOpacity>
            
            {/* 🎤 Nút Mic - Nhấn 1 lần để bắt đầu nói */}
            <TouchableOpacity 
              onPress={() => {
                if (isRecording) {
                  stopRecording();
                } else {
                  startRecording();
                }
              }}
              disabled={loading}
              style={[styles.iconBtn, isRecording && { backgroundColor: '#FF7622', borderRadius: 20 }]}
            >
              <Ionicons name={isRecording ? "stop" : "mic"} size={26} color={isRecording ? "#FFF" : "#FF7622"} />
            </TouchableOpacity>
            
            <TextInput 
              style={styles.input} 
              value={inputText} 
              onChangeText={setInputText} 
              placeholder="Aa" 
              placeholderTextColor="#8E8E93"
              multiline
            />
            
            <TouchableOpacity onPress={handleSend} disabled={loading} style={styles.sendIconBtn}>
              <Ionicons 
                name="send" 
                size={24} 
                color={inputText.trim() || selectedImage ? "#FF7622" : "#B0B3B8"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 15, height: 60, backgroundColor: '#FFF', 
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0', elevation: 2
  },
  headerContent: { alignItems: 'flex-start', marginLeft: 10 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dotActive: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#31A24C', marginRight: 5 },
  statusText: { fontSize: 11, color: '#65676B' },
  headerAction: { padding: 5 },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FF3B30', borderRadius: 9, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

  msgContainer: { flexDirection: 'row', marginBottom: 5, paddingHorizontal: 10, alignItems: 'flex-end' },
  aiAvatarWrapper: { marginRight: 8, marginBottom: 2 },
  aiAvatarGradient: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },

  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginBottom: 2 },
  userBubble: { backgroundColor: '#FF7622', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#F0F2F5', borderBottomLeftRadius: 4 },
  
  msgText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#FFF' },
  aiText: { color: '#050505' },

  standaloneImageContainer: {
    marginBottom: 5, borderRadius: 18, overflow: 'hidden', 
    borderWidth: 1, borderColor: '#F0F0F0', alignSelf: 'flex-start'
  },
  msgImage: { width: 220, height: 160 },

  standaloneCardContainer: {
    marginTop: 5, width: 240, backgroundColor: '#FFF', borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  receiptHeader: { backgroundColor: '#FF7622', padding: 12, flexDirection: 'row', alignItems: 'center' },
  receiptTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  receiptBody: { padding: 15 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  receiptLabel: { color: '#65676B', fontSize: 13 },
  receiptValueHighlight: { color: '#31A24C', fontWeight: 'bold' },
  dashedLine: { height: 1, borderWidth: 1, borderColor: '#DADDE1', borderStyle: 'dashed', marginVertical: 10, borderRadius: 1 },
  receiptTotalLabel: { fontWeight: 'bold', fontSize: 15 },
  receiptTotalPrice: { color: '#FF7622', fontWeight: 'bold', fontSize: 18 },
  
  payBtnGradient: { paddingVertical: 10, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  payBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  // --- SỬA STYLES CHO CAROUSEL ---
  carouselWrapper: {
    marginTop: 8, 
    marginBottom: 10,
    width: width * 0.75, // Giới hạn chiều rộng để FlatList không bị tràn
  },
  carouselContent: {
    paddingVertical: 5,
    paddingRight: 20, // Padding phải để người dùng thấy còn item phía sau
  },
  standaloneProductCard: { 
    width: 165, 
    marginRight: 12,
    // Đảm bảo card không bị cắt shadow
    backgroundColor: 'transparent'
  },

  footerContainer: { padding: 10, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  inputContainer: { width: '100%' },
  previewBox: { marginBottom: 10, marginLeft: 40 },
  previewImg: { width: 60, height: 60, borderRadius: 10 },
  previewClose: { position: 'absolute', top: -10, right: -10 },

  inputRow: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 5 },
  input: { 
    flex: 1, backgroundColor: '#F0F2F5', borderRadius: 20, 
    paddingHorizontal: 15, paddingVertical: 10, marginHorizontal: 5, fontSize: 16, maxHeight: 120 
  },
  sendIconBtn: { padding: 5 },
  
  flyingIcon: { position: 'absolute', bottom: 100, alignSelf: 'center', zIndex: 99 },
  flyingImg: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#FF7622' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#8E8E93' },
});