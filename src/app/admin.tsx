import {
    Order,
    OrderStatus,
    useOrders,
} from '@/context/OrderContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
const MUTED = '#827568';
const GREEN = '#426B48';

const PRODUCT_STORAGE_KEY = '@malnora_admin_products';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  emoji: string;
};

type Tab = 'Dashboard' | 'Products' | 'Orders';

const STATUSES: OrderStatus[] = [
  'Order Placed',
  'Order Confirmed',
  'Out for Delivery',
  'Delivered',
];

const EMPTY_PRODUCT: Product = {
  id: '',
  name: '',
  price: 0,
  category: 'Fruits',
  stock: 0,
  emoji: '🛒',
};

function money(value: number) {
  return `₹${value.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;
}

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case 'Delivered':
      return GREEN;

    case 'Out for Delivery':
      return '#B7791F';

    case 'Order Confirmed':
      return '#3867A6';

    default:
      return MAROON;
  }
}

function getNextStatus(status: OrderStatus): OrderStatus | null {
  const index = STATUSES.indexOf(status);
  return STATUSES[index + 1] ?? null;
}

export default function AdminScreen() {
  const router = useRouter();

  const {
    orders,
    loading: ordersLoading,
    updateOrderStatus,
  } = useOrders();

  const [tab, setTab] = useState<Tab>('Dashboard');

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Product>(EMPTY_PRODUCT);

  const [showForm, setShowForm] = useState(false);

  // Used by both Dashboard search and Products search.
  const [search, setSearch] = useState('');

  // Load products saved by admin.
  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const saved = await AsyncStorage.getItem(
          PRODUCT_STORAGE_KEY,
        );

        if (saved && mounted) {
          const parsed = JSON.parse(saved);

          if (Array.isArray(parsed)) {
            setProducts(parsed);
          }
        }
      } catch (error) {
        console.error(
          'Failed to load admin products:',
          error,
        );
      } finally {
        if (mounted) {
          setProductsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  async function saveProducts(
    nextProducts: Product[],
  ) {
    setProducts(nextProducts);

    try {
      await AsyncStorage.setItem(
        PRODUCT_STORAGE_KEY,
        JSON.stringify(nextProducts),
      );
    } catch (error) {
      console.error(
        'Failed to save admin products:',
        error,
      );

      Alert.alert(
        'Save failed',
        'The product changes could not be saved.',
      );
    }
  }

  const totalRevenue = useMemo(
    () =>
      orders
        .filter(
          (order) => order.status === 'Delivered',
        )
        .reduce(
          (sum, order) => sum + order.total,
          0,
        ),
    [orders],
  );

  const pendingOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status !== 'Delivered',
      ).length,
    [orders],
  );

  const totalUnits = useMemo(
    () =>
      products.reduce(
        (sum, product) => sum + product.stock,
        0,
      ),
    [products],
  );

  const lowStock = useMemo(
    () =>
      products.filter(
        (product) => product.stock <= 5,
      ).length,
    [products],
  );

  /*
   * Product search
   *
   * Searches:
   * - Product name
   * - Product category
   */
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(query) ||
        product.category
          .toLowerCase()
          .includes(query),
    );
  }, [products, search]);

  function startAddProduct() {
    setEditingId(null);

    setForm({
      ...EMPTY_PRODUCT,
      id: `${Date.now()}`,
    });

    setShowForm(true);
  }

  function startEditProduct(
    product: Product,
  ) {
    setEditingId(product.id);
    setForm({ ...product });
    setShowForm(true);
  }

  function updateForm<K extends keyof Product>(
    key: K,
    value: Product[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function submitProduct() {
    const name = form.name.trim();

    const price = Number(form.price);

    const stock = Number(form.stock);

    if (!name) {
      Alert.alert(
        'Product name required',
        'Enter a product name.',
      );
      return;
    }

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      Alert.alert(
        'Invalid price',
        'Enter a price greater than zero.',
      );
      return;
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      Alert.alert(
        'Invalid stock',
        'Enter stock as 0 or more.',
      );
      return;
    }

    const cleanProduct: Product = {
      ...form,

      id:
        editingId ??
        form.id ??
        `${Date.now()}`,

      name,

      price,

      stock,

      category:
        form.category.trim() || 'Other',

      emoji:
        form.emoji.trim() || '🛒',
    };

    let nextProducts: Product[];

    if (editingId) {
      nextProducts = products.map(
        (product) =>
          product.id === editingId
            ? cleanProduct
            : product,
      );
    } else {
      nextProducts = [
        cleanProduct,
        ...products,
      ];
    }

    await saveProducts(nextProducts);

    setShowForm(false);

    setEditingId(null);

    setForm(EMPTY_PRODUCT);
  }

  function deleteProduct(product: Product) {
    const performDelete = async () => {
      const nextProducts =
        products.filter(
          (item) =>
            item.id !== product.id,
        );

      await saveProducts(nextProducts);
    };

    if (
      typeof window !== 'undefined' &&
      'confirm' in window
    ) {
      const confirmed =
        window.confirm(
          `Delete "${product.name}"?`,
        );

      if (confirmed) {
        void performDelete();
      }

      return;
    }

    Alert.alert(
      'Delete product',
      `Are you sure you want to delete ${product.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            void performDelete(),
        },
      ],
    );
  }

  async function advanceOrder(
    order: Order,
  ) {
    const nextStatus =
      getNextStatus(order.status);

    if (!nextStatus) {
      return;
    }

    try {
      await updateOrderStatus(
        String(order.orderId),
        nextStatus,
      );
    } catch (error) {
      console.error(
        'Failed to update order:',
        error,
      );

      Alert.alert(
        'Update failed',
        'Could not update this order status.',
      );
    }
  }

  function renderStat(
    label: string,
    value: string,
    emoji: string,
    description: string,
  ) {
    return (
      <View style={styles.statCard}>
        <View style={styles.statTop}>
          <Text style={styles.statEmoji}>
            {emoji}
          </Text>

          <Text
            style={
              styles.statDescription
            }
          >
            {description}
          </Text>
        </View>

        <Text style={styles.statValue}>
          {value}
        </Text>

        <Text style={styles.statLabel}>
          {label}
        </Text>
      </View>
    );
  }

  /*
   * Dashboard
   */
  function renderDashboard() {
    return (
      <>
        <View style={styles.welcomeCard}>
          <Text
            style={styles.welcomeEyebrow}
          >
            MALNORA CONTROL PANEL
          </Text>

          <Text
            style={styles.welcomeTitle}
          >
            Good to see you, Admin 👋
          </Text>

          <Text
            style={styles.welcomeText}
          >
            Manage your grocery store from
            one place.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Store Overview
        </Text>

        <View style={styles.statsGrid}>
          {renderStat(
            'Total Orders',
            String(orders.length),
            '🧾',
            'All time',
          )}

          {renderStat(
            'Delivered Revenue',
            money(totalRevenue),
            '💰',
            'Delivered orders',
          )}

          {renderStat(
            'Pending Orders',
            String(pendingOrders),
            '📦',
            'Needs attention',
          )}

          {renderStat(
            'Products',
            String(products.length),
            '🥬',
            `${totalUnits} units in stock`,
          )}
        </View>

        {/* Inventory Alert */}
        <View style={styles.noticeCard}>
          <Text
            style={styles.noticeTitle}
          >
            Inventory Alert
          </Text>

          <Text
            style={styles.noticeText}
          >
            {lowStock === 0
              ? 'No low-stock products in your admin catalogue.'
              : `${lowStock} product(s) have 5 or fewer units remaining.`}
          </Text>

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() =>
              setTab('Products')
            }
          >
            <Text
              style={
                styles.outlineButtonText
              }
            >
              Manage Products
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard Product Search */}
        <View style={styles.dashboardSearchHeader}>
          <View style={{ flex: 1 }}>
            <Text
              style={styles.sectionTitle}
            >
              Search Products
            </Text>

            <Text
              style={styles.mutedText}
            >
              Find products by name or
              category
            </Text>
          </View>

          {search.trim().length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
            >
              <Text
                style={styles.clearSearchText}
              >
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View
          style={styles.dashboardSearchBox}
        >
          <Text
            style={styles.searchIcon}
          >
            🔍
          </Text>

          <TextInput
            style={
              styles.dashboardSearchInput
            }
            value={search}
            onChangeText={setSearch}
            placeholder="Search products..."
            placeholderTextColor="#A99B8D"
            returnKeyType="search"
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                setSearch('')
              }
              style={
                styles.searchClearButton
              }
            >
              <Text
                style={
                  styles.searchClearText
                }
              >
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search results */}
        {search.trim().length > 0 && (
          <View
            style={
              styles.searchResultsCard
            }
          >
            {productsLoading ? (
              <ActivityIndicator
                color={MAROON}
                style={{
                  marginVertical: 25,
                }}
              />
            ) : filteredProducts.length ===
              0 ? (
              <View
                style={styles.searchEmpty}
              >
                <Text
                  style={
                    styles.emptyEmoji
                  }
                >
                  🔎
                </Text>

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  No products found
                </Text>

                <Text
                  style={
                    styles.emptyDescription
                  }
                >
                  Try another product name
                  or category.
                </Text>
              </View>
            ) : (
              <>
                <View
                  style={
                    styles.searchResultHeader
                  }
                >
                  <Text
                    style={
                      styles.searchResultTitle
                    }
                  >
                    {filteredProducts.length}{' '}
                    {filteredProducts.length ===
                    1
                      ? 'product'
                      : 'products'}{' '}
                    found
                  </Text>
                </View>

                {filteredProducts
                  .slice(0, 5)
                  .map((product) => (
                    <View
                      key={product.id}
                      style={
                        styles.searchResultItem
                      }
                    >
                      <View
                        style={
                          styles.productEmojiBox
                        }
                      >
                        <Text
                          style={
                            styles.productEmoji
                          }
                        >
                          {product.emoji}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.productInfo
                        }
                      >
                        <Text
                          style={
                            styles.productName
                          }
                        >
                          {product.name}
                        </Text>

                        <Text
                          style={
                            styles.mutedText
                          }
                        >
                          {product.category}
                        </Text>

                        <Text
                          style={
                            styles.productPrice
                          }
                        >
                          {money(
                            product.price,
                          )}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.searchStockBox
                        }
                      >
                        <Text
                          style={[
                            styles.stockText,
                            product.stock <=
                              5 &&
                              styles.lowStockText,
                          ]}
                        >
                          {product.stock ===
                          0
                            ? 'Out of stock'
                            : `${product.stock} stock`}
                        </Text>
                      </View>
                    </View>
                  ))}

                {filteredProducts.length >
                  5 && (
                  <TouchableOpacity
                    style={
                      styles.viewProductsButton
                    }
                    onPress={() => {
                      setTab('Products');
                    }}
                  >
                    <Text
                      style={
                        styles.viewProductsButtonText
                      }
                    >
                      View all{' '}
                      {
                        filteredProducts.length
                      }{' '}
                      products →
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* Recent Orders */}
        <View
          style={styles.sectionHeader}
        >
          <Text
            style={styles.sectionTitle}
          >
            Recent Orders
          </Text>

          <TouchableOpacity
            onPress={() => setTab('Orders')}
          >
            <Text
              style={styles.linkText}
            >
              View all ›
            </Text>
          </TouchableOpacity>
        </View>

        {orders.length === 0 ? (
          <EmptyState
            emoji="🛍️"
            title="No orders yet"
            description="Customer orders will appear here."
          />
        ) : (
          orders
            .slice(0, 5)
            .map(renderOrderCard)
        )}
      </>
    );
  }

  /*
   * Product form
   */
  function renderProductForm() {
    if (!showForm) {
      return null;
    }

    return (
      <View style={styles.formCard}>
        <Text
          style={styles.sectionTitle}
        >
          {editingId
            ? 'Edit Product'
            : 'Add New Product'}
        </Text>

        <Text
          style={styles.inputLabel}
        >
          Product name *
        </Text>

        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(value) =>
            updateForm('name', value)
          }
          placeholder="e.g. Fresh Apples"
          placeholderTextColor="#A99B8D"
        />

        <View style={styles.formRow}>
          <View
            style={styles.formColumn}
          >
            <Text
              style={styles.inputLabel}
            >
              Price (₹) *
            </Text>

            <TextInput
              style={styles.input}
              value={String(
                form.price || '',
              )}
              onChangeText={(value) =>
                updateForm(
                  'price',
                  Number(value) || 0,
                )
              }
              keyboardType="decimal-pad"
              placeholder="120"
              placeholderTextColor="#A99B8D"
            />
          </View>

          <View
            style={styles.formColumn}
          >
            <Text
              style={styles.inputLabel}
            >
              Stock *
            </Text>

            <TextInput
              style={styles.input}
              value={String(form.stock)}
              onChangeText={(value) =>
                updateForm(
                  'stock',
                  Number(value) || 0,
                )
              }
              keyboardType="number-pad"
              placeholder="20"
              placeholderTextColor="#A99B8D"
            />
          </View>
        </View>

        <Text
          style={styles.inputLabel}
        >
          Category
        </Text>

        <TextInput
          style={styles.input}
          value={form.category}
          onChangeText={(value) =>
            updateForm(
              'category',
              value,
            )
          }
          placeholder="Fruits, Vegetables, Dairy..."
          placeholderTextColor="#A99B8D"
        />

        <Text
          style={styles.inputLabel}
        >
          Emoji
        </Text>

        <TextInput
          style={styles.input}
          value={form.emoji}
          onChangeText={(value) =>
            updateForm(
              'emoji',
              value,
            )
          }
          placeholder="🥭"
          placeholderTextColor="#A99B8D"
        />

        <View
          style={styles.formActions}
        >
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setShowForm(false);
              setEditingId(null);
            }}
          >
            <Text
              style={
                styles.cancelButtonText
              }
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              void submitProduct()
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              {editingId
                ? 'Save Changes'
                : 'Add Product'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /*
   * Products tab
   */
  function renderProducts() {
    return (
      <>
        <View
          style={styles.sectionHeader}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={styles.sectionTitle}
            >
              Products
            </Text>

            <Text
              style={styles.mutedText}
            >
              {products.length} products in
              admin catalogue
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.primaryButtonSmall
            }
            onPress={startAddProduct}
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              + Add
            </Text>
          </TouchableOpacity>
        </View>

        {renderProductForm()}

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search products or categories..."
          placeholderTextColor="#A99B8D"
        />

        {productsLoading ? (
          <ActivityIndicator
            color={MAROON}
            style={{ margin: 30 }}
          />
        ) : filteredProducts.length ===
          0 ? (
          <EmptyState
            emoji="🥬"
            title={
              search
                ? 'No matching products'
                : 'No products yet'
            }
            description={
              search
                ? 'Try another product name or category.'
                : 'Tap + Add to create your first admin product.'
            }
          />
        ) : (
          filteredProducts.map(
            (product) => (
              <View
                key={product.id}
                style={
                  styles.productCard
                }
              >
                <View
                  style={
                    styles.productEmojiBox
                  }
                >
                  <Text
                    style={
                      styles.productEmoji
                    }
                  >
                    {product.emoji}
                  </Text>
                </View>

                <View
                  style={
                    styles.productInfo
                  }
                >
                  <Text
                    style={
                      styles.productName
                    }
                  >
                    {product.name}
                  </Text>

                  <Text
                    style={
                      styles.mutedText
                    }
                  >
                    {product.category}
                  </Text>

                  <Text
                    style={
                      styles.productPrice
                    }
                  >
                    {money(product.price)}
                  </Text>

                  <Text
                    style={[
                      styles.stockText,
                      product.stock <=
                        5 &&
                        styles.lowStockText,
                    ]}
                  >
                    {product.stock ===
                    0
                      ? 'Out of stock'
                      : `${product.stock} in stock`}
                  </Text>
                </View>

                <View
                  style={
                    styles.productActions
                  }
                >
                  <TouchableOpacity
                    style={
                      styles.editButton
                    }
                    onPress={() =>
                      startEditProduct(
                        product,
                      )
                    }
                  >
                    <Text
                      style={
                        styles.editButtonText
                      }
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={
                      styles.deleteButton
                    }
                    onPress={() =>
                      deleteProduct(
                        product,
                      )
                    }
                  >
                    <Text
                      style={
                        styles.deleteButtonText
                      }
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ),
          )
        )}
      </>
    );
  }

  /*
   * Order card
   */
  function renderOrderCard(
    order: Order,
  ) {
    const nextStatus =
      getNextStatus(order.status);

    return (
      <View
        key={String(order.orderId)}
        style={styles.orderCard}
      >
        <View style={styles.orderTop}>
          <View style={{ flex: 1 }}>
            <Text
              style={styles.orderId}
            >
              Order #
              {String(order.orderId)}
            </Text>

            <Text
              style={styles.mutedText}
            >
              {order.name}
            </Text>

            <Text
              style={styles.mutedText}
            >
              {order.phone}
            </Text>
          </View>

          <Text
            style={styles.orderTotal}
          >
            {money(order.total)}
          </Text>
        </View>

        <View style={styles.orderMeta}>
          <Text
            style={[
              styles.statusBadge,
              {
                color:
                  getStatusColor(
                    order.status,
                  ),
                backgroundColor: `${getStatusColor(
                  order.status,
                )}15`,
              },
            ]}
          >
            {order.status}
          </Text>

          <Text
            style={styles.paymentText}
          >
            {order.payment}
          </Text>
        </View>

        <Text
          style={styles.addressText}
          numberOfLines={2}
        >
          📍 {order.address}
        </Text>

        <Text
          style={styles.itemSummary}
        >
          {order.items
            .map(
              (item) =>
                `${item.name} × ${item.quantity}`,
            )
            .join(', ')}
        </Text>

        <View
          style={styles.orderActions}
        >
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() =>
              router.push({
                pathname:
                  '/order-tracking',
                params: {
                  orderId:
                    String(
                      order.orderId,
                    ),
                },
              })
            }
          >
            <Text
              style={
                styles.outlineButtonText
              }
            >
              Track
            </Text>
          </TouchableOpacity>

          {nextStatus && (
            <TouchableOpacity
              style={
                styles.primaryButton
              }
              onPress={() =>
                void advanceOrder(
                  order,
                )
              }
            >
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Mark: {nextStatus}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  /*
   * Orders tab
   */
  function renderOrders() {
    return (
      <>
        <View
          style={styles.sectionHeader}
        >
          <View>
            <Text
              style={styles.sectionTitle}
            >
              Customer Orders
            </Text>

            <Text
              style={styles.mutedText}
            >
              {orders.length} total orders
            </Text>
          </View>
        </View>

        {ordersLoading ? (
          <ActivityIndicator
            color={MAROON}
            style={{ margin: 30 }}
          />
        ) : orders.length === 0 ? (
          <EmptyState
            emoji="📦"
            title="No orders yet"
            description="New customer orders will appear here."
          />
        ) : (
          orders.map(renderOrderCard)
        )}
      </>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandMark}>
          <Text
            style={styles.brandMarkText}
          >
            M
          </Text>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.brandName}>
            MALNORA
          </Text>

          <Text
            style={styles.headerSubtitle}
          >
            Admin Dashboard
          </Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() =>
            router.replace('/')
          }
        >
          <Text
            style={styles.closeButtonText}
          >
            ✕
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(
          [
            'Dashboard',
            'Products',
            'Orders',
          ] as Tab[]
        ).map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.tab,
              tab === item &&
                styles.activeTab,
            ]}
            onPress={() =>
              setTab(item)
            }
          >
            <Text
              style={[
                styles.tabText,
                tab === item &&
                  styles.activeTabText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        {tab === 'Dashboard' &&
          renderDashboard()}

        {tab === 'Products' &&
          renderProducts()}

        {tab === 'Orders' &&
          renderOrders()}

        <Text style={styles.footer}>
          Malnora Admin • Local
          development version
        </Text>
      </ScrollView>
    </View>
  );
}

