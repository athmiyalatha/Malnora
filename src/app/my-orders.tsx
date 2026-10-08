
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useOrders } from '@/context/OrderContext';
import type { Order, OrderStatus } from '@/types/order';

const C = {
  maroon: '#741B2B',
  darkMaroon: '#4B101D',
  gold: '#B18A4A',
  cream: '#FBF6ED',
  white: '#FFFFFF',
  text: '#241A17',
  muted: '#827568',
  green: '#426B48',
  lightGreen: '#EEF5EF',
  border: '#E8DED3',
  orange: '#C77B30',
  lightOrange: '#FFF4E8',
  red: '#A33A3A',
  lightRed: '#FBEDED',
};

const statusInfo: Record<
  OrderStatus,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    background: string;
  }
> = {
  confirmed: {
    label: 'Confirmed',
    icon: 'checkmark-circle-outline',
    color: C.green,
    background: C.lightGreen,
  },

  preparing: {
    label: 'Preparing',
    icon: 'restaurant-outline',
    color: C.orange,
    background: C.lightOrange,
  },

  out_for_delivery: {
    label: 'Out for Delivery',
    icon: 'bicycle-outline',
    color: C.maroon,
    background: '#F7EDEF',
  },

  delivered: {
    label: 'Delivered',
    icon: 'checkmark-done-circle-outline',
    color: C.green,
    background: C.lightGreen,
  },

  cancelled: {
    label: 'Cancelled',
    icon: 'close-circle-outline',
    color: C.red,
    background: C.lightRed,
  },
};

