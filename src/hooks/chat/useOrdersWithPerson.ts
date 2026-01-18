/**
 * useOrdersWithPerson Hook
 * Filters orders from Redux state by person name/email
 */

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import type { Order, OrdersWithPerson, UseOrdersWithPersonReturn } from '../../types/chat';

/**
 * Filters orders to show only those related to a specific person
 *
 * @param personId - ID of the person
 * @param personName - Name of the person to filter by
 * @param personEmail - Optional email of the person
 * @returns Filtered orders (forwarded and received)
 */
export function useOrdersWithPerson(
  personId: string,
  personName: string,
  personEmail?: string
): UseOrdersWithPersonReturn {
  // Get orders from Redux state (already loaded elsewhere)
  const forwardedOrdersFromRedux = useSelector(
    (state: RootState) => state.orderForward.forwardedOrders
  );
  const receivedOrdersFromRedux = useSelector(
    (state: RootState) => state.orderForward.receivedOrders
  );
  const loading = useSelector(
    (state: RootState) =>
      state.orderForward.forwardedOrdersLoading ||
      state.orderForward.receivedOrdersLoading
  );
  const error = useSelector((state: RootState) => state.orderForward.error);

  // Memoized filter function for better performance
  const filterOrdersByPerson = useMemo(() => {
    // Pre-lowercase the search terms
    const lowerPersonName = personName.toLowerCase();
    const lowerPersonEmail = personEmail?.toLowerCase();

    return (orders: any[]): Order[] => {
      if (!orders || orders.length === 0) return [];

      return orders.filter((order: any) => {
        // Extract all searchable fields
        const customerName = order.customerName || order.customer?.name || '';
        const forwardedByName = order.forwardedBy?.name || order.forwardedByName || '';
        const forwardedToName = order.forwardedTo?.name || order.forwardedToName || '';
        const forwardedByEmail = order.forwardedBy?.email || order.forwardedByEmail || '';
        const forwardedToEmail = order.forwardedTo?.email || order.forwardedToEmail || '';
        const toBranchName = order.toBranch?.name || order.toBranchName || '';
        const fromBranchName = order.fromBranch?.name || order.fromBranchName || '';

        // Create search index (optimize by doing toLowerCase once)
        const searchText = [
          customerName,
          forwardedByName,
          forwardedToName,
          toBranchName,
          fromBranchName
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        // Check if person name matches any field
        const nameMatch = searchText.includes(lowerPersonName);

        // Check if person email matches
        const emailMatch =
          lowerPersonEmail &&
          (forwardedByEmail.toLowerCase().includes(lowerPersonEmail) ||
            forwardedToEmail.toLowerCase().includes(lowerPersonEmail));

        return nameMatch || emailMatch;
      });
    };
  }, [personName, personEmail]);

  // Filter orders
  const orders = useMemo<OrdersWithPerson>(() => {
    const forwarded = filterOrdersByPerson(forwardedOrdersFromRedux || []);
    const received = filterOrdersByPerson(receivedOrdersFromRedux || []);

    console.log('[useOrdersWithPerson] Filtered orders:', {
      forwarded: forwarded.length,
      received: received.length,
      personName,
      personEmail
    });

    // FIX: Don't show all orders as fallback - it's confusing
    // If no matches, return empty arrays (user can see proper empty state)
    return {
      forwarded,
      received
    };
  }, [filterOrdersByPerson, forwardedOrdersFromRedux, receivedOrdersFromRedux, personName, personEmail]);

  // Refetch function (triggers re-filter)
  const refetch = () => {
    // Orders are already in Redux, just return
    // If you need to refetch from API, dispatch Redux actions here
    console.log('[useOrdersWithPerson] Refetch requested (orders already in Redux)');
  };

  return {
    orders,
    loading,
    error,
    refetch
  };
}
