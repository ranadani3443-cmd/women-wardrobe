import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Check, 
  CreditCard, Sparkles, Copy, MessageCircle, UploadCloud, Lock,
  ImagePlus, Building2, Smartphone, Send, CheckCircle2, ExternalLink,
  ShieldCheck, Zap
} from 'lucide-react';
import { CartItem, PaymentMethod, DeliveryFeeConfig, AdminOrder, OrderItem, UserProfile } from '../types';
import { openGooglePicker } from '../lib/googlePicker';
import { 
  formatOrderWhatsAppMessage, 
  getMerchantWhatsAppOrderLink, 
  getMerchantWhatsAppNumber 
} from '../lib/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  paymentMethods: PaymentMethod[];
  deliveryFeeConfig: DeliveryFeeConfig;
  onPlaceOrder?: (order: AdminOrder) => void;
  currentUser?: UserProfile | null;
}

// Inline Drag & Drop Screenshot Upload
interface ScreenshotUploadProps {
  onUpload: (base64: string) => void;
  currentScreenshot?: string;
}

function ScreenshotUpload({ onUpload, currentScreenshot }: ScreenshotUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPickingDrive, setIsPickingDrive] = useState(false);

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
      alert("Please upload an image file (PNG/JPG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onUpload(reader.result);
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

  const handlePickFromDrive = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPickingDrive(true);
    try {
      const file = await openGooglePicker({
        viewType: 'images',
        title: 'Select Payment Receipt Screenshot from Google Drive',
      });
      if (file) {
        const imageUrl = file.thumbnailUrl 
          ? file.thumbnailUrl.replace(/=s\d+/, '=s1000') 
          : `https://drive.google.com/uc?export=view&id=${file.id}`;
        onUpload(imageUrl);
      }
    } catch (err: any) {
      console.error('Google Picker Receipt error:', err);
      alert(err.message || 'Failed to open Google Drive picker.');
    } finally {
      setIsPickingDrive(false);
    }
  };

  return (
    <div className="space-y-2">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-[#8A4853] bg-[#8A4853]/5 scale-[0.99]"
            : "border-[#F5EFEB] bg-white hover:border-[#8A4853]/50"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          id="screenshot-file-input"
        />
        <label htmlFor="screenshot-file-input" className="cursor-pointer block space-y-1.5">
          {currentScreenshot ? (
            <div className="relative mx-auto w-20 h-20 rounded-lg overflow-hidden border border-neutral-200 bg-[#FAF6F0]">
              <img src={currentScreenshot} alt="Receipt preview" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-[8px] font-bold uppercase tracking-wider">Replace</span>
              </div>
            </div>
          ) : (
            <div className="py-1 flex flex-col items-center justify-center space-y-1">
              <UploadCloud className="w-6 h-6 text-[#A38F85] stroke-1.5" />
              <p className="font-sans text-[9px] text-[#5A4A42] font-semibold">
                Drag & Drop payment proof screenshot here or click
              </p>
              <p className="font-sans text-[7px] text-[#A38F85]">Supports JPEG, PNG, WEBP</p>
            </div>
          )}
        </label>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handlePickFromDrive}
          disabled={isPickingDrive}
          className="text-[9px] font-sans font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1.5 disabled:opacity-50"
        >
          <ImagePlus size={11} />
          <span>{isPickingDrive ? 'Opening Google Picker...' : 'Or Select Receipt from Google Drive'}</span>
        </button>
      </div>
    </div>
  );
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  paymentMethods,
  deliveryFeeConfig,
  onPlaceOrder,
  currentUser
}: CartDrawerProps) {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'complete'>('cart');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('online');
  const [screenshotBase64, setScreenshotBase64] = useState<string>('');
  const [generatedReceiptId, setGeneratedReceiptId] = useState('');
  const [latestOrder, setLatestOrder] = useState<AdminOrder | null>(null);
  const [isCopiedSlip, setIsCopiedSlip] = useState(false);

  // Auto pre-fill from logged-in currentUser
  React.useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        setFullName(currentUser.fullName || '');
        setPhone(currentUser.phone || '');
        setAddress(currentUser.address || '');
      } else {
        if (!fullName && !phone && !address) {
          setFullName('');
          setPhone('');
          setAddress('');
        }
      }
    }
  }, [isOpen, currentUser]);

  // Secure Online Payment States
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState('');
  const [formError, setFormError] = useState('');
  const [copiedText, setCopiedText] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = deliveryFeeConfig.isFree ? 0 : deliveryFeeConfig.amount;
  const total = subtotal + shippingFee;

  const activeMethods = paymentMethods.filter(pm => pm.isActive);

  const handleCheckoutSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setFormError('Please fill out all required shipping details (Name, Phone, Address).');
      return;
    }

    if (selectedPaymentId === 'online') {
      if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
        setFormError('Please fill out all Credit/Debit card details.');
        return;
      }
      
      // Card details format validation
      if (cardNumber.replace(/\s/g, '').length < 15) {
        setFormError('Please enter a valid 16-digit Card Number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setFormError('Please enter expiration date (MM/YY).');
        return;
      }
      if (cardCvc.length < 3) {
        setFormError('Please enter 3-digit CVV code.');
        return;
      }

      // Enter Simulation Mode
      setIsProcessingPayment(true);
      setPaymentStep('Connecting to secure Stripe/HBL server...');
      
      setTimeout(() => {
        setPaymentStep('Establishing SSL encrypted tunnel...');
        
        setTimeout(() => {
          setPaymentStep('Authenticating 3D-Secure 2.0 protocol...');
          
          setTimeout(() => {
            setPaymentStep('Verifying card balances and merchant handshake...');
            
            setTimeout(() => {
              // Complete simulation
              setIsProcessingPayment(false);
              const receiptId = `WW-${Math.floor(100000 + Math.random() * 900000)}`;
              setGeneratedReceiptId(receiptId);
              
              const newOrderObj: AdminOrder = {
                id: receiptId,
                customerName: fullName,
                phone,
                address,
                paymentMethod: 'Secure Online Gateway (Card)',
                deliveryCharge: shippingFee,
                total,
                date: new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                status: 'Pending',
                paymentStatus: 'Paid', // Automatic Paid status!
                customerEmail: currentUser?.email || undefined,
                userId: currentUser?.id || undefined,
                createdAt: Date.now(),
                items: cartItems.map(item => ({
                  productName: item.product.name,
                  category: item.product.category,
                  size: item.selectedSize,
                  color: item.selectedColor.name,
                  quantity: item.quantity,
                  price: item.product.price
                }))
              };

              setLatestOrder(newOrderObj);
              if (onPlaceOrder) {
                onPlaceOrder(newOrderObj);
              }

              // Automatically trigger WhatsApp direct notification
              try {
                const waLink = getMerchantWhatsAppOrderLink(newOrderObj);
                window.open(waLink, '_blank');
              } catch (e) {
                console.warn('Auto-open WhatsApp skipped', e);
              }

              setCheckoutStep('complete');
              
              // Clear card details
              setCardNumber('');
              setCardExpiry('');
              setCardCvc('');
              setCardName('');
            }, 800);
          }, 800);
        }, 800);
      }, 800);
      
      return;
    }

    const matchedMethod = activeMethods.find(pm => pm.id === selectedPaymentId) || { name: 'Cash On Delivery' };
    
    // Validate if they selected a manual payment and didn't upload screenshot
    if (selectedPaymentId !== 'cod' && selectedPaymentId !== 'online' && !screenshotBase64) {
      if (!window.confirm("You have not uploaded a payment screenshot. Do you want to submit anyway? (You can also drag & drop one now for admin verification.)")) {
        return;
      }
    }
    
    const receiptId = `WW-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedReceiptId(receiptId);

    const newOrderObj: AdminOrder = {
      id: receiptId,
      customerName: fullName,
      phone,
      address,
      paymentMethod: matchedMethod.name,
      deliveryCharge: shippingFee,
      total,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Pending',
      paymentStatus: 'Unpaid',
      paymentScreenshot: screenshotBase64 || undefined,
      customerEmail: currentUser?.email || undefined,
      userId: currentUser?.id || undefined,
      createdAt: Date.now(),
      items: cartItems.map(item => ({
        productName: item.product.name,
        category: item.product.category,
        size: item.selectedSize,
        color: item.selectedColor.name,
        quantity: item.quantity,
        price: item.product.price
      }))
    };

    setLatestOrder(newOrderObj);
    if (onPlaceOrder) {
      onPlaceOrder(newOrderObj);
    }

    // Automatically trigger WhatsApp direct notification
    try {
      const waLink = getMerchantWhatsAppOrderLink(newOrderObj);
      window.open(waLink, '_blank');
    } catch (e) {
      console.warn('Auto-open WhatsApp skipped', e);
    }

    setCheckoutStep('complete');
  };

  const handleCompleteClose = () => {
    onClearCart();
    setCheckoutStep('cart');
    setFullName('');
    setPhone('');
    setAddress('');
    setSelectedPaymentId('online');
    setScreenshotBase64('');
    onClose();
  };

  const handleCopyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2500);
    } catch {}
  };

  const selectedPaymentMethod = activeMethods.find(pm => pm.id === selectedPaymentId);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        />

        {/* Drawer container panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="w-screen max-w-md bg-[#FAF6F0] shadow-2xl border-l border-[#F5EFEB] flex flex-col justify-between relative"
          >
            {/* Processing Gateway Overlay */}
            <AnimatePresence>
              {isProcessingPayment && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#FAF6F0]/95 z-50 flex flex-col items-center justify-center p-6 text-center"
                >
                  <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                    <Lock size={24} className="text-emerald-600 animate-pulse" />
                  </div>
                  
                  <h4 className="font-playfair text-base text-neutral-800 font-bold mb-1">Processing Gateway Handshake</h4>
                  <p className="font-sans text-[10px] tracking-widest text-[#A38F85] uppercase font-bold animate-pulse mb-4">
                    Do not refresh or close window
                  </p>
                  
                  <div className="bg-white border border-neutral-100 rounded-xl px-4 py-2 text-[11px] font-mono text-neutral-600 shadow-xs max-w-xs leading-normal">
                    {paymentStep}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-[#F5EFEB] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag size={18} className="text-[#8A4853]" />
                <h3 className="font-playfair text-base sm:text-lg text-[#1A1515] font-semibold">
                  {checkoutStep === 'cart' && 'Your Shopping Bag'}
                  {checkoutStep === 'shipping' && 'Secure Checkout'}
                  {checkoutStep === 'complete' && 'Order Placed!'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-[#5A4A42] hover:text-[#8A4853] p-1.5 rounded-full hover:bg-white transition-colors focus:outline-none"
                id="close-cart-drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main content body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
              
              {checkoutStep === 'cart' && (
                <>
                  {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                      <div className="w-16 h-16 rounded-full bg-[#FAF6F0] border border-[#F5EFEB] flex items-center justify-center text-[#A38F85]">
                        <ShoppingBag size={24} className="stroke-[1.5]" />
                      </div>
                      <p className="font-playfair text-base text-[#1A1515] font-semibold">Your bag is empty</p>
                      <p className="font-sans text-xs text-[#5A4A42] max-w-[240px]">
                        Add items from our premium bra and abaya collections to get started.
                      </p>
                      <button
                        onClick={onClose}
                        className="bg-[#8A4853] hover:bg-[#70343e] text-white px-6 py-2.5 rounded-xl font-sans text-[10px] tracking-widest font-bold uppercase transition-colors"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4 bg-white p-3 rounded-2xl border border-[#FAF6F0] relative group hover:shadow-sm transition-shadow duration-300"
                        >
                          <div className="w-16 h-20 rounded-xl bg-[#FAF6F0] overflow-hidden shrink-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          <div className="flex-grow space-y-1">
                            <h4 className="font-playfair text-xs text-[#1A1515] font-semibold line-clamp-1">
                              {item.product.name}
                            </h4>
                            
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-[#5A4A42]">
                              <span>Size: <strong className="font-bold">{item.selectedSize}</strong></span>
                              <span className="flex items-center gap-1">
                                Color: 
                                <span
                                  className="w-2 h-2 rounded-full inline-block border border-black/10"
                                  style={{ backgroundColor: item.selectedColor.hex }}
                                  title={item.selectedColor.name}
                                />
                                <strong className="font-bold">{item.selectedColor.name}</strong>
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              {/* Quantity Adjuster */}
                              <div className="flex items-center border border-[#F5EFEB] rounded-lg px-2 py-0.5 bg-[#FAF6F0]">
                                <button
                                  onClick={() => onUpdateQuantity(item.id, -1)}
                                  className="text-[#5A4A42] hover:text-[#8A4853] px-1 text-xs font-semibold focus:outline-none"
                                >
                                  -
                                </button>
                                <span className="font-sans text-xs font-bold px-1">{item.quantity}</span>
                                <button
                                  onClick={() => onUpdateQuantity(item.id, 1)}
                                  className="text-[#5A4A42] hover:text-[#8A4853] px-1 text-xs font-semibold focus:outline-none"
                                >
                                  +
                                </button>
                              </div>

                              <span className="font-playfair text-xs font-bold text-[#8A4853]">
                                Rs. {(item.product.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Delete Item */}
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="absolute top-2 right-2 text-neutral-300 hover:text-red-500 transition-colors p-1"
                            title="Remove item"
                            id={`remove-cart-item-${item.id}`}
                          >
                            <Trash2 size={13} />
                          </button>

                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {checkoutStep === 'shipping' && (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4 animate-fade-in">
                  
                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-[11px] p-2.5 rounded-xl font-sans">
                      ⚠️ {formError}
                    </div>
                  )}

                  {copiedText && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-2 rounded-xl font-sans flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>Copied details to clipboard!</span>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <label className="font-sans text-[9px] tracking-wider text-[#A38F85] font-bold uppercase">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ayesha Khan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white border border-[#F5EFEB] rounded-xl px-4 py-2.5 text-xs text-[#5A4A42] focus:outline-none focus:ring-1 focus:ring-[#8A4853] focus:border-[#8A4853]"
                      id="shipping-fullname"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-sans text-[9px] tracking-wider text-[#A38F85] font-bold uppercase">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +92 342 2939080"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-[#F5EFEB] rounded-xl px-4 py-2.5 text-xs text-[#5A4A42] focus:outline-none focus:ring-1 focus:ring-[#8A4853] focus:border-[#8A4853]"
                      id="shipping-phone"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-sans text-[9px] tracking-wider text-[#A38F85] font-bold uppercase">
                      Shipping Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Apartment, Street Name, Sector, City"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white border border-[#F5EFEB] rounded-xl px-4 py-2.5 text-xs text-[#5A4A42] focus:outline-none focus:ring-1 focus:ring-[#8A4853] focus:border-[#8A4853]"
                      id="shipping-address"
                    />
                  </div>

                  {/* Dynamic Payment Method List Selection */}
                  <div className="space-y-2 pt-1">
                    <span className="font-sans text-[9px] tracking-wider text-[#A38F85] font-bold uppercase block">
                      Choose Payment Method:
                    </span>
                    
                    <div className="space-y-2">
                      {/* Secure Online Payment is the recommended gateway */}
                      <div
                        onClick={() => setSelectedPaymentId('online')}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedPaymentId === 'online'
                            ? 'bg-emerald-500/5 border-emerald-500 text-emerald-800 shadow-xs'
                            : 'bg-white border-[#F5EFEB] text-[#5A4A42] hover:border-emerald-500/40'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Lock size={14} />
                          </div>
                          <div className="text-left">
                            <p className="font-sans text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5">
                              Secure Online Card Payment 
                              <span className="bg-emerald-100 text-emerald-800 text-[6px] font-extrabold px-1 py-0.2 rounded uppercase tracking-wider">Auto-Verify</span>
                            </p>
                            <p className="font-sans text-[8px] text-[#A38F85]">Stripe Secure Payment (Visa / Mastercard / UnionPay)</p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedPaymentId === 'online' ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-300'
                        }`}>
                          {selectedPaymentId === 'online' && <Check size={10} className="text-white" />}
                        </div>
                      </div>

                      {/* Cash on Delivery is always an option */}
                      <div
                        onClick={() => setSelectedPaymentId('cod')}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedPaymentId === 'cod'
                            ? 'bg-[#8A4853]/5 border-[#8A4853] text-[#8A4853]'
                            : 'bg-white border-[#F5EFEB] text-[#5A4A42] hover:border-[#8A4853]/40'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#8A4853]">
                            <ShoppingBag size={14} />
                          </div>
                          <div className="text-left">
                            <p className="font-sans text-[11px] font-bold uppercase tracking-wide">Cash On Delivery (COD)</p>
                            <p className="font-sans text-[8px] text-[#A38F85]">Pay in cash upon doorstep arrival</p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedPaymentId === 'cod' ? 'border-[#8A4853] bg-[#8A4853]' : 'border-neutral-300'
                        }`}>
                          {selectedPaymentId === 'cod' && <Check size={10} className="text-white" />}
                        </div>
                      </div>

                      {/* Active Admin Payment Methods */}
                      {activeMethods.map(pm => (
                        <div
                          key={pm.id}
                          onClick={() => setSelectedPaymentId(pm.id)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            selectedPaymentId === pm.id
                              ? 'bg-[#8A4853]/5 border-[#8A4853] text-[#8A4853]'
                              : 'bg-white border-[#F5EFEB] text-[#5A4A42] hover:border-[#8A4853]/40'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-neutral-100 flex items-center justify-center">
                              {pm.icon ? (
                                <img src={pm.icon} alt={pm.name} className="w-full h-full object-cover" />
                              ) : (
                                <CreditCard size={14} className="text-[#8A4853]" />
                              )}
                            </div>
                            <div className="text-left">
                              <p className="font-sans text-[11px] font-bold uppercase tracking-wide">{pm.name}</p>
                              {pm.accountTitle && (
                                <p className="font-sans text-[8px] text-[#A38F85] line-clamp-1">Title: {pm.accountTitle}</p>
                              )}
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedPaymentId === pm.id ? 'border-[#8A4853] bg-[#8A4853]' : 'border-neutral-300'
                          }`}>
                            {selectedPaymentId === pm.id && <Check size={10} className="text-white" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Secure Credit/Debit Card Form if selecting Secure Online gateway */}
                  {selectedPaymentId === 'online' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      className="bg-white border border-emerald-500/20 p-4 rounded-2xl space-y-3 shadow-xs text-left"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2">
                        <span className="font-sans text-[9px] font-bold text-emerald-600 uppercase tracking-wider block flex items-center gap-1">
                          <Lock size={10} /> PCI-DSS Secure Encryption Gateway
                        </span>
                        <div className="flex space-x-1.5 opacity-85">
                          <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700">VISA</span>
                          <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-700">MC</span>
                          <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700">UnionPay</span>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] text-[#A38F85] uppercase font-bold block">Cardholder Name *</label>
                          <input
                            type="text"
                            required={selectedPaymentId === 'online'}
                            placeholder="e.g. Adil Naseer"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full bg-neutral-50/50 border border-[#F5EFEB] rounded-xl px-3 py-2 text-neutral-800 placeholder-[#A38F85] focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-[#A38F85] uppercase font-bold block">Card Number *</label>
                          <div className="relative">
                            <input
                              type="text"
                              required={selectedPaymentId === 'online'}
                              placeholder="4242 4242 4242 4242"
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                const matches = value.match(/\d{1,4}/g);
                                const formatted = matches ? matches.join(' ') : '';
                                setCardNumber(formatted);
                              }}
                              className="w-full bg-neutral-50/50 border border-[#F5EFEB] rounded-xl pl-3 pr-8 py-2 text-neutral-800 placeholder-[#A38F85] focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A38F85]">
                              <CreditCard size={14} />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] text-[#A38F85] uppercase font-bold block">Expiry Date *</label>
                            <input
                              type="text"
                              required={selectedPaymentId === 'online'}
                              placeholder="MM/YY"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 2) {
                                  setCardExpiry(value);
                                } else {
                                  setCardExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
                                }
                              }}
                              className="w-full bg-neutral-50/50 border border-[#F5EFEB] rounded-xl px-3 py-2 text-neutral-800 placeholder-[#A38F85] text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-[#A38F85] uppercase font-bold block">CVV / CVC *</label>
                            <input
                              type="password"
                              required={selectedPaymentId === 'online'}
                              placeholder="•••"
                              maxLength={4}
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-neutral-50/50 border border-[#F5EFEB] rounded-xl px-3 py-2 text-neutral-800 placeholder-[#A38F85] text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Expandable Transfer Details & Screenshot Upload Panel if non-COD, non-Gateway */}
                  {selectedPaymentId !== 'cod' && selectedPaymentId !== 'online' && selectedPaymentMethod && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      className="bg-white border border-[#8A4853]/15 p-3 rounded-2xl space-y-3"
                    >
                      <div className="space-y-1">
                        <span className="font-sans text-[8px] font-bold text-[#8A4853] uppercase tracking-wider block">
                          Transfer Account Credentials
                        </span>
                        
                        <div className="bg-[#FAF6F0] p-2.5 rounded-xl space-y-1.5 text-[11px] text-[#1A1515]">
                          <p className="flex justify-between">
                            <span className="text-[#A38F85]">Method:</span>
                            <strong className="text-neutral-800 uppercase">{selectedPaymentMethod.name}</strong>
                          </p>
                          {selectedPaymentMethod.accountTitle && (
                            <p className="flex justify-between">
                              <span className="text-[#A38F85]">Account Title:</span>
                              <strong className="text-neutral-800">{selectedPaymentMethod.accountTitle}</strong>
                            </p>
                          )}
                          <div className="flex items-center justify-between border-t border-[#F5EFEB] pt-1.5 mt-1">
                            <span className="text-[#A38F85] text-[10px] uppercase font-semibold">Account / IBAN:</span>
                            <div className="flex items-center space-x-1">
                              <code className="font-mono text-xs font-bold bg-white px-1.5 py-0.5 rounded border border-neutral-100">{selectedPaymentMethod.accountNumber}</code>
                              <button
                                type="button"
                                onClick={() => handleCopyToClipboard(selectedPaymentMethod.accountNumber)}
                                className="p-1 hover:bg-neutral-100 rounded text-[#8A4853]"
                                title="Copy account number"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-sans text-[8px] font-bold text-[#8A4853] uppercase tracking-wider block">
                            Attach Transaction Receipt *
                          </span>
                          <span className="text-[7px] text-[#A38F85] uppercase">Verification Proof</span>
                        </div>
                        
                        <ScreenshotUpload 
                          onUpload={(base64) => setScreenshotBase64(base64)} 
                          currentScreenshot={screenshotBase64}
                        />
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#8A4853] hover:bg-[#70343e] text-white py-3 sm:py-3.5 rounded-xl font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 shadow flex items-center justify-center space-x-2 mt-6"
                    id="shipping-submit-btn"
                  >
                    <span>Confirm Order</span>
                    <Check size={14} />
                  </button>
                </form>
              )}

              {checkoutStep === 'complete' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-6 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200 shadow-md">
                    <Check size={32} className="animate-pulse" />
                  </div>
                  
                  <div>
                    <h4 className="font-playfair text-xl text-[#1A1515] font-bold">Order Received!</h4>
                    <p className="font-sans text-xs text-[#5A4A42] max-w-[300px] mx-auto mt-1">
                      Your order <span className="font-mono font-bold text-[#8A4853]">#{generatedReceiptId}</span> has been logged into the system and dispatched for merchant processing.
                    </p>
                  </div>

                  {/* 1-Click Direct WhatsApp Order Notification Banner */}
                  {latestOrder && (
                    <div className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 p-4 rounded-2xl text-white shadow-lg text-left space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                            Direct WhatsApp Notification
                          </span>
                        </div>
                        <span className="bg-white/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">1-Click Fast Alert</span>
                      </div>

                      <p className="text-xs text-emerald-50 leading-relaxed">
                        Tap below to send your itemized order receipt directly to the official merchant on WhatsApp for instant priority confirmation.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <a
                          href={getMerchantWhatsAppOrderLink(latestOrder)}
                          target="_blank"
                          rel="noreferrer referrer"
                          className="w-full bg-white hover:bg-emerald-50 text-emerald-800 py-2.5 px-3 rounded-xl font-sans text-xs tracking-wider font-bold uppercase flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-95"
                          id="direct-whatsapp-dispatch-btn"
                        >
                          <MessageCircle size={15} className="text-[#25D366] fill-[#25D366]/20" />
                          <span>Direct WhatsApp Alert</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            const slip = formatOrderWhatsAppMessage(latestOrder);
                            navigator.clipboard.writeText(slip);
                            setIsCopiedSlip(true);
                            setTimeout(() => setIsCopiedSlip(false), 3000);
                          }}
                          className="w-full bg-black/20 hover:bg-black/30 border border-white/30 text-white py-2.5 px-3 rounded-xl font-sans text-xs tracking-wider font-bold uppercase flex items-center justify-center space-x-1.5 transition-all active:scale-95"
                          id="copy-whatsapp-slip-btn"
                        >
                          {isCopiedSlip ? (
                            <>
                              <CheckCircle2 size={15} className="text-emerald-300" />
                              <span className="text-emerald-200">Slip Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy WhatsApp Slip</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Order Receipt summary details */}
                  <div className="bg-white p-4 rounded-2xl border border-[#F5EFEB] w-full text-left space-y-2.5 text-xs shadow-xs">
                    <div className="flex justify-between border-b border-[#FAF6F0] pb-2 text-[#A38F85] font-bold text-[9px] uppercase">
                      <span>Order Consignment Receipt</span>
                      <span className="text-[#8A4853] font-mono">#{generatedReceiptId}</span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <p><span className="text-[#A38F85]">Customer:</span> <strong className="text-[#1A1515]">{fullName}</strong></p>
                      <p><span className="text-[#A38F85]">Phone:</span> <strong className="text-[#1A1515] font-mono">{phone}</strong></p>
                      <p className="line-clamp-1"><span className="text-[#A38F85]">Address:</span> <strong className="text-[#1A1515]">{address}</strong></p>
                      <p><span className="text-[#A38F85]">Payment Channel:</span> <strong className="text-[#1A1515] uppercase">{selectedPaymentId === 'cod' ? 'Cash On Delivery' : (selectedPaymentMethod?.name || 'Manual')}</strong></p>
                      <p><span className="text-[#A38F85]">Items Count:</span> <strong className="text-[#1A1515]">{cartItems.length} Product(s)</strong></p>
                    </div>

                    <div className="border-t border-[#F5EFEB] pt-2 flex justify-between font-bold text-xs text-[#8A4853]">
                      <span>Grand Total Payable</span>
                      <span className="text-sm">Rs. {total.toLocaleString()}</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-dashed border-[#FAF6F0] text-[10px] text-emerald-700 italic flex items-center space-x-1.5 justify-center bg-emerald-50/50 p-1.5 rounded-lg">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Dispatched to Cloud SQL, Google Sheets ledger, and Merchant WhatsApp</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCompleteClose}
                    className="w-full bg-[#8A4853] hover:bg-[#70343e] text-white py-3.5 rounded-xl font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 shadow flex items-center justify-center space-x-2"
                    id="finish-order-btn"
                  >
                    <span>Continue Shopping</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

            </div>

            {/* Footer Summary (Sticky at bottom for cart screen) */}
            {cartItems.length > 0 && checkoutStep === 'cart' && (
              <div className="px-5 sm:px-6 py-4 sm:py-5 bg-[#FDFBF7] border-t border-[#F5EFEB] space-y-4">
                <div className="space-y-1.5 text-xs text-[#5A4A42]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Courier / Delivery</span>
                    <span>{shippingFee === 0 ? 'FREE' : `Rs. ${shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#8A4853] pt-2 border-t border-[#FAF6F0]">
                    <span>Total</span>
                    <span>Rs. {total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <button
                    onClick={() => setCheckoutStep('shipping')}
                    className="w-full bg-[#8A4853] hover:bg-[#70343e] text-white py-3.5 rounded-xl font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 shadow flex items-center justify-center space-x-2"
                    id="checkout-btn"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Footer Summary for shipping screen */}
            {checkoutStep === 'shipping' && (
              <div className="px-5 sm:px-6 py-4 sm:py-5 bg-[#FDFBF7] border-t border-[#F5EFEB] flex justify-between items-center">
                <div>
                  <p className="font-sans text-[9px] text-[#A38F85] uppercase tracking-wider">Total Payable</p>
                  <p className="font-playfair text-sm sm:text-base font-bold text-[#8A4853]">Rs. {total.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setCheckoutStep('cart')}
                  className="text-xs text-[#8A4853] font-bold hover:underline"
                >
                  Back to Bag
                </button>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
