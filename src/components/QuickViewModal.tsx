import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, ShoppingCart, Check, Heart, ShieldCheck, RefreshCw } from 'lucide-react';
import { Product, Color } from '../types';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: Color, quantity: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop";

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted
}: QuickViewModalProps) {
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  // Set default selected color and size when product changes
  useEffect(() => {
    if (product) {
      setSelectedColor((product.colors && product.colors.length > 0) ? product.colors[0] : { name: 'Rosewood', hex: '#8A4853' });
      setSelectedSize((product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'Standard');
      setQuantity(1);
      setAddedMessage(false);
    }
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (selectedColor && selectedSize) {
      onAddToCart(product, selectedSize, selectedColor, quantity);
      setAddedMessage(true);
      setTimeout(() => {
        setAddedMessage(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        {/* Dark elegant backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Panel container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-[#FAF6F0] rounded-[30px] shadow-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white border border-[#F5EFEB] text-[#5A4A42] hover:text-[#8A4853] flex items-center justify-center transition-colors shadow-sm z-20"
            aria-label="Close modal"
            id="close-quickview-modal"
          >
            <X size={18} />
          </button>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8">
            
            {/* Left Column: Image with glass glow */}
            <div className="md:col-span-5 relative aspect-[3/4] bg-white rounded-2xl overflow-hidden shadow-sm border border-[#FAF6F0]">
              <img
                src={product.image || FALLBACK_IMAGE}
                alt={product.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] text-[#8A4853] font-bold tracking-widest uppercase border border-white">
                {product.category}
              </div>
            </div>

            {/* Right Column: Detailed Boutique Info */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                
                {/* Title and Ratings */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-[#D4A373]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={`${
                          i < Math.floor(product.rating)
                            ? 'fill-current text-[#D4A373]'
                            : 'text-[#FAF6F0]'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-[#5A4A42] font-semibold ml-2">
                      {product.rating} ({product.reviewsCount} reviews)
                    </span>
                  </div>
                  
                  <h2 className="font-playfair text-2xl sm:text-3xl text-[#1A1515] font-semibold leading-tight">
                    {product.name}
                  </h2>
                </div>

                {/* Price Display */}
                <div className="text-2xl font-playfair font-bold text-[#8A4853] border-b border-[#FAF6F0] pb-3">
                  Rs. {product.price.toLocaleString()}
                </div>

                {/* Description */}
                <p className="font-sans text-xs text-[#5A4A42] leading-relaxed">
                  {product.description}
                </p>

                {/* Features List */}
                <div className="space-y-2">
                  <span className="font-sans text-[10px] tracking-wider text-[#A38F85] font-bold uppercase">
                    Premium Features:
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-xs text-[#5A4A42]">
                        <Check size={12} className="text-[#8A4853] mr-2 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Selection controls */}
              <div className="space-y-4 pt-4 border-t border-[#FAF6F0]">
                
                {/* Color Selector */}
                {selectedColor && (
                  <div className="space-y-1.5">
                    <span className="font-sans text-[10px] tracking-wider text-[#A38F85] font-bold uppercase">
                      Selected Color: <span className="text-[#5A4A42]">{selectedColor.name}</span>
                    </span>
                    <div className="flex space-x-3">
                      {product.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color)}
                          className={`w-7 h-7 rounded-full border-2 relative transition-all duration-300 ${
                            selectedColor.name === color.name
                              ? 'border-[#8A4853] scale-110 ring-4 ring-[#8A4853]/15'
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-[10px] tracking-wider text-[#A38F85] font-bold uppercase">
                      Select Size: <span className="text-[#5A4A42]">{selectedSize}</span>
                    </span>
                    <button className="text-[10px] text-[#8A4853] font-bold uppercase hover:underline">
                      Size Chart
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`text-xs font-sans font-bold px-4 py-2 rounded-xl border transition-all duration-300 ${
                          selectedSize === size
                            ? 'bg-[#8A4853] border-[#8A4853] text-white shadow'
                            : 'border-[#F5EFEB] text-[#5A4A42] bg-white hover:border-[#8A4853] hover:text-[#8A4853]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stepper Quantity & Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  
                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between border border-[#F5EFEB] rounded-xl bg-white px-3 py-2 w-full sm:w-32">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-[#5A4A42] hover:text-[#8A4853] p-1 text-sm font-bold focus:outline-none"
                    >
                      -
                    </button>
                    <span className="font-sans text-xs font-bold text-[#1A1515]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-[#5A4A42] hover:text-[#8A4853] p-1 text-sm font-bold focus:outline-none"
                    >
                      +
                    </button>
                  </div>

                  {/* Add To Cart CTA Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addedMessage}
                    className="flex-1 bg-[#8A4853] hover:bg-[#70343e] disabled:bg-emerald-600 text-white py-3.5 rounded-xl font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 shadow flex items-center justify-center space-x-2"
                  >
                    {addedMessage ? (
                      <>
                        <Check size={14} className="animate-bounce" />
                        <span>Added To Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={14} />
                        <span>Add To Bag</span>
                      </>
                    )}
                  </button>

                  {/* Add to Wishlist Toggle */}
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                      isWishlisted
                        ? 'bg-[#FAF6F0] border-[#8A4853] text-[#8A4853]'
                        : 'border-[#F5EFEB] text-[#5A4A42] hover:text-[#8A4853] bg-white'
                    }`}
                    title="Add to wishlist"
                  >
                    <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
                  </button>

                </div>

              </div>

              {/* Care Guidelines */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#FAF6F0] text-[10px] text-[#A38F85]">
                <div className="flex items-center space-x-2">
                  <ShieldCheck size={16} className="text-[#8A4853]/60" />
                  <span>Safe & Secure checkout</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RefreshCw size={14} className="text-[#8A4853]/60" />
                  <span>14 Days hassle-free exchange</span>
                </div>
              </div>

            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
