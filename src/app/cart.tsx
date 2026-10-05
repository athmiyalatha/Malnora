import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const MAROON = '#741B2B';
const DARK_MAROON = '#4B101D';
const CREAM = '#FBF6ED';
const GOLD = '#B18A4A';
const MUTED = '#827568';

export default function CartScreen() {
  const router = useRouter();

  // Get cart items and quantity functions from CartContext
  const { items, changeQuantity } = useCart();

  // Total number of products in the cart
  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Calculate subtotal
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Free delivery for orders of ₹499 or more
  const delivery = subtotal === 0 || subtotal >= 499 ? 0 : 30;

  const total = subtotal + delivery;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Your Bag</Text>

            <Text style={styles.headerSubtitle}>
              {itemCount} items in your basket
            </Text>
          </View>

          <Text style={styles.bagIcon}>🛍</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* DELIVERY CARD */}
          <View style={styles.deliveryCard}>
            <Text style={styles.deliveryIcon}>✦</Text>

            <View style={styles.deliveryTextWrap}>
              <Text style={styles.deliveryTitle}>
                Freshness is on its way
              </Text>

              <Text style={styles.deliverySubtitle}>
                {subtotal >= 499
                  ? 'You qualify for free delivery!'
                  : subtotal === 0
                    ? 'Add groceries to your basket'
                    : `Add ₹${499 - subtotal} more for free delivery`}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Shopping list
          </Text>

          {/* EMPTY CART */}
          {items.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🛒</Text>

              <Text style={styles.emptyTitle}>
                Your bag is empty
              </Text>

              <Text style={styles.emptySubtitle}>
                Add your favourite groceries to get started.
              </Text>

              <Pressable
                style={styles.shopButton}
                onPress={() => router.replace('/')}
              >
                <Text style={styles.shopButtonText}>
                  EXPLORE GROCERIES
                </Text>
              </Pressable>
            </View>
          ) : (
            /* CART PRODUCTS */
            items.map((item) => (
              <View
                key={item.id}
                style={styles.itemCard}
              >
                <View style={styles.productEmojiBox}>
                  <Text style={styles.productEmoji}>
                    {item.emoji}
                  </Text>
                </View>

                <View style={styles.productInfo}>
                  <Text style={styles.productCategory}>
                    {(item.category ?? 'Grocery').toUpperCase()}
                  </Text>

                  <Text style={styles.productName}>
                    {item.name}
                  </Text>

                  <Text style={styles.productSize}>
                    {item.size ?? ''}
                  </Text>

                  {/* QUANTITY CONTROLS */}
                  <View style={styles.quantityControl}>
                    <Pressable
                      onPress={() =>
                        changeQuantity(item.id, -1)
                      }
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>
                        −
                      </Text>
                    </Pressable>

                    <Text style={styles.quantityValue}>
                      {item.quantity}
                    </Text>

                    <Pressable
                      onPress={() =>
                        changeQuantity(item.id, 1)
                      }
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>
                        +
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* PRODUCT TOTAL */}
                <Text style={styles.itemPrice}>
                  ₹{item.price * item.quantity}
                </Text>
              </View>
            ))
          )}

          {/* COUPON AND BILL */}
          {items.length > 0 && (
            <>
              <View style={styles.couponCard}>
                <Text style={styles.couponIcon}>♧</Text>

                <View style={styles.couponTextWrap}>
                  <Text style={styles.couponTitle}>
                    Have a promo code?
                  </Text>

                  <Text style={styles.couponSubtitle}>
                    Offers and savings will appear here.
                  </Text>
                </View>

                <Text style={styles.couponArrow}>›</Text>
              </View>

              <Text style={styles.sectionTitle}>
                Bill details
              </Text>

              <View style={styles.billCard}>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>
                    Item total ({itemCount} items)
                  </Text>

                  <Text style={styles.billValue}>
                    ₹{subtotal}
                  </Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>
                    Delivery fee
                  </Text>

                  <Text style={styles.billValue}>
                    {delivery === 0
                      ? 'FREE'
                      : `₹${delivery}`}
                  </Text>
                </View>

                <View style={styles.billDivider} />

                <View style={styles.billRow}>
                  <Text style={styles.totalLabel}>
                    Grand total
                  </Text>

                  <Text style={styles.totalValue}>
                    ₹{total}
                  </Text>
                </View>

                <Text style={styles.taxNote}>
                  Final charges may vary based on your order.
                </Text>
              </View>
            </>
          )}
        </ScrollView>

        {/* BOTTOM CHECKOUT BAR */}
        {items.length > 0 && (
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomLabel}>
                TOTAL AMOUNT
              </Text>

              <Text style={styles.bottomTotal}>
                ₹{total}
              </Text>
            </View>

            <Pressable
              style={styles.checkoutButton}
              onPress={() => router.push('/checkout')}
            >
              <Text style={styles.checkoutText}>
                CHECKOUT →
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CREAM,
  },

  container: {
    flex: 1,
    backgroundColor: CREAM,
  },

  header: {
    minHeight: 78,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9DECF',
  },

  backButton: {
    width: 38,
    height: 42,
    justifyContent: 'center',
  },

  backText: {
    fontSize: 38,
    color: MAROON,
  },

  headerTitleWrap: {
    flex: 1,
    marginLeft: 6,
  },

  headerTitle: {
    fontSize: 23,
    color: DARK_MAROON,
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: MUTED,
  },

  bagIcon: {
    fontSize: 24,
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 30,
  },

  deliveryCard: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0E5D3',
    borderWidth: 1,
    borderColor: '#E4D2B6',
    gap: 12,
  },

  deliveryIcon: {
    fontSize: 24,
    color: GOLD,
  },

  deliveryTextWrap: {
    flex: 1,
  },

  deliveryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK_MAROON,
  },

  deliverySubtitle: {
    marginTop: 5,
    fontSize: 11,
    color: MUTED,
  },

  sectionTitle: {
    marginTop: 25,
    marginBottom: 13,
    fontSize: 19,
    color: DARK_MAROON,
  },

  itemCard: {
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFCF6',
    borderWidth: 1,
    borderColor: '#E9DECF',
    gap: 12,
  },

  productEmojiBox: {
    width: 70,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1E6D7',
  },

  productEmoji: {
    fontSize: 35,
  },

  productInfo: {
    flex: 1,
  },

  productCategory: {
    fontSize: 8,
    letterSpacing: 1,
    color: GOLD,
  },

  productName: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
    color: DARK_MAROON,
  },

  productSize: {
    marginTop: 4,
    fontSize: 10,
    color: MUTED,
  },

  quantityControl: {
    marginTop: 9,
    width: 91,
    height: 29,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4EBDD',
    borderWidth: 1,
    borderColor: '#DDC9AD',
  },

  quantityButton: {
    width: 29,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityButtonText: {
    fontSize: 18,
    color: MAROON,
  },

  quantityValue: {
    fontSize: 12,
    fontWeight: '700',
    color: DARK_MAROON,
  },

  itemPrice: {
    alignSelf: 'flex-start',
    marginTop: 5,
    fontSize: 14,
    fontWeight: '700',
    color: DARK_MAROON,
  },

  couponCard: {
    marginTop: 14,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFCF6',
    borderWidth: 1,
    borderColor: '#E9DECF',
    gap: 12,
  },

  couponIcon: {
    fontSize: 22,
    color: GOLD,
  },

  couponTextWrap: {
    flex: 1,
  },

  couponTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: DARK_MAROON,
  },

  couponSubtitle: {
    marginTop: 4,
    fontSize: 10,
    color: MUTED,
  },

  couponArrow: {
    fontSize: 25,
    color: MAROON,
  },

  billCard: {
    padding: 16,
    backgroundColor: '#FFFCF6',
    borderWidth: 1,
    borderColor: '#E9DECF',
  },

  billRow: {
    marginBottom: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  billLabel: {
    fontSize: 12,
    color: MUTED,
  },

  billValue: {
    fontSize: 12,
    color: DARK_MAROON,
  },

  billDivider: {
    height: 1,
    marginBottom: 14,
    backgroundColor: '#E9DECF',
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK_MAROON,
  },

  totalValue: {
    fontSize: 17,
    fontWeight: '700',
    color: MAROON,
  },

  taxNote: {
    fontSize: 9,
    color: MUTED,
  },

  emptyCard: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFFCF6',
    borderWidth: 1,
    borderColor: '#E9DECF',
  },

  emptyEmoji: {
    fontSize: 43,
  },

  emptyTitle: {
    marginTop: 13,
    fontSize: 20,
    color: DARK_MAROON,
  },

  emptySubtitle: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
    color: MUTED,
  },

  shopButton: {
    marginTop: 20,
    padding: 14,
    backgroundColor: MAROON,
  },

  shopButtonText: {
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  bottomBar: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFCF6',
    borderTopWidth: 1,
    borderTopColor: '#E9DECF',
  },

  bottomLabel: {
    fontSize: 8,
    letterSpacing: 1,
    color: MUTED,
  },

  bottomTotal: {
    marginTop: 4,
    fontSize: 21,
    fontWeight: '700',
    color: DARK_MAROON,
  },

  checkoutButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: MAROON,
  },

  checkoutText: {
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});