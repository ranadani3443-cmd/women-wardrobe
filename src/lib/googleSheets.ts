import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase.ts';
import { Product, AdminOrder, UserProfile, AuditLogEntry } from '../types.ts';

const OAUTH_TOKEN_KEY = 'womens_wardrobe_google_sheets_token';
const GOOGLE_USER_KEY = 'womens_wardrobe_google_user_info';
const LAST_ORDERS_SHEET_KEY = 'womens_wardrobe_orders_sheet_id';
const LAST_PRODUCTS_SHEET_KEY = 'womens_wardrobe_products_sheet_id';
const AUTO_SYNC_ORDERS_KEY = 'womens_wardrobe_auto_sync_sheets';

export interface GoogleUserInfo {
  email: string;
  displayName: string;
  photoURL?: string;
  connectedAt: string;
}

export interface SheetsExportResult {
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  rowCount: number;
  message: string;
}

// ==================== AUTHENTICATION ====================

export function getStoredGoogleToken(): string | null {
  return localStorage.getItem(OAUTH_TOKEN_KEY);
}

export function getStoredGoogleUser(): GoogleUserInfo | null {
  const data = localStorage.getItem(GOOGLE_USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function getLastOrdersSheetId(): string | null {
  return localStorage.getItem(LAST_ORDERS_SHEET_KEY);
}

export function setLastOrdersSheetId(id: string): void {
  localStorage.setItem(LAST_ORDERS_SHEET_KEY, id);
}

export function getLastProductsSheetId(): string | null {
  return localStorage.getItem(LAST_PRODUCTS_SHEET_KEY);
}

export function setLastProductsSheetId(id: string): void {
  localStorage.setItem(LAST_PRODUCTS_SHEET_KEY, id);
}

export function getAutoSyncOrdersEnabled(): boolean {
  return localStorage.getItem(AUTO_SYNC_ORDERS_KEY) === 'true';
}

export function setAutoSyncOrdersEnabled(enabled: boolean): void {
  localStorage.setItem(AUTO_SYNC_ORDERS_KEY, enabled ? 'true' : 'false');
}

export async function connectGoogleSheets(): Promise<{ token: string; user: GoogleUserInfo }> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/spreadsheets');
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;

  if (!token) {
    throw new Error('Google authentication succeeded but no access token was returned.');
  }

  const userInfo: GoogleUserInfo = {
    email: result.user.email || 'Authenticated User',
    displayName: result.user.displayName || 'Executive Administrator',
    photoURL: result.user.photoURL || undefined,
    connectedAt: new Date().toISOString(),
  };

  localStorage.setItem(OAUTH_TOKEN_KEY, token);
  localStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(userInfo));

  return { token, user: userInfo };
}

export async function disconnectGoogleSheets(): Promise<void> {
  localStorage.removeItem(OAUTH_TOKEN_KEY);
  localStorage.removeItem(GOOGLE_USER_KEY);
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out warning:', e);
  }
}

// ==================== REST API WRAPPERS ====================

async function requestSheetsApi(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  accessToken?: string
): Promise<any> {
  const token = accessToken || getStoredGoogleToken();
  if (!token) {
    throw new Error('Please connect your Google Account first to access Google Sheets.');
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      // ignore
    }
    const msg = errorData.error?.message || `Google Sheets API error (${response.status}: ${response.statusText})`;
    if (response.status === 401) {
      localStorage.removeItem(OAUTH_TOKEN_KEY);
      throw new Error('Your Google authorization has expired. Please re-authenticate with Google.');
    }
    throw new Error(msg);
  }

  return response.json();
}

/**
 * Creates a brand new styled Google Spreadsheet.
 */
