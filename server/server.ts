import express from 'express';
import { join } from 'node:path';
import pool from './db.js';
import { bootstrap } from './bootstrap.js';

const app = express();
app.use(express.json({ limit: '5mb' }));

// Log simples pra debug de conexão resetada pelo Caddy
app.use((req, _res, next) => {
  console.log(`[req] ${req.method} ${req.path}`);
  next();
});

// CORS simples (front no mesmo host via Caddy, mas libera testes locais)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ---- HEALTH ----
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'up', uptime: process.uptime() });
  } catch (err: any) {
    res.status(503).json({ ok: false, db: 'down', error: err.message });
  }
});

// ---- SETTINGS ----
app.get('/api/settings', async (_req, res) => {
  const { rows } = await pool.query('SELECT value FROM settings WHERE key=$1', ['main_settings']);
  res.json(rows[0]?.value ?? null);
});

app.put('/api/settings', async (req, res) => {
  const value = req.body;
  await pool.query(
    `INSERT INTO settings (key, value, updated_at)
     VALUES ('main_settings', $1::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value=$1::jsonb, updated_at=now()`,
    [JSON.stringify(value)]
  );
  res.json({ ok: true });
});

// ---- CATEGORIES ----
app.get('/api/categories', async (_req, res) => {
  const { rows } = await pool.query('SELECT id, name, icon_name AS "iconName", color, description FROM categories ORDER BY id');
  res.json(rows);
});

app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, iconName, color, description } = req.body;
  await pool.query(
    `INSERT INTO categories (id, name, icon_name, color, description, updated_at)
     VALUES ($1,$2,$3,$4,$5,now())
     ON CONFLICT (id) DO UPDATE SET name=$2, icon_name=$3, color=$4, description=$5, updated_at=now()`,
    [id, name, iconName, color, description || null]
  );
  res.json({ ok: true });
});

// ---- SERVICES ----
app.get('/api/services', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, category, duration_minutes AS "durationMinutes",
            price::float8 AS price, cost_price::float8 AS "costPrice",
            commission_rate::float8 AS "commissionRate",
            description, image_url AS "imageUrl", active, display_order AS "order"
     FROM services ORDER BY display_order ASC, id ASC`
  );
  res.json(rows);
});

app.put('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  const s = req.body;
  await pool.query(
    `INSERT INTO services
      (id, name, category, duration_minutes, price, cost_price, commission_rate, description, image_url, active, display_order, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now())
     ON CONFLICT (id) DO UPDATE SET
       name=$2, category=$3, duration_minutes=$4, price=$5, cost_price=$6, commission_rate=$7,
       description=$8, image_url=$9, active=$10, display_order=$11, updated_at=now()`,
    [
      id, s.name, s.category, s.durationMinutes, s.price, s.costPrice,
      s.commissionRate ?? null, s.description ?? '', s.imageUrl ?? null,
      s.active ?? true, s.order ?? 0,
    ]
  );
  res.json({ ok: true });
});

app.delete('/api/services/:id', async (req, res) => {
  await pool.query('DELETE FROM services WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

// ---- APPOINTMENTS ----
app.get('/api/appointments', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, client_name AS "clientName", client_phone AS "clientPhone",
            client_email AS "clientEmail", services,
            total_price::float8 AS "totalPrice", total_cost::float8 AS "totalCost",
            total_duration AS "totalDuration",
            to_char(date, 'YYYY-MM-DD') AS date,
            "time_slot" AS "timeSlot", end_time_slot AS "endTimeSlot",
            status, payment_status AS "paymentStatus",
            payment_method AS "paymentMethod", notes,
            created_at AS "createdAt", completed_at AS "completedAt", source
     FROM appointments ORDER BY date ASC, "time_slot" ASC`
  );
  res.json(rows);
});

