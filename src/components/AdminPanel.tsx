import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Lock, Unlock, ShoppingBag, Plus, Edit3, Trash2, 
  List, CheckCircle, DollarSign, RefreshCw, 
  Tag, Image as ImageIcon, Check, AlertCircle, Sparkles, ShieldAlert,
  Copy, Eye, EyeOff, UploadCloud, Truck, Settings, MessageCircle, Mail, Send, CheckCircle2,
  Shield, Key, Users, UserCheck, UserX, FileText, Activity, ShieldCheck, Terminal,
  FileSpreadsheet, ExternalLink, DownloadCloud, ArrowUpRight, CloudLightning, Database, Globe,
  FolderSearch, ImagePlus, FileUp, FolderArchive, Building2, Smartphone, Zap
} from 'lucide-react';
import { Product, Color, AdminOrder, PaymentMethod, DeliveryFeeConfig, UserProfile, AuditLogEntry, UserRole, UserStatus } from '../types';
import { sendTestEmailNotification, OFFICIAL_BUSINESS_EMAIL, WEB3FORMS_ACCESS_KEY, NotificationResult } from '../lib/web3forms';
import {
  connectGoogleSheets,
  disconnectGoogleSheets,
  getStoredGoogleToken,
  getStoredGoogleUser,
  getLastOrdersSheetId,
  getLastProductsSheetId,
  getAutoSyncOrdersEnabled,
  setAutoSyncOrdersEnabled,
  exportOrdersToGoogleSheets,
  exportProductsToGoogleSheets,
  exportCustomersToGoogleSheets,
  exportAuditLogsToGoogleSheets,
  importProductsFromGoogleSheets,
  clearGoogleSpreadsheet,
  GoogleUserInfo,
  SheetsExportResult
} from '../lib/googleSheets';
import { openGooglePicker, PickedFile } from '../lib/googlePicker';
import { 
  getMerchantWhatsAppNumber, 
  setMerchantWhatsAppNumber, 
  getMerchantWhatsAppOrderLink, 
  getCustomerWhatsAppOrderLink, 
  formatOrderWhatsAppMessage 
} from '../lib/whatsapp';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fullPage?: boolean;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onResetProducts: () => void;
  orders: AdminOrder[];
  onUpdateOrderStatus: (orderId: string, status: AdminOrder['status']) => void;
  onUpdateOrderPaymentStatus?: (orderId: string, paymentStatus: AdminOrder['paymentStatus']) => void;

  // New Payment & Delivery Props
  paymentMethods: PaymentMethod[];
  onAddPaymentMethod: (pm: PaymentMethod) => void;
  onUpdatePaymentMethod: (pm: PaymentMethod) => void;
  onDeletePaymentMethod: (id: string) => void;
  deliveryFeeConfig: DeliveryFeeConfig;
  onUpdateDeliveryConfig: (config: DeliveryFeeConfig) => void;

  // Real-time Notifications Props
  adminNotifications?: any[];
  onClearNotifications?: () => void;
  onMarkNotificationAsRead?: (id: string) => void;

  // Security and User Lifecycle Props
  users: UserProfile[];
  auditLogs: AuditLogEntry[];
  onApproveUser: (userId: string) => void;
  onSuspendUser: (userId: string) => void;
  onReactivateUser: (userId: string) => void;
  onAddUser: (user: UserProfile) => void;
  onUpdateUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
  onInitiatePasswordReset: (userId: string) => Promise<string> | string;
}

// Reusable Drag & Drop Image Upload Component
interface DragDropUploadProps {
  onUpload: (base64: string) => void;
  currentImage?: string;
  label?: string;
}

function DragDropUpload({ onUpload, currentImage, label = "Drag & drop image here, or click to browse" }: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_width = 500;
          let width = img.width;
          let height = img.height;
          
          if (width > max_width) {
            height = Math.round((height * max_width) / width);
            width = max_width;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            onUpload(compressedBase64);
          } else {
            onUpload(reader.result as string);
          }
        };
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const uniqueId = `file-upload-${Math.floor(Math.random() * 100000)}`;

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
        isDragging
          ? "border-[#8A4853] bg-[#8A4853]/5 scale-[0.99]"
          : "border-[#F5EFEB] bg-[#FAF6F0] hover:border-[#8A4853]/50"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        id={uniqueId}
      />
      <label htmlFor={uniqueId} className="cursor-pointer block space-y-2">
        {currentImage ? (
          <div className="relative mx-auto w-24 h-24 rounded-xl overflow-hidden border border-[#F5EFEB] bg-white">
            <img src={currentImage} alt="Uploaded preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-[9px] font-bold uppercase tracking-wider">Change Image</span>
            </div>
          </div>
        ) : (
          <div className="py-2 flex flex-col items-center justify-center space-y-2">
            <UploadCloud className="w-8 h-8 text-[#A38F85] stroke-1.5" />
            <p className="font-sans text-[10px] text-[#5A4A42] font-semibold">{label}</p>
            <p className="font-sans text-[8px] text-[#A38F85]">Supports JPG, PNG, WEBP, SVG</p>
          </div>
        )}
      </label>
    </div>
  );
}

