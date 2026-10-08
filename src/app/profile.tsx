import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
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

const PROFILE_STORAGE_KEY = '@malnora_profile';

type ProfileData = {
  name: string;
  phone: string;
  email: string;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Malnora Customer',
    phone: '',
    email: '',
  });

  // Reload profile whenever this screen becomes active
  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const savedProfile =
            await AsyncStorage.getItem(
              PROFILE_STORAGE_KEY
            );

          if (savedProfile) {
            const parsedProfile: ProfileData =
              JSON.parse(savedProfile);

            setProfile({
              name:
                parsedProfile.name ||
                'Malnora Customer',
              phone:
                parsedProfile.phone || '',
              email:
                parsedProfile.email || '',
            });
          }
        } catch (error) {
          console.error(
            'Failed to load profile:',
            error
          );
        }
      };

      loadProfile();
    }, [])
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handlePaymentMethods = () => {
    router.push('/payment-methods');
  };

  const handleHelpSupport = () => {
    console.log('Help and support pressed');
  };

  const handleAboutMalnora = () => {
    console.log('About Malnora pressed');
  };

  const handleLogout = () => {
    console.log('Logout pressed');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          My Profile
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              👤
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {profile.name}
            </Text>

            <Text style={styles.phone}>
              {profile.phone
                ? profile.phone
                : 'Your account'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.editText}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>
          Account
        </Text>

        <View style={styles.menuCard}>
          {/* My Orders */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              router.push('/my-orders');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.iconBox}>
              <Text style={styles.icon}>
                📦
              </Text>
            </View>

            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>
                My Orders
              </Text>

              <Text style={styles.menuSubtitle}>
                View and track your orders
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Saved Addresses */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              router.push('/address');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.iconBox}>
              <Text style={styles.icon}>
                📍
              </Text>
            </View>

            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>
                Saved Addresses
              </Text>

              <Text style={styles.menuSubtitle}>
                Manage your delivery addresses
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Payment Methods */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePaymentMethods}
            activeOpacity={0.7}
          >
            <View style={styles.iconBox}>
              <Text style={styles.icon}>
                💳
              </Text>
            </View>

            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>
                Payment Methods
              </Text>

              <Text style={styles.menuSubtitle}>
                Manage your payment options
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>
          Support
        </Text>

        <View style={styles.menuCard}>
          {/* Help & Support */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleHelpSupport}
            activeOpacity={0.7}
          >
            <View style={styles.iconBox}>
              <Text style={styles.icon}>
                💬
              </Text>
            </View>

            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>
                Help & Support
              </Text>

              <Text style={styles.menuSubtitle}>
                Get help with your orders
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* About */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleAboutMalnora}
            activeOpacity={0.7}
          >
            <View style={styles.iconBox}>
              <Text style={styles.icon}>
                ℹ️
              </Text>
            </View>

            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>
                About Malnora
              </Text>

              <Text style={styles.menuSubtitle}>
                Learn more about Malnora
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>
            Log Out
          </Text>
        </TouchableOpacity>

        <Text style={styles.version}>
          Malnora • Grocery made simple
        </Text>
      </ScrollView>
    </View>
  );
}

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
    fontSize: 21,
    fontWeight: '800',
    color: DARK_MAROON,
  },

  headerSpacer: {
    width: 42,
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  profileCard: {
    backgroundColor: MAROON,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFF7E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 30,
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '800',
  },

  phone: {
    color: '#F2DCC8',
    fontSize: 13,
    marginTop: 5,
  },

  editButton: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  editText: {
    color: WHITE,
    fontWeight: '700',
    fontSize: 13,
  },

  sectionTitle: {
    color: TEXT,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },

  menuCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    marginBottom: 26,
    overflow: 'hidden',
  },

  menuItem: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F8F1E7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    fontSize: 22,
  },

  menuTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  menuTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '800',
  },

  menuSubtitle: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
  },

  arrow: {
    color: MUTED,
    fontSize: 28,
    marginLeft: 8,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEE8DE',
    marginLeft: 74,
  },

  logoutButton: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8B9B9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9F8',
  },

  logoutText: {
    color: MAROON,
    fontSize: 16,
    fontWeight: '800',
  },

  version: {
    textAlign: 'center',
    color: MUTED,
    fontSize: 12,
    marginTop: 24,
  },
});