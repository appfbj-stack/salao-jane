import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST || 'kairos-shared-pg',
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE || 'salao_jane_db',
  user: process.env.PGUSER || 'salao_jane_user',
  password: process.env.PGPASSWORD || '',
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('[pg] pool error:', err.message);
});

export default pool;
