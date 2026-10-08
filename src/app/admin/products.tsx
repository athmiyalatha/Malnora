import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const API_URL = 'http://127.0.0.1:5000/api';

type Product = {
  _id: string;
  name: string;
  brand: string;
  category: string;
  department: string;
  price: number;
  mrp: number;
  quantity: string;
  stock: number;
  image: string;
  description: string;
  rating: number;
  ratingCount: number;
  active: boolean;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/products`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();

      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getDiscount = (price: number, mrp: number) => {
    if (!mrp || mrp <= price) {
      return 0;
    }

    return Math.round(((mrp - price) / mrp) * 100);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Products</Text>
          <Text style={styles.subtitle}>
            Manage your grocery products
          </Text>
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>

      {/* Refresh */}
      <View style={styles.toolbar}>
        <Text style={styles.countText}>
          {products.length} Products
        </Text>

        <Pressable
          style={styles.refreshButton}
          onPress={fetchProducts}
        >
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#741B2B" />

          <Text style={styles.loadingText}>
            Loading products...
          </Text>
        </View>
      )}

      {/* Error */}
      {!loading && error !== '' && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            style={styles.retryButton}
            onPress={fetchProducts}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      )}

      {/* Empty */}
      {!loading && !error && products.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>
            No products found
          </Text>

          <Text style={styles.emptyText}>
            Add products to your database first.
          </Text>
        </View>
      )}

      {/* Products */}
      {!loading && !error && products.length > 0 && (
        <ScrollView
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
        >
          {products.map((product) => {
            const discount = getDiscount(
              product.price,
              product.mrp
            );

            return (
              <View
                key={product._id}
                style={styles.card}
              >
                {/* Image */}
                <View style={styles.imageContainer}>
                  {product.image ? (
                    <Image
                      source={{ uri: product.image }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.noImage}>
                      <Text style={styles.noImageText}>
                        🛒
                      </Text>
                    </View>
                  )}
                </View>

                {/* Product Information */}
                <View style={styles.info}>
                  <View style={styles.topRow}>
                    <Text style={styles.category}>
                      {product.category}
                    </Text>

                    <View
                      style={[
                        styles.stockBadge,
                        product.stock > 0
                          ? styles.inStock
                          : styles.outOfStock,
                      ]}
                    >
                      <Text style={styles.stockText}>
                        {product.stock > 0
                          ? `Stock: ${product.stock}`
                          : 'Out of stock'}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={styles.productName}
                    numberOfLines={2}
                  >
                    {product.name}
                  </Text>

                  {product.brand ? (
                    <Text style={styles.brand}>
                      {product.brand}
                    </Text>
                  ) : null}

                  <Text style={styles.quantity}>
                    {product.quantity}
                  </Text>

                  {/* Price */}
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>
                      ₹{product.price}
                    </Text>

                    {product.mrp > product.price && (
                      <Text style={styles.mrp}>
                        ₹{product.mrp}
                      </Text>
                    )}

                    {discount > 0 && (
                      <Text style={styles.discount}>
                        {discount}% OFF
                      </Text>
                    )}
                  </View>

                  {/* Rating */}
                  {product.rating > 0 && (
                    <Text style={styles.rating}>
                      ⭐ {product.rating.toFixed(1)} (
                      {product.ratingCount})
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6ED',
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: '#741B2B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },

  subtitle: {
    color: '#F5D9C2',
    fontSize: 14,
    marginTop: 4,
  },

  backButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 10,
  },

  backButtonText: {
    color: '#741B2B',
    fontWeight: '700',
  },

  toolbar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  countText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B101D',
  },

  refreshButton: {
    backgroundColor: '#741B2B',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
  },

  refreshText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  productList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 15,
    padding: 12,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  imageContainer: {
    width: 110,
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3EEE7',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  noImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  noImageText: {
    fontSize: 35,
  },

  info: {
    flex: 1,
    marginLeft: 14,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  category: {
    color: '#827568',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  stockBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },

  inStock: {
    backgroundColor: '#E7F3E8',
  },

  outOfStock: {
    backgroundColor: '#FCE7E7',
  },

  stockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#426B48',
  },

  productName: {
    color: '#4B101D',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 7,
  },

  brand: {
    color: '#827568',
    fontSize: 12,
    marginTop: 3,
  },

  quantity: {
    color: '#827568',
    fontSize: 12,
    marginTop: 3,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 7,
  },

  price: {
    color: '#741B2B',
    fontSize: 18,
    fontWeight: '800',
  },

  mrp: {
    color: '#999999',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },

  discount: {
    color: '#426B48',
    fontSize: 11,
    fontWeight: '800',
  },

  rating: {
    color: '#827568',
    fontSize: 11,
    marginTop: 5,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 10,
    color: '#827568',
  },

  errorText: {
    color: '#B3261E',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: '#741B2B',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  emptyTitle: {
    color: '#4B101D',
    fontSize: 20,
    fontWeight: '800',
  },

  emptyText: {
    color: '#827568',
    marginTop: 6,
  },
});