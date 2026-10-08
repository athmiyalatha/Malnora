import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
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
  green: '#426B48',
  lightGreen: '#EEF5EF',
  border: '#E8DED3',
  orange: '#C77B30',
  lightOrange: '#FFF3E5',
};

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.smallTitle}>MALNORA</Text>

            <Text style={styles.title}>
              Admin Dashboard
            </Text>
          </View>

          <View style={styles.adminIcon}>
            <Ionicons
              name="person"
              size={22}
              color={C.white}
            />
          </View>
        </View>

        {/* WELCOME CARD */}
        <View style={styles.welcomeCard}>
          <View>
            <Text style={styles.welcomeSmall}>
              Welcome back 👋
            </Text>

            <Text style={styles.welcomeTitle}>
              Manage your store
            </Text>

            <Text style={styles.welcomeText}>
              Monitor orders, products and sales
              from one place.
            </Text>
          </View>

          <Ionicons
            name="storefront"
            size={55}
            color={C.gold}
          />
        </View>

        {/* OVERVIEW */}
        <Text style={styles.sectionTitle}>
          Overview
        </Text>

        <View style={styles.statsGrid}>
          {/* ORDERS */}
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: C.lightGreen,
                },
              ]}
            >
              <Ionicons
                name="cart"
                size={24}
                color={C.green}
              />
            </View>

            <Text style={styles.statNumber}>
              0
            </Text>

            <Text style={styles.statLabel}>
              Total Orders
            </Text>
          </View>

          {/* SALES */}
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: C.lightOrange,
                },
              ]}
            >
              <Ionicons
                name="cash"
                size={24}
                color={C.orange}
              />
            </View>

            <Text style={styles.statNumber}>
              ₹0
            </Text>

            <Text style={styles.statLabel}>
              Total Sales
            </Text>
          </View>

          {/* PRODUCTS */}
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: '#F4ECF0',
                },
              ]}
            >
              <Ionicons
                name="cube"
                size={24}
                color={C.maroon}
              />
            </View>

            <Text style={styles.statNumber}>
              0
            </Text>

            <Text style={styles.statLabel}>
              Products
            </Text>
          </View>

          {/* PENDING */}
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: '#F8F0E3',
                },
              ]}
            >
              <Ionicons
                name="time"
                size={24}
                color={C.gold}
              />
            </View>

            <Text style={styles.statNumber}>
              0
            </Text>

            <Text style={styles.statLabel}>
              Pending Orders
            </Text>
          </View>
        </View>

        {/* MANAGEMENT */}
        <Text style={styles.sectionTitle}>
          Store Management
        </Text>

        {/* PRODUCTS */}
        <Pressable
          style={styles.menuCard}
          onPress={() =>
            router.push('/admin/products' as any)
          }
        >
          <View
            style={[
              styles.menuIcon,
              {
                backgroundColor: '#F4ECF0',
              },
            ]}
          >
            <Ionicons
              name="cube-outline"
              size={26}
              color={C.maroon}
            />
          </View>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>
              Products
            </Text>

            <Text style={styles.menuDescription}>
              Add, edit and manage grocery products
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={C.muted}
          />
        </Pressable>

        {/* ORDERS */}
        <Pressable
          style={styles.menuCard}
          onPress={() =>
            router.push('/admin/orders' as any)
          }
        >
          <View
            style={[
              styles.menuIcon,
              {
                backgroundColor: C.lightGreen,
              },
            ]}
          >
            <Ionicons
              name="receipt-outline"
              size={26}
              color={C.green}
            />
          </View>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>
              Orders
            </Text>

            <Text style={styles.menuDescription}>
              View and manage customer orders
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={C.muted}
          />
        </Pressable>

        {/* CUSTOMERS */}
        <Pressable style={styles.menuCard}>
          <View
            style={[
              styles.menuIcon,
              {
                backgroundColor: C.lightOrange,
              },
            ]}
          >
            <Ionicons
              name="people-outline"
              size={26}
              color={C.orange}
            />
          </View>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>
              Customers
            </Text>

            <Text style={styles.menuDescription}>
              View registered customers
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={C.muted}
          />
        </Pressable>

        {/* STORE STATUS */}
        <Text style={styles.sectionTitle}>
          Store Status
        </Text>

        <View style={styles.statusCard}>
          <View style={styles.statusDot} />

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              Store is Online
            </Text>

            <Text style={styles.statusText}>
              Customers can currently place orders.
            </Text>
          </View>

          <Ionicons
            name="checkmark-circle"
            size={28}
            color={C.green}
          />
        </View>

        {/* BACK TO STORE */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace('/')}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={C.maroon}
          />

          <Text style={styles.backText}>
            Back to Store
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.cream,
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  smallTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: C.gold,
  },

  title: {
    marginTop: 3,
    fontSize: 28,
    fontWeight: '800',
    color: C.darkMaroon,
  },

  adminIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.maroon,
    alignItems: 'center',
    justifyContent: 'center',
  },

  welcomeCard: {
    backgroundColor: C.darkMaroon,
    borderRadius: 22,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
  },

  welcomeSmall: {
    color: '#E8D7B8',
    fontSize: 13,
    fontWeight: '600',
  },

  welcomeTitle: {
    color: C.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },

  welcomeText: {
    color: '#D8C8C1',
    fontSize: 13,
    marginTop: 6,
    maxWidth: 230,
    lineHeight: 19,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    marginBottom: 14,
    marginTop: 4,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  statCard: {
    width: '48%',
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },

  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  statNumber: {
    fontSize: 23,
    fontWeight: '800',
    color: C.text,
  },

  statLabel: {
    marginTop: 3,
    fontSize: 12,
    color: C.muted,
  },

  menuCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuContent: {
    flex: 1,
    marginLeft: 14,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
  },

  menuDescription: {
    fontSize: 12,
    color: C.muted,
    marginTop: 4,
  },

  statusCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.green,
    marginRight: 14,
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: C.text,
  },

  statusText: {
    fontSize: 12,
    color: C.muted,
    marginTop: 3,
  },

  backButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.maroon,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 26,
  },

  backText: {
    color: C.maroon,
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },
});