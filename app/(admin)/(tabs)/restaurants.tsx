import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRestaurants } from '../../../lib/hooks/useRestaurants';

export default function RestaurantsScreen() {
  const router = useRouter();
  const { restaurants, deleteRestaurant, toggleStatus } = useRestaurants();
  const [search, setSearch] = useState('');

  const filteredRestaurants = (restaurants || []).filter((r) => 
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Restaurant',
      `Are you sure you want to delete "${name}"? This will delete all its menu items too.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteRestaurant.mutate(id) 
        },
      ]
    );
  };

  const handleToggle = (id: string, current: boolean) => {
    toggleStatus.mutate({ id, isActive: !current });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/(admin)/restaurant/create' as any)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Restaurant</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Image 
                  source={{ uri: item.image_url || 'https://via.placeholder.com/400' }} 
                  style={styles.image} 
                />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.is_active ? 'rgba(22, 163, 74, 0.2)' : 'rgba(220, 38, 38, 0.2)' }
                  ]}>
                    <View style={[
                      styles.statusDot, 
                      { backgroundColor: item.is_active ? '#16A34A' : '#DC2626' }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      { color: item.is_active ? '#16A34A' : '#DC2626' }
                    ]}>
                      {item.is_active ? 'OPEN' : 'CLOSED'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push({ pathname: '/(admin)/restaurant/create', params: { id: item.id } } as any)}
                >
                  <View style={[styles.iconBox, { backgroundColor: '#3B82F6' }]}>
                    <Ionicons name="pencil" size={16} color="#FFF" />
                  </View>
                  <Text style={styles.actionLabel}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                   style={styles.actionButton}
                   onPress={() => router.push({ pathname: '/(admin)/(tabs)/menu', params: { restaurantId: item.id } } as any)}
                >
                  <View style={[styles.iconBox, { backgroundColor: '#F59E0B' }]}>
                    <Ionicons name="restaurant" size={16} color="#FFF" />
                  </View>
                  <Text style={styles.actionLabel}>Dishes</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleToggle(item.id, item.is_active)}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.is_active ? '#6B7280' : '#10B981' }]}>
                    <Ionicons name={item.is_active ? "power" : "play"} size={16} color="#FFF" />
                  </View>
                  <Text style={styles.actionLabel}>{item.is_active ? 'Close' : 'Open'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDelete(item.id, item.name)}
                >
                  <View style={[styles.iconBox, { backgroundColor: '#EF4444' }]}>
                    <Ionicons name="trash" size={16} color="#FFF" />
                  </View>
                  <Text style={styles.actionLabel}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  listContent: {
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#374151',
  },
  info: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    padding: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '500',
  },
});
