import {
    OrderStatus,
    useOrders,
} from '@/context/OrderContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const MAROON = '#741B2B';
const CREAM = '#FBF6ED';
const MUTED = '#827568';
const GREEN = '#426B48';

const STATUS_STEPS: OrderStatus[] = [
  'Order Placed',
  'Order Confirmed',
  'Out for Delivery',
  'Delivered',
];

function formatPrice(amount: number) {
  return `₹${amount.toFixed(2)}`;
}

function getStatusDescription(status: OrderStatus) {
  switch (status) {
    case 'Order Placed':
      return 'We have received your order.';
    case 'Order Confirmed':
      return 'Your order has been confirmed.';
    case 'Out for Delivery':
      return 'Your groceries are on their way.';
    case 'Delivered':
      return 'Your groceries have been delivered.';
  }
}

export default function OrderTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId?: string | string[];
  }>();

  const { orders, loading, updateOrderStatus } = useOrders();

  // A route parameter can be a string or an array.
  const orderId = Array.isArray(params.orderId)
    ? params.orderId[0]
    : params.orderId;

  const order = orders.find(
    (item) => String(item.orderId) === String(orderId),
  );

  async function changeStatus(nextStatus: OrderStatus) {
    // Prevent accessing an order that was not found.
    if (!order) return;

    try {
      await updateOrderStatus(
        String(order.orderId),
        nextStatus,
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
      Alert.alert(
        'Update failed',
        'We could not update the order status. Please try again.',
      );
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={MAROON} />
        <Text style={styles.loadingText}>Loading order...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundEmoji}>📦</Text>
        <Text style={styles.notFoundTitle}>Order not found</Text>
        <Text style={styles.notFoundText}>
          We couldn't find this order on this device.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/my-orders')}
        >
          <Text style={styles.primaryButtonText}>Back to My Orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const nextStep = STATUS_STEPS[currentStep + 1];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Track Order</Text>
          <Text style={styles.headerSubtitle}>
            Order #{String(order.orderId)}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusEmoji}>
              {order.status === 'Delivered' ? '🎉' : '🛵'}
            </Text>
          </View>

          <Text style={styles.statusTitle}>{order.status}</Text>
          <Text style={styles.statusDescription}>
            {getStatusDescription(order.status)}
          </Text>

          <View style={styles.progressTrack}>
            {STATUS_STEPS.map((step, index) => {
              const completed = index <= currentStep;

              return (
                <React.Fragment key={step}>
                  <View
                    style={[
                      styles.progressDot,
                      completed && styles.progressDotActive,
                    ]}
                  >
                    {completed && (
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </View>

                  {index < STATUS_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.progressLine,
                        index < currentStep &&
                          styles.progressLineActive,
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Placed</Text>
            <Text style={styles.progressLabel}>Confirmed</Text>
            <Text style={styles.progressLabel}>On the way</Text>
            <Text style={styles.progressLabel}>Delivered</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>

          <View style={styles.addressRow}>
            <View style={styles.smallIcon}>
              <Text style={styles.smallIconText}>📍</Text>
            </View>

            <View style={styles.addressInfo}>
              <Text style={styles.customerName}>{order.name}</Text>
              <Text style={styles.detailText}>{order.phone}</Text>
              <Text style={styles.addressText}>{order.address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your Items</Text>

          {order.items.map((item, index) => (
            <View
              key={`${String(item.id)}-${index}`}
              style={styles.itemRow}
            >
              <View style={styles.itemEmojiBox}>
                <Text style={styles.itemEmoji}>
                  {item.emoji || '🛒'}
                </Text>
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>
                  Qty: {item.quantity}
                </Text>
              </View>

              <Text style={styles.itemPrice}>
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.detailText}>Subtotal</Text>
            <Text style={styles.priceText}>
              {formatPrice(order.subtotal)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.detailText}>Delivery fee</Text>
            <Text style={styles.priceText}>
              {order.deliveryFee === 0
                ? 'FREE'
                : formatPrice(order.deliveryFee)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>
              {formatPrice(order.total)}
            </Text>
          </View>

          <View style={styles.paymentBox}>
            <Text style={styles.detailText}>Payment method</Text>
            <Text style={styles.paymentValue}>{order.payment}</Text>
          </View>
        </View>

        {order.status !== 'Delivered' ? (
          <View style={styles.demoCard}>
            <Text style={styles.demoTitle}>Demo Order Controls</Text>
            <Text style={styles.demoDescription}>
              Use this button to test the order-status flow.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => changeStatus(nextStep)}
              disabled={!nextStep}
            >
              <Text style={styles.primaryButtonText}>
                {nextStep ? `Update to: ${nextStep}` : 'Order Complete'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.deliveredCard}>
            <Text style={styles.deliveredEmoji}>✅</Text>
            <Text style={styles.deliveredTitle}>Order Delivered</Text>
            <Text style={styles.deliveredText}>
              Thank you for shopping with Malnora!
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace('/my-orders')}
        >
          <Text style={styles.secondaryButtonText}>
            Back to My Orders
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: CREAM,
  },
  loadingText: {
    marginTop: 12,
    color: MUTED,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    gap: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: CREAM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 32,
    lineHeight: 36,
    color: MAROON,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: MAROON,
  },
  headerSubtitle: {
    fontSize: 13,
    color: MUTED,
    marginTop: 3,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    marginBottom: 16,
  },
  statusIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: CREAM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  statusEmoji: {
    fontSize: 35,
  },
  statusTitle: {
    color: MAROON,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  statusDescription: {
    color: MUTED,
    fontSize: 13,
    marginTop: 7,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 4,
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D9D0C5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    borderColor: GREEN,
    backgroundColor: GREEN,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#E5DDD2',
  },
  progressLineActive: {
    backgroundColor: GREEN,
  },
  progressLabels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  progressLabel: {
    color: MUTED,
    fontSize: 9,
    textAlign: 'center',
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },
  sectionTitle: {
    color: MAROON,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  smallIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: CREAM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallIconText: {
    fontSize: 19,
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    color: '#33251F',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 5,
  },
  detailText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
  },
  addressText: {
    color: '#51443C',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemEmojiBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: CREAM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: {
    fontSize: 23,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    color: '#33251F',
    fontSize: 13,
    fontWeight: '700',
  },
  itemQuantity: {
    color: MUTED,
    fontSize: 12,
    marginTop: 5,
  },
  itemPrice: {
    color: MAROON,
    fontSize: 13,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0E9E0',
    marginVertical: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  priceText: {
    color: '#33251F',
    fontSize: 13,
    fontWeight: '600',
  },
  totalLabel: {
    color: '#33251F',
    fontSize: 15,
    fontWeight: '800',
  },
  totalPrice: {
    color: MAROON,
    fontSize: 17,
    fontWeight: '800',
  },
  paymentBox: {
    marginTop: 16,
    padding: 13,
    backgroundColor: CREAM,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentValue: {
    color: MAROON,
    fontSize: 13,
    fontWeight: '800',
  },
  demoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    marginBottom: 16,
  },
  demoTitle: {
    color: MAROON,
    fontSize: 16,
    fontWeight: '800',
  },
  demoDescription: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: MAROON,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: MAROON,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: MAROON,
    fontSize: 14,
    fontWeight: '800',
  },
  notFoundEmoji: {
    fontSize: 55,
    marginBottom: 15,
  },
  notFoundTitle: {
    color: MAROON,
    fontSize: 22,
    fontWeight: '800',
  },
  notFoundText: {
    color: MUTED,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 9,
  },
  deliveredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D8E7D6',
  },
  deliveredEmoji: {
    fontSize: 35,
    marginBottom: 10,
  },
  deliveredTitle: {
    color: GREEN,
    fontSize: 18,
    fontWeight: '800',
  },
  deliveredText: {
    color: MUTED,
    fontSize: 13,
    marginTop: 7,
    textAlign: 'center',
  },
});