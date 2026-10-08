import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

import type {
  Order,
  OrderStatus,
} from '@/types/order';

const API_URL = 'http://127.0.0.1:5000/api';

type OrderContextType = {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrder: (id: string) => Order | undefined;
  updateOrderStatus: (
    id: string,
    status: OrderStatus
  ) => void;
  refreshOrders: () => Promise<void>;
  clearOrders: () => void;
};

const OrderContext =
  createContext<OrderContextType | undefined>(
    undefined
  );

type OrderProviderProps = {
  children: ReactNode;
};

const normalizeOrder = (order: any): Order => {
  return {
    id: order._id || order.id,

    orderNumber: order.orderNumber,

    items: (order.items || []).map((item: any) => ({
      id: item.productId || item.id || '',
      name: item.name || '',
      price: Number(item.price) || 0,
      emoji: item.emoji,
      quantity: Number(item.quantity) || 1,
    })),

    deliveryAddress: {
      fullName:
        order.deliveryAddress?.fullName || '',
      phone:
        order.deliveryAddress?.phone || '',
      address:
        order.deliveryAddress?.address || '',
      city:
        order.deliveryAddress?.city || '',
      pincode:
        order.deliveryAddress?.pincode || '',
    },

    paymentMethod: 'cod',

    subtotal: Number(order.subtotal) || 0,

    deliveryFee:
      Number(order.deliveryFee) || 0,

    total: Number(order.total) || 0,

    status: order.status || 'confirmed',

    createdAt:
      order.createdAt ||
      new Date().toISOString(),
  };
};

export function OrderProvider({
  children,
}: OrderProviderProps) {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = useCallback(
    (order: Order) => {
      setOrders((currentOrders) => [
        order,
        ...currentOrders.filter(
          (existingOrder) =>
            existingOrder.id !== order.id
        ),
      ]);
    },
    []
  );

  const getOrder = useCallback(
    (id: string) => {
      return orders.find(
        (order) => order.id === id
      );
    },
    [orders]
  );

  const updateOrderStatus = useCallback(
    (
      id: string,
      status: OrderStatus
    ) => {
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === id
            ? {
                ...order,
                status,
              }
            : order
        )
      );
    },
    []
  );

  const refreshOrders = useCallback(
    async () => {
      try {
        console.log(
          'Loading orders from MongoDB...'
        );

        const response = await fetch(
          `${API_URL}/orders`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Failed to fetch orders'
          );
        }

        const serverOrders =
          Array.isArray(data.orders)
            ? data.orders
            : [];

        const normalizedOrders =
          serverOrders.map(normalizeOrder);

        setOrders(normalizedOrders);

        console.log(
          `Loaded ${normalizedOrders.length} orders from MongoDB`
        );
      } catch (error) {
        console.error(
          'Failed to refresh orders:',
          error
        );

        throw error;
      }
    },
    []
  );

  const clearOrders = useCallback(() => {
    setOrders([]);
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        getOrder,
        updateOrderStatus,
        refreshOrders,
        clearOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders(): OrderContextType {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error(
      'useOrders must be used inside an OrderProvider'
    );
  }

  return context;
}