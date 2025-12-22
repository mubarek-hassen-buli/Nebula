import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Category, Database, MenuItem } from '../../types/database';
import { supabase } from '../supabase/client';

type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert'];
type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update'];

export function useMenu(restaurantId?: string) {
  const queryClient = useQueryClient();

  // Fetch Global Categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Category[];
    },
    refetchOnMount: true,
  });

  // Fetch menu items
  const { data: menuItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ['menu-items', restaurantId],
    queryFn: async () => {
      let query = supabase
        .from('menu_items')
        .select(`
          *,
          categories:category_id (*),
          restaurants:restaurant_id (name)
        `);

      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }

      const { data: items, error: itemsError } = await query;

      if (itemsError) throw itemsError;
      // Explicit cast to ensure TS knows the structure including joined category and restaurant
      return items as (MenuItem & { categories: Category | null, restaurants: { name: string } | null })[];
    },
  });

  // Create Item Mutation
  const createItem = useMutation<MenuItem, Error, MenuItemInsert>({
    mutationFn: async (newItem) => {
      const { data, error } = await (supabase
        .from('menu_items') as any)
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });

  // Toggle Availability
  const toggleAvailability = useMutation<MenuItem, Error, { id: string; isAvailable: boolean }>({
    mutationFn: async ({ id, isAvailable }) => {
      const { data, error } = await (supabase
        .from('menu_items') as any)
        .update({ is_available: isAvailable })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });

  // Update Item Mutation
  const updateItem = useMutation<MenuItem, Error, { id: string, updates: MenuItemUpdate }>({
      mutationFn: async ({ id, updates }) => {
          const { data, error } = await (supabase
              .from('menu_items') as any)
              .update(updates)
              .eq('id', id)
              .select()
              .single();

          if (error) throw error;
          return data;
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      },
  });

  // Delete Item Mutation
  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('menu_items') as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });

  return {
    menuItems: menuItems || [],
    isLoadingItems: isLoadingItems || isLoadingCategories,
    createItem,
    updateItem,
    toggleAvailability,
    deleteItem,
    categories: categories || [],
  };
}
