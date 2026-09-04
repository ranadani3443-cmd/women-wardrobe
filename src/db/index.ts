import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import fs from 'fs';
import * as schema from './schema.ts';

const { Pool } = pg;

declare global {
  var _postgresPool: pg.Pool | undefined;
  var _schemaInitialized: boolean | undefined;
  var _sqlAvailable: boolean | undefined;
  var _sqlLastFailureAt: number | undefined;
  var _sqlLastErrorCode: string | undefined;
  var _sqlLastErrorMessage: string | undefined;
  var _sqlConfigSource: string | undefined;
}

function resolveSqlHost(): string | undefined {
  const host = (process.env.SQL_HOST || process.env.PGHOST || '').trim();
  if (!host) return undefined;

  if (host.startsWith('/')) {
    try {
      if (!fs.existsSync(host)) {
        console.warn(`[database] SQL socket path is unavailable: ${host}`);
        return undefined;
      }
    } catch {
      return undefined;
    }
  }
  return host;
}

function isLocalHost(host?: string): boolean {
  if (!host) return false;
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.startsWith('/');
}

function sslForHost(host?: string): false | { rejectUnauthorized: false } {
  const explicit = String(process.env.SQL_SSL || process.env.PGSSLMODE || '').toLowerCase().trim();
  if (['0', 'false', 'disable', 'disabled', 'off'].includes(explicit)) return false;
  if (['1', 'true', 'require', 'required', 'on', 'prefer'].includes(explicit)) {
    return { rejectUnauthorized: false };
  }

  // Supabase / remote PostgreSQL should use TLS. Local development can remain plain.
  return isLocalHost(host) ? false : { rejectUnauthorized: false };
}

function setDbError(err: any) {
  global._sqlAvailable = false;
  global._sqlLastFailureAt = Date.now();
  global._sqlLastErrorCode = String(err?.code || err?.name || 'DB_CONNECTION_ERROR');
  global._sqlLastErrorMessage = String(err?.message || err || 'Unknown database error').slice(0, 300);

  // Safe runtime diagnostic: no host/user/password values are printed.
  console.error(`[database] connection failed (${global._sqlLastErrorCode}): ${global._sqlLastErrorMessage}`);
}

function clearDbError() {
  global._sqlAvailable = true;
  global._sqlLastFailureAt = undefined;
  global._sqlLastErrorCode = undefined;
  global._sqlLastErrorMessage = undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = (
      process.env.DATABASE_URL ||
      process.env.SUPABASE_DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      ''
    ).trim();

    const validHost = resolveSqlHost();
    const hasHostingerSql = !!(
      validHost ||
      process.env.SQL_PORT ||
      process.env.SQL_USER ||
      process.env.SQL_PASSWORD ||
      process.env.SQL_DB_NAME
    );

    // Prefer Hostinger's automatically managed SQL_* variables whenever they exist.
    // This prevents an old/manual DATABASE_URL from overriding the Hostinger-Supabase integration.
    if (hasHostingerSql) {
      const sqlHost = validHost || '127.0.0.1';
      const ssl = sslForHost(sqlHost);

      global._sqlConfigSource = 'SQL_*';
      global._postgresPool = new Pool({
        host: sqlHost,
        user: process.env.SQL_USER || process.env.SQL_ADMIN_USER || process.env.PGUSER || 'postgres',
        password: process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD || process.env.PGPASSWORD || '',
        database: process.env.SQL_DB_NAME || process.env.PGDATABASE || 'postgres',
        port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : (process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432),
        ssl: ssl || undefined,
        max: 8,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        keepAlive: true,
        application_name: 'women-wardrobe-hostinger',
      });
    } else if (connectionString) {
      let parsedHost: string | undefined;
      let useSsl: false | { rejectUnauthorized: false } = { rejectUnauthorized: false };
      try {
        const parsed = new URL(connectionString);
        parsedHost = parsed.hostname;
        const sslMode = String(parsed.searchParams.get('sslmode') || '').toLowerCase();
        if (sslMode === 'disable' || isLocalHost(parsedHost)) useSsl = false;
      } catch {
        // Keep secure remote default when parsing fails.
      }

      global._sqlConfigSource = 'DATABASE_URL';
      global._postgresPool = new Pool({
        connectionString,
        ssl: useSsl || undefined,
        max: 8,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        keepAlive: true,
        application_name: 'women-wardrobe-hostinger',
      });
    } else {
      global._sqlConfigSource = 'none';
      global._sqlAvailable = false;
      global._sqlLastErrorCode = 'DB_CONFIG_MISSING';
      global._sqlLastErrorMessage = 'No PostgreSQL environment variables were detected.';

      global._postgresPool = new Pool({
        host: '127.0.0.1',
        user: 'postgres',
        password: '',
        database: 'postgres',
        port: 5432,
        max: 1,
        connectionTimeoutMillis: 1000,
      });
    }

    global._postgresPool.on('error', (err: Error & { code?: string }) => {
      setDbError(err);
    });
  }
  return global._postgresPool;
};

export const pool = createPool();
export const db = drizzle(pool, { schema });

export function getSqlDiagnostics() {
  return {
    source: global._sqlConfigSource || 'unknown',
    configured: global._sqlConfigSource !== 'none',
    lastErrorCode: global._sqlLastErrorCode || null,
  };
}

export async function isSqlConnected(): Promise<boolean> {
  // Avoid hammering the same failed endpoint multiple times per second.
  if (global._sqlAvailable === false && global._sqlLastFailureAt && Date.now() - global._sqlLastFailureAt < 3000) {
    return false;
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      clearDbError();
      return true;
    } finally {
      client.release();
    }
  } catch (err: any) {
    setDbError(err);
    return false;
  }
}

export async function ensureDbSchema(): Promise<void> {
  if (global._schemaInitialized) return;

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

        -- Seed the original SuperAdmin only if that email does not already exist.
        INSERT INTO users (
          uid, email, full_name, phone, address, role, status, password_hash, created_at, updated_at
        )
        SELECT
          'usr-1',
          'womenwordrobe873@gmail.com',
          'Adil Naseer',
          '03422939080',
          'Executive Suite Office 12, Gulberg III, Lahore',
          'SuperAdmin',
          'Active',
          'Adilnaseer786.',
          NOW(),
          NOW()
        WHERE NOT EXISTS (
          SELECT 1 FROM users WHERE LOWER(email) = LOWER('womenwordrobe873@gmail.com')
        );
      `);

      global._schemaInitialized = true;
      clearDbError();
      console.info(`[database] PostgreSQL connected using ${global._sqlConfigSource || 'unknown'} configuration; schema is ready.`);
    } finally {
      client.release();
    }
  } catch (err: any) {
    setDbError(err);
    throw err;
  }
}
