import { router } from 'expo-router';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// --------------------------------------------------
// MALNORA PREMIUM COLOUR PALETTE
// --------------------------------------------------

const COLORS = {
  background: '#F7F5EE',
  surface: '#FFFFFF',
  surfaceLight: '#E5EEE4',

  green: '#174A3A',
  greenDark: '#103629',
  greenLight: '#E5EEE4',
  greenSoft: '#EEF3EB',

  gold: '#E5AC55',
  goldDark: '#B77B24',

  text: '#26372F',
  muted: '#78847B',
  border: '#E5E1D7',
};

// --------------------------------------------------
// DEPARTMENTS
// --------------------------------------------------

const DEPARTMENTS = [
  {
    id: 'groceries',
    name: 'Groceries',
    emoji: '🛒',
    description:
      'Fresh fruits, vegetables, dairy and daily essentials',
    color: '#E5EEE4',
    available: true,
  },
  {
    id: 'coupons',
    name: 'Coupons',
    emoji: '🎟️',
    description: 'Offers and savings for your next order',
    color: '#FFF0D8',
    available: false,
  },
  {
    id: 'appliances',
    name: 'Home Appliances',
    emoji: '🏠',
    description: 'Useful appliances for every home',
    color: '#E8EEF7',
    available: false,
  },
  {
    id: 'beauty',
    name: 'Beauty',
    emoji: '💄',
    description: 'Beauty, skincare and personal care',
    color: '#F6E8EF',
    available: false,
  },
  {
    id: 'stationery',
    name: 'Stationery',
    emoji: '📚',
    description: 'School, office and art supplies',
    color: '#E9EFE2',
    available: false,
  },
];

// --------------------------------------------------
// GROCERY CATEGORIES
// --------------------------------------------------

const GROCERY_CATEGORIES = [
  { name: 'Fruits', emoji: '🍎' },
  { name: 'Vegetables', emoji: '🥦' },
  { name: 'Dairy & Eggs', emoji: '🥛' },
  { name: 'Bakery', emoji: '🍞' },
  { name: 'Pantry Essentials', emoji: '🫘' },
  { name: 'Snacks', emoji: '🍿' },
];

// --------------------------------------------------
// CATEGORIES SCREEN
// --------------------------------------------------

