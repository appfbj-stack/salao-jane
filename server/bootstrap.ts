// Bootstrap: cria schema e popula dados iniciais (idempotente)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import pool from './db.js';
import {
  DEFAULT_CATEGORIES,
  INITIAL_SERVICES,
  INITIAL_SETTINGS,
  INITIAL_APPOINTMENTS,
  INITIAL_TRANSACTIONS,
} from './seed-data.js';

const schemaPath = join(__dirname, 'schema.sql');

let bootstrapped = false;

export async function bootstrap(): Promise<void> {
  if (bootstrapped) return;
  bootstrapped = true;

  console.log('[bootstrap] aplicando schema...');
  const schema = readFileSync(schemaPath, 'utf-8');
  await pool.query(schema);

  console.log('[bootstrap] verificando dados iniciais...');
  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM services');
  const servicesCount = parseInt(rows[0]?.count || '0', 10);

  if (servicesCount === 0) {
    console.log('[bootstrap] populando dados iniciais...');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const c of DEFAULT_CATEGORIES) {
        await client.query(
          `INSERT INTO categories (id, name, icon_name, color, description)
           VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
          [c.id, c.name, c.iconName, c.color, c.description || null]
        );
      }

      for (const s of INITIAL_SERVICES) {
        await client.query(
          `INSERT INTO services
            (id, name, category, duration_minutes, price, cost_price, description, image_url, active, display_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           ON CONFLICT (id) DO NOTHING`,
          [s.id, s.name, s.category, s.durationMinutes, s.price, s.costPrice, s.description, s.imageUrl || null, s.active, s.order]
        );
      }

      for (const a of INITIAL_APPOINTMENTS) {
        await client.query(
          `INSERT INTO appointments
            (id, client_name, client_phone, client_email, services, total_price, total_cost, total_duration,
             date, time_slot, end_time_slot, status, payment_status, payment_method, notes, created_at, completed_at, source)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
           ON CONFLICT (id) DO NOTHING`,
          [
            a.id, a.clientName, a.clientPhone, a.clientEmail || null,
            JSON.stringify(a.services), a.totalPrice, a.totalCost, a.totalDuration,
            a.date, a.timeSlot, a.endTimeSlot || null, a.status, a.paymentStatus,
            a.paymentMethod || null, a.notes || null, a.createdAt, a.completedAt || null, a.source,
          ]
        );
      }

      for (const t of INITIAL_TRANSACTIONS) {
        await client.query(
          `INSERT INTO transactions
            (id, appointment_id, type, category, description, amount, cost_amount, date, payment_method, status, client_name, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
           ON CONFLICT (id) DO NOTHING`,
          [
            t.id, t.appointmentId || null, t.type, t.category, t.description,
            t.amount, t.costAmount || null, t.date, t.paymentMethod, t.status, t.clientName || null, t.createdAt,
          ]
        );
      }

      await client.query(
        `INSERT INTO settings (key, value) VALUES ('main_settings', $1::jsonb) ON CONFLICT (key) DO NOTHING`,
        [JSON.stringify(INITIAL_SETTINGS)]
      );

      await client.query('COMMIT');
      console.log('[bootstrap] dados iniciais inseridos.');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    console.log(`[bootstrap] ${servicesCount} serviços já existem, pulando seed.`);
  }
}
