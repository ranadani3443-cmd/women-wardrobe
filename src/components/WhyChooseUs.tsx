import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { WHY_CHOOSE_US } from '../data';

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="py-20 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-sans text-[10px] tracking-[0.3em] font-bold text-[#8A4853] uppercase mb-3"
          >
            The Distinction
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-playfair text-3xl sm:text-4xl text-[#1A1515] font-semibold tracking-tight"
          >
            Why Choose <span className="font-playfair italic text-[#8A4853]">Women's Wardrobe</span>
          </motion.h2>
          <div className="h-0.5 w-16 bg-[#8A4853]/20 mx-auto mt-4" />
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {WHY_CHOOSE_US.map((item, index) => {
            // Dynamically resolve lucide icons
            let IconComponent = Icons.Sparkles;
            if (item.icon === 'Heart') IconComponent = Icons.Heart;
            if (item.icon === 'Palette') IconComponent = Icons.Palette;
            if (item.icon === 'Users') IconComponent = Icons.Users;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[#FAF6F0] flex flex-col items-center text-center group hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-[#FDF6F6] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-[#FAF6F0]">
                  <IconComponent className="text-[#8A4853] stroke-[1.5]" size={24} />
                </div>
                <h3 className="font-playfair text-lg text-[#1A1515] font-semibold mb-3 group-hover:text-[#8A4853] transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="font-sans text-xs text-[#5A4A42] leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
