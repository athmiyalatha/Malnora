export type OrderStatus =
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  emoji?: string;
  quantity: number;
};

export type DeliveryAddress = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

export type Order = {
  id: string;
  orderNumber?: string;

  items: OrderItem[];

  deliveryAddress: DeliveryAddress;

  paymentMethod: 'cod';

  subtotal: number;
  deliveryFee: number;
  total: number;

  status: OrderStatus;

  createdAt: string;
};