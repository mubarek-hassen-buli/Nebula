import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { supabase } from '../supabase/client';

export const useOrderPlacement = () => {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { profile, refreshProfile } = useAuthStore();
  const { items, restaurantId, getTotalPrice, clearCart } = useCartStore();

  const REWARD_POINTS_PER_ORDER = 10;
  const DELIVERY_FEE = 50.00;

  const placeOrder = async (scheduledTime?: Date) => {
    if (!profile || !restaurantId || items.length === 0) {
      throw new Error('Invalid order state');
    }

    setIsPlacingOrder(true);
    const totalAmount = getTotalPrice() + DELIVERY_FEE;
    const status: 'pending' | 'scheduled' = scheduledTime ? 'scheduled' : 'pending';

    try {
      // 1. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: profile.id,
          restaurant_id: restaurantId,
          total_amount: totalAmount,
          status: status,
          scheduled_for: scheduledTime ? scheduledTime.toISOString() : null,
          reward_used: false
        } as any)
        .select()
        .single();
      
      const order = orderData as any;

      if (orderError) throw orderError;
      if (!order) throw new Error('Failed to create order');

      // 2. Create Order Items
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems as any);

      if (itemsError) throw itemsError;

      // 3. Update Reward Points
      // We do this sequentially for MVP. In a real app, this should be a transaction or RPC.
      const newPoints = (profile.reward_points || 0) + REWARD_POINTS_PER_ORDER;
      
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .update({ reward_points: newPoints } as any)
        .eq('id', profile.id);

      if (profileError) {
        console.error('Failed to update reward points:', profileError);
        // We do not throw here, as the order itself was successful.
      } else {
         // 4. Create Reward Transaction Log
         await supabase.from('reward_transactions').insert({
             user_id: profile.id,
             order_id: order.id,
             points_earned: REWARD_POINTS_PER_ORDER
         } as any);
         
         // Refresh local profile state to show new points immediately
         refreshProfile();
      }

      // 5. Cleanup
      clearCart();
      
      return { success: true, orderId: order.id, pointsEarned: REWARD_POINTS_PER_ORDER };

    } catch (error: any) {
      console.error('Order Placement Error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return {
    placeOrder,
    isPlacingOrder,
  };
};
