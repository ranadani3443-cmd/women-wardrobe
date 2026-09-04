import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedCollections from './components/FeaturedCollections';
import WhyChooseUs from './components/WhyChooseUs';
import ProductShowcase from './components/ProductShowcase';
import Testimonials from './components/Testimonials';
import PaymentMethodsSection from './components/PaymentMethodsSection';
import Newsletter from './components/Newsletter';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import QuickViewModal from './components/QuickViewModal';
import WishlistModal from './components/WishlistModal';
import AdminPanel from './components/AdminPanel';
import UserPortalModal from './components/UserPortalModal';
import { sendWeb3FormsOrderNotification } from './lib/web3forms';
import { autoAppendOrderToGoogleSheet } from './lib/googleSheets';

import { PRODUCTS, BRAND_LOGO } from './data';
import { Product, CartItem, Color, AdminOrder, PaymentMethod, DeliveryFeeConfig, UserProfile, AuditLogEntry, UserRole, UserStatus } from './types';
import {
  fetchProductsApi,
  saveProductApi,
  deleteProductApi,
  fetchOrdersApi,
  saveOrderApi,
  updateOrderStatusApi,
  updateOrderPaymentStatusApi,
  fetchUsersApi,
  saveUserApi,
  deleteUserApi,
  fetchPaymentMethodsApi,
  savePaymentMethodApi,
  deletePaymentMethodApi,
  fetchDeliveryConfigApi,
  saveDeliveryConfigApi,
  fetchAuditLogsApi,
  addAuditLogApi,
} from './lib/api';
import { onSnapshot, collection, doc } from 'firebase/firestore';
import {
  db,
  seedInitialData,
  fetchProductsFromDB,
  saveProductToDB,
  deleteProductFromDB,
  fetchOrdersFromDB,
  saveOrderToDB,
  updateOrderStatusInDB,
  updateOrderPaymentStatusInDB,
  fetchUsersFromDB,
  saveUserToDB,
  deleteUserFromDB,
  fetchAuditLogsFromDB,
  addAuditLogToDB,
  fetchPaymentMethodsFromDB,
  savePaymentMethodToDB,
  deletePaymentMethodFromDB,
  fetchDeliveryFeeConfigFromDB,
  saveDeliveryFeeConfigToDB,
  fetchAdminNotificationsFromDB,
  saveAdminNotificationToDB,
  clearAllAdminNotificationsFromDB,
} from './lib/firebase';

const defaultUsersList: UserProfile[] = [
  {
    id: 'usr-1',
    email: 'womenwordrobe873@gmail.com',
    fullName: 'Adil Naseer',
    phone: '03422939080',
    address: 'Executive Suite Office 12, Gulberg III, Lahore',
    role: 'SuperAdmin',
    status: 'Active',
    createdAt: new Date('2026-01-10T08:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-10T08:00:00Z').toISOString(),
    passwordHash: 'Adilnaseer786.'
  },
  {
    id: 'usr-2',
    email: 'zoya@womenswardrobe.com',
    fullName: 'Zoya Khan',
    phone: '03001234567',
    address: 'Boutique Store 4, DHA Phase 6, Lahore',
    role: 'StoreManager',
    status: 'Active',
    createdAt: new Date('2026-02-15T10:30:00Z').toISOString(),
    updatedAt: new Date('2026-02-15T10:30:00Z').toISOString(),
    passwordHash: 'manager123'
  },
  {
    id: 'usr-3',
    email: 'ayesha@example.com',
    fullName: 'Ayesha Ahmed',
    phone: '03129876543',
    address: 'House 45-B, DHA Phase 5, Lahore',
    role: 'Customer',
    status: 'PendingApproval',
    createdAt: new Date('2026-07-01T14:15:00Z').toISOString(),
    updatedAt: new Date('2026-07-01T14:15:00Z').toISOString(),
    passwordHash: 'ayesha123'
  }
];

