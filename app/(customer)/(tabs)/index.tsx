import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase/client';
import { useCartStore } from '../../../store/cartStore';
import { Category, MenuItem, Restaurant } from '../../../types/database';

import DishCard from '../../../components/DishCard';
import DishDetailModal from '../../../components/DishDetailModal';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { addItem } = useCartStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Filter States
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);

  // Dish Detail Modal State
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState<(MenuItem & { restaurants?: { name: string } }) | null>(null);

  // 1. Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data as Category[];
    },
  });

  // 2. Fetch Featured Items (Trends)
  const { data: trendingItems } = useQuery({
    queryKey: ['trending-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*, restaurants(name), categories(name)')
        .eq('is_available', true)
        .limit(20);
      if (error) throw error;
      return data as (MenuItem & { restaurants: { name: string }, categories: { name: string } })[];
    },
  });

  // 3. Fetch Restaurants
  const { data: restaurants } = useQuery({
    queryKey: ['public-restaurants'],
    queryFn: async () => {
        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('is_active', true);
        if (error) throw error;
        // Mocking rating for now since it's not in DB
        const restaurants = data as Restaurant[];
        return restaurants.map(r => ({ ...r, rating: 3.5 + Math.random() * 1.5 }));
    }
  });

  // Filter trending items
  const filteredTrendingItems = trendingItems?.filter(item => {
    const matchesCategory = !selectedCategory || item.categories?.name === selectedCategory;
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    
    // Filter by Restaurant Selection
    const matchesRestaurant = selectedRestaurants.length === 0 || selectedRestaurants.includes(item.restaurant_id);
    
    return matchesCategory && matchesSearch && matchesRestaurant;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return 0;
  });

  // Filter restaurants
  const filteredRestaurants = restaurants?.filter(restaurant => {
    const matchesSearch = !search || restaurant.name.toLowerCase().includes(search.toLowerCase()) || 
           restaurant.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesRating = !minRating || restaurant.rating >= minRating;
    
    return matchesSearch && matchesRating;
  });

  const renderCategory = ({ item }: { item: Category }) => {
    // ... (renderCategory logic remains same)
    const isSelected = selectedCategory === item.name;
    return (
      <TouchableOpacity 
        style={styles.catItem}
        onPress={() => setSelectedCategory(isSelected ? null : item.name)}
      >
        <View style={[styles.catIconContainer, isSelected && styles.catIconContainerSelected]}>
          <Text style={styles.catIconText}>{item.emoji || item.name.charAt(0)}</Text>
        </View>
        <Text style={[styles.catName, isSelected && styles.catNameSelected]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderTrendCard = ({ item }: { item: MenuItem & { restaurants: { name: string } } }) => (
    <DishCard 
        item={item} 
        onPress={() => {
            setSelectedDish(item);
            setDetailModalVisible(true);
        }}
        onAdd={() => {
            addItem(item);
            Alert.alert('Success', 'Added to cart successfully!');
        }}
    />
  );

  const renderRestaurantCard = (restaurant: Restaurant & { rating: number }) => (
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
                      <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
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
            <Text style={styles.headerLogo}>Nebula</Text>
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput 
                    style={styles.searchInput}
                    placeholder={t('home.searchPlaceholder')}
                    placeholderTextColor="#6B7280"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>
        </View>

        {/* Filter Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isFilterVisible}
          onRequestClose={() => setIsFilterVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter & Sort</Text>
                <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScroll}>
                {/* Sort By Price */}
                <Text style={styles.filterLabel}>Sort by Price</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity 
                    style={[styles.filterChip, sortBy === 'price_asc' && styles.filterChipSelected]}
                    onPress={() => setSortBy(sortBy === 'price_asc' ? null : 'price_asc')}
                  >
                    <Text style={[styles.filterChipText, sortBy === 'price_asc' && styles.filterChipTextSelected]}>Low to High</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.filterChip, sortBy === 'price_desc' && styles.filterChipSelected]}
                    onPress={() => setSortBy(sortBy === 'price_desc' ? null : 'price_desc')}
                  >
                    <Text style={[styles.filterChipText, sortBy === 'price_desc' && styles.filterChipTextSelected]}>High to Low</Text>
                  </TouchableOpacity>
                </View>

                {/* Filter by Rating */}
                <Text style={styles.filterLabel}>Minimum Rating</Text>
                <View style={styles.filterOptions}>
                  {['3.5', '4.0', '4.5'].map((rating) => (
                    <TouchableOpacity 
                      key={rating}
                      style={[styles.filterChip, minRating === Number(rating) && styles.filterChipSelected]}
                      onPress={() => setMinRating(minRating === Number(rating) ? null : Number(rating))}
                    >
                      <Ionicons name="star" size={14} color={minRating === Number(rating) ? "#000" : "#F59E0B"} />
                      <Text style={[styles.filterChipText, minRating === Number(rating) && styles.filterChipTextSelected]}>{rating}+</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Filter by Restaurant */}
                <Text style={styles.filterLabel}>Restaurants</Text>
                <View style={styles.filterOptions}>
                  {restaurants?.map((res) => (
                    <TouchableOpacity 
                      key={res.id}
                      style={[styles.filterChip, selectedRestaurants.includes(res.id) && styles.filterChipSelected]}
                      onPress={() => {
                        if (selectedRestaurants.includes(res.id)) {
                          setSelectedRestaurants(prev => prev.filter(id => id !== res.id));
                        } else {
                          setSelectedRestaurants(prev => [...prev, res.id]);
                        }
                      }}
                    >
                      <Text style={[styles.filterChipText, selectedRestaurants.includes(res.id) && styles.filterChipTextSelected]}>{res.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={() => {
                    setSortBy(null);
                    setMinRating(null);
                    setSelectedRestaurants([]);
                  }}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={() => setIsFilterVisible(false)}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Categories */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('home.categoriesTitle')}</Text>
                <TouchableOpacity 
                  style={styles.filterButton}
                  onPress={() => setIsFilterVisible(true)}
                >
                   <Ionicons name="options-outline" size={24} color="#F59E0B" />
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
            <View style={styles.sectionHeader}>
                <View>
                    <Text style={styles.sectionTitle}>{t('home.trendsTitle')}</Text>
                    <Text style={styles.sectionSubtitle}>{t('home.trendsSubtitle')}</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/(customer)/dishes' as any)}>
                    <Text style={{color: '#F59E0B', fontWeight: 'bold'}}>See All</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={filteredTrendingItems}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={renderTrendCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.trendList}
            />
        </View>

        {/* Best Reviewed (Restaurants) */}
        <View style={styles.section}>
             <Text style={styles.sectionTitle}>{t('home.favoritesTitle')}</Text>
             <View style={styles.resList}>
                 {filteredRestaurants?.map(renderRestaurantCard)}
             </View>
        </View>

        {/* Bottom Spacer for Tab Bar */}
        <View style={{ height: 100 }} />

        {/* Dish Detail Modal */}
        <DishDetailModal 
            visible={detailModalVisible} 
            onClose={() => setDetailModalVisible(false)} 
            item={selectedDish} 
        />

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
  headerLogo: {
    fontFamily: 'Billabong',
    fontSize: 40,
    color: '#F59E0B',
    marginBottom: 16,
    paddingLeft: 4,
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
  catIconContainerSelected: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
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
  catNameSelected: {
    color: '#F59E0B',
    fontWeight: 'bold',
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
  // Filter Styles
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '70%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalScroll: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 12,
    marginTop: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#374151',
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipSelected: {
    backgroundColor: '#F59E0B20',
    borderColor: '#F59E0B',
  },
  filterChipText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  filterChipTextSelected: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    paddingBottom: 24,
  },
  resetButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