export async function createGoogleSpreadsheet(
  title: string,
  sheetName: string = 'Sheet1',
  accessToken?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const res = await requestSheetsApi(
    '',
    'POST',
    {
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: sheetName,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    },
    accessToken
  );

  return {
    spreadsheetId: res.spreadsheetId,
    spreadsheetUrl: res.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${res.spreadsheetId}`,
  };
}

/**
 * Formats header row with burgundy styling and white bold font
 */
async function formatSpreadsheetHeaders(
  spreadsheetId: string,
  columnCount: number,
  accessToken?: string
): Promise<void> {
  try {
    await requestSheetsApi(
      `/${spreadsheetId}:batchUpdate`,
      'POST',
      {
        requests: [
          {
            repeatCell: {
              range: {
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: columnCount,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.54, // #8A4853 in RGB
                    green: 0.28,
                    blue: 0.32,
                  },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                    fontSize: 10,
                    fontFamily: 'Roboto',
                  },
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE',
                  padding: { top: 8, bottom: 8, left: 10, right: 10 },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding)',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: columnCount,
              },
            },
          },
        ],
      },
      accessToken
    );
  } catch (err) {
    console.warn('Formatting spreadsheet header notice (non-fatal):', err);
  }
}

// ==================== EXPORT ORDERS ====================

export async function exportOrdersToGoogleSheets(
  orders: AdminOrder[],
  targetSpreadsheetId?: string,
  accessToken?: string
): Promise<SheetsExportResult> {
  let spreadsheetId = targetSpreadsheetId || getLastOrdersSheetId();
  let spreadsheetUrl = '';
  const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (!spreadsheetId) {
    const created = await createGoogleSpreadsheet(
      `Women's Wardrobe - Inbound Orders Ledger (${nowStr})`,
      'Orders',
      accessToken
    );
    spreadsheetId = created.spreadsheetId;
    spreadsheetUrl = created.spreadsheetUrl;
    setLastOrdersSheetId(spreadsheetId);
  } else {
    spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  }

  const headers = [
    'Order ID',
    'Order Date',
    'Customer Name',
    'Customer Phone',
    'Customer Email',
    'Delivery Address',
    'Items Summary',
    'Item Count',
    'Delivery Charge (Rs.)',
    'Total Amount (Rs.)',
    'Payment Channel',
    'Payment Status',
    'Fulfillment Status',
    'Payment Screenshot URL',
    'Registered User ID',
  ];

  const rows = orders.map((order) => {
    const itemsSummary = (order.items || [])
      .map((it) => `${it.productName || 'Item'} [Size: ${it.size || 'Standard'}, Color: ${it.color || 'N/A'}, Qty: ${it.quantity || 1}]`)
      .join(' | ');

    const totalQty = (order.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);

    return [
      order.id,
      order.date,
      order.customerName,
      order.phone,
      order.customerEmail || 'N/A',
      order.address,
      itemsSummary,
      totalQty,
      order.deliveryCharge,
      order.total,
      order.paymentMethod,
      order.paymentStatus || 'Unpaid',
      order.status,
      order.paymentScreenshot || 'None',
      order.userId || 'Guest',
    ];
  });

  // Write headers and rows
  await requestSheetsApi(
    `/${spreadsheetId}/values/Orders!A1?valueInputOption=USER_ENTERED`,
    'PUT',
    {
      values: [headers, ...rows],
    },
    accessToken
  );

  // Apply header styling
  await formatSpreadsheetHeaders(spreadsheetId, headers.length, accessToken);

  return {
    success: true,
    spreadsheetId,
    spreadsheetUrl,
    title: "Women's Wardrobe - Inbound Orders Ledger",
    rowCount: orders.length,
    message: `Successfully synchronized ${orders.length} order(s) to Google Sheets!`,
  };
}

/**
 * Appends a single newly created order to the active Google Sheet in real time.
 */
export async function appendOrderToGoogleSheets(
  order: AdminOrder,
  accessToken?: string
): Promise<boolean> {
  const spreadsheetId = getLastOrdersSheetId();
  if (!spreadsheetId) return false;

  try {
    const itemsSummary = (order.items || [])
      .map((it) => `${it.productName || 'Item'} [${it.size || 'Standard'}, ${it.color || 'N/A'}, x${it.quantity || 1}]`)
      .join(' | ');
    const totalQty = (order.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);

    const row = [
      order.id,
      order.date,
      order.customerName,
      order.phone,
      order.customerEmail || 'N/A',
      order.address,
      itemsSummary,
      totalQty,
      order.deliveryCharge,
      order.total,
      order.paymentMethod,
      order.paymentStatus || 'Unpaid',
      order.status,
      order.paymentScreenshot || 'None',
      order.userId || 'Guest',
    ];

    await requestSheetsApi(
      `/${spreadsheetId}/values/Orders!A:O:append?valueInputOption=USER_ENTERED`,
      'POST',
      {
        values: [row],
      },
      accessToken
    );
    return true;
  } catch (err) {
    console.warn('Real-time order sync to Google Sheets notice:', err);
    return false;
  }
}

