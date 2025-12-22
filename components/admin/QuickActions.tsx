import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const actions = [
  { id: 'add-rest', label: 'Add Rest.', icon: 'add' as const, path: '/(admin)/restaurant/create' },
  { id: 'reports', label: 'Reports', icon: 'bar-chart' as const, path: '/(admin)/(tabs)/dashboard' },
  { id: 'menu', label: 'Menu', icon: 'restaurant' as const, path: '/(admin)/(tabs)/menu' },
  { id: 'users', label: 'Staff', icon: 'people' as const, path: '/(admin)/(tabs)/settings' },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity 
            key={action.id} 
            style={styles.actionItem}
            onPress={() => {
              // Only navigate if path is different from current or if simple push needed
              router.push(action.path as any);
            }}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={action.icon} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.label}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937', // Light theme text
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    width: '22%',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1F2937', // Dark circle bg
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, // Stronger shadow for floating effect
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 12,
    color: '#6B7280', // Gray text
    fontWeight: '500',
  },
});
