import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => {
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#FDFBF7] to-[#FAF6F0] overflow-hidden relative">
      
      {/* Editorial aesthetic shapes */}
      <div className="absolute top-[10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-[#E8C5C8]/10 blur-3xl z-0" />
      <div className="absolute bottom-[10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#E2B4BD]/10 blur-3xl z-0" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        <div className="bg-gradient-to-tr from-white via-white to-[#FDF6F6] rounded-[40px] p-8 sm:p-16 text-center border border-[#FAF6F0] shadow-sm relative overflow-hidden">
          
          <div className="max-w-xl mx-auto space-y-6">
            
            <p className="font-sans text-[10px] tracking-[0.3em] font-bold text-[#8A4853] uppercase">
              Join Our Inner Circle
            </p>
            
            <h2 className="font-playfair text-3xl sm:text-4xl text-[#1A1515] font-semibold leading-tight">
              Previews, Private <span className="font-playfair italic text-[#8A4853]">Sales &amp; Style Care</span>
            </h2>
            
            <p className="font-sans text-xs sm:text-sm text-[#5A4A42] leading-relaxed">
              Subscribe to the Women's Wardrobe newsletter for exclusive seasonal lookbook releases, member-only discounts, and elegant styling guides.
            </p>

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-center space-x-3 text-emerald-800 max-w-md mx-auto"
              >
                <CheckCircle size={18} className="text-emerald-600" />
                <span className="font-sans text-xs font-semibold">Thank you! You are now subscribed.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-6">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-[#FAF6F0] border-none rounded-xl px-5 py-4 text-xs text-[#5A4A42] placeholder-[#A38F85] focus:outline-none focus:ring-1 focus:ring-[#8A4853] shadow-inner"
                  id="newsletter-email"
                />
                <button
                  type="submit"
                  className="bg-[#8A4853] hover:bg-[#70343e] text-white px-6 py-4 rounded-xl font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 shadow flex items-center justify-center space-x-2"
                  id="newsletter-submit"
                >
                  <span>Subscribe</span>
                  <Send size={12} />
                </button>
              </form>
            )}

            <p className="font-sans text-[9px] text-[#A38F85] uppercase tracking-wider mt-4">
              Unsubscribe anytime. We protect your privacy with absolute care.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}
