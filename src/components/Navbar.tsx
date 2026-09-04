import { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { BRAND_LOGO } from '../data';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onScrollToSection: (sectionId: string) => void;
  activeSection: string;
  onOpenUserPortal: () => void;
}

export default function Navbar({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onScrollToSection,
  activeSection,
  onOpenUserPortal
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Featured', id: 'featured' },
    { label: 'Shop', id: 'shop' },
    { label: 'Why Us', id: 'why-us' },
    { label: 'Reviews', id: 'reviews' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <>
      <nav
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#FAF6F0]/90 backdrop-blur-md shadow-sm py-3 border-b border-[#FAF6F0]/20'
            : 'bg-[#FAF6F0]/50 backdrop-blur-[2px] py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          
          {/* Logo */}
          <button
            onClick={() => onScrollToSection('home')}
            className="flex items-center space-x-2 text-left group focus:outline-none"
            id="logo-button"
            title="Women's Wardrobe"
          >
            <div className="w-10 h-10 rounded-full border border-[#8A4853]/20 overflow-hidden flex items-center justify-center bg-white shadow-sm group-hover:scale-105 transition-transform duration-300">
              <img
                src={BRAND_LOGO}
                alt="Women's Wardrobe Monogram"
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-playfair text-xl tracking-wider text-[#1A1515] font-semibold leading-tight group-hover:text-[#8A4853] transition-colors duration-300">
                WOMEN'S
              </span>
              <span className="font-sans text-[10px] tracking-[0.2em] text-[#8A4853] font-bold leading-none uppercase">
                WARDROBE
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onScrollToSection(item.id)}
                className={`font-sans text-xs tracking-widest uppercase font-medium transition-all duration-300 relative py-1 focus:outline-none ${
                  activeSection === item.id
                    ? 'text-[#8A4853] font-semibold'
                    : 'text-[#5A4A42] hover:text-[#8A4853]'
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8A4853] rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Icon Buttons */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            
            {/* Search Toggle */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-[#5A4A42] hover:text-[#8A4853] transition-colors duration-300 p-2 focus:outline-none rounded-full hover:bg-[#FAF6F0] relative"
                aria-label="Search products"
                id="search-btn"
              >
                <Search size={18} />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-xl rounded-xl p-3 border border-[#F5EFEB] animate-fade-in z-50">
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="Search bra collections, abayas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#FAF6F0] rounded-lg px-3 py-1.5 text-xs text-[#5A4A42] placeholder-[#A38F85] focus:outline-none focus:ring-1 focus:ring-[#8A4853]/40 border-none"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        if (searchQuery.trim()) {
                          onScrollToSection('shop');
                          // Simple mock filter broadcast can happen or just scroll
                          setSearchOpen(false);
                        }
                      }}
                      className="ml-2 bg-[#8A4853] hover:bg-[#A6606B] text-white p-1.5 rounded-lg transition-colors"
                    >
                      <Search size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="text-[#5A4A42] hover:text-[#8A4853] transition-colors duration-300 p-2 focus:outline-none rounded-full hover:bg-[#FAF6F0] relative"
              aria-label="Wishlist"
              id="wishlist-btn"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[#8A4853] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Bag */}
            <button
              onClick={onOpenCart}
              className="text-[#5A4A42] hover:text-[#8A4853] transition-colors duration-300 p-2 focus:outline-none rounded-full hover:bg-[#FAF6F0] relative"
              aria-label="Cart"
              id="cart-btn"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[#8A4853] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <button
              onClick={onOpenUserPortal}
              className="text-[#5A4A42] hover:text-[#8A4853] transition-colors duration-300 p-2 focus:outline-none rounded-full hover:bg-[#FAF6F0]"
              aria-label="Account"
              id="account-btn"
              title="My Account"
            >
              <User size={18} />
            </button>
{/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-[#5A4A42] hover:text-[#8A4853] transition-colors duration-300 p-2 focus:outline-none"
              aria-label="Toggle menu"
              id="mobile-menu-btn"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-[#FAF6F0] p-6 shadow-2xl flex flex-col justify-between border-l border-[#F5EFEB] animate-slide-in">
            <div className="pt-20">
              <div className="flex flex-col space-y-6">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onScrollToSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-left font-sans text-sm tracking-widest uppercase font-medium py-2 border-b border-[#F5EFEB] ${
                      activeSection === item.id
                        ? 'text-[#8A4853] font-semibold pl-2'
                        : 'text-[#5A4A42]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#F5EFEB] pt-6">
              {/* User Account Mobile Trigger */}
              <button
                onClick={() => {
                  onOpenUserPortal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 bg-[#8A4853]/10 border border-[#8A4853]/20 text-[#8A4853] py-2.5 rounded-xl font-sans text-[11px] tracking-wider font-bold uppercase transition-all duration-300 mb-2"
              >
                <User size={12} />
                <span>My Account</span>
              </button>
<div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-full border border-[#8A4853]/20 overflow-hidden bg-white flex items-center justify-center">
                  <img
                    src={BRAND_LOGO}
                    alt="Women's Wardrobe Logo"
                    className="w-8 h-8 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-playfair text-sm text-[#1A1515] font-semibold">Women's Wardrobe</h4>
                  <p className="font-sans text-[10px] tracking-wider text-[#8A4853] uppercase">Precious. Feminine. Forever.</p>
                </div>
              </div>
              <p className="text-xs text-[#A38F85] text-center">© 2026 Women's Wardrobe</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
