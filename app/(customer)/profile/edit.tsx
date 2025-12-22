import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { upsertProfile } from '../../../lib/supabase/auth';
import { useAuthStore } from '../../../store/authStore';

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, user, refreshProfile } = useAuthStore();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    
    if (!fullName.trim()) {
      Alert.alert(t('common.error'), t('profile.fullName'));
      return;
    }

    setIsLoading(true);
    try {
      await upsertProfile(user.id, { full_name: fullName.trim() });
      await refreshProfile();
      Alert.alert(t('common.success'), t('profile.saveChanges') + '!');
      router.back();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.editProfile')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {profile?.avatar_url ? (
                <View style={styles.avatar}>
                  <Text style={styles.avatarInitial}>
                    {profile.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'G'}
                  </Text>
                </View>
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarInitial}>
                    {fullName.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'G'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.avatarHint}>{t('profile.profile')}</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.label}>{t('profile.fullName')}</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('profile.fullName')}
              placeholderTextColor="#6B7280"
            />

            <Text style={styles.label}>{t('profile.email')}</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.email || ''}
              editable={false}
              placeholderTextColor="#6B7280"
            />

            <View style={styles.infoCard}>
              <Ionicons name="star" size={20} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>{t('profile.rewardPoints')}</Text>
                <Text style={styles.infoValue}>{profile?.reward_points || 0} points</Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  
  content: { flex: 1 },
  scrollContent: { padding: 20 },
  
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: { marginBottom: 12 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1F2937',
  },
  avatarInitial: { fontSize: 40, fontWeight: 'bold', color: '#FFF' },
  avatarHint: { color: '#9CA3AF', fontSize: 14 },
  
  formSection: { marginBottom: 24 },
  label: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  disabledInput: { opacity: 0.6 },
  
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  infoTitle: { color: '#9CA3AF', fontSize: 14 },
  infoValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  
  saveButton: {
    backgroundColor: '#F59E0B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});
