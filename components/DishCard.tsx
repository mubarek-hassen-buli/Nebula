import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MenuItem } from '../types/database';

interface DishCardProps {
  item: MenuItem & { restaurants?: { name: string } };
  onPress: () => void;
  onAdd: () => void;
}

export default function DishCard({ item, onPress, onAdd }: DishCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image 
            source={{ uri: item.image_url || 'https://via.placeholder.com/400' }} 
            style={styles.image} 
        />
        <View style={styles.discountBadge}>
           <Text style={styles.discountText}>20% OFF</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={(e) => {
            e.stopPropagation();
            onAdd();
          }}
        >
          <Ionicons name="add" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.restaurantName} numberOfLines={1}>
            {item.restaurants?.name}
        </Text>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price} Br</Text>
          <Text style={styles.oldPrice}>{(item.price * 1.2).toFixed(0)} Br</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16, // Default spacing for horizontal lists
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  image: {
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
  info: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  oldPrice: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
});