/**
 * Automatically checks if auto-sync is enabled and appends newly placed order to Google Sheets.
 */
export async function autoAppendOrderToGoogleSheet(order: AdminOrder): Promise<boolean> {
  if (!getAutoSyncOrdersEnabled()) return false;
  return appendOrderToGoogleSheets(order);
}

// ==================== EXPORT PRODUCTS ====================

export async function exportProductsToGoogleSheets(
  products: Product[],
  targetSpreadsheetId?: string,
  accessToken?: string
): Promise<SheetsExportResult> {
  let spreadsheetId = targetSpreadsheetId || getLastProductsSheetId();
  let spreadsheetUrl = '';
  const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (!spreadsheetId) {
    const created = await createGoogleSpreadsheet(
      `Women's Wardrobe - Product Catalog (${nowStr})`,
      'Catalog',
      accessToken
    );
    spreadsheetId = created.spreadsheetId;
    spreadsheetUrl = created.spreadsheetUrl;
    setLastProductsSheetId(spreadsheetId);
  } else {
    spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  }

  const headers = [
    'Product ID',
    'Product Title',
    'Category',
    'Price (Rs.)',
    'Available Sizes',
    'Available Colors',
    'Rating (1-5)',
    'Reviews Count',
    'Description',
    'Features Bullet Points',
    'Is New Arrival',
    'Is Best Seller',
    'Image URL',
  ];

  const rows = products.map((p) => [
    p.id,
    p.name,
    p.category,
    p.price,
    p.sizes.join(', '),
    p.colors.map((c) => `${c.name} (${c.hex})`).join(', '),
    p.rating,
    p.reviewsCount,
    p.description,
    (p.features || []).join('; '),
    p.isNewArrival ? 'YES' : 'NO',
    p.isBestSeller ? 'YES' : 'NO',
    p.image,
  ]);

  await requestSheetsApi(
    `/${spreadsheetId}/values/Catalog!A1?valueInputOption=USER_ENTERED`,
    'PUT',
    {
      values: [headers, ...rows],
    },
    accessToken
  );

  await formatSpreadsheetHeaders(spreadsheetId, headers.length, accessToken);

  return {
    success: true,
    spreadsheetId,
    spreadsheetUrl,
    title: "Women's Wardrobe - Product Catalog",
    rowCount: products.length,
    message: `Successfully synchronized ${products.length} product(s) to Google Sheets!`,
  };
}

// ==================== EXPORT CUSTOMERS / AUDIT LOGS ====================

export async function exportCustomersToGoogleSheets(
  users: UserProfile[],
  accessToken?: string
): Promise<SheetsExportResult> {
  const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const created = await createGoogleSpreadsheet(
    `Women's Wardrobe - Registered Accounts (${nowStr})`,
    'Customers',
    accessToken
  );

  const headers = ['User UID', 'Full Name', 'Email Address', 'Phone', 'Saved Address', 'Role', 'Status', 'Registered Date'];
  const rows = users.map((u) => [
    u.id,
    u.fullName || 'N/A',
    u.email,
    u.phone || 'N/A',
    u.address || 'N/A',
    u.role,
    u.status,
    u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
  ]);

  await requestSheetsApi(
    `/${created.spreadsheetId}/values/Customers!A1?valueInputOption=USER_ENTERED`,
    'PUT',
    {
      values: [headers, ...rows],
    },
    accessToken
  );

  await formatSpreadsheetHeaders(created.spreadsheetId, headers.length, accessToken);

  return {
    success: true,
    spreadsheetId: created.spreadsheetId,
    spreadsheetUrl: created.spreadsheetUrl,
    title: "Women's Wardrobe - Registered Accounts",
    rowCount: users.length,
    message: `Exported ${users.length} customer accounts to Google Sheets!`,
  };
}

