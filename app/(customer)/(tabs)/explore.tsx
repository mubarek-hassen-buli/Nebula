import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase/client';
import { useCartStore } from '../../../store/cartStore';

export default function ExploreScreen() {
    const router = useRouter();
    const { addItem } = useCartStore();

    // Fetch popular/available items (mocking favorites for now as we don't have a favorites table per user yet)
    const { data: items } = useQuery({
        queryKey: ['explore-items'],
        queryFn: async () => {
             const { data, error } = await supabase
                .from('menu_items')
                .select('*, restaurants(name)')
                .eq('is_available', true)
                .limit(20);
             if (error) throw error;
             return data;
        }
    });

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({ pathname: '/(customer)/dish/[id]', params: { id: item.id } } as any)}
        >
            <Image source={{ uri: item.image_url || 'https://via.placeholder.com/200' }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.resName}>{item.restaurants?.name}</Text>
                <View style={styles.row}>
                    <Text style={styles.price}>${item.price}</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={() => addItem(item)}>
                         <Ionicons name="cart-outline" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Explore Favorites</Text>
                <Ionicons name="search" size={24} color="#FFF" />
            </View>
            <FlatList
                data={items}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={{ gap: 16 }}
                contentContainerStyle={styles.list}
                renderItem={renderItem}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
    list: { paddingBottom: 100 },
    
    card: { flex: 1, backgroundColor: '#1F2937', borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
    image: { width: '100%', height: 120 },
    info: { padding: 12 },
    name: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
    resName: { color: '#9CA3AF', fontSize: 12, marginBottom: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    price: { color: '#F59E0B', fontWeight: 'bold', fontSize: 16 },
    addBtn: { backgroundColor: '#F59E0B', padding: 6, borderRadius: 8 },
});
