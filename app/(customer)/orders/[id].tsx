import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase/client';

// Define status steps
const STATUS_STEPS = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const orderId = typeof id === 'string' ? id : '';
  const router = useRouter();
  const queryClient = useQueryClient();

  const [realtimeStatus, setRealtimeStatus] = useState<string | null>(null);

  // 1. Fetch Order Details
  const { data: order, isLoading: isOrderLoading } = useQuery({
    queryKey: ['order-track', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, restaurants(*), order_items(*, menu_items(*))')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data as any;
    },
    enabled: !!orderId,
  });

  // 2. Realtime Subscription
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Order Updated:', payload);
          if (payload.new && payload.new.status) {
              setRealtimeStatus(payload.new.status);
              // Invalidate query to refresh full data if needed
              queryClient.invalidateQueries({ queryKey: ['order-track', orderId] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const currentStatus = realtimeStatus || order?.status || 'Pending';
  const activeStepIndex = STATUS_STEPS.indexOf(currentStatus);

  if (isOrderLoading || !order) {
      return <View style={styles.loading}><ActivityIndicator color="#F59E0B" size="large" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
              <Text style={styles.headerTitle}>Order #{orderId.slice(0, 8)}</Text>
              <Text style={styles.headerDate}>{new Date(order.created_at).toLocaleString()}</Text>
          </View>

          {/* Restaurant Info */}
          <View style={styles.resCard}>
              <Text style={styles.resName}>{order.restaurants?.name}</Text>
              <Text style={styles.resAddress}>{order.restaurants?.address || 'Restaurant Address Mock'}</Text>
          </View>

          {/* Timeline */}
          <View style={styles.timelineCard}>
              <Text style={styles.sectionTitle}>Order Status</Text>
              <View style={styles.timeline}>
                  {STATUS_STEPS.map((step, index) => {
                      const isActive = index <= activeStepIndex;
                      const isLast = index === STATUS_STEPS.length - 1;
                      return (
                          <View key={step} style={styles.stepRow}>
                              <View style={styles.stepIndicator}>
                                  <View style={[styles.dot, isActive && styles.activeDot]}>
                                      {index <= activeStepIndex && <Ionicons name="checkmark" size={12} color="#000" />}
                                  </View>
                                  {!isLast && <View style={[styles.line, index < activeStepIndex && styles.activeLine]} />}
                              </View>
                              <View style={styles.stepContent}>
                                  <Text style={[styles.stepLabel, isActive && styles.activeStepLabel]}>{step}</Text>
                                  {step === currentStatus && <Text style={styles.currentStatusText}>Current Status</Text>}
                              </View>
                          </View>
                      );
                  })}
              </View>
          </View>

          {/* Order Items */}
          <View style={styles.itemsCard}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              {order.order_items.map((item: any) => (
                  <View key={item.id} style={styles.itemRow}>
                      <Text style={styles.qtyBadge}>{item.quantity}x</Text>
                      <View style={{flex: 1}}>
                          <Text style={styles.itemName}>{item.menu_items?.name}</Text>
                          <Text style={styles.itemPrice}>${item.price}</Text>
                      </View>
                      <Text style={styles.rowTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
                  </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>${order.total_amount.toFixed(2)}</Text>
              </View>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#111827' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  headerDate: { color: '#9CA3AF', fontSize: 14, marginTop: 4 },

  resCard: { backgroundColor: '#1F2937', padding: 16, borderRadius: 16, marginBottom: 20 },
  resName: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  resAddress: { color: '#9CA3AF', fontSize: 14 },

  timelineCard: { backgroundColor: '#1F2937', padding: 20, borderRadius: 16, marginBottom: 20 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  timeline: { paddingLeft: 8 },
  stepRow: { flexDirection: 'row', minHeight: 60 },
  stepIndicator: { alignItems: 'center', marginRight: 16, width: 24 },
  dot: { 
      width: 24, height: 24, borderRadius: 12, backgroundColor: '#374151', 
      justifyContent: 'center', alignItems: 'center', zIndex: 2 
  },
  activeDot: { backgroundColor: '#F59E0B' },
  line: { width: 2, flex: 1, backgroundColor: '#374151', marginVertical: 4 },
  activeLine: { backgroundColor: '#F59E0B' },
  stepContent: { flex: 1, paddingTop: 2 },
  stepLabel: { color: '#6B7280', fontSize: 16 },
  activeStepLabel: { color: '#FFF', fontWeight: 'bold' },
  currentStatusText: { color: '#F59E0B', fontSize: 12, marginTop: 2 },

  itemsCard: { backgroundColor: '#1F2937', padding: 20, borderRadius: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  qtyBadge: { 
      backgroundColor: '#374151', paddingHorizontal: 8, paddingVertical: 4, 
      borderRadius: 8, color: '#FFF', fontWeight: 'bold', marginRight: 12 
  },
  itemName: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  itemPrice: { color: '#9CA3AF', fontSize: 14 },
  rowTotal: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  divider: { height: 1, backgroundColor: '#374151', marginVertical: 16 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billLabel: { color: '#9CA3AF', fontSize: 16 },
  totalValue: { color: '#F59E0B', fontSize: 24, fontWeight: 'bold' },
});
