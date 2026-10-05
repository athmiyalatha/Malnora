import { router, useLocalSearchParams } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const COLORS = {
  maroon: '#741B2B',
  darkMaroon: '#4B101D',
  cream: '#FBF6ED',
  white: '#FFFFFF',
  muted: '#827568',
  green: '#426B48',
  border: '#EAE0D3',
};

export default function OrderSuccessScreen() {
  const params = useLocalSearchParams<{
    orderId?: string;
    name?: string;
    total?: string;
    address?: string;
    payment?: string;
  }>();

  const orderId = params.orderId || 'MLN-000001';
  const name = params.name || 'Customer';
  const total = params.total || '0';
  const address = params.address || 'Your delivery address';
  const payment = params.payment || 'Cash on Delivery';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.successTitle}>
          Order placed!
        </Text>

        <Text style={styles.subtitle}>
          Thank you, {name}. Your fresh groceries are on their way!
        </Text>

        <View style={styles.orderCard}>
          <Text style={styles.cardLabel}>ORDER NUMBER</Text>
          <Text style={styles.orderNumber}>{orderId}</Text>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Confirmed</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment</Text>
            <Text style={styles.detailValue}>{payment}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total amount</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.cardLabel}>DELIVERY ADDRESS</Text>
          <Text style={styles.address}>{address}</Text>
        </View>

        <View style={styles.trackingCard}>
          <Text style={styles.trackingTitle}>
            Your delivery journey
          </Text>

          <View style={styles.timelineItem}>
            <View style={styles.timelineIconActive}>
              <Text style={styles.timelineEmoji}>✓</Text>
            </View>
            <View style={styles.timelineText}>
              <Text style={styles.timelineHeading}>
                Order confirmed
              </Text>
              <Text style={styles.timelineSubtitle}>
                Your order has been received.
              </Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Text style={styles.timelineEmoji}>📦</Text>
            </View>
            <View style={styles.timelineText}>
              <Text style={styles.timelineHeading}>
                Preparing your order
              </Text>
              <Text style={styles.timelineSubtitle}>
                Your groceries will be packed.
              </Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Text style={styles.timelineEmoji}>🛵</Text>
            </View>
            <View style={styles.timelineText}>
              <Text style={styles.timelineHeading}>
                Out for delivery
              </Text>
              <Text style={styles.timelineSubtitle}>
                Your delivery partner will bring your order.
              </Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Text style={styles.timelineEmoji}>🏠</Text>
            </View>
            <View style={styles.timelineText}>
              <Text style={styles.timelineHeading}>
                Delivered
              </Text>
              <Text style={styles.timelineSubtitle}>
                Enjoy your fresh groceries!
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteEmoji}>🌿</Text>
          <Text style={styles.noteText}>
            Thank you for choosing Malnora.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.primaryButtonText}>
            Continue Shopping
          </Text>
          <Text style={styles.buttonArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 65,
    paddingBottom: 120,
  },

  successCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E3EEDC',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#B7D0AA',
  },

  checkmark: {
    fontSize: 48,
    color: COLORS.green,
    fontWeight: '800',
  },

  successTitle: {
    fontSize: 30,
    color: COLORS.darkMaroon,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 22,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 9,
    marginBottom: 27,
  },

  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },

  cardLabel: {
    color: COLORS.muted,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '800',
  },

  orderNumber: {
    color: COLORS.maroon,
    fontSize: 21,
    fontWeight: '800',
    marginTop: 8,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  detailLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },

  detailValue: {
    color: COLORS.darkMaroon,
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },

  totalValue: {
    color: COLORS.maroon,
    fontSize: 18,
    fontWeight: '800',
  },

  statusBadge: {
    backgroundColor: '#E5F1E2',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  statusText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '800',
  },

  address: {
    color: COLORS.darkMaroon,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 9,
  },

  trackingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  trackingTitle: {
    color: COLORS.darkMaroon,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 23,
  },

  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timelineIconActive: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E3EEDC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  timelineIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4EDE2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  timelineEmoji: {
    fontSize: 17,
    color: COLORS.green,
  },

  timelineText: {
    flex: 1,
    marginLeft: 13,
  },

  timelineHeading: {
    color: COLORS.darkMaroon,
    fontSize: 13,
    fontWeight: '800',
  },

  timelineSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },

  timelineLine: {
    height: 25,
    width: 2,
    backgroundColor: COLORS.border,
    marginLeft: 18,
  },

  note: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },

  noteEmoji: {
    fontSize: 17,
    marginRight: 8,
  },

  noteText: {
    color: COLORS.muted,
    fontSize: 12,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 25,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  primaryButton: {
    backgroundColor: COLORS.maroon,
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },

  buttonArrow: {
    color: COLORS.white,
    fontSize: 20,
    marginLeft: 12,
  },
});