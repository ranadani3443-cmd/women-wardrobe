import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MessageSquare, MapPin, Send, CheckCircle, ArrowUpRight } from 'lucide-react';
import { getMerchantWhatsAppNumber } from '../lib/whatsapp';

export default function Contact() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  const handleWhatsAppClick = () => {
    const merchantPhone = getMerchantWhatsAppNumber();
    // Custom pre-filled message for WhatsApp link
    const whatsappMessage = encodeURIComponent(
      "Hello Women's Wardrobe team, I am interested in inquiring about your premium Kaftan Abayas and intimates collection!"
    );
    window.open(`https://wa.me/${merchantPhone}?text=${whatsappMessage}`, '_blank');
  };

  return (
    <section id="contact" className="py-24 bg-[#FAF6F0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-sans text-[10px] tracking-[0.3em] font-bold text-[#8A4853] uppercase mb-3">
            Pure Connection
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl text-[#1A1515] font-semibold tracking-tight">
            We'd Love To <span className="font-playfair italic text-[#8A4853]">Hear From You</span>
          </h2>
          <div className="h-0.5 w-16 bg-[#8A4853]/20 mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
          
          {/* Column 1: Contact Details & WhatsApp Button */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h3 className="font-playfair text-2xl text-[#1A1515] font-semibold">
                Get in Touch
              </h3>
              <p className="font-sans text-xs text-[#5A4A42] leading-relaxed">
                Whether you have questions about our premium cotton sizing, material feel, or custom abaya lengths, our dedicated team is here to assist you.
              </p>
            </div>

            <div className="space-y-6">
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-white border border-[#FAF6F0] text-[#8A4853] flex items-center justify-center shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <h4 className="font-playfair text-xs font-semibold text-[#1A1515]">Direct WhatsApp / Call</h4>
                  <p className="font-sans text-xs text-[#5A4A42] mt-0.5 font-mono">+92 342 2939080</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-white border border-[#FAF6F0] text-[#8A4853] flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <h4 className="font-playfair text-xs font-semibold text-[#1A1515]">Official Support Email</h4>
                  <p className="font-sans text-xs text-[#5A4A42] mt-0.5">womenwordrobe873@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-white border border-[#FAF6F0] text-[#8A4853] flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <h4 className="font-playfair text-xs font-semibold text-[#1A1515]">Boutique Showroom</h4>
                  <p className="font-sans text-xs text-[#5A4A42] mt-0.5">
                    Premium Commercial Plaza, Block D, Gulberg, Lahore, Pakistan
                  </p>
                </div>
              </div>

            </div>

            {/* Direct WhatsApp Call to Action */}
            <div className="bg-[#114232]/5 p-6 rounded-[24px] border border-[#114232]/10 space-y-4">
              <div className="flex items-center space-x-2.5">
                <MessageSquare className="text-[#114232]" size={20} />
                <h4 className="font-playfair text-sm text-[#114232] font-bold">WhatsApp Concierge</h4>
              </div>
              <p className="font-sans text-[11px] text-[#5A4A42] leading-relaxed">
                Connect with our premium personal shoppers directly. Get instant help with fabric close-ups, sizing guides, and bespoke lookbooks.
              </p>
              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-[#114232] hover:bg-[#16512f] text-white py-3 rounded-xl font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 flex items-center justify-center space-x-2"
                id="whatsapp-chat-btn"
              >
                <span>Chat on WhatsApp</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

          </div>

          {/* Column 2: Modern Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-[32px] shadow-sm border border-[#FAF6F0]">
            
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle size={28} />
                </div>
                <h3 className="font-playfair text-xl text-[#1A1515] font-semibold">Message Received</h3>
                <p className="font-sans text-xs text-[#5A4A42] max-w-[320px]">
                  Thank you! Your message has been sent to our boutique representatives. We will reply to your email within 12 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] tracking-wider text-[#A38F85] font-bold uppercase block">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fatima Ali"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FAF6F0] border-none rounded-xl px-4 py-3.5 text-xs text-[#5A4A42] placeholder-[#A38F85] focus:outline-none focus:ring-1 focus:ring-[#8A4853] shadow-inner"
                      id="contact-name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] tracking-wider text-[#A38F85] font-bold uppercase block">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +92 300 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#FAF6F0] border-none rounded-xl px-4 py-3.5 text-xs text-[#5A4A42] placeholder-[#A38F85] focus:outline-none focus:ring-1 focus:ring-[#8A4853] shadow-inner"
                      id="contact-phone"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-[10px] tracking-wider text-[#A38F85] font-bold uppercase block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. fatima@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAF6F0] border-none rounded-xl px-4 py-3.5 text-xs text-[#5A4A42] placeholder-[#A38F85] focus:outline-none focus:ring-1 focus:ring-[#8A4853] shadow-inner"
                    id="contact-email"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-[10px] tracking-wider text-[#A38F85] font-bold uppercase block">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your inquiry (sizing, shipping, customized orders)..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#FAF6F0] border-none rounded-xl px-4 py-3.5 text-xs text-[#5A4A42] placeholder-[#A38F85] focus:outline-none focus:ring-1 focus:ring-[#8A4853] shadow-inner"
                    id="contact-message"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#8A4853] hover:bg-[#70343e] disabled:bg-[#a6606b] text-white py-4 rounded-xl font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 shadow flex items-center justify-center space-x-2"
                  id="contact-submit-btn"
                >
                  {isSubmitting ? (
                    <span>Sending Inquiry...</span>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send size={12} />
                    </>
                  )}
                </button>

              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
