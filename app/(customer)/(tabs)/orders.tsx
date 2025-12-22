import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase/client';
import { useAuthStore } from '../../../store/authStore';

export default function CustomerOrdersScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*, restaurants(name, image_url)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Pending': return '#F59E0B';
          case 'Preparing': return '#3B82F6';
          case 'Out for Delivery': return '#8B5CF6';
          case 'Delivered': return '#10B981';
          case 'Cancelled': return '#EF4444';
          default: return '#9CA3AF';
      }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push({ pathname: '/(customer)/orders/[id]', params: { id: item.id } } as any)}
    >
        <View style={styles.cardHeader}>
            <Text style={styles.resName}>{item.restaurants?.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
            </View>
        </View>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
        <View style={styles.divider} />
        <View style={styles.cardFooter}>
            <Text style={styles.price}>${item.total_amount.toFixed(2)}</Text>
            <View style={styles.reorderBtn}>
                <Text style={styles.reorderText}>Track Order</Text>
                <Ionicons name="chevron-forward" size={16} color="#F59E0B" />
            </View>
        </View>
    </TouchableOpacity>
  );

  if (!profile) {
      return (
          <SafeAreaView style={[styles.container, styles.center]}>
              <Text style={styles.emptyText}>Please login to view orders</Text>
              <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/sign-in' as any)}>
                  <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>
          </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      
      {isLoading ? (
          <ActivityIndicator size="large" color="#F59E0B" style={{marginTop: 40}} />
      ) : (
          <FlatList
              data={orders}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.list}
              renderItem={renderItem}
              ListEmptyComponent={
                  <View style={styles.center}>
                      <Ionicons name="receipt-outline" size={64} color="#374151" />
                      <Text style={styles.emptyText}>No orders yet</Text>
                  </View>
              }
          />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  list: { paddingBottom: 100 },
  
  card: { backgroundColor: '#1F2937', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  resName: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  date: { color: '#9CA3AF', fontSize: 13, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#374151', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  
  reorderBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reorderText: { color: '#F59E0B', fontWeight: '600' },

  emptyText: { color: '#9CA3AF', fontSize: 16, marginTop: 12 },
  loginBtn: { marginTop: 20, backgroundColor: '#F59E0B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  loginText: { color: '#000', fontWeight: 'bold' },
});
