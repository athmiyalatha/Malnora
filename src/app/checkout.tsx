import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';

const ADDRESS_STORAGE_KEY = '@malnora_addresses';

const MAROON = '#741B2B';
const DARK_MAROON = '#4B101D';
const CREAM = '#FBF6ED';
const MUTED = '#827568';
const BORDER = '#E9DFD2';
const GREEN = '#426B48';

type SavedAddress = {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  recipient: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  city: string;
  pinCode: string;
  isDefault: boolean;
};

const formatAddress = (address: SavedAddress) =>
  [
    address.house,
    address.street,
    address.area,
    address.city,
    address.pinCode,
  ]
    .filter(Boolean)
    .join(', ');

export default function CheckoutScreen() {
  const { items, clearCart } = useCart();
  const { addOrder } = useOrders();

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'COD' | 'ONLINE'
  >('COD');

  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    try {
      const stored = await AsyncStorage.getItem(ADDRESS_STORAGE_KEY);

      if (!stored) {
        return;
      }

      const parsed: SavedAddress[] = JSON.parse(stored);
      setSavedAddresses(parsed);

      if (parsed.length > 0) {
        const defaultAddress =
          parsed.find((item) => item.isDefault) ?? parsed[0];

        selectAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Could not load saved addresses:', error);
      Alert.alert(
        'Address error',
        'We could not load your saved addresses.'
      );
    } finally {
      setLoadingAddresses(false);
    }
  };

  const selectAddress = (saved: SavedAddress) => {
    setSelectedAddressId(saved.id);
    setName(saved.recipient);
    setPhone(saved.phone);
    setAddress(formatAddress(saved));
    setCity(saved.city);
  };

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [items]
  );

  const deliveryFee = subtotal === 0 || subtotal >= 499 ? 0 : 30;
  const total = subtotal + deliveryFee;

  const openSavedAddresses = () => {
    router.push('/saved-addresses');
  };

  const placeOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Your cart is empty', 'Add products before checkout.');
      router.replace('/cart');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter the recipient name.');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      Alert.alert(
        'Invalid phone number',
        'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    if (!address.trim() || !city.trim()) {
      Alert.alert(
        'Missing address',
        'Please select a saved address or enter your delivery address.'
      );
      return;
    }

    if (paymentMethod === 'ONLINE') {
      Alert.alert(
        'Coming soon',
        'Online payments are not connected yet. Please choose Cash on Delivery.'
      );
      return;
    }

    setPlacingOrder(true);

    const orderId = `MAL${Date.now().toString().slice(-8)}`;
    const createdAt = new Date().toISOString();

    try {
      await addOrder({
        orderId,
        name: name.trim(),
        phone: phone.trim(),
        address: `${address.trim()}, ${city.trim()}`,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          emoji: item.emoji,
          quantity: item.quantity,
        })),
        subtotal,
        deliveryFee,
        total,
        payment: 'Cash on Delivery',
        status: 'Order Placed',
        createdAt,
      });

      await clearCart();

      router.replace({
        pathname: '/order-success',
        params: {
          orderId,
          name: name.trim(),
          total: String(total),
          address: `${address.trim()}, ${city.trim()}`,
          payment: 'Cash on Delivery',
        },
      });
    } catch (error) {
      console.error('Could not place order:', error);
      Alert.alert(
        'Order failed',
        'We could not place your order. Please try again.'
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: 'Checkout',
          headerShown: true,
          headerStyle: { backgroundColor: CREAM },
          headerTintColor: DARK_MAROON,
          headerTitleStyle: { fontWeight: '800' },
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heading}>
          <Text style={styles.title}>Checkout</Text>
          <Text style={styles.subtitle}>
            One more step to fresh groceries
          </Text>
        </View>

        {/* DELIVERY ADDRESS */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionIcon}>📍</Text>
              <Text style={styles.sectionTitle}>Delivery address</Text>
            </View>

            <Pressable onPress={openSavedAddresses}>
              <Text style={styles.link}>Manage</Text>
            </Pressable>
          </View>

          {loadingAddresses ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={MAROON} />
              <Text style={styles.loadingText}>
                Loading saved addresses...
              </Text>
            </View>
          ) : savedAddresses.length > 0 ? (
            <>
              <Text style={styles.helperText}>
                Choose where you want your groceries delivered.
              </Text>

              {savedAddresses.map((saved) => {
                const selected = selectedAddressId === saved.id;

                return (
                  <Pressable
                    key={saved.id}
                    onPress={() => selectAddress(saved)}
                    style={[
                      styles.addressOption,
                      selected && styles.addressOptionSelected,
                    ]}
                  >
                    <View style={styles.addressOptionTop}>
                      <View style={styles.addressLabelRow}>
                        <Text style={styles.addressEmoji}>
                          {saved.label === 'Home'
                            ? '🏠'
                            : saved.label === 'Work'
                              ? '🏢'
                              : '📍'}
                        </Text>

                        <Text style={styles.addressLabel}>
                          {saved.label}
                        </Text>

                        {saved.isDefault && (
                          <Text style={styles.defaultTag}>DEFAULT</Text>
                        )}
                      </View>

                      <View
                        style={[
                          styles.radio,
                          selected && styles.radioSelected,
                        ]}
                      >
                        {selected && <View style={styles.radioInner} />}
                      </View>
                    </View>

                    <Text style={styles.addressRecipient}>
                      {saved.recipient}
                    </Text>

                    <Text style={styles.addressText}>
                      {formatAddress(saved)}
                    </Text>

                    <Text style={styles.addressPhone}>
                      Phone: {saved.phone}
                    </Text>
                  </Pressable>
                );
              })}

              <Pressable
                style={styles.addAddressButton}
                onPress={openSavedAddresses}
              >
                <Text style={styles.addAddressText}>
                  + Add or edit saved addresses
                </Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.noAddressBox}>
              <Text style={styles.noAddressTitle}>
                No saved addresses yet
              </Text>

              <Text style={styles.helperText}>
                Add an address to select it for this delivery.
              </Text>

              <Pressable
                style={styles.primaryButton}
                onPress={openSavedAddresses}
              >
                <Text style={styles.primaryButtonText}>
                  Add a delivery address
                </Text>
              </Pressable>
            </View>
          )}

          {/* Allow checkout to continue with manually entered details too. */}
          <Text style={styles.manualTitle}>
            Delivery details
          </Text>

          <Text style={styles.inputLabel}>Recipient name</Text>
          <TextInput
            value={name}
            onChangeText={(value) => {
              setName(value);
              setSelectedAddressId(null);
            }}
            placeholder="Enter recipient name"
            placeholderTextColor="#A69A8D"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Phone number</Text>
          <TextInput
            value={phone}
            onChangeText={(value) => {
              setPhone(value.replace(/[^0-9]/g, '').slice(0, 10));
              setSelectedAddressId(null);
            }}
            placeholder="10-digit mobile number"
            placeholderTextColor="#A69A8D"
            keyboardType="phone-pad"
            maxLength={10}
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Full address</Text>
          <TextInput
            value={address}
            onChangeText={(value) => {
              setAddress(value);
              setSelectedAddressId(null);
            }}
            placeholder="House, street, area and PIN code"
            placeholderTextColor="#A69A8D"
            multiline
            style={[styles.input, styles.multilineInput]}
          />

          <Text style={styles.inputLabel}>City / Town</Text>
          <TextInput
            value={city}
            onChangeText={(value) => {
              setCity(value);
              setSelectedAddressId(null);
            }}
            placeholder="Enter city or town"
            placeholderTextColor="#A69A8D"
            style={styles.input}
          />
        </View>

        {/* ORDER SUMMARY */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>🛒</Text>
            <Text style={styles.sectionTitle}>Order summary</Text>
          </View>

          {items.length === 0 ? (
            <Text style={styles.helperText}>
              Your cart is empty.
            </Text>
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.productRow}>
                <View style={styles.productEmojiBox}>
                  <Text style={styles.productEmoji}>
                    {item.emoji}
                  </Text>
                </View>

                <View style={styles.productDetails}>
                  <Text style={styles.productName}>
                    {item.name}
                  </Text>
                  <Text style={styles.productQuantity}>
                    Qty: {item.quantity}
                  </Text>
                </View>

                <Text style={styles.productPrice}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))
          )}

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>
              ₹{subtotal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery fee</Text>
            <Text
              style={[
                styles.priceValue,
                deliveryFee === 0 && styles.freeDelivery,
              ]}
            >
              {deliveryFee === 0
                ? 'FREE'
                : `₹${deliveryFee.toFixed(2)}`}
            </Text>
          </View>

          {deliveryFee > 0 && (
            <Text style={styles.deliveryHint}>
              Add ₹{(499 - subtotal).toFixed(2)} more for free delivery.
            </Text>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ₹{total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* PAYMENT */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>💳</Text>
            <Text style={styles.sectionTitle}>Payment method</Text>
          </View>

          <Pressable
            onPress={() => setPaymentMethod('COD')}
            style={[
              styles.paymentOption,
              paymentMethod === 'COD' && styles.paymentOptionSelected,
            ]}
          >
            <Text style={styles.paymentEmoji}>💵</Text>

            <View style={styles.paymentDetails}>
              <Text style={styles.paymentTitle}>
                Cash on Delivery
              </Text>
              <Text style={styles.paymentSubtitle}>
                Pay when your order arrives
              </Text>
            </View>

            <View
              style={[
                styles.radio,
                paymentMethod === 'COD' && styles.radioSelected,
              ]}
            >
              {paymentMethod === 'COD' && (
                <View style={styles.radioInner} />
              )}
            </View>
          </Pressable>

          <View style={[styles.paymentOption, styles.disabledPayment]}>
            <Text style={styles.paymentEmoji}>📱</Text>

            <View style={styles.paymentDetails}>
              <Text style={styles.paymentTitle}>
                Online payment
              </Text>
              <Text style={styles.paymentSubtitle}>
                Coming soon
              </Text>
            </View>

            <Text style={styles.comingSoon}>Soon</Text>
          </View>
        </View>

        <View style={styles.secureNote}>
          <Text style={styles.secureIcon}>🔒</Text>
          <Text style={styles.secureText}>
            Your order details are saved on this device.
          </Text>
        </View>

        <Pressable
          style={[
            styles.placeOrderButton,
            (placingOrder || items.length === 0) &&
              styles.buttonDisabled,
          ]}
          onPress={placeOrder}
          disabled={placingOrder || items.length === 0}
        >
          {placingOrder ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.placeOrderText}>
              Place order · ₹{total.toFixed(2)}
            </Text>
          )}
        </Pressable>

        <Text style={styles.bottomNote}>
          By placing your order, you confirm your delivery details.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CREAM,
  },

  content: {
    padding: 18,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },

  heading: {
    marginBottom: 20,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: DARK_MAROON,
  },

  subtitle: {
    color: MUTED,
    fontSize: 14,
    marginTop: 5,
  },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionIcon: {
    fontSize: 19,
    marginRight: 9,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: DARK_MAROON,
  },

  link: {
    color: MAROON,
    fontWeight: '800',
    fontSize: 13,
  },

  helperText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  loadingText: {
    color: MUTED,
    marginLeft: 10,
    fontSize: 13,
  },

  addressOption: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 13,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#FFFEFC',
  },

  addressOptionSelected: {
    borderColor: MAROON,
    backgroundColor: '#FCF4F5',
  },

  addressOptionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },

  addressEmoji: {
    fontSize: 17,
    marginRight: 7,
  },

  addressLabel: {
    color: DARK_MAROON,
    fontWeight: '800',
    fontSize: 14,
  },

  defaultTag: {
    marginLeft: 8,
    color: GREEN,
    fontSize: 9,
    fontWeight: '800',
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C9BBAE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  radioSelected: {
    borderColor: MAROON,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: MAROON,
  },

  addressRecipient: {
    color: '#30251F',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 5,
  },

  addressText: {
    color: '#66594E',
    fontSize: 13,
    lineHeight: 20,
  },

  addressPhone: {
    color: MUTED,
    fontSize: 12,
    marginTop: 7,
  },

  addAddressButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },

  addAddressText: {
    color: MAROON,
    fontWeight: '800',
    fontSize: 13,
  },

  noAddressBox: {
    backgroundColor: '#FFFEFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },

  noAddressTitle: {
    color: DARK_MAROON,
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 8,
  },

  primaryButton: {
    backgroundColor: MAROON,
    borderRadius: 11,
    alignItems: 'center',
    paddingVertical: 13,
    marginTop: 4,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  manualTitle: {
    color: DARK_MAROON,
    fontWeight: '800',
    fontSize: 15,
    marginTop: 16,
    marginBottom: 14,
  },

  inputLabel: {
    color: '#51443A',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#30251F',
    backgroundColor: '#FFFEFC',
  },

  multilineInput: {
    minHeight: 78,
    textAlignVertical: 'top',
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  productEmojiBox: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: '#F8F1E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  productEmoji: {
    fontSize: 23,
  },

  productDetails: {
    flex: 1,
  },

  productName: {
    color: '#30251F',
    fontWeight: '700',
    fontSize: 13,
  },

  productQuantity: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
  },

  productPrice: {
    color: DARK_MAROON,
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 8,
  },

  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 12,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 7,
  },

  priceLabel: {
    color: MUTED,
    fontSize: 14,
  },

  priceValue: {
    color: '#30251F',
    fontSize: 14,
    fontWeight: '600',
  },

  freeDelivery: {
    color: GREEN,
    fontWeight: '800',
  },

  deliveryHint: {
    color: GREEN,
    fontSize: 12,
    marginTop: 3,
    marginBottom: 7,
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginTop: 12,
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  totalLabel: {
    color: DARK_MAROON,
    fontSize: 16,
    fontWeight: '800',
  },

  totalValue: {
    color: MAROON,
    fontSize: 19,
    fontWeight: '900',
  },

  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 13,
    marginTop: 10,
  },

  paymentOptionSelected: {
    borderColor: MAROON,
    backgroundColor: '#FCF4F5',
  },

  disabledPayment: {
    opacity: 0.65,
  },

  paymentEmoji: {
    fontSize: 23,
    marginRight: 12,
  },

  paymentDetails: {
    flex: 1,
  },

  paymentTitle: {
    color: DARK_MAROON,
    fontWeight: '800',
    fontSize: 14,
  },

  paymentSubtitle: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
  },

  comingSoon: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
  },

  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  secureIcon: {
    fontSize: 13,
    marginRight: 7,
  },

  secureText: {
    color: MUTED,
    fontSize: 12,
  },

  placeOrderButton: {
    backgroundColor: MAROON,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  bottomNote: {
    textAlign: 'center',
    color: MUTED,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 13,
  },
});