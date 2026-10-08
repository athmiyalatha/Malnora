import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getProducts } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import {
  Image,
  ImageBackground,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import AuthGate from './auth-gate';

// ======================================================
// PRODUCT TYPES
// ======================================================

type ApiProduct = {
  _id: string;
  name: string;
  category: string;
  department: string;
  price: number;
  mrp: number;
  quantity: string;
  stock?: number;
  image?: string;
  description?: string;
  rating?: number;
  ratingCount?: number;
  active?: boolean;
  emoji?: string;
};

type HomeProduct = {
  id: string;
  name: string;
  category: string;
  department: string;
  price: number;
  mrp: number;
  quantity: string;
  stock: number;
  image?: string;
  description: string;
  rating: number;
  ratingCount: number;
  emoji: string;
};

// ======================================================
// MALNORA COLOUR PALETTE
// ======================================================

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

  sareeRed: '#7D1825',
  sareeGold: '#D9AD62',
  sareeCream: '#FFF7E8',
};

// ======================================================
// NAMMA SAREE WEBSITE
// ======================================================

const NAMMA_SAREE_URL =
  'https://nammasaree497.wixsite.com/namma-saree-3';

const NAMMA_SAREE_BANNER_IMAGE =
  'https://static.wixstatic.com/media/816be5_dc81803382a54fdeb483475769cba087~mv2.jpg';

// ======================================================
// GROCERY CATEGORIES
// ======================================================

const CATEGORIES = [
  {
    id: 'All',
    name: 'All',
    icon: 'grid-outline' as const,
  },
  {
    id: 'Fruits',
    name: 'Fruits',
    icon: 'nutrition-outline' as const,
  },
  {
    id: 'Vegetables',
    name: 'Vegetables',
    icon: 'leaf-outline' as const,
  },
  {
    id: 'Dairy',
    name: 'Dairy',
    icon: 'water-outline' as const,
  },
  {
    id: 'Bakery',
    name: 'Bakery',
    icon: 'pizza-outline' as const,
  },
  {
    id: 'Snacks',
    name: 'Snacks',
    icon: 'fast-food-outline' as const,
  },
];

// ======================================================
// HOME SCREEN
// ======================================================

