import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useCart } from '@/context/CartContext';

const C = {
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
  orange: '#D98243',
};

type Product = {
  id: string;
  name: string;
  category: string;
  department: string;
  price: number;
  oldPrice?: number;
  quantity: string;
  rating: number;
  emoji: string;
  image?: string;
};

const DEPARTMENT_INFO: Record<
  string,
  {
    title: string;
    subtitle: string;
    emoji: string;
    categories: string[];
  }
> = {
  Groceries: {
    title: 'Fresh Groceries',
    subtitle: 'Everyday essentials delivered to your door',
    emoji: '🛒',
    categories: [
      'All',
      'Fruits',
      'Vegetables',
      'Dairy',
      'Bakery',
      'Snacks',
      'Pantry Essentials',
    ],
  },

  'Home Appliances': {
    title: 'Home Appliances',
    subtitle: 'Smart essentials for a comfortable home',
    emoji: '🏠',
    categories: [
      'All',
      'Kitchen',
      'Cleaning',
      'Storage',
      'Small Appliances',
    ],
  },

  Stationery: {
    title: 'Stationery',
    subtitle: 'Everything for school, office and creativity',
    emoji: '📚',
    categories: [
      'All',
      'Pens',
      'Notebooks',
      'Books',
      'School Supplies',
    ],
  },

  'Skin Care': {
    title: 'Skin Care',
    subtitle: 'Everyday personal care essentials',
    emoji: '✨',
    categories: ['All', 'Face Care', 'Body Care', 'Hair Care'],
  },

  Medikits: {
    title: 'Medikits',
    subtitle: 'Basic care and first-aid essentials',
    emoji: '💊',
    categories: ['All', 'First Aid', 'Personal Care', 'Basic Care'],
  },
};

