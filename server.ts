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
  getDbPaymentMethods,
  upsertDbPaymentMethod,
  deleteDbPaymentMethod,
  getDbDeliveryConfig,
  saveDbDeliveryConfig,
  getDbAuditLogs,
  insertDbAuditLog,
} from './src/db/queries.ts';
import { ensureDbSchema } from './src/db/index.ts';

dotenv.config();

async function startServer() {
  // Ensure tables and schema exist in PostgreSQL
  ensureDbSchema().catch((err) => {
    console.warn('Initial schema setup notice:', err?.message || err);
  });

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', database: 'cloudsql-postgresql', timestamp: new Date().toISOString() });
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
      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Error saving user:', error);
      res.status(500).json({ error: error.message || 'Failed to save user' });
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
