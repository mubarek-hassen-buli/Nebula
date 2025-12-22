import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { upsertProfile } from '../lib/supabase/auth';
import { useAuthStore } from '../store/authStore';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const { profile, user, refreshProfile } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

  const handleLanguageChange = async (languageCode: string) => {
    try {
      // Change language in i18n
      await i18n.changeLanguage(languageCode);
      
      // Save to database if user is logged in
      if (user) {
        await upsertProfile(user.id, { preferred_language: languageCode });
        await refreshProfile();
      }
      
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to change language');
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.optionRow} onPress={() => setModalVisible(true)}>
        <View style={styles.optionLeft}>
          <Ionicons name="language-outline" size={22} color="#FFF" style={{ width: 30 }} />
          <Text style={styles.optionText}>Language</Text>
        </View>
        <View style={styles.optionRight}>
          <Text style={styles.currentLanguage}>{currentLanguage.nativeName}</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  i18n.language === language.code && styles.languageOptionSelected
                ]}
                onPress={() => handleLanguageChange(language.code)}
              >
                <View>
                  <Text style={styles.languageName}>{language.nativeName}</Text>
                  <Text style={styles.languageSubtext}>{language.name}</Text>
                </View>
                {i18n.language === language.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#F59E0B" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionText: { color: '#FFF', fontSize: 16 },
  optionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currentLanguage: { color: '#9CA3AF', fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#374151',
    marginBottom: 12,
  },
  languageOptionSelected: {
    backgroundColor: '#F59E0B20',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  languageSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
