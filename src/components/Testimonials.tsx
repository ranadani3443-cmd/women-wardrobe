import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../data';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section id="reviews" className="py-24 bg-[#FAF6F0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-sans text-[10px] tracking-[0.3em] font-bold text-[#8A4853] uppercase mb-3">
            Pure Gratitude
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl text-[#1A1515] font-semibold tracking-tight">
            Loved By <span className="font-playfair italic text-[#8A4853]">Thousands Of Women</span>
          </h2>
          <div className="h-0.5 w-16 bg-[#8A4853]/20 mx-auto mt-4" />
        </div>

        {/* Carousel Slider Panel */}
        <div className="max-w-4xl mx-auto relative px-4 sm:px-12">
          
          <div className="relative bg-white rounded-[32px] p-8 sm:p-12 shadow-sm border border-[#FAF6F0] min-h-[320px] flex flex-col justify-between">
            
            {/* Elegant Quote marks decoration */}
            <div className="absolute top-8 right-8 text-[#8A4853]/10">
              <Quote size={80} className="stroke-[1.5]" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 relative z-10"
              >
                {/* Rating Stars */}
                <div className="flex items-center space-x-1 text-[#D4A373]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-current"
                    />
                  ))}
                  <span className="text-xs font-bold text-[#5A4A42] ml-2">
                    {current.rating} / 5
                  </span>
                </div>

                {/* Quote Text */}
                <p className="font-playfair text-base sm:text-lg text-[#1A1515] italic leading-relaxed">
                  "{current.text}"
                </p>

                {/* Author Card */}
                <div className="flex items-center space-x-4 pt-4 border-t border-[#FAF6F0]">
                  <img
                    src={current.image}
                    alt={current.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#8A4853]/25 shadow-inner"
                  />
                  <div>
                    <h4 className="font-playfair text-sm text-[#1A1515] font-semibold">
                      {current.name}
                    </h4>
                    <p className="font-sans text-[10px] text-[#8A4853] font-semibold tracking-widest uppercase mt-0.5">
                      {current.role}
                    </p>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>

            {/* Slider Navigation Dots */}
            <div className="flex justify-center space-x-2 pt-8 z-10">
              {TESTIMONIALS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-6 bg-[#8A4853]' : 'w-1.5 bg-[#8A4853]/20 hover:bg-[#8A4853]/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>

          {/* Carousel Arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 -ml-2 sm:-ml-6 z-10">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#5A4A42] hover:text-[#8A4853] border border-[#FAF6F0] shadow-sm hover:shadow-md flex items-center justify-center transition-all focus:outline-none"
              id="prev-testimonial-btn"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-0 -mr-2 sm:-mr-6 z-10">
            <button
              onClick={nextTestimonial}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#5A4A42] hover:text-[#8A4853] border border-[#FAF6F0] shadow-sm hover:shadow-md flex items-center justify-center transition-all focus:outline-none"
              id="next-testimonial-btn"
            >
              <ChevronRight size={18} />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
