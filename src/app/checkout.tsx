import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { createOrder } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const C = {
  maroon: '#741B2B',
  darkMaroon: '#4B101D',
  gold: '#B18A4A',
  cream: '#FBF6ED',
  white: '#FFFFFF',
  text: '#241A17',
  muted: '#827568',
  border: '#E8DED3',
  green: '#426B48',
  lightGreen: '#EEF5EF',
};

const STORAGE_KEY = '@malnora_saved_addresses';

type SavedAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  isDefault: boolean;
};

export default function CheckoutScreen() {
  const router = useRouter();

  const { items, clearCart } = useCart();
  const { addOrder } = useOrders();

  // ==================================================
  // DELIVERY ADDRESS
  // ==================================================

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // ==================================================
  // SAVED ADDRESSES
  // ==================================================

  const [savedAddresses, setSavedAddresses] =
    useState<SavedAddress[]>([]);

  const [showSavedAddresses, setShowSavedAddresses] =
    useState(false);

  // ==================================================
  // PAYMENT
  // ==================================================

  const [paymentMethod, setPaymentMethod] =
    useState<'cod'>('cod');

  const [placingOrder, setPlacingOrder] =
    useState(false);

  // ==================================================
  // LOAD SAVED ADDRESSES
  // ==================================================

  useEffect(() => {
    const loadSavedAddresses = async () => {
      try {
        const saved =
          await AsyncStorage.getItem(STORAGE_KEY);

        if (!saved) {
          return;
        }

        const parsed: SavedAddress[] =
          JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setSavedAddresses(parsed);

          // Automatically use default address
          const defaultAddress =
            parsed.find(
              (item) => item.isDefault
            );

          if (defaultAddress) {
            setFullName(defaultAddress.fullName);
            setPhone(defaultAddress.phone);
            setAddress(defaultAddress.address);
            setCity(defaultAddress.city);
            setPincode(defaultAddress.pincode);
          }
        }
      } catch (error) {
        console.error(
          'Failed to load saved addresses:',
          error
        );
      }
    };

    loadSavedAddresses();
  }, []);

  // ==================================================
  // SELECT SAVED ADDRESS
  // ==================================================

  const selectSavedAddress = (
    savedAddress: SavedAddress
  ) => {
    setFullName(savedAddress.fullName);
    setPhone(savedAddress.phone);
    setAddress(savedAddress.address);
    setCity(savedAddress.city);
    setPincode(savedAddress.pincode);

    setShowSavedAddresses(false);
  };

  // ==================================================
  // TOTALS
  // ==================================================

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.price * item.quantity,
        0
      ),
    [items]
  );

  const deliveryFee =
    subtotal >= 499 ? 0 : 40;

  const total =
    subtotal + deliveryFee;

  // ==================================================
  // PLACE ORDER
  // ==================================================

  const placeOrder = async () => {
    if (!fullName.trim()) {
      Alert.alert(
        'Missing information',
        'Please enter your full name.'
      );
      return;
    }

    if (
      !phone.trim() ||
      phone.replace(/\D/g, '').length !== 10
    ) {
      Alert.alert(
        'Invalid phone number',
        'Please enter a valid 10-digit phone number.'
      );
      return;
    }

    if (!address.trim()) {
      Alert.alert(
        'Missing address',
        'Please enter your complete delivery address.'
      );
      return;
    }

    if (!city.trim()) {
      Alert.alert(
        'Missing city',
        'Please enter your city.'
      );
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      Alert.alert(
        'Invalid pincode',
        'Please enter a valid 6-digit pincode.'
      );
      return;
    }

    if (items.length === 0) {
      Alert.alert(
        'Your cart is empty',
        'Please add some products before checkout.'
      );
      return;
    }

    if (placingOrder) {
      return;
    }

    try {
      setPlacingOrder(true);

      const orderNumber =
        `MQ${Date.now()}`;

      // Send order to MongoDB
      const createdOrder =
        await createOrder({
          orderNumber,

          items: items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),

          deliveryAddress: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
            pincode: pincode.trim(),
          },

          paymentMethod,

          subtotal,
          deliveryFee,
          total,
        });

      // Save order locally
      addOrder({
        id: createdOrder._id,

        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          emoji: item.emoji,
          quantity: item.quantity,
        })),

        deliveryAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
        },

        paymentMethod,

        subtotal,
        deliveryFee,
        total,

        status: 'confirmed',

        createdAt:
          createdOrder.createdAt ||
          new Date().toISOString(),
      });

      // Clear cart after successful order
      clearCart();

      // Open success screen
      router.replace({
        pathname: '/order-success',
        params: {
          orderId: createdOrder._id,
        },
      });
    } catch (error) {
      console.error(
        'Place order error:',
        error
      );

      Alert.alert(
        'Order failed',
        error instanceof Error
          ? error.message
          : 'Unable to place your order. Please try again.'
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // ==================================================
  // EMPTY CART
  // ==================================================

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="cart-outline"
              size={52}
              color={C.maroon}
            />
          </View>

          <Text style={styles.emptyTitle}>
            Your cart is empty
          </Text>

          <Text style={styles.emptyText}>
            Add some groceries to your cart
            before proceeding to checkout.
          </Text>

          <Pressable
            style={styles.shopButton}
            onPress={() =>
              router.replace('/')
            }
          >
            <Text
              style={styles.shopButtonText}
            >
              Continue Shopping
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ==================================================
  // CHECKOUT SCREEN
  // ==================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          disabled={placingOrder}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={C.text}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Checkout
        </Text>

        <View
          style={styles.headerPlaceholder}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* ==========================================
            DELIVERY ADDRESS
        ========================================== */}

        <View style={styles.section}>
          <View
            style={styles.sectionTitleRow}
          >
            <View style={styles.sectionIcon}>
              <Ionicons
                name="location-outline"
                size={20}
                color={C.maroon}
              />
            </View>

            <View>
              <Text
                style={styles.sectionTitle}
              >
                Delivery Address
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Where should we deliver your order?
              </Text>
            </View>
          </View>

          {/* SAVED ADDRESS BUTTON */}

          {savedAddresses.length > 0 && (
            <Pressable
              style={styles.savedAddressButton}
              onPress={() =>
                setShowSavedAddresses(
                  !showSavedAddresses
                )
              }
              disabled={placingOrder}
            >
              <View
                style={
                  styles.savedAddressLeft
                }
              >
                <Ionicons
                  name="bookmark-outline"
                  size={20}
                  color={C.maroon}
                />

                <View
                  style={
                    styles.savedAddressText
                  }
                >
                  <Text
                    style={
                      styles.savedAddressTitle
                    }
                  >
                    Use Saved Address
                  </Text>

                  <Text
                    style={
                      styles.savedAddressSubtitle
                    }
                  >
                    {savedAddresses.length}{' '}
                    saved{' '}
                    {savedAddresses.length === 1
                      ? 'address'
                      : 'addresses'}
                  </Text>
                </View>
              </View>

              <Ionicons
                name={
                  showSavedAddresses
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={20}
                color={C.muted}
              />
            </Pressable>
          )}

          {/* SAVED ADDRESS LIST */}

          {showSavedAddresses &&
            savedAddresses.length > 0 && (
              <View
                style={
                  styles.savedAddressList
                }
              >
                {savedAddresses.map(
                  (item) => (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.savedAddressCard,
                        item.isDefault &&
                          styles.savedAddressCardDefault,
                      ]}
                      onPress={() =>
                        selectSavedAddress(
                          item
                        )
                      }
                      disabled={placingOrder}
                    >
                      <View
                        style={
                          styles.savedAddressCardTop
                        }
                      >
                        <View
                          style={
                            styles.savedAddressLabelRow
                          }
                        >
                          <Text
                            style={
                              styles.savedAddressLabel
                            }
                          >
                            {item.label}
                          </Text>

                          {item.isDefault && (
                            <View
                              style={
                                styles.defaultBadge
                              }
                            >
                              <Text
                                style={
                                  styles.defaultBadgeText
                                }
                              >
                                DEFAULT
                              </Text>
                            </View>
                          )}
                        </View>

                        <Ionicons
                          name="checkmark-circle-outline"
                          size={22}
                          color={C.green}
                        />
                      </View>

                      <Text
                        style={
                          styles.savedAddressName
                        }
                      >
                        {item.fullName}
                      </Text>

                      <Text
                        style={
                          styles.savedAddressPhone
                        }
                      >
                        {item.phone}
                      </Text>

                      <Text
                        style={
                          styles.savedAddressDetails
                        }
                      >
                        {item.address}
                      </Text>

                      <Text
                        style={
                          styles.savedAddressDetails
                        }
                      >
                        {item.city} -{' '}
                        {item.pincode}
                      </Text>
                    </Pressable>
                  )
                )}
              </View>
            )}

          {/* FULL NAME */}

          <Text style={styles.label}>
            Full Name
          </Text>

          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#A69A91"
            style={styles.input}
            editable={!placingOrder}
          />

          {/* PHONE */}

          <Text style={styles.label}>
            Phone Number
          </Text>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="10-digit mobile number"
            placeholderTextColor="#A69A91"
            keyboardType="phone-pad"
            maxLength={10}
            style={styles.input}
            editable={!placingOrder}
          />

          {/* ADDRESS */}

          <Text style={styles.label}>
            Complete Address
          </Text>

          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="House no., street, area"
            placeholderTextColor="#A69A91"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={[
              styles.input,
              styles.addressInput,
            ]}
            editable={!placingOrder}
          />

          {/* CITY + PINCODE */}

          <View style={styles.row}>
            <View
              style={
                styles.halfInputContainer
              }
            >
              <Text style={styles.label}>
                City
              </Text>

              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor="#A69A91"
                style={styles.input}
                editable={!placingOrder}
              />
            </View>

            <View
              style={
                styles.halfInputContainer
              }
            >
              <Text style={styles.label}>
                Pincode
              </Text>

              <TextInput
                value={pincode}
                onChangeText={setPincode}
                placeholder="6-digit pincode"
                placeholderTextColor="#A69A91"
                keyboardType="number-pad"
                maxLength={6}
                style={styles.input}
                editable={!placingOrder}
              />
            </View>
          </View>
        </View>

        {/* ==========================================
            PAYMENT
        ========================================== */}

        <View style={styles.section}>
          <View
            style={styles.sectionTitleRow}
          >
            <View style={styles.sectionIcon}>
              <Ionicons
                name="card-outline"
                size={20}
                color={C.maroon}
              />
            </View>

            <View>
              <Text
                style={styles.sectionTitle}
              >
                Payment Method
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Select your preferred payment method
              </Text>
            </View>
          </View>

          <Pressable
            style={[
              styles.paymentOption,
              paymentMethod === 'cod' &&
                styles.paymentOptionSelected,
            ]}
            onPress={() =>
              setPaymentMethod('cod')
            }
            disabled={placingOrder}
          >
            <View style={styles.paymentLeft}>
              <View
                style={styles.paymentIcon}
              >
                <Ionicons
                  name="cash-outline"
                  size={23}
                  color={C.green}
                />
              </View>

              <View>
                <Text
                  style={styles.paymentTitle}
                >
                  Cash on Delivery
                </Text>

                <Text
                  style={
                    styles.paymentSubtitle
                  }
                >
                  Pay when your order arrives
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.radio,
                paymentMethod === 'cod' &&
                  styles.radioSelected,
              ]}
            >
              {paymentMethod === 'cod' && (
                <View
                  style={styles.radioDot}
                />
              )}
            </View>
          </Pressable>

          <View style={styles.comingSoon}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={C.gold}
            />

            <Text
              style={styles.comingSoonText}
            >
              Online payments will be available
              soon.
            </Text>
          </View>
        </View>

        {/* ==========================================
            ORDER ITEMS
        ========================================== */}

        <View style={styles.section}>
          <View
            style={styles.sectionTitleRow}
          >
            <View style={styles.sectionIcon}>
              <Ionicons
                name="bag-handle-outline"
                size={20}
                color={C.maroon}
              />
            </View>

            <View>
              <Text
                style={styles.sectionTitle}
              >
                Your Order
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                {items.length}{' '}
                {items.length === 1
                  ? 'item'
                  : 'items'}
              </Text>
            </View>
          </View>

          {items.map((item) => (
            <View
              key={item.id}
              style={styles.orderItem}
            >
              <View
                style={styles.productEmoji}
              >
                <Text
                  style={styles.emoji}
                >
                  {item.emoji}
                </Text>
              </View>

              <View
                style={styles.productInfo}
              >
                <Text
                  style={styles.productName}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>

                <Text
                  style={styles.quantity}
                >
                  Qty: {item.quantity}
                </Text>
              </View>

              <Text
                style={styles.productPrice}
              >
                ₹
                {(
                  item.price *
                  item.quantity
                ).toFixed(0)}
              </Text>
            </View>
          ))}
        </View>

        {/* ==========================================
            PRICE SUMMARY
        ========================================== */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Price Details
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Subtotal
            </Text>

            <Text style={styles.priceValue}>
              ₹{subtotal.toFixed(0)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Delivery Fee
            </Text>

            <Text
              style={[
                styles.priceValue,
                deliveryFee === 0 &&
                  styles.freeText,
              ]}
            >
              {deliveryFee === 0
                ? 'FREE'
                : `₹${deliveryFee}`}
            </Text>
          </View>

          {deliveryFee > 0 && (
            <Text style={styles.deliveryHint}>
              Add ₹{499 - subtotal} more to get
              free delivery.
            </Text>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total Amount
            </Text>

            <Text style={styles.totalValue}>
              ₹{total.toFixed(0)}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* ==========================================
          BOTTOM PLACE ORDER BAR
      ========================================== */}

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>
            Total
          </Text>

          <Text style={styles.bottomTotal}>
            ₹{total.toFixed(0)}
          </Text>
        </View>

        <Pressable
          style={[
            styles.placeOrderButton,
            placingOrder &&
              styles.placeOrderButtonDisabled,
          ]}
          onPress={placeOrder}
          disabled={placingOrder}
        >
          <Text style={styles.placeOrderText}>
            {placingOrder
              ? 'Placing Order...'
              : 'Place Order'}
          </Text>

          {!placingOrder && (
            <Ionicons
              name="arrow-forward"
              size={20}
              color={C.white}
            />
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.cream,
  },

  header: {
    height: 64,
    backgroundColor: C.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
  },

  headerPlaceholder: {
    width: 42,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  section: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F7EDEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 3,
  },

  // ==================================================
  // SAVED ADDRESS STYLES
  // ==================================================

  savedAddressButton: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: C.gold,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF9F0',
    marginBottom: 8,
  },

  savedAddressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  savedAddressText: {
    marginLeft: 10,
  },

  savedAddressTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
  },

  savedAddressSubtitle: {
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },

  savedAddressList: {
    marginBottom: 8,
  },

  savedAddressCard: {
    backgroundColor: '#FFFCF9',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 13,
    marginTop: 8,
  },

  savedAddressCardDefault: {
    borderColor: C.green,
    backgroundColor: C.lightGreen,
  },

  savedAddressCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  savedAddressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  savedAddressLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: C.darkMaroon,
  },

  defaultBadge: {
    backgroundColor: '#E1EFE4',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginLeft: 8,
  },

  defaultBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: C.green,
  },

  savedAddressName: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    marginBottom: 2,
  },

  savedAddressPhone: {
    fontSize: 12,
    color: C.muted,
    marginBottom: 7,
  },

  savedAddressDetails: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 18,
  },

  // ==================================================
  // FORM
  // ==================================================

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    marginBottom: 7,
    marginTop: 10,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    backgroundColor: '#FFFCF9',
    color: C.text,
    fontSize: 14,
  },

  addressInput: {
    minHeight: 82,
    paddingTop: 13,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
  },

  halfInputContainer: {
    flex: 1,
  },

  // ==================================================
  // PAYMENT
  // ==================================================

  paymentOption: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  paymentOptionSelected: {
    borderColor: C.green,
    backgroundColor: C.lightGreen,
  },

  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  paymentIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  paymentTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
  },

  paymentSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 3,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#B9ADA3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioSelected: {
    borderColor: C.green,
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: C.green,
  },

  comingSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FBF7EE',
  },

  comingSoonText: {
    flex: 1,
    fontSize: 12,
    color: C.muted,
    marginLeft: 7,
  },

  // ==================================================
  // ORDER ITEMS
  // ==================================================

  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1EAE3',
  },

  productEmoji: {
    width: 50,
    height: 50,
    borderRadius: 13,
    backgroundColor: '#FAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emoji: {
    fontSize: 27,
  },

  productInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },

  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    lineHeight: 18,
  },

  quantity: {
    fontSize: 12,
    color: C.muted,
    marginTop: 4,
  },

  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
  },

  // ==================================================
  // PRICE
  // ==================================================

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 13,
  },

  priceLabel: {
    fontSize: 14,
    color: C.muted,
  },

  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },

  freeText: {
    color: C.green,
  },

  deliveryHint: {
    fontSize: 11,
    color: C.green,
    marginTop: 7,
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 16,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
  },

  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: C.maroon,
  },

  bottomSpace: {
    height: 80,
  },

  // ==================================================
  // BOTTOM BAR
  // ==================================================

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bottomLabel: {
    fontSize: 11,
    color: C.muted,
  },

  bottomTotal: {
    fontSize: 20,
    fontWeight: '900',
    color: C.text,
    marginTop: 2,
  },

  placeOrderButton: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: C.maroon,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  placeOrderButtonDisabled: {
    opacity: 0.65,
  },

  placeOrderText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '800',
  },

  // ==================================================
  // EMPTY CART
  // ==================================================

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },

  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    color: C.muted,
    lineHeight: 21,
    marginTop: 9,
  },

  shopButton: {
    marginTop: 24,
    backgroundColor: C.maroon,
    borderRadius: 13,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },

  shopButtonText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
  },
});