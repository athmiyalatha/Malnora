import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const STORAGE_KEY = '@malnora_addresses';

const MAROON = '#741B2B';
const DARK_MAROON = '#4B101D';
const GOLD = '#B18A4A';
const CREAM = '#FBF6ED';
const MUTED = '#827568';
const BORDER = '#E9DFD2';

type AddressLabel = 'Home' | 'Work' | 'Other';

type Address = {
  id: string;
  label: AddressLabel;
  recipient: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  city: string;
  pinCode: string;
  isDefault: boolean;
};

type AddressForm = Omit<Address, 'id' | 'isDefault'>;

const EMPTY_FORM: AddressForm = {
  label: 'Home',
  recipient: '',
  phone: '',
  house: '',
  street: '',
  area: '',
  city: '',
  pinCode: '',
};

export default function SavedAddressesScreen() {
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed: Address[] = JSON.parse(stored);
        setAddresses(parsed);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      Alert.alert('Error', 'Could not load your saved addresses.');
    } finally {
      setLoading(false);
    }
  };

  const persistAddresses = async (next: Address[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setAddresses(next);
  };

  const updateForm = (
    field: keyof AddressForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const startAdding = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const startEditing = (address: Address) => {
    setForm({
      label: address.label,
      recipient: address.recipient,
      phone: address.phone,
      house: address.house,
      street: address.street,
      area: address.area,
      city: address.city,
      pinCode: address.pinCode,
    });

    setEditingId(address.id);
    setShowForm(true);
  };

  const saveAddress = async () => {
    const requiredFields = [
      form.recipient,
      form.phone,
      form.house,
      form.street,
      form.area,
      form.city,
      form.pinCode,
    ];

    if (requiredFields.some((value) => !value.trim())) {
      Alert.alert('Missing details', 'Please fill in all address fields.');
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      Alert.alert(
        'Invalid phone number',
        'Please enter a valid 10-digit phone number.'
      );
      return;
    }

    if (!/^[0-9]{6}$/.test(form.pinCode.trim())) {
      Alert.alert(
        'Invalid PIN code',
        'Please enter a valid 6-digit PIN code.'
      );
      return;
    }

    setSaving(true);

    try {
      let next: Address[];

      if (editingId) {
        next = addresses.map((address) =>
          address.id === editingId
            ? {
                ...address,
                ...form,
              }
            : address
        );
      } else {
        const newAddress: Address = {
          id: `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`,
          ...form,
          isDefault: addresses.length === 0,
        };

        next = [...addresses, newAddress];
      }

      await persistAddresses(next);
      resetForm();

      Alert.alert('Success', 'Your address has been saved.');
    } catch (error) {
      console.error('Failed to save address:', error);
      Alert.alert('Error', 'Could not save your address.');
    } finally {
      setSaving(false);
    }
  };

  const setDefaultAddress = async (id: string) => {
    const next = addresses.map((address) => ({
      ...address,
      isDefault: address.id === id,
    }));

    try {
      await persistAddresses(next);
    } catch (error) {
      console.error('Failed to set default address:', error);
      Alert.alert('Error', 'Could not update your default address.');
    }
  };

  // Shared delete function for web and mobile.
  const removeAddress = async (id: string) => {
    const remaining = addresses.filter(
      (address) => address.id !== id
    );

    // If the default address was deleted, select another one.
    if (
      remaining.length > 0 &&
      !remaining.some((address) => address.isDefault)
    ) {
      remaining[0] = {
        ...remaining[0],
        isDefault: true,
      };
    }

    try {
      await persistAddresses(remaining);

      if (editingId === id) {
        resetForm();
      }

      Alert.alert('Deleted', 'Your address has been deleted.');
    } catch (error) {
      console.error('Failed to delete address:', error);
      Alert.alert('Error', 'Could not delete the address.');
    }
  };

  const deleteAddress = (id: string) => {
    if (Platform.OS === 'web') {
      // Use the browser confirmation dialog on web.
      const confirmed = window.confirm(
        'Are you sure you want to delete this address?'
      );

      if (confirmed) {
        void removeAddress(id);
      }

      return;
    }

    // Use the native confirmation dialog on mobile.
    Alert.alert(
      'Delete address',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void removeAddress(id);
          },
        },
      ]
    );
  };

  const renderInput = (
    label: string,
    field: keyof AddressForm,
    placeholder: string,
    options?: {
      keyboardType?: 'default' | 'phone-pad' | 'number-pad';
      maxLength?: number;
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>

      <TextInput
        value={form[field]}
        onChangeText={(value) => updateForm(field, value)}
        placeholder={placeholder}
        placeholderTextColor="#A69A8D"
        style={styles.input}
        keyboardType={options?.keyboardType ?? 'default'}
        maxLength={options?.maxLength}
        autoCapitalize="words"
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: 'Saved Addresses',
          headerShown: true,
          headerStyle: {
            backgroundColor: CREAM,
          },
          headerTintColor: DARK_MAROON,
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headingRow}>
          <View style={styles.headingText}>
            <Text style={styles.title}>Your Addresses</Text>
            <Text style={styles.subtitle}>
              Manage your delivery locations
            </Text>
          </View>

          {!showForm && (
            <Pressable
              style={styles.addButton}
              onPress={startAdding}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          )}
        </View>

        {loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Loading your addresses...
            </Text>
          </View>
        ) : (
          <>
            {addresses.length === 0 && !showForm && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>📍</Text>
                <Text style={styles.emptyTitle}>
                  No saved addresses
                </Text>
                <Text style={styles.emptyText}>
                  Add an address to make checkout faster.
                </Text>

                <Pressable
                  style={styles.primaryButton}
                  onPress={startAdding}
                >
                  <Text style={styles.primaryButtonText}>
                    Add Your First Address
                  </Text>
                </Pressable>
              </View>
            )}

            {addresses.map((address) => (
              <View key={address.id} style={styles.addressCard}>
                <View style={styles.addressTopRow}>
                  <View style={styles.labelRow}>
                    <Text style={styles.locationEmoji}>
                      {address.label === 'Home'
                        ? '🏠'
                        : address.label === 'Work'
                          ? '🏢'
                          : '📍'}
                    </Text>

                    <Text style={styles.addressLabel}>
                      {address.label}
                    </Text>
                  </View>

                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>
                        DEFAULT
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.recipient}>
                  {address.recipient}
                </Text>

                <Text style={styles.addressText}>
                  {address.house}, {address.street}
                </Text>

                <Text style={styles.addressText}>
                  {address.area}, {address.city} - {address.pinCode}
                </Text>

                <Text style={styles.phoneText}>
                  Phone: {address.phone}
                </Text>

                <View style={styles.cardDivider} />

                <View style={styles.actionRow}>
                  {!address.isDefault ? (
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => setDefaultAddress(address.id)}
                    >
                      <Text style={styles.actionText}>
                        Set as default
                      </Text>
                    </Pressable>
                  ) : (
                    <Text style={styles.selectedText}>
                      ✓ Default address
                    </Text>
                  )}

                  <View style={styles.rightActions}>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => startEditing(address)}
                    >
                      <Text style={styles.actionText}>Edit</Text>
                    </Pressable>

                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => deleteAddress(address.id)}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}

            {showForm && (
              <View style={styles.formCard}>
                <View style={styles.formHeadingRow}>
                  <Text style={styles.formTitle}>
                    {editingId ? 'Edit Address' : 'Add New Address'}
                  </Text>

                  <Pressable onPress={resetForm}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                </View>

                <Text style={styles.inputLabel}>Address type</Text>

                <View style={styles.labelOptions}>
                  {(['Home', 'Work', 'Other'] as AddressLabel[]).map(
                    (label) => {
                      const selected = form.label === label;

                      return (
                        <Pressable
                          key={label}
                          style={[
                            styles.labelOption,
                            selected && styles.labelOptionSelected,
                          ]}
                          onPress={() => updateForm('label', label)}
                        >
                          <Text
                            style={[
                              styles.labelOptionText,
                              selected &&
                                styles.labelOptionTextSelected,
                            ]}
                          >
                            {label}
                          </Text>
                        </Pressable>
                      );
                    }
                  )}
                </View>

                {renderInput(
                  'Recipient name',
                  'recipient',
                  'Enter full name'
                )}

                {renderInput(
                  'Phone number',
                  'phone',
                  '10-digit mobile number',
                  {
                    keyboardType: 'phone-pad',
                    maxLength: 10,
                  }
                )}

                {renderInput(
                  'House / Flat / Building',
                  'house',
                  'House or flat number'
                )}

                {renderInput(
                  'Street',
                  'street',
                  'Street name'
                )}

                {renderInput(
                  'Area / Locality',
                  'area',
                  'Area or locality'
                )}

                {renderInput(
                  'City / Town',
                  'city',
                  'City or town'
                )}

                {renderInput(
                  'PIN code',
                  'pinCode',
                  '6-digit PIN code',
                  {
                    keyboardType: 'number-pad',
                    maxLength: 6,
                  }
                )}

                <Pressable
                  style={[
                    styles.primaryButton,
                    saving && styles.disabledButton,
                  ]}
                  onPress={saveAddress}
                  disabled={saving}
                >
                  <Text style={styles.primaryButtonText}>
                    {saving
                      ? 'Saving...'
                      : editingId
                        ? 'Update Address'
                        : 'Save Address'}
                  </Text>
                </Pressable>
              </View>
            )}

            {addresses.length > 0 && !showForm && (
              <Pressable
                style={styles.bottomAddButton}
                onPress={startAdding}
              >
                <Text style={styles.bottomAddButtonText}>
                  + Add Another Address
                </Text>
              </Pressable>
            )}
          </>
        )}

        <Text style={styles.footerText}>
          Your saved addresses are stored on this device.
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

  scrollContent: {
    padding: 18,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },

  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  headingText: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: DARK_MAROON,
  },

  subtitle: {
    fontSize: 14,
    color: MUTED,
    marginTop: 5,
  },

  addButton: {
    backgroundColor: MAROON,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    marginLeft: 12,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },

  emptyEmoji: {
    fontSize: 38,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: DARK_MAROON,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 21,
  },

  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },

  addressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationEmoji: {
    fontSize: 18,
    marginRight: 8,
  },

  addressLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: DARK_MAROON,
  },

  defaultBadge: {
    backgroundColor: '#F4E9D4',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  defaultBadgeText: {
    color: MAROON,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  recipient: {
    fontSize: 16,
    fontWeight: '700',
    color: '#30251F',
    marginBottom: 7,
  },

  addressText: {
    color: '#66594E',
    fontSize: 14,
    lineHeight: 22,
  },

  phoneText: {
    color: MUTED,
    fontSize: 13,
    marginTop: 9,
  },

  cardDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 15,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },

  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  actionButton: {
    paddingVertical: 7,
  },

  actionText: {
    color: MAROON,
    fontSize: 13,
    fontWeight: '700',
  },

  selectedText: {
    color: '#426B48',
    fontSize: 12,
    fontWeight: '700',
  },

  deleteButton: {
    paddingVertical: 7,
  },

  deleteText: {
    color: '#B42318',
    fontSize: 13,
    fontWeight: '700',
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginTop: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },

  formHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: DARK_MAROON,
  },

  cancelText: {
    color: MUTED,
    fontSize: 14,
    fontWeight: '600',
  },

  inputGroup: {
    marginTop: 15,
  },

  inputLabel: {
    color: '#51443A',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 13,
    fontSize: 15,
    color: '#30251F',
    backgroundColor: '#FFFEFC',
  },

  labelOptions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 2,
  },

  labelOption: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },

  labelOptionSelected: {
    borderColor: MAROON,
    backgroundColor: '#F8EDEF',
  },

  labelOptionText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '600',
  },

  labelOptionTextSelected: {
    color: MAROON,
    fontWeight: '800',
  },

  primaryButton: {
    backgroundColor: MAROON,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 22,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  disabledButton: {
    opacity: 0.6,
  },

  bottomAddButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 13,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },

  bottomAddButtonText: {
    color: MAROON,
    fontSize: 14,
    fontWeight: '800',
  },

  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: MUTED,
    marginTop: 24,
  },
});