export default function MyOrdersScreen() {
  const router = useRouter();

  const {
    orders,
    refreshOrders,
  } = useOrders();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        await refreshOrders();
      } catch (error) {
        console.error(
          'Failed to load orders:',
          error
        );

        Alert.alert(
          'Unable to load orders',
          'Please check your connection and try again.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [refreshOrders]
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders(false);
  };

  // Opens the Order Details page.
  // The Order Details page contains the
  // "Track My Order" button.
  const handleTrackOrder = (order: Order) => {
    router.push({
      pathname: '/order-details',
      params: {
        orderId: order.id,
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'Recent order';
    }

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getItemCount = (order: Order) => {
    return order.items.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={C.maroon}
          />

          <Text style={styles.loadingText}>
            Loading your orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={C.text}
          />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            My Orders
          </Text>

          <Text style={styles.headerSubtitle}>
            {orders.length}{' '}
            {orders.length === 1
              ? 'order'
              : 'orders'}
          </Text>
        </View>

        <Pressable
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Ionicons
            name="refresh-outline"
            size={22}
            color={C.maroon}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          orders.length === 0
            ? styles.emptyContent
            : styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={C.maroon}
          />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="bag-handle-outline"
                size={52}
                color={C.maroon}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No orders yet
            </Text>

            <Text style={styles.emptyText}>
              Your grocery orders will appear here
              after you place your first order.
            </Text>

            <Pressable
              style={styles.shopButton}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.shopButtonText}>
                Start Shopping
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color={C.white}
              />
            </Pressable>
          </View>
        ) : (
          <>
            {/* HEADER MESSAGE */}
            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={C.green}
              />

              <Text style={styles.infoText}>
                Your order status is updated
                automatically.
              </Text>
            </View>

            {orders.map((order) => {
              const status =
                statusInfo[order.status] ||
                statusInfo.confirmed;

              const itemCount =
                getItemCount(order);

              const isActive =
                order.status !== 'delivered' &&
                order.status !== 'cancelled';

              return (
                <View
                  key={order.id}
                  style={styles.orderCard}
                >
                  {/* ORDER HEADER */}
                  <View style={styles.orderHeader}>
                    <View style={styles.orderIcon}>
                      <Ionicons
                        name="bag-handle-outline"
                        size={23}
                        color={C.maroon}
                      />
                    </View>

                    <View
                      style={styles.orderHeaderInfo}
                    >
                      <Text
                        style={styles.orderNumber}
                        numberOfLines={1}
                      >
                        #
                        {order.orderNumber ||
                          order.id.slice(-8)}
                      </Text>

                      <Text style={styles.orderDate}>
                        {formatDate(
                          order.createdAt
                        )}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            status.background,
                        },
                      ]}
                    >
                      <Ionicons
                        name={status.icon}
                        size={14}
                        color={status.color}
                      />

                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              status.color,
                          },
                        ]}
                      >
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* ITEMS */}
                  <View style={styles.itemsRow}>
                    <View
                      style={styles.itemIconGroup}
                    >
                      {order.items
                        .slice(0, 4)
                        .map((item, index) => (
                          <View
                            key={`${item.id}-${index}`}
                            style={[
                              styles.itemCircle,
                              {
                                marginLeft:
                                  index === 0
                                    ? 0
                                    : -8,
                              },
                            ]}
                          >
                            <Text
                              style={
                                styles.itemEmoji
                              }
                            >
                              {item.emoji ||
                                '🛒'}
                            </Text>
                          </View>
                        ))}
                    </View>

                    <View
                      style={styles.itemSummary}
                    >
                      <Text
                        style={
                          styles.itemCountText
                        }
                      >
                        {itemCount}{' '}
                        {itemCount === 1
                          ? 'item'
                          : 'items'}
                      </Text>

                      <Text
                        style={
                          styles.itemNames
                        }
                        numberOfLines={1}
                      >
                        {order.items
                          .map(
                            (item) =>
                              item.name
                          )
                          .join(', ')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* TOTAL */}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                      Total Amount
                    </Text>

                    <Text style={styles.totalValue}>
                      ₹
                      {order.total.toFixed(0)}
                    </Text>
                  </View>

                  {/* BUTTON */}
                  {isActive ? (
                    <Pressable
                      style={styles.trackButton}
                      onPress={() =>
                        handleTrackOrder(order)
                      }
                    >
                      <Ionicons
                        name="receipt-outline"
                        size={19}
                        color={C.white}
                      />

                      <Text
                        style={
                          styles.trackButtonText
                        }
                      >
                        View Order Details
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={C.white}
                      />
                    </Pressable>
                  ) : (
                    <Pressable
                      style={styles.completedRow}
                      onPress={() =>
                        handleTrackOrder(order)
                      }
                    >
                      <Ionicons
                        name={
                          order.status ===
                          'delivered'
                            ? 'checkmark-circle'
                            : 'close-circle'
                        }
                        size={19}
                        color={
                          order.status ===
                          'delivered'
                            ? C.green
                            : C.red
                        }
                      />

                      <Text
                        style={[
                          styles.completedText,
                          {
                            color:
                              order.status ===
                              'delivered'
                                ? C.green
                                : C.red,
                          },
                        ]}
                      >
                        {order.status ===
                        'delivered'
                          ? 'Order Delivered'
                          : 'Order Cancelled'}
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color={
                          order.status ===
                          'delivered'
                            ? C.green
                            : C.red
                        }
                        style={{
                          marginLeft: 6,
                        }}
                      />
                    </Pressable>
                  )}
                </View>
              );
            })}

            <Pressable
              style={styles.continueShopping}
              onPress={() => router.replace('/')}
            >
              <Ionicons
                name="cart-outline"
                size={19}
                color={C.maroon}
              />

              <Text
                style={styles.continueShoppingText}
              >
                Continue Shopping
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.cream,
  },

  header: {
    height: 70,
    backgroundColor: C.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F7F1EA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: C.text,
  },

  headerSubtitle: {
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F7EDEF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    padding: 16,
    paddingBottom: 35,
  },

  emptyContent: {
    flexGrow: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: C.muted,
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.lightGreen,
    borderRadius: 13,
    padding: 12,
    marginBottom: 14,
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: C.green,
    fontWeight: '600',
  },

  orderCard: {
    backgroundColor: C.white,
    borderRadius: 19,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },

  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  orderIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#F7EDEF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  orderHeaderInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  orderNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: C.text,
  },

  orderDate: {
    fontSize: 11,
    color: C.muted,
    marginTop: 4,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 14,
  },

  itemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  itemIconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  itemCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FAF4EC',
    borderWidth: 2,
    borderColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemEmoji: {
    fontSize: 21,
  },

  itemSummary: {
    flex: 1,
    marginLeft: 12,
  },

  itemCountText: {
    fontSize: 13,
    fontWeight: '800',
    color: C.text,
  },

  itemNames: {
    fontSize: 11,
    color: C.muted,
    marginTop: 4,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  totalLabel: {
    fontSize: 13,
    color: C.muted,
  },

  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: C.maroon,
  },

  trackButton: {
    height: 48,
    borderRadius: 13,
    backgroundColor: C.maroon,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  trackButtonText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
  },

  completedRow: {
    height: 45,
    borderRadius: 12,
    backgroundColor: '#F8F5F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  completedText: {
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 7,
  },

  continueShopping: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.maroon,
    backgroundColor: C.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  continueShoppingText: {
    color: C.maroon,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 7,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },

  emptyIcon: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: '#F7EDEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: C.text,
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: C.muted,
    marginTop: 9,
  },

  shopButton: {
    marginTop: 24,
    height: 50,
    borderRadius: 14,
    backgroundColor: C.maroon,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  shopButtonText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
