import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  getDbProducts,
  upsertDbProduct,
  deleteDbProduct,
  getDbOrders,
  insertDbOrder,
  updateDbOrderStatus,
  updateDbOrderPaymentStatus,
  getDbUsers,
  upsertDbUser,
  deleteDbUser,
  getDbPaymentMethods,
  upsertDbPaymentMethod,
  deleteDbPaymentMethod,
  getDbDeliveryConfig,
  saveDbDeliveryConfig,
  getDbAuditLogs,
  insertDbAuditLog,
} from './src/db/queries.ts';
import { ensureDbSchema, isSqlConnected, getSqlDiagnostics } from './src/db/index.ts';

dotenv.config({ quiet: true });

async function startServer() {
  // Ensure tables and schema exist in PostgreSQL
  ensureDbSchema().catch((err) => {
    console.warn('Initial schema setup notice:', err?.message || err);
  });

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '15mb' }));

  // Never cache dynamic API data. This avoids Hostinger/CDN/browser stale catalog responses.
  app.use('/api', (_req: Request, res: Response, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // Lightweight server-sent events channel so all open storefront/admin tabs
  // refresh immediately after database mutations.
  const realtimeClients = new Set<Response>();
  const broadcastUpdate = (type: string) => {
    const payload = `data: ${JSON.stringify({ type, timestamp: Date.now() })}\n\n`;
    for (const client of realtimeClients) {
      try { client.write(payload); } catch { realtimeClients.delete(client); }
    }
  };

  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();
    realtimeClients.add(res);
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

    const heartbeat = setInterval(() => {
      try { res.write(': heartbeat\n\n'); } catch {}
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeat);
      realtimeClients.delete(res);
    });
  });

  // Dedicated Firebase configuration for Google Sheets OAuth.
  // This intentionally does NOT use the old AI-Studio Firebase project bundled in the original app.
  // It targets the user's own Firebase project: womenwardrobe-71b06.
  let cachedGoogleFirebaseConfig: any | null = null;

  async function resolveGoogleFirebaseConfig() {
    if (cachedGoogleFirebaseConfig?.apiKey) return cachedGoogleFirebaseConfig;

    const projectId = process.env.FIREBASE_PROJECT_ID || 'womenwardrobe-71b06';
    const authDomain = process.env.FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`;
    const envApiKey = process.env.FIREBASE_WEB_API_KEY || process.env.GOOGLE_FIREBASE_API_KEY || '';

    if (envApiKey) {
      cachedGoogleFirebaseConfig = {
        apiKey: envApiKey,
        authDomain,
        projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || undefined,
        appId: process.env.FIREBASE_APP_ID || undefined,
        configured: true,
        source: 'hostinger-environment',
      };
      return cachedGoogleFirebaseConfig;
    }

    // Firebase Hosting exposes the web config publicly at this reserved endpoint.
    // Try both default Firebase hosting domains automatically so most deployments need no extra key entry.
    const configUrls = [
      `https://${projectId}.firebaseapp.com/__/firebase/init.json`,
      `https://${projectId}.web.app/__/firebase/init.json`,
    ];

    for (const url of configUrls) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6500);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!response.ok) continue;
        const remote = await response.json() as any;
        if (remote?.apiKey) {
          cachedGoogleFirebaseConfig = {
            apiKey: remote.apiKey,
            authDomain: remote.authDomain || authDomain,
            projectId: remote.projectId || projectId,
            storageBucket: remote.storageBucket,
            messagingSenderId: remote.messagingSenderId,
            appId: remote.appId,
            configured: true,
            source: 'firebase-hosting-init',
          };
          return cachedGoogleFirebaseConfig;
        }
      } catch {
        // Try the next source.
      }
    }

    return {
      apiKey: '',
      authDomain,
      projectId,
      configured: false,
      source: 'missing-api-key',
      message: 'Firebase project womenwardrobe-71b06 is selected, but its Web API Key could not be discovered automatically. Add FIREBASE_WEB_API_KEY in Hostinger Environment variables, then redeploy.',
    };
  }

  app.get('/api/google-auth-config', async (_req: Request, res: Response) => {
    const config = await resolveGoogleFirebaseConfig();
    if (!config.apiKey) {
      return res.status(503).json(config);
    }
    res.json(config);
  });

  // Health check reports the actual PostgreSQL/Supabase connection state.
  app.get('/api/health', async (_req: Request, res: Response) => {
    const connected = await isSqlConnected();
    const diagnostics = getSqlDiagnostics();
    res.json({
      status: 'ok',
      database: connected ? 'postgresql-connected' : 'database-fallback',
      databaseConfig: diagnostics.source,
      databaseErrorCode: connected ? null : diagnostics.lastErrorCode,
      timestamp: new Date().toISOString()
    });
  });

  // ==================== PRODUCTS ====================
  app.get('/api/products', async (_req: Request, res: Response) => {
    try {
      const products = await getDbProducts();
      res.json(products);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch products' });
    }
  });

  app.post('/api/products', async (req: Request, res: Response) => {
    try {
      const product = req.body;
      if (!product || !product.id || !product.name) {
        return res.status(400).json({ error: 'Invalid product data' });
      }
      await upsertDbProduct(product);
      broadcastUpdate('products');
      res.json({ success: true, product });
    } catch (error: any) {
      console.error('Error saving product:', error);
      res.status(500).json({ error: error.message || 'Failed to save product' });
    }
  });

  app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await deleteDbProduct(id);
      broadcastUpdate('products');
      res.json({ success: true, deletedId: id });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: error.message || 'Failed to delete product' });
    }
  });

  // ==================== ORDERS ====================
  app.get('/api/orders', async (_req: Request, res: Response) => {
    try {
      const orders = await getDbOrders();
      res.json(orders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch orders' });
    }
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      const order = req.body;
      if (!order || !order.id || !order.customerName) {
        return res.status(400).json({ error: 'Invalid order data' });
      }
      await insertDbOrder(order);
      broadcastUpdate('orders');
      res.json({ success: true, order });
    } catch (error: any) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: error.message || 'Failed to create order' });
    }
  });

  app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      await updateDbOrderStatus(id, status);
      broadcastUpdate('orders');
      res.json({ success: true, id, status });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: error.message || 'Failed to update order status' });
    }
  });

  app.patch('/api/orders/:id/payment-status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { paymentStatus } = req.body;
      if (!paymentStatus) {
        return res.status(400).json({ error: 'Payment status is required' });
      }
      await updateDbOrderPaymentStatus(id, paymentStatus);
      broadcastUpdate('orders');
      res.json({ success: true, id, paymentStatus });
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ error: error.message || 'Failed to update payment status' });
    }
  });

  // ==================== USERS ====================
  app.get('/api/users', async (_req: Request, res: Response) => {
    try {
      const users = await getDbUsers();
      res.json(users);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch users' });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const user = req.body;
      if (!user || !user.id || !user.email) {
        return res.status(400).json({ error: 'Invalid user data' });
      }
      await upsertDbUser(user);
      broadcastUpdate('users');
      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Error saving user:', error);
      res.status(500).json({ error: error.message || 'Failed to save user' });
    }
  });

  app.delete('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await deleteDbUser(id);
      broadcastUpdate('users');
      res.json({ success: true, deletedId: id });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: error.message || 'Failed to delete user' });
    }
  });

  // ==================== PAYMENT METHODS ====================
  app.get('/api/payment-methods', async (_req: Request, res: Response) => {
    try {
      const pms = await getDbPaymentMethods();
      res.json(pms);
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch payment methods' });
    }
  });

  app.post('/api/payment-methods', async (req: Request, res: Response) => {
    try {
      const pm = req.body;
      if (!pm || !pm.id || !pm.name) {
        return res.status(400).json({ error: 'Invalid payment method data' });
      }
      await upsertDbPaymentMethod(pm);
      broadcastUpdate('paymentMethods');
      res.json({ success: true, paymentMethod: pm });
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      res.status(500).json({ error: error.message || 'Failed to save payment method' });
    }
  });

  app.delete('/api/payment-methods/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await deleteDbPaymentMethod(id);
      broadcastUpdate('paymentMethods');
      res.json({ success: true, deletedId: id });
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      res.status(500).json({ error: error.message || 'Failed to delete payment method' });
    }
  });

  // ==================== DELIVERY CONFIG ====================
  app.get('/api/delivery-config', async (_req: Request, res: Response) => {
    try {
      const config = await getDbDeliveryConfig();
      res.json(config);
    } catch (error: any) {
      console.error('Error fetching delivery config:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch delivery config' });
    }
  });

  app.post('/api/delivery-config', async (req: Request, res: Response) => {
    try {
      const config = req.body;
      await saveDbDeliveryConfig(config);
      broadcastUpdate('deliveryConfig');
      res.json({ success: true, config });
    } catch (error: any) {
      console.error('Error saving delivery config:', error);
      res.status(500).json({ error: error.message || 'Failed to save delivery config' });
    }
  });

  // ==================== AUDIT LOGS ====================
  app.get('/api/audit-logs', async (_req: Request, res: Response) => {
    try {
      const logs = await getDbAuditLogs();
      res.json(logs);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch audit logs' });
    }
  });

  app.post('/api/audit-logs', async (req: Request, res: Response) => {
    try {
      const log = req.body;
      if (!log || !log.id) {
        return res.status(400).json({ error: 'Invalid audit log data' });
      }
      await insertDbAuditLog(log);
      broadcastUpdate('auditLogs');
      res.json({ success: true, log });
    } catch (error: any) {
      console.error('Error saving audit log:', error);
      res.status(500).json({ error: error.message || 'Failed to save audit log' });
    }
  });

  // ==================== SEED DATA ====================
  app.post('/api/seed', async (req: Request, res: Response) => {
    try {
      const { products: prods, users: usrs, paymentMethods: pms, deliveryConfig: dlv, auditLogs: logs } = req.body;

      if (Array.isArray(prods)) {
        for (const p of prods) {
          await upsertDbProduct(p);
        }
      }
      if (Array.isArray(usrs)) {
        for (const u of usrs) {
          await upsertDbUser(u);
        }
      }
      if (Array.isArray(pms)) {
        for (const pm of pms) {
          await upsertDbPaymentMethod(pm);
        }
      }
      if (dlv) {
        await saveDbDeliveryConfig(dlv);
      }
      if (Array.isArray(logs)) {
        for (const l of logs) {
          await insertDbAuditLog(l);
        }
      }
      res.json({ success: true, message: 'Database seeded successfully' });
    } catch (error: any) {
      console.error('Error seeding database:', error);
      res.status(500).json({ error: error.message || 'Failed to seed database' });
    }
  });

  // ==================== VITE MIDDLEWARE / STATIC ====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