export async function exportAuditLogsToGoogleSheets(
  logs: AuditLogEntry[],
  accessToken?: string
): Promise<SheetsExportResult> {
  const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const created = await createGoogleSpreadsheet(
    `Women's Wardrobe - Security Audit Trail (${nowStr})`,
    'AuditLogs',
    accessToken
  );

  const headers = ['Log ID', 'Timestamp', 'Event Type', 'Operator Email', 'Role', 'Action Description', 'IP / Terminal', 'Status'];
  const rows = logs.map((l) => [
    l.id,
    l.timestamp,
    l.eventType,
    l.userEmail,
    l.role,
    l.description,
    l.ipAddress,
    l.status,
  ]);

  await requestSheetsApi(
    `/${created.spreadsheetId}/values/AuditLogs!A1?valueInputOption=USER_ENTERED`,
    'PUT',
    {
      values: [headers, ...rows],
    },
    accessToken
  );

  await formatSpreadsheetHeaders(created.spreadsheetId, headers.length, accessToken);

  return {
    success: true,
    spreadsheetId: created.spreadsheetId,
    spreadsheetUrl: created.spreadsheetUrl,
    title: "Women's Wardrobe - Security Audit Trail",
    rowCount: logs.length,
    message: `Exported ${logs.length} audit trail records to Google Sheets!`,
  };
}

// ==================== IMPORT FROM GOOGLE SHEETS ====================

export async function importProductsFromGoogleSheets(
  spreadsheetIdOrUrl: string,
  accessToken?: string
): Promise<Product[]> {
  // Extract spreadsheet ID if full URL provided
  let sheetId = spreadsheetIdOrUrl.trim();
  const match = sheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    sheetId = match[1];
  }

  const res = await requestSheetsApi(`/${sheetId}/values/A1:M100`, 'GET', undefined, accessToken);
  const rows: any[][] = res.values || [];

  if (rows.length <= 1) {
    throw new Error('The selected Google Sheet does not contain any product rows.');
  }

  const importedProducts: Product[] = [];
  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[1]) continue; // Name is required

    const id = r[0] || `prod-${Date.now()}-${i}`;
    const name = String(r[1]).trim();
    const category = (r[2] || 'Uncategorized').trim() as any;
    const price = parseInt(String(r[3]).replace(/[^0-9]/g, '')) || 0;
    const sizesStr = String(r[4] || '');
    const sizes = sizesStr ? sizesStr.split(',').map((s) => s.trim()) : ['Standard'];

    // parse colors
    const colorsStr = String(r[5] || '');
    let colors = [{ name: 'Classic Black', hex: '#1A1A1A' }];
    if (colorsStr) {
      const parts = colorsStr.split(',');
      colors = parts.map((part) => {
        const hexMatch = part.match(/\(#([a-fA-F0-9]{6})\)/);
        const hex = hexMatch ? `#${hexMatch[1]}` : '#1A1A1A';
        const colorName = part.replace(/\(#[a-fA-F0-9]{6}\)/, '').trim() || 'Color';
        return { name: colorName, hex };
      });
    }

    const rating = parseFloat(r[6]) || 5;
    const reviewsCount = parseInt(r[7]) || 12;
    const description = String(r[8] || 'Luxury women wardrobe item handcrafted with precision.');
    const featuresStr = String(r[9] || '');
    const features = featuresStr ? featuresStr.split(';').map((f) => f.trim()) : ['High quality fabric', 'Tailored fit'];
    const isNewArrival = String(r[10]).toUpperCase() === 'YES' || String(r[10]).toUpperCase() === 'TRUE';
    const isBestSeller = String(r[11]).toUpperCase() === 'YES' || String(r[11]).toUpperCase() === 'TRUE';
    const image = String(r[12] || 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop');

    importedProducts.push({
      id,
      name,
      category,
      price,
      image,
      description,
      sizes,
      colors,
      rating,
      reviewsCount,
      features,
      isNewArrival,
      isBestSeller,
    });
  }

  return importedProducts;
}