const PRODUCTS: Product[] = [
  // =========================
  // GROCERIES
  // =========================

  {
    id: 'grocery-apple',
    name: 'Fresh Red Apples',
    category: 'Fruits',
    department: 'Groceries',
    price: 149,
    quantity: '1 kg',
    rating: 4.8,
    emoji: '🍎',
    image:
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=700&q=80',
  },

  {
    id: 'grocery-banana',
    name: 'Organic Bananas',
    category: 'Fruits',
    department: 'Groceries',
    price: 59,
    quantity: '1 dozen',
    rating: 4.7,
    emoji: '🍌',
    image:
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=700&q=80',
  },

  {
    id: 'grocery-broccoli',
    name: 'Fresh Broccoli',
    category: 'Vegetables',
    department: 'Groceries',
    price: 89,
    quantity: '500 g',
    rating: 4.6,
    emoji: '🥦',
    image:
      'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=700&q=80',
  },

  {
    id: 'grocery-tomato',
    name: 'Farm Fresh Tomatoes',
    category: 'Vegetables',
    department: 'Groceries',
    price: 49,
    quantity: '1 kg',
    rating: 4.7,
    emoji: '🍅',
    image:
      'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=700&q=80',
  },

  {
    id: 'grocery-milk',
    name: 'Fresh Milk',
    category: 'Dairy',
    department: 'Groceries',
    price: 34,
    quantity: '500 ml',
    rating: 4.8,
    emoji: '🥛',
    image:
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=700&q=80',
  },

  {
    id: 'grocery-bread',
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    department: 'Groceries',
    price: 55,
    quantity: '400 g',
    rating: 4.6,
    emoji: '🍞',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80',
  },

  {
    id: 'grocery-chips',
    name: 'Classic Potato Chips',
    category: 'Snacks',
    department: 'Groceries',
    price: 30,
    quantity: '100 g',
    rating: 4.5,
    emoji: '🥔',
  },

  {
    id: 'grocery-rice',
    name: 'Premium Basmati Rice',
    category: 'Pantry Essentials',
    department: 'Groceries',
    price: 299,
    quantity: '5 kg',
    rating: 4.8,
    emoji: '🍚',
  },

  // =========================
  // HOME APPLIANCES
  // =========================

  {
    id: 'appliance-kettle',
    name: 'Electric Kettle',
    category: 'Kitchen',
    department: 'Home Appliances',
    price: 899,
    oldPrice: 1199,
    quantity: '1 piece',
    rating: 4.7,
    emoji: '☕',
  },

  {
    id: 'appliance-mixer',
    name: 'Mixer Grinder',
    category: 'Kitchen',
    department: 'Home Appliances',
    price: 1899,
    oldPrice: 2299,
    quantity: '1 piece',
    rating: 4.6,
    emoji: '🥤',
  },

  {
    id: 'appliance-toaster',
    name: 'Pop-up Toaster',
    category: 'Kitchen',
    department: 'Home Appliances',
    price: 1299,
    quantity: '1 piece',
    rating: 4.5,
    emoji: '🍞',
  },

  {
    id: 'appliance-bottle',
    name: 'Electric Water Bottle',
    category: 'Kitchen',
    department: 'Home Appliances',
    price: 699,
    quantity: '1 piece',
    rating: 4.4,
    emoji: '💧',
  },

  {
    id: 'appliance-mop',
    name: 'Spin Floor Mop',
    category: 'Cleaning',
    department: 'Home Appliances',
    price: 799,
    quantity: '1 set',
    rating: 4.5,
    emoji: '🧹',
  },

  {
    id: 'appliance-vacuum',
    name: 'Mini Handheld Vacuum',
    category: 'Cleaning',
    department: 'Home Appliances',
    price: 1499,
    quantity: '1 piece',
    rating: 4.6,
    emoji: '🧹',
  },

  {
    id: 'appliance-storage',
    name: 'Kitchen Storage Set',
    category: 'Storage',
    department: 'Home Appliances',
    price: 599,
    quantity: '6 pieces',
    rating: 4.7,
    emoji: '🥣',
  },

  {
    id: 'appliance-organizer',
    name: 'Multipurpose Organizer',
    category: 'Storage',
    department: 'Home Appliances',
    price: 349,
    quantity: '1 piece',
    rating: 4.5,
    emoji: '🗃️',
  },

  {
    id: 'appliance-fan',
    name: 'Table Fan',
    category: 'Small Appliances',
    department: 'Home Appliances',
    price: 1199,
    quantity: '1 piece',
    rating: 4.6,
    emoji: '🌀',
  },

  {
    id: 'appliance-iron',
    name: 'Steam Iron',
    category: 'Small Appliances',
    department: 'Home Appliances',
    price: 999,
    quantity: '1 piece',
    rating: 4.5,
    emoji: '👕',
  },

  // =========================
  // STATIONERY
  // =========================

  {
    id: 'stationery-ball-pen',
    name: 'Premium Ball Pens',
    category: 'Pens',
    department: 'Stationery',
    price: 99,
    quantity: '5 pieces',
    rating: 4.7,
    emoji: '🖊️',
  },

  {
    id: 'stationery-gel-pen',
    name: 'Smooth Gel Pens',
    category: 'Pens',
    department: 'Stationery',
    price: 120,
    quantity: '5 pieces',
    rating: 4.8,
    emoji: '🖊️',
  },

  {
    id: 'stationery-notebook',
    name: 'Classic Ruled Notebook',
    category: 'Notebooks',
    department: 'Stationery',
    price: 79,
    quantity: '1 piece',
    rating: 4.6,
    emoji: '📓',
  },

  {
    id: 'stationery-planner',
    name: 'Premium Daily Planner',
    category: 'Notebooks',
    department: 'Stationery',
    price: 249,
    quantity: '1 piece',
    rating: 4.8,
    emoji: '📔',
  },

  {
    id: 'stationery-sketch',
    name: 'Drawing Sketch Book',
    category: 'Books',
    department: 'Stationery',
    price: 149,
    quantity: '1 book',
    rating: 4.7,
    emoji: '📖',
  },

  {
    id: 'stationery-colour',
    name: 'Colour Pencil Set',
    category: 'School Supplies',
    department: 'Stationery',
    price: 199,
    quantity: '24 colours',
    rating: 4.8,
    emoji: '🖍️',
  },

  {
    id: 'stationery-pencil',
    name: 'HB Writing Pencils',
    category: 'School Supplies',
    department: 'Stationery',
    price: 60,
    quantity: '10 pieces',
    rating: 4.6,
    emoji: '✏️',
  },

  {
    id: 'stationery-kit',
    name: 'School Essentials Kit',
    category: 'School Supplies',
    department: 'Stationery',
    price: 299,
    quantity: '1 kit',
    rating: 4.7,
    emoji: '🎒',
  },

  // =========================
  // SKIN CARE
  // =========================

  {
    id: 'skin-facewash',
    name: 'Gentle Face Wash',
    category: 'Face Care',
    department: 'Skin Care',
    price: 199,
    quantity: '100 ml',
    rating: 4.6,
    emoji: '🧴',
  },

  {
    id: 'skin-moisturizer',
    name: 'Daily Moisturizer',
    category: 'Face Care',
    department: 'Skin Care',
    price: 299,
    quantity: '100 ml',
    rating: 4.7,
    emoji: '✨',
  },

  {
    id: 'skin-sunscreen',
    name: 'Daily Sunscreen',
    category: 'Face Care',
    department: 'Skin Care',
    price: 349,
    quantity: '50 g',
    rating: 4.8,
    emoji: '☀️',
  },

  {
    id: 'skin-bodywash',
    name: 'Refreshing Body Wash',
    category: 'Body Care',
    department: 'Skin Care',
    price: 249,
    quantity: '250 ml',
    rating: 4.6,
    emoji: '🫧',
  },

  {
    id: 'skin-lotion',
    name: 'Hydrating Body Lotion',
    category: 'Body Care',
    department: 'Skin Care',
    price: 279,
    quantity: '200 ml',
    rating: 4.7,
    emoji: '🧴',
  },

  {
    id: 'skin-shampoo',
    name: 'Daily Care Shampoo',
    category: 'Hair Care',
    department: 'Skin Care',
    price: 299,
    quantity: '340 ml',
    rating: 4.6,
    emoji: '🧴',
  },

  {
    id: 'skin-conditioner',
    name: 'Smooth Hair Conditioner',
    category: 'Hair Care',
    department: 'Skin Care',
    price: 279,
    quantity: '180 ml',
    rating: 4.5,
    emoji: '💆',
  },

  {
    id: 'skin-hairoil',
    name: 'Nourishing Hair Oil',
    category: 'Hair Care',
    department: 'Skin Care',
    price: 189,
    quantity: '200 ml',
    rating: 4.6,
    emoji: '🌿',
  },

  // =========================
  // MEDIKITS
  // =========================

  {
    id: 'medikit-bandage',
    name: 'Adhesive Bandages',
    category: 'First Aid',
    department: 'Medikits',
    price: 49,
    quantity: '20 pieces',
    rating: 4.7,
    emoji: '🩹',
  },

  {
    id: 'medikit-firstaid',
    name: 'First Aid Kit',
    category: 'First Aid',
    department: 'Medikits',
    price: 399,
    quantity: '1 kit',
    rating: 4.8,
    emoji: '🧰',
  },

  {
    id: 'medikit-cotton',
    name: 'Sterile Cotton',
    category: 'First Aid',
    department: 'Medikits',
    price: 89,
    quantity: '100 g',
    rating: 4.6,
    emoji: '☁️',
  },

  {
    id: 'medikit-sanitizer',
    name: 'Hand Sanitizer',
    category: 'Personal Care',
    department: 'Medikits',
    price: 99,
    quantity: '250 ml',
    rating: 4.7,
    emoji: '🧴',
  },

  {
    id: 'medikit-mask',
    name: 'Protective Face Masks',
    category: 'Personal Care',
    department: 'Medikits',
    price: 120,
    quantity: '20 pieces',
    rating: 4.5,
    emoji: '😷',
  },

  {
    id: 'medikit-thermometer',
    name: 'Digital Thermometer',
    category: 'Basic Care',
    department: 'Medikits',
    price: 249,
    quantity: '1 piece',
    rating: 4.6,
    emoji: '🌡️',
  },

  {
    id: 'medikit-hotwater',
    name: 'Hot Water Bag',
    category: 'Basic Care',
    department: 'Medikits',
    price: 299,
    quantity: '1 piece',
    rating: 4.7,
    emoji: '♨️',
  },

  {
    id: 'medikit-balm',
    name: 'Pain Relief Balm',
    category: 'Basic Care',
    department: 'Medikits',
    price: 99,
    quantity: '25 g',
    rating: 4.5,
    emoji: '🌿',
  },
];

