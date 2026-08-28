import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  onShopClick: () => void;
  onNewArrivalsClick: () => void;
}

export default function Hero({ onShopClick, onNewArrivalsClick }: HeroProps) {
  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center pt-24 pb-12 overflow-hidden bg-gradient-to-b from-[#FAF6F0] via-[#FAF6F0] to-[#FDFBF7]"
    >
      {/* Decorative luxury backgrounds */}
      <div className="absolute top-0 right-0 w-[45%] h-[75%] rounded-bl-[120px] bg-gradient-to-br from-[#E2B4BD]/10 to-transparent blur-3xl z-0" />
      <div className="absolute bottom-0 left-[10%] w-[35%] h-[55%] rounded-tr-[100px] bg-gradient-to-tr from-[#FAF6F0] to-[#FAF6F0] blur-2xl z-0" />

      {/* Floating abstract decorative elements */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[25%] left-[5%] text-[#8A4853]/20 hidden md:block"
      >
        <Sparkles size={48} className="stroke-[1]" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 items-center relative z-10 gap-12 lg:gap-16">
        
        {/* Left Side Content */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#8A4853]/10 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A4853] animate-pulse" />
            <span className="font-sans text-[10px] tracking-[0.3em] font-bold text-[#8A4853] uppercase">
              Precious • Feminine • Forever
            </span>
          </motion.div>

          <div className="space-y-4 max-w-xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-playfair text-4xl sm:text-5xl lg:text-6xl text-[#1A1515] font-semibold leading-tight tracking-tight"
            >
              Elegance <span className="font-playfair italic text-[#8A4853]">Redefined</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-sans text-sm sm:text-base text-[#5A4A42] leading-relaxed font-medium"
            >
              Premium Bras, Kaftan Abayas & Women's Fashion Essentials. Meticulously designed for unmatched comfort, luxury draping, and feminine confidence.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button
              onClick={onShopClick}
              className="group bg-[#8A4853] hover:bg-[#70343e] text-white px-8 py-4 rounded-xl font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 shadow-md flex items-center justify-center space-x-2"
              id="hero-shop-btn"
            >
              <span>Shop Collection</span>
              <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>
            <button
              onClick={onNewArrivalsClick}
              className="bg-white/80 hover:bg-white text-[#8A4853] border border-[#8A4853]/20 px-8 py-4 rounded-xl font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 shadow-sm hover:shadow"
              id="hero-arrivals-btn"
            >
              New Arrivals
            </button>
          </motion.div>

          {/* Core Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-6 pt-6 border-t border-[#F5EFEB] w-full"
          >
            <div>
              <p className="font-playfair text-xl sm:text-2xl text-[#8A4853] font-bold">100%</p>
              <p className="font-sans text-[10px] tracking-wider text-[#A38F85] uppercase">Pure Egyptian Cotton</p>
            </div>
            <div>
              <p className="font-playfair text-xl sm:text-2xl text-[#8A4853] font-bold">Premium</p>
              <p className="font-sans text-[10px] tracking-wider text-[#A38F85] uppercase">Nidha Silk Abayas</p>
            </div>
            <div>
              <p className="font-playfair text-xl sm:text-2xl text-[#8A4853] font-bold">Inclusive</p>
              <p className="font-sans text-[10px] tracking-wider text-[#A38F85] uppercase">Comfort Sizes</p>
            </div>
          </motion.div>

        </div>

        {/* Right Side Visuals - Floating 3D Cards */}
        <div className="lg:col-span-6 relative h-[450px] sm:h-[550px] w-full flex items-center justify-center">
          
          {/* Main Decorative Portal / Circle */}
          <div className="absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-tr from-[#E8C5C8]/40 to-[#FAF6F0] border border-white shadow-inner animate-pulse" />

          {/* Card 1: Kaftan Abaya Editorial */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: -4 }}
            transition={{ duration: 1, type: 'spring' }}
            whileHover={{ y: -10, rotate: 0, transition: { duration: 0.3 } }}
            className="absolute w-[240px] sm:w-[300px] aspect-[3/4] bg-white p-3 rounded-2xl shadow-xl border border-[#FAF6F0] z-20"
          >
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#FAF6F0] group">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFtieTmUFTvBwnYW-6vEsp78vf74_KyOkeujItX3y50ZayXoNebqBGMp3XrchFZjoPVPy0Os2gSbRTSNHw8CFQQ8MjS52BiSBk2G-X2Kzl-bfFuqAky8Ij9Q1pPcSQ9Iuikjf-KeizZCuADx0KhPpXwxAyvAeee8sm3Algb8u1H6IhP-cCr6-ymyyBgHMqqmcFpEzBBEEla2AN7TvlcV5O6TwOh-jt3_9DWwf4x9UDcgY-h39nYohfJEmlhcg-i-uwa29ZxQIpRQk"
                alt="Luxury Desert Rose Satin Kaftan Abaya"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-white/75 backdrop-blur-md px-3 py-2 rounded-lg border border-white/50 flex justify-between items-center">
                <div>
                  <p className="font-playfair text-[11px] text-[#1A1515] font-semibold leading-none">Desert Rose Kaftan</p>
                  <p className="font-sans text-[8px] text-[#8A4853] tracking-widest uppercase font-bold mt-1">Armani Satin</p>
                </div>
                <span className="font-playfair text-xs text-[#8A4853] font-bold">Rs. 6,499</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Intimate Wear Focus Overlay */}
          <motion.div
            initial={{ opacity: 0, x: -50, rotate: -6 }}
            animate={{ opacity: 1, x: -30, y: 110, rotate: 6 }}
            transition={{ duration: 1.2, type: 'spring', delay: 0.2 }}
            whileHover={{ y: 90, rotate: 0, zIndex: 30, transition: { duration: 0.3 } }}
            className="absolute w-[160px] sm:w-[200px] aspect-square bg-white p-2.5 rounded-2xl shadow-lg border border-[#FAF6F0] z-30"
          >
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#FDFBF7] flex items-center justify-center p-3 group">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrQUCd0MXB8mlOqFvUKLyeuL4ov8Cxrz1plRmTMB1aMehMS7EEHr4t1UcbM3xd0WicL4cem0q8w7-gGNsvaEZTebEpogmJRVdN8IdbrgrTt1Ugbtw_X-XTjDbTJPy0MeHDwAgH4HBBrUTFWPRhPtlGjv-0XjHgsX54lnlbiIA2Z6NRrCdozuLaMivryESOI6279b7mKHjUbIWZGVG5gXnmWcYSt4TWqoRyZqxp-dKo27qhNrNR65kbSaGYemOZR_oy_bYL41TwjjQ"
                alt="Lace Elegance Blush Pink Net Bra"
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 bg-[#8A4853] text-white font-sans text-[7px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Lace Net Bra
              </div>
              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded border border-[#FAF6F0] font-playfair text-[10px] font-bold text-[#8A4853]">
                Rs. 899
              </div>
            </div>
          </motion.div>

          {/* Card 3: Cotton Bra Comfort Overlay */}
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, x: 120, y: -110, rotate: -8 }}
            transition={{ duration: 1.2, type: 'spring', delay: 0.4 }}
            whileHover={{ y: -130, rotate: 0, zIndex: 30, transition: { duration: 0.3 } }}
            className="absolute w-[130px] sm:w-[170px] aspect-[4/3] bg-white p-2 rounded-2xl shadow-lg border border-[#FAF6F0] z-10"
          >
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#FAF6F0] flex items-center justify-center p-2 group">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnZvReIDJQ0P3RYIYh7Xk52HjE2z7HkoNP_l9kx2W56VGkJZmPY3t30GleACrGIVIdWZFbtvsNkPC46ytMxxfdcWJQULwijTWIpLaEdttnktABJQU61Oweo_SSsP9Zj2jDz5v50QFYd0gMlvrpp50IHbuvOTa5KVzvujbElClR4A9N_4U7QoAYhx5Juf1lUw1rhdeuvbLH0TFS1eQyHQ3Glc1XogeXcUx3EJwUKlftKrYdooZms4tE5My636K7F41GvL_jcqCfBdY"
                alt="Everyday Comfort Bra"
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-white/80 backdrop-blur-sm p-1 rounded flex justify-between items-center">
                <span className="font-sans text-[8px] text-[#5A4A42] font-semibold">Cotton Bra</span>
                <span className="font-playfair text-[9px] text-[#8A4853] font-bold">Rs. 999</span>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