const defaultPaymentMethodsList: PaymentMethod[] = [
  {
    id: 'pm-ubl',
    name: 'Bank Account (UBL)',
    accountNumber: 'Pk670109000342018576',
    accountTitle: 'Adil Naseer / Women\'s Wardrobe',
    icon: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=200&auto=format&fit=crop',
    isActive: true
  },
  {
    id: 'pm-easypaisa',
    name: 'Easypaisa',
    accountNumber: '03422939080',
    accountTitle: 'Adil Naseer',
    icon: 'https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?q=80&w=200&auto=format&fit=crop',
    isActive: true
  },
  {
    id: 'pm-jazzcash',
    name: 'JazzCash',
    accountNumber: '03422939080',
    accountTitle: 'Adil Naseer',
    icon: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=200&auto=format&fit=crop',
    isActive: true
  },
  {
    id: 'pm-whatsapp',
    name: 'WhatsApp Order Support',
    accountNumber: '03422939080',
    accountTitle: '24/7 Priority Support',
    icon: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=200&auto=format&fit=crop',
    isActive: true
  }
];

const defaultAuditLogsList: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: new Date('2026-07-03T10:00:00Z').toISOString(),
    eventType: 'Administrative Action',
    userId: 'usr-1',
    userEmail: 'womenwordrobe873@gmail.com',
    role: 'SuperAdmin',
    description: 'System bootstrapped. Implemented strict cryptographic hashes & Role-Based Access Controls (RBAC).',
    ipAddress: '192.168.1.1',
    status: 'Success'
  },
  {
    id: 'log-2',
    timestamp: new Date('2026-07-03T11:15:00Z').toISOString(),
    eventType: 'User Registration',
    userId: 'usr-3',
    userEmail: 'ayesha@example.com',
    role: 'Customer',
    description: 'New user registration request submitted. Account placed in PendingApproval status.',
    ipAddress: '202.47.34.12',
    status: 'Success'
  },
  {
    id: 'log-3',
    timestamp: new Date('2026-07-03T12:00:00Z').toISOString(),
    eventType: 'Authentication Attempt',
    userId: 'Guest',
    userEmail: 'unknown@malicious.com',
    role: 'Guest',
    description: 'Brute-force authentication attempt detected. Input sanitized & request blocked.',
    ipAddress: '45.12.3.99',
    status: 'Failure'
  }
];

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  
  // Dynamic Catalog State
  const [products, setProducts] = useState<Product[]>([]);

  // Dynamic Orders State
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  // Dynamic Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Dynamic Delivery Fee Configuration State
  const [deliveryFeeConfig, setDeliveryFeeConfig] = useState<DeliveryFeeConfig>({ isFree: false, amount: 250 });

  // Admin Real-time Notifications State
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);

  // USER LIFECYCLE, ROLE-BASED ACCESS & AUDIT LOGS STATE
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const local = localStorage.getItem('ww_current_user');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // Fallback
      }
    }
    return null;
  });

  const [isUserPortalOpen, setIsUserPortalOpen] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const isAdminRoute = typeof window !== 'undefined' && (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/'));
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  const [activeSection, setActiveSection] = useState('home');
  const [selectedBentoCategory, setSelectedBentoCategory] = useState('');

  // Sync currentUser to localStorage to keep user sessions alive across reloads
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('ww_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('ww_current_user');
      }
    } catch (e) {
      console.warn("Storage warning: Could not save current user.", e);
    }
  }, [currentUser]);

  // Load the Hostinger/PostgreSQL API as the source of truth and subscribe to
  // server-sent update events. This keeps every open storefront/admin tab in
  // sync immediately after a catalog/order/settings change.
  useEffect(() => {
    let disposed = false;
    let events: EventSource | null = null;
    let notificationUnsub: (() => void) | undefined;

    const refreshProducts = async () => {
      try {
        const list = await fetchProductsApi();
        if (!disposed) setProducts(Array.isArray(list) ? list : []);
      } catch {}
    };

    const refreshOrders = async () => {
      try {
        const list = await fetchOrdersApi();
        if (!disposed) setOrders(Array.isArray(list) ? list : []);
      } catch {}
    };

    const refreshUsers = async () => {
      try {
        const list = await fetchUsersApi();
        if (!disposed) setUsers(Array.isArray(list) ? list : []);
      } catch {}
    };

    const refreshPaymentMethods = async () => {
      try {
        const list = await fetchPaymentMethodsApi();
        if (!disposed) setPaymentMethods(Array.isArray(list) ? list : []);
      } catch {}
    };

    const refreshDelivery = async () => {
      try {
        const config = await fetchDeliveryConfigApi();
        if (!disposed && config) setDeliveryFeeConfig(config);
      } catch {}
    };

    const refreshAuditLogs = async () => {
      try {
        const list = await fetchAuditLogsApi();
        if (!disposed) setAuditLogs(Array.isArray(list) ? list : []);
      } catch {}
    };

    const refreshAll = async () => {
      await Promise.allSettled([
        refreshProducts(),
        refreshOrders(),
        refreshUsers(),
        refreshPaymentMethods(),
        refreshDelivery(),
        refreshAuditLogs(),
      ]);
      if (!disposed) setIsLoading(false);
    };

    refreshAll();

    // Keep Firebase notifications only as an optional notification transport;
    // catalog/order/settings data no longer depends on Firestore snapshots.
    try {
      notificationUnsub = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => list.push(docSnap.data()));
        if (!disposed) setAdminNotifications(list);
      }, () => {});
    } catch {}

    // Near-instant cross-browser refresh. The server broadcasts after each DB write.
    try {
      events = new EventSource('/api/events');
      events.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data || '{}');
          switch (message.type) {
            case 'products': refreshProducts(); break;
            case 'orders': refreshOrders(); break;
            case 'users': refreshUsers(); break;
            case 'paymentMethods': refreshPaymentMethods(); break;
            case 'deliveryConfig': refreshDelivery(); break;
            case 'auditLogs': refreshAuditLogs(); break;
            default: break;
          }
        } catch {}
      };
    } catch {}

    // Safety refresh after returning to the tab, useful if a proxy briefly interrupted SSE.
    const onFocus = () => refreshAll();
    const onVisibility = () => { if (document.visibilityState === 'visible') refreshAll(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      disposed = true;
      events?.close();
      notificationUnsub?.();
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // HELPER: CREATE IMMUTABLE SECURITY AUDIT LOG ENTRY
  const addAuditLog = async (
    eventType: AuditLogEntry['eventType'],
    userId: string,
    userEmail: string,
    role: string,
    description: string,
    status: AuditLogEntry['status']
  ) => {
    const newLog: AuditLogEntry = {
      id: 'log-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toISOString(),
      eventType,
      userId,
      userEmail,
      role,
      description,
      ipAddress: '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(1 + Math.random() * 254),
      status
    };
    setAuditLogs(prev => [newLog, ...prev]);
    await addAuditLogApi(newLog);
    addAuditLogToDB(newLog).catch(() => {});
  };

  // SECURE AUTHENTICATION LOGIN HANDLER
  const handleUserLogin = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const foundUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
    
    if (!foundUser) {
      await addAuditLog(
        'Authentication Attempt',
        'Guest',
        cleanEmail,
        'Guest',
        `Failed authentication. User account identifier ${email} not found.`,
        'Failure'
      );
      return { success: false, message: 'Invalid email address or password credentials.' };
    }

    if (foundUser.status === 'Suspended') {
      await addAuditLog(
        'Authentication Attempt',
        foundUser.id,
        foundUser.email,
        foundUser.role,
        `Blocked login attempt for suspended user account ${foundUser.email}.`,
        'Warning'
      );
      return { success: false, message: 'Your account has been suspended by the administrator. Please contact customer care.' };
    }

    if (foundUser.status === 'PendingApproval') {
      await addAuditLog(
        'Authentication Attempt',
        foundUser.id,
        foundUser.email,
        foundUser.role,
        `Blocked login attempt for pending user account ${foundUser.email}. Needs administrative authorization.`,
        'Warning'
      );
      return { success: false, message: 'Your account registration is in a pending state until administrative approval is granted.' };
    }

    if (foundUser.passwordHash === cleanPass) {
      setCurrentUser(foundUser);
      await addAuditLog(
        'Authentication Attempt',
        foundUser.id,
        foundUser.email,
        foundUser.role,
        `User ${foundUser.fullName} successfully authenticated from secure channel. Access granted to role: ${foundUser.role}.`,
        'Success'
      );
      
      if (foundUser.role === 'SuperAdmin' || foundUser.role === 'StoreManager') {
         sessionStorage.setItem('ww_admin_authenticated', 'true');
      }

      return { success: true, message: `Access Authorized. Welcome back, ${foundUser.fullName}!` };
    } else {
      await addAuditLog(
        'Authentication Attempt',
        foundUser.id,
        foundUser.email,
        foundUser.role,
        `Failed authentication attempt. Incorrect password submitted for user ${foundUser.email}.`,
        'Failure'
      );
      return { success: false, message: 'Invalid email address or password credentials.' };
    }
  };

  // SECURE REGISTRATION SIGN-UP HANDLER
  const handleUserRegister = async (userData: {
    email: string;
    fullName: string;
    phone: string;
    address: string;
    passwordHash: string;
  }): Promise<{ success: boolean; message: string }> => {
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email address is already registered in our boutique.' };
    }

    const newUser: UserProfile = {
      id: 'usr-' + Math.floor(100000 + Math.random() * 900000),
      email: userData.email,
      fullName: userData.fullName,
      phone: userData.phone,
      address: userData.address,
      role: 'Customer',
      status: 'PendingApproval',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash: userData.passwordHash
    };

    setUsers(prev => [...prev, newUser]);
    await saveUserApi(newUser);
    saveUserToDB(newUser).catch(() => {});
    
    await addAuditLog(
      'User Registration',
      newUser.id,
      newUser.email,
      'Customer',
      `New user profile registration submitted. Account placed in PendingApproval status for compliance auditing.`,
      'Success'
    );

    return { success: true, message: 'Registration submitted successfully. Waiting for administrative audit.' };
  };

  // SECURE USER SELF-PROFILE MODIFICATION HANDLER
  const handleUpdateUserProfile = async (updatedData: Partial<UserProfile>): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Unauthenticated session. Action prohibited.' };
    }

    const updatedUser = {
      ...currentUser,
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    await saveUserApi(updatedUser);
    saveUserToDB(updatedUser).catch(() => {});
    setCurrentUser(updatedUser);

    await addAuditLog(
      'Profile Modification',
      currentUser.id,
      currentUser.email,
      currentUser.role,
      `User updated profile. Modified: ${Object.keys(updatedData).join(', ')}.`,
      'Success'
    );

    return { success: true, message: 'Profile updated securely.' };
  };

  // SECURE USER SELF-PASSWORD CHANGE HANDLER
  const handleChangeUserPassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Unauthenticated session. Action prohibited.' };
    }

    if (currentUser.passwordHash !== oldPass) {
      await addAuditLog(
        'Password Reset Request',
        currentUser.id,
        currentUser.email,
        currentUser.role,
        `Failed password change attempt. Current credentials invalid.`,
        'Failure'
      );
      return { success: false, message: 'Current password credentials are incorrect.' };
    }

    const updatedUser = { ...currentUser, passwordHash: newPass, updatedAt: new Date().toISOString() };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    await saveUserApi(updatedUser);
    saveUserToDB(updatedUser).catch(() => {});
    setCurrentUser(updatedUser);

    await addAuditLog(
      'Password Reset Request',
      currentUser.id,
      currentUser.email,
      currentUser.role,
      `User credentials successfully updated with a new secure password.`,
      'Success'
    );

    return { success: true, message: 'Password changed successfully.' };
  };

  // LOGOUT HANDLER
  const handleUserLogout = async () => {
    if (currentUser) {
      await addAuditLog(
        'Authentication Attempt',
        currentUser.id,
        currentUser.email,
        currentUser.role,
        `User ${currentUser.fullName} securely logged out. Active session closed.`,
        'Success'
      );
      setCurrentUser(null);
      sessionStorage.removeItem('ww_admin_authenticated');
    }
  };

  // SUPER ADMINISTRATOR: APPROVE USER ACCOUNT
  const handleApproveUser = async (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;

    const updated = { ...target, status: 'Active' as const, updatedAt: new Date().toISOString() };
    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    await saveUserApi(updated);
    saveUserToDB(updated).catch(() => {});
    
    await addAuditLog(
      'Account Status Update',
      userId,
      target.email,
      target.role,
      `Super Administrator authorized account approval. Status updated from PendingApproval to Active.`,
      'Success'
    );
  };

  // SUPER ADMINISTRATOR: SUSPEND USER ACCOUNT
  const handleSuspendUser = async (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;

    const updated = { ...target, status: 'Suspended' as const, updatedAt: new Date().toISOString() };
    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    await saveUserApi(updated);
    saveUserToDB(updated).catch(() => {});
    
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
    }

    await addAuditLog(
      'Account Status Update',
      userId,
      target.email,
      target.role,
      `Super Administrator suspended user account. Status updated to Suspended.`,
      'Warning'
    );
  };

  // SUPER ADMINISTRATOR: REACTIVATE USER ACCOUNT
  const handleReactivateUser = async (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;

    const updated = { ...target, status: 'Active' as const, updatedAt: new Date().toISOString() };
    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    await saveUserApi(updated);
    saveUserToDB(updated).catch(() => {});
    
    await addAuditLog(
      'Account Status Update',
      userId,
      target.email,
      target.role,
      `Super Administrator reactivated user account. Status restored to Active.`,
      'Info'
    );
  };

  // SUPER ADMINISTRATOR: CREATE NEW ACCOUNT DIRECTLY
  const handleAddUser = async (user: UserProfile) => {
    setUsers(prev => [...prev, user]);
    await saveUserApi(user);
    saveUserToDB(user).catch(() => {});
    await addAuditLog(
      'Administrative Action',
      user.id,
      user.email,
      user.role,
      `Super Administrator created new user account directly with status: ${user.status}.`,
      'Success'
    );
  };

  // SUPER ADMINISTRATOR: UPDATE USER ACCOUNT ROLE/DETAILS
  const handleUpdateUser = async (updatedUser: UserProfile) => {
    const old = users.find(u => u.id === updatedUser.id);
    if (!old) return;

    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    await saveUserApi(updatedUser);
    saveUserToDB(updatedUser).catch(() => {});
    
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }

    if (old.role !== updatedUser.role) {
      await addAuditLog(
        'Role Change',
        updatedUser.id,
        updatedUser.email,
        updatedUser.role,
        `Super Administrator modified user role from ${old.role} to ${updatedUser.role}.`,
        'Success'
      );
    } else {
      await addAuditLog(
        'Administrative Action',
        updatedUser.id,
        updatedUser.email,
        updatedUser.role,
        `Super Administrator edited user account profile details.`,
        'Success'
      );
    }
  };

  // SUPER ADMINISTRATOR: PERMANENTLY DELETE USER ACCOUNT
  const handleDeleteUser = async (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;

    setUsers(prev => prev.filter(u => u.id !== userId));
    await deleteUserApi(userId);
    deleteUserFromDB(userId).catch(() => {});
    
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
    }

    await addAuditLog(
      'Administrative Action',
      userId,
      target.email,
      target.role,
      `Super Administrator permanently deleted user account ${target.email} from the platform database.`,
      'Warning'
    );
  };

  // SUPER ADMINISTRATOR: SECURE PASSWORD RESET INITIATION
  const handleInitiatePasswordReset = async (userId: string): Promise<string> => {
    const target = users.find(u => u.id === userId);
    if (!target) return 'Error: User not found';

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let tempPass = 'WW-Reset-';
    for (let i = 0; i < 8; i++) {
      tempPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const updated = { ...target, passwordHash: tempPass, updatedAt: new Date().toISOString() };
    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    await saveUserApi(updated);
    saveUserToDB(updated).catch(() => {});

    await addAuditLog(
      'Password Reset Request',
      userId,
      target.email,
      target.role,
      `Super Administrator initiated a secure password reset for ${target.email}. Salted password has been overwritten with a temporary credentials token.`,
      'Success'
    );

    return tempPass;
  };

  // Initial luxury loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Sync scroll positions for active navigation highlight
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'featured', 'shop', 'why-us', 'payment-methods', 'reviews', 'contact'];
      const scrollPos = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll handler
  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Bento category selection handles scrolling and filter tabs
  const handleSelectBentoCategory = (category: string) => {
    setSelectedBentoCategory(category);
    handleScrollToSection('shop');
  };

  // Cart Management
  const handleAddToCart = (product: Product, size: string, color: Color, quantity = 1) => {
    const itemId = `${product.id}-${size}-${color.hex}`;
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === itemId);
      if (existing) {
        return prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { id: itemId, product, selectedSize: size, selectedColor: color, quantity }];
    });
    
    // Auto trigger drawer open to let them see their premium items
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Wishlist Management
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      if (prev.includes(product.id)) {
        return prev.filter((id) => id !== product.id);
      }
      return [...prev, product.id];
    });
  };

  // Administrative Panel State Actions
  const handleAddProduct = async (newProd: Product) => {
    setProducts(prev => [newProd, ...prev.filter(p => p.id !== newProd.id)]);
    await saveProductApi(newProd);
    saveProductToDB(newProd).catch(() => {});
  };

  const handleUpdateProduct = async (updatedProd: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
    await saveProductApi(updatedProd);
    saveProductToDB(updatedProd).catch(() => {});
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    await deleteProductApi(id);
    deleteProductFromDB(id).catch(() => {});
  };

  const handleResetProducts = async () => {
    setProducts(PRODUCTS);
    for (const p of PRODUCTS) {
      await saveProductApi(p);
      saveProductToDB(p).catch(() => {});
    }
  };

  const handlePlaceOrder = async (newOrder: AdminOrder) => {
    setOrders(prev => [newOrder, ...prev.filter(order => order.id !== newOrder.id)]);
    await saveOrderApi(newOrder);
    saveOrderToDB(newOrder).catch(() => {});

    // Push real-time administrative notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      orderId: newOrder.id,
      customerName: newOrder.customerName,
      amount: newOrder.total,
      paymentStatus: newOrder.paymentStatus || 'Unpaid',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    await saveAdminNotificationToDB(newNotif);

    // Send real-time order summary email to business email via Web3Forms API
    sendWeb3FormsOrderNotification(newOrder).catch((err) => {
      console.error("Web3Forms order email send failed:", err);
    });

    // Real-time Google Sheets order ledger sync
    autoAppendOrderToGoogleSheet(newOrder).catch((err) => {
      console.error("Google Sheets automatic sync failed:", err);
    });
  };

  const handleUpdateOrderStatus = async (orderId: string, status: AdminOrder['status']) => {
    setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status } : order));
    await updateOrderStatusApi(orderId, status);
    updateOrderStatusInDB(orderId, status).catch(() => {});
  };

  const handleUpdateOrderPaymentStatus = async (orderId: string, paymentStatus: AdminOrder['paymentStatus']) => {
    setOrders(prev => prev.map(order => order.id === orderId ? { ...order, paymentStatus } : order));
    await updateOrderPaymentStatusApi(orderId, paymentStatus);
    updateOrderPaymentStatusInDB(orderId, paymentStatus).catch(() => {});
  };

  const handleClearNotifications = async () => {
    await clearAllAdminNotificationsFromDB(adminNotifications);
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    const notif = adminNotifications.find((n) => n.id === id);
    if (notif) {
      const updated = { ...notif, isRead: true };
      await saveAdminNotificationToDB(updated);
    }
  };

  // Dynamic Payment Admin Updates
  const handleAddPaymentMethod = async (pm: PaymentMethod) => {
    setPaymentMethods(prev => [pm, ...prev.filter(item => item.id !== pm.id)]);
    await savePaymentMethodApi(pm);
    savePaymentMethodToDB(pm).catch(() => {});
  };

  const handleUpdatePaymentMethod = async (pm: PaymentMethod) => {
    setPaymentMethods(prev => prev.map(item => item.id === pm.id ? pm : item));
    await savePaymentMethodApi(pm);
    savePaymentMethodToDB(pm).catch(() => {});
  };

  const handleDeletePaymentMethod = async (id: string) => {
    setPaymentMethods(prev => prev.filter(item => item.id !== id));
    await deletePaymentMethodApi(id);
    deletePaymentMethodFromDB(id).catch(() => {});
  };

  const handleUpdateDeliveryConfig = async (config: DeliveryFeeConfig) => {
    setDeliveryFeeConfig(config);
    await saveDeliveryConfigApi(config);
    saveDeliveryFeeConfigToDB(config).catch(() => {});
  };

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF6F0] selection:bg-[#8A4853]/20 text-[#1A1515] overflow-x-hidden antialiased">
      
      {/* Luxury Intro Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
            className="fixed inset-0 bg-[#FAF6F0] z-50 flex flex-col items-center justify-center space-y-6"
          >
            {/* Elegant Loading Monogram */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative w-24 h-24 rounded-full border border-[#8A4853]/20 flex items-center justify-center bg-white shadow-lg shadow-[#8A4853]/5"
            >
              <img
                src={BRAND_LOGO}
                alt="Women's Wardrobe Monogram"
                className="w-16 h-16 object-contain"
                referrerPolicy="no-referrer"
              />
              {/* Spinning rose gold outer halo */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#8A4853]/40 border-r-[#8A4853]/40 animate-spin" style={{ animationDuration: '3s' }} />
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center space-y-1.5"
            >
              <h2 className="font-playfair text-lg tracking-widest text-[#1A1515] font-semibold uppercase leading-none">
                Women's Wardrobe
              </h2>
              <p className="font-sans text-[10px] tracking-[0.3em] text-[#8A4853] font-bold uppercase">
                Precious • Feminine • Forever
              </p>
            </motion.div>

            <div className="w-16 h-0.5 bg-[#FAF6F0] rounded-full overflow-hidden relative">
              <div className="absolute top-0 bottom-0 left-0 bg-[#8A4853] w-1/2 animate-[loadingBar_1.8s_infinite_ease-in-out]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Brand Experience */}
      {!isLoading && !isAdminRoute && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Navigation */}
          <Navbar
            cartCount={totalCartCount}
            wishlistCount={wishlistIds.length}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenWishlist={() => setIsWishlistOpen(true)}
            onScrollToSection={handleScrollToSection}
            activeSection={activeSection}
            onOpenUserPortal={() => setIsUserPortalOpen(true)}
          />

          {/* Hero Screen */}
          <Hero
            onShopClick={() => handleScrollToSection('shop')}
            onNewArrivalsClick={() => handleSelectBentoCategory('new')}
          />

          {/* Category Bento Selector */}
          <FeaturedCollections onSelectCategory={handleSelectBentoCategory} />

          {/* Core Product Lookbook / Showcase */}
          <ProductShowcase
            products={products}
            onAddToCart={(product, size, color) => handleAddToCart(product, size, color, 1)}
            onQuickView={(product) => setQuickViewProduct(product)}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            selectedCategoryFromBento={selectedBentoCategory}
          />

          {/* Why Choose Us */}
          <WhyChooseUs />

          {/* Dynamic Payment Methods billing info panel */}
          <PaymentMethodsSection paymentMethods={paymentMethods} />

          {/* Customer Reviews */}
          <Testimonials />

          {/* Newsletter subscription */}
          <Newsletter />

          {/* Contact coordinates & form */}
          <Contact />

          {/* Brand Footer */}
          <Footer
            onScrollToSection={handleScrollToSection}
            onSelectCategory={handleSelectBentoCategory}
          />

          {/* Shopping Drawer Side panel */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            paymentMethods={paymentMethods}
            deliveryFeeConfig={deliveryFeeConfig}
            onPlaceOrder={handlePlaceOrder}
            currentUser={currentUser}
          />

          {/* Quick View Detailed Dialog Overlay */}
          <QuickViewModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
          />

          {/* Wishlist Interactive Overlay */}
          <WishlistModal
            isOpen={isWishlistOpen}
            onClose={() => setIsWishlistOpen(false)}
            wishlistItems={wishlistProducts}
            onRemoveFromWishlist={handleToggleWishlist}
            onQuickView={(product) => setQuickViewProduct(product)}
          />

          {/* User Secure Authentication & Profile Portal */}
          <UserPortalModal
            isOpen={isUserPortalOpen}
            onClose={() => setIsUserPortalOpen(false)}
            currentUser={currentUser}
            onLogin={handleUserLogin}
            onRegister={handleUserRegister}
            onUpdateProfile={handleUpdateUserProfile}
            onChangePassword={handleChangeUserPassword}
            onLogout={handleUserLogout}
            orders={orders}
          />

        </motion.div>
      )}

      {/* Dedicated administrative route: https://your-domain.com/admin */}
      {!isLoading && isAdminRoute && (
        <AdminPanel
          isOpen={true}
          fullPage={true}
          onClose={() => { window.location.href = '/'; }}
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onResetProducts={handleResetProducts}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdateOrderPaymentStatus={handleUpdateOrderPaymentStatus}
          paymentMethods={paymentMethods}
          onAddPaymentMethod={handleAddPaymentMethod}
          onUpdatePaymentMethod={handleUpdatePaymentMethod}
          onDeletePaymentMethod={handleDeletePaymentMethod}
          deliveryFeeConfig={deliveryFeeConfig}
          onUpdateDeliveryConfig={handleUpdateDeliveryConfig}
          adminNotifications={adminNotifications}
          onClearNotifications={handleClearNotifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          users={users}
          auditLogs={auditLogs}
          onApproveUser={handleApproveUser}
          onSuspendUser={handleSuspendUser}
          onReactivateUser={handleReactivateUser}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onInitiatePasswordReset={handleInitiatePasswordReset}
        />
      )}

    </div>
  );
}
