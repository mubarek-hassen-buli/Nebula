import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DishCard from '../../components/DishCard';
import DishDetailModal from '../../components/DishDetailModal';
import { supabase } from '../../lib/supabase/client';
import { useCartStore } from '../../store/cartStore';
import { MenuItem } from '../../types/database';

export default function AllDishesScreen() {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState<(MenuItem & { restaurants?: { name: string } }) | null>(null);

  const { data: dishes, isLoading } = useQuery({
    queryKey: ['all-dishes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*, restaurants(name)')
        .eq('is_available', true)
        .order('name');
      
      if (error) throw error;
      return data as (MenuItem & { restaurants: { name: string } })[];
    },
  });

  const renderItem = ({ item }: { item: MenuItem & { restaurants: { name: string } } }) => (
    <View style={styles.gridItem}>
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>All Dishes</Text>
        <View style={{width: 40}} /> 
      </View>

      <FlatList
        data={dishes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />

      <DishDetailModal 
        visible={detailModalVisible} 
        onClose={() => setDetailModalVisible(false)} 
        item={selectedDish} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#1F2937',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100, // Space for bottom tab/footer
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '48%', // Approx half with spacing
  },
});