function EmptyState({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.emptyCard}>
      <Text
        style={styles.emptyEmoji}
      >
        {emoji}
      </Text>

      <Text
        style={styles.emptyTitle}
      >
        {title}
      </Text>

      <Text
        style={styles.emptyDescription}
      >
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: DARK_MAROON,
  },

  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandMarkText: {
    color: DARK_MAROON,
    fontSize: 25,
    fontWeight: '900',
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  brandName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 2,
  },

  headerSubtitle: {
    color: '#E7D8C9',
    fontSize: 12,
    marginTop: 3,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF20',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE3D7',
  },

  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },

  activeTab: {
    borderBottomColor: MAROON,
  },

  tabText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '700',
  },

  activeTabText: {
    color: MAROON,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  welcomeCard: {
    backgroundColor: MAROON,
    borderRadius: 22,
    padding: 22,
    marginBottom: 22,
  },

  welcomeEyebrow: {
    color: '#E8CDA8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 12,
  },

  welcomeText: {
    color: '#F0DFD4',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },

  sectionTitle: {
    color: MAROON,
    fontSize: 18,
    fontWeight: '900',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
    marginBottom: 18,
  },

  statCard: {
    width: '48%',
    flexGrow: 1,
    minWidth: 135,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },

  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statEmoji: {
    fontSize: 23,
  },

  statDescription: {
    color: MUTED,
    fontSize: 9,
    flexShrink: 1,
    textAlign: 'right',
  },

  statValue: {
    color: MAROON,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 14,
  },

  statLabel: {
    color: MUTED,
    fontSize: 12,
    marginTop: 5,
  },

  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E9D9C4',
    padding: 18,
    marginBottom: 24,
  },

  noticeTitle: {
    color: MAROON,
    fontSize: 16,
    fontWeight: '900',
  },

  noticeText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 14,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
    marginTop: 4,
  },

  dashboardSearchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
    marginTop: 2,
  },

  clearSearchText: {
    color: MAROON,
    fontSize: 12,
    fontWeight: '800',
  },

  dashboardSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7DCCF',
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  searchIcon: {
    fontSize: 17,
    marginRight: 8,
  },

  dashboardSearchInput: {
    flex: 1,
    paddingVertical: 13,
    color: '#33251F',
    fontSize: 14,
    outlineStyle: 'none',
  } as any,

  searchClearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2E8DE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchClearText: {
    color: MAROON,
    fontSize: 12,
    fontWeight: '900',
  },

  searchResultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    padding: 14,
    marginBottom: 24,
  },

  searchResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },

  searchResultTitle: {
    color: MAROON,
    fontSize: 14,
    fontWeight: '900',
  },

  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E8DE',
  },

  searchStockBox: {
    alignItems: 'flex-end',
  },

  searchEmpty: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  viewProductsButton: {
    marginTop: 14,
    backgroundColor: MAROON,
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: 'center',
  },

  viewProductsButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  linkText: {
    color: MAROON,
    fontSize: 13,
    fontWeight: '800',
  },

  mutedText: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8D9C8',
  },

  inputLabel: {
    color: '#51443C',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 13,
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor: '#E7DCCF',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: '#33251F',
    backgroundColor: '#FFFEFC',
    fontSize: 14,
  },

  formRow: {
    flexDirection: 'row',
    gap: 12,
  },

  formColumn: {
    flex: 1,
  },

  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },

  cancelButton: {
    borderWidth: 1,
    borderColor: '#D9CBBE',
    borderRadius: 12,
    paddingHorizontal: 17,
    paddingVertical: 12,
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: MUTED,
    fontWeight: '700',
  },

  primaryButton: {
    backgroundColor: MAROON,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonSmall: {
    backgroundColor: MAROON,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },

  outlineButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: MAROON,
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  outlineButtonText: {
    color: MAROON,
    fontSize: 12,
    fontWeight: '800',
  },

  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7DCCF',
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 14,
    color: '#33251F',
  },

  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 13,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },

  productEmojiBox: {
    width: 53,
    height: 53,
    borderRadius: 15,
    backgroundColor: CREAM,
    alignItems: 'center',
    justifyContent: 'center',
  },

  productEmoji: {
    fontSize: 27,
  },

  productInfo: {
    flex: 1,
    minWidth: 0,
  },

  productName: {
    color: '#33251F',
    fontSize: 13,
    fontWeight: '800',
  },

  productPrice: {
    color: MAROON,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 5,
  },

  stockText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },

  lowStockText: {
    color: '#B7791F',
  },

  productActions: {
    gap: 7,
  },

  editButton: {
    backgroundColor: '#F3E9D9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },

  editButtonText: {
    color: MAROON,
    fontSize: 11,
    fontWeight: '800',
  },

  deleteButton: {
    backgroundColor: '#FBEAEA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },

  deleteButtonText: {
    color: '#A12D2D',
    fontSize: 11,
    fontWeight: '800',
  },

  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },

  orderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },

  orderId: {
    color: MAROON,
    fontSize: 14,
    fontWeight: '900',
  },

  orderTotal: {
    color: MAROON,
    fontSize: 15,
    fontWeight: '900',
  },

  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 13,
  },

  statusBadge: {
    overflow: 'hidden',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 11,
    fontWeight: '800',
  },

  paymentText: {
    color: MUTED,
    fontSize: 11,
  },

  addressText: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },

  itemSummary: {
    color: '#51443C',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },

  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 15,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },

  emptyEmoji: {
    fontSize: 38,
    marginBottom: 12,
  },

  emptyTitle: {
    color: MAROON,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
  },

  footer: {
    color: '#A99B8D',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 20,
  },
});