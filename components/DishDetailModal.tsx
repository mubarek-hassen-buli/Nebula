import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCartStore } from '../store/cartStore';
import { MenuItem } from '../types/database';

interface DishDetailModalProps {
  visible: boolean;
  onClose: () => void;
  item: (MenuItem & { restaurants?: { name: string } }) | null;
}

export default function DishDetailModal({ visible, onClose, item }: DishDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  useEffect(() => {
    if (visible) setQuantity(1);
  }, [visible]);

  if (!item) return null;

  const handleAddToCart = () => {
    // Add item quantity times
    for(let i=0; i<quantity; i++) addItem(item);
    Alert.alert('Success', `${quantity} item(s) added to cart successfully!`);
    onClose();
  };

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => Math.max(1, q - 1));

  const totalPrice = (item.price * quantity).toFixed(2);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
            {/* Header Image */}
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image_url || 'https://via.placeholder.com/500' }} style={styles.image} />
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close-circle" size={32} color="rgba(0,0,0,0.6)" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.headerRow}>
                    <View style={{flex: 1}}>
                        <Text style={styles.title}>{item.name}</Text>
                        <Text style={styles.restaurantName}>{item.restaurants?.name}</Text>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Text style={styles.ratingCount}>4.5 (50+)</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.currentPrice}>{item.price} Br</Text>
                            <Text style={styles.originalPrice}>{(item.price * 1.2).toFixed(0)} Br</Text> 
                        </View>
                    </View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>20% OFF</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{item.description || "No description available for this delicious dish."}</Text>

                <View style={{height: 100}} /> 
            </ScrollView>

            {/* Footer - Fixed at bottom of modal */}
            <View style={styles.footer}>
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
                        <Text style={styles.orderButtonText}>Add to Cart - {totalPrice} Br</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%', // Taller for detail view
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
  },
  scrollContent: {
    flex: 1,
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    color: '#F59E0B',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingCount: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currentPrice: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  originalPrice: {
    color: '#6B7280',
    textDecorationLine: 'line-through',
    fontSize: 16,
  },
  badge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    height: 24,
    justifyContent: 'center',
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    backgroundColor: '#1F2937',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#374151',
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  counterValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    minWidth: 50,
    textAlign: 'center',
  },
  orderButton: {
    flex: 1,
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  orderButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
