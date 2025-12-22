import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase/client';
import { Category, MenuItem, Restaurant } from '../../../types/database';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  // 1. Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data as Category[];
    },
  });

  // 2. Fetch Featured Items (Trends) - Just a random selection for now
  const { data: trendingItems } = useQuery({
    queryKey: ['trending-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*, restaurants(name)')
        .eq('is_available', true)
        .limit(5);
      if (error) throw error;
      return data as (MenuItem & { restaurants: { name: string } })[];
    },
  });

  // 3. Fetch Restaurants (Best Reviewed - Mock sort for now)
  const { data: restaurants } = useQuery({
    queryKey: ['public-restaurants'],
    queryFn: async () => {
        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('is_active', true);
        if (error) throw error;
        return data as Restaurant[];
    }
  });

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.catItem}>
      <View style={styles.catIconContainer}>
         {/* Placeholder for category icons since we don't store them yet. Using first letter. */}
         <Text style={styles.catIconText}>{item.name.charAt(0)}</Text>
      </View>
      <Text style={styles.catName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderTrendCard = ({ item }: { item: MenuItem & { restaurants: { name: string } } }) => (
    <TouchableOpacity 
        style={styles.trendCard}
        onPress={() => router.push({ pathname: '/(customer)/dish/[id]', params: { id: item.id } } as any)}
    >
      <View style={styles.trendImageContainer}>
        <Image source={{ uri: item.image_url || 'https://via.placeholder.com/400' }} style={styles.trendImage} />
        <View style={styles.discountBadge}>
           <Text style={styles.discountText}>20% OFF</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.trendInfo}>
        <Text style={styles.trendRestaurant}>{item.restaurants?.name}</Text>
        <Text style={styles.trendName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.trendPriceRow}>
            <Text style={styles.trendPrice}>${item.price}</Text>
            <Text style={styles.trendOldPrice}>${(item.price * 1.2).toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRestaurantCard = (restaurant: Restaurant) => (
      <TouchableOpacity 
        key={restaurant.id} 
        style={styles.resCard}
        onPress={() => router.push({ pathname: '/(customer)/restaurant/[id]', params: { id: restaurant.id } } as any)}
      >
          <Image source={{ uri: restaurant.image_url || 'https://via.placeholder.com/400' }} style={styles.resImage} />
          <View style={styles.resInfo}>
              <View style={styles.resHeader}>
                  <Text style={styles.resName}>{restaurant.name}</Text>
                  <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.ratingText}>4.5</Text>
                  </View>
              </View>
              <Text style={styles.resDesc} numberOfLines={1}>{restaurant.description}</Text>
          </View>
      </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Header / Search */}
        <View style={styles.header}>
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Are you hungry !!"
                    placeholderTextColor="#6B7280"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>What's on Your Mind?</Text>
                <TouchableOpacity>
                   <Ionicons name="arrow-forward-circle-outline" size={24} color="#F59E0B" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={renderCategory}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.catList}
            />
        </View>

        {/* Today's Trends */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Trends</Text>
            <Text style={styles.sectionSubtitle}>Here's what you might like to taste</Text>
            <FlatList
                data={trendingItems}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={renderTrendCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.trendList}
            />
        </View>

        {/* Best Reviewed (Restaurants) */}
        <View style={styles.section}>
             <Text style={styles.sectionTitle}>Best Favorites</Text>
             <View style={styles.resList}>
                 {restaurants?.map(renderRestaurantCard)}
             </View>
        </View>

        {/* Bottom Spacer for Tab Bar */}
        <View style={{ height: 100 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 24, // Pill shape
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
    marginTop: 4,
  },
  // Categories
  catList: {
    gap: 16,
  },
  catItem: {
    alignItems: 'center',
    width: 70,
  },
  catIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  catIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  catName: {
    color: '#D1D5DB',
    fontSize: 12,
    textAlign: 'center',
  },
  // Trends
  trendList: {
    gap: 16,
    paddingRight: 20,
  },
  trendCard: {
    width: 200,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    overflow: 'hidden',
  },
  trendImageContainer: {
    height: 140,
    position: 'relative',
  },
  trendImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendInfo: {
    padding: 12,
  },
  trendRestaurant: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  trendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  trendPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trendOldPrice: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  // Restaurants
  resList: {
    gap: 16,
  },
  resCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  resImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  resInfo: {
    flex: 1,
    marginLeft: 16,
  },
  resHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resDesc: {
    color: '#9CA3AF',
    fontSize: 13,
  },
});
