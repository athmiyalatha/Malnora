import { Order, useOrders } from '@/context/OrderContext';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
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

function formatPrice(amount: number) {
  return `₹${amount.toFixed(2)}`;
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getStatusColor(status: Order['status']) {
  switch (status) {
    case 'Delivered':
      return GREEN;
    case 'Out for Delivery':
      return '#B7791F';
    case 'Order Confirmed':
      return '#3867A6';
    default:
      return MAROON;
  }
}

export default function MyOrdersScreen() {
  const router = useRouter();
  const { orders, loading } = useOrders();

  function openTracking(order: Order) {
    router.push({
      pathname: '/order-tracking',
      params: {
        // Expo Router route parameters must be strings.
        orderId: String(order.orderId),
      },
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={MAROON} />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSubtitle}>
            Your Malnora purchases
          </Text>
        </View>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛍️</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>
            Your grocery orders will appear here after checkout.
          </Text>

          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.orderCount}>
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </Text>

          {orders.map((order) => (
            <TouchableOpacity
              key={String(order.orderId)}
              style={styles.orderCard}
              activeOpacity={0.85}
              onPress={() => openTracking(order)}
            >
              <View style={styles.cardTop}>
                <View style={styles.orderIcon}>
                  <Text style={styles.orderIconText}>🛒</Text>
                </View>

                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>
                    Order #{String(order.orderId)}
                  </Text>
                  <Text style={styles.orderDate}>
                    {formatDate(order.createdAt)}
                  </Text>
                </View>

                <Text style={styles.chevron}>›</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items</Text>
                <Text style={styles.summaryValue}>
                  {order.items.reduce(
                    (total, item) => total + item.quantity,
                    0,
                  )}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payment</Text>
                <Text style={styles.summaryValue}>
                  {order.payment}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {formatPrice(order.total)}
                </Text>
              </View>

              <View style={styles.cardBottom}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: `${getStatusColor(order.status)}15`,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(order.status) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(order.status) },
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>

                <Text style={styles.trackText}>Track order ›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
  listContent: {
    padding: 18,
    paddingBottom: 40,
  },
  orderCount: {
    color: MUTED,
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: CREAM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderIconText: {
    fontSize: 23,
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orderId: {
    color: '#2D211D',
    fontSize: 15,
    fontWeight: '800',
  },
  orderDate: {
    color: MUTED,
    fontSize: 12,
    marginTop: 5,
  },
  chevron: {
    color: MAROON,
    fontSize: 30,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0E9E0',
    marginVertical: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: MUTED,
    fontSize: 13,
  },
  summaryValue: {
    color: '#392D27',
    fontSize: 13,
    fontWeight: '600',
  },
  totalValue: {
    color: MAROON,
    fontSize: 15,
    fontWeight: '800',
  },
  cardBottom: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  trackText: {
    color: MAROON,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },
  emptyEmoji: {
    fontSize: 58,
    marginBottom: 18,
  },
  emptyTitle: {
    color: MAROON,
    fontSize: 23,
    fontWeight: '800',
  },
  emptyText: {
    color: MUTED,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 10,
  },
  shopButton: {
    backgroundColor: MAROON,
    borderRadius: 14,
    paddingHorizontal: 25,
    paddingVertical: 15,
    marginTop: 24,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});