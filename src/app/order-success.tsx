import { useCart } from '@/context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const API_URL = 'http://127.0.0.1:5000/api';

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
};

type Order = {
  _id: string;
  orderNumber: string;
  status: string;
};

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { clearCart } = useCart();

  /*
   * Checkout sends the real MongoDB order ID:
   *
   * orderId: createdOrder._id
   */
  const params = useLocalSearchParams<{
    orderId?: string | string[];
  }>();

  const orderId = Array.isArray(params.orderId)
    ? params.orderId[0]
    : params.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  /*
   * Load the order from the backend.
   */
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        console.log(
          'Order Success: No order ID received'
        );

        setLoadingOrder(false);
        return;
      }

      try {
        console.log(
          'Order Success - MongoDB ID:',
          orderId
        );

        const response = await fetch(
          `${API_URL}/orders/${encodeURIComponent(orderId)}`
        );

        const data = await response.json();

        console.log(
          'Order Success API response:',
          data
        );

        if (response.ok && data.order) {
          setOrder(data.order);
        }
      } catch (error) {
        console.error(
          'Failed to load order:',
          error
        );
      } finally {
        setLoadingOrder(false);
      }
    };

    loadOrder();
  }, [orderId]);

  /*
   * Continue shopping.
   */
  const handleContinueShopping = () => {
    clearCart();
    router.replace('/');
  };

  /*
   * Open the order tracking screen.
   *
   * IMPORTANT:
   * order-tracking.tsx expects orderId as a route parameter.
   */
  const handleTrackOrder = () => {
    if (!orderId) {
      console.error(
        'Cannot track order: orderId is missing'
      );

      return;
    }

    console.log(
      'Opening tracking for MongoDB Order ID:',
      orderId
    );

    clearCart();

    router.push({
      pathname: '/order-tracking',
      params: {
        orderId: orderId,
      },
    });
  };

  const displayOrderNumber =
    order?.orderNumber || 'Loading...';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* SUCCESS ICON */}
        <View style={styles.successCircle}>
          <Ionicons
            name="checkmark"
            size={58}
            color={C.white}
          />
        </View>

        {/* SUCCESS MESSAGE */}
        <Text style={styles.title}>
          Order Placed!
        </Text>

        <Text style={styles.subtitle}>
          Thank you for shopping with Malnora.
          {'\n'}
          Your order has been successfully placed.
        </Text>

        {/* ORDER CARD */}
        <View style={styles.orderCard}>
          <View style={styles.orderRow}>
            <View>
              <Text style={styles.smallLabel}>
                Order Number
              </Text>

              {loadingOrder ? (
                <ActivityIndicator
                  size="small"
                  color={C.maroon}
                />
              ) : (
                <Text style={styles.orderNumber}>
                  #{displayOrderNumber}
                </Text>
              )}
            </View>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />

              <Text style={styles.statusText}>
                Confirmed
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* DELIVERY */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="time-outline"
                size={21}
                color={C.maroon}
              />
            </View>

            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>
                Estimated Delivery
              </Text>

              <Text style={styles.infoValue}>
                20–30 minutes
              </Text>
            </View>
          </View>

          {/* PAYMENT */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="card-outline"
                size={21}
                color={C.maroon}
              />
            </View>

            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>
                Payment
              </Text>

              <Text style={styles.infoValue}>
                Cash on Delivery
              </Text>
            </View>
          </View>

          {/* STATUS */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color={C.maroon}
              />
            </View>

            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>
                Order Status
              </Text>

              <Text style={styles.infoValue}>
                We're preparing your order
              </Text>
            </View>
          </View>
        </View>

        {/* DELIVERY MESSAGE */}
        <View style={styles.deliveryBox}>
          <Ionicons
            name="bicycle-outline"
            size={25}
            color={C.green}
          />

          <Text style={styles.deliveryText}>
            Your groceries are being prepared.
            We'll get them to you as quickly as
            possible.
          </Text>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttons}>
          {/* TRACK ORDER */}
          <Pressable
            style={[
              styles.trackButton,
              !orderId && styles.disabledButton,
            ]}
            onPress={handleTrackOrder}
            disabled={!orderId}
          >
            <Ionicons
              name="navigate-outline"
              size={20}
              color={C.white}
            />

            <Text style={styles.trackButtonText}>
              Track Order
            </Text>
          </Pressable>

          {/* CONTINUE SHOPPING */}
          <Pressable
            style={styles.continueButton}
            onPress={handleContinueShopping}
          >
            <Text style={styles.continueButtonText}>
              Continue Shopping
            </Text>
          </Pressable>
        </View>

        <Text style={styles.footerText}>
          Thank you for choosing Malnora ❤️
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.cream,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 45,
  },

  successCircle: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },

  title: {
    fontSize: 30,
    fontWeight: '900',
    color: C.text,
    marginTop: 22,
  },

  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: C.muted,
    marginTop: 9,
  },

  orderCard: {
    width: '100%',
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 17,
    marginTop: 25,
    borderWidth: 1,
    borderColor: C.border,
  },

  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  smallLabel: {
    fontSize: 11,
    color: C.muted,
    marginBottom: 4,
  },

  orderNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: C.text,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.lightGreen,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.green,
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: C.green,
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 15,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F7EDEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  infoText: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 11,
    color: C.muted,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
    marginTop: 3,
  },

  deliveryBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.lightGreen,
    borderRadius: 15,
    padding: 13,
    marginTop: 15,
  },

  deliveryText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: C.green,
    fontWeight: '600',
    marginLeft: 10,
  },

  buttons: {
    width: '100%',
    marginTop: 22,
  },

  trackButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: C.maroon,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  disabledButton: {
    opacity: 0.5,
  },

  trackButtonText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '800',
  },

  continueButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.maroon,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 11,
    backgroundColor: C.white,
  },

  continueButtonText: {
    color: C.maroon,
    fontSize: 15,
    fontWeight: '800',
  },

  footerText: {
    position: 'absolute',
    bottom: 18,
    fontSize: 12,
    color: C.muted,
  },
});