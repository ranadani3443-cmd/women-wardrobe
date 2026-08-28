import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop";

interface FeaturedCollectionsProps {
  onSelectCategory: (category: string) => void;
}

export default function FeaturedCollections({ onSelectCategory }: FeaturedCollectionsProps) {
  const collections = [
    {
      id: 'kaftan-abayas',
      categoryName: 'Kaftan Abayas',
      sub: 'Artisanal modest luxury',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrBEwQu1nr5LAIeHL-Qm0Va6yRt18x5N-ShqXso-F3Dz3t4TWhrmq8SVM1Oxet9q8laStetyrutabG7PQl77WEJuh_yVrsLy1hiXvHH7sohZuKQd3QJNlMOyzoU2VqThIpXxyY5g56jxIZK-DQm9T6c0rSgWKVbKOgQsZQOwD9iA3tKCuXRHgiuthh5Bfrmf4d74qmaK3GBIlQdMoaPa7Y1fxFGAb8kG9WRon8sJTG7jn_-w-PHWm-cyjkO4S7W-ivmHsuLig7UEs',
      colSpan: 'md:col-span-8',
      buttonText: 'Explore Abayas'
    },
    {
      id: 'premium-bras',
      categoryName: 'Premium Bras',
      sub: 'Floral lace & sheer net comfort',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX66ECRWYYW860wxIgYFkCw0EHygxzHm76J6igyJSn9xEsSERlbO7D2ag7HUaO1FxvkkTRtlihwhwa524tLOvjhYtDFZ8LxLqG6WA8I_uMZvbl5o0JfmyVtFQEfNIDw4JKo3vveNQ89aEoCULAKEddnpUDRlA4-YAWI1Tk2sflAlivJKNrSwGMHZuD8ckzJoFBY20v-KSGvl0yT2Pf1YhTZ9njDKE5A6xca3Yuogvs_QRX527Rav9GxG8qhj5OCDyEHzBwocgu9pM',
      colSpan: 'md:col-span-4',
      buttonText: 'Discover Net Bras'
    },
    {
      id: 'cotton-bras',
      categoryName: 'Cotton Bras',
      sub: '100% long-staple organic cotton',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXNtG95rIOkMxuO7zAyy-sNWxJR7NS2p0dwFkFPyrsVpkVpIealq_Jo_uB0muvIyRj76Ej3uKoydTjhzsX2GOhOWtGWWR0fT9x_efURbsWQuBldWHOTADBTo8qxj_7ATGLOHnnSN_3euHVaTloybPgGeNti_OBPDUFfsx-mcHaYKSzQ-WFuRKy1LKjfrAjkMxNztxYAdAU4WZ0XwW3BHx7lNFIXKpPdShUI430yzJ7gPtK5mDifvuwbOOiJDm5aVedf49hq-0YCgU',
      colSpan: 'md:col-span-4',
      buttonText: 'Everyday Cottons'
    },
    {
      id: 'malai-cotton-bras',
      categoryName: 'Malai Cotton Bras',
      sub: 'Ultra-soft modal silk feeling',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNd4MFpQntfmYoT8ongSW8_UdGJoX3T252upzPBChOkAShoCr7LH7n3W9Z42MtqC53jsZ4l7uNeNNbMds8MgZJJ42hY2w0wlZXBcCe3TtEqK4yqP92SGpKEl1bVdEN7Zxi8ieYyDZT4Y5de4SHw2urF6E6GFHIFdLT5ttoHdi00PlPdNHVRKt5CbBfi0-H5gn2szdEi2E841HsISAp2sqm9L0uRRMPPeG6b1cHLElru_gPG09A3IK2RPOrDWID5lL7QK3PzSn7b40',
      colSpan: 'md:col-span-8',
      buttonText: 'Experience Malai'
    }
  ];

  return (
    <section id="featured" className="py-20 bg-[#FAF6F0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-xl">
            <p className="font-sans text-[10px] tracking-[0.3em] font-bold text-[#8A4853] uppercase mb-3">
              Curated Galleries
            </p>
            <h2 className="font-playfair text-3xl sm:text-4xl text-[#1A1515] font-semibold tracking-tight">
              Seasonal <span className="font-playfair italic text-[#8A4853]">Collections</span>
            </h2>
            <div className="h-0.5 w-16 bg-[#8A4853]/20 mt-4" />
          </div>
          <p className="font-sans text-xs text-[#5A4A42] max-w-sm mt-4 md:mt-0 leading-relaxed font-medium">
            Explore our thoughtfully categorized boutiques. From the intricate weave of our abayas to the gentle embrace of our premium intimates.
          </p>
        </div>

        {/* Categories Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {collections.map((col, index) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              onClick={() => onSelectCategory(col.categoryName)}
              className={`${col.colSpan} group cursor-pointer relative overflow-hidden rounded-[30px] aspect-[4/3] md:aspect-auto md:h-[350px] shadow-sm hover:shadow-lg transition-all duration-500`}
            >
              {/* Zooming background image */}
              <div className="absolute inset-0 z-0 bg-[#FAF6F0]">
                <img
                  src={col.image || FALLBACK_IMAGE}
                  alt={col.categoryName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {/* High contrast luxury vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1515]/75 via-[#1A1515]/20 to-transparent transition-opacity duration-300 opacity-90 group-hover:opacity-95" />
              </div>

              {/* Glassmorphism Content Overlay */}
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white z-10 flex items-center justify-between shadow-lg">
                <div className="space-y-1">
                  <span className="font-sans text-[9px] tracking-widest font-bold text-[#E8C5C8] uppercase">
                    {col.sub}
                  </span>
                  <h3 className="font-playfair text-xl sm:text-2xl font-bold leading-tight">
                    {col.categoryName}
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-full bg-white text-[#8A4853] flex items-center justify-center shadow group-hover:bg-[#8A4853] group-hover:text-white transition-colors duration-300">
                  <ArrowUpRight size={18} />
                </div>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
