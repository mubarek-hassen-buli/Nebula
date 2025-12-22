import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRestaurants } from '../../../lib/hooks/useRestaurants';
import { getPublicUrl, uploadImage } from '../../../lib/supabase/storage';

export default function CreateRestaurantScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { createRestaurant, updateRestaurant } = useRestaurants();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '', 
    isActive: true,
  });

  // Better approach: use a new single fetch inside this component for Edit mode.
  const { restaurants } = useRestaurants();
  const editingRestaurant = restaurants?.find(r => r.id === params.id);
  
  React.useEffect(() => {
      if (editingRestaurant) {
          setFormData({
              name: editingRestaurant.name,
              description: editingRestaurant.description || '',
              location: '', 
              isActive: editingRestaurant.is_active,
          });
          setImage(editingRestaurant.image_url);
      }
  }, [editingRestaurant]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      // We will upload during submission to avoid orphaned files if cancel
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        alert('Please enter a restaurant name');
        return;
      }

      setUploading(true);
      let imageUrl = null;

      if (image) {
        // Find component does not expose base64 directly in asset uri usually need option
        // But we requested base64: true in options.
        // It's in result.assets[0].base64
        
        // Re-read to get base64 if needed or rely on the state if we stored the asset.
        // Let's assume we need to pick again or just trigger upload here. 
        // Actually, easier flow: Upload immediately when picked or pick and store base64.
        
        // Let's re-implement pick to store full asset for upload
      }
      
      // Better approach: Upload function handles it.
      // We need to pass the base64 string to uploadImage. 
      // The current pickImage implementation above sets URI. We need the base64.
    } catch (error) {
      console.error(error);
      alert('Failed to create restaurant');
    } finally {
      setUploading(false);
    }
  };
  
  // Revised pick and submit logic below
  
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
      base64: true,
    });
  
    if (!result.canceled && result.assets[0].base64) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) return alert('Name is required');
    
    setUploading(true);
    try {
      let publicUrl = null;

      if (imageBase64) {
        const fileName = `restaurant_${Date.now()}_${formData.name.replace(/\s/g, '_')}.jpg`;
        // Use correct bucket name: 'food-images'
        const { error: uploadError } = await uploadImage('food-images', fileName, imageBase64);
        if (uploadError) throw uploadError;
        publicUrl = getPublicUrl('food-images', fileName);
      }

      if (params.id) {
         // Update existing
         await updateRestaurant.mutateAsync({
             id: params.id as string,
             updates: {
                 name: formData.name,
                 description: formData.description + (formData.location ? `\nLocation: ${formData.location}` : ''),
                 is_active: formData.isActive,
                 image_url: publicUrl || undefined, // Only update if new image
             }
         });
      } else {
         // Create new
         await createRestaurant.mutateAsync({
            name: formData.name,
            description: formData.description + (formData.location ? `\nLocation: ${formData.location}` : ''),
            is_active: formData.isActive,
            image_url: publicUrl,
            created_by: '', 
        });
      }

      router.back();
    } catch (error: any) {
      console.error('Create error:', error);
      alert(`Error: ${error.message || 'Failed to create'}`);
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
        <Text style={styles.title}>Add New Restaurant</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Image Upload Placeholder */}
        <TouchableOpacity style={styles.imageUpload} onPress={handlePickImage}>
          {image ? (
             <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
          ) : (
            <>
              <Ionicons name="camera" size={40} color="#6B7280" />
              <Text style={styles.uploadText}>Upload Cover Photo</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Restaurant Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Luigi's Pizzeria"
            placeholderTextColor="#6B7280"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the cuisine and atmosphere..."
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location / Address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 123 Main St, Downtown"
            placeholderTextColor="#6B7280"
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Active Status</Text>
          <Switch
            value={formData.isActive}
            onValueChange={(val) => setFormData({ ...formData, isActive: val })}
            trackColor={{ false: '#374151', true: '#16A34A' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.createButton, (createRestaurant.isPending || uploading) && styles.disabledButton]}
          onPress={handleCreate}
          disabled={createRestaurant.isPending || uploading}
        >
          {uploading ? (
             <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.createButtonText}>
              {createRestaurant.isPending ? 'Creating...' : 'Create Restaurant'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
    height: 200,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#1F2937',
    padding: 16,
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
  disabledButton: {
    opacity: 0.5,
  },
});
