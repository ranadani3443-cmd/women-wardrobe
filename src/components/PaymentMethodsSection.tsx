import { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Copy, Check, MessageCircle, ShieldCheck, HelpCircle } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[];
}

export default function PaymentMethodsSection({ paymentMethods }: PaymentMethodsSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeMethods = paymentMethods.filter(pm => pm.isActive);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="payment-methods" className="py-20 bg-[#FAF6F0] border-t border-[#F5EFEB] relative overflow-hidden">
      {/* Aesthetic ambient lighting blobs */}
      <div className="absolute top-1/4 left-1/10 w-72 h-72 rounded-full bg-[#8A4853]/3 filter blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-[#E2B4BD]/5 filter blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-sans text-[10px] sm:text-[11px] font-bold text-[#8A4853] uppercase tracking-[0.25em] block">
            Secured Billing Channels
          </span>
          <h2 className="font-playfair text-3xl sm:text-4xl text-[#1A1515] font-bold leading-tight">
            Seamless Payment Methods
          </h2>
          <div className="w-12 h-1 bg-[#8A4853] mx-auto rounded-full" />
          <p className="font-sans text-xs sm:text-sm text-[#5A4A42] leading-relaxed">
            Choose any of our active secure payment channels below. Copy details to complete your checkout transfer, upload your payment receipt, and receive priority delivery dispatch.
          </p>
        </div>

        {activeMethods.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-[#F5EFEB] max-w-md mx-auto p-6 space-y-4">
            <HelpCircle className="w-12 h-12 text-[#A38F85] mx-auto stroke-1.5" />
            <h4 className="font-playfair font-bold text-[#1A1515] text-base">Payment Channels Updating</h4>
            <p className="font-sans text-xs text-[#5A4A42]">
              Our financial checkout channels are currently being updated by the boutique managers. Please feel free to place orders via Cash on Delivery during this time!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeMethods.map((pm, index) => (
              <motion.div
                key={pm.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-3xl border border-[#F5EFEB] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6 relative group overflow-hidden"
              >
                {/* Visual Glassmorphism highlight top-accent */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#8A4853]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Card Top: Branding logo and Name */}
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#FAF6F0] flex items-center justify-center border border-[#F5EFEB] shrink-0 shadow-xs group-hover:scale-[1.03] transition-transform duration-300">
                      {pm.icon ? (
                        <img 
                          src={pm.icon} 
                          alt={pm.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <CreditCard className="w-7 h-7 text-[#8A4853] stroke-1.25" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-playfair font-bold text-neutral-900 text-base">{pm.name}</h4>
                      {pm.accountTitle && (
                        <p className="font-sans text-[10px] text-[#A38F85] uppercase tracking-wider font-semibold">
                          Title: {pm.accountTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Icon badge indicatior */}
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100" title="Verfied Channel">
                    <ShieldCheck size={14} />
                  </div>
                </div>

                {/* Card Center: Account digits & interactive copies */}
                <div className="space-y-1.5">
                  <span className="font-sans text-[9px] font-bold text-[#A38F85] uppercase tracking-wider block">
                    Account Details / IBAN
                  </span>
                  <div className="flex items-center justify-between bg-[#FAF6F0] rounded-2xl px-3.5 py-3 border border-[#F5EFEB]/50">
                    <code className="font-mono text-xs font-bold text-[#1A1515] select-all break-all pr-2">
                      {pm.accountNumber}
                    </code>
                    
                    <button
                      onClick={() => handleCopy(pm.accountNumber, pm.id)}
                      className={`p-2 rounded-xl transition-all shrink-0 ${
                        copiedId === pm.id
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-white hover:bg-[#8A4853]/5 text-[#A38F85] hover:text-[#8A4853] border border-[#F5EFEB]'
                      }`}
                      title="Copy to clipboard"
                    >
                      {copiedId === pm.id ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                {/* Card Footer: Decorative confirmation */}
                <div className="border-t border-[#FAF6F0] pt-4 flex justify-between items-center text-[10px] text-[#A38F85]">
                  <span className="font-sans font-bold uppercase tracking-wider">Priority Settlement</span>
                  <span className="font-sans font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Instant Verification
                  </span>
                </div>

              </motion.div>
            ))}
          </div>
        )}

        {/* WhatsApp & Support Quick Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 bg-white rounded-[32px] border border-[#F5EFEB] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center border border-[#25D366]/20 shrink-0">
              <MessageCircle size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="font-playfair font-bold text-neutral-900 text-lg">Prefer Order Booking on WhatsApp?</h4>
              <p className="font-sans text-xs text-[#5A4A42] max-w-xl">
                Chat directly with our luxury support concierges on <strong className="font-semibold text-neutral-800">0326 9300922</strong>. Confirm sizing guides, request custom styling suggestions, and place orders directly with dynamic screenshots!
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/923269300922?text=Hi!%20I'm%20visiting%20your%20Boutique%20Women's%20Wardrobe%20and%20want%20to%20place%20an%20order%20directly."
            target="_blank"
            rel="noreferrer referrer"
            className="w-full md:w-auto bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-3 rounded-2xl font-sans text-xs tracking-wider font-bold uppercase flex items-center justify-center space-x-2 transition-all shadow-md self-stretch md:self-center shrink-0"
          >
            <MessageCircle size={15} />
            <span>Chat Live Now</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
}
