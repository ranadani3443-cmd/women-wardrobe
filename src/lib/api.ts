import { Product, AdminOrder, UserProfile, PaymentMethod, DeliveryFeeConfig, AuditLogEntry } from '../types.ts';

const API_BASE = '/api';

export async function fetchProductsApi(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function saveProductApi(product: Product): Promise<void> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error('Failed to save product');
}

export async function deleteProductApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete product');
}

export async function fetchOrdersApi(): Promise<AdminOrder[]> {
  const res = await fetch(`${API_BASE}/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function saveOrderApi(order: AdminOrder): Promise<void> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error('Failed to save order');
}

export async function updateOrderStatusApi(orderId: string, status: AdminOrder['status']): Promise<void> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update order status');
}

export async function updateOrderPaymentStatusApi(orderId: string, paymentStatus: AdminOrder['paymentStatus']): Promise<void> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/payment-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentStatus }),
  });
  if (!res.ok) throw new Error('Failed to update payment status');
}

export async function fetchUsersApi(): Promise<UserProfile[]> {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function saveUserApi(user: UserProfile): Promise<void> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Failed to save user');
}

export async function fetchPaymentMethodsApi(): Promise<PaymentMethod[]> {
  const res = await fetch(`${API_BASE}/payment-methods`);
  if (!res.ok) throw new Error('Failed to fetch payment methods');
  return res.json();
}

export async function savePaymentMethodApi(pm: PaymentMethod): Promise<void> {
  const res = await fetch(`${API_BASE}/payment-methods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pm),
  });
  if (!res.ok) throw new Error('Failed to save payment method');
}

export async function deletePaymentMethodApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/payment-methods/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete payment method');
}

export async function fetchDeliveryConfigApi(): Promise<DeliveryFeeConfig> {
  const res = await fetch(`${API_BASE}/delivery-config`);
  if (!res.ok) throw new Error('Failed to fetch delivery config');
  return res.json();
}

export async function saveDeliveryConfigApi(config: DeliveryFeeConfig): Promise<void> {
  const res = await fetch(`${API_BASE}/delivery-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Failed to save delivery config');
}

export async function fetchAuditLogsApi(): Promise<AuditLogEntry[]> {
  const res = await fetch(`${API_BASE}/audit-logs`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function addAuditLogApi(log: AuditLogEntry): Promise<void> {
  const res = await fetch(`${API_BASE}/audit-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
  if (!res.ok) throw new Error('Failed to save audit log');
}

export async function seedInitialDataApi(payload: {
  products: Product[];
  users: UserProfile[];
  paymentMethods: PaymentMethod[];
  deliveryConfig: DeliveryFeeConfig;
  auditLogs: AuditLogEntry[];
}): Promise<void> {
  await fetch(`${API_BASE}/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
