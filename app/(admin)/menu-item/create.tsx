import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMenu } from '../../../lib/hooks/useMenu';
import { getPublicUrl, uploadImage } from '../../../lib/supabase/storage';

export default function CreateMenuItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const restaurantId = typeof params.restaurantId === 'string' ? params.restaurantId : ''; 
  const itemId = typeof params.id === 'string' ? params.id : undefined;
  
  // We need to fetch categories to select from
  const { createItem, updateItem, categories, menuItems } = useMenu(restaurantId);
  
  // Use fetched categories directly
  const existingCategories = categories || [];

  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    categoryName: '', // Display name
    isAvailable: true,
  });

  // Pre-fill if editing
  React.useEffect(() => {
    if (itemId && menuItems) {
      const item = menuItems.find(i => i.id === itemId);
      if (item) {
        setFormData({
          name: item.name,
          description: item.description || '',
          price: item.price.toString(),
          categoryId: item.category_id || '',
          categoryName: item.categories?.name || '',
          isAvailable: item.is_available,
        });
        setImage(item.image_url);
      }
    }
  }, [itemId, menuItems]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square for food items usually looks good
      quality: 0.7,
      base64: true,
    });
  
    if (!result.canceled && result.assets[0].base64) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
        alert('Name, Price, and Category are required');
        return;
    }
    
    if (!restaurantId && !itemId) {
        alert('Restaurant ID missing. Cannot create item.');
        return;
    }

    setUploading(true);
    try {
      let publicUrl: string | null = null;

      if (imageBase64) {
        const fileName = `menu_${Date.now()}_${formData.name.replace(/\s/g, '_')}.jpg`;
        // Use correct bucket name: 'food-images'
        const { error: uploadError } = await uploadImage('food-images', fileName, imageBase64);
        if (uploadError) throw uploadError;
        publicUrl = getPublicUrl('food-images', fileName);
      }

      if (itemId) {
          // Update Mode
          await updateItem.mutateAsync({
             id: itemId,
             updates: {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category_id: formData.categoryId,
                is_available: formData.isAvailable,
                // Only update image if new one uploaded (publicUrl not null)
                ...(publicUrl ? { image_url: publicUrl } : {}),
             }
          });
      } else {
          // Create Mode
          await createItem.mutateAsync({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category_id: formData.categoryId,
            restaurant_id: restaurantId,
            is_available: formData.isAvailable,
            image_url: publicUrl,
          });
      }

      router.back();
    } catch (error: any) {
      console.error('Save item error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Menu Item</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Image Upload */}
        <TouchableOpacity style={styles.imageUpload} onPress={handlePickImage}>
           {image ? (
             <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
          ) : (
            <>
              <Ionicons name="fast-food" size={40} color="#6B7280" />
              <Text style={styles.uploadText}>Upload Food Photo</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Item Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Truffle Burger"
            placeholderTextColor="#6B7280"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
            <Text style={styles.label}>Price ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#6B7280"
              keyboardType="decimal-pad"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity 
                style={styles.selectInput}
                onPress={() => setShowCategoryPicker(true)}
            >
              <Text style={[styles.selectText, !formData.categoryName && { color: '#6B7280' }]}>
                {formData.categoryName || 'Select...'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ingredients, allergies, etc."
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={3}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Available / In Stock</Text>
          <Switch
            value={formData.isAvailable}
            onValueChange={(val) => setFormData({ ...formData, isAvailable: val })}
            trackColor={{ false: '#374151', true: '#16A34A' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
            style={[styles.createButton, (uploading || createItem.isPending) && { opacity: 0.7 }]}
            onPress={handleCreate}
            disabled={uploading || createItem.isPending}
        >
          {uploading ? (
             <ActivityIndicator color="#FFF" />
          ) : (
             <Text style={styles.createButtonText}>{createItem.isPending ? 'Saving...' : 'Add Item to Menu'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={showCategoryPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Category</Text>
                    <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={existingCategories}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.categoryItem}
                            onPress={() => {
                                setFormData({ ...formData, categoryId: item.id, categoryName: item.name });
                                setShowCategoryPicker(false);
                            }}
                        >
                            <Text style={styles.categoryItemText}>{item.name}</Text>
                            {formData.categoryId === item.id && <Ionicons name="checkmark" size={20} color="#F97316" />}
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <Text style={{ color: '#9CA3AF', padding: 20, textAlign: 'center' }}>
                            No categories found. Create one first!
                        </Text>
                    }
                />
            </View>
        </View>
      </Modal>
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
    padding: 24,
  },
  imageUpload: {
    height: 160,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    overflow: 'hidden', // Mask image
  },
  uploadText: {
    color: '#9CA3AF',
    marginTop: 8,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  selectInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56, // Match input height
  },
  selectText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    backgroundColor: '#111827',
  },
  createButton: {
    backgroundColor: '#16A34A',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#D1D5DB',
  },
});
