
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Ionicons } from '@expo/vector-icons';

import { useCart } from '@/context/CartContext';

import type {
  Order,
  OrderStatus,
} from '@/types/order';

const API_URL =
  'http://127.0.0.1:5000/api';

/* =========================
   COLORS
========================= */

const C = {
  background: '#F7F5EE',
  green: '#174A3A',
  greenDark: '#103629',
  gold: '#E5AC55',
  text: '#26372F',
  muted: '#78847B',
  border: '#E5E1D7',
  white: '#FFFFFF',
  softGreen: '#EAF3ED',
  softGold: '#FBF1DD',
  red: '#B94A48',
};

/* =========================
   STATUS
========================= */

const STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: 'Order Confirmed',
  preparing: 'Preparing Your Order',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Order Cancelled',
};

const STATUS_ICONS: Record<OrderStatus, string> = {
  confirmed: 'checkmark-circle',
  preparing: 'cube',
  out_for_delivery: 'bicycle',
  delivered: 'home',
  cancelled: 'close-circle',
};

/* =========================
   SCREEN
========================= */

export default function OrderDetailsScreen() {
  const router = useRouter();

  const { addToCart } = useCart();

  const params = useLocalSearchParams<{
    orderId?: string | string[];
  }>();

  const orderId = Array.isArray(params.orderId)
    ? params.orderId[0]
    : params.orderId;

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [cancelling, setCancelling] =
    useState(false);

  const [showCancelConfirm, setShowCancelConfirm] =
    useState(false);

  /* =========================
     SAFE BACK NAVIGATION
  ========================= */

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  /* =========================
     LOAD ORDER
  ========================= */

  const loadOrder = useCallback(
    async (showLoader = true) => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        }

        const response = await fetch(
          `${API_URL}/orders/${encodeURIComponent(
            orderId
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Failed to load order'
          );
        }

        const serverOrder = data.order;

        if (!serverOrder) {
          throw new Error(
            'Order not found'
          );
        }

        const normalizedOrder: Order = {
          id:
            serverOrder._id ||
            serverOrder.id,

          orderNumber:
            serverOrder.orderNumber,

          items: (
            serverOrder.items || []
          ).map((item: any) => ({
            id:
              item.productId ||
              item.id ||
              '',

            name:
              item.name ||
              'Product',

            price:
              Number(item.price) || 0,

            emoji:
              item.emoji,

            quantity:
              Number(item.quantity) || 1,
          })),

          deliveryAddress: {
            fullName:
              serverOrder
                .deliveryAddress
                ?.fullName || '',

            phone:
              serverOrder
                .deliveryAddress
                ?.phone || '',

            address:
              serverOrder
                .deliveryAddress
                ?.address || '',

            city:
              serverOrder
                .deliveryAddress
                ?.city || '',

            pincode:
              serverOrder
                .deliveryAddress
                ?.pincode || '',
          },

          paymentMethod: 'cod',

          subtotal:
            Number(
              serverOrder.subtotal
            ) || 0,

          deliveryFee:
            Number(
              serverOrder.deliveryFee
            ) || 0,

          total:
            Number(
              serverOrder.total
            ) || 0,

          status:
            serverOrder.status ||
            'confirmed',

          createdAt:
            serverOrder.createdAt ||
            new Date().toISOString(),
        };

        setOrder(normalizedOrder);
      } catch (error) {
        console.error(
          'Failed to load order details:',
          error
        );

        setOrder(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  /* =========================
     REFRESH
  ========================= */

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrder(false);
  };

  /* =========================
     BUY AGAIN
  ========================= */

  const handleBuyAgain = () => {
    if (
      !order ||
      order.items.length === 0
    ) {
      return;
    }

    order.items.forEach((item) => {
      const quantity = Math.max(
        1,
        Number(item.quantity) || 1
      );

      for (
        let i = 0;
        i < quantity;
        i++
      ) {
        addToCart(
          {
            id: item.id,
            name: item.name,
            price: item.price,
            emoji:
              item.emoji || '🛒',
            stock: 999,
          },
          {
            ignoreStockLimit: true,
          }
        );
      }
    });

    router.push('/cart');
  };

  /* =========================
     CANCEL ORDER
  ========================= */

  const canCancelOrder =
    order?.status === 'confirmed' ||
    order?.status === 'preparing';

  const handleCancelOrder = () => {
    console.log(
      '🔥 CANCEL BUTTON PRESSED'
    );

    if (!order) {
      console.log(
        '❌ No order found'
      );
      return;
    }

    if (!canCancelOrder) {
      console.log(
        '❌ Order cannot be cancelled. Status:',
        order.status
      );
      return;
    }

    if (cancelling) {
      console.log(
        '❌ Cancellation already in progress'
      );
      return;
    }

    setShowCancelConfirm(true);
  };

  const confirmCancelOrder =
    async () => {
      if (!order) {
        return;
      }

      if (!canCancelOrder) {
        setShowCancelConfirm(false);
        return;
      }

      try {
        setShowCancelConfirm(false);
        setCancelling(true);

        console.log(
          '🚫 Cancelling order:',
          order.id
        );

        const response =
          await fetch(
            `${API_URL}/orders/${encodeURIComponent(
              order.id
            )}/status`,
            {
              method: 'PATCH',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                status:
                  'cancelled',
              }),
            }
          );

        const data =
          await response.json();

        console.log(
          'Cancel response:',
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Failed to cancel order'
          );
        }

        setOrder(
          (currentOrder) => {
            if (!currentOrder) {
              return currentOrder;
            }

            return {
              ...currentOrder,
              status: 'cancelled',
            };
          }
        );

        console.log(
          '✅ Order cancelled successfully'
        );
      } catch (error) {
        console.error(
          '❌ Cancel order error:',
          error
        );

        setShowCancelConfirm(false);
      } finally {
        setCancelling(false);
      }
    };

  /* =========================
     DATE
  ========================= */

  const formatDate = (
    dateString: string
  ) => {
    const date =
      new Date(dateString);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return 'Recent order';
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  /* =========================
     TIME
  ========================= */

  const formatTime = (
    dateString: string
  ) => {
    const date =
      new Date(dateString);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '';
    }

    return date.toLocaleTimeString(
      'en-IN',
      {
        hour: 'numeric',
        minute: '2-digit',
      }
    );
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={C.green}
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading your order...
        </Text>
      </View>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (!order) {
    return (
      <View style={styles.center}>
        <View
          style={styles.errorIcon}
        >
          <Ionicons
            name="receipt-outline"
            size={42}
            color={C.green}
          />
        </View>

        <Text
          style={styles.errorTitle}
        >
          Order not found
        </Text>

        <Text
          style={styles.errorText}
        >
          We couldn't find the order
          you're looking for.
        </Text>

        <Pressable
          style={
            styles.primaryButton
          }
          onPress={handleBack}
        >
          <Text
            style={
              styles.primaryButtonText
            }
          >
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const isCancelled =
    order.status === 'cancelled';

  const isDelivered =
    order.status === 'delivered';

  /* =========================
     UI
  ========================= */

  return (
    <View style={styles.container}>

      {/* =====================
          CANCEL CONFIRMATION
      ===================== */}

      <Modal
        visible={showCancelConfirm}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowCancelConfirm(false)
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.confirmCard
            }
          >
            <View
              style={
                styles.confirmIcon
              }
            >
              <Ionicons
                name="close-circle"
                size={34}
                color={C.red}
              />
            </View>

            <Text
              style={
                styles.confirmTitle
              }
            >
              Cancel Order?
            </Text>

            <Text
              style={
                styles.confirmMessage
              }
            >
              Are you sure you want
              to cancel this order?
            </Text>

            <View
              style={
                styles.confirmButtons
              }
            >
              <Pressable
                style={
                  styles.keepOrderButton
                }
                onPress={() =>
                  setShowCancelConfirm(
                    false
                  )
                }
              >
                <Text
                  style={
                    styles.keepOrderButtonText
                  }
                >
                  Keep Order
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.confirmCancelButton
                }
                onPress={
                  confirmCancelOrder
                }
              >
                <Text
                  style={
                    styles.confirmCancelButtonText
                  }
                >
                  Yes, Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* =====================
          HEADER
      ===================== */}

      <View style={styles.header}>
        <Pressable
          style={
            styles.headerButton
          }
          onPress={handleBack}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={C.text}
          />
        </Pressable>

        <Text
          style={styles.headerTitle}
        >
          Order Details
        </Text>

        <Pressable
          style={
            styles.headerButton
          }
          onPress={handleRefresh}
        >
          <Ionicons
            name="refresh"
            size={21}
            color={C.text}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={C.green}
          />
        }
        contentContainerStyle={
          styles.content
        }
      >

        {/* =====================
            ORDER INFORMATION
        ===================== */}

        <View
          style={styles.orderHero}
        >
          <View
            style={
              styles.orderHeroIcon
            }
          >
            <Ionicons
              name={
                STATUS_ICONS[
                  order.status
                ] as any
              }
              size={28}
              color={C.green}
            />
          </View>

          <View
            style={
              styles.orderHeroInfo
            }
          >
            <Text
              style={
                styles.orderNumber
              }
            >
              {order.orderNumber
                ? `#${order.orderNumber}`
                : `#${order.id
                    .slice(-8)
                    .toUpperCase()}`}
            </Text>

            <Text
              style={styles.orderDate}
            >
              {formatDate(
                order.createdAt
              )}{' '}
              •{' '}
              {formatTime(
                order.createdAt
              )}
            </Text>
          </View>
        </View>

        {/* =====================
            STATUS
        ===================== */}

        <View
          style={[
            styles.statusCard,
            isCancelled &&
              styles.cancelledCard,
            isDelivered &&
              styles.deliveredCard,
          ]}
        >
          <View
            style={styles.statusIcon}
          >
            <Ionicons
              name={
                STATUS_ICONS[
                  order.status
                ] as any
              }
              size={24}
              color={
                isCancelled
                  ? C.red
                  : C.green
              }
            />
          </View>

          <View
            style={styles.statusInfo}
          >
            <Text
              style={
                styles.statusLabel
              }
            >
              Current Status
            </Text>

            <Text
              style={[
                styles.statusTitle,
                isCancelled &&
                  styles.cancelledText,
              ]}
            >
              {
                STATUS_LABELS[
                  order.status
                ]
              }
            </Text>
          </View>
        </View>

        {/* =====================
            TRACK ORDER
        ===================== */}

        {!isCancelled &&
          !isDelivered && (
            <Pressable
              style={
                styles.trackButton
              }
              onPress={() =>
                router.push({
                  pathname:
                    '/order-tracking',
                  params: {
                    orderId:
                      order.id,
                  },
                })
              }
            >
              <Ionicons
                name="navigate-outline"
                size={21}
                color={C.white}
              />

              <Text
                style={
                  styles.trackButtonText
                }
              >
                Track My Order
              </Text>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={C.white}
              />
            </Pressable>
          )}

        {/* =====================
            CANCEL ORDER
        ===================== */}

        {canCancelOrder && (
          <Pressable
            style={[
              styles.cancelButton,
              cancelling &&
                styles.cancelButtonDisabled,
            ]}
            onPress={
              handleCancelOrder
            }
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator
                size="small"
                color={C.red}
              />
            ) : (
              <Ionicons
                name="close-circle-outline"
                size={21}
                color={C.red}
              />
            )}

            <Text
              style={
                styles.cancelButtonText
              }
            >
              {cancelling
                ? 'Cancelling...'
                : 'Cancel Order'}
            </Text>
          </Pressable>
        )}

        {/* =====================
            ITEMS
        ===================== */}

        <View
          style={styles.section}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Your Items
          </Text>

          <View
            style={styles.card}
          >
            {order.items.map(
              (item, index) => (
                <View
                  key={`${item.id}-${index}`}
                  style={[
                    styles.itemRow,
                    index !==
                      order.items.length -
                        1 &&
                      styles.itemBorder,
                  ]}
                >
                  <View
                    style={
                      styles.itemImage
                    }
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

                  <View
                    style={
                      styles.itemInfo
                    }
                  >
                    <Text
                      style={
                        styles.itemName
                      }
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>

                    <Text
                      style={
                        styles.itemQuantity
                      }
                    >
                      Quantity:{' '}
                      {item.quantity}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.itemPrice
                    }
                  >
                    ₹
                    {(
                      item.price *
                      item.quantity
                    ).toFixed(0)}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>

        {/* =====================
            DELIVERY ADDRESS
        ===================== */}

        <View
          style={styles.section}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Delivery Address
          </Text>

          <View
            style={styles.card}
          >
            <View
              style={
                styles.addressHeader
              }
            >
              <View
                style={
                  styles.addressIcon
                }
              >
                <Ionicons
                  name="location"
                  size={20}
                  color={C.green}
                />
              </View>

              <View
                style={
                  styles.addressInfo
                }
              >
                <Text
                  style={
                    styles.addressName
                  }
                >
                  {
                    order
                      .deliveryAddress
                      .fullName
                  }
                </Text>

                <Text
                  style={
                    styles.addressPhone
                  }
                >
                  {
                    order
                      .deliveryAddress
                      .phone
                  }
                </Text>
              </View>
            </View>

            <Text
              style={
                styles.addressText
              }
            >
              {
                order
                  .deliveryAddress
                  .address
              }
            </Text>

            <Text
              style={
                styles.addressText
              }
            >
              {
                order
                  .deliveryAddress
                  .city
              }{' '}
              -{' '}
              {
                order
                  .deliveryAddress
                  .pincode
              }
            </Text>
          </View>
        </View>

        {/* =====================
            PAYMENT
        ===================== */}

        <View
          style={styles.section}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Payment
          </Text>

          <View
            style={styles.card}
          >
            <View
              style={
                styles.paymentRow
              }
            >
              <View
                style={
                  styles.paymentLeft
                }
              >
                <Ionicons
                  name="cash-outline"
                  size={22}
                  color={C.green}
                />

                <View>
                  <Text
                    style={
                      styles.paymentTitle
                    }
                  >
                    Cash on Delivery
                  </Text>

                  <Text
                    style={
                      styles.paymentSub
                    }
                  >
                    Payment method
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.codBadge
                }
              >
                <Text
                  style={
                    styles.codText
                  }
                >
                  COD
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =====================
            BILL SUMMARY
        ===================== */}

        <View
          style={styles.section}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Bill Summary
          </Text>

          <View
            style={styles.card}
          >
            <View
              style={styles.billRow}
            >
              <Text
                style={
                  styles.billLabel
                }
              >
                Item Total
              </Text>

              <Text
                style={
                  styles.billValue
                }
              >
                ₹
                {order.subtotal.toFixed(
                  0
                )}
              </Text>
            </View>

            <View
              style={styles.billRow}
            >
              <Text
                style={
                  styles.billLabel
                }
              >
                Delivery Fee
              </Text>

              <Text
                style={
                  styles.billValue
                }
              >
                {order.deliveryFee ===
                0
                  ? 'FREE'
                  : `₹${order.deliveryFee.toFixed(
                      0
                    )}`}
              </Text>
            </View>

            <View
              style={styles.billDivider}
            />

            <View
              style={styles.totalRow}
            >
              <Text
                style={
                  styles.totalLabel
                }
              >
                Total Paid
              </Text>

              <Text
                style={
                  styles.totalValue
                }
              >
                ₹
                {order.total.toFixed(
                  0
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* =====================
            BUY AGAIN
        ===================== */}

        {!isCancelled && (
          <Pressable
            style={
              styles.buyAgainButton
            }
            onPress={
              handleBuyAgain
            }
          >
            <Ionicons
              name="refresh-outline"
              size={21}
              color={C.white}
            />

            <Text
              style={
                styles.buyAgainButtonText
              }
            >
              Buy Again
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={C.white}
            />
          </Pressable>
        )}

        {/* =====================
            CONTINUE SHOPPING
        ===================== */}

        <Pressable
          style={
            styles.continueButton
          }
          onPress={() =>
            router.push('/')
          }
        >
          <Ionicons
            name="bag-outline"
            size={20}
            color={C.green}
          />

          <Text
            style={
              styles.continueText
            }
          >
            Continue Shopping
          </Text>
        </Pressable>

        <View
          style={styles.bottomSpace}
        />

      </ScrollView>
    </View>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      C.background,
  },

  header: {
    height: 74,
    paddingHorizontal: 18,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    backgroundColor:
      C.background,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent:
      'center',
    backgroundColor:
      C.white,
    borderWidth: 1,
    borderColor:
      C.border,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  orderHero: {
    backgroundColor:
      C.white,
    borderRadius: 20,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor:
      C.border,
    marginBottom: 12,
  },

  orderHeroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor:
      C.softGreen,
    alignItems: 'center',
    justifyContent:
      'center',
    marginRight: 14,
  },

  orderHeroInfo: {
    flex: 1,
  },

  orderNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
  },

  orderDate: {
    marginTop: 5,
    fontSize: 13,
    color: C.muted,
  },

  statusCard: {
    backgroundColor:
      C.softGold,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  deliveredCard: {
    backgroundColor:
      C.softGreen,
  },

  cancelledCard: {
    backgroundColor:
      '#FBEAEA',
  },

  statusIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor:
      C.white,
    alignItems: 'center',
    justifyContent:
      'center',
    marginRight: 12,
  },

  statusInfo: {
    flex: 1,
  },

  statusLabel: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '600',
  },

  statusTitle: {
    marginTop: 3,
    fontSize: 16,
    color: C.green,
    fontWeight: '800',
  },

  cancelledText: {
    color: C.red,
  },

  trackButton: {
    minHeight: 54,
    borderRadius: 17,
    backgroundColor:
      C.green,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  trackButtonText: {
    flex: 1,
    marginLeft: 10,
    color: C.white,
    fontSize: 15,
    fontWeight: '800',
  },

  /* =========================
     CANCEL BUTTON
  ========================= */

  cancelButton: {
    minHeight: 54,
    borderRadius: 17,
    backgroundColor:
      '#FBEAEA',
    borderWidth: 1,
    borderColor:
      '#E8B7B7',
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'center',
    marginBottom: 22,
  },

  cancelButtonDisabled: {
    opacity: 0.65,
  },

  cancelButtonText: {
    marginLeft: 9,
    color: C.red,
    fontSize: 15,
    fontWeight: '800',
  },

  /* =========================
     CANCEL MODAL
  ========================= */

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  confirmCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor:
      C.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },

  confirmIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor:
      '#FBEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  confirmTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: C.text,
  },

  confirmMessage: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: C.muted,
  },

  confirmButtons: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },

  keepOrderButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor:
      C.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      C.white,
  },

  keepOrderButtonText: {
    color: C.text,
    fontSize: 14,
    fontWeight: '800',
  },

  confirmCancelButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      C.red,
  },

  confirmCancelButtonText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
  },

  /* =========================
     SECTIONS
  ========================= */

  section: {
    marginTop: 4,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
    marginBottom: 10,
  },

  card: {
    backgroundColor:
      C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor:
      C.border,
    paddingHorizontal: 15,
    overflow: 'hidden',
  },

  /* =========================
     ITEMS
  ========================= */

  itemRow: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor:
      C.border,
  },

  itemImage: {
    width: 55,
    height: 55,
    borderRadius: 15,
    backgroundColor:
      '#F5F2E9',
    alignItems: 'center',
    justifyContent:
      'center',
    marginRight: 12,
  },

  itemEmoji: {
    fontSize: 27,
  },

  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },

  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    lineHeight: 19,
  },

  itemQuantity: {
    marginTop: 4,
    fontSize: 12,
    color: C.muted,
  },

  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
  },

  /* =========================
     ADDRESS
  ========================= */

  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
  },

  addressIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      C.softGreen,
    alignItems: 'center',
    justifyContent:
      'center',
    marginRight: 11,
  },

  addressInfo: {
    flex: 1,
  },

  addressName: {
    fontSize: 15,
    fontWeight: '800',
    color: C.text,
  },

  addressPhone: {
    marginTop: 3,
    fontSize: 12,
    color: C.muted,
  },

  addressText: {
    fontSize: 13,
    lineHeight: 19,
    color: C.muted,
    marginLeft: 53,
    marginTop: 4,
  },

  /* =========================
     PAYMENT
  ========================= */

  paymentRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  paymentTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
  },

  paymentSub: {
    marginTop: 3,
    fontSize: 12,
    color: C.muted,
  },

  codBadge: {
    backgroundColor:
      C.softGreen,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  codText: {
    color: C.green,
    fontSize: 11,
    fontWeight: '800',
  },

  /* =========================
     BILL
  ========================= */

  billRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    paddingVertical: 8,
  },

  billLabel: {
    fontSize: 13,
    color: C.muted,
  },

  billValue: {
    fontSize: 13,
    color: C.text,
    fontWeight: '700',
  },

  billDivider: {
    height: 1,
    backgroundColor:
      C.border,
    marginVertical: 7,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    paddingTop: 7,
    paddingBottom: 15,
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: C.text,
  },

  totalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: C.green,
  },

  /* =========================
     BUY AGAIN
  ========================= */

  buyAgainButton: {
    minHeight: 54,
    borderRadius: 17,
    backgroundColor:
      C.green,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  buyAgainButtonText: {
    flex: 1,
    marginLeft: 10,
    color: C.white,
    fontSize: 15,
    fontWeight: '800',
  },

  /* =========================
     CONTINUE SHOPPING
  ========================= */

  continueButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor:
      C.white,
    borderWidth: 1,
    borderColor:
      C.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'center',
    gap: 8,
  },

  continueText: {
    color: C.green,
    fontSize: 14,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 20,
  },

  /* =========================
     CENTER
  ========================= */

  center: {
    flex: 1,
    backgroundColor:
      C.background,
    alignItems: 'center',
    justifyContent:
      'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: C.muted,
  },

  errorIcon: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor:
      C.softGreen,
    alignItems: 'center',
    justifyContent:
      'center',
    marginBottom: 18,
  },

  errorTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: C.text,
  },

  errorText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: C.muted,
  },

  primaryButton: {
    marginTop: 22,
    backgroundColor:
      C.green,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 15,
  },

  primaryButtonText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
  },
});