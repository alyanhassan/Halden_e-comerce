import { Order, OrderStatus } from '../types';
import { checkVariantStock, decrementStock } from './productService';

const ORDERS_STORAGE_KEY = 'halden_orders';

const SEED_ORDERS: Order[] = [
  {
    id: 'HLD-842910',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    customer: {
      name: 'Julian Vance',
      email: 'julian@halden.com',
      phone: '+1 (555) 234-5678',
      address: '148 Mercer Street',
      apartment: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10012',
      country: 'United States',
    },
    items: [
      {
        productId: 'hld-hd-01',
        name: 'Heavyweight Fleece Pullover',
        price: 88,
        size: 'L',
        color: 'Washed Black',
        quantity: 1,
      },
      {
        productId: 'hld-sh-02',
        name: 'Heavyweight Box-Cut Tee',
        price: 42,
        size: 'L',
        color: 'Cornsilk',
        quantity: 1,
      },
    ],
    deliveryMethod: 'standard',
    paymentMethod: 'card',
    subtotal: 130,
    discount: 13,
    shipping: 0,
    total: 117,
    promoCode: 'HALDEN10',
    status: 'Delivered',
    statusHistory: [
      {
        status: 'Placed',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Order placed by customer.',
      },
      {
        status: 'Processing',
        timestamp: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Garments verified and packed at central depot.',
      },
      {
        status: 'Shipped',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Dispatched via Express Courier.',
      },
      {
        status: 'Out for delivery',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Assigned to courier van.',
      },
      {
        status: 'Delivered',
        timestamp: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Delivered to recipient address with signature.',
      },
    ],
  },
];

function readOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_ORDERS;
  }
}

function writeOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

export async function createOrder(
  data: Omit<Order, 'id' | 'createdAt' | 'status' | 'statusHistory'>
): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 35));

  // 1. Re-check stock for all items
  for (const item of data.items) {
    const stockCheck = await checkVariantStock(
      item.productId,
      item.size,
      item.color,
      item.quantity
    );
    if (!stockCheck.available) {
      throw new Error(
        stockCheck.message ||
          `Item ${item.name} (${item.color}, ${item.size}) is no longer available in the requested quantity.`
      );
    }
  }

  // 2. Decrement stock
  await decrementStock(data.items);

  // 3. Create Order
  const orders = readOrders();
  const orderId = `HLD-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...data,
    id: orderId,
    createdAt: now,
    status: 'Placed',
    statusHistory: [
      {
        status: 'Placed',
        timestamp: now,
        note: 'Order confirmed and registered in Halden system.',
      },
    ],
  };

  orders.unshift(newOrder);
  writeOrders(orders);
  return newOrder;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const orders = readOrders();
  const normalized = orderId.trim().toUpperCase();
  return orders.find((o) => o.id.toUpperCase() === normalized) || null;
}

export async function getOrderByNumberAndEmail(
  orderId: string,
  email: string
): Promise<Order | null> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  const orders = readOrders();
  const normalizedId = orderId.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();

  return (
    orders.find(
      (o) =>
        o.id.toUpperCase() === normalizedId &&
        o.customer.email.toLowerCase() === normalizedEmail
    ) || null
  );
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  const orders = readOrders();
  const normalizedEmail = email.trim().toLowerCase();
  return orders.filter((o) => o.customer.email.toLowerCase() === normalizedEmail);
}

export async function getAllOrders(): Promise<Order[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  return readOrders();
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  const orders = readOrders();
  const normalizedId = orderId.trim().toUpperCase();
  const index = orders.findIndex((o) => o.id.toUpperCase() === normalizedId);

  if (index === -1) {
    throw new Error(`Order ${orderId} not found.`);
  }

  const order = orders[index];
  order.status = newStatus;
  order.statusHistory.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
    note: note || `Status updated to ${newStatus} by operations team.`,
  });

  orders[index] = order;
  writeOrders(orders);
  return order;
}
