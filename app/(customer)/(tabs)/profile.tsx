import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../../store/authStore';

export default function CustomerProfileScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
              await signOut();
              router.replace('/(auth)/sign-in' as any);
          } 
      }
    ]);
  };

  const renderOption = (icon: any, title: string, showArrow = true, rightElement?: React.ReactNode) => (
      <TouchableOpacity style={styles.optionRow}>
          <View style={styles.optionLeft}>
              <Ionicons name={icon} size={22} color="#FFF" style={{ width: 30 }} />
              <Text style={styles.optionText}>{title}</Text>
          </View>
          {rightElement || (showArrow && <Ionicons name="chevron-forward" size={20} color="#6B7280" />)}
      </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Yellow Header */}
      <View style={styles.header}>
          <View style={styles.profileInfo}>
              {profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                  <View style={styles.avatarFallback}>
                      <Ionicons name="person" size={40} color="#9CA3AF" />
                  </View>
              )}
              <View>
                  <Text style={styles.userName}>{profile?.full_name || 'Guest User'}</Text>
                  <Text style={styles.userSubtext}>{profile ? 'View Interface' : 'Login to view all features'}</Text>
              </View>
          </View>
      </View>

      <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.sectionCard}>
              {renderOption("person-outline", "Profile")}
              <View style={styles.divider} />
              {renderOption("map-outline", "My Address")}
              <View style={styles.divider} />
              {renderOption("language-outline", "Language")}
              <View style={styles.divider} />
              {renderOption("moon-outline", "Dark Mode", false, <Switch value={true} trackColor={{false: '#767577', true: '#F59E0B'}} thumbColor={'#f4f3f4'} />)}
          </View>

          <Text style={styles.sectionTitle}>Promotional Activity</Text>
          <View style={styles.sectionCard}>
              {renderOption("ticket-outline", "Coupon")}
          </View>

          <Text style={styles.sectionTitle}>Earnings</Text>
          <View style={styles.sectionCard}>
              {renderOption("people-outline", "Join as a Delivery Man")}
              <View style={styles.divider} />
              {renderOption("storefront-outline", "Open Restaurant", true, <Ionicons name="chevron-forward" size={20} color="#6B7280" />)}
          </View>
          
          <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
              <Text style={styles.logoutText}>Log Out</Text>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
          
          <View style={{height: 100}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { 
      backgroundColor: '#F59E0B', 
      paddingTop: 60, 
      paddingBottom: 30, 
      paddingHorizontal: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
  },
  profileInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#FFF' },
  avatarFallback: { 
      width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFF', 
      justifyContent: 'center', alignItems: 'center' 
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  userSubtext: { fontSize: 14, color: '#333' },

  content: { padding: 20 },
  sectionTitle: { color: '#F59E0B', fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
  sectionCard: { backgroundColor: '#1F2937', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 16 },
  
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionText: { color: '#FFF', fontSize: 16 },
  divider: { height: 1, backgroundColor: '#374151', marginLeft: 42 },

  logoutBtn: {
      flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
      marginTop: 30, backgroundColor: '#1F2937', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#374151'
  },
  logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 },
});
