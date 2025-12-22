import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Database, Order } from '../../types/database';
import { supabase } from '../supabase/client';

type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export function useOrders(restaurantId?: string) {
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', restaurantId],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url, phone_number),
          restaurant:restaurant_id (name)
        `)
        .order('created_at', { ascending: false });
        
      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }

      const { data, error } = await query;

      if (error) throw error;
      // Explicit cast to avoid 'never' inference on empty arrays
      return data as unknown as (Order & { 
        profiles: { full_name: string | null, avatar_url: string | null, phone_number: string | null } | null,
        restaurant: { name: string } | null
      })[];
    },
    refetchInterval: 30000, 
  });

  // Fetch single order details
  const getOrder = async (id: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id (*),
        restaurant:restaurant_id (*),
        order_items(
          *,
          menu_item:menu_items(*)
        )
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data as (Order & {
      profiles: any | null,
      restaurant: any | null,
      order_items: (any & { menu_item: any | null })[]
    });
  };

  // Update Order Status
  const updateStatus = useMutation<Order, Error, { id: string; status: Order['status'] }>({
    mutationFn: async ({ id, status }) => {
      const { data, error } = await (supabase
        .from('orders') as any)
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });

  return {
    orders,
    isLoading,
    getOrder,
    updateStatus,
  };
}
