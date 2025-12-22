import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import LanguageSelector from '../../../components/LanguageSelector';
import { useAuthStore } from '../../../store/authStore';

export default function CustomerProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, signOut, user } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert(t('auth.signOut'), t('common.cancel') + '?', [
      { text: t('common.cancel'), style: 'cancel' },
      { 
          text: t('auth.signOut'), 
          style: 'destructive', 
          onPress: async () => {
              await signOut();
              router.replace('/(auth)/sign-in' as any);
          } 
      }
    ]);
  };

  // Get initials from name or email
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'G';
  };

  const renderOption = (icon: any, title: string, onPress?: () => void, showArrow = true, rightElement?: React.ReactNode) => (
      <TouchableOpacity style={styles.optionRow} onPress={onPress}>
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
                      <Text style={styles.avatarInitial}>{getInitials()}</Text>
                  </View>
              )}
              <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{profile?.full_name || user?.email || 'Guest User'}</Text>
                  <Text style={styles.userSubtext}>{user?.email || 'Login to view all features'}</Text>
                  {profile && (
                      <View style={styles.rewardBadge}>
                          <Ionicons name="star" size={14} color="#F59E0B" />
                          <Text style={styles.rewardText}>{profile.reward_points || 0} Reward Points</Text>
                      </View>
                  )}
              </View>
          </View>
      </View>

      <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>{t('profile.general')}</Text>
          <View style={styles.sectionCard}>
              {renderOption("person-outline", t('profile.profile'), () => router.push('/(customer)/profile/edit' as any))}
              <View style={styles.divider} />
              {renderOption("map-outline", t('profile.myAddress'))}
              <View style={styles.divider} />
              <LanguageSelector />
              <View style={styles.divider} />
              {renderOption("moon-outline", t('profile.darkMode'), undefined, false, <Switch value={true} trackColor={{false: '#767577', true: '#F59E0B'}} thumbColor={'#f4f3f4'} />)}
          </View>

          <Text style={styles.sectionTitle}>{t('profile.promotional')}</Text>
          <View style={styles.sectionCard}>
              {renderOption("ticket-outline", t('profile.coupon'))}
          </View>

          <Text style={styles.sectionTitle}>{t('profile.earnings')}</Text>
          <View style={styles.sectionCard}>
              {renderOption("people-outline", t('profile.joinDelivery'))}
              <View style={styles.divider} />
              {renderOption("storefront-outline", t('profile.openRestaurant'), undefined, true, <Ionicons name="chevron-forward" size={20} color="#6B7280" />)}
          </View>
          
          <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
              <Text style={styles.logoutText}>{t('profile.logout')}</Text>
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
  avatarInitial: { fontSize: 32, fontWeight: 'bold', color: '#F59E0B' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  userSubtext: { fontSize: 14, color: '#333', marginTop: 2 },
  rewardBadge: { 
      flexDirection: 'row', alignItems: 'center', gap: 4, 
      marginTop: 6, backgroundColor: '#000', paddingHorizontal: 8, 
      paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' 
  },
  rewardText: { fontSize: 12, fontWeight: 'bold', color: '#FFF' },

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
