import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Mail, Phone, MapPin, Lock, Eye, EyeOff, 
  CheckCircle, AlertCircle, LogOut, Key, Shield, 
  ShoppingBag, Calendar, ChevronRight, Fingerprint, 
  FileText, Check, ShieldAlert
} from 'lucide-react';
import { UserProfile, AdminOrder, UserRole } from '../types';

interface UserPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  onRegister: (userData: {
    email: string;
    fullName: string;
    phone: string;
    address: string;
    passwordHash: string;
  }) => Promise<{ success: boolean; message: string }>;
  onUpdateProfile: (updated: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
  onChangePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  onLogout: () => void;
  orders: AdminOrder[];
}

export default function UserPortalModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onRegister,
  onUpdateProfile,
  onChangePassword,
  onLogout,
  orders
}: UserPortalModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'pendingInfo'>('login');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  
  // Profile Settings States
  const [profName, setProfName] = useState(currentUser?.fullName || '');
  const [profPhone, setProfPhone] = useState(currentUser?.phone || '');
  const [profAddress, setProfAddress] = useState(currentUser?.address || '');
  
  // Password Change States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassSection, setShowPassSection] = useState(false);
  
  // Feedback Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sanitization check simulated for input safety
  const sanitizeInput = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
      .trim();
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^(\+92|0|03)[0-9]{9,10}$/.test(phone.replace(/[\s-]/g, ''));
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!loginEmail || !loginPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (!validateEmail(loginEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const sanitizedEmail = sanitizeInput(loginEmail);
      const res = await onLogin(sanitizedEmail, loginPassword);
      if (res.success) {
        setSuccessMsg(res.message);
        // Clear forms
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('A system error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName || !regEmail || !regPhone || !regAddress || !regPassword || !regConfirmPassword) {
      setErrorMsg('All registration fields are required.');
      return;
    }

    if (!validateEmail(regEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!validatePhone(regPhone)) {
      setErrorMsg('Please enter a valid Pakistani phone number (e.g. 0342 2939080).');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const sanitizedName = sanitizeInput(regName);
      const sanitizedEmail = sanitizeInput(regEmail);
      const sanitizedPhone = sanitizeInput(regPhone);
      const sanitizedAddress = sanitizeInput(regAddress);

      const res = await onRegister({
        email: sanitizedEmail,
        fullName: sanitizedName,
        phone: sanitizedPhone,
        address: sanitizedAddress,
        passwordHash: regPassword // Will be simulated hashed inside the handler
      });

      if (res.success) {
        setAuthMode('pendingInfo');
        // Clear fields
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegAddress('');
        setRegPassword('');
        setRegConfirmPassword('');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('A system error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!profName || !profPhone || !profAddress) {
      setErrorMsg('Name, Phone, and Address are required.');
      return;
    }

    if (!validatePhone(profPhone)) {
      setErrorMsg('Please enter a valid Pakistani phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const sanitizedName = sanitizeInput(profName);
      const sanitizedPhone = sanitizeInput(profPhone);
      const sanitizedAddress = sanitizeInput(profAddress);

      const res = await onUpdateProfile({
        fullName: sanitizedName,
        phone: sanitizedPhone,
        address: sanitizedAddress
      });

      if (res.success) {
        setSuccessMsg('Profile information updated securely.');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Error updating profile information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setErrorMsg('All password fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    if (oldPassword === newPassword) {
      setErrorMsg('New password must be different from current password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await onChangePassword(oldPassword, newPassword);
      if (res.success) {
        setSuccessMsg('Your security password has been changed successfully.');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowPassSection(false);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Error performing secure password update.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync settings fields on user login
  React.useEffect(() => {
    if (currentUser) {
      setProfName(currentUser.fullName);
      setProfPhone(currentUser.phone);
      setProfAddress(currentUser.address);
    }
  }, [currentUser]);

  // Filter orders matching the logged-in customer's ID, email, phone, or name
  const myOrders = currentUser 
    ? orders.filter(o => 
        o.userId === currentUser.id ||
        (o.customerEmail && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
        o.phone.replace(/[\s-]/g, '') === currentUser.phone.replace(/[\s-]/g, '') ||
        o.customerName.toLowerCase() === currentUser.fullName.toLowerCase()
      )
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1A1515]/60 backdrop-blur-xs"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-white border border-[#F5EFEB] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden z-10"
            id="user-portal-modal"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#F5EFEB] flex justify-between items-center bg-[#FAF6F0] shrink-0">
              <div className="flex items-center space-x-2">
                <Fingerprint size={18} className="text-[#8A4853]" />
                <h3 className="font-playfair text-base sm:text-lg font-bold text-[#1A1515] tracking-tight">
                  {currentUser ? 'Luxury Member Profile' : 'Secure Authentication Portal'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-[#8A4853] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors focus:outline-none"
                id="close-user-modal-btn"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Messages Panel */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-800 text-xs font-sans">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span className="leading-tight">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-emerald-800 text-xs font-sans">
                  <CheckCircle size={14} className="shrink-0 mt-0.5" />
                  <span className="leading-tight">{successMsg}</span>
                </div>
              )}

              {!currentUser ? (
                <>
                  {/* AUTHENTICATION PORTAL (GUEST) */}
                  {authMode === 'login' && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div className="text-center max-w-md mx-auto mb-2">
                        <h4 className="font-sans text-xs font-bold text-[#8A4853] uppercase tracking-wider mb-1">Welcome Back</h4>
                        <p className="font-sans text-xs text-[#A38F85]">
                          Access your boutique shopping history, verify custom payments, and manage shipping addresses.
                        </p>
                      </div>

                      <div className="space-y-3 max-w-md mx-auto">
                        {/* Email Input */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Email Address</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                              <Mail size={13} />
                            </span>
                            <input
                              type="email"
                              required
                              placeholder="e.g. customercare@example.com"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 border border-[#F5EFEB] rounded-xl font-sans text-xs text-[#1A1515] bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8A4853] transition-all"
                            />
                          </div>
                        </div>

                        {/* Password Input */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Security Password</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                              <Lock size={13} />
                            </span>
                            <input
                              type={showLoginPassword ? "text" : "password"}
                              required
                              placeholder="••••••••"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              className="w-full pl-9 pr-9 py-2 border border-[#F5EFEB] rounded-xl font-sans text-xs text-[#1A1515] bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8A4853] transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-[#8A4853]"
                            >
                              {showLoginPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-[#8A4853] hover:bg-[#723a44] text-white py-2.5 rounded-xl font-sans text-[11px] tracking-wider font-bold uppercase transition-all duration-300 shadow-sm flex items-center justify-center space-x-2"
                        >
                          {isLoading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Shield size={12} />
                              <span>Authorize Secure Login</span>
                            </>
                          )}
                        </button>

                        <div className="text-center pt-2">
                          <p className="font-sans text-xs text-[#A38F85]">
                            Don't have an account?{' '}
                            <button
                              type="button"
                              onClick={() => { setAuthMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                              className="text-[#8A4853] font-bold hover:underline"
                            >
                              Create a Secure Profile
                            </button>
                          </p>
                        </div>
                      </div>
                    </form>
                  )}

                  {authMode === 'register' && (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div className="text-center max-w-md mx-auto mb-1">
                        <h4 className="font-sans text-xs font-bold text-[#8A4853] uppercase tracking-wider mb-0.5">Secure Registration</h4>
                        <p className="font-sans text-[11px] text-[#A38F85]">
                          To protect client privacy, all newly registered accounts undergo Super Administrator audit and must be approved before granting access.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                        {/* Full Name */}
                        <div>
                          <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Full Name</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                              <User size={12} />
                            </span>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Ayesha Ahmed"
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              className="w-full pl-9 pr-3 py-1.5 border border-[#F5EFEB] rounded-xl font-sans text-xs text-[#1A1515] bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8A4853] transition-all"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Email Address</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                              <Mail size={12} />
                            </span>
                            <input
                              type="email"
                              required
                              placeholder="e.g. ayesha@example.com"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              className="w-full pl-9 pr-3 py-1.5 border border-[#F5EFEB] rounded-xl font-sans text-xs text-[#1A1515] bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8A4853] transition-all"
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Phone Number (Pakistan)</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                              <Phone size={12} />
                            </span>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 0342 2939080"
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              className="w-full pl-9 pr-3 py-1.5 border border-[#F5EFEB] rounded-xl font-sans text-xs text-[#1A1515] bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8A4853] transition-all"
                            />
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Shipping Address</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                              <MapPin size={12} />
                            </span>
                            <input
                              type="text"
                              required
                              placeholder="e.g. House 45-B, DHA Phase 5, Lahore"
                              value={regAddress}
                              onChange={(e) => setRegAddress(e.target.value)}
                              className="w-full pl-9 pr-3 py-1.5 border border-[#F5EFEB] rounded-xl font-sans text-xs text-[#1A1515] bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8A4853] transition-all"
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Create Password</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                              <Lock size={12} />
                            </span>
                            <input
                              type={showRegPassword ? "text" : "password"}
                              required
                              placeholder="Min 6 characters"
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              className="w-full pl-9 pr-9 py-1.5 border border-[#F5EFEB] rounded-xl font-sans text-xs text-[#1A1515] bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8A4853] transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-[#8A4853]"
                            >
                              {showRegPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Confirm Password</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                              <Lock size={12} />
                            </span>
                            <input
                              type={showRegPassword ? "text" : "password"}
                              required
                              placeholder="Match password"
                              value={regConfirmPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)} // Map safely
                              className="w-full pl-9 pr-3 py-1.5 border border-[#F5EFEB] rounded-xl font-sans text-xs text-[#1A1515] bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8A4853] transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="max-w-lg mx-auto pt-2">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-[#8A4853] hover:bg-[#723a44] text-white py-2 rounded-xl font-sans text-[11px] tracking-wider font-bold uppercase transition-all duration-300 shadow-sm flex items-center justify-center space-x-2"
                        >
                          {isLoading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <User size={12} />
                              <span>Submit Registration Request</span>
                            </>
                          )}
                        </button>

                        <div className="text-center pt-3">
                          <p className="font-sans text-xs text-[#A38F85]">
                            Already registered?{' '}
                            <button
                              type="button"
                              onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                              className="text-[#8A4853] font-bold hover:underline"
                            >
                              Secure Sign In
                            </button>
                          </p>
                        </div>
                      </div>
                    </form>
                  )}

                  {authMode === 'pendingInfo' && (
                    <div className="text-center py-6 max-w-md mx-auto space-y-4">
                      <div className="w-12 h-12 bg-[#8A4853]/10 text-[#8A4853] rounded-full flex items-center justify-center mx-auto">
                        <ShieldAlert size={24} />
                      </div>
                      <h4 className="font-playfair text-lg font-bold text-[#1A1515]">Registration Submitted Successfully</h4>
                      <p className="font-sans text-xs text-[#A38F85] leading-relaxed">
                        In accordance with our strict security compliance protocol, your user account is currently in a <span className="font-bold text-[#8A4853]">Pending Approval</span> status. 
                        To protect system integrity, a Super Administrator must audit and manually authorize your account before you can log in.
                      </p>
                      <div className="p-3 bg-neutral-50 border border-[#F5EFEB] rounded-xl text-left text-[11px] font-sans text-[#5A4A42]">
                        <p className="font-bold uppercase tracking-wider text-[9px] mb-1 text-[#8A4853]">What's Next?</p>
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>Super Admin receives an administrative audit alert.</li>
                          <li>Administrative verification of credentials and phone layout.</li>
                          <li>Upon approval, your login is unlocked instantly!</li>
                        </ol>
                      </div>
                      <button
                        onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                        className="border border-[#8A4853] text-[#8A4853] hover:bg-[#8A4853]/5 px-5 py-2 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* AUTHENTICATED USER CENTER */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left: User Details Panel */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#F5EFEB] space-y-3.5">
                        <div className="flex items-center space-x-3 pb-3 border-b border-[#F5EFEB]">
                          <div className="w-10 h-10 bg-[#8A4853] rounded-full text-white flex items-center justify-center font-bold text-sm">
                            {currentUser.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-sans text-xs font-bold text-[#1A1515]">{currentUser.fullName}</h4>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="bg-[#8A4853]/10 text-[#8A4853] px-1.5 py-0.5 rounded-md text-[8px] uppercase tracking-wider font-bold">
                                {currentUser.role === 'SuperAdmin' ? 'Super Administrator' : currentUser.role === 'StoreManager' ? 'Store Manager' : 'Customer'}
                              </span>
                              <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md text-[8px] uppercase tracking-wider font-bold">
                                {currentUser.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Account Data Display (Securely omitting password hashes completely) */}
                        <div className="space-y-2.5 text-xs font-sans text-[#5A4A42]">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#A38F85] block">Email Identifier</span>
                            <span className="font-medium text-[#1A1515]">{currentUser.email}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#A38F85] block">Phone Contact</span>
                            <span className="font-medium text-[#1A1515]">{currentUser.phone}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#A38F85] block">Default Shipping</span>
                            <span className="font-medium text-[#1A1515] leading-snug block">{currentUser.address}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#A38F85] block">Compliance Status</span>
                            <span className="font-mono text-[10px] text-emerald-600 block flex items-center gap-1">
                              <CheckCircle size={10} /> Fully verified &amp; authorized
                            </span>
                          </div>
                        </div>

                        {/* Logout Trigger */}
                        <button
                          onClick={onLogout}
                          className="w-full bg-white hover:bg-rose-50 border border-rose-100 text-rose-700 py-2 rounded-xl font-sans text-[10px] tracking-wider font-bold uppercase transition-all flex items-center justify-center space-x-1.5"
                        >
                          <LogOut size={12} />
                          <span>Close Active Session</span>
                        </button>
                      </div>

                      {/* Security Compliance Notice */}
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1.5 text-[10px] font-sans text-neutral-500">
                        <p className="font-bold text-[#8A4853] uppercase tracking-wider text-[8px] flex items-center gap-1">
                          <Shield size={10} /> Data Encryption Standard
                        </p>
                        <p className="leading-relaxed">
                          Your profile details are bound to Role-Based Access Controls (RBAC). Passwords undergo standard local cryptographic hashing simulation, preventing any raw state lookup or retrieval.
                        </p>
                      </div>
                    </div>

                    {/* Right: Interactive Tabs (Profile Edit / Password Change & Purchase History) */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Sub tab selectors */}
                      <div className="flex border-b border-[#F5EFEB]">
                        <button
                          onClick={() => setShowPassSection(false)}
                          className={`pb-2 px-3 font-sans text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                            !showPassSection
                              ? 'border-[#8A4853] text-[#8A4853]'
                              : 'border-transparent text-[#A38F85] hover:text-[#5A4A42]'
                          }`}
                        >
                          Profile details
                        </button>
                        <button
                          onClick={() => setShowPassSection(true)}
                          className={`pb-2 px-3 font-sans text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                            showPassSection
                              ? 'border-[#8A4853] text-[#8A4853]'
                              : 'border-transparent text-[#A38F85] hover:text-[#5A4A42]'
                          }`}
                        >
                          Security credentials
                        </button>
                      </div>

                      {!showPassSection ? (
                        <div className="space-y-4">
                          {/* Profile Details Edit Form */}
                          <form onSubmit={handleProfileUpdateSubmit} className="space-y-3 bg-white p-3.5 border border-[#F5EFEB] rounded-2xl">
                            <h5 className="font-sans text-xs font-bold text-[#1A1515] uppercase tracking-wider mb-1">Update Member Profile</h5>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Full Name</label>
                                <input
                                  type="text"
                                  required
                                  value={profName}
                                  onChange={(e) => setProfName(e.target.value)}
                                  className="w-full px-3 py-1.5 border border-[#F5EFEB] rounded-lg font-sans text-xs text-[#1A1515] focus:outline-none focus:ring-1 focus:ring-[#8A4853]"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Phone Number</label>
                                  <input
                                    type="text"
                                    required
                                    value={profPhone}
                                    onChange={(e) => setProfPhone(e.target.value)}
                                    className="w-full px-3 py-1.5 border border-[#F5EFEB] rounded-lg font-sans text-xs text-[#1A1515] focus:outline-none focus:ring-1 focus:ring-[#8A4853]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Email (Immutable)</label>
                                  <input
                                    type="email"
                                    disabled
                                    value={currentUser.email}
                                    className="w-full px-3 py-1.5 border border-[#F5EFEB] rounded-lg font-sans text-xs text-neutral-400 bg-neutral-50 cursor-not-allowed"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Shipping Address</label>
                                <input
                                  type="text"
                                  required
                                  value={profAddress}
                                  onChange={(e) => setProfAddress(e.target.value)}
                                  className="w-full px-3 py-1.5 border border-[#F5EFEB] rounded-lg font-sans text-xs text-[#1A1515] focus:outline-none focus:ring-1 focus:ring-[#8A4853]"
                                />
                              </div>
                            </div>
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="mt-2 w-full bg-[#8A4853]/10 hover:bg-[#8A4853]/20 text-[#8A4853] py-2 rounded-xl font-sans text-[10px] tracking-wider font-bold uppercase transition-all"
                            >
                              Save profile changes
                            </button>
                          </form>

                          {/* Purchase Orders Track list */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                              <h5 className="font-sans text-xs font-bold text-[#1A1515] uppercase tracking-wider">My Boutique Orders</h5>
                              <span className="font-sans text-[10px] text-[#A38F85]">{myOrders.length} records found</span>
                            </div>

                            {myOrders.length === 0 ? (
                              <div className="p-6 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200 text-center text-xs font-sans text-[#A38F85]">
                                <ShoppingBag size={18} className="mx-auto text-neutral-300 mb-2" />
                                <p>No orders registered under this profile phone layout or name yet.</p>
                                <p className="text-[10px] text-neutral-400 mt-1">Place an order and input your phone ({currentUser.phone}) to track it here!</p>
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {myOrders.map(order => (
                                  <div key={order.id} className="p-3 bg-white border border-[#F5EFEB] rounded-xl flex justify-between items-center text-xs">
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-mono font-bold text-[#1A1515]">{order.id}</span>
                                        <span className="text-[10px] text-[#A38F85]">{order.date.split('T')[0]}</span>
                                      </div>
                                      <p className="font-sans text-[10px] text-[#5A4A42]">
                                        {order.items.map(i => `${i.productName} (${i.size})`).join(', ')}
                                      </p>
                                    </div>
                                    <div className="text-right space-y-1">
                                      <span className="font-mono font-bold text-[#8A4853] block">Rs. {order.total.toLocaleString()}</span>
                                      <span className={`inline-block text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                                        order.status === 'Cancelled' ? 'bg-rose-50 text-rose-700' :
                                        order.status === 'Shipped' ? 'bg-sky-50 text-sky-700' :
                                        'bg-amber-50 text-amber-700'
                                      }`}>
                                        {order.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Password Management Form */
                        <form onSubmit={handlePasswordChangeSubmit} className="space-y-3 bg-white p-3.5 border border-[#F5EFEB] rounded-2xl">
                          <h5 className="font-sans text-xs font-bold text-[#1A1515] uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Key size={12} className="text-[#8A4853]" /> Secure Credentials Reset
                          </h5>
                          <p className="font-sans text-[10px] text-[#A38F85] leading-relaxed mb-1">
                            To modify your login key credentials, authorize with your current password. Password changes trigger compliance logs.
                          </p>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Current Password</label>
                              <input
                                type="password"
                                required
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-3 py-1.5 border border-[#F5EFEB] rounded-lg font-sans text-xs text-[#1A1515] focus:outline-none focus:ring-1 focus:ring-[#8A4853]"
                                placeholder="Enter current security password"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">New Secure Password</label>
                              <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-1.5 border border-[#F5EFEB] rounded-lg font-sans text-xs text-[#1A1515] focus:outline-none focus:ring-1 focus:ring-[#8A4853]"
                                placeholder="Min 6 characters"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-[#5A4A42] uppercase tracking-wider mb-1">Confirm New Password</label>
                              <input
                                type="password"
                                required
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="w-full px-3 py-1.5 border border-[#F5EFEB] rounded-lg font-sans text-xs text-[#1A1515] focus:outline-none focus:ring-1 focus:ring-[#8A4853]"
                                placeholder="Match new password"
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-2 w-full bg-[#8A4853] hover:bg-[#723a44] text-white py-2 rounded-xl font-sans text-[10px] tracking-wider font-bold uppercase transition-all shadow-xs"
                          >
                            Update security key
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