export default function AdminPanel({
  isOpen,
  onClose,
  fullPage = false,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProducts,
  orders,
  onUpdateOrderStatus,
  onUpdateOrderPaymentStatus,
  paymentMethods,
  onAddPaymentMethod,
  onUpdatePaymentMethod,
  onDeletePaymentMethod,
  deliveryFeeConfig,
  onUpdateDeliveryConfig,
  adminNotifications = [],
  onClearNotifications,
  onMarkNotificationAsRead,
  users = [],
  auditLogs = [],
  onApproveUser,
  onSuspendUser,
  onReactivateUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onInitiatePasswordReset
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'payments' | 'delivery' | 'security' | 'sheets'>('catalog');
  
  // Google Sheets Integration States
  const [googleUser, setGoogleUser] = useState<GoogleUserInfo | null>(() => getStoredGoogleUser());
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isExportingSheets, setIsExportingSheets] = useState<string | null>(null);
  const [sheetsNotice, setSheetsNotice] = useState<{ type: 'success' | 'error'; message: string; url?: string } | null>(null);
  const [autoSyncOrders, setAutoSyncOrders] = useState<boolean>(() => getAutoSyncOrdersEnabled());
  const [importSheetUrl, setImportSheetUrl] = useState('');
  const [isImportingProducts, setIsImportingProducts] = useState(false);
  const [importNotice, setImportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastOrdersSheet, setLastOrdersSheet] = useState<string | null>(() => getLastOrdersSheetId());
  const [lastProductsSheet, setLastProductsSheet] = useState<string | null>(() => getLastProductsSheetId());
  const [isPickingWithGoogle, setIsPickingWithGoogle] = useState<string | null>(null);
  const [recentPickedFiles, setRecentPickedFiles] = useState<PickedFile[]>([]);
  const [pickedFileNotice, setPickedFileNotice] = useState<{ name: string; url: string; mimeType: string } | null>(null);

  // Security Tab States
  const [auditFilter, setAuditFilter] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [tempPasswordShown, setTempPasswordShown] = useState('');
  const [tempPasswordUser, setTempPasswordUser] = useState('');

  // User form inputs
  const [uEmail, setUEmail] = useState('');
  const [uName, setUName] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uAddress, setUAddress] = useState('');
  const [uRole, setURole] = useState<UserRole>('Customer');
  const [uStatus, setUStatus] = useState<UserStatus>('Active');
  const [uPassword, setUPassword] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Form States for Product Add/Edit
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<Product['category']>('Premium Bras');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodImage, setProdImage] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodRating, setProdRating] = useState(5.0);
  const [prodIsNew, setProdIsNew] = useState(false);
  const [prodIsBest, setProdIsBest] = useState(false);
  
  // Custom arrays state for Sizes & Colors
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<Color[]>([]);
  
  // Helper custom color input state
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#8A4853');
  const [customSizeText, setCustomSizeText] = useState('');

  // Form States for Payment Method Add/Edit
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [payName, setPayName] = useState('');
  const [payAccountNumber, setPayAccountNumber] = useState('');
  const [payAccountTitle, setPayAccountTitle] = useState('');
  const [payIcon, setPayIcon] = useState('');
  const [payIsActive, setPayIsActive] = useState(true);

  // Form States for Delivery Setting
  const [deliveryIsFree, setDeliveryIsFree] = useState(deliveryFeeConfig.isFree);
  const [deliveryAmount, setDeliveryAmount] = useState(deliveryFeeConfig.amount);
  const [deliverySaveNotice, setDeliverySaveNotice] = useState(false);

  // WhatsApp Merchant System States
  const [merchantWhatsApp, setMerchantWhatsApp] = useState(() => getMerchantWhatsAppNumber());
  const [whatsAppSaveNotice, setWhatsAppSaveNotice] = useState(false);
  const [copiedOrderSlipId, setCopiedOrderSlipId] = useState<string | null>(null);

  // Notification Diagnostics States
  const [isTestingNotif, setIsTestingNotif] = useState(false);
  const [testNotifResult, setTestNotifResult] = useState<NotificationResult | null>(null);
  const [customWeb3Key, setCustomWeb3Key] = useState(WEB3FORMS_ACCESS_KEY);

  const handleTestNotification = async () => {
    setIsTestingNotif(true);
    setTestNotifResult(null);
    try {
      const res = await sendTestEmailNotification(customWeb3Key);
      setTestNotifResult(res);
    } catch (err) {
      setTestNotifResult({
        web3formsSuccess: false,
        web3formsMessage: 'Failed to connect to email gateway',
        formSubmitSuccess: false,
        formSubmitMessage: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setIsTestingNotif(false);
    }
  };

  // Sync internal delivery config state with props when tab loads or props change
  useEffect(() => {
    setDeliveryIsFree(deliveryFeeConfig.isFree);
    setDeliveryAmount(deliveryFeeConfig.amount);
  }, [deliveryFeeConfig, activeTab]);

  // Load passcode from session storage if any
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('ww_admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim();
    const matchedUser = users.find(
      u => (u.role === 'SuperAdmin' || u.role === 'StoreManager') && 
           u.status === 'Active' && 
           u.passwordHash === cleanPass
    );
    if (matchedUser) {
      setIsAuthenticated(true);
      setPasscodeError(false);
      sessionStorage.setItem('ww_admin_authenticated', 'true');
    } else {
      setPasscodeError(true);
      setPasscode('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ww_admin_authenticated');
  };

  // Google Sheets Action Handlers
  const handleConnectGoogleAccount = async () => {
    setIsConnectingGoogle(true);
    setSheetsNotice(null);
    try {
      const res = await connectGoogleSheets();
      setGoogleUser(res.user);
      setSheetsNotice({
        type: 'success',
        message: `Successfully connected Google Account: ${res.user.email}!`,
      });
    } catch (err: any) {
      setSheetsNotice({
        type: 'error',
        message: err.message || 'Failed to authenticate with Google.',
      });
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleDisconnectGoogleAccount = async () => {
    await disconnectGoogleSheets();
    setGoogleUser(null);
    setSheetsNotice({
      type: 'success',
      message: 'Google Account successfully disconnected.',
    });
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setAutoSyncOrders(enabled);
    setAutoSyncOrdersEnabled(enabled);
  };

  const handleExportOrders = async () => {
    setIsExportingSheets('orders');
    setSheetsNotice(null);
    try {
      const res = await exportOrdersToGoogleSheets(orders);
      setLastOrdersSheet(res.spreadsheetId);
      setSheetsNotice({
        type: 'success',
        message: `Exported ${res.rowCount} orders to Google Sheets!`,
        url: res.spreadsheetUrl,
      });
    } catch (err: any) {
      setSheetsNotice({
        type: 'error',
        message: err.message || 'Failed to export orders to Google Sheets.',
      });
    } finally {
      setIsExportingSheets(null);
    }
  };

  const handleExportProducts = async () => {
    setIsExportingSheets('products');
    setSheetsNotice(null);
    try {
      const res = await exportProductsToGoogleSheets(products);
      setLastProductsSheet(res.spreadsheetId);
      setSheetsNotice({
        type: 'success',
        message: `Exported ${res.rowCount} catalog products to Google Sheets!`,
        url: res.spreadsheetUrl,
      });
    } catch (err: any) {
      setSheetsNotice({
        type: 'error',
        message: err.message || 'Failed to export products to Google Sheets.',
      });
    } finally {
      setIsExportingSheets(null);
    }
  };

  const handleExportCustomers = async () => {
    setIsExportingSheets('customers');
    setSheetsNotice(null);
    try {
      const res = await exportCustomersToGoogleSheets(users);
      setSheetsNotice({
        type: 'success',
        message: `Exported ${res.rowCount} customer profiles to Google Sheets!`,
        url: res.spreadsheetUrl,
      });
    } catch (err: any) {
      setSheetsNotice({
        type: 'error',
        message: err.message || 'Failed to export customers to Google Sheets.',
      });
    } finally {
      setIsExportingSheets(null);
    }
  };

  const handleExportAudit = async () => {
    setIsExportingSheets('audit');
    setSheetsNotice(null);
    try {
      const res = await exportAuditLogsToGoogleSheets(auditLogs);
      setSheetsNotice({
        type: 'success',
        message: `Exported ${res.rowCount} audit security records to Google Sheets!`,
        url: res.spreadsheetUrl,
      });
    } catch (err: any) {
      setSheetsNotice({
        type: 'error',
        message: err.message || 'Failed to export audit logs to Google Sheets.',
      });
    } finally {
      setIsExportingSheets(null);
    }
  };

  const handleClearOrdersSheet = async () => {
    if (!lastOrdersSheet) {
      alert('No active Orders Google Sheet found to clear.');
      return;
    }
    if (!window.confirm('Are you sure you want to clear all data rows from the Orders Google Sheet? (Headers will be preserved)')) {
      return;
    }
    setIsExportingSheets('clear_orders');
    setSheetsNotice(null);
    try {
      const res = await clearGoogleSpreadsheet(lastOrdersSheet, 'Orders');
      setSheetsNotice({
        type: 'success',
        message: res.message || 'Orders sheet cleared successfully!',
      });
    } catch (err: any) {
      setSheetsNotice({
        type: 'error',
        message: err.message || 'Failed to clear orders sheet.',
      });
    } finally {
      setIsExportingSheets(null);
    }
  };

  const handleClearProductsSheet = async () => {
    if (!lastProductsSheet) {
      alert('No active Catalog Google Sheet found to clear.');
      return;
    }
    if (!window.confirm('Are you sure you want to clear all data rows from the Catalog Google Sheet? (Headers will be preserved)')) {
      return;
    }
    setIsExportingSheets('clear_products');
    setSheetsNotice(null);
    try {
      const res = await clearGoogleSpreadsheet(lastProductsSheet, 'Catalog');
      setSheetsNotice({
        type: 'success',
        message: res.message || 'Product catalog sheet cleared successfully!',
      });
    } catch (err: any) {
      setSheetsNotice({
        type: 'error',
        message: err.message || 'Failed to clear catalog sheet.',
      });
    } finally {
      setIsExportingSheets(null);
    }
  };

  const handleImportProducts = async (e: FormEvent) => {
    e.preventDefault();
    if (!importSheetUrl.trim()) return;
    setIsImportingProducts(true);
    setImportNotice(null);
    try {
      const imported = await importProductsFromGoogleSheets(importSheetUrl);
      if (imported.length === 0) {
        throw new Error('No valid products found in the specified sheet.');
      }
      for (const prod of imported) {
        onAddProduct(prod);
      }
      setImportNotice({
        type: 'success',
        message: `Successfully imported ${imported.length} product(s) into your catalog from Google Sheets!`,
      });
      setImportSheetUrl('');
    } catch (err: any) {
      setImportNotice({
        type: 'error',
        message: err.message || 'Failed to import products from Google Sheets.',
      });
    } finally {
      setIsImportingProducts(false);
    }
  };

  // Google Picker Actions
  const handlePickProductImageFromDrive = async () => {
    setIsPickingWithGoogle('image');
    try {
      const file = await openGooglePicker({
        viewType: 'images',
        title: 'Select Product Photography from Google Drive',
      });
      if (file) {
        // High quality web content direct URL or thumbnail
        const directUrl = file.thumbnailUrl 
          ? file.thumbnailUrl.replace(/=s\d+/, '=s1200') 
          : `https://drive.google.com/uc?export=view&id=${file.id}`;
        
        setProdImage(directUrl);
        setRecentPickedFiles(prev => [file, ...prev.filter(p => p.id !== file.id)].slice(0, 8));
      }
    } catch (err: any) {
      console.error('Google Picker Image error:', err);
      alert(err.message || 'Failed to open Google Drive image picker.');
    } finally {
      setIsPickingWithGoogle(null);
    }
  };

  const handlePickSheetForImport = async () => {
    setIsPickingWithGoogle('sheet');
    try {
      const file = await openGooglePicker({
        viewType: 'spreadsheets',
        title: 'Select Google Spreadsheet to Import Catalog',
      });
      if (file) {
        setImportSheetUrl(file.id || file.url);
        setPickedFileNotice({ name: file.name, url: file.url, mimeType: file.mimeType });
        setRecentPickedFiles(prev => [file, ...prev.filter(p => p.id !== file.id)].slice(0, 8));
      }
    } catch (err: any) {
      console.error('Google Picker Sheet error:', err);
      alert(err.message || 'Failed to open Google Drive spreadsheet picker.');
    } finally {
      setIsPickingWithGoogle(null);
    }
  };

  const handleOpenDrivePickerGeneral = async (viewType: 'all' | 'images' | 'spreadsheets' | 'upload') => {
    setIsPickingWithGoogle('general');
    try {
      const file = await openGooglePicker({
        viewType,
        title: viewType === 'upload' ? 'Upload Files to Google Drive Workspace' : 'Browse Google Drive Workspace',
      });
      if (file) {
        setRecentPickedFiles(prev => [file, ...prev.filter(p => p.id !== file.id)].slice(0, 8));
        setSheetsNotice({
          type: 'success',
          message: `Selected file from Drive: "${file.name}"`,
          url: file.url,
        });
      }
    } catch (err: any) {
      console.error('Google Picker General error:', err);
      setSheetsNotice({
        type: 'error',
        message: err.message || 'Failed to open Google Drive Picker.',
      });
    } finally {
      setIsPickingWithGoogle(null);
    }
  };

  // Populate form fields for Edit or Reset Form for Add
  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAddingNew(false);
    setProdName(product.name);
    setProdCategory(product.category);
    setProdPrice(product.price);
    setProdImage(product.image);
    setProdDescription(product.description || '');
    setProdRating(product.rating || 5.0);
    setProdIsNew(!!product.isNewArrival);
    setProdIsBest(!!product.isBestSeller);
    setSelectedSizes(product.sizes);
    setSelectedColors(product.colors);
  };

  const startAddNew = () => {
    setEditingProduct(null);
    setIsAddingNew(true);
    setProdName('');
    setProdCategory('Premium Bras');
    setProdPrice(1500);
    setProdImage('https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=600&auto=format&fit=crop');
    setProdDescription('Breathtaking luxury garment handcrafted from premium materials with delicate rose accents for absolute grace.');
    setProdRating(4.8);
    setProdIsNew(true);
    setProdIsBest(false);
    setSelectedSizes(['S', 'M', 'L']);
    setSelectedColors([
      { name: 'Rosewood', hex: '#8A4853' },
      { name: 'Blush Pink', hex: '#E2B4BD' }
    ]);
  };

  const handleSaveProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodImage) {
      alert('Please fill out essential fields (Name, Price, Image).');
      return;
    }

    const payload: Product = {
      id: editingProduct ? editingProduct.id : `custom-prod-${Date.now()}`,
      name: prodName,
      category: prodCategory,
      price: Number(prodPrice),
      image: prodImage,
      description: prodDescription,
      sizes: selectedSizes.length > 0 ? selectedSizes : ['Standard'],
      colors: selectedColors.length > 0 ? selectedColors : [{ name: 'Classic', hex: '#1A1515' }],
      rating: Number(prodRating),
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 1,
      features: editingProduct ? editingProduct.features : ['Premium stitching', 'Lace embroidery detailing', 'Breathable ultra-stretch mesh'],
      isNewArrival: prodIsNew,
      isBestSeller: prodIsBest,
    };

    if (editingProduct) {
      onUpdateProduct(payload);
    } else {
      onAddProduct(payload);
    }

    setEditingProduct(null);
    setIsAddingNew(false);
  };

  const handleAddSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const exists = selectedColors.some(c => c.hex.toLowerCase() === newColorHex.toLowerCase());
    if (exists) return;
    setSelectedColors([...selectedColors, { name: newColorName, hex: newColorHex }]);
    setNewColorName('');
  };

  const handleRemoveColor = (hex: string) => {
    setSelectedColors(selectedColors.filter(c => c.hex !== hex));
  };

  // --- Payment Methods Logic ---
  const startEditPayment = (pm: PaymentMethod) => {
    setEditingPayment(pm);
    setIsAddingPayment(false);
    setPayName(pm.name);
    setPayAccountNumber(pm.accountNumber);
    setPayAccountTitle(pm.accountTitle || '');
    setPayIcon(pm.icon || '');
    setPayIsActive(pm.isActive);
  };

  const startAddNewPayment = () => {
    setEditingPayment(null);
    setIsAddingPayment(true);
    setPayName('');
    setPayAccountNumber('');
    setPayAccountTitle('');
    setPayIcon('');
    setPayIsActive(true);
  };

  const handleSavePayment = (e: FormEvent) => {
    e.preventDefault();
    if (!payName || !payAccountNumber) {
      alert('Please fill out Payment Method Name and Account/IBAN.');
      return;
    }

    const payload: PaymentMethod = {
      id: editingPayment ? editingPayment.id : `payment-${Date.now()}`,
      name: payName,
      accountNumber: payAccountNumber,
      accountTitle: payAccountTitle,
      icon: payIcon,
      isActive: payIsActive
    };

    if (editingPayment) {
      onUpdatePaymentMethod(payload);
    } else {
      onAddPaymentMethod(payload);
    }

    setEditingPayment(null);
    setIsAddingPayment(false);
  };

  // Preset quick templates for pakistani payment methods
  const applyPaymentTemplate = (type: 'ubl' | 'easypaisa' | 'jazzcash' | 'whatsapp') => {
    if (type === 'ubl') {
      setPayName('Bank Account (UBL)');
      setPayAccountNumber('Pk670109000342018576');
      setPayAccountTitle('Adil Naseer / Women\'s Wardrobe');
      setPayIcon('https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=200&auto=format&fit=crop'); // banking image
    } else if (type === 'easypaisa') {
      setPayName('Easypaisa');
      setPayAccountNumber('03422939080');
      setPayAccountTitle('Adil Naseer');
      setPayIcon('https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?q=80&w=200&auto=format&fit=crop');
    } else if (type === 'jazzcash') {
      setPayName('JazzCash');
      setPayAccountNumber('03422939080');
      setPayAccountTitle('Adil Naseer');
      setPayIcon('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=200&auto=format&fit=crop');
    } else if (type === 'whatsapp') {
      setPayName('WhatsApp Order Help');
      setPayAccountNumber('03422939080');
      setPayAccountTitle('Chat support & pay');
      setPayIcon('https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=200&auto=format&fit=crop');
    }
  };

  // --- Delivery Configuration Saving ---
  const handleSaveDeliveryConfig = (e: FormEvent) => {
    e.preventDefault();
    onUpdateDeliveryConfig({
      isFree: deliveryIsFree,
      amount: Number(deliveryAmount)
    });
    setDeliverySaveNotice(true);
    setTimeout(() => setDeliverySaveNotice(false), 3000);
  };

  // Copy helper
  const handleCopyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch {}
  };

  // Metrics
  const totalSalesVal = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={fullPage
        ? "fixed inset-0 z-50 flex items-stretch justify-stretch bg-[#FAF6F0]"
        : "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      }>
        {/* Backdrop overlay: only used by legacy modal mode */}
        {!fullPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
        )}

        {/* Full administrative workspace / legacy modal window */}
        <motion.div
          initial={fullPage ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 30 }}
          animate={fullPage ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={fullPage ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 30 }}
          className={fullPage
            ? "relative bg-[#FAF6F0] w-full h-full min-h-screen overflow-hidden z-10 flex flex-col"
            : "relative bg-[#FAF6F0] rounded-[24px] sm:rounded-[32px] w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden z-10 shadow-2xl border border-white/20 flex flex-col"
          }
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 bg-[#8A4853] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center">
                <Lock size={14} />
              </div>
              <div>
                <h3 className="font-playfair text-base sm:text-lg font-semibold leading-tight">Boutique Executive Suite</h3>
                <p className="font-sans text-[8px] sm:text-[9px] tracking-widest text-white/70 uppercase font-bold">
                  Catalog Editor, Payment Config &amp; Order Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isAuthenticated && (
                <div className="relative group shrink-0">
                  <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none relative">
                    <AlertCircle size={15} />
                    {adminNotifications.filter(n => !n.isRead).length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-[#8A4853] animate-bounce">
                        {adminNotifications.filter(n => !n.isRead).length}
                      </span>
                    )}
                  </button>
                  
                  {/* Dropdown Menu on hover or click */}
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-neutral-100 hidden group-hover:block hover:block z-50 text-neutral-800 p-2 space-y-1.5 transition-all">
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-2 px-2 pt-1">
                      <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#A38F85]">Real-time Inbound Alerts</span>
                      {adminNotifications.length > 0 && (
                        <button
                          onClick={onClearNotifications}
                          className="text-[9px] text-[#8A4853] font-bold hover:underline"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {adminNotifications.length === 0 ? (
                        <p className="text-center py-6 text-[10px] text-neutral-400 font-sans">No recent incoming order alerts.</p>
                      ) : (
                        adminNotifications.map(notif => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (onMarkNotificationAsRead) onMarkNotificationAsRead(notif.id);
                              setActiveTab('orders');
                            }}
                            className={`p-2 rounded-lg text-[11px] cursor-pointer text-left hover:bg-neutral-50 transition-colors flex items-start space-x-2 border border-transparent ${
                              !notif.isRead ? 'bg-emerald-50/40 border-emerald-100' : ''
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.isRead ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                            <div className="flex-grow space-y-0.5">
                              <div className="flex justify-between">
                                <strong className="text-neutral-800 font-bold">{notif.customerName}</strong>
                                <span className="text-[8px] text-neutral-400">{notif.timestamp}</span>
                              </div>
                              <p className="text-[#8A4853] font-semibold text-[10px]">{notif.orderId} • Rs. {notif.amount.toLocaleString()}</p>
                              <p className="text-[9px] text-neutral-500 uppercase tracking-wide">Status: {notif.paymentStatus}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg font-sans text-[9px] sm:text-[10px] uppercase font-bold tracking-wider transition-colors"
                >
                  Log Out
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none"
                aria-label={fullPage ? "Return to storefront" : "Close"}
                title={fullPage ? "Return to storefront" : "Close"}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Locked View if not authenticated */}
          {!isAuthenticated ? (
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto my-6 sm:my-12">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#8A4853]/5 text-[#8A4853] flex items-center justify-center border border-[#8A4853]/10">
                <ShieldAlert size={26} />
              </div>
              <div className="space-y-2">
                <h4 className="font-playfair text-lg sm:text-xl text-[#1A1515] font-bold">Unseal Executive Access</h4>
                <p className="font-sans text-xs text-[#5A4A42]">
                  This secure administrative terminal allows updating prices, adding new inventory, configuring delivery rates, and processing customer orders. Enter your passkey below.
                </p>
              </div>

              <form onSubmit={handleLogin} className="w-full space-y-3">
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Enter security passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full bg-white border border-[#F5EFEB] rounded-xl px-4 py-3 text-center text-xs text-[#1A1515] placeholder-[#A38F85] focus:outline-none focus:ring-1 focus:ring-[#8A4853]"
                    id="admin-passcode"
                  />
                </div>
                
                {passcodeError && (
                  <div className="flex items-center justify-center space-x-1 text-red-600 font-sans text-[10px] font-semibold bg-red-50 p-2 rounded-lg">
                    <AlertCircle size={12} />
                    <span>Incorrect code. Please try again or contact support.</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#8A4853] hover:bg-[#70343e] text-white py-3 rounded-xl font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 shadow flex items-center justify-center space-x-2"
                >
                  <span>Authenticate Access</span>
                  <Unlock size={12} />
                </button>
              </form>

              <p className="font-sans text-[9px] text-[#A38F85] uppercase tracking-wider">
                Authorized Executive Personnel Only
              </p>
            </div>
          ) : (
            /* Unlocked Executive Panel */
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
              {/* Real-time Toast Notification Overlay */}
              <div className="absolute top-4 right-4 z-[99] max-w-sm space-y-2 pointer-events-auto">
                <AnimatePresence>
                  {adminNotifications.filter(n => !n.isRead).map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 50, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 50, scale: 0.95 }}
                      className="bg-white/95 backdrop-blur-md border-l-4 border-emerald-500 rounded-xl p-4 shadow-xl flex items-start space-x-3 text-xs w-80 relative overflow-hidden"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <ShoppingBag size={14} className="animate-pulse" />
                      </div>
                      <div className="flex-grow space-y-0.5 text-left">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-neutral-800 uppercase text-[9px] tracking-wide">New Inbound Order!</span>
                          <span className="text-[8px] text-neutral-400 font-mono">{notif.timestamp}</span>
                        </div>
                        <p className="font-sans font-semibold text-[#8A4853] text-[10px]">#{notif.orderId}</p>
                        <p className="text-neutral-600 font-semibold leading-snug">Ordered by: {notif.customerName}</p>
                        <p className="text-neutral-500">Valued at: <strong className="font-bold text-neutral-800">Rs. {notif.amount.toLocaleString()}</strong></p>
                        <div className="flex items-center space-x-2 pt-1">
                          <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">{notif.paymentStatus}</span>
                          <button
                            onClick={() => {
                              if (onMarkNotificationAsRead) onMarkNotificationAsRead(notif.id);
                              setActiveTab('orders');
                            }}
                            className="text-xs text-[#8A4853] font-bold hover:underline"
                          >
                            View Order
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => onMarkNotificationAsRead && onMarkNotificationAsRead(notif.id)}
                        className="text-neutral-400 hover:text-neutral-600 p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {/* Sidebar Navigation */}
              <div className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-[#F5EFEB] p-3 sm:p-4 flex flex-row md:flex-col justify-start md:justify-between shrink-0 gap-1.5 sm:gap-2 overflow-x-auto md:overflow-x-visible">
                <div className="space-y-1 md:space-y-1.5 flex flex-row md:flex-col w-full min-w-max md:min-w-0">
                  <span className="hidden md:block font-sans text-[9px] font-bold text-[#A38F85] uppercase tracking-[0.2em] mb-3 pl-2">
                    Executive Operations
                  </span>
                  
                  <button
                    onClick={() => { setActiveTab('catalog'); setIsAddingNew(false); setEditingProduct(null); }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors text-left shrink-0 md:w-full ${
                      activeTab === 'catalog'
                        ? 'bg-[#8A4853]/5 text-[#8A4853]'
                        : 'text-[#5A4A42] hover:bg-neutral-50 hover:text-[#1A1515]'
                    }`}
                  >
                    <List size={13} />
                    <span>Catalog</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('orders'); }}
                    className={`flex items-center justify-between space-x-2 px-3 py-2 rounded-xl font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors text-left shrink-0 md:w-full ${
                      activeTab === 'orders'
                        ? 'bg-[#8A4853]/5 text-[#8A4853]'
                        : 'text-[#5A4A42] hover:bg-neutral-50 hover:text-[#1A1515]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <ShoppingBag size={13} />
                      <span>Orders</span>
                    </div>
                    {pendingOrdersCount > 0 && (
                      <span className="bg-[#8A4853] text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold leading-none shrink-0">
                        {pendingOrdersCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => { setActiveTab('payments'); setIsAddingPayment(false); setEditingPayment(null); }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors text-left shrink-0 md:w-full ${
                      activeTab === 'payments'
                        ? 'bg-[#8A4853]/5 text-[#8A4853]'
                        : 'text-[#5A4A42] hover:bg-neutral-50 hover:text-[#1A1515]'
                    }`}
                  >
                    <DollarSign size={13} />
                    <span>Payment Channels</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('delivery'); }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors text-left shrink-0 md:w-full ${
                      activeTab === 'delivery'
                        ? 'bg-[#8A4853]/5 text-[#8A4853]'
                        : 'text-[#5A4A42] hover:bg-neutral-50 hover:text-[#1A1515]'
                    }`}
                  >
                    <Truck size={13} />
                    <span>Delivery Config</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('security'); }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors text-left shrink-0 md:w-full ${
                      activeTab === 'security'
                        ? 'bg-[#8A4853]/5 text-[#8A4853]'
                        : 'text-[#5A4A42] hover:bg-neutral-50 hover:text-[#1A1515]'
                    }`}
                  >
                    <Shield size={13} />
                    <span>Users &amp; Security</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('sheets'); }}
                    className={`flex items-center justify-between space-x-2 px-3 py-2 rounded-xl font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors text-left shrink-0 md:w-full ${
                      activeTab === 'sheets'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/50'
                        : 'text-[#5A4A42] hover:bg-neutral-50 hover:text-[#1A1515]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <FileSpreadsheet size={13} className={activeTab === 'sheets' ? 'text-emerald-600' : 'text-emerald-700'} />
                      <span>Google Sheets</span>
                    </div>
                    {googleUser && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Connected" />
                    )}
                  </button>
                </div>

                {/* Bottom Control Actions (Reset/Restore Seed) */}
                <div className="w-full pt-3 border-t border-[#F5EFEB] space-y-2 hidden md:block">
                  <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                    <p className="font-sans text-[9px] text-[#8A4853] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles size={10} /> Emergency Catalog
                    </p>
                    <p className="font-sans text-[8px] text-[#5A4A42] leading-normal mb-2">
                      Restore default inventory and clear custom listings instantly.
                    </p>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to reset all products back to standard default values? Any customized creations will be erased.')) {
                          onResetProducts();
                          setIsAddingNew(false);
                          setEditingProduct(null);
                        }
                      }}
                      className="w-full bg-white hover:bg-rose-50 border border-rose-200 text-[#8A4853] py-1.5 rounded-lg text-[8px] tracking-widest font-bold uppercase transition-all duration-300 flex items-center justify-center space-x-1"
                    >
                      <RefreshCw size={9} />
                      <span>Reset Catalog</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Main Tab Workspace */}
              <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
                
                {/* Metrics Stats Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0">
                  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#F5EFEB] shadow-xs flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <DollarSign size={16} />
                    </div>
                    <div>
                      <p className="font-sans text-[8px] sm:text-[10px] text-[#A38F85] uppercase tracking-wider">Gross Sales</p>
                      <p className="font-playfair text-xs sm:text-base font-bold text-[#1A1515]">
                        Rs. {totalSalesVal.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#F5EFEB] shadow-xs flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#8A4853]/5 text-[#8A4853] flex items-center justify-center">
                      <ShoppingBag size={16} />
                    </div>
                    <div>
                      <p className="font-sans text-[8px] sm:text-[10px] text-[#A38F85] uppercase tracking-wider">Total Orders</p>
                      <p className="font-playfair text-xs sm:text-base font-bold text-[#1A1515]">
                        {orders.length} orders
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#F5EFEB] shadow-xs flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Tag size={16} />
                    </div>
                    <div>
                      <p className="font-sans text-[8px] sm:text-[10px] text-[#A38F85] uppercase tracking-wider">Catalog Items</p>
                      <p className="font-playfair text-xs sm:text-base font-bold text-[#1A1515]">
                        {products.length} Products
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#F5EFEB] shadow-xs flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <p className="font-sans text-[8px] sm:text-[10px] text-[#A38F85] uppercase tracking-wider">Logistics Rate</p>
                      <p className="font-playfair text-xs sm:text-base font-bold text-[#1A1515]">
                        {deliveryFeeConfig.isFree ? "Free Delivery" : `Rs. ${deliveryFeeConfig.amount}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-Views */}
                {activeTab === 'catalog' && (
                  <div className="space-y-6">
                    
                    {/* Add / Edit Form Drawer Inline Toggle */}
                    {(isAddingNew || editingProduct) && (
                      <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-4 sm:p-6 rounded-2xl border border-[#FAF6F0] shadow-md space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-3">
                          <h4 className="font-playfair text-sm sm:text-base text-[#1A1515] font-bold flex items-center gap-1.5">
                            <Sparkles size={14} className="text-[#8A4853]" />
                            {editingProduct ? `Modify: ${editingProduct.name}` : 'Introduce New Creation'}
                          </h4>
                          <button
                            onClick={() => { setIsAddingNew(false); setEditingProduct(null); }}
                            className="text-[#A38F85] hover:text-[#8A4853] p-1 rounded-full hover:bg-neutral-50"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            
                            <div className="space-y-1">
                              <label className="font-sans text-[9px] font-bold text-[#A38F85] uppercase">Product Title *</label>
                              <input
                                type="text"
                                required
                                value={prodName}
                                onChange={(e) => setProdName(e.target.value)}
                                className="w-full bg-[#FAF6F0] border-none rounded-xl px-3 py-2 text-xs text-[#1A1515] focus:outline-none focus:ring-1 focus:ring-[#8A4853]"
                                placeholder="e.g. Silk Lace Plunge Bra"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-sans text-[9px] font-bold text-[#A38F85] uppercase">Catalog Category</label>
                              <select
                                value={prodCategory}
                                onChange={(e) => setProdCategory(e.target.value as Product['category'])}
                                className="w-full bg-[#FAF6F0] border-none rounded-xl px-3 py-2.5 text-xs text-[#1A1515] focus:outline-none focus:ring-1 focus:ring-[#8A4853]"
                              >
                                <option value="Premium Bras">Premium Bras</option>
                                <option value="Cotton Bras">Cotton Bras</option>
                                <option value="Malai Cotton Bras">Malai Cotton Bras</option>
                                <option value="Kaftan Abayas">Kaftan Abayas</option>
                                <option value="Other Accessories">Other Accessories</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="font-sans text-[9px] font-bold text-[#A38F85] uppercase">Price (Rs.) *</label>
                              <input
                                type="number"
                                required
                                value={prodPrice || ''}
                                onChange={(e) => setProdPrice(Number(e.target.value))}
                                className="w-full bg-[#FAF6F0] border-none rounded-xl px-3 py-2 text-xs text-[#1A1515] focus:outline-none focus:ring-1 focus:ring-[#8A4853]"
                                placeholder="e.g. 1850"
                              />
                            </div>

                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="font-sans text-[9px] font-bold text-[#A38F85] uppercase block">Product Image *</label>
                                <button
                                  type="button"
                                  onClick={handlePickProductImageFromDrive}
                                  disabled={isPickingWithGoogle === 'image'}
                                  className="text-[9px] font-sans font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 px-2 py-0.5 rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50"
                                  title="Browse and pick product photography from your Google Drive using Google Picker"
                                >
                                  <ImagePlus size={10} />
                                  <span>{isPickingWithGoogle === 'image' ? 'Opening Picker...' : 'Pick from Google Drive'}</span>
                                </button>
                              </div>
                              <div className="space-y-2">
                                <DragDropUpload 
                                  onUpload={(base64) => setProdImage(base64)} 
                                  currentImage={prodImage}
                                  label="Drag & Drop Product Image, or click to upload"
                                />
                                <div className="flex items-center space-x-2">
                                  <span className="text-[8px] text-[#A38F85] font-bold uppercase shrink-0">Or URL:</span>
                                  <input
                                    type="text"
                                    value={prodImage.startsWith("data:image/") ? "Base64 Image Loaded" : prodImage}
                                    onChange={(e) => {
                                      if (!e.target.value.startsWith("Base64")) {
                                        setProdImage(e.target.value);
                                      }
                                    }}
                                    className="w-full bg-[#FAF6F0] border-none rounded-lg px-2 py-1 text-[10px] text-neutral-600 focus:outline-none"
                                    placeholder="https://images.unsplash.com/..."
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="font-sans text-[9px] font-bold text-[#A38F85] uppercase">Mock Rating &amp; Badges</label>
                              <div className="grid grid-cols-3 gap-3">
                                <input
                                  type="number"
                                  step="0.1"
                                  max="5.0"
                                  value={prodRating}
                                  onChange={(e) => setProdRating(Number(e.target.value))}
                                  className="w-full bg-[#FAF6F0] border-none rounded-xl px-3 py-2.5 text-xs text-[#1A1515] focus:outline-none focus:ring-1 focus:ring-[#8A4853]"
                                  placeholder="Rating (4.8)"
                                />
                                <button
                                  type="button"
                                  onClick={() => setProdIsNew(!prodIsNew)}
                                  className={`rounded-xl text-[10px] uppercase font-bold tracking-wider border transition-colors ${
                                    prodIsNew ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-transparent border-neutral-200 text-neutral-400'
                                  }`}
                                >
                                  New Arrival
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setProdIsBest(!prodIsBest)}
                                  className={`rounded-xl text-[10px] uppercase font-bold tracking-wider border transition-colors ${
                                    prodIsBest ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-transparent border-neutral-200 text-neutral-400'
                                  }`}
                                >
                                  Best Seller
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-sans text-[9px] font-bold text-[#A38F85] uppercase">Elegant Description</label>
                            <textarea
                              rows={2}
                              value={prodDescription}
                              onChange={(e) => setProdDescription(e.target.value)}
                              className="w-full bg-[#FAF6F0] border-none rounded-xl px-3 py-2 text-xs text-[#5A4A42] placeholder-[#A38F85] focus:outline-none focus:ring-1 focus:ring-[#8A4853]"
                              placeholder="Write a delicate editorial description highlighting comfort and fabrics..."
                            />
                          </div>

                          {/* Sizes Custom Setup */}
                          <div className="space-y-3 bg-[#FAF6F0] p-3 rounded-xl border border-neutral-100">
                            <span className="font-sans text-[9px] font-bold text-[#8A4853] uppercase block">
                              Available Sizing Sizes
                            </span>
                            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                              {['32B', '34B', '36B', '38B', '40B', '42B', '44B', '46B', '48B', '50B', '52B', '54B', '32C', '34C', '36C', '38C', '40C', '42C', '44C', '46C', '48C', '50C', '52C', '54C', 'S', 'M', 'L', 'XL', 'Standard'].map(size => {
                                const selected = selectedSizes.includes(size);
                                return (
                                  <button
                                    type="button"
                                    key={size}
                                    onClick={() => handleAddSize(size)}
                                    className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${
                                      selected 
                                        ? 'bg-[#8A4853] text-white shadow-xs' 
                                        : 'bg-white border border-[#F5EFEB] text-neutral-500 hover:bg-neutral-50'
                                    }`}
                                  >
                                    {size}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="flex gap-2 pt-1 border-t border-[#FAF6F0] items-center">
                              <input
                                type="text"
                                value={customSizeText}
                                onChange={(e) => setCustomSizeText(e.target.value)}
                                className="flex-1 bg-white border border-[#F5EFEB] rounded-lg px-2.5 py-1 text-xs text-[#1A1515]"
                                placeholder="Add custom size (e.g. 52D)"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const trimmed = customSizeText.trim();
                                  if (trimmed && !selectedSizes.includes(trimmed)) {
                                    setSelectedSizes([...selectedSizes, trimmed]);
                                  }
                                  setCustomSizeText('');
                                }}
                                className="bg-[#8A4853] text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#70343e]"
                              >
                                Add Size
                              </button>
                            </div>
                          </div>

                          {/* Color Swatch Creator */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            
                            <div className="space-y-2 bg-[#FAF6F0] p-3 rounded-xl border border-neutral-100">
                              <span className="font-sans text-[9px] font-bold text-[#8A4853] uppercase block">
                                Swatch Builder
                              </span>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newColorName}
                                  onChange={(e) => setNewColorName(e.target.value)}
                                  className="flex-1 bg-white border border-[#F5EFEB] rounded-lg px-2.5 py-1 text-xs text-[#1A1515]"
                                  placeholder="Color Name (e.g. Lilac)"
                                />
                                <input
                                  type="color"
                                  value={newColorHex}
                                  onChange={(e) => setNewColorHex(e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddColor}
                                  className="bg-[#8A4853] hover:bg-[#70343e] text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors"
                                >
                                  Add Swatch
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <span className="font-sans text-[9px] font-bold text-[#A38F85] uppercase block">
                                Active Color Palettes ({selectedColors.length})
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {selectedColors.map(color => (
                                  <div
                                    key={color.hex}
                                    className="flex items-center space-x-1.5 bg-white border border-neutral-200 rounded-lg px-2 py-1 text-[10px] font-medium text-neutral-700"
                                  >
                                    <span
                                      className="w-2.5 h-2.5 rounded-full inline-block border border-black/10"
                                      style={{ backgroundColor: color.hex }}
                                    />
                                    <span>{color.name}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveColor(color.hex)}
                                      className="text-neutral-400 hover:text-red-500 font-bold"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>

                          <div className="flex justify-end space-x-3 pt-2">
                            <button
                              type="button"
                              onClick={() => { setIsAddingNew(false); setEditingProduct(null); }}
                              className="px-4 py-2 border border-neutral-200 text-neutral-500 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-[#8A4853] hover:bg-[#70343e] text-white px-5 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest flex items-center space-x-1.5 transition-colors"
                            >
                              <Check size={12} />
                              <span>Save Creation</span>
                            </button>
                          </div>

                        </form>
                      </motion.div>
                    )}

                    {/* Catalog Header & Add Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F5EFEB] pb-4">
                      <div>
                        <h4 className="font-playfair text-lg text-[#1A1515] font-bold">Catalog Showroom Products</h4>
                        <p className="font-sans text-xs text-[#5A4A42]">Add, duplicate, edit, or retire products in the system.</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={handleExportProducts}
                          disabled={isExportingSheets === 'products'}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/60 px-3 py-2.5 rounded-xl font-sans text-[10px] tracking-wider font-bold uppercase transition-all duration-200 shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
                          title="Export all products to Google Sheets"
                        >
                          <FileSpreadsheet size={13} className="text-emerald-700" />
                          <span>{isExportingSheets === 'products' ? 'Syncing...' : 'Export to Sheets'}</span>
                        </button>

                        {!isAddingNew && !editingProduct && (
                          <button
                            onClick={startAddNew}
                            className="bg-[#8A4853] hover:bg-[#70343e] text-white px-4 py-2.5 rounded-xl font-sans text-[10px] tracking-widest font-bold uppercase transition-all duration-300 shadow flex items-center justify-center space-x-1.5 self-start"
                          >
                            <Plus size={14} />
                            <span>Introduce Product</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Products Grid Table */}
                    <div className="bg-white rounded-2xl border border-[#F5EFEB] overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#FAF6F0] text-[#A38F85] text-[9px] uppercase tracking-wider border-b border-[#F5EFEB]">
                              <th className="px-6 py-4 font-bold">Product</th>
                              <th className="px-6 py-4 font-bold">Category</th>
                              <th className="px-6 py-4 font-bold">Pricing</th>
                              <th className="px-6 py-4 font-bold">Sizes</th>
                              <th className="px-6 py-4 font-bold">Swatches</th>
                              <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F5EFEB]">
                            {products.map(product => (
                              <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors text-xs text-[#1A1515]">
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-12 rounded-lg bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                                      <img
                                        src={product.image || FALLBACK_IMAGE}
                                        alt={product.name}
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                        }}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                    <div>
                                      <p className="font-playfair font-bold text-neutral-900 line-clamp-1">{product.name}</p>
                                      <p className="font-sans text-[9px] text-[#8A4853] font-bold uppercase tracking-wider">ID: {product.id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                    {product.category}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <strong className="font-playfair font-bold text-neutral-900">Rs. {product.price.toLocaleString()}</strong>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="font-sans text-[10px] text-neutral-500 font-medium">
                                    {product.sizes.join(', ')}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-1">
                                    {product.colors.map(c => (
                                      <span
                                        key={c.hex}
                                        className="w-3.5 h-3.5 rounded-full border border-black/15 inline-block"
                                        style={{ backgroundColor: c.hex }}
                                        title={c.name}
                                      />
                                    ))}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                      onClick={() => startEditProduct(product)}
                                      className="p-1.5 hover:bg-neutral-100 text-[#5A4A42] hover:text-[#8A4853] rounded-lg transition-colors"
                                      title="Edit details"
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Are you sure you want to retire "${product.name}"? This removes it from the catalog.`)) {
                                          onDeleteProduct(product.id);
                                        }
                                      }}
                                      className="p-1.5 hover:bg-red-50 text-neutral-300 hover:text-red-500 rounded-lg transition-colors"
                                      title="Remove product"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-playfair text-lg text-[#1A1515] font-bold">Customer Checkout Inbound Orders</h4>
                        <p className="font-sans text-xs text-[#5A4A42]">Review incoming order delivery receipts, track logistics status, verify proof-of-payment screenshots, and coordinate fulfillment.</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={handleExportOrders}
                          disabled={isExportingSheets === 'orders'}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/60 px-3.5 py-2 rounded-xl font-sans text-[10px] tracking-wider font-bold uppercase transition-all duration-200 shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
                          title="Export and synchronize orders to Google Sheets ledger"
                        >
                          <FileSpreadsheet size={13} className="text-emerald-700" />
                          <span>{isExportingSheets === 'orders' ? 'Syncing...' : 'Export to Sheets'}</span>
                        </button>
                        {lastOrdersSheet && (
                          <a
                            href={`https://docs.google.com/spreadsheets/d/${lastOrdersSheet}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white hover:bg-neutral-50 text-[#5A4A42] border border-[#F5EFEB] px-3 py-2 rounded-xl font-sans text-[10px] tracking-wider font-bold uppercase transition-all flex items-center space-x-1"
                          >
                            <span>Open Sheet</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Email Notification & Web3Forms Diagnostic Center */}
                    <div className="bg-gradient-to-br from-amber-900/5 via-stone-50 to-emerald-950/5 border border-amber-800/10 rounded-2xl p-4 sm:p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-900/10 pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-[#8A4853] text-white flex items-center justify-center shadow-xs shrink-0">
                            <Mail size={18} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h5 className="font-playfair text-sm text-[#1A1515] font-bold">Official Business Mail Integration</h5>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">Real-Time Sync</span>
                            </div>
                            <p className="font-sans text-xs font-semibold text-[#8A4853] mt-0.5">{OFFICIAL_BUSINESS_EMAIL}</p>
                          </div>
                        </div>

                        <button
                          onClick={handleTestNotification}
                          disabled={isTestingNotif}
                          className="px-4 py-2 bg-[#8A4853] hover:bg-[#6E3741] active:bg-[#582A33] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-xs shrink-0 disabled:opacity-50"
                        >
                          {isTestingNotif ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              <span>Sending Test Email...</span>
                            </>
                          ) : (
                            <>
                              <Send size={14} />
                              <span>Send Live Test Order Email</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Config Key Input */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#A38F85]">
                            Web3Forms Access Key
                          </label>
                          <input
                            type="text"
                            value={customWeb3Key}
                            onChange={(e) => setCustomWeb3Key(e.target.value.trim())}
                            placeholder="Enter Web3Forms access key"
                            className="w-full px-3 py-1.5 bg-white border border-[#F5EFEB] rounded-xl font-mono text-xs text-[#1A1515] focus:outline-none focus:border-[#8A4853]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#A38F85]">
                            Backup Delivery Engine
                          </label>
                          <div className="px-3 py-1.5 bg-white border border-[#F5EFEB] rounded-xl font-sans text-xs text-[#5A4A42] flex items-center justify-between">
                            <span>FormSubmit Direct Service</span>
                            <span className="text-[10px] text-emerald-600 font-bold">Active</span>
                          </div>
                        </div>
                      </div>

                      {/* Test Notification Results */}
                      {testNotifResult && (
                        <div className="mt-3 p-3.5 rounded-xl bg-white border border-neutral-200 space-y-2 text-xs">
                          <div className="font-bold text-[#1A1515] flex items-center space-x-1.5">
                            <Sparkles size={14} className="text-amber-600" />
                            <span>Test Dispatch Diagnostics for {OFFICIAL_BUSINESS_EMAIL}:</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div className={`p-2.5 rounded-lg border ${testNotifResult.web3formsSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                              <span className="font-bold block">1. Web3Forms Engine:</span>
                              <span>{testNotifResult.web3formsMessage}</span>
                            </div>

                            <div className={`p-2.5 rounded-lg border ${testNotifResult.formSubmitSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                              <span className="font-bold block">2. FormSubmit Engine:</span>
                              <span>{testNotifResult.formSubmitMessage}</span>
                            </div>
                          </div>

                          {(!testNotifResult.web3formsSuccess || testNotifResult.formSubmitMessage.toLowerCase().includes('activate')) && (
                            <div className="bg-sky-50 border border-sky-200 text-sky-900 p-2.5 rounded-lg text-[11px] leading-relaxed">
                              <strong>💡 Important Activation Step:</strong> Free email notification providers require a 1-time email activation link on your first order. Please check your inbox at <u className="font-bold">{OFFICIAL_BUSINESS_EMAIL}</u> (including Spam/Junk folder) and click <strong>"Activate Access Key / Confirm Email"</strong> so all future customer orders land directly in your inbox!
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {orders.length === 0 ? (
                      <div className="text-center py-16 bg-white rounded-3xl border border-[#F5EFEB] space-y-4">
                        <div className="w-14 h-14 rounded-full bg-neutral-50 text-[#A38F85] flex items-center justify-center border border-neutral-100 mx-auto">
                          <ShoppingBag size={20} />
                        </div>
                        <h4 className="font-playfair text-base text-[#1A1515] font-semibold">No Orders Placed Yet</h4>
                        <p className="font-sans text-xs text-[#5A4A42] max-w-sm mx-auto">
                          Go ahead and add items to your shopping bag, proceed to checkout, upload a mockup screenshot, and complete the order simulation. It will populate instantly in this executive logs tracker!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map(order => (
                          <div
                            key={order.id}
                            className="bg-white rounded-2xl border border-[#F5EFEB] p-4 sm:p-5 space-y-4 shadow-xs"
                          >
                            {/* Order Header Summary */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#FAF6F0] pb-3">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-sans text-xs font-bold text-[#8A4853] uppercase tracking-wider">#{order.id}</span>
                                  <span className="text-xs text-neutral-300">•</span>
                                  <span className="font-sans text-[11px] text-neutral-500">{order.date}</span>
                                </div>
                                <h5 className="font-playfair text-sm text-[#1A1515] font-bold mt-1">
                                  Ordered By: {order.customerName}
                                </h5>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 self-start sm:self-center">
                                {/* Payment Status Selector */}
                                <div className="flex items-center space-x-2">
                                  <span className="font-sans text-[10px] text-[#A38F85] font-bold uppercase tracking-wider">Payment:</span>
                                  <select
                                    value={order.paymentStatus || 'Unpaid'}
                                    onChange={(e) => onUpdateOrderPaymentStatus && onUpdateOrderPaymentStatus(order.id, e.target.value as any)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border-0 focus:ring-1 focus:ring-[#8A4853] ${
                                      (order.paymentStatus === 'Paid' || order.paymentMethod?.toLowerCase().includes('gateway'))
                                        ? 'bg-emerald-50 text-emerald-800'
                                        : order.paymentStatus === 'Pending Verification'
                                        ? 'bg-amber-50 text-amber-800'
                                        : 'bg-red-50 text-red-800'
                                    }`}
                                  >
                                    <option value="Unpaid">Unpaid / COD</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending Verification">Pending Verification</option>
                                  </select>
                                </div>

                                {/* Logistics Status State Changer */}
                                <div className="flex items-center space-x-2">
                                  <span className="font-sans text-[10px] text-[#A38F85] font-bold uppercase tracking-wider">Logistics:</span>
                                  <select
                                    value={order.status}
                                    onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as AdminOrder['status'])}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border-0 focus:ring-1 focus:ring-[#8A4853] ${
                                      order.status === 'Pending' && 'bg-amber-50 text-amber-800'
                                    } ${
                                      order.status === 'Shipped' && 'bg-blue-50 text-blue-800'
                                    } ${
                                      order.status === 'Delivered' && 'bg-emerald-50 text-emerald-800'
                                    } ${
                                      order.status === 'Cancelled' && 'bg-neutral-100 text-neutral-600'
                                    }`}
                                  >
                                    <option value="Pending">Pending Fulfillment</option>
                                    <option value="Shipped">Dispatched / Shipped</option>
                                    <option value="Delivered">Delivered Care</option>
                                    <option value="Cancelled">Cancelled Return</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Contact, Delivery, Items details */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
                              
                              <div className="md:col-span-5 space-y-3">
                                <div className="space-y-1.5">
                                  <span className="font-sans text-[10px] font-bold text-[#A38F85] uppercase tracking-wider block">
                                    Customer Logistics Details
                                  </span>
                                  <p><span className="text-[#A38F85]">Phone:</span> <strong className="text-neutral-800">{order.phone}</strong></p>
                                  <p><span className="text-[#A38F85]">Address:</span> <strong className="text-neutral-800">{order.address}</strong></p>
                                  <p><span className="text-[#A38F85]">Payment Channel:</span> <strong className="text-neutral-800 uppercase">{order.paymentMethod}</strong></p>
                                  <p>
                                    <span className="text-[#A38F85]">Payment Status:</span>{' '}
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                      (order.paymentStatus === 'Paid' || order.paymentMethod?.toLowerCase().includes('gateway'))
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : order.paymentStatus === 'Pending Verification'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {order.paymentStatus || 'Unpaid'}
                                      {(order.paymentMethod?.toLowerCase().includes('gateway') || order.paymentStatus === 'Paid') && ' (Verified Automatically)'}
                                    </span>
                                  </p>
                                  <p><span className="text-[#A38F85]">Delivery Charge:</span> <strong className="text-neutral-800">Rs. {order.deliveryCharge}</strong></p>
                                </div>

                                {/* Payment Screenshot Display if exists */}
                                {order.paymentScreenshot && (
                                  <div className="space-y-1 border border-[#F5EFEB] p-2.5 rounded-xl bg-[#FAF6F0]">
                                    <span className="font-sans text-[9px] font-bold text-[#8a4853] uppercase tracking-wider block flex items-center gap-1">
                                      <CheckCircle size={10} /> Proof of Payment Screenshot
                                    </span>
                                    <div className="relative group max-w-[200px] border border-[#F5EFEB] rounded-lg overflow-hidden bg-white">
                                      <img 
                                        src={order.paymentScreenshot} 
                                        alt="Transaction Screenshot" 
                                        className="w-full h-auto object-contain cursor-zoom-in max-h-[150px]"
                                        onClick={() => {
                                          const w = window.open();
                                          if (w) {
                                            w.document.write(`<img src="${order.paymentScreenshot}" style="max-width:100%; max-height:100vh; display:block; margin:auto;"/>`);
                                          }
                                        }}
                                      />
                                      <p className="text-[8px] text-[#A38F85] text-center mt-1 pb-1">Click image to expand</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="md:col-span-7 space-y-2">
                                <span className="font-sans text-[10px] font-bold text-[#A38F85] uppercase tracking-wider block">
                                  Consignment Breakdown ({order.items.length} items)
                                </span>
                                <div className="space-y-1.5">
                                  {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-lg">
                                      <div>
                                        <p className="font-playfair font-bold text-neutral-800">{item.productName}</p>
                                        <p className="font-sans text-[9px] text-neutral-400">
                                          Size: {item.size} • Swatch: {item.color} • Qty: {item.quantity}
                                        </p>
                                      </div>
                                      <span className="font-playfair text-neutral-800 font-bold">
                                        Rs. {(item.price * item.quantity).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>

                            {/* Order Total Price & WhatsApp Direct Actions */}
                            <div className="border-t border-[#FAF6F0] pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center space-x-2">
                                <span className="font-sans text-[10px] text-[#A38F85] uppercase tracking-wider font-bold">Gross Valuation:</span>
                                <span className="font-playfair text-base text-[#8A4853] font-bold">Rs. {order.total.toLocaleString()}</span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {/* Send to Merchant WhatsApp */}
                                <a
                                  href={getMerchantWhatsAppOrderLink(order)}
                                  target="_blank"
                                  rel="noreferrer referrer"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-xs"
                                  title="Dispatch order receipt directly to Merchant WhatsApp"
                                >
                                  <MessageCircle size={12} className="fill-white/30" />
                                  <span>Merchant WhatsApp</span>
                                </a>

                                {/* Message Customer on WhatsApp */}
                                <a
                                  href={getCustomerWhatsAppOrderLink(order)}
                                  target="_blank"
                                  rel="noreferrer referrer"
                                  className="bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] border border-[#25D366]/30 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors"
                                  title="Send confirmation update directly to Customer WhatsApp"
                                >
                                  <Send size={11} />
                                  <span>Customer WhatsApp</span>
                                </a>

                                {/* Copy WhatsApp Order Slip */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const slip = formatOrderWhatsAppMessage(order);
                                    navigator.clipboard.writeText(slip);
                                    setCopiedOrderSlipId(order.id);
                                    setTimeout(() => setCopiedOrderSlipId(null), 2500);
                                  }}
                                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 transition-colors"
                                >
                                  {copiedOrderSlipId === order.id ? (
                                    <>
                                      <CheckCircle2 size={11} className="text-emerald-600" />
                                      <span className="text-emerald-700">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={11} />
                                      <span>Copy Slip</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}

                {activeTab === 'payments' && (
                  <div className="space-y-6">
                    
                    {/* Free Merchant Bank System & WhatsApp Hub Card */}
                    <div className="bg-gradient-to-br from-[#FAF6F0] via-white to-emerald-50/40 p-5 sm:p-6 rounded-3xl border border-[#F5EFEB] shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#FAF6F0] pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                              <Building2 size={16} />
                            </div>
                            <div>
                              <h4 className="font-playfair text-base sm:text-lg font-bold text-[#1A1515]">
                                Free Merchant Bank System &amp; WhatsApp Dispatch
                              </h4>
                              <p className="font-sans text-xs text-[#5A4A42]">
                                Direct 1-Click Payments with 0% Gateway Commissions &amp; Instant WhatsApp Notifications.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-start sm:self-auto">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center space-x-1">
                            <ShieldCheck size={12} />
                            <span>100% Free • No Fees</span>
                          </span>
                        </div>
                      </div>

                      {/* WhatsApp Merchant Configuration */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
                        <div className="md:col-span-7 space-y-1.5">
                          <label className="font-sans text-[10px] font-bold text-[#8A4853] uppercase tracking-wider flex items-center space-x-1">
                            <MessageCircle size={12} className="text-[#25D366]" />
                            <span>Merchant WhatsApp Direct Dispatch Number *</span>
                          </label>
                          <input
                            type="text"
                            value={merchantWhatsApp}
                            onChange={(e) => setMerchantWhatsApp(e.target.value)}
                            placeholder="e.g. +92 326 9300922 or 923269300922"
                            className="w-full bg-[#FAF6F0] border-none rounded-xl px-3.5 py-2 text-xs font-mono text-[#1A1515] focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="text-[10px] text-[#A38F85] block">
                            Whenever a customer places an order, a 1-click notification containing the itemized invoice is dispatched to this WhatsApp.
                          </span>
                        </div>

                        <div className="md:col-span-5 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setMerchantWhatsAppNumber(merchantWhatsApp);
                              setWhatsAppSaveNotice(true);
                              setTimeout(() => setWhatsAppSaveNotice(false), 3000);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-xs"
                            id="save-merchant-whatsapp-btn"
                          >
                            <Check size={13} />
                            <span>{whatsAppSaveNotice ? 'Saved!' : 'Save Number'}</span>
                          </button>

                          <a
                            href={`https://wa.me/${merchantWhatsApp.replace(/[^0-9]/g, '')}?text=Test%20Ping%20from%20Women%27s%20Wardrobe%20Free%20Merchant%20System!%20WhatsApp%20order%20dispatch%20is%20active.`}
                            target="_blank"
                            rel="noreferrer referrer"
                            className="bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] border border-[#25D366]/30 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5"
                          >
                            <Send size={12} />
                            <span>Test Ping</span>
                          </a>
                        </div>
                      </div>

                      {/* Benefits & How it works */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-[#FAF6F0] space-y-1">
                          <p className="font-bold text-[#1A1515] flex items-center space-x-1.5">
                            <Building2 size={13} className="text-[#8A4853]" />
                            <span>Direct Bank Payouts</span>
                          </p>
                          <p className="text-[11px] text-[#5A4A42] leading-relaxed">
                            Funds land directly into your official merchant IBAN/Raast account instantly with 0 holding delay.
                          </p>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-[#FAF6F0] space-y-1">
                          <p className="font-bold text-[#1A1515] flex items-center space-x-1.5">
                            <Smartphone size={13} className="text-emerald-600" />
                            <span>1-Click Fast Order Slip</span>
                          </p>
                          <p className="text-[11px] text-[#5A4A42] leading-relaxed">
                            Customers get a 1-click WhatsApp button to send their complete receipt, size, and address to you.
                          </p>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-[#FAF6F0] space-y-1">
                          <p className="font-bold text-[#1A1515] flex items-center space-x-1.5">
                            <Zap size={13} className="text-amber-600" />
                            <span>Zero Subscription Cost</span>
                          </p>
                          <p className="text-[11px] text-[#5A4A42] leading-relaxed">
                            No monthly SaaS fees or payment gateway cuts. You keep 100% of your garment revenues.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Add / Edit Payment Method Form Toggle */}
                    {(isAddingPayment || editingPayment) && (
                      <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-4 sm:p-6 rounded-2xl border border-[#FAF6F0] shadow-md space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-3">
                          <h4 className="font-playfair text-sm sm:text-base text-[#1A1515] font-bold flex items-center gap-1.5">
                            <Sparkles size={14} className="text-[#8A4853]" />
                            {editingPayment ? `Edit Payment Channel: ${editingPayment.name}` : 'Introduce Payment Channel'}
                          </h4>
                          <button
                            onClick={() => { setIsAddingPayment(false); setEditingPayment(null); }}
                            className="text-[#A38F85] hover:text-[#8A4853] p-1 rounded-full hover:bg-neutral-50"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* Quick Preset Template Buttons */}
                        {!editingPayment && (
                          <div className="bg-[#FAF6F0] p-3 rounded-xl border border-neutral-100 space-y-2">
                            <span className="text-[9px] font-sans font-bold text-[#A38F85] uppercase block">
                              Load Quick Pakistan Fintech Presets
                            </span>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => applyPaymentTemplate('ubl')}
                                className="bg-[#8A4853]/10 hover:bg-[#8A4853]/20 text-[#8A4853] px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all"
                              >
                                Bank Account (UBL)
                              </button>
                              <button
                                type="button"
                                onClick={() => applyPaymentTemplate('easypaisa')}
                                className="bg-[#8A4853]/10 hover:bg-[#8A4853]/20 text-[#8A4853] px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all"
                              >
                                Easypaisa
                              </button>
                              <button
                                type="button"
                                onClick={() => applyPaymentTemplate('jazzcash')}
                                className="bg-[#8A4853]/10 hover:bg-[#8A4853]/20 text-[#8A4853] px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all"
                              >
                                JazzCash
                              </button>
                              <button
                                type="button"
                                onClick={() => applyPaymentTemplate('whatsapp')}
                                className="bg-[#8A4853]/10 hover:bg-[#8A4853]/20 text-[#8A4853] px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all"
                              >
                                WhatsApp Help
                              </button>
                            </div>
                          </div>
                        )}

                        <form onSubmit={handleSavePayment} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            <div className="space-y-1">
                              <label className="font-sans text-[9px] font-bold text-[#A38F85] uppercase">Payment Method Name *</label>
                              <input
                                type="text"
                                required
                                value={payName}
                                onChange={(e) => setPayName(e.target.value)}
                                className="w-full bg-[#FAF6F0] border-none rounded-xl px-3 py-2 text-xs text-[#1A1515]"
                                placeholder="e.g. Bank Account (UBL), Easypaisa, JazzCash"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-sans text-[9px] font-bold text-[#A38F85] uppercase">Account Number / IBAN *</label>
                              <input
                                type="text"
                                required
                                value={payAccountNumber}
                                onChange={(e) => setPayAccountNumber(e.target.value)}
                                className="w-full bg-[#FAF6F0] border-none rounded-xl px-3 py-2 text-xs text-[#1A1515]"
                                placeholder="e.g. PK67UNIL01090003422939080 or 03422939080"
                              />
                            </div>

                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            <div className="space-y-1">
                              <label className="font-sans text-[9px] font-bold text-[#A38F85] uppercase">Account Title (Optional)</label>
                              <input
                                type="text"
                                value={payAccountTitle}
                                onChange={(e) => setPayAccountTitle(e.target.value)}
                                className="w-full bg-[#FAF6F0] border-none rounded-xl px-3 py-2 text-xs text-[#1A1515]"
                                placeholder="e.g. Adil Naseer"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-sans text-[9px] font-bold text-[#A38F85] uppercase block">Method Swatch Logo / Icon</label>
                              <DragDropUpload 
                                onUpload={(base64) => setPayIcon(base64)} 
                                currentImage={payIcon}
                                label="Drag & Drop Swatch icon, or click to browse"
                              />
                              <input
                                type="text"
                                value={payIcon.startsWith("data:image/") ? "Base64 Image Loaded" : payIcon}
                                onChange={(e) => {
                                  if (!e.target.value.startsWith("Base64")) {
                                    setPayIcon(e.target.value);
                                  }
                                }}
                                className="w-full bg-[#FAF6F0] border-none rounded-lg px-2 py-1 text-[9px] text-neutral-500 mt-1"
                                placeholder="Or enter public image URL directly"
                              />
                            </div>

                          </div>

                          <div className="flex items-center space-x-3 pt-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={payIsActive}
                                onChange={(e) => setPayIsActive(e.target.checked)}
                                className="rounded border-neutral-300 text-[#8A4853] focus:ring-[#8A4853]"
                              />
                              <span className="font-sans text-xs font-bold text-[#5A4A42] uppercase">
                                Activate payment channel (Show immediately on website)
                              </span>
                            </label>
                          </div>

                          <div className="flex justify-end space-x-3 pt-2">
                            <button
                              type="button"
                              onClick={() => { setIsAddingPayment(false); setEditingPayment(null); }}
                              className="px-4 py-2 border border-neutral-200 text-neutral-500 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-[#8A4853] hover:bg-[#70343e] text-white px-5 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest flex items-center space-x-1.5 transition-colors"
                            >
                              <Check size={12} />
                              <span>Save Channel</span>
                            </button>
                          </div>

                        </form>
                      </motion.div>
                    )}

                    {/* Payments Header & Add Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F5EFEB] pb-4">
                      <div>
                        <h4 className="font-playfair text-lg text-[#1A1515] font-bold">Dynamic Payment Methods Settings</h4>
                        <p className="font-sans text-xs text-[#5A4A42]">Configure Bank, Easypaisa, JazzCash accounts displayed to customers. Show/hide, edit, or delete options dynamically.</p>
                      </div>

                      {!isAddingPayment && !editingPayment && (
                        <button
                          onClick={startAddNewPayment}
                          className="bg-[#8A4853] hover:bg-[#70343e] text-white px-4 py-2.5 rounded-xl font-sans text-[10px] tracking-widest font-bold uppercase transition-all duration-300 shadow flex items-center justify-center space-x-1.5 self-start"
                        >
                          <Plus size={14} />
                          <span>Add Payment Channel</span>
                        </button>
                      )}
                    </div>

                    {/* Payments Grid List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paymentMethods.map(pm => (
                        <div
                          key={pm.id}
                          className={`bg-white rounded-2xl border p-4 flex justify-between items-start transition-all ${
                            pm.isActive ? 'border-[#8A4853]/20 shadow-xs' : 'border-[#F5EFEB] opacity-60'
                          }`}
                        >
                          <div className="flex space-x-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FAF6F0] flex items-center justify-center border border-[#F5EFEB] shrink-0">
                              {pm.icon ? (
                                <img src={pm.icon} alt={pm.name} className="w-full h-full object-cover" />
                              ) : (
                                <DollarSign className="w-6 h-6 text-[#8A4853]" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h5 className="font-playfair font-bold text-sm text-[#1A1515]">{pm.name}</h5>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                                  pm.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                                }`}>
                                  {pm.isActive ? 'Active' : 'Hidden'}
                                </span>
                              </div>
                              {pm.accountTitle && (
                                <p className="font-sans text-[10px] text-[#A38F85] font-semibold">Title: {pm.accountTitle}</p>
                              )}
                              <div className="flex items-center space-x-1.5 bg-neutral-50 px-2 py-1 rounded-lg">
                                <code className="font-mono text-[11px] text-[#1A1515] break-all">{pm.accountNumber}</code>
                                <button 
                                  onClick={() => handleCopyToClipboard(pm.accountNumber)}
                                  className="text-[#A38F85] hover:text-[#8A4853]"
                                  title="Copy account details"
                                >
                                  <Copy size={11} />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => {
                                onUpdatePaymentMethod({ ...pm, isActive: !pm.isActive });
                              }}
                              className="p-1.5 hover:bg-neutral-100 text-[#5A4A42] rounded-lg"
                              title={pm.isActive ? "Hide on website" : "Show on website"}
                            >
                              {pm.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            <button
                              onClick={() => startEditPayment(pm)}
                              className="p-1.5 hover:bg-neutral-100 text-[#5A4A42] hover:text-[#8A4853] rounded-lg"
                              title="Edit"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete payment method "${pm.name}"?`)) {
                                  onDeletePaymentMethod(pm.id);
                                }
                              }}
                              className="p-1.5 hover:bg-red-50 text-neutral-300 hover:text-red-500 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

                {activeTab === 'delivery' && (
                  <div className="space-y-6 max-w-lg">
                    
                    <div>
                      <h4 className="font-playfair text-lg text-[#1A1515] font-bold">Delivery Fee Logistics Settings</h4>
                      <p className="font-sans text-xs text-[#5A4A42]">Toggle if delivery is completely free nationwide, or configure a customized logistic dispatch amount.</p>
                    </div>

                    <form onSubmit={handleSaveDeliveryConfig} className="bg-white p-5 sm:p-6 rounded-2xl border border-[#F5EFEB] space-y-5">
                      <div className="space-y-2">
                        <label className="font-sans text-[10px] font-bold text-[#A38F85] uppercase block">Logistics Surcharge Sizing</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setDeliveryIsFree(true)}
                            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                              deliveryIsFree 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                                : 'bg-transparent border-neutral-200 text-neutral-500'
                            }`}
                          >
                            <span className="font-sans text-xs font-bold uppercase tracking-wider">Free Delivery</span>
                            <span className="text-[9px] text-neutral-400">0 Rs. Nationwide</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeliveryIsFree(false)}
                            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                              !deliveryIsFree 
                                ? 'bg-[#8A4853]/10 border-[#8A4853]/30 text-[#8A4853]' 
                                : 'bg-transparent border-neutral-200 text-neutral-500'
                            }`}
                          >
                            <span className="font-sans text-xs font-bold uppercase tracking-wider">Custom Charge</span>
                            <span className="text-[9px] text-neutral-400">Configure Amount Surcharge</span>
                          </button>
                        </div>
                      </div>

                      {!deliveryIsFree && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-1"
                        >
                          <label className="font-sans text-[9px] font-bold text-[#A38F85] uppercase">Surcharge Price (Rs.) *</label>
                          <input
                            type="number"
                            required={!deliveryIsFree}
                            value={deliveryAmount || ''}
                            onChange={(e) => setDeliveryAmount(Number(e.target.value))}
                            className="w-full bg-[#FAF6F0] border-none rounded-xl px-3 py-2 text-xs text-[#1A1515]"
                            placeholder="e.g. 250"
                          />
                        </motion.div>
                      )}

                      <div className="border-t border-[#F5EFEB] pt-4 flex justify-end">
                        <button
                          type="submit"
                          className="bg-[#8A4853] hover:bg-[#70343e] text-white px-5 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest flex items-center space-x-1.5 transition-colors"
                        >
                          <Check size={12} />
                          <span>{deliverySaveNotice ? 'Saved!' : 'Save Settings'}</span>
                        </button>
                      </div>

                    </form>

                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6 text-left">
                    {/* Compliance Dashboard Header */}
                    <div className="bg-[#FAF6F0] p-4 rounded-3xl border border-[#F5EFEB] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-[#8A4853]">
                          <ShieldCheck size={18} />
                          <h4 className="font-playfair text-base sm:text-lg font-bold text-[#1A1515]">Enterprise Role Security &amp; Compliance Center</h4>
                        </div>
                        <p className="font-sans text-xs text-[#5A4A42]">
                          Manage role-based permissions, authorize account requests, trigger non-recoverable password resets, and inspect the platform's immutable security logs.
                        </p>
                      </div>
                      <span className="shrink-0 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 flex items-center space-x-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        <span>System Secure</span>
                      </span>
                    </div>

                    {/* Security Metrics Strip */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-white p-3.5 rounded-2xl border border-[#F5EFEB] space-y-1">
                        <span className="font-sans text-[9px] font-bold text-[#A38F85] uppercase tracking-wider block">Total Directories</span>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xl font-bold text-[#1A1515]">{users.length}</span>
                          <Users size={14} className="text-neutral-400" />
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-[#F5EFEB] space-y-1">
                        <span className="font-sans text-[9px] font-bold text-[#A38F85] uppercase tracking-wider block">Pending Audits</span>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xl font-bold text-amber-600">{users.filter(u => u.status === 'PendingApproval').length}</span>
                          <ShieldAlert size={14} className="text-amber-500 animate-pulse" />
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-[#F5EFEB] space-y-1">
                        <span className="font-sans text-[9px] font-bold text-[#A38F85] uppercase tracking-wider block">Active Users</span>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xl font-bold text-emerald-600">{users.filter(u => u.status === 'Active').length}</span>
                          <UserCheck size={14} className="text-emerald-500" />
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-[#F5EFEB] space-y-1">
                        <span className="font-sans text-[9px] font-bold text-[#A38F85] uppercase tracking-wider block">Suspended Profiles</span>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xl font-bold text-rose-600">{users.filter(u => u.status === 'Suspended').length}</span>
                          <UserX size={14} className="text-rose-500" />
                        </div>
                      </div>
                    </div>

                    {/* Temp Password Showcase Notification */}
                    {tempPasswordShown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 font-sans"
                      >
                        <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                          <CheckCircle size={14} />
                          <span>Temporary Credential Generated</span>
                        </div>
                        <p className="text-xs text-emerald-800 leading-relaxed">
                          The credentials for account <span className="font-bold underline">{tempPasswordUser}</span> have been overwritten with a temporary credentials code. Under our strict zero-exposure policy, the original password hash was immediately erased and is completely non-recoverable. 
                        </p>
                        <div className="p-3 bg-white rounded-xl border border-emerald-100 flex items-center justify-between">
                          <code className="font-mono font-bold text-sm tracking-widest text-[#8A4853] selection:bg-rose-100">{tempPasswordShown}</code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(tempPasswordShown);
                              alert('Temporary password copied securely to clipboard!');
                            }}
                            className="bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-1 rounded-lg text-[9px] uppercase font-bold tracking-widest transition-colors flex items-center space-x-1"
                          >
                            <Copy size={10} />
                            <span>Copy Token</span>
                          </button>
                        </div>
                        <div className="flex justify-between items-center pt-1.5">
                          <p className="text-[9px] text-emerald-700 italic">This temporary password will not be displayed again. Close this card after copying.</p>
                          <button
                            onClick={() => { setTempPasswordShown(''); setTempPasswordUser(''); }}
                            className="text-[10px] font-bold text-emerald-800 uppercase hover:underline"
                          >
                            Acknowledge &amp; Dismiss
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Sub Tab selection and Form Toggles */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#F5EFEB] pb-3 gap-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => { setUserFormOpen(false); setEditingUser(null); setAuditTypeFilter('ALL'); }}
                          className={`px-3 py-1.5 rounded-lg font-sans text-[11px] font-bold uppercase tracking-wider transition-all ${
                            !userFormOpen && auditTypeFilter === 'ALL'
                              ? 'bg-[#8A4853] text-white'
                              : 'bg-white border border-[#F5EFEB] text-[#5A4A42] hover:bg-[#FAF6F0]'
                          }`}
                        >
                          User Directory
                        </button>
                        <button
                          onClick={() => { setUserFormOpen(false); setEditingUser(null); setAuditTypeFilter('AUDIT_VIEW'); }}
                          className={`px-3 py-1.5 rounded-lg font-sans text-[11px] font-bold uppercase tracking-wider transition-all ${
                            auditTypeFilter === 'AUDIT_VIEW'
                              ? 'bg-[#8A4853] text-white'
                              : 'bg-white border border-[#F5EFEB] text-[#5A4A42] hover:bg-[#FAF6F0]'
                          }`}
                        >
                          Audit Logs Tracker
                        </button>
                      </div>

                      {auditTypeFilter !== 'AUDIT_VIEW' && !userFormOpen && (
                        <button
                          onClick={() => {
                            setEditingUser(null);
                            setUEmail('');
                            setUName('');
                            setUPhone('');
                            setUAddress('');
                            setURole('Customer');
                            setUStatus('Active');
                            setUPassword('');
                            setUserFormOpen(true);
                          }}
                          className="bg-[#8A4853] hover:bg-[#70343e] text-white px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider flex items-center space-x-1.5 transition-colors self-end"
                        >
                          <Plus size={12} />
                          <span>Create Secure Account</span>
                        </button>
                      )}
                    </div>

                    {/* SUB-PANEL 1: CREATION / MODIFICATION FORM */}
                    {userFormOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-[#FAF6F0] p-4 sm:p-5 rounded-2xl border border-[#F5EFEB] space-y-4"
                      >
                        <div className="flex justify-between items-center border-b border-[#F5EFEB] pb-2">
                          <h5 className="font-sans text-xs font-bold text-[#1A1515] uppercase tracking-wider">
                            {editingUser ? 'Edit Secure Account Profile' : 'Provision Secure User Account'}
                          </h5>
                          <button
                            onClick={() => setUserFormOpen(false)}
                            className="text-neutral-400 hover:text-[#8A4853]"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (editingUser) {
                              const updated: UserProfile = {
                                ...editingUser,
                                email: uEmail,
                                fullName: uName,
                                phone: uPhone,
                                address: uAddress,
                                role: uRole,
                                status: uStatus,
                                updatedAt: new Date().toISOString()
                              };
                              onUpdateUser(updated);
                            } else {
                              const newUser: UserProfile = {
                                id: 'usr-' + Math.floor(100000 + Math.random() * 900000),
                                email: uEmail,
                                fullName: uName,
                                phone: uPhone,
                                address: uAddress,
                                role: uRole,
                                status: uStatus,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                passwordHash: uPassword || 'welcome123'
                              };
                              onAddUser(newUser);
                            }
                            setUserFormOpen(false);
                            setEditingUser(null);
                          }}
                          className="space-y-4 text-xs font-sans"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Email Address</label>
                              <input
                                type="email"
                                required
                                value={uEmail}
                                onChange={(e) => setUEmail(e.target.value)}
                                className="w-full bg-white border border-[#F5EFEB] rounded-xl px-3 py-2 text-[#1A1515]"
                                placeholder="e.g. employee@womenswardrobe.com"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Full Name</label>
                              <input
                                type="text"
                                required
                                value={uName}
                                onChange={(e) => setUName(e.target.value)}
                                className="w-full bg-white border border-[#F5EFEB] rounded-xl px-3 py-2 text-[#1A1515]"
                                placeholder="e.g. Zara Ahmed"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Phone Number</label>
                              <input
                                type="text"
                                required
                                value={uPhone}
                                onChange={(e) => setUPhone(e.target.value)}
                                className="w-full bg-white border border-[#F5EFEB] rounded-xl px-3 py-2 text-[#1A1515]"
                                placeholder="e.g. 03001234567"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Address</label>
                              <input
                                type="text"
                                required
                                value={uAddress}
                                onChange={(e) => setUAddress(e.target.value)}
                                className="w-full bg-white border border-[#F5EFEB] rounded-xl px-3 py-2 text-[#1A1515]"
                                placeholder="e.g. Gulberg, Lahore"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Role Permission Group</label>
                              <select
                                value={uRole}
                                onChange={(e) => setURole(e.target.value as UserRole)}
                                className="w-full bg-white border border-[#F5EFEB] rounded-xl px-3 py-2 text-[#1A1515]"
                              >
                                <option value="Customer">Customer</option>
                                <option value="StoreManager">StoreManager</option>
                                <option value="SuperAdmin">SuperAdmin</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Operational Status</label>
                              <select
                                value={uStatus}
                                onChange={(e) => setUStatus(e.target.value as UserStatus)}
                                className="w-full bg-white border border-[#F5EFEB] rounded-xl px-3 py-2 text-[#1A1515]"
                              >
                                <option value="Active">Active</option>
                                <option value="PendingApproval">PendingApproval</option>
                                <option value="Suspended">Suspended</option>
                              </select>
                            </div>

                            {!editingUser && (
                              <div>
                                <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Password Key</label>
                                <input
                                  type="password"
                                  required
                                  value={uPassword}
                                  onChange={(e) => setUPassword(e.target.value)}
                                  className="w-full bg-white border border-[#F5EFEB] rounded-xl px-3 py-2 text-[#1A1515]"
                                  placeholder="Password (salted simulated)"
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end space-x-2 pt-2 border-t border-[#F5EFEB]">
                            <button
                              type="button"
                              onClick={() => { setUserFormOpen(false); setEditingUser(null); }}
                              className="px-4 py-2 border border-[#F5EFEB] bg-white rounded-xl text-[10px] font-bold uppercase hover:bg-neutral-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-[#8A4853] hover:bg-[#70343e] text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase flex items-center space-x-1"
                            >
                              <Check size={12} />
                              <span>{editingUser ? 'Save Updates' : 'Provision User'}</span>
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {/* SUB-PANEL 2: ACTIVE DIRECTORY DIRECT LISTING */}
                    {auditTypeFilter !== 'AUDIT_VIEW' && !userFormOpen && (
                      <div className="space-y-4">
                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Search users by name, email, phone..."
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            className="flex-1 bg-white border border-[#F5EFEB] rounded-xl px-3.5 py-1.5 text-xs text-[#1A1515] placeholder-[#A38F85] focus:outline-none focus:ring-1 focus:ring-[#8A4853]"
                          />
                          <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-white border border-[#F5EFEB] rounded-xl px-3 py-1.5 text-xs text-[#5A4A42]"
                          >
                            <option value="ALL">All Roles</option>
                            <option value="SuperAdmin">Super Administrator</option>
                            <option value="StoreManager">Store Manager</option>
                            <option value="Customer">Customer</option>
                          </select>
                        </div>

                        {/* Directory list */}
                        <div className="bg-white border border-[#F5EFEB] rounded-3xl overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-[#FAF6F0] border-b border-[#F5EFEB] font-sans text-[10px] font-bold text-[#A38F85] uppercase tracking-wider">
                                  <th className="p-3 pl-4">Member Info</th>
                                  <th className="p-3">Role Group</th>
                                  <th className="p-3">Compliance Key</th>
                                  <th className="p-3">Status</th>
                                  <th className="p-3 text-right pr-4">Operations</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#F5EFEB] text-xs font-sans">
                                {users
                                  .filter(u => {
                                    const matchSearch = u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                      u.phone.includes(userSearchQuery);
                                    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
                                    return matchSearch && matchRole;
                                  })
                                  .map(user => (
                                    <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
                                      <td className="p-3 pl-4">
                                        <div className="flex items-center space-x-3">
                                          <div className="w-8 h-8 rounded-full bg-[#8A4853]/10 text-[#8A4853] font-bold text-xs flex items-center justify-center shrink-0">
                                            {user.fullName.slice(0, 2).toUpperCase()}
                                          </div>
                                          <div>
                                            <p className="font-semibold text-[#1A1515]">{user.fullName}</p>
                                            <p className="text-[10px] text-[#A38F85]">{user.email}</p>
                                            <p className="text-[10px] text-neutral-400 font-mono">{user.phone}</p>
                                          </div>
                                        </div>
                                      </td>

                                      <td className="p-3">
                                        <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                          user.role === 'SuperAdmin' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                          user.role === 'StoreManager' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                                          'bg-neutral-50 text-neutral-700 border border-neutral-100'
                                        }`}>
                                          {user.role}
                                        </span>
                                      </td>

                                      <td className="p-3">
                                        <span className="font-mono text-neutral-400 tracking-wider">••••••••</span>
                                        <span className="text-[8px] text-neutral-400 font-sans block italic">Securely Salted</span>
                                      </td>

                                      <td className="p-3">
                                        <span className={`inline-flex items-center space-x-1.5 text-[10px] font-semibold ${
                                          user.status === 'Active' ? 'text-emerald-600' :
                                          user.status === 'PendingApproval' ? 'text-amber-600' :
                                          'text-rose-600'
                                        }`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${
                                            user.status === 'Active' ? 'bg-emerald-500' :
                                            user.status === 'PendingApproval' ? 'bg-amber-500 animate-pulse' :
                                            'bg-rose-500'
                                          }`} />
                                          <span>{user.status === 'PendingApproval' ? 'Pending Approval' : user.status}</span>
                                        </span>
                                      </td>

                                      <td className="p-3 text-right pr-4 space-x-1.5 shrink-0 whitespace-nowrap">
                                        {user.status === 'PendingApproval' && (
                                          <button
                                            onClick={() => {
                                              if (window.confirm(`Authorize and active account for ${user.fullName}?`)) {
                                                onApproveUser(user.id);
                                              }
                                            }}
                                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wider transition-all"
                                            title="Approve User Account"
                                          >
                                            Approve
                                          </button>
                                        )}

                                        {user.status === 'Active' && user.role !== 'SuperAdmin' && (
                                          <button
                                            onClick={() => {
                                              if (window.confirm(`Are you sure you want to suspend access for ${user.fullName}?`)) {
                                                onSuspendUser(user.id);
                                              }
                                            }}
                                            className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wider transition-all"
                                            title="Suspend Active Directory"
                                          >
                                            Suspend
                                          </button>
                                        )}

                                        {user.status === 'Suspended' && (
                                          <button
                                            onClick={() => {
                                              if (window.confirm(`Restore service access and reactivate account for ${user.fullName}?`)) {
                                                onReactivateUser(user.id);
                                              }
                                            }}
                                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wider transition-all"
                                            title="Reactivate suspended directory"
                                          >
                                            Reactivate
                                          </button>
                                        )}

                                        <button
                                          onClick={async () => {
                                            if (window.confirm(`Trigger non-recoverable password reset for ${user.fullName}?`)) {
                                              const tempPass = await onInitiatePasswordReset(user.id);
                                              setTempPasswordUser(user.email);
                                              setTempPasswordShown(tempPass);
                                            }
                                          }}
                                          className="bg-neutral-50 hover:bg-neutral-100 text-[#5A4A42] border border-neutral-200 rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wider transition-all"
                                          title="Initiate Secure Password Reset"
                                        >
                                          Reset Pass
                                        </button>

                                        <button
                                          onClick={() => {
                                            setEditingUser(user);
                                            setUEmail(user.email);
                                            setUName(user.fullName);
                                            setUPhone(user.phone);
                                            setUAddress(user.address);
                                            setURole(user.role);
                                            setUStatus(user.status);
                                            setUPassword('');
                                            setUserFormOpen(true);
                                          }}
                                          className="text-neutral-500 hover:text-[#8A4853] p-1 inline-block"
                                          title="Edit details"
                                        >
                                          <Edit3 size={11} />
                                        </button>

                                        {user.role !== 'SuperAdmin' && (
                                          <button
                                            onClick={() => {
                                              if (window.confirm(`PERMANENTLY and irreversibly delete user account directory ${user.email}? This action is immutable.`)) {
                                                onDeleteUser(user.id);
                                              }
                                            }}
                                            className="text-[#8A4853] hover:text-rose-700 p-1 inline-block"
                                            title="Delete account permanently"
                                          >
                                            <Trash2 size={11} />
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-PANEL 3: IMMUTABLE AUDIT LOGS DISPLAY */}
                    {auditTypeFilter === 'AUDIT_VIEW' && (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                              <Terminal size={12} />
                            </span>
                            <input
                              type="text"
                              placeholder="Search logs by operator email, action, ID or status..."
                              value={auditFilter}
                              onChange={(e) => setAuditFilter(e.target.value)}
                              className="w-full bg-white border border-[#F5EFEB] rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-[#1A1515] placeholder-[#A38F85] focus:outline-none"
                            />
                          </div>
                          
                          <select
                            value={auditFilter === '' ? 'ALL' : auditFilter}
                            onChange={(e) => setAuditFilter(e.target.value === 'ALL' ? '' : e.target.value)}
                            className="bg-white border border-[#F5EFEB] rounded-xl px-3 py-1.5 text-xs text-[#5A4A42]"
                          >
                            <option value="ALL">All Event Types</option>
                            <option value="User Registration">User Registration</option>
                            <option value="Authentication Attempt">Authentication Attempt</option>
                            <option value="Profile Modification">Profile Modification</option>
                            <option value="Password Reset Request">Password Reset Request</option>
                            <option value="Role Change">Role Change</option>
                            <option value="Account Status Update">Account Status Update</option>
                            <option value="Administrative Action">Administrative Action</option>
                          </select>
                        </div>

                        {/* Logs list (Monospace secure layout) */}
                        <div className="bg-[#1C1616] text-neutral-300 rounded-3xl border border-neutral-800 p-4 sm:p-5 font-mono text-[11px] leading-relaxed max-h-[420px] overflow-y-auto space-y-3 shadow-inner">
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5 mb-2.5">
                            <span className="text-neutral-500 uppercase tracking-widest text-[9px] font-bold flex items-center gap-1.5">
                              <Activity size={11} className="text-rose-500 animate-pulse" /> Platform Security Auditing Console
                            </span>
                            <span className="text-neutral-500 text-[9px]">{auditLogs.length} entries recorded</span>
                          </div>

                          {auditLogs
                            .filter(log => {
                              const matchText = log.description.toLowerCase().includes(auditFilter.toLowerCase()) ||
                                log.userEmail.toLowerCase().includes(auditFilter.toLowerCase()) ||
                                log.id.toLowerCase().includes(auditFilter.toLowerCase()) ||
                                log.eventType.toLowerCase().includes(auditFilter.toLowerCase());
                              return matchText;
                            })
                            .map(log => (
                              <div key={log.id} className="border-b border-neutral-900/60 pb-2.5 space-y-1">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center text-[10px] gap-1 text-neutral-500">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[#8A4853] font-bold">[{log.eventType}]</span>
                                    <span className="text-neutral-400">ID: {log.id}</span>
                                    <span>•</span>
                                    <span className="font-semibold text-neutral-400">{log.ipAddress}</span>
                                  </div>
                                  <span className="text-neutral-600">{log.timestamp}</span>
                                </div>
                                <p className="text-neutral-200 leading-normal pl-2 border-l border-neutral-800">
                                  {log.description}
                                </p>
                                <div className="flex items-center space-x-2 text-[10px] text-neutral-500 pl-2">
                                  <span>Operator: <strong className="text-neutral-400">{log.userEmail}</strong> ({log.role})</span>
                                  <span>•</span>
                                  <span className={`font-bold ${
                                    log.status === 'Success' ? 'text-emerald-500' :
                                    log.status === 'Failure' ? 'text-rose-500' :
                                    'text-amber-500'
                                  }`}>
                                    STATUS: {log.status}
                                  </span>
                                </div>
                              </div>
                            ))}

                          {auditLogs.length === 0 && (
                            <p className="text-center text-neutral-500 py-6">No audit records retrieved under active search parameters.</p>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* GOOGLE SHEETS & CLOUD SYNC TAB */}
                {activeTab === 'sheets' && (
                  <div className="space-y-6">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-emerald-900/10 via-emerald-800/5 to-teal-900/10 border border-emerald-800/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                          <FileSpreadsheet size={24} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-playfair text-lg text-[#1A1515] font-bold">Google Sheets Cloud Workspace</h4>
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                              Live Sync
                            </span>
                          </div>
                          <p className="font-sans text-xs text-[#5A4A42] mt-0.5">
                            Connect your Google Account to export orders, synchronize catalog items, manage client profiles, and import inventory directly.
                          </p>
                        </div>
                      </div>

                      {/* Google Connection Control */}
                      <div className="shrink-0 flex items-center">
                        {googleUser ? (
                          <div className="flex items-center space-x-3 bg-white border border-emerald-200/80 rounded-xl p-2 sm:px-3 sm:py-2 shadow-xs">
                            {googleUser.photoURL ? (
                              <img
                                src={googleUser.photoURL}
                                alt={googleUser.displayName}
                                className="w-7 h-7 rounded-full object-cover border border-emerald-500/30"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                                {googleUser.displayName.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="text-left hidden sm:block">
                              <p className="font-sans text-[10px] font-bold text-[#1A1515] leading-tight truncate max-w-[140px]">
                                {googleUser.displayName}
                              </p>
                              <p className="font-sans text-[9px] text-emerald-700 truncate max-w-[140px]">
                                {googleUser.email}
                              </p>
                            </div>
                            <button
                              onClick={handleDisconnectGoogleAccount}
                              className="text-[9px] font-bold uppercase text-neutral-400 hover:text-red-500 px-2 py-1 transition-colors"
                              title="Disconnect Google Account"
                            >
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleConnectGoogleAccount}
                            disabled={isConnectingGoogle}
                            className="bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white px-4 py-2.5 rounded-xl font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow flex items-center space-x-2 disabled:opacity-50"
                          >
                            <Globe size={14} />
                            <span>{isConnectingGoogle ? 'Connecting to Google...' : 'Connect Google Account'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notice Feedback Banner */}
                    {sheetsNotice && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3.5 rounded-xl border flex items-center justify-between space-x-3 text-xs ${
                          sheetsNotice.type === 'success'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : 'bg-rose-50 text-rose-900 border-rose-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {sheetsNotice.type === 'success' ? (
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle size={16} className="text-rose-600 shrink-0" />
                          )}
                          <span className="font-medium">{sheetsNotice.message}</span>
                        </div>
                        {sheetsNotice.url && (
                          <a
                            href={sheetsNotice.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider flex items-center space-x-1 shrink-0 transition-colors shadow-xs"
                          >
                            <span>Open in Google Sheets</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </motion.div>
                    )}

                    {/* 4 One-Click Export Operations Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Card 1: Orders Ledger */}
                      <div className="bg-white rounded-2xl border border-[#F5EFEB] p-5 space-y-4 hover:shadow-sm transition-all flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                              <ShoppingBag size={18} />
                            </div>
                            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38F85] bg-[#FAF6F0] px-2 py-0.5 rounded-full">
                              {orders.length} Order Records
                            </span>
                          </div>
                          <h5 className="font-playfair text-base font-bold text-[#1A1515]">Inbound Orders Ledger</h5>
                          <p className="font-sans text-xs text-[#5A4A42] leading-relaxed">
                            Generate an itemized spreadsheet detailing customer receipts, phone numbers, delivery addresses, order totals (Rs.), item breakdowns, and fulfillment statuses.
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#F5EFEB] flex flex-wrap items-center gap-2">
                          <button
                            onClick={handleExportOrders}
                            disabled={isExportingSheets === 'orders'}
                            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3 rounded-xl font-sans text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                          >
                            <FileSpreadsheet size={13} />
                            <span>{isExportingSheets === 'orders' ? 'Syncing...' : 'Export Orders Sheet'}</span>
                          </button>
                          {lastOrdersSheet && (
                            <>
                              <button
                                onClick={handleClearOrdersSheet}
                                disabled={isExportingSheets === 'clear_orders'}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 px-2.5 rounded-xl font-sans text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center space-x-1 disabled:opacity-50"
                                title="Clear Orders Sheet Rows"
                              >
                                <Trash2 size={12} />
                                <span>{isExportingSheets === 'clear_orders' ? 'Clearing...' : 'Clear'}</span>
                              </button>
                              <a
                                href={`https://docs.google.com/spreadsheets/d/${lastOrdersSheet}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-neutral-100 hover:bg-neutral-200 text-[#5A4A42] p-2 rounded-xl transition-colors"
                                title="Open Last Orders Sheet"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Card 2: Product Catalog */}
                      <div className="bg-white rounded-2xl border border-[#F5EFEB] p-5 space-y-4 hover:shadow-sm transition-all flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                              <Tag size={18} />
                            </div>
                            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38F85] bg-[#FAF6F0] px-2 py-0.5 rounded-full">
                              {products.length} Showroom Items
                            </span>
                          </div>
                          <h5 className="font-playfair text-base font-bold text-[#1A1515]">Product Catalog &amp; Pricing</h5>
                          <p className="font-sans text-xs text-[#5A4A42] leading-relaxed">
                            Export complete product inventory matrices including prices, SKU IDs, available cup sizes, color swatches, customer ratings, bullet points, and image URLs.
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#F5EFEB] flex flex-wrap items-center gap-2">
                          <button
                            onClick={handleExportProducts}
                            disabled={isExportingSheets === 'products'}
                            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3 rounded-xl font-sans text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                          >
                            <FileSpreadsheet size={13} />
                            <span>{isExportingSheets === 'products' ? 'Syncing...' : 'Export Catalog Sheet'}</span>
                          </button>
                          {lastProductsSheet && (
                            <>
                              <button
                                onClick={handleClearProductsSheet}
                                disabled={isExportingSheets === 'clear_products'}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 px-2.5 rounded-xl font-sans text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center space-x-1 disabled:opacity-50"
                                title="Clear Catalog Sheet Rows"
                              >
                                <Trash2 size={12} />
                                <span>{isExportingSheets === 'clear_products' ? 'Clearing...' : 'Clear'}</span>
                              </button>
                              <a
                                href={`https://docs.google.com/spreadsheets/d/${lastProductsSheet}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-neutral-100 hover:bg-neutral-200 text-[#5A4A42] p-2 rounded-xl transition-colors"
                                title="Open Last Products Sheet"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Card 3: Customers Directory */}
                      <div className="bg-white rounded-2xl border border-[#F5EFEB] p-5 space-y-4 hover:shadow-sm transition-all flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                              <Users size={18} />
                            </div>
                            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38F85] bg-[#FAF6F0] px-2 py-0.5 rounded-full">
                              {users.length} User Profiles
                            </span>
                          </div>
                          <h5 className="font-playfair text-base font-bold text-[#1A1515]">Registered Client Profiles</h5>
                          <p className="font-sans text-xs text-[#5A4A42] leading-relaxed">
                            Export active client accounts, registered contact phone numbers, delivery addresses, designated access roles, and account approval statuses.
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#F5EFEB] flex items-center">
                          <button
                            onClick={handleExportCustomers}
                            disabled={isExportingSheets === 'customers'}
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3 rounded-xl font-sans text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                          >
                            <FileSpreadsheet size={13} />
                            <span>{isExportingSheets === 'customers' ? 'Syncing...' : 'Export Customer Registry'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Card 4: Audit Security Trail */}
                      <div className="bg-white rounded-2xl border border-[#F5EFEB] p-5 space-y-4 hover:shadow-sm transition-all flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                              <Shield size={18} />
                            </div>
                            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38F85] bg-[#FAF6F0] px-2 py-0.5 rounded-full">
                              {auditLogs.length} Audit Events
                            </span>
                          </div>
                          <h5 className="font-playfair text-base font-bold text-[#1A1515]">Security &amp; Compliance Trail</h5>
                          <p className="font-sans text-xs text-[#5A4A42] leading-relaxed">
                            Produce an audit spreadsheet tracking administrative actions, catalog changes, order updates, operator logins, and security events.
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#F5EFEB] flex items-center">
                          <button
                            onClick={handleExportAudit}
                            disabled={isExportingSheets === 'audit'}
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3 rounded-xl font-sans text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                          >
                            <FileSpreadsheet size={13} />
                            <span>{isExportingSheets === 'audit' ? 'Syncing...' : 'Export Audit Trail Sheet'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Real-Time Auto Sync & Import Workspace */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Auto-Sync Settings Box */}
                      <div className="bg-[#FAF6F0] rounded-2xl border border-[#F5EFEB] p-5 space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                            <CloudLightning size={16} />
                          </div>
                          <div>
                            <h5 className="font-playfair text-sm font-bold text-[#1A1515]">Real-Time Order Auto-Sync</h5>
                            <p className="font-sans text-[10px] text-[#A38F85]">Automatic streaming to Google Sheets upon checkout</p>
                          </div>
                        </div>

                        <p className="font-sans text-xs text-[#5A4A42] leading-relaxed">
                          When enabled, each newly finalized customer checkout order will automatically append as a new row to your active Google Sheet ledger with item breakdowns and payment info.
                        </p>

                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#F5EFEB]">
                          <div className="space-y-0.5">
                            <span className="font-sans text-xs font-bold text-[#1A1515] block">
                              Automate Order Streaming
                            </span>
                            <span className="font-sans text-[10px] text-[#A38F85] block">
                              {autoSyncOrders ? 'Active - Appending each new order in real-time' : 'Disabled - Manual export only'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleAutoSync(!autoSyncOrders)}
                            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                              autoSyncOrders ? 'bg-emerald-600' : 'bg-neutral-300'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                                autoSyncOrders ? 'translate-x-6' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Import Catalog from Google Sheets */}
                      <div className="bg-[#FAF6F0] rounded-2xl border border-[#F5EFEB] p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                              <DownloadCloud size={16} />
                            </div>
                            <div>
                              <h5 className="font-playfair text-sm font-bold text-[#1A1515]">Import Catalog from Google Sheet</h5>
                              <p className="font-sans text-[10px] text-[#A38F85]">Bulk inventory synchronization from any sheet</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handlePickSheetForImport}
                            disabled={isPickingWithGoogle === 'sheet'}
                            className="bg-white hover:bg-[#FAF6F0] text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider transition-colors flex items-center space-x-1 shadow-sm disabled:opacity-50"
                            title="Browse and pick spreadsheet directly from Google Drive"
                          >
                            <FolderSearch size={12} />
                            <span>{isPickingWithGoogle === 'sheet' ? 'Opening...' : 'Browse Picker'}</span>
                          </button>
                        </div>

                        <form onSubmit={handleImportProducts} className="space-y-3">
                          <div className="space-y-1">
                            <label className="font-sans text-[9px] font-bold text-[#A38F85] uppercase block">
                              Google Sheet URL or Spreadsheet ID
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={importSheetUrl}
                                onChange={(e) => setImportSheetUrl(e.target.value)}
                                placeholder="https://docs.google.com/spreadsheets/d/... or ID"
                                className="w-full bg-white border border-[#F5EFEB] rounded-xl px-3 py-2 text-xs text-[#1A1515] placeholder-[#A38F85] focus:outline-none focus:ring-1 focus:ring-emerald-600 pr-24"
                              />
                              <button
                                type="button"
                                onClick={handlePickSheetForImport}
                                disabled={isPickingWithGoogle === 'sheet'}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase px-2 py-1 rounded-lg border border-emerald-200 transition-colors"
                              >
                                Pick Sheet
                              </button>
                            </div>
                          </div>

                          {pickedFileNotice && (
                            <div className="p-2 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[10px] text-emerald-800 flex items-center justify-between">
                              <div className="flex items-center space-x-1.5 truncate">
                                <FileSpreadsheet size={12} className="shrink-0 text-emerald-700" />
                                <span className="truncate">Picked: <strong>{pickedFileNotice.name}</strong></span>
                              </div>
                              <a
                                href={pickedFileNotice.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[9px] underline font-bold uppercase shrink-0 hover:text-emerald-950 flex items-center space-x-0.5"
                              >
                                <span>Open</span>
                                <ExternalLink size={9} />
                              </a>
                            </div>
                          )}

                          {importNotice && (
                            <div
                              className={`p-2.5 rounded-lg text-[10px] font-medium flex items-center space-x-2 ${
                                importNotice.type === 'success'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {importNotice.type === 'success' ? <Check size={12} /> : <AlertCircle size={12} />}
                              <span>{importNotice.message}</span>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={isImportingProducts || !importSheetUrl.trim()}
                            className="w-full bg-[#1A1515] hover:bg-neutral-800 text-white py-2 rounded-xl font-sans text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                          >
                            <DownloadCloud size={12} />
                            <span>{isImportingProducts ? 'Importing Products...' : 'Import Catalog Rows'}</span>
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Google Picker & Cloud Drive Asset Explorer */}
                    <div className="bg-white rounded-2xl border border-[#F5EFEB] p-5 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F5EFEB] pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                            <FolderSearch size={18} />
                          </div>
                          <div>
                            <h5 className="font-playfair text-base font-bold text-[#1A1515]">Google Picker &amp; Drive Workspace Hub</h5>
                            <p className="font-sans text-[10px] text-[#A38F85]">Interactive client-side Google Drive modal to select images, spreadsheets, and files</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold uppercase text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                            Google Picker API v2
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenDrivePickerGeneral('spreadsheets')}
                          disabled={isPickingWithGoogle === 'general'}
                          className="p-3 rounded-xl bg-[#FAF6F0] hover:bg-emerald-50 border border-[#F5EFEB] hover:border-emerald-200 text-left transition-all group flex flex-col justify-between space-y-2 disabled:opacity-50"
                        >
                          <div className="flex items-center justify-between">
                            <FileSpreadsheet size={16} className="text-emerald-700" />
                            <span className="text-[9px] font-bold text-emerald-800 uppercase group-hover:underline">Browse</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#1A1515] block">Pick Spreadsheets</span>
                            <span className="text-[9px] text-[#A38F85] block">Inspect inventories or order logs</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDrivePickerGeneral('images')}
                          disabled={isPickingWithGoogle === 'general'}
                          className="p-3 rounded-xl bg-[#FAF6F0] hover:bg-rose-50 border border-[#F5EFEB] hover:border-rose-200 text-left transition-all group flex flex-col justify-between space-y-2 disabled:opacity-50"
                        >
                          <div className="flex items-center justify-between">
                            <ImagePlus size={16} className="text-[#8A4853]" />
                            <span className="text-[9px] font-bold text-[#8A4853] uppercase group-hover:underline">Browse</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#1A1515] block">Pick Media &amp; Photos</span>
                            <span className="text-[9px] text-[#A38F85] block">Browse product photoshoot images</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDrivePickerGeneral('all')}
                          disabled={isPickingWithGoogle === 'general'}
                          className="p-3 rounded-xl bg-[#FAF6F0] hover:bg-blue-50 border border-[#F5EFEB] hover:border-blue-200 text-left transition-all group flex flex-col justify-between space-y-2 disabled:opacity-50"
                        >
                          <div className="flex items-center justify-between">
                            <FolderArchive size={16} className="text-blue-700" />
                            <span className="text-[9px] font-bold text-blue-800 uppercase group-hover:underline">Browse</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#1A1515] block">All Drive Files</span>
                            <span className="text-[9px] text-[#A38F85] block">Explore all folders and documents</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDrivePickerGeneral('upload')}
                          disabled={isPickingWithGoogle === 'general'}
                          className="p-3 rounded-xl bg-[#FAF6F0] hover:bg-purple-50 border border-[#F5EFEB] hover:border-purple-200 text-left transition-all group flex flex-col justify-between space-y-2 disabled:opacity-50"
                        >
                          <div className="flex items-center justify-between">
                            <FileUp size={16} className="text-purple-700" />
                            <span className="text-[9px] font-bold text-purple-800 uppercase group-hover:underline">Upload</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#1A1515] block">Upload to Drive</span>
                            <span className="text-[9px] text-[#A38F85] block">Direct drag &amp; drop to Google Cloud</span>
                          </div>
                        </button>
                      </div>

                      {recentPickedFiles.length > 0 && (
                        <div className="pt-2 border-t border-[#F5EFEB] space-y-2">
                          <span className="font-sans text-[9px] font-bold text-[#A38F85] uppercase tracking-wider block">
                            Recent Drive Selections
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {recentPickedFiles.map((file) => (
                              <div key={file.id} className="flex items-center justify-between p-2 rounded-xl bg-[#FAF6F0] border border-[#F5EFEB] text-xs">
                                <div className="flex items-center space-x-2 truncate">
                                  {file.mimeType.includes('spreadsheet') ? (
                                    <FileSpreadsheet size={14} className="text-emerald-600 shrink-0" />
                                  ) : file.mimeType.includes('image') ? (
                                    <ImageIcon size={14} className="text-[#8A4853] shrink-0" />
                                  ) : (
                                    <FileText size={14} className="text-blue-600 shrink-0" />
                                  )}
                                  <span className="truncate text-[#1A1515] font-medium text-[11px]">{file.name}</span>
                                </div>
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[9px] font-bold text-[#8A4853] uppercase hover:underline ml-2 flex items-center space-x-0.5 shrink-0"
                                >
                                  <span>View</span>
                                  <ExternalLink size={9} />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
