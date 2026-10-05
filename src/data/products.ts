export type Product = {
  id: string;
  name: string;
  category: string;
  department: string;

  price: number;
  oldPrice?: number;

  quantity: string;
  rating: number;
  ratingCount: number;

  emoji: string;
  image?: string;

  quality: string;
  freshness?: string;
  origin?: string;
  availability: string;

  // Catalogue enhancements
  badge?: string;
  stock?: number;

  description: string;
};

export const PRODUCTS: Product[] = [
  // =====================================================
  // GROCERIES
  // =====================================================

  {
    id: 'grocery-apple',
    name: 'Fresh Red Apples',
    category: 'Fruits',
    department: 'Groceries',
    price: 149,
    oldPrice: 179,
    quantity: '1 kg',
    rating: 4.8,
    ratingCount: 128,
    emoji: '🍎',
    image:
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=900&q=80',
    quality: 'Premium',
    freshness: 'Farm Fresh',
    origin: 'Fresh Produce',
    availability: 'In Stock',
    badge: 'Best Seller',
    stock: 24,
    description:
      'Fresh and naturally sweet red apples selected for everyday snacking, breakfast and healthy recipes.',
  },

  {
    id: 'grocery-banana',
    name: 'Organic Bananas',
    category: 'Fruits',
    department: 'Groceries',
    price: 59,
    oldPrice: 69,
    quantity: '1 dozen',
    rating: 4.7,
    ratingCount: 96,
    emoji: '🍌',
    image:
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80',
    quality: 'Premium',
    freshness: 'Naturally Fresh',
    origin: 'Fresh Produce',
    availability: 'In Stock',
    badge: 'Popular',
    stock: 31,
    description:
      'Naturally sweet bananas that are perfect for breakfast, smoothies, snacks and desserts.',
  },

  {
    id: 'grocery-broccoli',
    name: 'Fresh Broccoli',
    category: 'Vegetables',
    department: 'Groceries',
    price: 89,
    oldPrice: 109,
    quantity: '500 g',
    rating: 4.6,
    ratingCount: 74,
    emoji: '🥦',
    image:
      'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=900&q=80',
    quality: 'Premium',
    freshness: 'Farm Fresh',
    origin: 'Fresh Produce',
    availability: 'In Stock',
    badge: 'Farm Fresh',
    stock: 18,
    description:
      'Fresh green broccoli carefully selected for your everyday cooking and healthy meals.',
  },

  {
    id: 'grocery-tomato',
    name: 'Farm Fresh Tomatoes',
    category: 'Vegetables',
    department: 'Groceries',
    price: 49,
    oldPrice: 59,
    quantity: '1 kg',
    rating: 4.7,
    ratingCount: 112,
    emoji: '🍅',
    image:
      'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80',
    quality: 'Premium',
    freshness: 'Farm Fresh',
    origin: 'Fresh Produce',
    availability: 'In Stock',
    badge: 'Fresh Today',
    stock: 35,
    description:
      'Farm-fresh tomatoes with a naturally rich taste, ideal for curries, salads and everyday cooking.',
  },

  {
    id: 'grocery-milk',
    name: 'Fresh Milk',
    category: 'Dairy',
    department: 'Groceries',
    price: 34,
    oldPrice: 38,
    quantity: '500 ml',
    rating: 4.8,
    ratingCount: 145,
    emoji: '🥛',
    image:
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=900&q=80',
    quality: 'Full Cream',
    freshness: 'Fresh Daily',
    origin: 'Dairy Farm',
    availability: 'In Stock',
    badge: 'Fresh Daily',
    stock: 40,
    description:
      'Fresh everyday milk suitable for tea, coffee, breakfast, cooking and drinking.',
  },

  {
    id: 'grocery-bread',
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    department: 'Groceries',
    price: 55,
    oldPrice: 65,
    quantity: '400 g',
    rating: 4.6,
    ratingCount: 83,
    emoji: '🍞',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
    quality: 'Whole Wheat',
    freshness: 'Freshly Baked',
    origin: 'Local Bakery',
    availability: 'In Stock',
    badge: 'Fresh Bake',
    stock: 22,
    description:
      'Soft whole wheat bread that makes a convenient choice for breakfast, sandwiches and snacks.',
  },

  {
    id: 'grocery-chips',
    name: 'Classic Potato Chips',
    category: 'Snacks',
    department: 'Groceries',
    price: 30,
    oldPrice: 35,
    quantity: '100 g',
    rating: 4.5,
    ratingCount: 67,
    emoji: '🥔',
    quality: 'Classic',
    freshness: 'Fresh Pack',
    origin: 'Packaged Food',
    availability: 'In Stock',
    badge: 'Great Value',
    stock: 45,
    description:
      'Crispy and crunchy potato chips perfect for quick snacks and sharing.',
  },

  {
    id: 'grocery-rice',
    name: 'Premium Basmati Rice',
    category: 'Pantry Essentials',
    department: 'Groceries',
    price: 299,
    oldPrice: 349,
    quantity: '5 kg',
    rating: 4.8,
    ratingCount: 154,
    emoji: '🍚',
    quality: 'Premium',
    freshness: 'Freshly Packed',
    origin: 'Indian Farms',
    availability: 'In Stock',
    badge: 'Best Seller',
    stock: 18,
    description:
      'Premium long-grain basmati rice suitable for biryani, pulao and everyday meals.',
  },

  // =====================================================
  // HOME APPLIANCES
  // =====================================================

  {
    id: 'appliance-kettle',
    name: 'Electric Kettle',
    category: 'Kitchen',
    department: 'Home Appliances',
    price: 899,
    oldPrice: 1199,
    quantity: '1 piece',
    rating: 4.7,
    ratingCount: 91,
    emoji: '☕',
    quality: 'Premium',
    availability: 'In Stock',
    badge: '20% OFF',
    stock: 12,
    description:
      'A convenient electric kettle for quickly preparing hot water, tea, coffee and other beverages.',
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
    ratingCount: 76,
    emoji: '🥤',
    quality: 'Heavy Duty',
    availability: 'In Stock',
    badge: 'Popular',
    stock: 9,
    description:
      'A practical mixer grinder for everyday kitchen preparation, blending and grinding.',
  },

  {
    id: 'appliance-toaster',
    name: 'Pop-up Toaster',
    category: 'Kitchen',
    department: 'Home Appliances',
    price: 1299,
    oldPrice: 1499,
    quantity: '1 piece',
    rating: 4.5,
    ratingCount: 54,
    emoji: '🍞',
    quality: 'Premium',
    availability: 'In Stock',
    badge: 'Great Value',
    stock: 15,
    description:
      'Compact toaster designed for quick and convenient breakfast preparation.',
  },

  {
    id: 'appliance-bottle',
    name: 'Electric Water Bottle',
    category: 'Kitchen',
    department: 'Home Appliances',
    price: 699,
    oldPrice: 799,
    quantity: '1 piece',
    rating: 4.4,
    ratingCount: 43,
    emoji: '💧',
    quality: 'Standard',
    availability: 'In Stock',
    badge: 'New',
    stock: 14,
    description:
      'Convenient electric water bottle designed for everyday use at home or while travelling.',
  },

  {
    id: 'appliance-mop',
    name: 'Spin Floor Mop',
    category: 'Cleaning',
    department: 'Home Appliances',
    price: 799,
    oldPrice: 999,
    quantity: '1 set',
    rating: 4.5,
    ratingCount: 62,
    emoji: '🧹',
    quality: 'Durable',
    availability: 'In Stock',
    badge: '20% OFF',
    stock: 11,
    description:
      'Easy-to-use spin mop set designed to make everyday floor cleaning simpler.',
  },

  {
    id: 'appliance-vacuum',
    name: 'Mini Handheld Vacuum',
    category: 'Cleaning',
    department: 'Home Appliances',
    price: 1499,
    oldPrice: 1799,
    quantity: '1 piece',
    rating: 4.6,
    ratingCount: 58,
    emoji: '🧹',
    quality: 'Premium',
    availability: 'In Stock',
    badge: 'Popular',
    stock: 8,
    description:
      'Compact handheld vacuum suitable for quick cleaning of small areas and surfaces.',
  },

  {
    id: 'appliance-storage',
    name: 'Kitchen Storage Set',
    category: 'Storage',
    department: 'Home Appliances',
    price: 599,
    oldPrice: 749,
    quantity: '6 pieces',
    rating: 4.7,
    ratingCount: 87,
    emoji: '🥣',
    quality: 'Food Safe',
    availability: 'In Stock',
    badge: 'Best Seller',
    stock: 20,
    description:
      'Useful kitchen storage containers designed to keep everyday ingredients organized.',
  },

  {
    id: 'appliance-organizer',
    name: 'Multipurpose Organizer',
    category: 'Storage',
    department: 'Home Appliances',
    price: 349,
    oldPrice: 449,
    quantity: '1 piece',
    rating: 4.5,
    ratingCount: 49,
    emoji: '🗃️',
    quality: 'Durable',
    availability: 'In Stock',
    badge: 'Great Value',
    stock: 25,
    description:
      'Multipurpose organizer for keeping household and kitchen items neat and accessible.',
  },

  {
    id: 'appliance-fan',
    name: 'Table Fan',
    category: 'Small Appliances',
    department: 'Home Appliances',
    price: 1199,
    oldPrice: 1399,
    quantity: '1 piece',
    rating: 4.6,
    ratingCount: 71,
    emoji: '🌀',
    quality: 'Premium',
    availability: 'In Stock',
    badge: 'Popular',
    stock: 13,
    description:
      'Compact table fan designed to provide convenient airflow for everyday indoor use.',
  },

  {
    id: 'appliance-iron',
    name: 'Steam Iron',
    category: 'Small Appliances',
    department: 'Home Appliances',
    price: 999,
    oldPrice: 1199,
    quantity: '1 piece',
    rating: 4.5,
    ratingCount: 65,
    emoji: '👕',
    quality: 'Premium',
    availability: 'In Stock',
    badge: 'Great Value',
    stock: 16,
    description:
      'Practical steam iron for everyday clothing care and wrinkle removal.',
  },

  // =====================================================
  // STATIONERY
  // =====================================================

  {
    id: 'stationery-ball-pen',
    name: 'Premium Ball Pens',
    category: 'Pens',
    department: 'Stationery',
    price: 99,
    oldPrice: 119,
    quantity: '5 pieces',
    rating: 4.7,
    ratingCount: 72,
    emoji: '🖊️',
    quality: 'Premium',
    availability: 'In Stock',
    badge: 'Popular',
    stock: 35,
    description:
      'Smooth-writing ball pens suitable for school, office and everyday writing.',
  },

  {
    id: 'stationery-gel-pen',
    name: 'Smooth Gel Pens',
    category: 'Pens',
    department: 'Stationery',
    price: 120,
    oldPrice: 150,
    quantity: '5 pieces',
    rating: 4.8,
    ratingCount: 88,
    emoji: '🖊️',
    quality: 'Premium',
    availability: 'In Stock',
    badge: 'Best Seller',
    stock: 28,
    description:
      'Smooth gel pens that provide comfortable writing for notes, assignments and office work.',
  },

  {
    id: 'stationery-notebook',
    name: 'Classic Ruled Notebook',
    category: 'Notebooks',
    department: 'Stationery',
    price: 79,
    oldPrice: 99,
    quantity: '1 piece',
    rating: 4.6,
    ratingCount: 61,
    emoji: '📓',
    quality: 'Standard',
    availability: 'In Stock',
    badge: 'Great Value',
    stock: 40,
    description:
      'Classic ruled notebook for school notes, office work, journaling and everyday writing.',
  },

  {
    id: 'stationery-planner',
    name: 'Premium Daily Planner',
    category: 'Notebooks',
    department: 'Stationery',
    price: 249,
    oldPrice: 299,
    quantity: '1 piece',
    rating: 4.8,
    ratingCount: 53,
    emoji: '📔',
    quality: 'Premium',
    availability: 'In Stock',
    badge: 'Popular',
    stock: 17,
    description:
      'Premium daily planner designed to help organize tasks, schedules and personal goals.',
  },

  {
    id: 'stationery-sketch',
    name: 'Drawing Sketch Book',
    category: 'Books',
    department: 'Stationery',
    price: 149,
    oldPrice: 179,
    quantity: '1 book',
    rating: 4.7,
    ratingCount: 47,
    emoji: '📖',
    quality: 'Premium Paper',
    availability: 'In Stock',
    badge: 'Creative Pick',
    stock: 21,
    description:
      'Quality sketch book for drawing, sketching, creative work and artistic practice.',
  },

  {
    id: 'stationery-colour',
    name: 'Colour Pencil Set',
    category: 'School Supplies',
    department: 'Stationery',
    price: 199,
    oldPrice: 249,
    quantity: '24 colours',
    rating: 4.8,
    ratingCount: 94,
    emoji: '🖍️',
    quality: 'Premium',
    availability: 'In Stock',
    badge: 'Best Seller',
    stock: 19,
    description:
      'Colour pencil set with a range of colours for school projects, drawing and creative activities.',
  },

  {
    id: 'stationery-pencil',
    name: 'HB Writing Pencils',
    category: 'School Supplies',
    department: 'Stationery',
    price: 60,
    oldPrice: 75,
    quantity: '10 pieces',
    rating: 4.6,
    ratingCount: 56,
    emoji: '✏️',
    quality: 'Standard',
    availability: 'In Stock',
    badge: 'Great Value',
    stock: 50,
    description:
      'Reliable HB pencils suitable for writing, drawing, school work and everyday use.',
  },

  {
    id: 'stationery-kit',
    name: 'School Essentials Kit',
    category: 'School Supplies',
    department: 'Stationery',
    price: 299,
    oldPrice: 349,
    quantity: '1 kit',
    rating: 4.7,
    ratingCount: 69,
    emoji: '🎒',
    quality: 'Complete Kit',
    availability: 'In Stock',
    badge: 'Popular',
    stock: 14,
    description:
      'Convenient collection of everyday school essentials for students.',
  },

  // =====================================================
  // SKIN CARE
  // =====================================================

  {
    id: 'skin-facewash',
    name: 'Gentle Face Wash',
    category: 'Face Care',
    department: 'Skin Care',
    price: 199,
    oldPrice: 249,
    quantity: '100 ml',
    rating: 4.6,
    ratingCount: 82,
    emoji: '🧴',
    quality: 'Gentle Care',
    availability: 'In Stock',
    badge: 'Popular',
    stock: 22,
    description:
      'A gentle everyday face wash designed for a simple and refreshing cleansing routine.',
  },

  {
    id: 'skin-moisturizer',
    name: 'Daily Moisturizer',
    category: 'Face Care',
    department: 'Skin Care',
    price: 299,
    oldPrice: 349,
    quantity: '100 ml',
    rating: 4.7,
    ratingCount: 97,
    emoji: '✨',
    quality: 'Daily Care',
    availability: 'In Stock',
    badge: 'Best Seller',
    stock: 18,
    description:
      'Daily moisturizer designed to keep skin feeling soft, comfortable and hydrated.',
  },

  {
    id: 'skin-sunscreen',
    name: 'Daily Sunscreen',
    category: 'Face Care',
    department: 'Skin Care',
    price: 349,
    oldPrice: 399,
    quantity: '50 g',
    rating: 4.8,
    ratingCount: 116,
    emoji: '☀️',
    quality: 'Daily Protection',
    availability: 'In Stock',
    badge: 'Best Seller',
    stock: 15,
    description:
      'Everyday sunscreen designed to be part of your regular daytime skincare routine.',
  },

  {
    id: 'skin-bodywash',
    name: 'Refreshing Body Wash',
    category: 'Body Care',
    department: 'Skin Care',
    price: 249,
    oldPrice: 299,
    quantity: '250 ml',
    rating: 4.6,
    ratingCount: 73,
    emoji: '🫧',
    quality: 'Refreshing Care',
    availability: 'In Stock',
    badge: 'Popular',
    stock: 20,
    description:
      'Refreshing body wash suitable for an everyday bathing routine.',
  },

  {
    id: 'skin-lotion',
    name: 'Hydrating Body Lotion',
    category: 'Body Care',
    department: 'Skin Care',
    price: 279,
    oldPrice: 329,
    quantity: '200 ml',
    rating: 4.7,
    ratingCount: 81,
    emoji: '🧴',
    quality: 'Hydrating Care',
    availability: 'In Stock',
    badge: 'Great Value',
    stock: 16,
    description:
      'Hydrating body lotion designed for daily body care and a soft skin feel.',
  },

  {
    id: 'skin-shampoo',
    name: 'Daily Care Shampoo',
    category: 'Hair Care',
    department: 'Skin Care',
    price: 299,
    oldPrice: 349,
    quantity: '340 ml',
    rating: 4.6,
    ratingCount: 68,
    emoji: '🧴',
    quality: 'Daily Care',
    availability: 'In Stock',
    badge: 'Popular',
    stock: 19,
    description:
      'Everyday shampoo designed for regular hair cleansing and care.',
  },

  {
    id: 'skin-conditioner',
    name: 'Smooth Hair Conditioner',
    category: 'Hair Care',
    department: 'Skin Care',
    price: 279,
    oldPrice: 329,
    quantity: '180 ml',
    rating: 4.5,
    ratingCount: 54,
    emoji: '💆',
    quality: 'Smooth Care',
    availability: 'In Stock',
    badge: 'Great Value',
    stock: 14,
    description:
      'Hair conditioner designed to make everyday hair care feel smoother and easier.',
  },

  {
    id: 'skin-hairoil',
    name: 'Nourishing Hair Oil',
    category: 'Hair Care',
    department: 'Skin Care',
    price: 189,
    oldPrice: 229,
    quantity: '200 ml',
    rating: 4.6,
    ratingCount: 63,
    emoji: '🌿',
    quality: 'Nourishing Care',
    availability: 'In Stock',
    badge: 'Popular',
    stock: 23,
    description:
      'Nourishing hair oil designed for a simple everyday hair-care routine.',
  },

  // =====================================================
  // MEDIKITS
  // =====================================================

  {
    id: 'medikit-bandage',
    name: 'Adhesive Bandages',
    category: 'First Aid',
    department: 'Medikits',
    price: 49,
    oldPrice: 59,
    quantity: '20 pieces',
    rating: 4.7,
    ratingCount: 75,
    emoji: '🩹',
    quality: 'Medical Grade',
    availability: 'In Stock',
    badge: 'Great Value',
    stock: 30,
    description:
      'Everyday adhesive bandages useful for keeping basic first-aid supplies at home.',
  },

  {
    id: 'medikit-firstaid',
    name: 'First Aid Kit',
    category: 'First Aid',
    department: 'Medikits',
    price: 399,
    oldPrice: 499,
    quantity: '1 kit',
    rating: 4.8,
    ratingCount: 109,
    emoji: '🧰',
    quality: 'Complete Kit',
    availability: 'In Stock',
    badge: 'Best Seller',
    stock: 10,
    description:
      'A convenient basic first-aid kit for keeping essential care supplies organized at home.',
  },

  {
    id: 'medikit-cotton',
    name: 'Sterile Cotton',
    category: 'First Aid',
    department: 'Medikits',
    price: 89,
    oldPrice: 109,
    quantity: '100 g',
    rating: 4.6,
    ratingCount: 51,
    emoji: '☁️',
    quality: 'Sterile',
    availability: 'In Stock',
    badge: 'Essential',
    stock: 25,
    description:
      'Sterile cotton suitable for general first-aid and personal care needs.',
  },

  {
    id: 'medikit-sanitizer',
    name: 'Hand Sanitizer',
    category: 'Personal Care',
    department: 'Medikits',
    price: 99,
    oldPrice: 119,
    quantity: '250 ml',
    rating: 4.7,
    ratingCount: 84,
    emoji: '🧴',
    quality: 'Hygiene Care',
    availability: 'In Stock',
    badge: 'Popular',
    stock: 28,
    description:
      'Convenient hand sanitizer for everyday personal hygiene when soap and water are not immediately available.',
  },

  {
    id: 'medikit-mask',
    name: 'Protective Face Masks',
    category: 'Personal Care',
    department: 'Medikits',
    price: 120,
    oldPrice: 149,
    quantity: '20 pieces',
    rating: 4.5,
    ratingCount: 46,
    emoji: '😷',
    quality: 'Standard',
    availability: 'In Stock',
    badge: 'Great Value',
    stock: 32,
    description:
      'Disposable face masks suitable for everyday personal use.',
  },

  {
    id: 'medikit-thermometer',
    name: 'Digital Thermometer',
    category: 'Basic Care',
    department: 'Medikits',
    price: 249,
    oldPrice: 299,
    quantity: '1 piece',
    rating: 4.6,
    ratingCount: 57,
    emoji: '🌡️',
    quality: 'Digital',
    availability: 'In Stock',
    badge: 'Essential',
    stock: 13,
    description:
      'Digital thermometer intended for convenient temperature measurement at home.',
  },

  {
    id: 'medikit-hotwater',
    name: 'Hot Water Bag',
    category: 'Basic Care',
    department: 'Medikits',
    price: 299,
    oldPrice: 349,
    quantity: '1 piece',
    rating: 4.7,
    ratingCount: 64,
    emoji: '♨️',
    quality: 'Reusable',
    availability: 'In Stock',
    badge: 'Popular',
    stock: 11,
    description:
      'Reusable hot water bag designed for general household comfort and warmth.',
  },

  {
    id: 'medikit-balm',
    name: 'Pain Relief Balm',
    category: 'Basic Care',
    department: 'Medikits',
    price: 99,
    oldPrice: 119,
    quantity: '25 g',
    rating: 4.5,
    ratingCount: 48,
    emoji: '🌿',
    quality: 'Personal Care',
    availability: 'In Stock',
    badge: 'Popular',
    stock: 17,
    description:
      'A convenient balm for everyday personal-care use. Follow the product label for directions and precautions.',
  },
];