import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock Data removed. Using real data via useMenu hook.

import { useMenu } from '../../../lib/hooks/useMenu';
import { useRestaurants } from '../../../lib/hooks/useRestaurants';

export default function MenuScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const restaurantId = typeof params.restaurantId === 'string' ? params.restaurantId : undefined;
  
  const { restaurants } = useRestaurants();
  // Find restaurant name if possible for display
  const restaurantName = restaurants?.find(r => r.id === restaurantId)?.name || 'Restaurant Menu';

  const { categories, menuItems, toggleAvailability, deleteItem } = useMenu(restaurantId);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [search, setSearch] = useState('');

  const categoryNames = ['All Items', ...(categories?.map(c => c.name) || [])];

  const filteredItems = (menuItems || []).filter((item) => {
    // Check if item has a category object joined.
    const itemCategoryName = item.categories?.name;
    const matchesCategory = selectedCategory === 'All Items' || itemCategoryName === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggle = (id: string, current: boolean) => {
    toggleAvailability.mutate({ id, isAvailable: !current });
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Dish',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteItem.mutate(id) 
        },
      ]
    );
  };

  // Determine Title
  const headerTitle = restaurantId 
    ? (restaurants?.find(r => r.id === restaurantId)?.name || 'Restaurant Menu')
    : 'All Menu Items';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {restaurantId ? (
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={{width: 24}} /> // Spacer
          )}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
            {categoryNames.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listCount}>{filteredItems.length} Items Listed</Text>
        </View>

        {/* Menu Items List */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Image 
                  source={{ uri: item.image_url || 'https://via.placeholder.com/400' }} 
                  style={styles.image} 
                  resizeMode="cover"
                />
                {!item.is_available && (
                  <View style={styles.soldOutOverlay}>
                    <Text style={styles.soldOutText}>UNAVAILABLE</Text>
                  </View>
                )}
                
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.actionIcons}>
                      <TouchableOpacity 
                          onPress={() => router.push({ pathname: '/(admin)/menu-item/create', params: { id: item.id, restaurantId: item.restaurant_id } } as any)}
                          style={styles.iconButton}
                      >
                        <Ionicons name="pencil" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                       <TouchableOpacity 
                          onPress={() => handleDelete(item.id, item.name)}
                          style={[styles.iconButton, { marginLeft: 8 }]}
                      >
                        <Ionicons name="trash" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Restaurant Name Label */}
                  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                    <Ionicons name="storefront" size={12} color="#9CA3AF" style={{marginRight: 4}} />
                    <Text style={{color: '#9CA3AF', fontSize: 12, fontWeight: '500'}}>
                      {(item as any).restaurants?.name || 'Unknown Restaurant'}
                    </Text>
                  </View>

                  <Text style={styles.categoryLabel}>{item.categories?.name || 'Uncategorized'}</Text>
                  <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.price, !item.is_available && styles.priceDisabled]}>
                      ${item.price.toFixed(2)}
                    </Text>
                    <TouchableOpacity style={[
                        styles.toggle,
                        { backgroundColor: item.is_available ? '#16A34A' : '#4B5563' }
                      ]}
                      onPress={() => handleToggle(item.id, item.is_available)}
                      >
                        <View style={[
                          styles.toggleKnob,
                          { transform: [{ translateX: item.is_available ? 14 : 2 }] }
                        ]} />
                      </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
        />

        {/* Floating Add Button */}
        <TouchableOpacity style={styles.fab} onPress={() => router.push({ pathname: '/(admin)/menu-item/create', params: { restaurantId } } as any)}>
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  categoriesContainer: {
    height: 50,
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  categoryChipActive: {
    backgroundColor: '#16A34A', // Green
    borderColor: '#16A34A',
  },
  categoryText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  listCount: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  reorderText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 80, // Space for FAB
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardContent: {
    flexDirection: 'row',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#374151',
  },
  soldOutOverlay: {
    position: 'absolute',
    top: 30,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    transform: [{ rotate: '-15deg' }],
  },
  soldOutText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
  },
  categoryLabel: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  priceDisabled: {
    color: '#6B7280',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockStatus: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  hiddenText: {
    color: '#4B5563',
  },
  toggle: {
    width: 36,
    height: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      padding: 20,
  },
  modalContent: {
      backgroundColor: '#1F2937',
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: '#374151',
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 16,
  },
  input: {
      backgroundColor: '#111827',
      borderRadius: 8,
      padding: 12,
      color: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#374151',
      marginBottom: 20,
  },
  modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
  },
  cancelButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
  },
  cancelText: {
      color: '#9CA3AF',
      fontWeight: '600',
  },
  saveButton: {
      backgroundColor: '#16A34A',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
  },
  saveText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
  },
});
