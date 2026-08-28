import { eq, desc } from 'drizzle-orm';
import { db, ensureDbSchema, isSqlConnected } from './index.ts';
import { products, orders, users, paymentMethods, deliveryConfig, auditLogs } from './schema.ts';
import { Product, AdminOrder, UserProfile, AuditLogEntry, PaymentMethod, DeliveryFeeConfig } from '../types.ts';

// Resilient In-Memory Storage Cache (used for fallback & instant fast reads)
const memProducts = new Map<string, Product>();
const memOrders = new Map<string, AdminOrder>();
const memUsers = new Map<string, UserProfile>();
const memPaymentMethods = new Map<string, PaymentMethod>();
let memDeliveryConfig: DeliveryFeeConfig = { isFree: false, amount: 250 };
const memAuditLogs = new Map<string, AuditLogEntry>();

// ======================== PRODUCTS ========================

export async function getDbProducts(): Promise<Product[]> {
  try {
    const connected = await isSqlConnected();
    if (!connected) {
      return Array.from(memProducts.values());
    }

    await ensureDbSchema();
    const rows = await db.select().from(products).orderBy(products.id);
    const dbList = rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category as Product['category'],
      price: r.price,
      image: r.image,
      description: r.description,
      sizes: JSON.parse(r.sizes || '[]'),
      colors: JSON.parse(r.colors || '[]'),
      rating: r.rating ?? 5,
      reviewsCount: r.reviewsCount ?? 0,
      features: JSON.parse(r.features || '[]'),
      isNewArrival: !!r.isNewArrival,
      isBestSeller: !!r.isBestSeller,
    }));

    // Sync to memory cache
    dbList.forEach((p) => memProducts.set(p.id, p));
    return dbList.length > 0 ? dbList : Array.from(memProducts.values());
  } catch (error) {
    return Array.from(memProducts.values());
  }
}

export async function upsertDbProduct(p: Product): Promise<void> {
  // Always update memory store immediately
  memProducts.set(p.id, p);

  try {
    const connected = await isSqlConnected();
    if (!connected) return;

    await ensureDbSchema();
    const safeRating = typeof p.rating === 'number' ? p.rating : parseFloat(String(p.rating || 5)) || 5.0;
    const safePrice = typeof p.price === 'number' ? Math.round(p.price) : parseInt(String(p.price || 0), 10) || 0;
    const safeReviewsCount = typeof p.reviewsCount === 'number' ? p.reviewsCount : parseInt(String(p.reviewsCount || 0), 10) || 0;

    await db.insert(products)
      .values({
        id: p.id,
        name: p.name,
        category: p.category,
        price: safePrice,
        image: p.image,
        description: p.description,
        sizes: JSON.stringify(p.sizes || []),
        colors: JSON.stringify(p.colors || []),
        rating: safeRating,
        reviewsCount: safeReviewsCount,
        features: JSON.stringify(p.features || []),
        isNewArrival: !!p.isNewArrival,
        isBestSeller: !!p.isBestSeller,
      })
      .onConflictDoUpdate({
        target: products.id,
        set: {
          name: p.name,
          category: p.category,
          price: safePrice,
          image: p.image,
          description: p.description,
          sizes: JSON.stringify(p.sizes || []),
          colors: JSON.stringify(p.colors || []),
          rating: safeRating,
          reviewsCount: safeReviewsCount,
          features: JSON.stringify(p.features || []),
          isNewArrival: !!p.isNewArrival,
          isBestSeller: !!p.isBestSeller,
        },
      });
  } catch (error) {
    // Non-fatal
  }
}

export async function deleteDbProduct(id: string): Promise<void> {
  memProducts.delete(id);
  try {
    const connected = await isSqlConnected();
    if (!connected) return;

    await ensureDbSchema();
    await db.delete(products).where(eq(products.id, id));
  } catch (error) {
    // Non-fatal
  }
}

// ======================== ORDERS ========================

