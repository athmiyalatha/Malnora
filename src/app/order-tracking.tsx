import { router, useLocalSearchParams } from 'expo-router';
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

const STEPS: {
  status: OrderStatus;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    status: 'confirmed',
    title: 'Order Confirmed',
    description: 'Your order has been confirmed.',
    icon: '✓',
  },
  {
    status: 'preparing',
    title: 'Preparing Order',
    description: 'Your groceries are being packed.',
    icon: '🛍️',
  },
  {
    status: 'out_for_delivery',
    title: 'Out for Delivery',
    description: 'Your order is on the way.',
    icon: '🛵',
  },
  {
    status: 'delivered',
    title: 'Delivered',
    description: 'Your order has been delivered.',
    icon: '✓',
  },
];

export default function OrderTracking() {
  const params = useLocalSearchParams();

  const orderId =
    typeof params.orderId === 'string'
      ? params.orderId
      : typeof params.id === 'string'
      ? params.id
      : '';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    if (!orderId) {
      setError('Order ID is missing.');
      setLoading(false);
      return;
    }

    try {
      setError('');

      const response = await fetch(
        `${API_URL}/orders/${orderId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();

      setOrder(data.order || data);
    } catch (err) {
      console.error('Order tracking error:', err);
      setError('Unable to load order details.');
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

  const getStepIndex = (status: OrderStatus) => {
    return STEPS.findIndex(
      (step) => step.status === status
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#741B2B"
        />

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
          Unable to load order
        </Text>

        <Text style={styles.errorText}>
          {error || 'Order not found.'}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={fetchOrder}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const currentStep = getStepIndex(order.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.headerBack}
        >
          <Text style={styles.headerBackText}>
            ‹
          </Text>
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Track Order
          </Text>

          <Text style={styles.headerSubtitle}>
            {order.orderNumber}
          </Text>
        </View>

        <Pressable
          onPress={fetchOrder}
          style={styles.refreshButton}
        >
          <Text style={styles.refreshText}>
            ↻
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusEmoji}>
            {order.status === 'delivered'
              ? '🎉'
              : order.status === 'out_for_delivery'
              ? '🛵'
              : order.status === 'preparing'
              ? '🛍️'
              : order.status === 'cancelled'
              ? '❌'
              : '✓'}
          </Text>

          <Text style={styles.currentTitle}>
            {order.status === 'cancelled'
              ? 'Order Cancelled'
              : STEPS[currentStep]?.title ||
                'Order Confirmed'}
          </Text>

          <Text style={styles.currentDescription}>
            {order.status === 'cancelled'
              ? 'This order has been cancelled.'
              : STEPS[currentStep]?.description ||
                'Your order has been confirmed.'}
          </Text>

          <Text style={styles.orderDate}>
            Ordered on {formatDate(order.createdAt)}
          </Text>
        </View>

        {/* Progress */}
        {order.status !== 'cancelled' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Order Status
            </Text>

            <View style={styles.timeline}>
              {STEPS.map((step, index) => {
                const completed =
                  index <= currentStep;

                const isCurrent =
                  index === currentStep;

                return (
                  <View
                    key={step.status}
                    style={styles.timelineRow}
                  >
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.circle,
                          completed &&
                            styles.completedCircle,
                          isCurrent &&
                            styles.currentCircle,
                        ]}
                      >
                        <Text
                          style={[
                            styles.circleText,
                            completed &&
                              styles.completedCircleText,
                          ]}
                        >
                          {index < currentStep
                            ? '✓'
                            : step.icon}
                        </Text>
                      </View>

                      {index <
                        STEPS.length - 1 && (
                        <View
                          style={[
                            styles.line,
                            index <
                              currentStep &&
                              styles.completedLine,
                          ]}
                        />
                      )}
                    </View>

                    <View
                      style={styles.timelineContent}
                    >
                      <Text
                        style={[
                          styles.stepTitle,
                          completed &&
                            styles.completedStepTitle,
                        ]}
                      >
                        {step.title}
                      </Text>

                      <Text
                        style={styles.stepDescription}
                      >
                        {step.description}
                      </Text>

                      {isCurrent && (
                        <View
                          style={styles.currentBadge}
                        >
                          <Text
                            style={
                              styles.currentBadgeText
                            }
                          >
                            Current Status
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Delivery Address
          </Text>

          <Text style={styles.customerName}>
            {order.deliveryAddress.fullName}
          </Text>

          <Text style={styles.addressText}>
            📞 {order.deliveryAddress.phone}
          </Text>

          <Text style={styles.addressText}>
            📍 {order.deliveryAddress.address}
          </Text>

          <Text style={styles.addressText}>
            {order.deliveryAddress.city} -{' '}
            {order.deliveryAddress.pincode}
          </Text>
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Your Items
          </Text>

          {order.items.map((item, index) => (
            <View
              key={`${item.productId}-${index}`}
              style={styles.itemRow}
            >
              <View style={styles.itemInfo}>
                <Text
                  style={styles.itemName}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>

                <Text style={styles.itemQuantity}>
                  Quantity: {item.quantity}
                </Text>
              </View>

              <Text style={styles.itemPrice}>
                ₹{item.price * item.quantity}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Payment Summary
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Subtotal
            </Text>

            <Text style={styles.summaryValue}>
              ₹{order.subtotal}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Delivery Fee
            </Text>

            <Text style={styles.summaryValue}>
              ₹{order.deliveryFee}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.totalValue}>
              ₹{order.total}
            </Text>
          </View>

          <View style={styles.paymentBadge}>
            <Text style={styles.paymentText}>
              Payment: {order.paymentMethod.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Auto Refresh */}
        {order.status !== 'delivered' &&
          order.status !== 'cancelled' && (
            <View style={styles.liveCard}>
              <View style={styles.liveDot} />

              <Text style={styles.liveText}>
                Order status updates automatically
              </Text>
            </View>
          )}

        {/* Bottom Button */}
        <Pressable
          style={styles.homeButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.homeButtonText}>
            Continue Shopping
          </Text>
        </Pressable>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    color: '#827568',
    marginTop: 12,
    fontSize: 14,
  },

  errorIcon: {
    fontSize: 45,
    marginBottom: 10,
  },

  errorTitle: {
    color: '#4B101D',
    fontSize: 21,
    fontWeight: '800',
  },

  errorText: {
    color: '#827568',
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 18,
  },

  retryButton: {
    backgroundColor: '#741B2B',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  backButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  backButtonText: {
    color: '#741B2B',
    fontWeight: '700',
  },

  header: {
    backgroundColor: '#741B2B',
    paddingTop: 55,
    paddingHorizontal: 18,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerBackText: {
    color: '#741B2B',
    fontSize: 30,
    lineHeight: 32,
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#F5D9C2',
    fontSize: 12,
    marginTop: 2,
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  refreshText: {
    color: '#741B2B',
    fontSize: 25,
    fontWeight: '700',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  statusEmoji: {
    fontSize: 42,
    marginBottom: 8,
  },

  currentTitle: {
    color: '#4B101D',
    fontSize: 21,
    fontWeight: '800',
  },

  currentDescription: {
    color: '#827568',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 5,
  },

  orderDate: {
    color: '#A09388',
    fontSize: 11,
    marginTop: 10,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardTitle: {
    color: '#741B2B',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },

  timeline: {
    paddingTop: 2,
  },

  timelineRow: {
    flexDirection: 'row',
    minHeight: 82,
  },

  timelineLeft: {
    width: 42,
    alignItems: 'center',
  },

  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0EBE5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD3C9',
  },

  completedCircle: {
    backgroundColor: '#741B2B',
    borderColor: '#741B2B',
  },

  currentCircle: {
    borderWidth: 3,
  },

  circleText: {
    fontSize: 13,
    color: '#827568',
  },

  completedCircleText: {
    color: '#FFFFFF',
  },

  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#DDD3C9',
    marginVertical: 3,
  },

  completedLine: {
    backgroundColor: '#741B2B',
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 1,
  },

  stepTitle: {
    color: '#827568',
    fontSize: 14,
    fontWeight: '700',
  },

  completedStepTitle: {
    color: '#4B101D',
  },

  stepDescription: {
    color: '#A09388',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },

  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4E8D8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },

  currentBadgeText: {
    color: '#741B2B',
    fontSize: 9,
    fontWeight: '800',
  },

  customerName: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },

  addressText: {
    color: '#827568',
    fontSize: 12,
    lineHeight: 20,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE5',
  },

  itemInfo: {
    flex: 1,
    paddingRight: 10,
  },

  itemName: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '600',
  },

  itemQuantity: {
    color: '#827568',
    fontSize: 11,
    marginTop: 4,
  },

  itemPrice: {
    color: '#4B101D',
    fontSize: 14,
    fontWeight: '800',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  summaryLabel: {
    color: '#827568',
    fontSize: 12,
  },

  summaryValue: {
    color: '#555555',
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEE7DE',
    marginVertical: 6,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    color: '#4B101D',
    fontSize: 17,
    fontWeight: '800',
  },

  totalValue: {
    color: '#741B2B',
    fontSize: 19,
    fontWeight: '800',
  },

  paymentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9F1EA',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    marginTop: 10,
  },

  paymentText: {
    color: '#426B48',
    fontSize: 10,
    fontWeight: '800',
  },

  liveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    paddingVertical: 10,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
    marginRight: 7,
  },

  liveText: {
    color: '#426B48',
    fontSize: 11,
    fontWeight: '600',
  },

  homeButton: {
    backgroundColor: '#741B2B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});