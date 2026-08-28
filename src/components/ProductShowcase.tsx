import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Eye, ShoppingCart, Heart, Flame, Sparkles } from 'lucide-react';
import { Product, Color } from '../types';
import { PRODUCTS } from '../data';

interface ProductShowcaseProps {
  products: Product[];
  onAddToCart: (product: Product, size: string, color: Color) => void;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  selectedCategoryFromBento: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop";

export default function ProductShowcase({
  products,
  onAddToCart,
  onQuickView,
  onToggleWishlist,
  wishlistIds,
  selectedCategoryFromBento
}: ProductShowcaseProps) {
  const tabs = [
    { label: 'All Collection', value: 'all' },
    { label: 'Premium Bras', value: 'Premium Bras' },
    { label: 'Cotton Bras', value: 'Cotton Bras' },
    { label: 'Malai Cotton Bras', value: 'Malai Cotton Bras' },
    { label: 'Kaftan Abayas', value: 'Kaftan Abayas' },
    { label: 'Other Accessories', value: 'Other Accessories' },
    { label: 'New Arrivals', value: 'new' },
    { label: 'Best Sellers', value: 'best' }
  ];

  const [activeTab, setActiveTab] = useState('all');

  // Sync state if category clicked from Bento category grids
  useEffect(() => {
    if (selectedCategoryFromBento) {
      const match = tabs.find(t => t.value === selectedCategoryFromBento);
      if (match) {
        setActiveTab(match.value);
      }
    }
  }, [selectedCategoryFromBento]);

  // Filter products based on active tab
  const filteredProducts = products.filter((product) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'new') return product.isNewArrival;
    if (activeTab === 'best') return product.isBestSeller;
    return product.category === activeTab;
  });

  return (
    <section id="shop" className="py-24 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-sans text-[10px] tracking-[0.3em] font-bold text-[#8A4853] uppercase mb-3">
            Pure Indulgence
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl text-[#1A1515] font-semibold tracking-tight">
            Our Premium <span className="font-playfair italic text-[#8A4853]">Lookbook</span>
          </h2>
          <div className="h-0.5 w-16 bg-[#8A4853]/20 mx-auto mt-4" />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-16 max-w-5xl mx-auto border-b border-[#FAF6F0] pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2.5 rounded-full font-sans text-xs tracking-wider uppercase transition-all duration-300 ${
                activeTab === tab.value
                  ? 'bg-[#8A4853] text-white font-bold shadow-md shadow-[#8A4853]/10'
                  : 'text-[#5A4A42] hover:text-[#8A4853] hover:bg-white bg-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlistIds.includes(product.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}

interface ProductCardProps {
  key?: string;
  product: Product;
  onAddToCart: (product: Product, size: string, color: Color) => void;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

/* Sub-component: Product Card with fully functional local state (color/size selector) */
function ProductCard({
  product,
  onAddToCart,
  onQuickView,
  onToggleWishlist,
  isWishlisted
}: ProductCardProps) {
  const defaultColor = (product.colors && product.colors.length > 0) ? product.colors[0] : { name: 'Rosewood', hex: '#8A4853' };
  const defaultSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'Standard';
  const [selectedColor, setSelectedColor] = useState<Color>(defaultColor);
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-3xl p-4 shadow-sm border border-[#FAF6F0] flex flex-col justify-between group hover:shadow-xl transition-all duration-300 relative"
    >
      
      {/* Product Image and badges */}
      <div className="relative aspect-[3/4] bg-[#FAF6F0] rounded-2xl overflow-hidden mb-5">
        
        {/* Absolute Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.isNewArrival && (
            <span className="bg-[#FAF6F0]/90 backdrop-blur-md border border-[#8A4853]/10 text-[#8A4853] font-sans text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles size={8} />
              New
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-[#8A4853] text-white font-sans text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Flame size={8} />
              Hot
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => onToggleWishlist(product)}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 shadow-sm ${
            isWishlisted
              ? 'bg-[#8A4853] border-[#8A4853] text-white'
              : 'bg-white/80 backdrop-blur-md border-[#F5EFEB] text-[#5A4A42] hover:text-[#8A4853] hover:bg-white'
          }`}
          aria-label="Add to Wishlist"
          id={`wishlist-${product.id}`}
        >
          <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
        </button>

        {/* Product main photo */}
        <img
          src={product.image || FALLBACK_IMAGE}
          alt={product.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Quick View Hover overlay buttons */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => onQuickView(product)}
            className="w-11 h-11 bg-white/90 hover:bg-white text-[#8A4853] rounded-full flex items-center justify-center shadow-lg transition-all transform scale-90 group-hover:scale-100 duration-300"
            title="Quick View"
            id={`quickview-${product.id}`}
          >
            <Eye size={18} />
          </button>
        </div>

      </div>

      {/* Info & Details */}
      <div className="flex-grow flex flex-col justify-between space-y-3">
        
        <div>
          {/* Category & Ratings */}
          <div className="flex items-center justify-between text-[#A38F85] text-[10px] font-bold uppercase tracking-wider">
            <span>{product.category}</span>
            <div className="flex items-center text-[#D4A373]">
              <Star size={10} className="fill-current mr-0.5" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-playfair text-base text-[#1A1515] font-semibold mt-1 group-hover:text-[#8A4853] transition-colors duration-300 line-clamp-1">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline space-x-2 mt-1.5">
            <span className="font-playfair text-lg text-[#8A4853] font-bold">
              Rs. {product.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Interactive Color selector */}
        <div>
          <span className="text-[10px] text-[#A38F85] font-semibold uppercase tracking-wider block mb-1">
            Colors: <span className="text-[#5A4A42] font-bold">{selectedColor.name}</span>
          </span>
          <div className="flex space-x-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c)}
                className={`w-5 h-5 rounded-full border relative transition-all duration-300 ${
                  selectedColor.name === c.name
                    ? 'border-[#8A4853] scale-110 ring-2 ring-[#8A4853]/10'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
                id={`color-${product.id}-${c.name.replace(/\s+/g, '-').toLowerCase()}`}
              />
            ))}
          </div>
        </div>

        {/* Interactive Size selector */}
        <div>
          <span className="text-[10px] text-[#A38F85] font-semibold uppercase tracking-wider block mb-1">
            Select Size: <span className="text-[#5A4A42] font-bold">{selectedSize}</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`text-[9px] font-sans font-bold px-2.5 py-1 rounded-md border transition-all duration-200 ${
                  selectedSize === s
                    ? 'bg-[#8A4853] border-[#8A4853] text-white'
                    : 'border-[#F5EFEB] text-[#5A4A42] bg-white hover:border-[#8A4853] hover:text-[#8A4853]'
                }`}
                id={`size-${product.id}-${s.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Add To Cart CTA */}
        <button
          onClick={() => onAddToCart(product, selectedSize, selectedColor)}
          className="w-full bg-[#8A4853] hover:bg-[#70343e] text-white py-3 rounded-xl font-sans text-[10px] tracking-widest font-bold uppercase transition-all duration-300 shadow-sm flex items-center justify-center space-x-2 mt-4"
          id={`add-to-cart-${product.id}`}
        >
          <ShoppingCart size={12} />
          <span>Add to Bag</span>
        </button>

      </div>

    </motion.div>
  );
}