app.put('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const a = req.body;
  await pool.query(
    `INSERT INTO appointments
      (id, client_name, client_phone, client_email, services, total_price, total_cost, total_duration,
       date, "time_slot", end_time_slot, status, payment_status, payment_method, notes,
       created_at, completed_at, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     ON CONFLICT (id) DO UPDATE SET
       client_name=$2, client_phone=$3, client_email=$4, services=$5,
       total_price=$6, total_cost=$7, total_duration=$8,
       date=$9, "time_slot"=$10, end_time_slot=$11,
       status=$12, payment_status=$13, payment_method=$14, notes=$15,
       completed_at=$17, source=$18`,
    [
      id, a.clientName, a.clientPhone, a.clientEmail || null,
      JSON.stringify(a.services), a.totalPrice, a.totalCost, a.totalDuration,
      a.date, a.timeSlot, a.endTimeSlot || null,
      a.status, a.paymentStatus, a.paymentMethod || null, a.notes || null,
      a.createdAt, a.completedAt || null, a.source,
    ]
  );
  res.json({ ok: true });
});

app.delete('/api/appointments/:id', async (req, res) => {
  await pool.query('DELETE FROM appointments WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

// ---- TRANSACTIONS ----
app.get('/api/transactions', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, appointment_id AS "appointmentId", type, category, description,
            amount::float8 AS amount, cost_amount::float8 AS "costAmount",
            to_char(date, 'YYYY-MM-DD') AS date,
            payment_method AS "paymentMethod", status, client_name AS "clientName",
            created_at AS "createdAt"
     FROM transactions ORDER BY date DESC, created_at DESC`
  );
  res.json(rows);
});

app.put('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const t = req.body;
  await pool.query(
    `INSERT INTO transactions
      (id, appointment_id, type, category, description, amount, cost_amount,
       date, payment_method, status, client_name, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (id) DO UPDATE SET
       appointment_id=$2, type=$3, category=$4, description=$5, amount=$6, cost_amount=$7,
       date=$8, payment_method=$9, status=$10, client_name=$11`,
    [
      id, t.appointmentId || null, t.type, t.category, t.description,
      t.amount, t.costAmount || null, t.date, t.paymentMethod, t.status,
      t.clientName || null, t.createdAt,
    ]
  );
  res.json({ ok: true });
});

app.delete('/api/transactions/:id', async (req, res) => {
  await pool.query('DELETE FROM transactions WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

// ---- CLIENTS ----
app.get('/api/clients', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, phone, email, notes,
            total_visits AS "totalVisits",
            total_spent::float8 AS "totalSpent",
            to_char(last_visit, 'YYYY-MM-DD') AS "lastVisit",
            created_at AS "createdAt"
     FROM clients ORDER BY name ASC`
  );
  res.json(rows);
});

app.put('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  const c = req.body;
  await pool.query(
    `INSERT INTO clients (id, name, phone, email, notes, total_visits, total_spent, last_visit, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (id) DO UPDATE SET
       name=$2, phone=$3, email=$4, notes=$5,
       total_visits=$6, total_spent=$7, last_visit=$8`,
    [
      id, c.name, c.phone, c.email || null, c.notes || null,
      c.totalVisits ?? 0, c.totalSpent ?? 0, c.lastVisit || null, c.createdAt,
    ]
  );
  res.json({ ok: true });
});

app.delete('/api/clients/:id', async (req, res) => {
  await pool.query('DELETE FROM clients WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

// ---- FRONTEND (static) ----
const distDir = join(process.cwd(), 'dist');
console.log('[salao-jane] servindo dist de', distDir);
app.use(express.static(distDir, { maxAge: '1h' }));
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(join(distDir, 'index.html'), (err) => {
    if (err) next(err);
  });
});

// ---- START ----
const PORT = parseInt(process.env.PORT || '3001', 10);

bootstrap()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[salao-jane] API+frontend ouvindo em :${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[salao-jane] bootstrap falhou:', err);
    process.exit(1);
  });