export async function getDbOrders(): Promise<AdminOrder[]> {
  try {
    const connected = await isSqlConnected();
    if (!connected) {
      return Array.from(memOrders.values()).sort((a, b) => {
        const timeA = a.createdAt || Date.parse(a.date) || 0;
        const timeB = b.createdAt || Date.parse(b.date) || 0;
        return timeB - timeA;
      });
    }

    await ensureDbSchema();
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const dbList = rows.map((r) => ({
      id: r.id,
      customerName: r.customerName,
      phone: r.phone,
      address: r.address,
      paymentMethod: r.paymentMethod,
      deliveryCharge: r.deliveryCharge,
      total: r.total,
      date: r.date,
      status: r.status as AdminOrder['status'],
      items: JSON.parse(r.items || '[]'),
      paymentScreenshot: r.paymentScreenshot || undefined,
      paymentStatus: (r.paymentStatus as AdminOrder['paymentStatus']) || 'Unpaid',
      customerEmail: r.customerEmail || undefined,
      userId: r.userId || undefined,
      createdAt: r.createdAt ? new Date(r.createdAt).getTime() : undefined,
    }));

    dbList.forEach((o) => memOrders.set(o.id, o));
    return dbList.length > 0 ? dbList : Array.from(memOrders.values());
  } catch (error) {
    return Array.from(memOrders.values());
  }
}

export async function insertDbOrder(order: AdminOrder): Promise<void> {
  memOrders.set(order.id, order);

  try {
    const connected = await isSqlConnected();
    if (!connected) return;

    await ensureDbSchema();
    const safeDeliveryCharge = typeof order.deliveryCharge === 'number' ? Math.round(order.deliveryCharge) : parseInt(String(order.deliveryCharge || 0), 10) || 0;
    const safeTotal = typeof order.total === 'number' ? Math.round(order.total) : parseInt(String(order.total || 0), 10) || 0;

    await db.insert(orders)
      .values({
        id: order.id,
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        paymentMethod: order.paymentMethod,
        deliveryCharge: safeDeliveryCharge,
        total: safeTotal,
        date: order.date,
        status: order.status,
        items: JSON.stringify(order.items || []),
        paymentScreenshot: order.paymentScreenshot || null,
        paymentStatus: order.paymentStatus || 'Unpaid',
        customerEmail: order.customerEmail || null,
        userId: order.userId || null,
        createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
      })
      .onConflictDoUpdate({
        target: orders.id,
        set: {
          customerName: order.customerName,
          phone: order.phone,
          address: order.address,
          paymentMethod: order.paymentMethod,
          deliveryCharge: safeDeliveryCharge,
          total: safeTotal,
          status: order.status,
          items: JSON.stringify(order.items || []),
          paymentScreenshot: order.paymentScreenshot || null,
          paymentStatus: order.paymentStatus || 'Unpaid',
          customerEmail: order.customerEmail || null,
          userId: order.userId || null,
        },
      });
  } catch (error) {
    // Non-fatal
  }
}

export async function updateDbOrderStatus(orderId: string, status: AdminOrder['status']): Promise<void> {
  const existing = memOrders.get(orderId);
  if (existing) {
    existing.status = status;
    memOrders.set(orderId, existing);
  }

  try {
    const connected = await isSqlConnected();
    if (!connected) return;

    await ensureDbSchema();
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));
  } catch (error) {
    // Non-fatal
  }
}

export async function updateDbOrderPaymentStatus(orderId: string, paymentStatus: 'Paid' | 'Unpaid' | 'Pending Verification'): Promise<void> {
  const existing = memOrders.get(orderId);
  if (existing) {
    existing.paymentStatus = paymentStatus;
    memOrders.set(orderId, existing);
  }

  try {
    const connected = await isSqlConnected();
    if (!connected) return;

    await ensureDbSchema();
    await db.update(orders).set({ paymentStatus }).where(eq(orders.id, orderId));
  } catch (error) {
    // Non-fatal
  }
}

// ======================== USERS ========================

export async function getDbUsers(): Promise<UserProfile[]> {
  try {
    const connected = await isSqlConnected();
    if (!connected) {
      return Array.from(memUsers.values());
    }

    await ensureDbSchema();
    const rows = await db.select().from(users).orderBy(users.id);
    const dbList = rows.map((r) => ({
      id: r.uid,
      email: r.email,
      fullName: r.fullName || '',
      phone: r.phone || '',
      address: r.address || '',
      role: (r.role as UserProfile['role']) || 'Customer',
      status: (r.status as UserProfile['status']) || 'Active',
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : new Date().toISOString(),
      passwordHash: r.passwordHash || '',
    }));

    dbList.forEach((u) => memUsers.set(u.id, u));
    return dbList.length > 0 ? dbList : Array.from(memUsers.values());
  } catch (error) {
    return Array.from(memUsers.values());
  }
}

