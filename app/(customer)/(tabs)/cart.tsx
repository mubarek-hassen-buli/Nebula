import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase/client';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';

export default function CartScreen() {
  const router = useRouter();
  const { items, restaurantId, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const { profile } = useAuthStore();
  const [isOrdering, setIsOrdering] = useState(false);

  // Calculate totals
  const subtotal = getTotalPrice();
  const deliveryFee = 50.00; // Fixed for now
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!profile) {
      Alert.alert('Please Login', 'You need to be logged in to place an order.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/sign-in' as any) }
      ]);
      return;
    }

    if (items.length === 0 || !restaurantId) return;

    setIsOrdering(true);

    try {
      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: profile.id,
          restaurant_id: restaurantId,
          total_amount: total,
          status: 'Pending',
        } as any)
        .select()
        .single() as any;

      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItemsData = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData as any);

      if (itemsError) throw itemsError;

      // 3. Success
      clearCart();
      Alert.alert('Success!', 'Your order has been placed successfully.', [
          { text: 'Track Order', onPress: () => router.push({ pathname: '/(customer)/orders/[id]', params: { id: order.id } } as any) }
      ]);

    } catch (error: any) {
      console.error('Order Error:', error);
      Alert.alert('Error', error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#374151" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add some delicious food to get started!</Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(customer)/(tabs)' as any)}>
             <Text style={styles.browseButtonText}>Browse Food</Text>
          </TouchableOpacity>
        </View>
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
            style={[styles.checkoutBtn, isOrdering && { opacity: 0.7 }]} 
            onPress={handlePlaceOrder}
            disabled={isOrdering}
          >
              <Text style={styles.checkoutText}>{isOrdering ? 'Placing Order...' : 'Place Order'}</Text>
              <Text style={styles.checkoutTotal}>{total.toFixed(0)} Br</Text>
          </TouchableOpacity>
      </View>
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
      paddingBottom: 30, // Adjusted for tab bar spacing
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
  emptyText: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 20 },
  emptySubtext: { color: '#9CA3AF', fontSize: 16, marginTop: 8, textAlign: 'center', marginBottom: 30 },
  browseButton: { backgroundColor: '#F59E0B', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 24 },
  browseButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});
