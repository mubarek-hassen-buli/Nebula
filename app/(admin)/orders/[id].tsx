import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useQuery } from '@tanstack/react-query';
import { useOrders } from '../../../lib/hooks/useOrders';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getOrder, updateStatus } = useOrders();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id as string),
    enabled: !!id,
  });

  if (isLoading || !order) {
    return (
      <SafeAreaView style={[styles.safeArea, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{color: '#FFF'}}>Loading Order...</Text>
      </SafeAreaView>
    );
  }

  const handleUpdateStatus = (newStatus: any) => {
    updateStatus.mutate({ id: order.id, status: newStatus });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Order #{order.id.slice(0, 5)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: order.status === 'delivered' ? '#10B981' : '#3B82F6' }]} />
            <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.timeText}>Placed at: {new Date(order.created_at).toLocaleString()}</Text>
          
          <View style={styles.actionButtons}>
            {order.status !== 'delivered' && order.status !== 'cancelled' ? (
              <>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => handleUpdateStatus('delivered')}
                >
                  <Text style={styles.primaryButtonText}>Mark Delivered</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => handleUpdateStatus('cancelled')}
                >
                  <Text style={styles.secondaryButtonText}>Cancel Order</Text>
                </TouchableOpacity>
              </>
            ) : (
                <Text style={{color: '#9CA3AF'}}>Order is {order.status}</Text>
            )}
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.customerInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="#9CA3AF" />
            </View>
            <View>
              <Text style={styles.customerName}>{order.profiles?.full_name || 'Guest'}</Text>
              <Text style={styles.customerPhone}>{order.profiles?.phone_number || 'No Phone'}</Text>
            </View>
            <TouchableOpacity style={styles.callButton}>
              <Ionicons name="call" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.addressRow}>
            <Ionicons name="location" size={20} color="#F97316" />
            <Text style={styles.addressText}>No Address Stored yet</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.order_items?.map((item: any) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityText}>{item.quantity}x</Text>
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.menu_item?.name || 'Unknown Item'}</Text>
                {/* Options would go here if we had them in DB */}
              </View>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            </View>
          ))}
          
          <View style={styles.divider} />
          
          <View style={[styles.summaryRow, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${order.total_amount?.toFixed(2)}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  sectionTitle: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6', // Blue for Preparing
    marginRight: 8,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timeText: {
    color: '#9CA3AF',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#EF4444', // Red text
    fontWeight: '600',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  customerPhone: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  callButton: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addressText: {
    color: '#FFFFFF',
    flex: 1,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  quantityBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  quantityText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  itemOption: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  itemPrice: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#9CA3AF',
  },
  summaryValue: {
    color: '#FFFFFF',
  },
  totalLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#16A34A',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