export async function upsertDbUser(user: UserProfile): Promise<void> {
  memUsers.set(user.id, user);

  try {
    const connected = await isSqlConnected();
    if (!connected) return;

    await ensureDbSchema();
    await db.insert(users)
      .values({
        uid: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        role: user.role,
        status: user.status,
        passwordHash: user.passwordHash,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          address: user.address,
          role: user.role,
          status: user.status,
          passwordHash: user.passwordHash,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    // Non-fatal
  }
}

// ======================== PAYMENT METHODS ========================

export async function getDbPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const connected = await isSqlConnected();
    if (!connected) {
      return Array.from(memPaymentMethods.values());
    }

    await ensureDbSchema();
    const rows = await db.select().from(paymentMethods).orderBy(paymentMethods.id);
    const dbList = rows.map((r) => ({
      id: r.id,
      name: r.name,
      accountNumber: r.accountNumber,
      accountTitle: r.accountTitle || undefined,
      icon: r.icon || undefined,
      isActive: r.isActive,
    }));

    dbList.forEach((pm) => memPaymentMethods.set(pm.id, pm));
    return dbList.length > 0 ? dbList : Array.from(memPaymentMethods.values());
  } catch (error) {
    return Array.from(memPaymentMethods.values());
  }
}

export async function upsertDbPaymentMethod(pm: PaymentMethod): Promise<void> {
  memPaymentMethods.set(pm.id, pm);

  try {
    const connected = await isSqlConnected();
    if (!connected) return;

    await ensureDbSchema();
    await db.insert(paymentMethods)
      .values({
        id: pm.id,
        name: pm.name,
        accountNumber: pm.accountNumber,
        accountTitle: pm.accountTitle || null,
        icon: pm.icon || null,
        isActive: pm.isActive,
      })
      .onConflictDoUpdate({
        target: paymentMethods.id,
        set: {
          name: pm.name,
          accountNumber: pm.accountNumber,
          accountTitle: pm.accountTitle || null,
          icon: pm.icon || null,
          isActive: pm.isActive,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    // Non-fatal
  }
}

export async function deleteDbPaymentMethod(id: string): Promise<void> {
  memPaymentMethods.delete(id);

  try {
    const connected = await isSqlConnected();
    if (!connected) return;

    await ensureDbSchema();
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
  } catch (error) {
    // Non-fatal
  }
}

// ======================== DELIVERY CONFIG ========================

export async function getDbDeliveryConfig(): Promise<DeliveryFeeConfig> {
  try {
    const connected = await isSqlConnected();
    if (!connected) {
      return memDeliveryConfig;
    }

    await ensureDbSchema();
    const rows = await db.select().from(deliveryConfig).where(eq(deliveryConfig.id, 'default'));
    if (rows.length === 0) {
      return memDeliveryConfig;
    }
    memDeliveryConfig = {
      isFree: rows[0].isFree,
      amount: rows[0].amount,
    };
    return memDeliveryConfig;
  } catch (error) {
    return memDeliveryConfig;
  }
}

export async function saveDbDeliveryConfig(config: DeliveryFeeConfig): Promise<void> {
  memDeliveryConfig = config;

  try {
    const connected = await isSqlConnected();
    if (!connected) return;

    await ensureDbSchema();
    await db.insert(deliveryConfig)
      .values({
        id: 'default',
        isFree: config.isFree,
        amount: config.amount,
      })
      .onConflictDoUpdate({
        target: deliveryConfig.id,
        set: {
          isFree: config.isFree,
          amount: config.amount,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    // Non-fatal
  }
}

// ======================== AUDIT LOGS ========================

export async function getDbAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const connected = await isSqlConnected();
    if (!connected) {
      return Array.from(memAuditLogs.values()).sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    }

    await ensureDbSchema();
    const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
    const dbList = rows.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      eventType: r.eventType as AuditLogEntry['eventType'],
      userId: r.userId,
      userEmail: r.userEmail,
      role: r.role,
      description: r.description,
      ipAddress: r.ipAddress,
      status: r.status as AuditLogEntry['status'],
    }));

    dbList.forEach((log) => memAuditLogs.set(log.id, log));
    return dbList.length > 0 ? dbList : Array.from(memAuditLogs.values());
  } catch (error) {
    return Array.from(memAuditLogs.values());
  }
}

export async function insertDbAuditLog(log: AuditLogEntry): Promise<void> {
  memAuditLogs.set(log.id, log);

  try {
    const connected = await isSqlConnected();
    if (!connected) return;

    await ensureDbSchema();
    await db.insert(auditLogs)
      .values({
        id: log.id,
        timestamp: log.timestamp,
        eventType: log.eventType,
        userId: log.userId,
        userEmail: log.userEmail,
        role: log.role,
        description: log.description,
        ipAddress: log.ipAddress,
        status: log.status,
      })
      .onConflictDoNothing();
  } catch (error) {
    // Non-fatal
  }
}


