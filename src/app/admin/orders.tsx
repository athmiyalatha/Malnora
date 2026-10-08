import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const API_URL = 'http://127.0.0.1:5000/api';

type OrderStatus =
  | 'confirmed'
  |  'preparing'
  |  'out_for_delivery'
  |  'delivered'
  |  'cancelled';

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type DeliveryAddress = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/orders`);

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();

      setOrders(data.orders || []);
    } catch (err) {
      console.error('Admin orders error:', err);
      setError('Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (
    orderId: string,
    status: OrderStatus
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status,
              }
            : order
        )
      );
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update order status.');
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';

      case 'preparing':
        return 'Preparing';

      case 'out_for_delivery':
        return 'Out for Delivery';

      case 'delivered':
        return 'Delivered';

      case 'cancelled':
        return 'Cancelled';

      default:
        return status;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return '#741B2B';

      case 'preparing':
        return '#B18A4A';

      case 'out_for_delivery':
        return '#426B48';

      case 'delivered':
        return '#2E7D32';

      case 'cancelled':
        return '#B3261E';

      default:
        return '#827568';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Orders</Text>

          <Text style={styles.subtitle}>
            Manage customer orders
          </Text>
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Back
          </Text>
        </Pressable>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <Text style={styles.countText}>
          {orders.length} Orders
        </Text>

        <Pressable
          style={styles.refreshButton}
          onPress={fetchOrders}
        >
          <Text style={styles.refreshText}>
            Refresh
          </Text>
        </Pressable>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#741B2B"
          />

          <Text style={styles.loadingText}>
            Loading orders...
          </Text>
        </View>
      )}

      {/* Error */}
      {!loading && error !== '' && (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={fetchOrders}
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        orders.length === 0 && (
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>
              📦
            </Text>

            <Text style={styles.emptyTitle}>
              No orders yet
            </Text>

            <Text style={styles.emptyText}>
              Customer orders will appear here.
            </Text>
          </View>
        )}

      {/* Orders */}
      {!loading &&
        !error &&
        orders.length > 0 && (
          <ScrollView
            contentContainerStyle={styles.orderList}
            showsVerticalScrollIndicator={false}
          >
            {orders.map((order) => (
              <View
                key={order._id}
                style={styles.orderCard}
              >
                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderNumber}>
                      {order.orderNumber}
                    </Text>

                    <Text style={styles.date}>
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          getStatusColor(
                            order.status
                          ),
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusLabel(
                        order.status
                      )}
                    </Text>
                  </View>
                </View>

                {/* Customer */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Customer
                  </Text>

                  <Text style={styles.customerName}>
                    {order.deliveryAddress.fullName}
                  </Text>

                  <Text style={styles.detailText}>
                    📞 {order.deliveryAddress.phone}
                  </Text>

                  <Text style={styles.detailText}>
                    📍 {order.deliveryAddress.address},{' '}
                    {order.deliveryAddress.city} -{' '}
                    {order.deliveryAddress.pincode}
                  </Text>
                </View>

                {/* Items */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Items
                  </Text>

                  {order.items.map((item, index) => (
                    <View
                      key={`${item.productId}-${index}`}
                      style={styles.itemRow}
                    >
                      <Text
                        style={styles.itemName}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>

                      <Text style={styles.itemQuantity}>
                        × {item.quantity}
                      </Text>

                      <Text style={styles.itemPrice}>
                        ₹
                        {item.price *
                          item.quantity}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Total */}
                <View style={styles.totalSection}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                      Subtotal
                    </Text>

                    <Text style={styles.totalValue}>
                      ₹{order.subtotal}
                    </Text>
                  </View>

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                      Delivery
                    </Text>

                    <Text style={styles.totalValue}>
                      ₹{order.deliveryFee}
                    </Text>
                  </View>

                  <View style={styles.grandTotalRow}>
                    <Text style={styles.grandTotalLabel}>
                      Total
                    </Text>

                    <Text style={styles.grandTotal}>
                      ₹{order.total}
                    </Text>
                  </View>

                  <Text style={styles.payment}>
                    Payment: {order.paymentMethod.toUpperCase()}
                  </Text>
                </View>

                {/* Status Controls */}
                <View style={styles.statusSection}>
                  <Text style={styles.sectionTitle}>
                    Update Status
                  </Text>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                      false
                    }
                    contentContainerStyle={
                      styles.statusButtons
                    }
                  >
                    <Pressable
                      style={[
                        styles.statusButton,
                        order.status === 'confirmed' &&
                          styles.activeStatusButton,
                      ]}
                      onPress={() =>
                        updateStatus(
                          order._id,
                          'confirmed'
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          order.status ===
                            'confirmed' &&
                            styles.activeStatusButtonText,
                        ]}
                      >
                        Confirmed
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.statusButton,
                        order.status === 'preparing' &&
                          styles.activeStatusButton,
                      ]}
                      onPress={() =>
                        updateStatus(
                          order._id,
                          'preparing'
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          order.status ===
                            'preparing' &&
                            styles.activeStatusButtonText,
                        ]}
                      >
                        Preparing
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.statusButton,
                        order.status ===
                          'out_for_delivery' &&
                          styles.activeStatusButton,
                      ]}
                      onPress={() =>
                        updateStatus(
                          order._id,
                          'out_for_delivery'
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          order.status ===
                            'out_for_delivery' &&
                            styles.activeStatusButtonText,
                        ]}
                      >
                        Out for Delivery
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.statusButton,
                        order.status === 'delivered' &&
                          styles.activeStatusButton,
                      ]}
                      onPress={() =>
                        updateStatus(
                          order._id,
                          'delivered'
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          order.status ===
                            'delivered' &&
                            styles.activeStatusButtonText,
                        ]}
                      >
                        Delivered
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.statusButton,
                        order.status === 'cancelled' &&
                          styles.cancelStatusButton,
                      ]}
                      onPress={() =>
                        updateStatus(
                          order._id,
                          'cancelled'
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          order.status ===
                            'cancelled' &&
                            styles.cancelStatusButtonText,
                        ]}
                      >
                        Cancelled
                      </Text>
                    </Pressable>
                  </ScrollView>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6ED',
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: '#741B2B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },

  subtitle: {
    color: '#F5D9C2',
    fontSize: 14,
    marginTop: 4,
  },

  backButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 10,
  },

  backButtonText: {
    color: '#741B2B',
    fontWeight: '700',
  },

  toolbar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  countText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B101D',
  },

  refreshButton: {
    backgroundColor: '#741B2B',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
  },

  refreshText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  orderList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 18,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE7DE',
  },

  orderNumber: {
    color: '#4B101D',
    fontSize: 17,
    fontWeight: '800',
  },

  date: {
    color: '#827568',
    fontSize: 11,
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  section: {
    marginTop: 14,
  },

  sectionTitle: {
    color: '#741B2B',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
  },

  customerName: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },

  detailText: {
    color: '#827568',
    fontSize: 12,
    lineHeight: 19,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F2ECE5',
  },

  itemName: {
    flex: 1,
    color: '#333333',
    fontSize: 13,
  },

  itemQuantity: {
    color: '#827568',
    fontSize: 12,
    marginHorizontal: 10,
  },

  itemPrice: {
    color: '#4B101D',
    fontSize: 13,
    fontWeight: '700',
  },

  totalSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE7DE',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  totalLabel: {
    color: '#827568',
    fontSize: 12,
  },

  totalValue: {
    color: '#555555',
    fontSize: 12,
  },

  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },

  grandTotalLabel: {
    color: '#4B101D',
    fontSize: 17,
    fontWeight: '800',
  },

  grandTotal: {
    color: '#741B2B',
    fontSize: 19,
    fontWeight: '800',
  },

  payment: {
    color: '#426B48',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },

  statusSection: {
    marginTop: 16,
  },

  statusButtons: {
    gap: 8,
    paddingVertical: 4,
  },

  statusButton: {
    borderWidth: 1,
    borderColor: '#D8CCC0',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9,
  },

  activeStatusButton: {
    backgroundColor: '#741B2B',
    borderColor: '#741B2B',
  },

  cancelStatusButton: {
    borderColor: '#B3261E',
    backgroundColor: '#FCE7E7',
  },

  statusButtonText: {
    color: '#5F5147',
    fontSize: 11,
    fontWeight: '700',
  },

  activeStatusButtonText: {
    color: '#FFFFFF',
  },

  cancelStatusButtonText: {
    color: '#B3261E',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 10,
    color: '#827568',
  },

  errorText: {
    color: '#B3261E',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: '#741B2B',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  emptyEmoji: {
    fontSize: 45,
    marginBottom: 10,
  },

  emptyTitle: {
    color: '#4B101D',
    fontSize: 20,
    fontWeight: '800',
  },

  emptyText: {
    color: '#827568',
    marginTop: 6,
  },
});