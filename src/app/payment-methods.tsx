import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const STORAGE_KEY = '@malnora_payment_methods';

const COLORS = {
  background: '#F7F5EE',
  surface: '#FFFFFF',
  green: '#174A3A',
  greenDark: '#103629',
  greenSoft: '#EAF3ED',
  gold: '#E5AC55',
  goldDark: '#B77B24',
  text: '#26372F',
  muted: '#78847B',
  border: '#E5E1D7',
  red: '#B94A48',
};

type PaymentType = 'cod' | 'upi' | 'card';

type PaymentMethod = {
  id: string;
  type: PaymentType;
  title: string;
  subtitle: string;
  upiId?: string;
  cardLast4?: string;
  cardBrand?: string;
  isDefault: boolean;
};

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'default-cod',
    type: 'cod',
    title: 'Cash on Delivery',
    subtitle: 'Pay when your order arrives',
    isDefault: true,
  },
  {
    id: 'default-upi',
    type: 'upi',
    title: 'UPI',
    subtitle: 'Pay securely using UPI',
    upiId: '',
    isDefault: false,
  },
  {
    id: 'default-card',
    type: 'card',
    title: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard and more',
    cardBrand: 'Card',
    cardLast4: '',
    isDefault: false,
  },
];

export default function PaymentMethodsScreen() {
  const router = useRouter();

  const [methods, setMethods] = useState<PaymentMethod[]>(
    DEFAULT_PAYMENT_METHODS
  );

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [selectedType, setSelectedType] =
    useState<PaymentType>('upi');

  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: PaymentMethod[] = JSON.parse(saved);

        /*
         * Always make sure all 3 payment types exist.
         * This prevents an old AsyncStorage value containing
         * only COD from hiding UPI/Card.
         */
        const hasCOD = parsed.some(
          (method) => method.type === 'cod'
        );

        const hasUPI = parsed.some(
          (method) => method.type === 'upi'
        );

        const hasCard = parsed.some(
          (method) => method.type === 'card'
        );

        let updated = [...parsed];

        if (!hasCOD) {
          updated.push(DEFAULT_PAYMENT_METHODS[0]);
        }

        if (!hasUPI) {
          updated.push(DEFAULT_PAYMENT_METHODS[1]);
        }

        if (!hasCard) {
          updated.push(DEFAULT_PAYMENT_METHODS[2]);
        }

        const hasDefault = updated.some(
          (method) => method.isDefault
        );

        if (!hasDefault) {
          updated = updated.map((method, index) => ({
            ...method,
            isDefault: index === 0,
          }));
        }

        setMethods(updated);
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updated)
        );
      } else {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(DEFAULT_PAYMENT_METHODS)
        );

        setMethods(DEFAULT_PAYMENT_METHODS);
      }
    } catch (error) {
      console.error(
        'Failed to load payment methods:',
        error
      );

      setMethods(DEFAULT_PAYMENT_METHODS);
    } finally {
      setLoading(false);
    }
  };

  const saveMethods = async (
    updatedMethods: PaymentMethod[]
  ) => {
    try {
      setMethods(updatedMethods);

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedMethods)
      );
    } catch (error) {
      console.error(
        'Failed to save payment methods:',
        error
      );
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  const setDefault = async (id: string) => {
    const updated = methods.map((method) => ({
      ...method,
      isDefault: method.id === id,
    }));

    await saveMethods(updated);
  };

  const deleteMethod = (id: string) => {
    const method = methods.find(
      (item) => item.id === id
    );

    if (!method) {
      return;
    }

    /*
     * Keep the 3 main payment types visible.
     * Instead of deleting the default built-in option,
     * we reset it.
     */
    if (
      id === 'default-cod' ||
      id === 'default-upi' ||
      id === 'default-card'
    ) {
      Alert.alert(
        'Cannot remove payment option',
        'Malnora keeps Cash on Delivery, UPI and Card available as payment options.'
      );

      return;
    }

    Alert.alert(
      'Remove Payment Method',
      `Remove ${method.title}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            let updated = methods.filter(
              (item) => item.id !== id
            );

            if (method.isDefault && updated.length > 0) {
              updated = updated.map(
                (item, index) => ({
                  ...item,
                  isDefault: index === 0,
                })
              );
            }

            await saveMethods(updated);
          },
        },
      ]
    );
  };

  const openAddModal = () => {
    setSelectedType('upi');
    setUpiId('');
    setCardNumber('');
    setCardName('');
    setExpiry('');
    setCvv('');
    setShowModal(true);
  };

  const formatCardNumber = (value: string) => {
    const digits = value
      .replace(/\D/g, '')
      .slice(0, 16);

    return digits
      .replace(/(.{4})/g, '$1 ')
      .trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value
      .replace(/\D/g, '')
      .slice(0, 4);

    if (digits.length <= 2) {
      return digits;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const getCardBrand = (
    number: string
  ): string => {
    const digits = number.replace(/\D/g, '');

    if (digits.startsWith('4')) {
      return 'Visa';
    }

    if (
      digits.startsWith('5') ||
      digits.startsWith('2')
    ) {
      return 'Mastercard';
    }

    if (
      digits.startsWith('6')
    ) {
      return 'Discover';
    }

    return 'Card';
  };

  const saveNewPaymentMethod = async () => {
    if (selectedType === 'upi') {
      const cleanUPI = upiId.trim();

      if (!cleanUPI) {
        Alert.alert(
          'UPI ID Required',
          'Please enter your UPI ID.'
        );
        return;
      }

      const upiRegex =
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;

      if (!upiRegex.test(cleanUPI)) {
        Alert.alert(
          'Invalid UPI ID',
          'Please enter a valid UPI ID, for example name@upi.'
        );
        return;
      }

      const newMethod: PaymentMethod = {
        id: `upi-${Date.now()}`,
        type: 'upi',
        title: 'UPI',
        subtitle: cleanUPI,
        upiId: cleanUPI,
        isDefault: methods.length === 0,
      };

      const updated = [
        ...methods,
        newMethod,
      ];

      if (methods.length === 0) {
        newMethod.isDefault = true;
      }

      await saveMethods(updated);

      setShowModal(false);

      Alert.alert(
        'UPI Added',
        'Your UPI payment method has been added.'
      );

      return;
    }

    if (selectedType === 'card') {
      const cleanNumber =
        cardNumber.replace(/\D/g, '');

      const cleanName = cardName.trim();

      const cleanExpiry =
        expiry.replace(/\s/g, '');

      const cleanCVV =
        cvv.replace(/\D/g, '');

      if (cleanNumber.length !== 16) {
        Alert.alert(
          'Invalid Card Number',
          'Please enter a valid 16-digit card number.'
        );
        return;
      }

      if (!cleanName) {
        Alert.alert(
          'Cardholder Name Required',
          'Please enter the name on the card.'
        );
        return;
      }

      if (
        !/^\d{2}\/\d{2}$/.test(cleanExpiry)
      ) {
        Alert.alert(
          'Invalid Expiry',
          'Please enter expiry in MM/YY format.'
        );
        return;
      }

      const month = Number(
        cleanExpiry.split('/')[0]
      );

      if (month < 1 || month > 12) {
        Alert.alert(
          'Invalid Expiry',
          'Please enter a valid expiry month.'
        );
        return;
      }

      if (
        cleanCVV.length < 3 ||
        cleanCVV.length > 4
      ) {
        Alert.alert(
          'Invalid CVV',
          'Please enter a valid 3 or 4 digit CVV.'
        );
        return;
      }

      /*
       * IMPORTANT:
       * We do NOT save the complete card number
       * or CVV in AsyncStorage.
       */
      const last4 =
        cleanNumber.slice(-4);

      const brand =
        getCardBrand(cleanNumber);

      const newMethod: PaymentMethod = {
        id: `card-${Date.now()}`,
        type: 'card',
        title: `${brand} Card`,
        subtitle: `•••• ${last4}`,
        cardBrand: brand,
        cardLast4: last4,
        isDefault: false,
      };

      const updated = [
        ...methods,
        newMethod,
      ];

      await saveMethods(updated);

      setShowModal(false);

      Alert.alert(
        'Card Added',
        `${brand} card ending in ${last4} has been added.`
      );

      return;
    }

    if (selectedType === 'cod') {
      const codExists = methods.some(
        (method) => method.type === 'cod'
      );

      if (codExists) {
        Alert.alert(
          'Already Available',
          'Cash on Delivery is already available in your payment methods.'
        );

        return;
      }

      const newMethod: PaymentMethod = {
        id: `cod-${Date.now()}`,
        type: 'cod',
        title: 'Cash on Delivery',
        subtitle: 'Pay when your order arrives',
        isDefault: false,
      };

      await saveMethods([
        ...methods,
        newMethod,
      ]);

      setShowModal(false);

      Alert.alert(
        'Added',
        'Cash on Delivery is now available.'
      );
    }
  };

  const getIcon = (
    type: PaymentType
  ): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'upi':
        return 'phone-portrait-outline';

      case 'card':
        return 'card-outline';

      case 'cod':
        return 'cash-outline';

      default:
        return 'wallet-outline';
    }
  };

  const getTypeLabel = (
    type: PaymentType
  ) => {
    switch (type) {
      case 'upi':
        return 'UPI';

      case 'card':
        return 'Card';

      case 'cod':
        return 'Cash';

      default:
        return 'Payment';
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Payment Methods
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your payment options
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        {/* SECURITY CARD */}
        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color={COLORS.green}
            />
          </View>

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>
              Safe & Secure Payments
            </Text>

            <Text style={styles.securityText}>
              Your payment information stays
              protected while shopping with
              Malnora.
            </Text>
          </View>
        </View>

        {/* SECTION TITLE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Your Payment Methods
          </Text>

          <Text style={styles.sectionCount}>
            {methods.length}
          </Text>
        </View>

        {/* PAYMENT METHODS */}
        {loading ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>
              Loading payment methods...
            </Text>
          </View>
        ) : (
          <View style={styles.methodsContainer}>
            {methods.map((method) => (
              <View
                key={method.id}
                style={[
                  styles.methodCard,
                  method.isDefault &&
                    styles.defaultMethodCard,
                ]}
              >
                <View
                  style={[
                    styles.methodIcon,
                    method.type === 'upi' &&
                      styles.upiIcon,
                    method.type === 'card' &&
                      styles.cardIcon,
                    method.type === 'cod' &&
                      styles.codIcon,
                  ]}
                >
                  <Ionicons
                    name={getIcon(method.type)}
                    size={24}
                    color={COLORS.green}
                  />
                </View>

                <View style={styles.methodMain}>
                  <View style={styles.methodTitleRow}>
                    <Text
                      style={styles.methodTitle}
                      numberOfLines={1}
                    >
                      {method.title}
                    </Text>

                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
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

                  <Text
                    style={styles.methodSubtitle}
                    numberOfLines={1}
                  >
                    {method.subtitle}
                  </Text>

                  <View style={styles.methodActions}>
                    {!method.isDefault && (
                      <TouchableOpacity
                        onPress={() =>
                          setDefault(method.id)
                        }
                        activeOpacity={0.7}
                      >
                        <Text
                          style={
                            styles.defaultAction
                          }
                        >
                          Set as default
                        </Text>
                      </TouchableOpacity>
                    )}

                    {![
                      'default-cod',
                      'default-upi',
                      'default-card',
                    ].includes(method.id) && (
                      <TouchableOpacity
                        onPress={() =>
                          deleteMethod(method.id)
                        }
                        activeOpacity={0.7}
                      >
                        <Text
                          style={
                            styles.removeAction
                          }
                        >
                          Remove
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ADD PAYMENT METHOD */}
        <TouchableOpacity
          style={styles.addCard}
          onPress={openAddModal}
          activeOpacity={0.8}
        >
          <View style={styles.addIcon}>
            <Ionicons
              name="add"
              size={26}
              color={COLORS.green}
            />
          </View>

          <View style={styles.addContent}>
            <Text style={styles.addTitle}>
              Add Payment Method
            </Text>

            <Text style={styles.addSubtitle}>
              Add another UPI ID or card
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color={COLORS.muted}
          />
        </TouchableOpacity>

        {/* AVAILABLE PAYMENT TYPES */}
        <View style={styles.availableCard}>
          <Text style={styles.availableTitle}>
            Available Payment Options
          </Text>

          <View style={styles.availableRow}>
            <View style={styles.availableItem}>
              <View style={styles.availableIcon}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color={COLORS.green}
                />
              </View>

              <Text style={styles.availableText}>
                UPI
              </Text>
            </View>

            <View style={styles.availableItem}>
              <View style={styles.availableIcon}>
                <Ionicons
                  name="card-outline"
                  size={20}
                  color={COLORS.green}
                />
              </View>

              <Text style={styles.availableText}>
                Cards
              </Text>
            </View>

            <View style={styles.availableItem}>
              <View style={styles.availableIcon}>
                <Ionicons
                  name="cash-outline"
                  size={20}
                  color={COLORS.green}
                />
              </View>

              <Text style={styles.availableText}>
                Cash
              </Text>
            </View>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color={COLORS.goldDark}
          />

          <Text style={styles.infoText}>
            Malnora never stores your full card
            number or CVV. Only your card brand
            and last four digits are saved.
          </Text>
        </View>
      </ScrollView>

      {/* ADD PAYMENT MODAL */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* MODAL HEADER */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Add Payment Method
                </Text>

                <Text style={styles.modalSubtitle}>
                  Choose how you want to pay
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setShowModal(false)
                }
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color={COLORS.text}
                />
              </TouchableOpacity>
            </View>

            {/* TYPE SELECTOR */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  selectedType === 'upi' &&
                    styles.selectedTypeButton,
                ]}
                onPress={() =>
                  setSelectedType('upi')
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={21}
                  color={
                    selectedType === 'upi'
                      ? COLORS.green
                      : COLORS.muted
                  }
                />

                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === 'upi' &&
                      styles.selectedTypeText,
                  ]}
                >
                  UPI
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  selectedType === 'card' &&
                    styles.selectedTypeButton,
                ]}
                onPress={() =>
                  setSelectedType('card')
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="card-outline"
                  size={21}
                  color={
                    selectedType === 'card'
                      ? COLORS.green
                      : COLORS.muted
                  }
                />

                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === 'card' &&
                      styles.selectedTypeText,
                  ]}
                >
                  Card
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  selectedType === 'cod' &&
                    styles.selectedTypeButton,
                ]}
                onPress={() =>
                  setSelectedType('cod')
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="cash-outline"
                  size={21}
                  color={
                    selectedType === 'cod'
                      ? COLORS.green
                      : COLORS.muted
                  }
                />

                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === 'cod' &&
                      styles.selectedTypeText,
                  ]}
                >
                  Cash
                </Text>
              </TouchableOpacity>
            </View>

            {/* UPI FORM */}
            {selectedType === 'upi' && (
              <View style={styles.form}>
                <Text style={styles.inputLabel}>
                  UPI ID
                </Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="at-outline"
                    size={20}
                    color={COLORS.muted}
                  />

                  <TextInput
                    value={upiId}
                    onChangeText={setUpiId}
                    placeholder="example@upi"
                    placeholderTextColor={
                      COLORS.muted
                    }
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                  />
                </View>

                <Text style={styles.helperText}>
                  Example: name@upi, name@ybl,
                  name@oksbi
                </Text>
              </View>
            )}

            {/* CARD FORM */}
            {selectedType === 'card' && (
              <View style={styles.form}>
                <Text style={styles.inputLabel}>
                  Card Number
                </Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="card-outline"
                    size={20}
                    color={COLORS.muted}
                  />

                  <TextInput
                    value={cardNumber}
                    onChangeText={(value) =>
                      setCardNumber(
                        formatCardNumber(value)
                      )
                    }
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={
                      COLORS.muted
                    }
                    keyboardType="number-pad"
                    maxLength={19}
                    style={styles.input}
                  />
                </View>

                <Text style={styles.inputLabel}>
                  Cardholder Name
                </Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={COLORS.muted}
                  />

                  <TextInput
                    value={cardName}
                    onChangeText={setCardName}
                    placeholder="Name on card"
                    placeholderTextColor={
                      COLORS.muted
                    }
                    autoCapitalize="words"
                    style={styles.input}
                  />
                </View>

                <View style={styles.twoColumn}>
                  <View
                    style={styles.halfInputContainer}
                  >
                    <Text style={styles.inputLabel}>
                      Expiry
                    </Text>

                    <View
                      style={styles.inputWrapper}
                    >
                      <TextInput
                        value={expiry}
                        onChangeText={(value) =>
                          setExpiry(
                            formatExpiry(value)
                          )
                        }
                        placeholder="MM/YY"
                        placeholderTextColor={
                          COLORS.muted
                        }
                        keyboardType="number-pad"
                        maxLength={5}
                        style={styles.input}
                      />
                    </View>
                  </View>

                  <View
                    style={styles.halfInputContainer}
                  >
                    <Text style={styles.inputLabel}>
                      CVV
                    </Text>

                    <View
                      style={styles.inputWrapper}
                    >
                      <TextInput
                        value={cvv}
                        onChangeText={(value) =>
                          setCvv(
                            value
                              .replace(/\D/g, '')
                              .slice(0, 4)
                          )
                        }
                        placeholder="•••"
                        placeholderTextColor={
                          COLORS.muted
                        }
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={4}
                        style={styles.input}
                      />
                    </View>
                  </View>
                </View>

                <Text style={styles.helperText}>
                  Your full card number and CVV
                  are not stored.
                </Text>
              </View>
            )}

            {/* COD FORM */}
            {selectedType === 'cod' && (
              <View style={styles.codForm}>
                <View style={styles.codLargeIcon}>
                  <Ionicons
                    name="cash-outline"
                    size={38}
                    color={COLORS.green}
                  />
                </View>

                <Text style={styles.codTitle}>
                  Cash on Delivery
                </Text>

                <Text style={styles.codDescription}>
                  Pay in cash when your Malnora
                  order is delivered to your
                  doorstep.
                </Text>
              </View>
            )}

            {/* MODAL BUTTONS */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() =>
                  setShowModal(false)
                }
                activeOpacity={0.8}
              >
                <Text
                  style={styles.cancelButtonText}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveNewPaymentMethod}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={COLORS.surface}
                />

                <Text
                  style={styles.saveButtonText}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 16,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: COLORS.muted,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },

  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.greenSoft,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D8E9DD',
  },

  securityIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.green,
  },

  securityText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  sectionCount: {
    minWidth: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: COLORS.greenSoft,
    color: COLORS.green,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 12,
    fontWeight: '800',
    paddingTop: 5,
  },

  methodsContainer: {
    gap: 12,
  },

  methodCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  defaultMethodCard: {
    borderColor: COLORS.green,
    borderWidth: 1.4,
  },

  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: COLORS.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  upiIcon: {
    backgroundColor: '#EAF3ED',
  },

  cardIcon: {
    backgroundColor: '#F3EBDD',
  },

  codIcon: {
    backgroundColor: '#F7EFE0',
  },

  methodMain: {
    flex: 1,
  },

  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  methodTitle: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },

  defaultBadge: {
    marginLeft: 8,
    backgroundColor: COLORS.greenSoft,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  defaultBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.green,
    letterSpacing: 0.5,
  },

  methodSubtitle: {
    marginTop: 5,
    fontSize: 13,
    color: COLORS.muted,
  },

  methodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 10,
  },

  defaultAction: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.green,
  },

  removeAction: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.red,
  },

  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 15,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },

  addIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: COLORS.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  addContent: {
    flex: 1,
  },

  addTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },

  addSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.muted,
  },

  availableCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  availableTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
  },

  availableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  availableItem: {
    alignItems: 'center',
    flex: 1,
  },

  availableIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  availableText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FBF1DD',
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
  },

  infoText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
  },

  loadingBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
  },

  loadingText: {
    color: COLORS.muted,
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.muted,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },

  typeButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: COLORS.background,
  },

  selectedTypeButton: {
    backgroundColor: COLORS.greenSoft,
    borderColor: COLORS.green,
  },

  typeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
  },

  selectedTypeText: {
    color: COLORS.green,
    fontWeight: '900',
  },

  form: {
    marginBottom: 8,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 7,
    marginTop: 8,
  },

  inputWrapper: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  input: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 12,
  },

  helperText: {
    marginTop: 7,
    fontSize: 11,
    color: COLORS.muted,
    lineHeight: 16,
  },

  twoColumn: {
    flexDirection: 'row',
    gap: 12,
  },

  halfInputContainer: {
    flex: 1,
  },

  codForm: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },

  codLargeIcon: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: COLORS.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  codTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },

  codDescription: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.muted,
    marginTop: 7,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },

  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },

  saveButton: {
    flex: 1,
    height: 52,
    borderRadius: 15,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.surface,
  },
});