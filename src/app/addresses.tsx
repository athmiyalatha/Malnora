import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const MAROON = '#741B2B';
const DARK_MAROON = '#4B101D';
const GOLD = '#B18A4A';
const CREAM = '#FBF6ED';
const WHITE = '#FFFFFF';
const TEXT = '#241A17';
const MUTED = '#827568';
const BORDER = '#E7DED1';
const GREEN = '#426B48';
const RED = '#A33A3A';

const STORAGE_KEY = '@malnora_saved_addresses';

type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  isDefault: boolean;
};

const EMPTY_FORM = {
  label: 'Home',
  fullName: '',
  phone: '',
  address: '',
  city: '',
  pincode: '',
};

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [label, setLabel] = useState(EMPTY_FORM.label);
  const [fullName, setFullName] = useState(EMPTY_FORM.fullName);
  const [phone, setPhone] = useState(EMPTY_FORM.phone);
  const [address, setAddress] = useState(EMPTY_FORM.address);
  const [city, setCity] = useState(EMPTY_FORM.city);
  const [pincode, setPincode] = useState(EMPTY_FORM.pincode);

  // ==================================================
  // LOAD ADDRESSES
  // ==================================================

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (!saved) {
          setAddresses([]);
          return;
        }

        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setAddresses(parsed);
        } else {
          setAddresses([]);
        }
      } catch (error) {
        console.error('Failed to load addresses:', error);

        Alert.alert(
          'Unable to Load Addresses',
          'We could not load your saved addresses.'
        );

        setAddresses([]);
      } finally {
        setIsLoaded(true);
      }
    };

    loadAddresses();
  }, []);

  // ==================================================
  // SAVE ADDRESSES
  // ==================================================

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const saveAddresses = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(addresses)
        );
      } catch (error) {
        console.error('Failed to save addresses:', error);
      }
    };

    saveAddresses();
  }, [addresses, isLoaded]);

  // ==================================================
  // RESET FORM
  // ==================================================

  const resetForm = () => {
    setLabel(EMPTY_FORM.label);
    setFullName(EMPTY_FORM.fullName);
    setPhone(EMPTY_FORM.phone);
    setAddress(EMPTY_FORM.address);
    setCity(EMPTY_FORM.city);
    setPincode(EMPTY_FORM.pincode);
  };

  // ==================================================
  // BACK
  // ==================================================

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  // ==================================================
  // OPEN MODAL
  // ==================================================

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // ==================================================
  // CLOSE MODAL
  // ==================================================

  const closeAddModal = () => {
    setShowModal(false);
    resetForm();
  };

  // ==================================================
  // ADD ADDRESS
  // ==================================================

  const handleAddAddress = () => {
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();
    const cleanCity = city.trim();
    const cleanPincode = pincode.trim();

    if (
      !cleanName ||
      !cleanPhone ||
      !cleanAddress ||
      !cleanCity ||
      !cleanPincode
    ) {
      Alert.alert(
        'Missing Details',
        'Please fill in all address fields.'
      );
      return;
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    if (!/^\d{6}$/.test(cleanPincode)) {
      Alert.alert(
        'Invalid Pincode',
        'Please enter a valid 6-digit pincode.'
      );
      return;
    }

    const newAddress: Address = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

      label: label.trim() || 'Home',

      fullName: cleanName,

      phone: cleanPhone,

      address: cleanAddress,

      city: cleanCity,

      pincode: cleanPincode,

      isDefault: addresses.length === 0,
    };

    setAddresses((currentAddresses) => [
      ...currentAddresses,
      newAddress,
    ]);

    closeAddModal();

    Alert.alert(
      'Address Saved',
      'Your delivery address has been saved successfully.'
    );
  };

  // ==================================================
  // SET DEFAULT
  // ==================================================

  const handleSetDefault = (id: string) => {
    setAddresses((currentAddresses) =>
      currentAddresses.map((item) => ({
        ...item,
        isDefault: item.id === id,
      }))
    );
  };

  // ==================================================
  // DELETE ADDRESS
  // ==================================================

  const handleDelete = (id: string) => {
    const addressToDelete = addresses.find(
      (item) => item.id === id
    );

    if (!addressToDelete) {
      return;
    }

    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete your ${addressToDelete.label.toLowerCase()} address?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAddresses((currentAddresses) => {
              const remaining = currentAddresses.filter(
                (item) => item.id !== id
              );

              // No addresses left.
              if (remaining.length === 0) {
                return [];
              }

              // If deleted address was default,
              // make the first remaining address default.
              if (addressToDelete.isDefault) {
                return remaining.map((item, index) => ({
                  ...item,
                  isDefault: index === 0,
                }));
              }

              // Safety check.
              const hasDefault = remaining.some(
                (item) => item.isDefault
              );

              if (!hasDefault) {
                return remaining.map((item, index) => ({
                  ...item,
                  isDefault: index === 0,
                }));
              }

              return remaining;
            });

            Alert.alert(
              'Address Deleted',
              'The address has been removed.'
            );
          },
        },
      ]
    );
  };

  // ==================================================
  // ADDRESS CARD
  // ==================================================

  const renderAddressCard = (item: Address) => {
    return (
      <View
        key={item.id}
        style={styles.addressCard}
      >
        <View style={styles.addressTopRow}>
          <View style={styles.addressLabelRow}>
            <Text style={styles.addressLabel}>
              {item.label}
            </Text>

            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>
                  DEFAULT
                </Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.addressName}>
          {item.fullName}
        </Text>

        <Text style={styles.addressPhone}>
          +91 {item.phone}
        </Text>

        <Text style={styles.addressText}>
          {item.address}
        </Text>

        <Text style={styles.addressText}>
          {item.city} - {item.pincode}
        </Text>

        <View style={styles.addressActions}>
          {!item.isDefault && (
            <TouchableOpacity
              style={styles.defaultButton}
              onPress={() =>
                handleSetDefault(item.id)
              }
              activeOpacity={0.8}
            >
              <Text style={styles.defaultButtonText}>
                Set Default
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() =>
              handleDelete(item.id)
            }
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ==================================================
  // SCREEN
  // ==================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Saved Addresses
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* CONTENT */}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* INTRO CARD */}

        <View style={styles.introCard}>
          <View style={styles.locationCircle}>
            <Text style={styles.locationIcon}>
              📍
            </Text>
          </View>

          <View style={styles.introText}>
            <Text style={styles.introTitle}>
              Your delivery addresses
            </Text>

            <Text style={styles.introSubtitle}>
              Save your addresses for faster
              checkout.
            </Text>
          </View>
        </View>

        {/* ADD BUTTON */}

        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
          activeOpacity={0.85}
        >
          <Text style={styles.addIcon}>+</Text>

          <Text style={styles.addButtonText}>
            Add New Address
          </Text>
        </TouchableOpacity>

        {/* ADDRESS LIST */}

        {addresses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🏠
            </Text>

            <Text style={styles.emptyTitle}>
              No saved addresses
            </Text>

            <Text style={styles.emptyText}>
              Add your home or another delivery
              address to make checkout faster.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={openAddModal}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>
                Add Address
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>
              Your Addresses
            </Text>

            {addresses.map(renderAddressCard)}
          </View>
        )}
      </ScrollView>

      {/* ADD ADDRESS MODAL */}

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={closeAddModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* MODAL HEADER */}

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add New Address
              </Text>

              <TouchableOpacity
                onPress={closeAddModal}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButton}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.modalContent
              }
            >
              {/* ADDRESS TYPE */}

              <Text style={styles.inputLabel}>
                Address Type
              </Text>

              <View style={styles.labelRow}>
                {['Home', 'Work', 'Other'].map(
                  (item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.labelButton,
                        label === item &&
                          styles.labelButtonActive,
                      ]}
                      onPress={() =>
                        setLabel(item)
                      }
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.labelButtonText,
                          label === item &&
                            styles.labelButtonTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              {/* FULL NAME */}

              <Text style={styles.inputLabel}>
                Full Name
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor="#A59A90"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                returnKeyType="next"
              />

              {/* PHONE */}

              <Text style={styles.inputLabel}>
                Phone Number
              </Text>

              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                placeholderTextColor="#A59A90"
                value={phone}
                onChangeText={(value) =>
                  setPhone(
                    value.replace(
                      /[^0-9]/g,
                      ''
                    )
                  )
                }
                keyboardType="phone-pad"
                maxLength={10}
                returnKeyType="next"
              />

              {/* ADDRESS */}

              <Text style={styles.inputLabel}>
                House / Street Address
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                ]}
                placeholder="House number, street, area"
                placeholderTextColor="#A59A90"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* CITY */}

              <Text style={styles.inputLabel}>
                City
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter city"
                placeholderTextColor="#A59A90"
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
                returnKeyType="next"
              />

              {/* PINCODE */}

              <Text style={styles.inputLabel}>
                Pincode
              </Text>

              <TextInput
                style={styles.input}
                placeholder="6-digit pincode"
                placeholderTextColor="#A59A90"
                value={pincode}
                onChangeText={(value) =>
                  setPincode(
                    value.replace(
                      /[^0-9]/g,
                      ''
                    )
                  )
                }
                keyboardType="number-pad"
                maxLength={6}
                returnKeyType="done"
              />

              {/* SAVE */}

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddAddress}
                activeOpacity={0.85}
              >
                <Text style={styles.saveButtonText}>
                  Save Address
                </Text>
              </TouchableOpacity>

              {/* CANCEL */}

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeAddModal}
                activeOpacity={0.7}
              >
                <Text
                  style={styles.cancelButtonText}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },

  header: {
    height: 70,
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE7DB',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F5EEE5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    fontSize: 34,
    lineHeight: 36,
    color: DARK_MAROON,
    marginTop: -3,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: DARK_MAROON,
  },

  headerSpacer: {
    width: 42,
  },

  content: {
    padding: 18,
    paddingBottom: 50,
  },

  introCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  locationCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F8F1E7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  locationIcon: {
    fontSize: 25,
  },

  introText: {
    flex: 1,
    marginLeft: 13,
  },

  introTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '800',
  },

  introSubtitle: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  addButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: MAROON,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  addIcon: {
    color: WHITE,
    fontSize: 25,
    fontWeight: '400',
    marginRight: 8,
    marginTop: -2,
  },

  addButtonText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '800',
  },

  emptyCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  emptyTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '800',
  },

  emptyText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 7,
    maxWidth: 290,
  },

  emptyButton: {
    marginTop: 20,
    backgroundColor: '#F8F1E7',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },

  emptyButtonText: {
    color: MAROON,
    fontSize: 14,
    fontWeight: '800',
  },

  sectionTitle: {
    color: TEXT,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 11,
  },

  addressCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },

  addressTopRow: {
    marginBottom: 10,
  },

  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  addressLabel: {
    color: DARK_MAROON,
    fontSize: 16,
    fontWeight: '800',
  },

  defaultBadge: {
    backgroundColor: '#EAF3ED',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 9,
  },

  defaultBadgeText: {
    color: GREEN,
    fontSize: 9,
    fontWeight: '900',
  },

  addressName: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },

  addressPhone: {
    color: MUTED,
    fontSize: 12,
    marginBottom: 8,
  },

  addressText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
  },

  addressActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },

  defaultButton: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  defaultButtonText: {
    color: MAROON,
    fontSize: 12,
    fontWeight: '800',
  },

  deleteButton: {
    borderWidth: 1,
    borderColor: '#D8B9B9',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  deleteButtonText: {
    color: RED,
    fontSize: 12,
    fontWeight: '800',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: CREAM,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '92%',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  modalTitle: {
    flex: 1,
    color: DARK_MAROON,
    fontSize: 21,
    fontWeight: '800',
  },

  closeButton: {
    color: MUTED,
    fontSize: 32,
    lineHeight: 32,
    paddingLeft: 10,
  },

  modalContent: {
    paddingBottom: 20,
  },

  inputLabel: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 12,
  },

  labelRow: {
    flexDirection: 'row',
    gap: 9,
  },

  labelButton: {
    flex: 1,
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  labelButtonActive: {
    backgroundColor: MAROON,
    borderColor: MAROON,
  },

  labelButtonText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '700',
  },

  labelButtonTextActive: {
    color: WHITE,
  },

  input: {
    height: 48,
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    color: TEXT,
    fontSize: 14,
  },

  multilineInput: {
    height: 82,
    paddingTop: 13,
  },

  saveButton: {
    height: 54,
    backgroundColor: MAROON,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },

  saveButtonText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '800',
  },

  cancelButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 5,
  },

  cancelButtonText: {
    color: MUTED,
    fontSize: 14,
    fontWeight: '700',
  },
});