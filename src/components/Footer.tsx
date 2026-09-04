import { BRAND_LOGO } from '../data';
import { Mail, Phone, MapPin, Sparkles, Heart, Instagram, Facebook } from 'lucide-react';

interface FooterProps {
  onScrollToSection: (sectionId: string) => void;
  onSelectCategory: (category: string) => void;
}

export default function Footer({ onScrollToSection, onSelectCategory }: FooterProps) {
  return (
    <footer className="bg-[#FAF6F0] pt-24 pb-12 border-t border-[#F5EFEB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Presentation Column */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full border border-[#8A4853]/20 overflow-hidden flex items-center justify-center bg-white shadow-sm">
                <img
                  src={BRAND_LOGO}
                  alt="Women's Wardrobe Logo"
                  className="w-8 h-8 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-playfair text-lg text-[#1A1515] font-semibold leading-tight">
                  Women's Wardrobe
                </span>
                <span className="font-sans text-[9px] tracking-widest text-[#8A4853] font-bold leading-none uppercase">
                  Precious • Feminine • Forever
                </span>
              </div>
            </div>

            <p className="font-sans text-xs text-[#5A4A42] leading-relaxed">
              Crafting premium luxury intimate wear and artisanal Kaftan Abayas for the contemporary woman. Our designs prioritize comfort and grace to make you feel beautiful inside and out.
            </p>

            {/* Social media connections */}
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-[#F5EFEB] text-[#8A4853] flex items-center justify-center hover:scale-105 hover:bg-[#8A4853] hover:text-white hover:border-[#8A4853] transition-all duration-300 shadow-sm"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-[#F5EFEB] text-[#8A4853] flex items-center justify-center hover:scale-105 hover:bg-[#8A4853] hover:text-white hover:border-[#8A4853] transition-all duration-300 shadow-sm"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-6">
            <h4 className="font-playfair text-sm text-[#1A1515] font-bold tracking-wider uppercase border-b border-[#FAF6F0] pb-2">
              Boutique Sections
            </h4>
            <ul className="space-y-3 font-sans text-xs text-[#5A4A42]">
              <li>
                <button onClick={() => onScrollToSection('home')} className="hover:text-[#8A4853] transition-colors focus:outline-none">
                  Home / Welcome
                </button>
              </li>
              <li>
                <button onClick={() => onScrollToSection('featured')} className="hover:text-[#8A4853] transition-colors focus:outline-none">
                  Seasonal Collections
                </button>
              </li>
              <li>
                <button onClick={() => onScrollToSection('shop')} className="hover:text-[#8A4853] transition-colors focus:outline-none">
                  Store / Lookbook
                </button>
              </li>
              <li>
                <button onClick={() => onScrollToSection('why-us')} className="hover:text-[#8A4853] transition-colors focus:outline-none">
                  Our Distinction
                </button>
              </li>
              <li>
                <button onClick={() => onScrollToSection('reviews')} className="hover:text-[#8A4853] transition-colors focus:outline-none">
                  Customer Reviews
                </button>
              </li>
              <li>
                <button onClick={() => onScrollToSection('contact')} className="hover:text-[#8A4853] transition-colors focus:outline-none">
                  Connect With Us
                </button>
              </li>
            </ul>
          </div>

          {/* Shop Categories Column */}
          <div className="space-y-6">
            <h4 className="font-playfair text-sm text-[#1A1515] font-bold tracking-wider uppercase border-b border-[#FAF6F0] pb-2">
              Our Specialties
            </h4>
            <ul className="space-y-3 font-sans text-xs text-[#5A4A42]">
              <li>
                <button onClick={() => onSelectCategory('Premium Bras')} className="hover:text-[#8A4853] transition-colors focus:outline-none text-left">
                  Premium Net Bras
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Cotton Bras')} className="hover:text-[#8A4853] transition-colors focus:outline-none text-left">
                  Organic Cotton Bras
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Malai Cotton Bras')} className="hover:text-[#8A4853] transition-colors focus:outline-none text-left">
                  Modal Silk Malai Bras
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Kaftan Abayas')} className="hover:text-[#8A4853] transition-colors focus:outline-none text-left">
                  Luxury Kaftan Abayas
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('new')} className="hover:text-[#8A4853] transition-colors focus:outline-none text-left">
                  New Arrival Drops
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('best')} className="hover:text-[#8A4853] transition-colors focus:outline-none text-left">
                  Signature Best Sellers
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="space-y-6">
            <h4 className="font-playfair text-sm text-[#1A1515] font-bold tracking-wider uppercase border-b border-[#FAF6F0] pb-2">
              Our Showroom
            </h4>
            <ul className="space-y-4 font-sans text-xs text-[#5A4A42]">
              <li className="flex items-start space-x-3">
                <MapPin size={16} className="text-[#8A4853] shrink-0 mt-0.5" />
                <span>Premium Plaza, Gulberg Road, Lahore, PK</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-[#8A4853] shrink-0" />
                <span className="font-mono">+92 342 2939080</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-[#8A4853] shrink-0" />
                <span>womenwordrobe873@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright/legal links */}
        <div className="border-t border-[#FAF6F0] pt-8 flex flex-col sm:flex-row justify-between items-center text-center gap-4">
          <p className="font-sans text-xs text-[#A38F85] flex items-center justify-center gap-1">
            <span>© 2026 Women's Wardrobe. All Rights Reserved. Crafted with love &amp; premium precision.</span>
          </p>
          <div className="flex space-x-6 text-xs text-[#A38F85] font-medium">
            <button className="hover:text-[#8A4853] transition-colors focus:outline-none">Privacy Policy</button>
            <button className="hover:text-[#8A4853] transition-colors focus:outline-none">Terms of Service</button>
            <button className="hover:text-[#8A4853] transition-colors focus:outline-none">Size Guide</button>
          </div>
        </div>

      </div>
    </footer>
  );
}
