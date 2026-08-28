export interface Color {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Premium Bras' | 'Cotton Bras' | 'Malai Cotton Bras' | 'Kaftan Abayas' | 'Other Accessories';
  price: number;
  image: string;
  description: string;
  sizes: string[];
  colors: Color[];
  rating: number;
  reviewsCount: number;
  features: string[];
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

export interface CartItem {
  id: string; // combination of productId + size + colorHex
  product: Product;
  selectedSize: string;
  selectedColor: Color;
  quantity: number;
}

export interface OrderItem {
  productName: string;
  category: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  deliveryCharge: number;
  total: number;
  date: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  paymentScreenshot?: string; // base64 representation of proof of payment
  paymentStatus?: 'Paid' | 'Unpaid' | 'Pending Verification';
  customerEmail?: string;
  userId?: string;
  createdAt?: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  accountNumber: string;
  accountTitle?: string;
  icon?: string; // base64 or SVG preset or URL
  isActive: boolean;
}

export interface DeliveryFeeConfig {
  isFree: boolean;
  amount: number;
}

export type UserRole = 'SuperAdmin' | 'StoreManager' | 'Customer';
export type UserStatus = 'PendingApproval' | 'Active' | 'Suspended';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  // Stored client-side safely in our state manager. We also demonstrate that 
  // actual passwords/hashes are protected and never displayed in the UI.
  passwordHash: string; 
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: 'User Registration' | 'Authentication Attempt' | 'Profile Modification' | 'Password Reset Request' | 'Role Change' | 'Account Status Update' | 'Administrative Action';
  userId: string;
  userEmail: string;
  role: string;
  description: string;
  ipAddress: string;
  status: 'Success' | 'Failure' | 'Warning' | 'Info';
}

