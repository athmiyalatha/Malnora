import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const API_URL = 'http://127.0.0.1:5000/api';

type OrderStatus =
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  deliveryAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  paymentMethod: 'cod';
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

const STATUS_STEPS: {
  status: OrderStatus;
  title: string;
  description: string;
}[] = [
  {
    status: 'confirmed',
    title: 'Order Confirmed',
    description: 'Your order has been confirmed.',
  },
  {
    status: 'preparing',
    title: 'Preparing Order',
    description: 'Our team is preparing your groceries.',
  },
  {
    status: 'out_for_delivery',
    title: 'Out for Delivery',
    description: 'Your order is on the way.',
  },
  {
    status: 'delivered',
    title: 'Delivered',
    description: 'Your order has been delivered.',
  },
];

const STATUS_ORDER: OrderStatus[] = [
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
];

export default function OrderTrackingScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    orderId: string | string[];
  }>();

  const orderId = Array.isArray(params.orderId)
    ? params.orderId[0]
    : params.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    if (!orderId) {
      setError('No order ID was received.');
      setLoading(false);
      return;
    }

    try {
      console.log('Tracking Order ID:', orderId);

      setError('');

      const response = await fetch(
        `${API_URL}/orders/${encodeURIComponent(orderId)}`
      );

      const contentType =
        response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        const text = await response.text();

        console.error(
          'Unexpected tracking response:',
          text
        );

        throw new Error(
          `Server returned an unexpected response (${response.status})`
        );
      }

      const data = await response.json();

      console.log('Tracking API response:', data);

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch order'
        );
      }

      if (!data.order) {
        throw new Error('Order data was not received.');
      }

      setOrder(data.order);
    } catch (err: any) {
      console.error('Tracking error:', err);

      setError(
        err?.message || 'Unable to load order details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    const interval = setInterval(() => {
      fetchOrder();
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId]);

  const getStatusIndex = () => {
    if (!order) return -1;

    return STATUS_ORDER.indexOf(order.status);
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleString();
    } catch {
      return date;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#741B2B" />

        <Text style={styles.loadingText}>
          Loading your order...
        </Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>

        <Text style={styles.errorTitle}>
          Unable to Load Order
        </Text>

        <Text style={styles.errorText}>
          {error || 'Order not found.'}
        </Text>

        {orderId ? (
          <Text style={styles.orderIdText}>
            Order ID: {orderId}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            setLoading(true);
            fetchOrder();
          }}
        >
          <Text style={styles.primaryButtonText}>
            Try Again
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStatusIndex = getStatusIndex();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Track Order
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.orderHeaderCard}>
          <Text style={styles.orderNumberLabel}>
            ORDER NUMBER
          </Text>

          <Text style={styles.orderNumber}>
            {order.orderNumber}
          </Text>

          <Text style={styles.orderDate}>
            Placed on {formatDate(order.createdAt)}
          </Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {order.status === 'out_for_delivery'
                ? 'Out for Delivery'
                : order.status.charAt(0).toUpperCase() +
                  order.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Order Status
          </Text>

          {order.status === 'cancelled' ? (
            <View style={styles.cancelledBox}>
              <Text style={styles.cancelledIcon}>✕</Text>

              <View>
                <Text style={styles.cancelledTitle}>
                  Order Cancelled
                </Text>

                <Text style={styles.cancelledText}>
                  This order has been cancelled.
                </Text>
              </View>
            </View>
          ) : (
            STATUS_STEPS.map((step, index) => {
              const completed =
                currentStatusIndex >= index;

              const isCurrent =
                currentStatusIndex === index;

              return (
                <View
                  key={step.status}
                  style={styles.timelineRow}
                >
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineCircle,
                        completed &&
                          styles.timelineCircleActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.timelineCircleText,
                          completed &&
                            styles.timelineCircleTextActive,
                        ]}
                      >
                        {completed ? '✓' : index + 1}
                      </Text>
                    </View>

                    {index <
                      STATUS_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          currentStatusIndex > index &&
                            styles.timelineLineActive,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineTitle,
                        isCurrent &&
                          styles.timelineTitleActive,
                      ]}
                    >
                      {step.title}
                    </Text>

                    <Text style={styles.timelineDescription}>
                      {step.description}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Items
          </Text>

          {order.items.map((item) => (
            <View
              key={item.productId}
              style={styles.itemRow}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.name}
                </Text>

                <Text style={styles.itemQuantity}>
                  Quantity: {item.quantity}
                </Text>
              </View>

              <Text style={styles.itemPrice}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Delivery Address
          </Text>

          <Text style={styles.addressName}>
            {order.deliveryAddress.fullName}
          </Text>

          <Text style={styles.addressText}>
            {order.deliveryAddress.address}
          </Text>

          <Text style={styles.addressText}>
            {order.deliveryAddress.city} -{' '}
            {order.deliveryAddress.pincode}
          </Text>

          <Text style={styles.addressText}>
            Phone: {order.deliveryAddress.phone}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Payment & Summary
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Payment Method
            </Text>

            <Text style={styles.summaryValue}>
              Cash on Delivery
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Subtotal
            </Text>

            <Text style={styles.summaryValue}>
              ₹{order.subtotal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Delivery Fee
            </Text>

            <Text style={styles.summaryValue}>
              ₹{order.deliveryFee.toFixed(2)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.totalValue}>
              ₹{order.total.toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.replace('/' as any)}
        >
          <Text style={styles.continueButtonText}>
            Continue Shopping
          </Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6ED',
  },

  center: {
    flex: 1,
    backgroundColor: '#FBF6ED',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 16,
    color: '#4B101D',
  },

  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4B101D',
    marginBottom: 10,
  },

  errorText: {
    fontSize: 15,
    color: '#827568',
    textAlign: 'center',
    lineHeight: 22,
  },

  orderIdText: {
    marginTop: 12,
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },

  primaryButton: {
    marginTop: 24,
    backgroundColor: '#741B2B',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  secondaryButton: {
    marginTop: 12,
    paddingHorizontal: 30,
    paddingVertical: 14,
  },

  secondaryButtonText: {
    color: '#741B2B',
    fontSize: 15,
    fontWeight: '700',
  },

  header: {
    height: 110,
    paddingTop: 45,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#741B2B',
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: '#fff',
    fontSize: 40,
    lineHeight: 40,
    fontWeight: '300',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },

  content: {
    padding: 16,
  },

  orderHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    elevation: 2,
  },

  orderNumberLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#827568',
    letterSpacing: 1,
  },

  orderNumber: {
    fontSize: 23,
    fontWeight: '900',
    color: '#4B101D',
    marginTop: 5,
  },

  orderDate: {
    marginTop: 6,
    fontSize: 13,
    color: '#827568',
  },

  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 14,
    backgroundColor: '#F3E5E8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusBadgeText: {
    color: '#741B2B',
    fontSize: 12,
    fontWeight: '800',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4B101D',
    marginBottom: 18,
  },

  timelineRow: {
    flexDirection: 'row',
    minHeight: 82,
  },

  timelineLeft: {
    width: 38,
    alignItems: 'center',
  },

  timelineCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },

  timelineCircleActive: {
    backgroundColor: '#741B2B',
  },

  timelineCircleText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '800',
  },

  timelineCircleTextActive: {
    color: '#fff',
  },

  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#ddd',
    marginVertical: 3,
  },

  timelineLineActive: {
    backgroundColor: '#741B2B',
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 18,
  },

  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#777',
  },

  timelineTitleActive: {
    color: '#741B2B',
  },

  timelineDescription: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
    lineHeight: 19,
  },

  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F1',
    borderRadius: 12,
    padding: 15,
  },

  cancelledIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#B3261E',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 35,
    fontWeight: '900',
    marginRight: 12,
  },

  cancelledTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#B3261E',
  },

  cancelledText: {
    marginTop: 4,
    color: '#777',
    fontSize: 13,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  itemInfo: {
    flex: 1,
    paddingRight: 10,
  },

  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },

  itemQuantity: {
    marginTop: 4,
    fontSize: 13,
    color: '#888',
  },

  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4B101D',
  },

  addressName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
    marginBottom: 6,
  },

  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 21,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },

  summaryLabel: {
    fontSize: 14,
    color: '#777',
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },

  totalLabel: {
    fontSize: 17,
    fontWeight: '900',
    color: '#4B101D',
  },

  totalValue: {
    fontSize: 19,
    fontWeight: '900',
    color: '#741B2B',
  },

  continueButton: {
    backgroundColor: '#741B2B',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },

  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});