import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

export const ORDER_STORAGE_KEY = '@malnora_orders';

export type OrderStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Out for Delivery'
  | 'Delivered';

export type OrderItem = {
  id: string | number;
  name: string;
  price: number;
  emoji?: string;
  quantity: number;
};

export type Order = {
  orderId: string | number;
  name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  payment: string;
  status: OrderStatus;
  createdAt: string;
};

type OrderContextType = {
  orders: Order[];
  loading: boolean;
  addOrder: (order: Order) => void;
  updateOrderStatus: (
  orderId: string | number,
  status: OrderStatus
) => Promise<void>;
};

const OrderContext = createContext<OrderContextType | undefined>(
  undefined
);

export function OrderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Load saved orders when the app starts.
  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      try {
        const savedOrders = await AsyncStorage.getItem(
          ORDER_STORAGE_KEY
        );

        if (savedOrders && mounted) {
          const parsedOrders: Order[] = JSON.parse(savedOrders);
          setOrders(Array.isArray(parsedOrders) ? parsedOrders : []);
        }
      } catch (error) {
        console.error('Failed to load Malnora orders:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  // Save orders whenever the list changes after loading.
  useEffect(() => {
    if (loading) return;

    AsyncStorage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify(orders)
    ).catch((error) => {
      console.error('Failed to save Malnora orders:', error);
    });
  }, [orders, loading]);

  // Add a newly placed order.
  const addOrder = useCallback((order: Order) => {
    setOrders((previousOrders) => {
      const alreadyExists = previousOrders.some(
        (item) => String(item.orderId) === String(order.orderId)
      );

      if (alreadyExists) {
        return previousOrders;
      }

      return [
        {
          ...order,
          status: order.status || 'Order Placed',
        },
        ...previousOrders,
      ];
    });
  }, []);

  // Update the status of a particular order.
  const updateOrderStatus = useCallback(
  async (
    orderId: string | number,
    status: OrderStatus
  ) => {
    setOrders((previousOrders) =>
      previousOrders.map((order) =>
        String(order.orderId) === String(orderId)
          ? { ...order, status }
          : order
      )
    );
  },
  []
);
  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        addOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error(
      'useOrders must be used inside an OrderProvider'
    );
  }

  return context;
}