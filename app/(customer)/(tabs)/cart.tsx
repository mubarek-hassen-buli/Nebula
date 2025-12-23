import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderPlacement } from '../../../lib/hooks/useOrderPlacement';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';

export default function CartScreen() {
  const router = useRouter();
  const { items, restaurantId, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const { profile } = useAuthStore();
  const { placeOrder, isPlacingOrder } = useOrderPlacement();

  const [orderType, setOrderType] = useState<'instant' | 'scheduled'>('instant');
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Calculate totals
  const subtotal = getTotalPrice();
  const deliveryFee = 50.00; 
  const total = subtotal + deliveryFee;

  // Generate next 4 hours of slots for MVP
  const generateTimeSlots = () => {
      const slots = [];
      const now = new Date();
      now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0); // Round up to next 30 min

      for (let i = 0; i < 8; i++) {
          const slot = new Date(now.getTime() + i * 30 * 60000);
          slots.push(slot);
      }
      return slots;
  };
  const timeSlots = generateTimeSlots();

  const handleCheckout = async () => {
    if (!profile) {
      Alert.alert('Please Login', 'You need to be logged in to place an order.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/sign-in' as any) }
      ]);
      return;
    }

    if (items.length === 0 || !restaurantId) {
      if (!restaurantId) {
        Alert.alert('Error', 'Cart state invalid (missing restaurant ID). Please clear cart and try again.');
      }
      return;
    }

    if (orderType === 'scheduled' && !scheduledTime) {
        Alert.alert('Select Time', 'Please select a scheduled time for your order.');
        return;
    }

    const result = await placeOrder(orderType === 'scheduled' ? scheduledTime! : undefined);

    if (result.success) {
        setEarnedPoints(result.pointsEarned || 0);
        setShowSuccessModal(true);
    } else {
        Alert.alert('Order Failed', result.error || 'Something went wrong.');
    }
  };

  const closeSuccessAndNavigate = () => {
      setShowSuccessModal(false);
      // Navigate to orders tab
      // We rely on router replace to reset stack somewhat or just push
      router.push('/(customer)/(tabs)/orders'); 
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
                <Ionicons name="cart" size={60} color="#F59E0B" />
            </View>
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>Add some delicious food to get started!</Text>
            <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(customer)/(tabs)' as any)}>
                <Text style={styles.browseButtonText}>Browse Food</Text>
            </TouchableOpacity>
        </View>

        {/* Success Modal - Kept here so it stays visible even if cart clears */}
        <Modal visible={showSuccessModal} transparent animationType="slide">
          <View style={styles.successOverlay}>
              <View style={styles.successContent}>
                  <View style={styles.successIconBg}>
                    <Ionicons name="checkmark" size={50} color="#FFF" />
                  </View>
                  <Text style={styles.successTitle}>Order Placed!</Text>
                  <Text style={styles.successMessage}>
                      Your food is on its way to being prepared.
                  </Text>
                  
                  {earnedPoints > 0 && (
                      <View style={styles.pointsBadge}>
                          <Ionicons name="gift" size={20} color="#F59E0B" />
                          <Text style={styles.pointsText}>You earned <Text style={{fontWeight:'bold'}}>{earnedPoints} Points</Text>!</Text>
                      </View>
                  )}

                  <TouchableOpacity style={styles.trackButton} onPress={closeSuccessAndNavigate}>
                      <Text style={styles.trackButtonText}>Track Order</Text>
                  </TouchableOpacity>
              </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Order Type Selector */}
        <View style={styles.typeContainer}>
            <TouchableOpacity 
                style={[styles.typeOption, orderType === 'instant' && styles.typeOptionActive]}
                onPress={() => setOrderType('instant')}
            >
                <Ionicons name="flash" size={20} color={orderType === 'instant' ? '#000' : '#9CA3AF'} />
                <Text style={[styles.typeText, orderType === 'instant' && styles.typeTextActive]}>Instant Delivery</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.typeOption, orderType === 'scheduled' && styles.typeOptionActive]}
                onPress={() => setOrderType('scheduled')}
            >
                <Ionicons name="calendar" size={20} color={orderType === 'scheduled' ? '#000' : '#9CA3AF'} />
                <Text style={[styles.typeText, orderType === 'scheduled' && styles.typeTextActive]}>Schedule</Text>
            </TouchableOpacity>
        </View>

        {orderType === 'scheduled' && (
            <View style={styles.scheduleRow}>
                <Text style={styles.scheduleLabel}>Desired Time:</Text>
                <TouchableOpacity style={styles.scheduleBtn} onPress={() => setTimePickerVisible(true)}>
                    <Text style={styles.scheduleValue}>
                        {scheduledTime ? scheduledTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Select Time'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#F59E0B" />
                </TouchableOpacity>
            </View>
        )}

        <View style={styles.itemList}>
            {items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                    <Image source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} style={styles.itemImage} />
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.itemPrice}>${item.price.toFixed(0)}</Text>
                        <View style={styles.quantityRow}>
                             <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
                                 <Ionicons name="remove" size={16} color="#FFF" />
                             </TouchableOpacity>
                             <Text style={styles.qtyText}>{item.quantity}</Text>
                             <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>
                                 <Ionicons name="add" size={16} color="#FFF" />
                             </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            ))}
        </View>

        <View style={styles.billSection}>
            <Text style={styles.billTitle}>Bill Summary</Text>
            <View style={styles.billRow}>
                <Text style={styles.billLabel}>Subtotal</Text>
                <Text style={styles.billValue}>{subtotal.toFixed(2)} Br</Text>
            </View>
            <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                <Text style={styles.billValue}>{deliveryFee.toFixed(2)} Br</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.billRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{total.toFixed(2)} Br</Text>
            </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.checkoutBtn, isPlacingOrder && { opacity: 0.7 }]} 
            onPress={handleCheckout}
            disabled={isPlacingOrder}
          >
              <Text style={styles.checkoutText}>{isPlacingOrder ? 'Sending...' : 'Add Order'}</Text>
              <Text style={styles.checkoutTotal}>{total.toFixed(0)} Br</Text>
          </TouchableOpacity>
      </View>

      {/* Time Picker Modal (Custom for MVP safe) */}
      <Modal transparent visible={isTimePickerVisible} animationType="fade" onRequestClose={() => setTimePickerVisible(false)}>
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setTimePickerVisible(false)}>
              <View style={styles.pickerContent}>
                  <Text style={styles.pickerTitle}>Select Delivery Time</Text>
                  <ScrollView style={{maxHeight: 300}}>
                      {timeSlots.map((time, index) => (
                          <TouchableOpacity 
                            key={index} 
                            style={styles.timeSlot}
                            onPress={() => {
                                setScheduledTime(time);
                                setTimePickerVisible(false);
                            }}
                          >
                              <Text style={styles.timeSlotText}>
                                {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </Text>
                              {scheduledTime?.getTime() === time.getTime() && (
                                  <Ionicons name="checkmark" size={20} color="#F59E0B" />
                              )}
                          </TouchableOpacity>
                      ))}
                  </ScrollView>
              </View>
          </TouchableOpacity>
      </Modal>

      {/* Beautiful Success Modal - Repeated here or could be componentized, but kept inline for simplicity as per user request flow */}
      <Modal visible={showSuccessModal} transparent animationType="slide">
          <View style={styles.successOverlay}>
              <View style={styles.successContent}>
                  <View style={styles.successIconBg}>
                    <Ionicons name="checkmark" size={50} color="#FFF" />
                  </View>
                  <Text style={styles.successTitle}>Order Placed!</Text>
                  <Text style={styles.successMessage}>
                      Your food is on its way to being prepared.
                  </Text>
                  
                  {earnedPoints > 0 && (
                      <View style={styles.pointsBadge}>
                          <Ionicons name="gift" size={20} color="#F59E0B" />
                          <Text style={styles.pointsText}>You earned <Text style={{fontWeight:'bold'}}>{earnedPoints} Points</Text>!</Text>
                      </View>
                  )}

                  <TouchableOpacity style={styles.trackButton} onPress={closeSuccessAndNavigate}>
                      <Text style={styles.trackButtonText}>Track Order</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingHorizontal: 20, 
      paddingVertical: 20 
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  clearText: { color: '#EF4444', fontSize: 14 },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 180 },
  
  typeContainer: { flexDirection: 'row', backgroundColor: '#1F2937', padding: 4, borderRadius: 12, marginBottom: 20 },
  typeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 10, gap: 8 },
  typeOptionActive: { backgroundColor: '#F59E0B' },
  typeText: { color: '#9CA3AF', fontWeight: '600' },
  typeTextActive: { color: '#000', fontWeight: 'bold' },

  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: '#1F2937', padding: 16, borderRadius: 12 },
  scheduleLabel: { color: '#FFF', fontSize: 16 },
  scheduleBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scheduleValue: { color: '#F59E0B', fontSize: 16, fontWeight: 'bold' },

  itemList: { gap: 16, marginBottom: 30 },
  itemCard: {
      flexDirection: 'row',
      backgroundColor: '#1F2937',
      borderRadius: 16,
      padding: 12,
      alignItems: 'center',
  },
  itemImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#374151' },
  itemInfo: { flex: 1, marginLeft: 16 },
  itemName: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  itemPrice: { color: '#F59E0B', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { 
      width: 28, height: 28, borderRadius: 14, backgroundColor: '#374151', 
      justifyContent: 'center', alignItems: 'center' 
  },
  qtyText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  deleteBtn: { padding: 8 },

  billSection: { backgroundColor: '#1F2937', borderRadius: 16, padding: 20 },
  billTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  billLabel: { color: '#9CA3AF', fontSize: 14 },
  billValue: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#374151', marginVertical: 12 },
  totalLabel: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  totalValue: { color: '#F59E0B', fontSize: 20, fontWeight: 'bold' },

  footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#1F2937',
      padding: 20,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 110, // Increased to clear custom Tab Bar (height 90 + padding)
  },
  helperText: {
      color: '#9CA3AF',
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 12,
  },
  checkoutBtn: {
      backgroundColor: '#F59E0B',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 18,
      borderRadius: 16,
  },
  checkoutText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  checkoutTotal: { color: '#000', fontSize: 18, fontWeight: 'bold' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconBg: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#1F2937', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  emptySubtext: { color: '#9CA3AF', fontSize: 16, marginTop: 8, textAlign: 'center', marginBottom: 30 },
  browseButton: { backgroundColor: '#F59E0B', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 24 },
  browseButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  pickerContent: { backgroundColor: '#1F2937', borderRadius: 24, padding: 20, maxHeight: 400 },
  pickerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  timeSlot: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#374151', flexDirection: 'row', justifyContent: 'space-between' },
  timeSlotText: { color: '#D1D5DB', fontSize: 16 },

  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  successContent: { backgroundColor: '#1F2937', width: '100%', borderRadius: 30, padding: 30, alignItems: 'center' },
  successIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#10B981', shadowRadius: 10, shadowOpacity: 0.5 },
  successTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  successMessage: { color: '#9CA3AF', textAlign: 'center', fontSize: 16, marginBottom: 24 },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#374151', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 8, marginBottom: 24 },
  pointsText: { color: '#FFF', fontSize: 14 },
  trackButton: { backgroundColor: '#F59E0B', width: '100%', padding: 16, borderRadius: 16, alignItems: 'center' },
  trackButtonText: { color: '#000', fontWeight: 'bold', fontSize: 18 },
});
