import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import fs from 'fs';
import * as schema from './schema.ts';

const { Pool } = pg;

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: pg.Pool | undefined;
  var _schemaInitialized: boolean | undefined;
  var _sqlAvailable: boolean | undefined;
}

function resolveSqlHost(): string | undefined {
  const host = process.env.SQL_HOST;
  if (!host) return undefined;
  
  // If host is a UNIX socket path, verify that the directory or socket exists
  if (host.startsWith('/')) {
    try {
      if (!fs.existsSync(host)) {
        console.info(`Cloud SQL socket path ${host} is not present in container. Using fallback data store.`);
        return undefined;
      }
    } catch {
      return undefined;
    }
  }
  return host;
}

// Function to create or retrieve the connection pool.
export const createPool = () => {
  if (!global._postgresPool) {
    const validHost = resolveSqlHost();
    
    if (!validHost && !process.env.SQL_PORT) {
      // No reachable SQL configuration detected
      global._sqlAvailable = false;
    }

    global._postgresPool = new Pool({
      host: validHost || '127.0.0.1',
      user: process.env.SQL_USER || process.env.SQL_ADMIN_USER || 'ai_studio_admin',
      password: process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD || '',
      database: process.env.SQL_DB_NAME || 'womens_wardrobe',
      port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432,
      max: 10,
      connectionTimeoutMillis: 3000,
    });

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err: Error) => {
      global._sqlAvailable = false;
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance.
export const pool = createPool();

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });

/**
 * Checks if the SQL connection is operational.
 */
export async function isSqlConnected(): Promise<boolean> {
  if (global._sqlAvailable === false) return false;
  try {
    const client = await pool.connect();
    client.release();
    global._sqlAvailable = true;
    return true;
  } catch {
    global._sqlAvailable = false;
    return false;
  }
}

/**
 * Ensures all required PostgreSQL tables and constraints exist.
 * This runs automatically on server start to guarantee zero missing table errors.
 */
export async function ensureDbSchema(): Promise<void> {
  if (global._schemaInitialized) return;
  if (global._sqlAvailable === false) return;

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          price INTEGER NOT NULL,
          image TEXT NOT NULL,
          description TEXT NOT NULL,
          sizes TEXT NOT NULL,
          colors TEXT NOT NULL,
          rating DOUBLE PRECISION DEFAULT 5.0,
          reviews_count INTEGER DEFAULT 0,
          features TEXT NOT NULL,
          is_new_arrival BOOLEAN DEFAULT FALSE,
          is_best_seller BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          uid TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL,
          full_name TEXT DEFAULT '',
          phone TEXT DEFAULT '',
          address TEXT DEFAULT '',
          role TEXT NOT NULL DEFAULT 'Customer',
          status TEXT NOT NULL DEFAULT 'Active',
          password_hash TEXT DEFAULT '',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          customer_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          address TEXT NOT NULL,
          payment_method TEXT NOT NULL,
          delivery_charge INTEGER NOT NULL DEFAULT 0,
          total INTEGER NOT NULL DEFAULT 0,
          date TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'Pending',
          items TEXT NOT NULL,
          payment_screenshot TEXT,
          payment_status TEXT DEFAULT 'Unpaid',
          customer_email TEXT,
          user_id TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS payment_methods (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          account_number TEXT NOT NULL,
          account_title TEXT,
          icon TEXT,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS delivery_config (
          id TEXT PRIMARY KEY DEFAULT 'default',
          is_free BOOLEAN NOT NULL DEFAULT FALSE,
          amount INTEGER NOT NULL DEFAULT 250,
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          timestamp TEXT NOT NULL,
          event_type TEXT NOT NULL,
          user_id TEXT NOT NULL,
          user_email TEXT NOT NULL,
          role TEXT NOT NULL,
          description TEXT NOT NULL,
          ip_address TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'Success',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      global._schemaInitialized = true;
      global._sqlAvailable = true;
    } finally {
      client.release();
    }
  } catch (err: any) {
    global._sqlAvailable = false;
  }
}


