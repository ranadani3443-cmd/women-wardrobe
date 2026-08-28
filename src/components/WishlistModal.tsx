import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop";

export default function WishlistModal({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveFromWishlist,
  onQuickView
}: WishlistModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal panel container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-[#FAF6F0] rounded-[28px] p-6 sm:p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto z-10 shadow-2xl border border-white/20"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white border border-[#F5EFEB] text-[#5A4A42] hover:text-[#8A4853] flex items-center justify-center shadow-sm"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Title */}
          <div className="flex items-center space-x-2.5 mb-6">
            <Heart size={20} className="text-[#8A4853] fill-current" />
            <h3 className="font-playfair text-xl text-[#1A1515] font-semibold">Your Wishlist</h3>
          </div>

          {/* Wishlist list */}
          {wishlistItems.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-white border border-[#F5EFEB] flex items-center justify-center text-[#A38F85] mx-auto">
                <Heart size={22} className="stroke-[1.5]" />
              </div>
              <p className="font-playfair text-sm text-[#1A1515] font-semibold">Your wishlist is empty</p>
              <p className="font-sans text-xs text-[#5A4A42] max-w-[280px] mx-auto">
                Browse our collections and save your favorite bras and abayas to access them later.
              </p>
              <button
                onClick={onClose}
                className="bg-[#8A4853] hover:bg-[#70343e] text-white px-5 py-2.5 rounded-xl font-sans text-[10px] tracking-widest font-bold uppercase transition-colors"
              >
                Start Saving Items
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistItems.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center space-x-4 bg-white p-3 rounded-2xl border border-[#FAF6F0] relative"
                >
                  <div className="w-16 h-20 rounded-xl bg-[#FAF6F0] overflow-hidden shrink-0">
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

                  <div className="flex-grow space-y-1">
                    <span className="font-sans text-[9px] text-[#A38F85] font-bold uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h4 className="font-playfair text-xs sm:text-sm text-[#1A1515] font-semibold">
                      {product.name}
                    </h4>
                    <p className="font-playfair text-xs sm:text-sm font-bold text-[#8A4853]">
                      Rs. {product.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onQuickView(product);
                      }}
                      className="bg-[#8A4853] hover:bg-[#70343e] text-white px-4 py-2 rounded-xl text-[10px] tracking-wider font-bold uppercase transition-colors flex items-center space-x-1.5"
                      id={`wishlist-quickview-${product.id}`}
                    >
                      <ShoppingCart size={11} />
                      <span>Select &amp; Add</span>
                    </button>
                    <button
                      onClick={() => onRemoveFromWishlist(product)}
                      className="text-neutral-300 hover:text-red-500 transition-colors p-2"
                      title="Remove from wishlist"
                      id={`wishlist-remove-${product.id}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