export default function CategoriesScreen() {
  const openDepartment = (
    department: (typeof DEPARTMENTS)[number]
  ) => {
    if (department.available) {
      router.push('/');
    } else {
      Alert.alert(
        department.name,
        'This department is coming soon to Malnora!'
      );
    }
  };

  const openGroceryCategory = (categoryName: string) => {
  router.push({
    pathname: '/',
    params: {
      category: categoryName,
    },
  });
};

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoEmoji}>🌿</Text>
            </View>

            <View>
              <Text style={styles.brand}>Malnora</Text>
              <Text style={styles.tagline}>
                GOODNESS IN EVERY BASKET
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.cartButton}
            activeOpacity={0.75}
            onPress={() => router.push('/cart')}
          >
            <Text style={styles.cartIcon}>🛒</Text>
          </TouchableOpacity>
        </View>

        {/* PAGE INTRODUCTION */}

        <View style={styles.introSection}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>
              MADE FOR EVERYDAY LIVING
            </Text>
          </View>

          <Text style={styles.pageTitle}>
            Explore
            {'\n'}
            <Text style={styles.pageTitleAccent}>
              all categories.
            </Text>
          </Text>

          <Text style={styles.pageSubtitle}>
            Everything you need, thoughtfully brought
            together in one place.
          </Text>
        </View>

        {/* DEPARTMENTS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Shop by department
            </Text>

            <Text style={styles.sectionSubtitle}>
              A little something for every day
            </Text>
          </View>
        </View>

        <View style={styles.departmentGrid}>
          {DEPARTMENTS.map((department) => (
            <TouchableOpacity
              key={department.id}
              style={styles.departmentCard}
              activeOpacity={0.82}
              onPress={() => openDepartment(department)}
            >
              <View
                style={[
                  styles.departmentIconBox,
                  { backgroundColor: department.color },
                ]}
              >
                <Text style={styles.departmentEmoji}>
                  {department.emoji}
                </Text>
              </View>

              <Text style={styles.departmentName}>
                {department.name}
              </Text>

              <Text style={styles.departmentDescription}>
                {department.description}
              </Text>

              <View style={styles.departmentFooter}>
                <Text
                  style={[
                    styles.exploreText,
                    !department.available &&
                      styles.comingSoonText,
                  ]}
                >
                  {department.available
                    ? 'Explore now'
                    : 'Coming soon'}
                </Text>

                <Text
                  style={[
                    styles.departmentArrow,
                    !department.available &&
                      styles.comingSoonText,
                  ]}
                >
                  →
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* GROCERY CATEGORIES */}

        <View style={styles.grocerySection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Grocery categories
              </Text>

              <Text style={styles.sectionSubtitle}>
                Fresh picks for your everyday needs
              </Text>
            </View>

            <View style={styles.categoryCount}>
              <Text style={styles.categoryCountText}>
                {GROCERY_CATEGORIES.length}
              </Text>
            </View>
          </View>

          <View style={styles.groceryList}>
            {GROCERY_CATEGORIES.map((category, index) => (
              <TouchableOpacity
                key={category.name}
                style={styles.groceryRow}
                activeOpacity={0.78}
                onPress={() =>
                  openGroceryCategory(category.name)
                }
              >
                <View style={styles.groceryIconBox}>
                  <Text style={styles.groceryEmoji}>
                    {category.emoji}
                  </Text>
                </View>

                <View style={styles.groceryTextContainer}>
                  <Text style={styles.groceryName}>
                    {category.name}
                  </Text>

                  <Text style={styles.grocerySubtitle}>
                    {getCategorySubtitle(category.name)}
                  </Text>
                </View>

                <View style={styles.rowArrowContainer}>
                  <Text style={styles.rowArrow}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FOOTER BANNER */}

        <View style={styles.footer}>
          <View style={styles.footerIconBox}>
            <Text style={styles.footerEmoji}>🌿</Text>
          </View>

          <View style={styles.footerTextContainer}>
            <Text style={styles.footerTitle}>
              Freshness in every basket
            </Text>

            <Text style={styles.footerText}>
              Thoughtful choices for your everyday life.
            </Text>
          </View>
        </View>

        {/* BOTTOM SPACING */}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* BOTTOM NAVIGATION */}

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.bottomNavItem}
          activeOpacity={0.7}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.bottomNavIcon}>⌂</Text>
          <Text style={styles.bottomNavLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          activeOpacity={0.7}
          onPress={() => router.replace('/categories')}
        >
          <Text
            style={[
              styles.bottomNavIcon,
              styles.activeText,
            ]}
          >
            ▦
          </Text>

          <Text
            style={[
              styles.bottomNavLabel,
              styles.activeText,
            ]}
          >
            Categories
          </Text>

          <View style={styles.activeIndicator} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          activeOpacity={0.7}
          onPress={() => router.push('/my-orders')}
        >
          <Text style={styles.bottomNavIcon}>📦</Text>
          <Text style={styles.bottomNavLabel}>
            My Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          activeOpacity={0.7}
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.bottomNavIcon}>🛍️</Text>
          <Text style={styles.bottomNavLabel}>Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          activeOpacity={0.7}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.bottomNavIcon}>♙</Text>
          <Text style={styles.bottomNavLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --------------------------------------------------
// CATEGORY SUBTITLES
// --------------------------------------------------

function getCategorySubtitle(name: string) {
  switch (name) {
    case 'Fruits':
      return 'Nature’s sweet and juicy picks';

    case 'Vegetables':
      return 'Fresh greens and garden goodness';

    case 'Dairy & Eggs':
      return 'Everyday dairy essentials';

    case 'Bakery':
      return 'Freshly baked favourites';

    case 'Pantry Essentials':
      return 'Stock up on kitchen staples';

    case 'Snacks':
      return 'Little treats for any time';

    default:
      return 'Explore everyday essentials';
  }
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 115,
  },

  // Header

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 34,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoEmoji: {
    fontSize: 25,
  },

  brand: {
    color: COLORS.green,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -1,
  },

  tagline: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 1.3,
    marginTop: 2,
  },

  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cartIcon: {
    fontSize: 22,
  },

  // Introduction

  introSection: {
    marginBottom: 30,
  },

  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },

  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.goldDark,
  },

  eyebrowText: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  pageTitle: {
    color: COLORS.green,
    fontSize: 35,
    fontWeight: '900',
    letterSpacing: -1.2,
    lineHeight: 41,
  },

  pageTitleAccent: {
    color: COLORS.goldDark,
  },

  pageSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 340,
  },

  // Section headings

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  sectionTitle: {
    color: COLORS.green,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },

  // Department cards

  departmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },

  departmentCard: {
    width: '48.3%',
    minHeight: 215,
    backgroundColor: COLORS.surface,
    borderRadius: 21,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  departmentIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  departmentEmoji: {
    fontSize: 29,
  },

  departmentName: {
    color: COLORS.green,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },

  departmentDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 7,
    flex: 1,
  },

  departmentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  exploreText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '800',
  },

  departmentArrow: {
    color: COLORS.goldDark,
    fontSize: 18,
    fontWeight: '800',
  },

  comingSoonText: {
    color: COLORS.muted,
  },

  // Grocery section

  grocerySection: {
    marginTop: 34,
  },

  categoryCount: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryCountText: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: '900',
  },

  groceryList: {
    gap: 11,
  },

  groceryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 12,
    minHeight: 76,
  },

  groceryIconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  groceryEmoji: {
    fontSize: 24,
  },

  groceryTextContainer: {
    flex: 1,
  },

  groceryName: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: '800',
  },

  grocerySubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
    lineHeight: 15,
  },

  rowArrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#FFF3DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  rowArrow: {
    color: COLORS.goldDark,
    fontSize: 19,
    fontWeight: '800',
  },

  // Footer banner

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.green,
    borderRadius: 20,
    padding: 17,
    marginTop: 30,
    gap: 13,
  },

  footerIconBox: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#28624E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerEmoji: {
    fontSize: 23,
  },

  footerTextContainer: {
    flex: 1,
  },

  footerTitle: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '800',
  },

  footerText: {
    color: '#DCE9DF',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  // Bottom navigation

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 76,
    paddingTop: 9,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  bottomNavItem: {
    flex: 1,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  bottomNavIcon: {
    color: COLORS.muted,
    fontSize: 22,
    fontWeight: '700',
  },

  bottomNavLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '600',
  },

  activeText: {
    color: COLORS.goldDark,
    fontWeight: '900',
  },

  activeIndicator: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
    marginTop: 1,
  },
});