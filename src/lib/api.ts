import { Product, AdminOrder, UserProfile, PaymentMethod, DeliveryFeeConfig, AuditLogEntry } from '../types.ts';

const API_BASE = '/api';

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API request failed: ${path}`);
  return res.json();
}

export async function fetchProductsApi(): Promise<Product[]> {
  return apiGet<Product[]>('/products');
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
  return apiGet<AdminOrder[]>('/orders');
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
  return apiGet<UserProfile[]>('/users');
}

export async function saveUserApi(user: UserProfile): Promise<void> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Failed to save user');
}

export async function deleteUserApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete user');
}

export async function fetchPaymentMethodsApi(): Promise<PaymentMethod[]> {
  return apiGet<PaymentMethod[]>('/payment-methods');
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
  return apiGet<DeliveryFeeConfig>('/delivery-config');
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
  return apiGet<AuditLogEntry[]>('/audit-logs');
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
