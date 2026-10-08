const API_URL = 'http://127.0.0.1:5000/api';

export async function getProducts() {
  const response = await fetch(`${API_URL}/products`);

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json();

  return data.products;
}

export async function getProduct(id: string) {
  const response = await fetch(`${API_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }

  const data = await response.json();

  return data.product;
}

export async function createOrder(orderData: {
  orderNumber: string;

  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];

  deliveryAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };

  paymentMethod: 'cod';

  subtotal: number;
  deliveryFee: number;
  total: number;
}) {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  // Read the response safely.
  // This prevents JSON parsing errors if the server returns HTML.
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await response.text();

    console.error('Unexpected server response:', text);

    throw new Error(
      `Server returned an unexpected response (${response.status})`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to create order'
    );
  }

  return data.order;
}