export default function HomeScreen() {
  const router = useRouter();

  // ====================================================
  // AUTHENTICATION
  // ====================================================

  const { user, loading } = useAuth();

  // ====================================================
  // ROUTE PARAMETERS
  // ====================================================

  const params = useLocalSearchParams<{
    category?: string | string[];
  }>();

  // ====================================================
  // CART
  // ====================================================

  const { items, addToCart } = useCart();

  // ====================================================
  // LOCAL STATE
  // ====================================================

  const [search, setSearch] = useState('');

  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [products, setProducts] =
    useState<HomeProduct[]>([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [productError, setProductError] =
    useState('');

  // ====================================================
  // CART TOTALS
  // ====================================================

  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = items.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  // ====================================================
  // LOAD PRODUCTS FROM MALNORA BACKEND
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductError('');

        const data =
          (await getProducts()) as ApiProduct[];

        if (!mounted) return;

        const normalizedProducts: HomeProduct[] =
          data.map((product) => ({
            id: product._id,
            name: product.name,
            category: product.category,
            department: product.department,
            price: product.price,
            mrp: product.mrp,
            quantity: product.quantity,
            stock: product.stock ?? 0,
            image: product.image || undefined,
            description:
              product.description ?? '',
            rating: product.rating ?? 0,
            ratingCount:
              product.ratingCount ?? 0,
            emoji:
              product.emoji ?? '🛒',
          }));

        setProducts(normalizedProducts);
      } catch (error) {
        console.error(
          'Failed to load products:',
          error
        );

        if (mounted) {
          setProductError(
            'Could not load products. Please make sure the Malnora backend is running.'
          );
        }
      } finally {
        if (mounted) {
          setLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  // ====================================================
  // CATEGORY PARAMETER
  // ====================================================

  useEffect(() => {
    const categoryParam =
      Array.isArray(params.category)
        ? params.category[0]
        : params.category;

    if (!categoryParam) {
      return;
    }

    const categoryMap: Record<
      string,
      string
    > = {
      Groceries: 'All',
      All: 'All',
      Fruits: 'Fruits',
      Vegetables: 'Vegetables',
      Dairy: 'Dairy',
      'Dairy & Eggs': 'Dairy',
      Bakery: 'Bakery',
      Snacks: 'Snacks',
      'Pantry Essentials': 'All',
    };

    setSelectedCategory(
      categoryMap[categoryParam] ?? 'All'
    );

    setSearch('');
  }, [params.category]);

  // ====================================================
  // FILTER GROCERY PRODUCTS
  // ====================================================

  const filteredProducts = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return products.filter((product) => {
      const isGrocery =
        product.department === 'Groceries';

      if (!isGrocery) {
        return false;
      }

      const matchesCategory =
        selectedCategory === 'All' ||
        product.category ===
          selectedCategory;

      const matchesSearch =
        !query ||
        product.name
          .toLowerCase()
          .includes(query) ||
        product.category
          .toLowerCase()
          .includes(query) ||
        product.description
          .toLowerCase()
          .includes(query);

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [
    products,
    search,
    selectedCategory,
  ]);

  // ====================================================
  // ADD TO CART
  // ====================================================

  const handleAddToCart = (
    product: HomeProduct
  ) => {
    if (product.stock <= 0) {
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      stock: product.stock,
    });
  };

  // ====================================================
  // OPEN PRODUCT DETAILS
  // ====================================================

  const openProductDetails = (
    productId: string
  ) => {
    router.push({
      pathname: '/product-details',
      params: {
        id: productId,
      },
    });
  };

  // ====================================================
  // NAVIGATION
  // ====================================================

  const goTo = (path: string) => {
    router.push(path as never);
  };

  // ====================================================
  // OPEN DEPARTMENT
  // ====================================================

  const openDepartment = (
    department:
      | 'Groceries'
      | 'Home Appliances'
      | 'Stationery'
      | 'Skin Care'
      | 'Medikits'
  ) => {
    router.push({
      pathname: '/department',
      params: {
        department,
      },
    });
  };

  // ====================================================
  // OPEN NAMMA SAREE
  // ====================================================

  const openNammaSaree = async () => {
    try {
      await Linking.openURL(
        NAMMA_SAREE_URL
      );
    } catch (error) {
      console.log(
        'Could not open Namma Saree website:',
        error
      );
    }
  };

  // ====================================================
  // AUTHENTICATION GATE
  // ====================================================

  if (loading) {
    return <AuthGate />;
  }

  if (!user) {
    return <AuthGate />;
  }

  // ====================================================
  // SCREEN
  // ====================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={C.background}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.logo}>
              <Ionicons
                name="leaf"
                size={25}
                color={C.green}
              />
            </View>

            <View>
              <Text style={styles.brandName}>
                Malnora
              </Text>

              <Text
                style={styles.brandTagline}
              >
                GOODNESS IN EVERY BASKET
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() =>
              goTo('/profile')
            }
          >
            <Ionicons
              name="person-outline"
              size={23}
              color={C.green}
            />
          </Pressable>
        </View>

        {/* ================================================= */}
        {/* DELIVERY ADDRESS */}
        {/* ================================================= */}

        <Pressable
          style={styles.addressCard}
          onPress={() => goTo('/address')}
        >
          <View style={styles.addressIcon}>
            <Ionicons
              name="location"
              size={23}
              color={C.green}
            />
          </View>

          <View style={styles.addressText}>
            <Text
              style={styles.addressLabel}
            >
              DELIVERING TO
            </Text>

            <Text
              style={styles.addressTitle}
            >
              Your doorstep
            </Text>
          </View>

          <Ionicons
            name="chevron-down"
            size={20}
            color={C.green}
          />
        </Pressable>

        {/* ================================================= */}
        {/* SEARCH */}
        {/* ================================================= */}

        <View
          style={styles.searchContainer}
        >
          <Ionicons
            name="search-outline"
            size={22}
            color={C.goldDark}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search fruits, vegetables..."
            placeholderTextColor={C.muted}
            style={styles.searchInput}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <Pressable
              onPress={() =>
                setSearch('')
              }
            >
              <Ionicons
                name="close-circle"
                size={21}
                color={C.muted}
              />
            </Pressable>
          )}
        </View>

        {/* ================================================= */}
        {/* SHOPPING DEPARTMENTS */}
        {/* ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={styles.sectionTitle}
            >
              Shopping Departments
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              Everything you need, all in one place
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.departmentScroll
          }
        >
          {/* GROCERIES */}

          <Pressable
            style={styles.departmentCard}
            onPress={() =>
              openDepartment(
                'Groceries'
              )
            }
          >
            <View
              style={styles.departmentIcon}
            >
              <Text
                style={
                  styles.departmentEmoji
                }
              >
                🛒
              </Text>
            </View>

            <Text
              style={styles.departmentTitle}
            >
              Groceries
            </Text>

            <Text
              style={
                styles.departmentSubtitle
              }
            >
              Fresh & daily
            </Text>
          </Pressable>

          {/* HOME APPLIANCES */}

          <Pressable
            style={styles.departmentCard}
            onPress={() =>
              openDepartment(
                'Home Appliances'
              )
            }
          >
            <View
              style={styles.departmentIcon}
            >
              <Text
                style={
                  styles.departmentEmoji
                }
              >
                🏠
              </Text>
            </View>

            <Text
              style={styles.departmentTitle}
            >
              Home Appliances
            </Text>

            <Text
              style={
                styles.departmentSubtitle
              }
            >
              Smart essentials
            </Text>
          </Pressable>

          {/* STATIONERY */}

          <Pressable
            style={styles.departmentCard}
            onPress={() =>
              openDepartment(
                'Stationery'
              )
            }
          >
            <View
              style={styles.departmentIcon}
            >
              <Text
                style={
                  styles.departmentEmoji
                }
              >
                📚
              </Text>
            </View>

            <Text
              style={styles.departmentTitle}
            >
              Stationery
            </Text>

            <Text
              style={
                styles.departmentSubtitle
              }
            >
              School & office
            </Text>
          </Pressable>

          {/* SKIN CARE */}

          <Pressable
            style={styles.departmentCard}
            onPress={() =>
              openDepartment(
                'Skin Care'
              )
            }
          >
            <View
              style={styles.departmentIcon}
            >
              <Text
                style={
                  styles.departmentEmoji
                }
              >
                ✨
              </Text>
            </View>

            <Text
              style={styles.departmentTitle}
            >
              Skin Care
            </Text>

            <Text
              style={
                styles.departmentSubtitle
              }
            >
              Personal care
            </Text>
          </Pressable>

          {/* MEDIKITS */}

          <Pressable
            style={styles.departmentCard}
            onPress={() =>
              openDepartment(
                'Medikits'
              )
            }
          >
            <View
              style={styles.departmentIcon}
            >
              <Text
                style={
                  styles.departmentEmoji
                }
              >
                💊
              </Text>
            </View>

            <Text
              style={styles.departmentTitle}
            >
              Medikits
            </Text>

            <Text
              style={
                styles.departmentSubtitle
              }
            >
              Basic care
            </Text>
          </Pressable>
        </ScrollView>

        {/* ================================================= */}
        {/* NAMMA SAREE BANNER */}
        {/* ================================================= */}

        <Pressable
          style={styles.nammaBanner}
          onPress={openNammaSaree}
        >
          <View
            style={styles.nammaBannerText}
          >
            <View
              style={styles.nammaSmallBadge}
            >
              <Ionicons
                name="sparkles"
                size={12}
                color={C.sareeGold}
              />

              <Text
                style={
                  styles.nammaSmallBadgeText
                }
              >
                FEATURED STORE
              </Text>
            </View>

            <Text
              style={styles.nammaTitle}
            >
              Namma Saree
            </Text>

            <Text
              style={styles.nammaSubtitle}
            >
              Elegant sarees for every occasion
            </Text>

            <Text
              style={
                styles.nammaDescription
              }
            >
              Discover beautiful traditional and
              modern saree collections.
            </Text>

            <View
              style={
                styles.nammaShopButton
              }
            >
              <Text
                style={
                  styles.nammaShopButtonText
                }
              >
                SHOP SAREES
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color={C.sareeRed}
              />
            </View>
          </View>

          <View
            style={
              styles.nammaBannerImageContainer
            }
          >
            <Image
              source={{
                uri: NAMMA_SAREE_BANNER_IMAGE,
              }}
              style={
                styles.nammaBannerImage
              }
              resizeMode="cover"
            />

            <View
              style={
                styles.nammaImageOverlay
              }
            />

            <View
              style={
                styles.nammaImageBadge
              }
            >
              <Text
                style={
                  styles.nammaImageBadgeText
                }
              >
                Namma
              </Text>

              <Text
                style={
                  styles.nammaImageBadgeSubtext
                }
              >
                Saree
              </Text>
            </View>
          </View>
        </Pressable>

        {/* ================================================= */}
        {/* HERO BANNER */}
        {/* ================================================= */}

        <View style={styles.hero}>
          <View
            style={
              styles.heroTextContainer
            }
          >
            <View
              style={styles.heroBadge}
            >
              <View
                style={styles.heroBadgeDot}
              />

              <Text
                style={styles.heroBadgeText}
              >
                FRESHNESS, DAILY
              </Text>
            </View>

            <Text
              style={styles.heroTitle}
            >
              Eat fresh.
            </Text>

            <Text
              style={styles.heroTitleGold}
            >
              Live well.
            </Text>

            <Text
              style={styles.heroDescription}
            >
              Everyday goodness, delivered with care.
            </Text>

            <Pressable
              style={styles.shopButton}
              onPress={() => {
                setSelectedCategory(
                  'All'
                );
                setSearch('');
              }}
            >
              <Text
                style={styles.shopButtonText}
              >
                SHOP NOW
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color={C.greenDark}
              />
            </Pressable>
          </View>

          <View
            style={
              styles.heroImageContainer
            }
          >
            <ImageBackground
              source={{
                uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=85',
              }}
              style={styles.heroImage}
              imageStyle={
                styles.heroImageStyle
              }
            >
              <View
                style={styles.freshPill}
              >
                <Ionicons
                  name="leaf"
                  size={14}
                  color={C.green}
                />

                <Text
                  style={styles.freshPillText}
                >
                  FRESH
                </Text>
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* ================================================= */}
        {/* BENEFITS */}
        {/* ================================================= */}

        <View
          style={styles.benefitsCard}
        >
          <View style={styles.benefit}>
            <Ionicons
              name="leaf-outline"
              size={23}
              color={C.green}
            />

            <Text
              style={styles.benefitText}
            >
              Fresh picks
            </Text>
          </View>

          <View
            style={styles.benefitDivider}
          />

          <View style={styles.benefit}>
            <Ionicons
              name="basket-outline"
              size={23}
              color={C.green}
            />

            <Text
              style={styles.benefitText}
            >
              Daily needs
            </Text>
          </View>

          <View
            style={styles.benefitDivider}
          />

          <View style={styles.benefit}>
            <Ionicons
              name="heart-outline"
              size={23}
              color={C.green}
            />

            <Text
              style={styles.benefitText}
            >
              Made with care
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* CATEGORY HEADING */}
        {/* ================================================= */}

        <View
          style={styles.sectionHeader}
        >
          <View>
            <Text
              style={styles.sectionTitle}
            >
              Shop by category
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              Find your everyday favourites
            </Text>
          </View>

          <Pressable
            onPress={() =>
              goTo('/categories')
            }
            style={styles.seeAllButton}
          >
            <Text
              style={styles.seeAllText}
            >
              See all
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color={C.green}
            />
          </Pressable>
        </View>

        {/* ================================================= */}
        {/* GROCERY CATEGORY FILTER */}
        {/* ================================================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.categoryList
          }
        >
          {CATEGORIES.map(
            (category) => {
              const active =
                selectedCategory ===
                category.id;

              return (
                <Pressable
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    active &&
                      styles.categoryChipActive,
                  ]}
                  onPress={() =>
                    setSelectedCategory(
                      category.id
                    )
                  }
                >
                  <Ionicons
                    name={category.icon}
                    size={18}
                    color={
                      active
                        ? C.surface
                        : C.green
                    }
                  />

                  <Text
                    style={[
                      styles.categoryChipText,
                      active &&
                        styles.categoryChipTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            }
          )}
        </ScrollView>

        {/* ================================================= */}
        {/* PRODUCTS HEADING */}
        {/* ================================================= */}

        <View
          style={styles.sectionHeader}
        >
          <View>
            <Text
              style={styles.sectionTitle}
            >
              {search
                ? 'Search results'
                : selectedCategory ===
                    'All'
                  ? 'Popular this week'
                  : selectedCategory}
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              Fresh choices, just for you
            </Text>
          </View>

          <Pressable
            onPress={() =>
              goTo('/categories')
            }
            style={styles.seeAllButton}
          >
            <Text
              style={styles.seeAllText}
            >
              Explore
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color={C.green}
            />
          </Pressable>
        </View>

        {/* ================================================= */}
        {/* PRODUCT GRID */}
        {/* ================================================= */}

        {loadingProducts ? (
          <View
            style={styles.emptySearch}
          >
            <Ionicons
              name="refresh-outline"
              size={36}
              color={C.green}
            />

            <Text
              style={
                styles.emptySearchTitle
              }
            >
              Loading products...
            </Text>

            <Text
              style={
                styles.emptySearchText
              }
            >
              Getting the latest products from Malnora.
            </Text>
          </View>
        ) : productError ? (
          <View
            style={styles.emptySearch}
          >
            <Ionicons
              name="cloud-offline-outline"
              size={36}
              color={C.muted}
            />

            <Text
              style={
                styles.emptySearchTitle
              }
            >
              Products unavailable
            </Text>

            <Text
              style={
                styles.emptySearchText
              }
            >
              {productError}
            </Text>
          </View>
        ) : filteredProducts.length >
          0 ? (
          <View
            style={styles.productGrid}
          >
            {filteredProducts.map(
              (product) => (
                <View
                  key={product.id}
                  style={
                    styles.productCard
                  }
                >
                  {/* PRODUCT IMAGE */}

                  <Pressable
                    style={
                      styles.productImageContainer
                    }
                    onPress={() =>
                      openProductDetails(
                        product.id
                      )
                    }
                  >
                    {product.image ? (
                      <Image
                        source={{
                          uri: product.image,
                        }}
                        style={
                          styles.productImage
                        }
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={
                          styles.productEmojiContainer
                        }
                      >
                        <Text
                          style={
                            styles.productEmoji
                          }
                        >
                          {
                            product.emoji
                          }
                        </Text>
                      </View>
                    )}

                    {/* PRODUCT TAG */}

                    <View
                      style={
                        styles.productTag
                      }
                    >
                      <Text
                        style={
                          styles.productTagText
                        }
                      >
                        {product.category ===
                        'Fruits'
                          ? 'Fresh'
                          : product.category ===
                              'Vegetables'
                            ? 'Fresh'
                            : product.category ===
                                'Dairy'
                              ? 'Daily essential'
                              : product.category ===
                                  'Bakery'
                                ? 'Freshly baked'
                                : 'Popular'}
                      </Text>
                    </View>

                    {/* ADD BUTTON */}

                    <Pressable
                      style={
                        styles.addButton
                      }
                      onPress={(
                        event
                      ) => {
                        event.stopPropagation();
                        handleAddToCart(
                          product
                        );
                      }}
                    >
                      <Ionicons
                        name="add"
                        size={23}
                        color={C.surface}
                      />
                    </Pressable>
                  </Pressable>

                  {/* PRODUCT INFORMATION */}

                  <Pressable
                    style={
                      styles.productInfo
                    }
                    onPress={() =>
                      openProductDetails(
                        product.id
                      )
                    }
                  >
                    <Text
                      style={
                        styles.productCategory
                      }
                    >
                      {product.category.toUpperCase()}
                    </Text>

                    <Text
                      style={
                        styles.productName
                      }
                      numberOfLines={2}
                    >
                      {product.name}
                    </Text>

                    <View
                      style={
                        styles.ratingRow
                      }
                    >
                      <Ionicons
                        name="star"
                        size={13}
                        color={
                          C.goldDark
                        }
                      />

                      <Text
                        style={
                          styles.ratingText
                        }
                      >
                        {product.rating.toFixed(
                          1
                        )}
                      </Text>

                      <Text
                        style={
                          styles.ratingCountText
                        }
                      >
                        (
                        {
                          product.ratingCount
                        }
                        )
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.productUnit
                      }
                    >
                      {
                        product.quantity
                      }
                    </Text>

                    <View
                      style={
                        styles.productBottom
                      }
                    >
                      <Text
                        style={
                          styles.productPrice
                        }
                      >
                        ₹
                        {
                          product.price
                        }
                      </Text>

                      <Pressable
                        style={
                          styles.smallAddButton
                        }
                        onPress={(
                          event
                        ) => {
                          event.stopPropagation();
                          handleAddToCart(
                            product
                          );
                        }}
                      >
                        <Ionicons
                          name="add"
                          size={19}
                          color={
                            C.green
                          }
                        />
                      </Pressable>
                    </View>
                  </Pressable>
                </View>
              )
            )}
          </View>
        ) : (
          <View
            style={styles.emptySearch}
          >
            <Ionicons
              name="search-outline"
              size={36}
              color={C.muted}
            />

            <Text
              style={
                styles.emptySearchTitle
              }
            >
              No products found
            </Text>

            <Text
              style={
                styles.emptySearchText
              }
            >
              Try another search or category.
            </Text>

            <Pressable
              style={
                styles.clearSearchButton
              }
              onPress={() => {
                setSearch('');
                setSelectedCategory(
                  'All'
                );
              }}
            >
              <Text
                style={
                  styles.clearSearchText
                }
              >
                Clear filters
              </Text>
            </Pressable>
          </View>
        )}

        <View
          style={{ height: 110 }}
        />
      </ScrollView>

      {/* ================================================= */}
      {/* FLOATING CART */}
      {/* ================================================= */}

      {cartCount > 0 && (
        <Pressable
          style={styles.floatingCart}
          onPress={() =>
            goTo('/cart')
          }
        >
          <View
            style={
              styles.cartIconContainer
            }
          >
            <Ionicons
              name="bag-handle-outline"
              size={22}
              color={C.greenDark}
            />

            <View
              style={
                styles.cartCountBadge
              }
            >
              <Text
                style={
                  styles.cartCountText
                }
              >
                {cartCount}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.floatingCartText
            }
          >
            <Text
              style={
                styles.floatingCartTitle
              }
            >
              View your cart
            </Text>

            <Text
              style={
                styles.floatingCartSubtitle
              }
            >
              {cartCount}{' '}
              {cartCount === 1
                ? 'item'
                : 'items'}
            </Text>
          </View>

          <Text
            style={
              styles.floatingCartPrice
            }
          >
            ₹{cartTotal}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={C.greenDark}
          />
        </Pressable>
      )}

      {/* ================================================= */}
      {/* BOTTOM NAVIGATION */}
      {/* ================================================= */}

      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() =>
            goTo('/')
          }
        >
          <Ionicons
            name="home"
            size={23}
            color={C.goldDark}
          />

          <Text
            style={
              styles.navActiveText
            }
          >
            Home
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            goTo('/categories')
          }
        >
          <Ionicons
            name="grid-outline"
            size={23}
            color={C.muted}
          />

          <Text
            style={styles.navText}
          >
            Categories
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            goTo('/my-orders')
          }
        >
          <Ionicons
            name="receipt-outline"
            size={23}
            color={C.muted}
          />

          <Text
            style={styles.navText}
          >
            My Orders
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            goTo('/cart')
          }
        >
          <View>
            <Ionicons
              name="bag-handle-outline"
              size={23}
              color={C.muted}
            />

            {cartCount > 0 && (
              <View
                style={
                  styles.navCartBadge
                }
              >
                <Text
                  style={
                    styles.navCartBadgeText
                  }
                >
                  {cartCount}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={styles.navText}
          >
            Cart
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            goTo('/profile')
          }
        >
          <Ionicons
            name="person-outline"
            size={23}
            color={C.muted}
          />

          <Text
            style={styles.navText}
          >
            Profile
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },

  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 20,
  },

  // ====================================================
  // HEADER
  // ====================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandName: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    color: C.green,
  },

  brandTagline: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: C.muted,
    marginTop: 1,
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ====================================================
  // ADDRESS
  // ====================================================

  addressCard: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    backgroundColor: C.surfaceLight,
    borderWidth: 1,
    borderColor: '#D7E3D5',
    marginBottom: 16,
  },

  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#D8E6D6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addressText: {
    flex: 1,
    marginLeft: 12,
  },

  addressLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: C.muted,
    marginBottom: 5,
  },

  addressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.green,
  },

  // ====================================================
  // SEARCH
  // ====================================================

  searchContainer: {
    height: 56,
    borderRadius: 17,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 11,
    marginBottom: 20,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: C.text,
  },

  // ====================================================
  // SECTION HEADERS
  // ====================================================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: C.green,
    letterSpacing: -0.4,
  },

  sectionSubtitle: {
    color: C.muted,
    fontSize: 12,
    marginTop: 5,
  },

  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 8,
    paddingLeft: 8,
  },

  seeAllText: {
    fontSize: 13,
    fontWeight: '800',
    color: C.green,
  },

  // ====================================================
  // DEPARTMENTS
  // ====================================================

  departmentScroll: {
    paddingBottom: 24,
  },

  departmentCard: {
    width: 145,
    minHeight: 150,
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginRight: 12,
  },

  departmentIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: C.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  departmentEmoji: {
    fontSize: 30,
  },

  departmentTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: C.greenDark,
  },

  departmentSubtitle: {
    fontSize: 11,
    color: C.muted,
    marginTop: 4,
  },

  // ====================================================
  // NAMMA SAREE
  // ====================================================

  nammaBanner: {
    minHeight: 220,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: C.sareeRed,
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#65121D',
  },

  nammaBannerText: {
    flex: 1.05,
    padding: 20,
    justifyContent: 'center',
    minWidth: 0,
    zIndex: 2,
  },

  nammaSmallBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#5F101B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },

  nammaSmallBadgeText: {
    color: C.sareeGold,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  nammaTitle: {
    color: C.sareeCream,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  nammaSubtitle: {
    color: '#F5DDAF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5,
    lineHeight: 18,
  },

  nammaDescription: {
    color: '#F8EBDD',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
    marginBottom: 14,
    maxWidth: 230,
  },

  nammaShopButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: C.sareeGold,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },

  nammaShopButtonText: {
    color: C.sareeRed,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  nammaBannerImageContainer: {
    flex: 0.85,
    minWidth: 0,
    position: 'relative',
    overflow: 'hidden',
  },

  nammaBannerImage: {
    width: '100%',
    height: '100%',
  },

  nammaImageOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '45%',
    backgroundColor:
      'rgba(125,24,37,0.38)',
  },

  nammaImageBadge: {
    position: 'absolute',
    right: 13,
    bottom: 13,
    backgroundColor:
      'rgba(255,255,255,0.94)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 13,
    alignItems: 'center',
  },

  nammaImageBadgeText: {
    color: C.sareeRed,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  nammaImageBadgeSubtext: {
    color: C.sareeGold,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 1,
  },

  // ====================================================
  // HERO
  // ====================================================

  hero: {
    minHeight: 260,
    flexDirection: 'row',
    backgroundColor: C.green,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 20,
    padding: 20,
    gap: 18,
    alignItems: 'center',
  },

  heroTextContainer: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },

  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#28624E',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 17,
  },

  heroBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.gold,
  },

  heroBadgeText: {
    color: '#F5F5E9',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  heroTitle: {
    color: C.surface,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },

  heroTitleGold: {
    color: C.gold,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: -2,
  },

  heroDescription: {
    color: '#E5EEE4',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 17,
    maxWidth: 260,
  },

  shopButton: {
    alignSelf: 'flex-start',
    minHeight: 43,
    borderRadius: 12,
    backgroundColor: C.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 13,
    paddingHorizontal: 16,
  },

  shopButtonText: {
    color: C.greenDark,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  heroImageContainer: {
    flex: 1.05,
    height: 205,
    minWidth: 0,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#477966',
  },

  heroImage: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  heroImageStyle: {
    borderRadius: 100,
  },

  freshPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.surface,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },

  freshPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: C.green,
  },

  // ====================================================
  // BENEFITS
  // ====================================================

  benefitsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: C.surface,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 17,
    marginBottom: 30,
  },

  benefit: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  benefitText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
  },

  benefitDivider: {
    width: 1,
    height: 35,
    backgroundColor: C.border,
  },

  // ====================================================
  // CATEGORY CHIPS
  // ====================================================

  categoryList: {
    gap: 10,
    paddingBottom: 28,
  },

  categoryChip: {
    height: 43,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },

  categoryChipActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },

  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.green,
  },

  categoryChipTextActive: {
    color: C.surface,
  },

  // ====================================================
  // PRODUCT GRID
  // ====================================================

  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },

  productCard: {
    width: '48.5%',
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: 2,
  },

  productImageContainer: {
    height: 165,
    backgroundColor: C.greenSoft,
    position: 'relative',
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  productEmojiContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  productEmoji: {
    fontSize: 58,
  },

  productTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: C.surface,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  productTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: C.green,
  },

  addButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },

  productInfo: {
    padding: 13,
  },

  productCategory: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: C.muted,
    marginBottom: 6,
  },

  productName: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
    lineHeight: 19,
    minHeight: 38,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    gap: 4,
  },

  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: C.text,
  },

  ratingCountText: {
    fontSize: 10,
    color: C.muted,
  },

  productUnit: {
    fontSize: 11,
    color: C.muted,
    marginTop: 5,
  },

  productBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  productPrice: {
    fontSize: 17,
    fontWeight: '900',
    color: C.green,
  },

  smallAddButton: {
    width: 33,
    height: 33,
    borderRadius: 11,
    backgroundColor: C.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ====================================================
  // EMPTY SEARCH
  // ====================================================

  emptySearch: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 45,
    paddingHorizontal: 20,
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },

  emptySearchTitle: {
    color: C.green,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
  },

  emptySearchText: {
    color: C.muted,
    fontSize: 13,
    marginTop: 7,
    textAlign: 'center',
  },

  clearSearchButton: {
    backgroundColor: C.green,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 17,
  },

  clearSearchText: {
    color: C.surface,
    fontSize: 12,
    fontWeight: '800',
  },

  // ====================================================
  // FLOATING CART
  // ====================================================

  floatingCart: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 91,
    minHeight: 66,
    borderRadius: 18,
    backgroundColor: C.gold,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  cartIconContainer: {
    position: 'relative',
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: '#F6D89E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cartCountBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  cartCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: C.surface,
  },

  floatingCartText: {
    flex: 1,
  },

  floatingCartTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: C.greenDark,
  },

  floatingCartSubtitle: {
    fontSize: 11,
    color: '#4C634F',
    marginTop: 3,
  },

  floatingCartPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: C.greenDark,
  },

  // ====================================================
  // BOTTOM NAVIGATION
  // ====================================================

  bottomNav: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 6,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: '100%',
  },

  navText: {
    fontSize: 10,
    color: C.muted,
    fontWeight: '500',
  },

  navActiveText: {
    fontSize: 10,
    color: C.goldDark,
    fontWeight: '900',
  },

  navCartBadge: {
    position: 'absolute',
    right: -9,
    top: -6,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  navCartBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: C.greenDark,
  },
});