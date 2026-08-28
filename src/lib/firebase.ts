import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Product, AdminOrder, UserProfile, AuditLogEntry, PaymentMethod, DeliveryFeeConfig } from '../types';
import appletConfig from '../../firebase-applet-config.json';

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: appletConfig.apiKey || "AIzaSyDnU54H35zn18bfbTw0326qoNxV89Ul4nA",
  authDomain: appletConfig.authDomain || "gen-lang-client-0538388568.firebaseapp.com",
  projectId: appletConfig.projectId || "gen-lang-client-0538388568",
  storageBucket: appletConfig.storageBucket || "gen-lang-client-0538388568.firebasestorage.app",
  messagingSenderId: appletConfig.messagingSenderId || "1028064513396",
  appId: appletConfig.appId || "1:1028064513396:web:ce280cd62f2dd1b3f1f021"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Seed function helpers to populate initial collections if they are empty
export async function seedInitialData(
  defaultProducts: Product[],
  defaultUsers: UserProfile[],
  defaultPaymentMethods: PaymentMethod[],
  defaultDelivery: DeliveryFeeConfig,
  defaultAuditLogs: AuditLogEntry[]
) {
  try {
    // 1. Seed Products
    const productsSnap = await getDocs(collection(db, 'products')).catch(() => null);
    if (productsSnap && productsSnap.empty) {
      for (const prod of defaultProducts) {
        await setDoc(doc(db, 'products', prod.id), prod).catch(() => {});
      }
    }

    // 2. Seed Users
    const usersSnap = await getDocs(collection(db, 'users')).catch(() => null);
    if (usersSnap && usersSnap.empty) {
      for (const u of defaultUsers) {
        await setDoc(doc(db, 'users', u.id), u).catch(() => {});
      }
    }

    // 3. Seed Payment Methods
    const pmSnap = await getDocs(collection(db, 'paymentMethods')).catch(() => null);
    if (pmSnap && pmSnap.empty) {
      for (const pm of defaultPaymentMethods) {
        await setDoc(doc(db, 'paymentMethods', pm.id), pm).catch(() => {});
      }
    }

    // 4. Seed Delivery Config
    const deliveryRef = doc(db, 'config', 'delivery');
    const deliverySnap = await getDoc(deliveryRef).catch(() => null);
    if (deliverySnap && !deliverySnap.exists()) {
      await setDoc(deliveryRef, defaultDelivery).catch(() => {});
    }

    // 5. Seed Audit Logs
    const auditSnap = await getDocs(collection(db, 'auditLogs')).catch(() => null);
    if (auditSnap && auditSnap.empty) {
      for (const log of defaultAuditLogs) {
        await setDoc(doc(db, 'auditLogs', log.id), log).catch(() => {});
      }
    }
  } catch (error) {
    // Silent offline fallback
  }
}

// ======================== PRODUCTS ========================

export async function fetchProductsFromDB(): Promise<Product[]> {
  const querySnapshot = await getDocs(collection(db, 'products'));
  const list: Product[] = [];
  querySnapshot.forEach((docSnap) => {
    list.push(docSnap.data() as Product);
  });
  return list;
}

export async function saveProductToDB(product: Product): Promise<void> {
  await setDoc(doc(db, 'products', product.id), product);
}

export async function deleteProductFromDB(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id));
}

// ======================== ORDERS ========================

export async function fetchOrdersFromDB(): Promise<AdminOrder[]> {
  const querySnapshot = await getDocs(collection(db, 'orders'));
  const list: AdminOrder[] = [];
  querySnapshot.forEach((docSnap) => {
    list.push(docSnap.data() as AdminOrder);
  });
  // Sort by date descending
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function saveOrderToDB(order: AdminOrder): Promise<void> {
  await setDoc(doc(db, 'orders', order.id), order);
}

export async function updateOrderStatusInDB(orderId: string, status: AdminOrder['status']): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, { status });
}

export async function updateOrderPaymentStatusInDB(orderId: string, paymentStatus: AdminOrder['paymentStatus']): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, { paymentStatus });
}

// ======================== USERS ========================

export async function fetchUsersFromDB(): Promise<UserProfile[]> {
  const querySnapshot = await getDocs(collection(db, 'users'));
  const list: UserProfile[] = [];
  querySnapshot.forEach((docSnap) => {
    list.push(docSnap.data() as UserProfile);
  });
  return list;
}

export async function saveUserToDB(user: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', user.id), user);
}

export async function deleteUserFromDB(id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', id));
}

// ======================== AUDIT LOGS ========================

export async function fetchAuditLogsFromDB(): Promise<AuditLogEntry[]> {
  const querySnapshot = await getDocs(collection(db, 'auditLogs'));
  const list: AuditLogEntry[] = [];
  querySnapshot.forEach((docSnap) => {
    list.push(docSnap.data() as AuditLogEntry);
  });
  // Sort by timestamp descending
  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function addAuditLogToDB(log: AuditLogEntry): Promise<void> {
  await setDoc(doc(db, 'auditLogs', log.id), log);
}

// ======================== PAYMENT METHODS ========================

export async function fetchPaymentMethodsFromDB(): Promise<PaymentMethod[]> {
  const querySnapshot = await getDocs(collection(db, 'paymentMethods'));
  const list: PaymentMethod[] = [];
  querySnapshot.forEach((docSnap) => {
    list.push(docSnap.data() as PaymentMethod);
  });
  return list;
}

export async function savePaymentMethodToDB(pm: PaymentMethod): Promise<void> {
  await setDoc(doc(db, 'paymentMethods', pm.id), pm);
}

export async function deletePaymentMethodFromDB(id: string): Promise<void> {
  await deleteDoc(doc(db, 'paymentMethods', id));
}

// ======================== DELIVERY FEE CONFIG ========================

export async function fetchDeliveryFeeConfigFromDB(): Promise<DeliveryFeeConfig> {
  const docRef = doc(db, 'config', 'delivery');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as DeliveryFeeConfig;
  }
  return { isFree: false, amount: 250 };
}

export async function saveDeliveryFeeConfigToDB(config: DeliveryFeeConfig): Promise<void> {
  await setDoc(doc(db, 'config', 'delivery'), config);
}

// ======================== ADMIN NOTIFICATIONS ========================

export async function fetchAdminNotificationsFromDB(): Promise<any[]> {
  const querySnapshot = await getDocs(collection(db, 'notifications'));
  const list: any[] = [];
  querySnapshot.forEach((docSnap) => {
    list.push(docSnap.data());
  });
  return list;
}

export async function saveAdminNotificationToDB(notif: any): Promise<void> {
  await setDoc(doc(db, 'notifications', notif.id), notif);
}

export async function deleteAdminNotificationFromDB(id: string): Promise<void> {
  await deleteDoc(doc(db, 'notifications', id));
}

export async function clearAllAdminNotificationsFromDB(notifs: any[]): Promise<void> {
  for (const n of notifs) {
    await deleteDoc(doc(db, 'notifications', n.id));
  }
}
