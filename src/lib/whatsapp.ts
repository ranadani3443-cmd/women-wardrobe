import { AdminOrder } from '../types';

export const DEFAULT_MERCHANT_WHATSAPP = import.meta.env.VITE_MERCHANT_WHATSAPP || '923422939080';
export const WHATSAPP_STORAGE_KEY = 'ww_merchant_whatsapp';

/**
 * Retrieves the configured merchant WhatsApp number.
 */
export function getMerchantWhatsAppNumber(): string {
  try {
    const stored = localStorage.getItem(WHATSAPP_STORAGE_KEY);
    if (stored && stored.trim()) {
      return cleanWhatsAppNumber(stored.trim());
    }
  } catch (e) {
    // Fallback
  }
  return DEFAULT_MERCHANT_WHATSAPP;
}

/**
 * Saves the merchant WhatsApp number.
 */
export function setMerchantWhatsAppNumber(phone: string): void {
  try {
    localStorage.setItem(WHATSAPP_STORAGE_KEY, cleanWhatsAppNumber(phone));
  } catch (e) {
    console.warn('Failed to save merchant WhatsApp number', e);
  }
}

/**
 * Sanitizes phone numbers to standard WhatsApp international format.
 * (e.g. "0326-9300922" -> "923269300922", "+92 300 1234567" -> "923001234567")
 */
export function cleanWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.startsWith('0092')) {
    cleaned = '92' + cleaned.substring(4);
  }
  return cleaned || DEFAULT_MERCHANT_WHATSAPP;
}

/**
 * Formats a clean, high-contrast WhatsApp receipt for instant 1-click notification.
 */
export function formatOrderWhatsAppMessage(order: AdminOrder, storeName: string = "Women's Wardrobe"): string {
  const itemsText = order.items
    .map((item, idx) => {
      const itemSub = (item.price * item.quantity).toLocaleString();
      return `${idx + 1}. *${item.productName}*\n   • Size: ${item.size} | Color: ${item.color}\n   • Qty: ${item.quantity} × Rs. ${item.price.toLocaleString()} = Rs. ${itemSub}`;
    })
    .join('\n');

  const subtotal = order.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const delivery = order.deliveryCharge === 0 ? 'FREE (0 Rs.)' : `Rs. ${order.deliveryCharge.toLocaleString()}`;
  const total = order.total.toLocaleString();
  const paymentProofNote = order.paymentScreenshot ? '📸 Screenshot Attached in Order Ledger' : 'Standard / COD / 1-Click Verification';

  return `🛍️ *NEW ORDER NOTIFICATION — ${storeName.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━
📦 *Order ID:* #${order.id}
📅 *Date:* ${order.date}

👤 *CUSTOMER DETAILS:*
• *Name:* ${order.customerName}
• *Phone:* ${order.phone}
• *Address:* ${order.address}
• *Payment Method:* ${order.paymentMethod}
• *Payment Status:* ${order.paymentStatus || 'Pending Verification'}

👗 *ORDERED ITEMS (${order.items.length}):*
${itemsText}

━━━━━━━━━━━━━━━━━━━━━
💰 *Subtotal:* Rs. ${subtotal.toLocaleString()}
🚚 *Delivery:* ${delivery}
🏷️ *GRAND TOTAL:* *Rs. ${total}*
━━━━━━━━━━━━━━━━━━━━━
📎 *Payment Proof:* ${paymentProofNote}

✨ *Notification automatically dispatched via Women's Wardrobe 1-Click System.*`;
}

/**
 * Generates direct 1-click WhatsApp notification URL for the merchant.
 */
export function getMerchantWhatsAppOrderLink(order: AdminOrder, merchantPhone?: string): string {
  const targetPhone = merchantPhone ? cleanWhatsAppNumber(merchantPhone) : getMerchantWhatsAppNumber();
  const message = formatOrderWhatsAppMessage(order);
  return `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(message)}`;
}

/**
 * Generates 1-click WhatsApp message link to directly contact the customer.
 */
export function getCustomerWhatsAppOrderLink(order: AdminOrder): string {
  const customerPhone = cleanWhatsAppNumber(order.phone);
  const message = `Hello *${order.customerName}*! 👋

Thank you for shopping at *Women's Wardrobe*! 
We have received your order *#${order.id}* totaling *Rs. ${order.total.toLocaleString()}*.

Your order is currently *${order.status}*. We are preparing your parcel for prompt dispatch.

If you have any questions or need to update your delivery address, please let us know! 🌸`;

  return `https://api.whatsapp.com/send?phone=${customerPhone}&text=${encodeURIComponent(message)}`;
}
