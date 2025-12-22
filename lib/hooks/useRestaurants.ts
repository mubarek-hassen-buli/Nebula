import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Database, Restaurant } from '../../types/database';
import { supabase } from '../supabase/client';

type RestaurantInsert = Database['public']['Tables']['restaurants']['Insert'];
type RestaurantUpdate = Database['public']['Tables']['restaurants']['Update'];

export function useRestaurants() {
  const queryClient = useQueryClient();

  // Fetch all restaurants
  const { data: restaurants, isLoading, error } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Restaurant[];
    },
  });

  // Create restaurant mutation
  const createRestaurant = useMutation<Restaurant, Error, RestaurantInsert>({
    mutationFn: async (newRestaurant) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase
        .from('restaurants') as any)
        .insert({
          ...newRestaurant,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });

  // Update restaurant mutation
  const updateRestaurant = useMutation<Restaurant, Error, { id: string; updates: RestaurantUpdate }>({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await (supabase
        .from('restaurants') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });

  // Toggle active status mutation
  const toggleStatus = useMutation<Restaurant, Error, { id: string; isActive: boolean }>({
    mutationFn: async ({ id, isActive }) => {
      const { data, error } = await (supabase
        .from('restaurants') as any)
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });

  // Delete restaurant mutation
  const deleteRestaurant = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await (supabase
        .from('restaurants') as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });

  return {
    restaurants,
    isLoading,
    error,
    createRestaurant,
    updateRestaurant,
    toggleStatus,
    deleteRestaurant,
  };
}
