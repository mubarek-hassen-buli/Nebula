import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase/client';
import { useCartStore } from '../../../store/cartStore';
import { Category, MenuItem, Restaurant } from '../../../types/database';

export default function RestaurantDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const restaurantId = typeof id === 'string' ? id : '';
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const { addItem, items: cartItems, restaurantId: cartRestaurantId, clearCart, getTotalPrice, getItemCount } = useCartStore();

  // 1. Fetch Restaurant Details
  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase.from('restaurants').select('*').eq('id', restaurantId).single();
      if (error) throw error;
      return data as Restaurant;
    },
    enabled: !!restaurantId,
  });

  // 2. Fetch Menu Items with Categories
  const { data: menuItems } = useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*, categories(*)')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true);
      if (error) throw error;
      return data as (MenuItem & { categories: Category | null })[];
    },
    enabled: !!restaurantId,
  });

  // Unique Categories from items
  const categories = ['All', ...Array.from(new Set(menuItems?.map(i => i.categories?.name || 'Other').filter(Boolean)))];

  const filteredItems = menuItems?.filter(item => 
      selectedCategory === 'All' || (item.categories?.name || 'Other') === selectedCategory
  );

  const handleAddToCart = (item: MenuItem) => {
      if (cartRestaurantId && cartRestaurantId !== restaurantId) {
          Alert.alert(
              'Start new basket?',
              'Adding this item will clear your current basket from another restaurant.',
              [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                      text: 'New Basket', 
                      style: 'destructive',
                      onPress: () => {
                          clearCart();
                          addItem(item);
                      } 
                   }
              ]
          );
      } else {
          addItem(item);
      }
  };

  const cartTotal = getTotalPrice();
  const cartCount = getItemCount();

  if (!restaurant) {
      return <View style={styles.loading}><Text style={{color:'white'}}>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.heroContainer}>
          <Image source={{ uri: restaurant.image_url || 'https://via.placeholder.com/500' }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
          {/* Restaurant Info */}
          <View style={styles.resInfo}>
              <Text style={styles.resName}>{restaurant.name}</Text>
              <View style={styles.resMeta}>
                 <Ionicons name="star" size={16} color="#F59E0B" />
                 <Text style={styles.resRating}>4.8 (500+)</Text>
                 <Text style={styles.dot}>•</Text>
                 <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                 <Text style={styles.resTime}>30-45 min</Text>
              </View>
              <Text style={styles.resDesc}>{restaurant.description}</Text>
          </View>

          {/* Category Tabs */}
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catTabs}>
                {categories.map(cat => (
                    <TouchableOpacity 
                        key={cat} 
                        style={[styles.catTab, selectedCategory === cat && styles.catTabActive]}
                        onPress={() => setSelectedCategory(cat)}
                    >
                        <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
          </View>

          {/* Menu List */}
          <FlatList
             data={filteredItems}
             keyExtractor={item => item.id}
             contentContainerStyle={styles.menuList}
             renderItem={({ item }) => (
                 <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => router.push({ pathname: '/(customer)/dish/[id]', params: { id: item.id } } as any)}
                 >
                     <View style={styles.menuInfo}>
                         <Text style={styles.menuName}>{item.name}</Text>
                         <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
                         <Text style={styles.menuDesc} numberOfLines={2}>{item.description}</Text>
                     </View>
                     <View style={styles.menuImageContainer}>
                         <Image source={{ uri: item.image_url || 'https://via.placeholder.com/200' }} style={styles.menuImage} />
                         <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
                             <Ionicons name="add" size={20} color="#000" />
                         </TouchableOpacity>
                     </View>
                 </TouchableOpacity>
             )}
          />
      </View>

      {/* View Basket Floater */}
      {cartCount > 0 && (
          <View style={styles.basketContainer}>
              <TouchableOpacity style={styles.basketButton} onPress={() => router.push('/(customer)/(tabs)/cart' as any)}>
                  <View style={styles.basketCount}>
                      <Text style={styles.basketCountText}>{cartCount}</Text>
                  </View>
                  <Text style={styles.basketText}>View Basket</Text>
                  <Text style={styles.basketTotal}>${cartTotal.toFixed(2)}</Text>
              </TouchableOpacity>
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#111827' },
  heroContainer: { height: 250, width: '100%', position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { 
      ...StyleSheet.absoluteFillObject, 
      backgroundColor: 'rgba(0,0,0,0.3)' 
  },
  backButton: {
      position: 'absolute',
      top: 40,
      left: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  contentContainer: {
      flex: 1,
      backgroundColor: '#111827',
      marginTop: -24,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 24,
  },
  resInfo: { paddingHorizontal: 20, marginBottom: 20 },
  resName: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  resMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  resRating: { color: '#FFF', fontWeight: '600', marginLeft: 4, fontSize: 14 },
  dot: { color: '#6B7280', marginHorizontal: 8 },
  resTime: { color: '#9CA3AF', marginLeft: 4, fontSize: 14 },
  resDesc: { color: '#D1D5DB', fontSize: 14, lineHeight: 20 },
  
  catTabs: { paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  catTab: { 
      paddingHorizontal: 16, 
      paddingVertical: 8, 
      borderRadius: 20, 
      backgroundColor: '#1F2937', 
      borderWidth: 1, 
      borderColor: '#374151' 
  },
  catTabActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  catText: { color: '#D1D5DB', fontWeight: '500' },
  catTextActive: { color: '#000', fontWeight: 'bold' },

  menuList: { paddingHorizontal: 20, paddingBottom: 100 },
  menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#1F2937',
  },
  menuInfo: { flex: 1, marginRight: 16 },
  menuName: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  menuPrice: { fontSize: 14, color: '#F59E0B', fontWeight: '600', marginBottom: 6 },
  menuDesc: { fontSize: 13, color: '#9CA3AF', lineHeight: 18 },
  menuImageContainer: { position: 'relative' },
  menuImage: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#374151' },
  addButton: {
      position: 'absolute',
      bottom: -10,
      right: -10,
      backgroundColor: '#F59E0B',
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: '#111827',
  },

  basketContainer: {
      position: 'absolute',
      bottom: 30,
      left: 20,
      right: 20,
  },
  basketButton: {
      backgroundColor: '#F59E0B',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderRadius: 16,
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
  },
  basketCount: {
      backgroundColor: '#000',
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
  },
  basketCountText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  basketText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  basketTotal: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});
