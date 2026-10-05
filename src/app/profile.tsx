
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const COLORS = {
  maroon: '#741B2B',
  darkMaroon: '#4B101D',
  gold: '#B18A4A',
  cream: '#FBF6ED',
  white: '#FFFFFF',
  muted: '#827568',
  border: '#EAE0D3',
};

const PROFILE_STORAGE_KEY = '@malnora_profile';

type ProfileDetails = {
  name: string;
  phone: string;
  email: string;
};

const EMPTY_PROFILE: ProfileDetails = {
  name: '',
  phone: '',
  email: '',
};

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [profileLoaded, setProfileLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load previously saved profile details.
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem(
          PROFILE_STORAGE_KEY
        );

        if (savedProfile) {
          const profile: Partial<ProfileDetails> =
            JSON.parse(savedProfile);

          if (isMounted) {
            setName(
              typeof profile.name === 'string'
                ? profile.name
                : ''
            );
            setPhone(
              typeof profile.phone === 'string'
                ? profile.phone
                : ''
            );
            setEmail(
              typeof profile.email === 'string'
                ? profile.email
                : ''
            );
          }
        }
      } catch (error) {
        Alert.alert(
          'Profile',
          'Could not load your saved details.'
        );
      } finally {
        if (isMounted) {
          setProfileLoaded(true);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save profile details to local storage.
  const saveProfile = async () => {
    if (!profileLoaded || saving) {
      return;
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      Alert.alert(
        'Missing name',
        'Please enter your full name.'
      );
      return;
    }

    if (cleanPhone && !/^\d{10}$/.test(cleanPhone)) {
      Alert.alert(
        'Invalid phone number',
        'Please enter a valid 10-digit phone number.'
      );
      return;
    }

    if (
      cleanEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      Alert.alert(
        'Invalid email',
        'Please enter a valid email address.'
      );
      return;
    }

    const profile: ProfileDetails = {
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
    };

    try {
      setSaving(true);

      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profile)
      );

      setName(profile.name);
      setPhone(profile.phone);
      setEmail(profile.email);

      Alert.alert(
        'Profile saved',
        'Your details have been saved successfully!'
      );
    } catch (error) {
      Alert.alert(
        'Unable to save',
        'Your details could not be saved. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const comingSoon = (section: string) => {
    Alert.alert(
      section,
      `${section} will be available in a future update.`
    );
  };

  const menuItem = (
    emoji: string,
    title: string,
    subtitle: string,
    action: () => void
  ) => (
    <TouchableOpacity
      style={styles.menuRow}
      onPress={action}
      activeOpacity={0.75}
    >
      <View style={styles.menuIcon}>
        <Text style={styles.menuEmoji}>{emoji}</Text>
      </View>

      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>malnora</Text>
            <Text style={styles.tagline}>
              YOUR ACCOUNT, YOUR WAY
            </Text>
          </View>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push('/cart')}
            activeOpacity={0.8}
          >
            <Text style={styles.cartIcon}>🛒</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>

          <Text style={styles.heroTitle}>
            {name.trim()
              ? `Hello, ${name.trim()}!`
              : 'Hello, welcome!'}
          </Text>

          <Text style={styles.heroSubtitle}>
            Manage your Malnora account
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Personal details
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#9A9085"
            autoCapitalize="words"
            editable={profileLoaded && !saving}
            returnKeyType="next"
          />

          <Text style={styles.label}>Phone number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={(value) =>
              setPhone(value.replace(/\D/g, '').slice(0, 10))
            }
            placeholder="Enter your phone number"
            placeholderTextColor="#9A9085"
            keyboardType="phone-pad"
            maxLength={10}
            editable={profileLoaded && !saving}
            returnKeyType="next"
          />

          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email (optional)"
            placeholderTextColor="#9A9085"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={profileLoaded && !saving}
            returnKeyType="done"
          />

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!profileLoaded || saving) &&
                styles.saveButtonDisabled,
            ]}
            onPress={saveProfile}
            activeOpacity={0.8}
            disabled={!profileLoaded || saving}
          >
            <Text style={styles.saveButtonText}>
              {!profileLoaded
                ? 'Loading profile...'
                : saving
                  ? 'Saving...'
                  : 'Save details'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          Your account
        </Text>

        <View style={styles.menuCard}>
          {menuItem(
            '📦',
            'My Orders',
            'View your past orders',
            () => router.push('/my-orders')
          )}

          <View style={styles.separator} />

          {menuItem(
            '🛒',
            'My Cart',
            'Review items before checkout',
            () => router.push('/cart')
          )}

          <View style={styles.separator} />
{menuItem(
  '📍',
  'Saved addresses',
  'Manage delivery locations',
  () => router.push('/saved-addresses')
)}

          <View style={styles.separator} />

          {menuItem(
            '💬',
            'Help & support',
            'Get help with your orders',
            () => comingSoon('Help & support')
          )}
        </View>

        <Text style={styles.footer}>
          🌿 Fresh choices, thoughtfully delivered.
        </Text>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.navIcon}>⌂</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/categories')}
        >
          <Text style={styles.navIcon}>▦</Text>
          <Text style={styles.navLabel}>Categories</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/my-orders')}
        >
          <Text style={styles.navIcon}>📦</Text>
          <Text style={styles.navLabel}>My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/profile')}
        >
          <Text style={[styles.navIcon, styles.active]}>
            ♙
          </Text>
          <Text style={[styles.navLabel, styles.active]}>
            Profile
          </Text>
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
    paddingHorizontal: 18,
    paddingTop: 55,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  brand: {
    color: COLORS.maroon,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 1.8,
    marginTop: 3,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cartIcon: {
    fontSize: 22,
  },
  hero: {
    backgroundColor: COLORS.maroon,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    marginBottom: 27,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F2E4D7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#F2E4D7',
    fontSize: 12,
    marginTop: 5,
  },
  sectionTitle: {
    color: COLORS.darkMaroon,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 13,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 27,
  },
  label: {
    color: COLORS.darkMaroon,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
    marginTop: 8,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    color: COLORS.darkMaroon,
    backgroundColor: '#FFFEFC',
  },
  saveButton: {
    backgroundColor: COLORS.maroon,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 18,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#F4EDE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuEmoji: {
    fontSize: 21,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    color: COLORS.darkMaroon,
    fontSize: 14,
    fontWeight: '800',
  },
  menuSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },
  arrow: {
    color: COLORS.maroon,
    fontSize: 25,
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  footer: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 28,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 68,
    paddingTop: 9,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  navIcon: {
    color: COLORS.maroon,
    fontSize: 21,
    fontWeight: '700',
  },
  navLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  active: {
    color: COLORS.maroon,
    fontWeight: '800',
  },
});