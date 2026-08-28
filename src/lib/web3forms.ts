import { AdminOrder } from '../types';

export const WEB3FORMS_ACCESS_KEY = "18980451-9db4-4328-8d9e-786805829baf";
export const OFFICIAL_BUSINESS_EMAIL = "womenwordrobe873@gmail.com";

export interface NotificationResult {
  web3formsSuccess: boolean;
  web3formsMessage: string;
  formSubmitSuccess: boolean;
  formSubmitMessage: string;
}

/**
 * Formats order summary into clean human readable text for email notifications
 */
export function formatOrderEmailSummary(order: Partial<AdminOrder>): string {
  const itemsFormatted = (order.items || []).map((item, idx) => 
    `${idx + 1}. ${item.productName} (${item.category || 'Apparel'}) | Size: ${item.size || 'Standard'}, Color: ${item.color || 'Standard'} | Qty: ${item.quantity} x Rs. ${item.price?.toLocaleString()} = Rs. ${((item.price || 0) * item.quantity).toLocaleString()}`
  ).join('\n');

  return `
==============================================
NEW ORDER SUMMARY RECEIVED - WOMEN'S WARDROBE
==============================================

ORDER IDENTIFIER: ${order.id || 'N/A'}
ORDER DATE: ${order.date || new Date().toLocaleString()}

CUSTOMER DETAILS:
-----------------
Name: ${order.customerName || 'N/A'}
Phone: ${order.phone || 'N/A'}
Email: ${order.customerEmail || 'Not specified'}
Delivery Address: ${order.address || 'N/A'}

PAYMENT & SHIPPING INFO:
------------------------
Payment Method: ${order.paymentMethod || 'N/A'}
Payment Status: ${order.paymentStatus || 'Unpaid'}
Delivery Fee: Rs. ${(order.deliveryCharge || 0).toLocaleString()}
TOTAL ORDER AMOUNT: Rs. ${(order.total || 0).toLocaleString()}

ITEMS ORDERED (${(order.items || []).length} items):
----------------------------------------
${itemsFormatted || 'No items listed'}

==============================================
This is an automated real-time notification sent to ${OFFICIAL_BUSINESS_EMAIL}.
Manage and update order status in the store Admin Panel.
==============================================
`.trim();
}

/**
 * Sends order notification to Web3Forms API
 */
async function sendViaWeb3Forms(order: Partial<AdminOrder>, customKey?: string): Promise<{ success: boolean; message: string }> {
  const keyToUse = customKey || WEB3FORMS_ACCESS_KEY;
  try {
    const fullMessage = formatOrderEmailSummary(order);
    const payload = {
      access_key: keyToUse,
      subject: `🛍️ New Order #${order.id} - ${order.customerName} (Rs. ${(order.total || 0).toLocaleString()})`,
      from_name: "Women's Wardrobe Store",
      to_email: OFFICIAL_BUSINESS_EMAIL,
      name: order.customerName || "Customer",
      email: order.customerEmail || OFFICIAL_BUSINESS_EMAIL,
      phone: order.phone || "",
      address: order.address || "",
      order_id: order.id || "",
      grand_total: `Rs. ${(order.total || 0).toLocaleString()}`,
      payment_method: order.paymentMethod || "",
      message: fullMessage
    };

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.success) {
      return { success: true, message: 'Delivered via Web3Forms API' };
    } else {
      return { success: false, message: data.message || 'Web3Forms API returned error' };
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * Sends order notification via FormSubmit API (Direct email backup service)
 */
async function sendViaFormSubmit(order: Partial<AdminOrder>): Promise<{ success: boolean; message: string }> {
  try {
    const fullMessage = formatOrderEmailSummary(order);
    const payload = {
      _subject: `🛍️ New Order #${order.id} - ${order.customerName} (Rs. ${(order.total || 0).toLocaleString()})`,
      _template: 'table',
      _captcha: 'false',
      "Order ID": order.id,
      "Customer Name": order.customerName,
      "Customer Phone": order.phone,
      "Customer Email": order.customerEmail || 'Not provided',
      "Delivery Address": order.address,
      "Payment Method": order.paymentMethod,
      "Grand Total": `Rs. ${(order.total || 0).toLocaleString()}`,
      "Order Details": fullMessage
    };

    const response = await fetch(`https://formsubmit.co/ajax/${OFFICIAL_BUSINESS_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.success || response.ok) {
      return { success: true, message: 'Delivered via FormSubmit Service' };
    } else {
      return { success: false, message: data.message || 'FormSubmit response error' };
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'FormSubmit network error' };
  }
}

/**
 * Sends an immediate order notification via dual delivery engines (Web3Forms + FormSubmit)
 */
export async function sendWeb3FormsOrderNotification(order: AdminOrder, customKey?: string): Promise<NotificationResult> {
  // Dispatch both in parallel
  const [w3fRes, fsRes] = await Promise.all([
    sendViaWeb3Forms(order, customKey),
    sendViaFormSubmit(order)
  ]);

  console.log('Order Email Delivery Status:', { web3forms: w3fRes, formSubmit: fsRes });

  return {
    web3formsSuccess: w3fRes.success,
    web3formsMessage: w3fRes.message,
    formSubmitSuccess: fsRes.success,
    formSubmitMessage: fsRes.message
  };
}

/**
 * Triggers a test email to womenwordrobe873@gmail.com to verify notification channels
 */
export async function sendTestEmailNotification(customKey?: string): Promise<NotificationResult> {
  const sampleOrder: Partial<AdminOrder> = {
    id: `TEST-${Math.floor(100000 + Math.random() * 900000)}`,
    customerName: 'Test Business Owner',
    phone: '03422939080',
    address: 'Executive Store Headquarters, Lahore, Pakistan',
    paymentMethod: 'Cash On Delivery',
    deliveryCharge: 250,
    total: 3500,
    date: new Date().toLocaleString(),
    paymentStatus: 'Paid',
    customerEmail: OFFICIAL_BUSINESS_EMAIL,
    items: [
      {
        productName: 'Chiffon Embroidered Dupatta Suit',
        category: 'Unstitched',
        size: 'Medium',
        color: 'Rose Gold',
        quantity: 1,
        price: 3250
      }
    ]
  };

  return sendWeb3FormsOrderNotification(sampleOrder as AdminOrder, customKey);
}

