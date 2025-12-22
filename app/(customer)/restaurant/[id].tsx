import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase/client';
import { useCartStore } from '../../../store/cartStore';
import { MenuItem } from '../../../types/database';

export default function RestaurantDetailsScreen() {
  const { id } = useLocalSearchParams();
  const restaurantId = typeof id === 'string' ? id : '';
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { addItem, items: cartItems, restaurantId: cartRestaurantId, clearCart, getTotalPrice, getItemCount } = useCartStore();

  const { data: restaurant, isLoading: isResLoading } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!restaurantId,
  });

  const { data: menuItems, isLoading: isMenuLoading } = useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*, categories(name)')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true);
      if (error) throw error;
      return data as (MenuItem & { categories: { name: string } })[];
    },
    enabled: !!restaurantId,
  });

  const { data: categories } = useQuery({
      queryKey: ['categories'],
      queryFn: async () => {
          const { data } = await supabase.from('categories').select('*');
          return data || [];
      }
  });

  // NEW: Fetch Average Rating
  const { data: ratingData, isLoading: isRatingLoading } = useQuery({
      queryKey: ['rating', restaurantId],
      queryFn: async () => {
          const { data, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('restaurant_id', restaurantId) as any;
          
          if (error) {
              console.log('Error fetching ratings:', error);
              return { average: 0, count: 0 };
          }
          
          if (!data || data.length === 0) return { average: 0, count: 0 };
          
          const total = data.reduce((acc: number, curr: any) => acc + curr.rating, 0);
          return {
              average: (total / data.length).toFixed(1),
              count: data.length
          };
      },
      enabled: !!restaurantId
  });

  const handleAddToCart = (item: MenuItem) => {
      addItem(item);
  };

  if (isResLoading || isMenuLoading || !restaurant) {
     return <View style={styles.loading}><ActivityIndicator color="#F59E0B" size="large" /></View>;
  }

  const uniqueCategories = ["All", ...new Set(menuItems?.map(i => i.categories?.name).filter(Boolean))];
  const filteredItems = selectedCategory === "All" 
      ? menuItems 
      : menuItems?.filter(i => i.categories?.name === selectedCategory);

  const cartCount = getItemCount();
  const cartTotal = getTotalPrice();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Hero Image */}
      <View style={styles.heroContainer}>
          <Image source={{ uri: restaurant.image_url || 'https://via.placeholder.com/500' }} style={styles.heroImage} />
          <View style={styles.overlay} />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
      </View>

      <View style={styles.content}>
          <Text style={styles.resName}>{restaurant.name}</Text>
          <View style={styles.metaRow}>
              <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="#000" />
                  <Text style={styles.ratingText}>
                      {ratingData?.average || 'New'} <Text style={{fontWeight: 'normal'}}>({ratingData?.count || 0})</Text>
                  </Text>
              </View>
              <Text style={styles.metaText}>• 20-30 min • Free Delivery</Text>
          </View>
          <Text style={styles.description}>{restaurant.description || 'No description available.'}</Text>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
                  {uniqueCategories.map(cat => (
                      <TouchableOpacity 
                          key={cat} 
                          style={[styles.catPill, selectedCategory === cat && styles.activeCatPill]}
                          onPress={() => setSelectedCategory(cat!)}
                      >
                          <Text style={[styles.catText, selectedCategory === cat && styles.activeCatText]}>{cat}</Text>
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

      {/* Sticky Basket Button */}
      {cartCount > 0 && (
          <View style={styles.basketContainer}>
              <TouchableOpacity style={styles.basketButton} onPress={() => router.push('/(customer)/(tabs)/cart' as any)}>
                  <View style={styles.basketCountBadge}>
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
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  backButton: { 
      position: 'absolute', top: 50, left: 20, width: 40, height: 40, borderRadius: 20, 
      backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' 
  },
  
  content: { 
      flex: 1, backgroundColor: '#111827', marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24, 
      paddingTop: 24, overflow: 'hidden'
  },
  resName: { fontSize: 26, fontWeight: 'bold', color: '#FFF', paddingHorizontal: 20, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12, gap: 10 },
  ratingBadge: { 
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', 
      paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 
  },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#000' },
  metaText: { color: '#9CA3AF', fontSize: 14 },
  description: { color: '#9CA3AF', paddingHorizontal: 20, marginBottom: 20, lineHeight: 20 },

  categoriesContainer: { marginBottom: 10 },
  catList: { paddingHorizontal: 20, gap: 10, paddingBottom: 10 },
  catPill: { 
      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, 
      backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151' 
  },
  activeCatPill: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  catText: { color: '#9CA3AF', fontWeight: '600' },
  activeCatText: { color: '#000' },

  menuList: { paddingHorizontal: 20, paddingBottom: 100 },
  menuItem: { 
      flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, 
      borderBottomWidth: 1, borderBottomColor: '#1F2937', paddingBottom: 20 
  },
  menuInfo: { flex: 1, marginRight: 16 },
  menuName: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  menuPrice: { fontSize: 14, color: '#F59E0B', fontWeight: 'bold', marginBottom: 4 },
  menuDesc: { fontSize: 12, color: '#6B7280' },
  menuImageContainer: { position: 'relative' },
  menuImage: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#374151' },
  addButton: {
      position: 'absolute', bottom: -10, right: -10, backgroundColor: '#FFF',
      width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center',
      shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4
  },

  basketContainer: {
      position: 'absolute', bottom: 30, left: 20, right: 20,
  },
  basketButton: {
      backgroundColor: '#F59E0B', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      padding: 16, borderRadius: 16, shadowColor: "#F59E0B", shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 8
  },
  basketCountBadge: { 
      backgroundColor: '#000', width: 24, height: 24, borderRadius: 12, 
      justifyContent: 'center', alignItems: 'center' 
  },
  basketCountText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  basketText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  basketTotal: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});
