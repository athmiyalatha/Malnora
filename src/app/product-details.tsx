import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/data/products';

const C = {
  background: '#F7F5EE',
  surface: '#FFFFFF',
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
  white: '#FFFFFF',
};

export default function ProductDetailsScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const { items, addToCart } = useCart();

  const productId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const product = PRODUCTS.find(
    (item) => item.id === productId
  );

  const existingQuantity = product
    ? items.find((item) => item.id === product.id)?.quantity ?? 0
    : 0;

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Keep quantity synced if the product already exists in cart.
  useEffect(() => {
    if (existingQuantity > 0) {
      setQuantity(existingQuantity);
    } else {
      setQuantity(1);
    }
  }, [productId, existingQuantity]);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={C.background}
        />

        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>🔎</Text>

          <Text style={styles.errorTitle}>
            Product not found
          </Text>

          <Text style={styles.errorSubtitle}>
            We couldn't find this product.
          </Text>

          <Pressable
            style={styles.backHomeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backHomeButtonText}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const totalPrice = product.price * quantity;

  const cartItemCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const addSelectedQuantityToCart = () => {
    const currentQuantity =
      items.find((item) => item.id === product.id)?.quantity ?? 0;

    const additionalQuantity = Math.max(
      quantity - currentQuantity,
      0
    );

    if (additionalQuantity === 0) {
      Alert.alert(
        'Already in cart',
        `${product.name} is already in your cart.`,
        [
          {
            text: 'Continue',
            style: 'cancel',
          },
          {
            text: 'View Cart',
            onPress: () => router.push('/cart'),
          },
        ]
      );

      return;
    }

    for (let i = 0; i < additionalQuantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        emoji: product.emoji,
      });
    }

    Alert.alert(
      'Added to cart',
      `${product.name} has been added to your cart.`,
      [
        {
          text: 'Continue Shopping',
          style: 'cancel',
        },
        {
          text: 'View Cart',
          onPress: () => router.push('/cart'),
        },
      ]
    );
  };

  const buyNow = () => {
    const currentQuantity =
      items.find((item) => item.id === product.id)?.quantity ?? 0;

    const additionalQuantity = Math.max(
      quantity - currentQuantity,
      0
    );

    for (let i = 0; i < additionalQuantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        emoji: product.emoji,
      });
    }

    router.push('/cart');
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
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
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={C.green}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Product Details
        </Text>

        <Pressable
          style={styles.headerButton}
          onPress={() => router.push('/cart')}
        >
          <Ionicons
            name="cart-outline"
            size={24}
            color={C.green}
          />

          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItemCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PRODUCT IMAGE */}

        <View style={styles.imageContainer}>
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.emojiContainer}>
              <Text style={styles.productEmoji}>
                {product.emoji}
              </Text>
            </View>
          )}

          {product.oldPrice && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleText}>
                SALE
              </Text>
            </View>
          )}

          <Pressable
            style={styles.favoriteButton}
            onPress={() =>
              setIsFavorite((current) => !current)
            }
          >
            <Ionicons
              name={
                isFavorite
                  ? 'heart'
                  : 'heart-outline'
              }
              size={23}
              color={
                isFavorite
                  ? C.orange
                  : C.green
              }
            />
          </Pressable>
        </View>

        {/* PRODUCT INFORMATION */}

        <View style={styles.infoCard}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {product.category}
              </Text>
            </View>

            <View style={styles.ratingBadge}>
              <Ionicons
                name="star"
                size={14}
                color={C.goldDark}
              />

              <Text style={styles.ratingValue}>
                {product.rating}
              </Text>

              <Text style={styles.ratingCount}>
                ({product.ratingCount})
              </Text>
            </View>
          </View>

          <Text style={styles.productName}>
            {product.name}
          </Text>

          <Text style={styles.departmentText}>
            {product.department}
          </Text>

          {/* PRICE */}

          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ₹{product.price}
            </Text>

            {product.oldPrice && (
              <Text style={styles.oldPrice}>
                ₹{product.oldPrice}
              </Text>
            )}

            {product.oldPrice && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>
                  SAVE ₹
                  {product.oldPrice - product.price}
                </Text>
              </View>
            )}
          </View>

          {/* PRODUCT DETAILS */}

          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <Ionicons
                name="cube-outline"
                size={20}
                color={C.green}
              />

              <Text style={styles.detailLabel}>
                Quantity
              </Text>

              <Text style={styles.detailValue}>
                {product.quantity}
              </Text>
            </View>

            <View style={styles.detailBox}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={C.green}
              />

              <Text style={styles.detailLabel}>
                Quality
              </Text>

              <Text style={styles.detailValue}>
                {product.quality}
              </Text>
            </View>

            <View style={styles.detailBox}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={C.green}
              />

              <Text style={styles.detailLabel}>
                Availability
              </Text>

              <Text style={styles.detailValue}>
                {product.availability}
              </Text>
            </View>

            {product.freshness && (
              <View style={styles.detailBox}>
                <Ionicons
                  name="leaf-outline"
                  size={20}
                  color={C.green}
                />

                <Text style={styles.detailLabel}>
                  Freshness
                </Text>

                <Text style={styles.detailValue}>
                  {product.freshness}
                </Text>
              </View>
            )}

            {product.origin && (
              <View style={styles.detailBox}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={C.green}
                />

                <Text style={styles.detailLabel}>
                  Origin
                </Text>

                <Text style={styles.detailValue}>
                  {product.origin}
                </Text>
              </View>
            )}
          </View>

          {/* DESCRIPTION */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              About this product
            </Text>

            <Text style={styles.description}>
              {product.description}
            </Text>
          </View>

          {/* FEATURES */}

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={C.green}
                />
              </View>

              <Text style={styles.featureText}>
                Quality Checked
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons
                  name="flash-outline"
                  size={20}
                  color={C.green}
                />
              </View>

              <Text style={styles.featureText}>
                Fast Delivery
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons
                  name="refresh-outline"
                  size={20}
                  color={C.green}
                />
              </View>

              <Text style={styles.featureText}>
                Easy Returns
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM ACTION AREA */}

      <View style={styles.bottomContainer}>
        {/* QUANTITY SELECTOR */}

        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>
            Quantity
          </Text>

          <View style={styles.quantityBox}>
            <Pressable
              style={styles.quantityButton}
              onPress={decreaseQuantity}
            >
              <Ionicons
                name="remove"
                size={19}
                color={C.green}
              />
            </Pressable>

            <Text style={styles.quantityValue}>
              {quantity}
            </Text>

            <Pressable
              style={styles.quantityButton}
              onPress={increaseQuantity}
            >
              <Ionicons
                name="add"
                size={19}
                color={C.green}
              />
            </Pressable>
          </View>
        </View>

        {/* ACTION BUTTONS */}

        <View style={styles.actionRow}>
          <Pressable
            style={styles.addToCartButton}
            onPress={addSelectedQuantityToCart}
          >
            <Ionicons
              name="cart-outline"
              size={21}
              color={C.green}
            />

            <Text style={styles.addToCartText}>
              Add to Cart
            </Text>
          </Pressable>

          <Pressable
            style={styles.buyNowButton}
            onPress={buyNow}
          >
            <Text style={styles.buyNowText}>
              Buy Now
            </Text>

            <Text style={styles.buyNowPrice}>
              ₹{totalPrice}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },

  header: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.background,
  },

  headerButton: {
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

  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.greenDark,
  },

  cartBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: C.orange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  cartBadgeText: {
    color: C.white,
    fontSize: 10,
    fontWeight: '900',
  },

  scrollContent: {
    paddingBottom: 220,
  },

  imageContainer: {
    height: 360,
    backgroundColor: C.surface,
    position: 'relative',
    overflow: 'hidden',
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  emojiContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.greenSoft,
  },

  productEmoji: {
    fontSize: 110,
  },

  saleBadge: {
    position: 'absolute',
    top: 18,
    left: 18,
    backgroundColor: C.orange,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
  },

  saleText: {
    color: C.white,
    fontSize: 11,
    fontWeight: '900',
  },

  favoriteButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  infoCard: {
    backgroundColor: C.surface,
    marginTop: -10,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 25,
  },

  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  categoryBadge: {
    backgroundColor: C.greenSoft,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
  },

  categoryText: {
    color: C.green,
    fontSize: 11,
    fontWeight: '800',
  },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  ratingValue: {
    marginLeft: 5,
    fontSize: 12,
    color: C.text,
    fontWeight: '800',
  },

  ratingCount: {
    marginLeft: 3,
    fontSize: 11,
    color: C.muted,
    fontWeight: '600',
  },

  productName: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '900',
    color: C.greenDark,
    marginTop: 13,
  },

  departmentText: {
    fontSize: 13,
    color: C.muted,
    marginTop: 5,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
  },

  price: {
    fontSize: 28,
    fontWeight: '900',
    color: C.green,
  },

  oldPrice: {
    fontSize: 15,
    color: C.muted,
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },

  saveBadge: {
    marginLeft: 10,
    backgroundColor: C.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  saveText: {
    fontSize: 9,
    fontWeight: '900',
    color: C.green,
  },

  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },

  detailBox: {
    width: '48%',
    minHeight: 88,
    borderRadius: 15,
    backgroundColor: C.greenSoft,
    padding: 12,
  },

  detailLabel: {
    fontSize: 10,
    color: C.muted,
    fontWeight: '600',
    marginTop: 7,
  },

  detailValue: {
    fontSize: 13,
    color: C.greenDark,
    fontWeight: '800',
    marginTop: 2,
  },

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.greenDark,
  },

  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: C.muted,
  },

  features: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 20,
    gap: 15,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  featureText: {
    fontSize: 13,
    color: C.text,
    fontWeight: '700',
  },

  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 16,
  },

  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  quantityLabel: {
    fontSize: 13,
    color: C.text,
    fontWeight: '800',
  },

  quantityBox: {
    height: 42,
    borderRadius: 13,
    backgroundColor: C.greenSoft,
    borderWidth: 1,
    borderColor: C.greenLight,
    flexDirection: 'row',
    alignItems: 'center',
  },

  quantityButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityValue: {
    minWidth: 30,
    textAlign: 'center',
    fontSize: 15,
    color: C.greenDark,
    fontWeight: '900',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },

  addToCartButton: {
    flex: 1,
    height: 53,
    borderRadius: 16,
    backgroundColor: C.greenSoft,
    borderWidth: 1,
    borderColor: C.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addToCartText: {
    marginLeft: 7,
    color: C.green,
    fontSize: 13,
    fontWeight: '900',
  },

  buyNowButton: {
    flex: 1,
    height: 53,
    borderRadius: 16,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buyNowText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '900',
  },

  buyNowPrice: {
    color: '#DCE9E1',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  errorEmoji: {
    fontSize: 60,
    marginBottom: 18,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: C.greenDark,
  },

  errorSubtitle: {
    marginTop: 7,
    fontSize: 14,
    color: C.muted,
  },

  backHomeButton: {
    marginTop: 22,
    backgroundColor: C.green,
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 14,
  },

  backHomeButtonText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
  },
});