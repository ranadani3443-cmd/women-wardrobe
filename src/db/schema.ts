import { pgTable, text, serial, timestamp, integer, boolean, doublePrecision } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (links with Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  fullName: text('full_name').default(''),
  phone: text('phone').default(''),
  address: text('address').default(''),
  role: text('role').notNull().default('Customer'), // 'SuperAdmin' | 'StoreManager' | 'Customer'
  status: text('status').notNull().default('Active'), // 'Active' | 'PendingApproval' | 'Suspended'
  passwordHash: text('password_hash').default(''),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  price: integer('price').notNull(),
  image: text('image').notNull(),
  description: text('description').notNull(),
  sizes: text('sizes').notNull(), // JSON string array
  colors: text('colors').notNull(), // JSON string array of Color objects
  rating: doublePrecision('rating').default(5.0),
  reviewsCount: integer('reviews_count').default(0),
  features: text('features').notNull(), // JSON string array
  isNewArrival: boolean('is_new_arrival').default(false),
  isBestSeller: boolean('is_best_seller').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  paymentMethod: text('payment_method').notNull(),
  deliveryCharge: integer('delivery_charge').notNull().default(0),
  total: integer('total').notNull().default(0),
  date: text('date').notNull(),
  status: text('status').notNull().default('Pending'), // 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled'
  items: text('items').notNull(), // JSON string array of OrderItem
  paymentScreenshot: text('payment_screenshot'),
  paymentStatus: text('payment_status').default('Unpaid'), // 'Paid' | 'Unpaid' | 'Pending Verification'
  customerEmail: text('customer_email'),
  userId: text('user_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Payment Methods configuration
export const paymentMethods = pgTable('payment_methods', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  accountNumber: text('account_number').notNull(),
  accountTitle: text('account_title'),
  icon: text('icon'),
  isActive: boolean('is_active').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Delivery fee configuration
export const deliveryConfig = pgTable('delivery_config', {
  id: text('id').primaryKey().default('default'),
  isFree: boolean('is_free').notNull().default(false),
  amount: integer('amount').notNull().default(250),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Audit Logs table
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  eventType: text('event_type').notNull(),
  userId: text('user_id').notNull(),
  userEmail: text('user_email').notNull(),
  role: text('role').notNull(),
  description: text('description').notNull(),
  ipAddress: text('ip_address').notNull(),
  status: text('status').notNull().default('Success'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.uid],
  }),
}));