export default function DepartmentScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    department?: string | string[];
    category?: string | string[];
  }>();

  const { items, addToCart, changeQuantity } = useCart();

  const requestedDepartment = Array.isArray(params.department)
    ? params.department[0]
    : params.department;

  const requestedCategory = Array.isArray(params.category)
    ? params.category[0]
    : params.category;

  const department =
    requestedDepartment && DEPARTMENT_INFO[requestedDepartment]
      ? requestedDepartment
      : 'Groceries';

  const info = DEPARTMENT_INFO[department];

  const [selectedCategory, setSelectedCategory] = useState(
    requestedCategory && info.categories.includes(requestedCategory)
      ? requestedCategory
      : 'All'
  );

  const [search, setSearch] = useState('');

  const departmentProducts = useMemo(() => {
    return PRODUCTS.filter(
      (product) => product.department === department
    );
  }, [department]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return departmentProducts.filter((product) => {
      const categoryMatch =
        selectedCategory === 'All' ||
        product.category === selectedCategory;

      const searchMatch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      return categoryMatch && searchMatch;
    });
  }, [departmentProducts, selectedCategory, search]);

  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const getCartQuantity = (productId: string) => {
    return (
      items.find((item) => item.id === productId)?.quantity ?? 0
    );
  };

  const addProduct = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
    });

    Alert.alert(
      'Added to cart',
      `${product.name} has been added to your cart.`
    );
  };

  const increaseQuantity = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
    });
  };

  const decreaseQuantity = (product: Product) => {
    const quantity = getCartQuantity(product.id);

    if (quantity > 0) {
      changeQuantity(product.id, quantity - 1);
    }
  };

  const openProductDetails = (product: Product) => {
    router.push({
      pathname: '/product-details',
      params: {
        id: product.id,
      },
    });
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const quantity = getCartQuantity(item.id);

    return (
      <Pressable
        style={styles.productCard}
        onPress={() => openProductDetails(item)}
      >
        <View style={styles.productImageBox}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.productEmoji}>
              {item.emoji}
            </Text>
          )}

          {item.oldPrice && (
            <View style={styles.offerBadge}>
              <Text style={styles.offerText}>
                SALE
              </Text>
            </View>
          )}

          {/* VIEW DETAILS INDICATOR */}
          <View style={styles.detailsIndicator}>
            <Ionicons
              name="chevron-forward"
              size={15}
              color={C.green}
            />
          </View>
        </View>

        <View style={styles.productInfo}>
          <Text
            style={styles.productName}
            numberOfLines={2}
          >
            {item.name}
          </Text>

          <Text style={styles.productQuantity}>
            {item.quantity}
          </Text>

          <View style={styles.ratingRow}>
            <Ionicons
              name="star"
              size={13}
              color={C.goldDark}
            />

            <Text style={styles.ratingText}>
              {item.rating}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.price}>
                ₹{item.price}
              </Text>

              {item.oldPrice && (
                <Text style={styles.oldPrice}>
                  ₹{item.oldPrice}
                </Text>
              )}
            </View>

            {quantity === 0 ? (
              <Pressable
                style={styles.addButton}
                onPress={(event) => {
                  event.stopPropagation();
                  addProduct(item);
                }}
              >
                <Ionicons
                  name="add"
                  size={22}
                  color="#FFFFFF"
                />
              </Pressable>
            ) : (
              <View style={styles.quantityBox}>
                <Pressable
                  style={styles.quantityButton}
                  onPress={(event) => {
                    event.stopPropagation();
                    decreaseQuantity(item);
                  }}
                >
                  <Ionicons
                    name="remove"
                    size={17}
                    color={C.green}
                  />
                </Pressable>

                <Text style={styles.quantityText}>
                  {quantity}
                </Text>

                <Pressable
                  style={styles.quantityButton}
                  onPress={(event) => {
                    event.stopPropagation();
                    increaseQuantity(item);
                  }}
                >
                  <Ionicons
                    name="add"
                    size={17}
                    color={C.green}
                  />
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={C.background}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={C.green}
          />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerEmoji}>
            {info.emoji}
          </Text>

          <View>
            <Text style={styles.headerTitle}>
              {info.title}
            </Text>

            <Text style={styles.headerSubtitle}>
              {department}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.iconButton}
          onPress={() => router.push('/cart')}
        >
          <Ionicons
            name="cart-outline"
            size={24}
            color={C.green}
          />

          {cartCount > 0 && (
            <View style={styles.headerCartBadge}>
              <Text style={styles.headerCartBadgeText}>
                {cartCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* SEARCH */}
      <View style={styles.searchWrapper}>
        <Ionicons
          name="search-outline"
          size={21}
          color={C.muted}
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={`Search in ${department}`}
          placeholderTextColor={C.muted}
          style={styles.searchInput}
          returnKeyType="search"
        />

        {search.length > 0 && (
          <Pressable
            onPress={() => setSearch('')}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={C.muted}
            />
          </Pressable>
        )}
      </View>

      {/* SUBTITLE */}
      <View style={styles.intro}>
        <Text style={styles.introTitle}>
          {info.title}
        </Text>

        <Text style={styles.introSubtitle}>
          {info.subtitle}
        </Text>
      </View>

      {/* CATEGORY FILTER */}
      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {info.categories.map((category) => {
            const active =
              selectedCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() =>
                  setSelectedCategory(category)
                }
                style={[
                  styles.categoryChip,
                  active &&
                    styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    active &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* RESULT COUNT */}
      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>
          {selectedCategory === 'All'
            ? 'All Products'
            : selectedCategory}
        </Text>

        <Text style={styles.resultCount}>
          {filteredProducts.length} items
        </Text>
      </View>

      {/* PRODUCTS */}
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>
            🔎
          </Text>

          <Text style={styles.emptyTitle}>
            No products found
          </Text>

          <Text style={styles.emptySubtitle}>
            Try another search or category.
          </Text>

          <Pressable
            style={styles.clearButton}
            onPress={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
          >
            <Text style={styles.clearButtonText}>
              Clear Filters
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productList}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}

      {/* FLOATING CART */}
      {cartCount > 0 && (
        <Pressable
          style={styles.floatingCart}
          onPress={() => router.push('/cart')}
        >
          <View style={styles.floatingCartLeft}>
            <View style={styles.floatingCartIcon}>
              <Ionicons
                name="cart"
                size={21}
                color="#FFFFFF"
              />

              <View style={styles.floatingBadge}>
                <Text style={styles.floatingBadgeText}>
                  {cartCount}
                </Text>
              </View>
            </View>

            <View>
              <Text style={styles.floatingCartTitle}>
                View Cart
              </Text>

              <Text style={styles.floatingCartItems}>
                {cartCount}{' '}
                {cartCount === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>

          <View style={styles.floatingCartRight}>
            <Text style={styles.floatingTotal}>
              ₹{cartTotal}
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#FFFFFF"
            />
          </View>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },

  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
    position: 'relative',
  },

  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },

  headerEmoji: {
    fontSize: 27,
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.greenDark,
  },

  headerSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },

  headerCartBadge: {
    position: 'absolute',
    right: -3,
    top: -3,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: C.orange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  headerCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  searchWrapper: {
    height: 52,
    marginHorizontal: 18,
    borderRadius: 17,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: C.text,
  },

  intro: {
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 8,
  },

  introTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: C.greenDark,
  },

  introSubtitle: {
    marginTop: 4,
    color: C.muted,
    fontSize: 13,
  },

  categorySection: {
    marginTop: 5,
  },

  categoryScroll: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 8,
  },

  categoryChipActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },

  categoryChipText: {
    color: C.text,
    fontSize: 12,
    fontWeight: '700',
  },

  categoryChipTextActive: {
    color: '#FFFFFF',
  },

  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
  },

  resultTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.greenDark,
  },

  resultCount: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  productList: {
    paddingHorizontal: 14,
    paddingBottom: 130,
  },

  columnWrapper: {
    justifyContent: 'space-between',
  },

  productCard: {
    width: '48%',
    backgroundColor: C.surface,
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
  },

  productImageBox: {
    height: 145,
    backgroundColor: C.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  productEmoji: {
    fontSize: 55,
  },

  offerBadge: {
    position: 'absolute',
    left: 9,
    top: 9,
    backgroundColor: C.orange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },

  offerText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },

  detailsIndicator: {
    position: 'absolute',
    right: 9,
    bottom: 9,
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },

  productInfo: {
    padding: 12,
  },

  productName: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
    minHeight: 38,
    lineHeight: 19,
  },

  productQuantity: {
    fontSize: 11,
    color: C.muted,
    marginTop: 3,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  ratingText: {
    fontSize: 11,
    color: C.muted,
    marginLeft: 4,
    fontWeight: '600',
  },

  priceRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  price: {
    fontSize: 17,
    fontWeight: '900',
    color: C.green,
  },

  oldPrice: {
    fontSize: 10,
    color: C.muted,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },

  addButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityBox: {
    height: 38,
    borderRadius: 13,
    backgroundColor: C.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.greenLight,
  },

  quantityButton: {
    width: 30,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityText: {
    minWidth: 20,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: C.greenDark,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyEmoji: {
    fontSize: 55,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: C.greenDark,
  },

  emptySubtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 6,
    textAlign: 'center',
  },

  clearButton: {
    marginTop: 20,
    backgroundColor: C.green,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 13,
  },

  clearButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  floatingCart: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    minHeight: 66,
    borderRadius: 20,
    backgroundColor: C.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  floatingCartIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: C.greenDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    position: 'relative',
  },

  floatingBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: C.orange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  floatingBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  floatingCartTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  floatingCartItems: {
    color: '#DCE9E1',
    fontSize: 11,
    marginTop: 2,
  },

  floatingCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  floatingTotal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginRight: 5,
  },
});