import { useCallback } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { getOrders } from '@/services/orderService';
import { useAuth } from '@/features/auth';

/**
 * The signed-in user's order history.
 * @returns {{data: object[]|null, loading: boolean, error: Error|null, refetch: () => void}}
 */
export function useOrders() {
  const { user } = useAuth();
  const userId = user?.id;

  const fetchOrders = useCallback(
    () => (userId ? getOrders(userId) : Promise.resolve([])),
    [userId],
  );
  return useAsync(fetchOrders);
}
