import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase/client';
import { useCartStore } from '../../../store/cartStore';
import { MenuItem } from '../../../types/database';

export default function DishDetailsScreen() {
  const { id } = useLocalSearchParams();
  const itemId = typeof id === 'string' ? id : '';
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const { addItem, updateQuantity, restaurantId: cartRestaurantId, clearCart } = useCartStore();

  const { data: item, isLoading } = useQuery({
    queryKey: ['dish', itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*, restaurants(name)')
        .eq('id', itemId)
        .single();
      if (error) throw error;
      return data as MenuItem & { restaurants: { name: string } };
    },
    enabled: !!itemId,
  });

  const handleAddToCart = () => {
    if (!item) return;

    // Add item quantity times
    for(let i=0; i<quantity; i++) addItem(item);
    Alert.alert('Success', `${quantity} item(s) added to cart successfully!`);
  };

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => Math.max(1, q - 1));

  if (isLoading || !item) {
      return (
          <View style={styles.loading}>
              <Text style={{color: 'white'}}>Loading...</Text>
          </View>
      );
  }

  const totalPrice = (item.price * quantity).toFixed(2);

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
          <Image source={{ uri: item.image_url || 'https://via.placeholder.com/500' }} style={styles.image} />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
      </View>

      <View style={styles.content}>
          <View style={styles.headerRow}>
              <View style={{flex: 1}}>
                  <Text style={styles.title}>{item.name}</Text>
                  <Text style={styles.restaurantName}>{item.restaurants?.name}</Text>
                   <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color="#9CA3AF" />
                      <Ionicons name="star" size={14} color="#9CA3AF" />
                      <Ionicons name="star" size={14} color="#9CA3AF" />
                      <Ionicons name="star" size={14} color="#9CA3AF" />
                      <Ionicons name="star-outline" size={14} color="#9CA3AF" />
                      <Text style={styles.ratingCount}>(0)</Text>
                   </View>
                   <View style={styles.priceRow}>
                       <Text style={styles.originalPrice}>750 Br</Text> 
                       <Text style={styles.currentPrice}>{item.price} Br</Text>
                   </View>
              </View>
              <View style={styles.badge}>
                  <Text style={styles.badgeText}>50.0% OFF</Text>
              </View>
          </View>
          
          <ScrollView style={styles.descriptionContainer}>
             <Text style={styles.sectionTitle}>Description</Text>
             <View style={styles.tagContainer}>
                 <View style={styles.tag}>
                     <Ionicons name="nutrition" size={16} color="#FFF" />
                     <Text style={styles.tagText}>Non-Veg</Text>
                 </View>
             </View>
             <Text style={styles.description}>{item.description || item.name}</Text>
          </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
          <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <View style={styles.totalValues}>
                   <Text style={[styles.totalLabel, {textDecorationLine: 'line-through', fontSize: 14}]}>750.00Br</Text>
                   <Text style={styles.grandTotal}>{totalPrice}Br</Text>
              </View>
          </View>
          
          <View style={styles.actionRow}>
              <View style={styles.counter}>
                  <TouchableOpacity onPress={decrement} style={styles.counterBtn}>
                      <Ionicons name="remove" size={20} color="#FFF" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{quantity}</Text>
                  <TouchableOpacity onPress={increment} style={styles.counterBtn}>
                      <Ionicons name="add" size={20} color="#000" />
                  </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.orderButton} onPress={handleAddToCart}>
                  <Text style={styles.orderButtonText}>Order Now</Text>
              </TouchableOpacity>
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#111827' },
  imageContainer: { width: '100%', height: 300, position: 'relative' },
  image: { width: '100%', height: '100%' },
  backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  content: {
      flex: 1,
      backgroundColor: '#111827',
      marginTop: -20,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
  },
  headerRow: { 
      flexDirection: 'row', 
      justifyContent: 'space-between',
      marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  restaurantName: { fontSize: 14, color: '#F59E0B', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 8 },
  ratingCount: { color: '#9CA3AF', fontSize: 12, marginLeft: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  originalPrice: { color: '#6B7280', textDecorationLine: 'line-through', fontSize: 16 },
  currentPrice: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  badge: { 
      backgroundColor: '#F59E0B', 
      paddingHorizontal: 8, 
      paddingVertical: 4, 
      borderRadius: 4, 
      height: 24,
      justifyContent: 'center',
  },
  badgeText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
  
  descriptionContainer: { flex: 1 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  tagContainer: { flexDirection: 'row', marginBottom: 12 },
  tag: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: '#374151', 
      paddingHorizontal: 12, 
      paddingVertical: 6, 
      borderRadius: 20,
      gap: 6,
  },
  tagText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  description: { color: '#9CA3AF', fontSize: 14, lineHeight: 22 },

  footer: {
      padding: 24,
      borderTopWidth: 1,
      borderTopColor: '#374151',
      backgroundColor: '#111827',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  totalLabel: { color: '#F59E0B', fontSize: 14 },
  totalValues: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grandTotal: { color: '#F59E0B', fontSize: 18, fontWeight: 'bold' },
  
  actionRow: { flexDirection: 'row', gap: 16 },
  counter: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: '#1F2937', 
      borderRadius: 24, 
      padding: 4,
      borderWidth: 1,
      borderColor: '#374151'
  },
  counterBtn: {
     width: 40,
     height: 40,
     borderRadius: 20,
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: '#374151' 
  },
  counterValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 16 },
  
  orderButton: {
      flex: 1,
      backgroundColor: '#F59E0B',
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      height: 50,
  },
  orderButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});
