import { createRequire as __cr } from 'node:module';
import { fileURLToPath as __ftp } from 'node:url';
import { dirname as __dn } from 'node:path';
const require = __cr(import.meta.url);
const __filename = __ftp(import.meta.url);
const __dirname = __dn(__filename);

// server/server.ts
import express from "express";
import { fileURLToPath as fileURLToPath2 } from "node:url";
import { dirname as dirname2, join as join2 } from "node:path";

// server/db.ts
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
var pool = new Pool({
  host: process.env.PGHOST || "kairos-shared-pg",
  port: parseInt(process.env.PGPORT || "5432", 10),
  database: process.env.PGDATABASE || "salao_jane_db",
  user: process.env.PGUSER || "salao_jane_user",
  password: process.env.PGPASSWORD || "",
  max: 10,
  idleTimeoutMillis: 3e4,
  connectionTimeoutMillis: 5e3
});
pool.on("error", (err) => {
  console.error("[pg] pool error:", err.message);
});
var db_default = pool;

// server/bootstrap.ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// server/seed-data.ts
var DEFAULT_CATEGORIES = [
  { id: "cabelo", name: "Cabelo", iconName: "Scissors", color: "from-amber-500 to-rose-500", description: "Cortes, escovas, hidrata\xE7\xE3o, mechas e qu\xEDmicas." },
  { id: "unhas", name: "Unhas", iconName: "Sparkles", color: "from-pink-500 to-rose-600", description: "Manicure, pedicure, alongamento em gel e blindagem." },
  { id: "sobrancelhas", name: "Sobrancelhas & C\xEDlios", iconName: "Eye", color: "from-purple-500 to-indigo-600", description: "Design personalizado, henna, micropigmenta\xE7\xE3o e lash lifting." },
  { id: "estetica", name: "Est\xE9tica Facial & Corporal", iconName: "Smile", color: "from-emerald-500 to-teal-600", description: "Limpeza de pele, drenagem, massagens e tratamentos." },
  { id: "depilacao", name: "Depila\xE7\xE3o", iconName: "Flame", color: "from-orange-500 to-amber-600", description: "Depila\xE7\xE3o cera morna, eg\xEDpcia e laser." },
  { id: "maquiagem", name: "Maquiagem & Noivas", iconName: "Palette", color: "from-fuchsia-500 to-pink-600", description: "Produ\xE7\xF5es para eventos, formaturas e ensaios." }
];
var INITIAL_SERVICES = [
  { id: "srv_corte_fem", name: "Corte Feminino + Escova Modelada", category: "cabelo", durationMinutes: 60, price: 90, costPrice: 12, description: "Lavagem especial, corte personalizado, finaliza\xE7\xE3o com escova e reparador.", imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80", active: true, order: 1 },
  { id: "srv_corte_masc", name: "Corte Masculino & Barba Terapia", category: "cabelo", durationMinutes: 45, price: 65, costPrice: 8, description: "Corte tesoura/m\xE1quina com toalha quente e alinhamento de barba.", imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80", active: true, order: 2 },
  { id: "srv_hidratacao", name: "Hidrata\xE7\xE3o Profunda & Cronograma", category: "cabelo", durationMinutes: 50, price: 110, costPrice: 25, description: "Tratamento intensivo de reposi\xE7\xE3o h\xEDdrica e lip\xEDdica com marcas premium.", imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80", active: true, order: 3 },
  { id: "srv_mechas", name: "Mechas / Morena Iluminada", category: "cabelo", durationMinutes: 180, price: 350, costPrice: 75, description: "T\xE9cnica personalizada de ilumina\xE7\xE3o com tonaliza\xE7\xE3o e tratamento reconstrutor.", imageUrl: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80", active: true, order: 4 },
  { id: "srv_manicure_pedicure", name: "P\xE9 & M\xE3o Completo (Tradicional)", category: "unhas", durationMinutes: 60, price: 65, costPrice: 7, description: "Cutilagem funda e delicada, esmalta\xE7\xE3o duradoura e hidrata\xE7\xE3o das cut\xEDculas.", imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80", active: true, order: 5 },
  { id: "srv_alongamento_gel", name: "Alongamento em Gel / Fibra de Vidro", category: "unhas", durationMinutes: 120, price: 160, costPrice: 30, description: "Alongamento resistente com formato natural, ponto de tens\xE3o e cutilagem russa.", imageUrl: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80", active: true, order: 6 },
  { id: "srv_spa_pes", name: "Spa dos P\xE9s Relaxante", category: "unhas", durationMinutes: 45, price: 75, costPrice: 15, description: "Higieniza\xE7\xE3o, esfolia\xE7\xE3o com sais minerais, massagem podal e parafina t\xE9rmica.", imageUrl: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=600&q=80", active: true, order: 7 },
  { id: "srv_design_sobrancelha", name: "Design de Sobrancelhas com Henna", category: "sobrancelhas", durationMinutes: 40, price: 55, costPrice: 5, description: "Mapeamento facial sim\xE9trico, limpeza precisa e aplica\xE7\xE3o de henna org\xE2nica.", imageUrl: "https://images.unsplash.com/photo-1597225244660-1cd128c64284?auto=format&fit=crop&w=600&q=80", active: true, order: 8 },
  { id: "srv_lash_lifting", name: "Lash Lifting & Tintura de C\xEDlios", category: "sobrancelhas", durationMinutes: 60, price: 120, costPrice: 20, description: "Curvatura e nutri\xE7\xE3o dos fios naturais dos c\xEDlios, proporcionando efeito r\xEDmel por at\xE9 6 semanas.", imageUrl: "https://images.unsplash.com/photo-1583001809873-a128495da465?auto=format&fit=crop&w=600&q=80", active: true, order: 9 },
  { id: "srv_micro_sobrancelha", name: "Micropigmenta\xE7\xE3o Shadow / Fio a Fio", category: "sobrancelhas", durationMinutes: 120, price: 380, costPrice: 50, description: "Preenchimento semipermanente ultra realista com anest\xE9sico t\xF3pico e pigmentos de alta fixa\xE7\xE3o.", imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80", active: true, order: 10 },
  { id: "srv_limpeza_pele", name: "Limpeza de Pele Profunda com Oz\xF4nio", category: "estetica", durationMinutes: 80, price: 140, costPrice: 25, description: "Vapor de oz\xF4nio, extra\xE7\xE3o sem dor, alta frequ\xEAncia, m\xE1scara calmante e fototerapia LED.", imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80", active: true, order: 11 },
  { id: "srv_drenagem_linfatica", name: "Drenagem Linf\xE1tica / Massagem Modeladora", category: "estetica", durationMinutes: 60, price: 110, costPrice: 10, description: "Redu\xE7\xE3o de reten\xE7\xE3o de l\xEDquidos, desincha\xE7o e ativa\xE7\xE3o da circula\xE7\xE3o corporal.", imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80", active: true, order: 12 },
  { id: "srv_massagem_relaxante", name: "Massagem Relaxante com Aromaterapia", category: "estetica", durationMinutes: 50, price: 100, costPrice: 10, description: "Al\xEDvio de tens\xF5es musculares, \xF3leos essenciais terap\xEAuticos e pedras quentes.", imageUrl: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80", active: true, order: 13 }
];
var INITIAL_SETTINGS = {
  studioName: "Studio Bella & Est\xE9tica",
  slogan: "Real\xE7ando sua beleza \xFAnica com carinho e excel\xEAncia \u2728",
  logoUrl: "",
  phone: "(11) 98765-4321",
  whatsapp: "11987654321",
  address: "Av. Paulista, 1000 - Sala 42, S\xE3o Paulo - SP",
  instagram: "@studiobella.estetica",
  pixKey: "contato@studiobella.com.br",
  pixKeyType: "email",
  openingHour: "08:00",
  closingHour: "19:00",
  intervalMinutes: 30,
  lunchBreak: { enabled: true, start: "12:00", end: "13:00" },
  workingDays: [1, 2, 3, 4, 5, 6],
  appointmentAdvanceDays: 30,
  onlineBookingEnabled: true,
  bookingNotice: "Por favor, chegue com 5 a 10 minutos de anteced\xEAncia. Para cancelamentos, avise com no m\xEDnimo 2 horas.",
  currency: "R$"
};
var today = () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
var now = () => (/* @__PURE__ */ new Date()).toISOString();
var INITIAL_APPOINTMENTS = [
  {
    id: "apt_demo_1",
    clientName: "Juliana Mendes",
    clientPhone: "(11) 99887-1122",
    clientEmail: "juliana.m@email.com",
    services: [
      { serviceId: "srv_corte_fem", name: "Corte Feminino + Escova Modelada", price: 90, costPrice: 12, durationMinutes: 60, category: "cabelo" },
      { serviceId: "srv_manicure_pedicure", name: "P\xE9 & M\xE3o Completo (Tradicional)", price: 65, costPrice: 7, durationMinutes: 60, category: "unhas" }
    ],
    totalPrice: 155,
    totalCost: 19,
    totalDuration: 120,
    date: today(),
    timeSlot: "09:00",
    endTimeSlot: "11:00",
    status: "confirmado",
    paymentStatus: "pendente",
    paymentMethod: "pix",
    notes: "Cliente prefere esmalte tons nude.",
    createdAt: now(),
    source: "online_cliente"
  },
  {
    id: "apt_demo_2",
    clientName: "Mariana Costa",
    clientPhone: "(11) 98711-2233",
    services: [{ serviceId: "srv_design_sobrancelha", name: "Design de Sobrancelhas com Henna", price: 55, costPrice: 5, durationMinutes: 40, category: "sobrancelhas" }],
    totalPrice: 55,
    totalCost: 5,
    totalDuration: 40,
    date: today(),
    timeSlot: "14:00",
    endTimeSlot: "14:40",
    status: "concluido",
    paymentStatus: "pago",
    paymentMethod: "pix",
    notes: "Henna castanho m\xE9dio suave.",
    createdAt: now(),
    completedAt: now(),
    source: "studio_admin"
  },
  {
    id: "apt_demo_3",
    clientName: "Camila Rodrigues",
    clientPhone: "(11) 97654-8899",
    services: [{ serviceId: "srv_limpeza_pele", name: "Limpeza de Pele Profunda com Oz\xF4nio", price: 140, costPrice: 25, durationMinutes: 80, category: "estetica" }],
    totalPrice: 140,
    totalCost: 25,
    totalDuration: 80,
    date: today(),
    timeSlot: "16:00",
    endTimeSlot: "17:20",
    status: "agendado",
    paymentStatus: "pendente",
    notes: "Primeira vez no Studio.",
    createdAt: now(),
    source: "online_cliente"
  }
];
var INITIAL_TRANSACTIONS = [
  {
    id: "trx_demo_1",
    appointmentId: "apt_demo_2",
    type: "receita",
    category: "servico",
    description: "Design de Sobrancelhas com Henna - Mariana Costa",
    amount: 55,
    costAmount: 5,
    date: today(),
    paymentMethod: "pix",
    status: "pago",
    clientName: "Mariana Costa",
    createdAt: now()
  },
  {
    id: "trx_demo_2",
    type: "despesa",
    category: "material_insumo",
    description: "Compra de esmaltes, lixas e descart\xE1veis",
    amount: 85,
    date: today(),
    paymentMethod: "cartao_debito",
    status: "pago",
    createdAt: now()
  }
];

// server/bootstrap.ts
var __dirname = dirname(fileURLToPath(import.meta.url));
var bootstrapped = false;
async function bootstrap() {
  if (bootstrapped) return;
  bootstrapped = true;
  console.log("[bootstrap] aplicando schema...");
  const schemaPath = join(__dirname, "schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");
  await db_default.query(schema);
  console.log("[bootstrap] verificando dados iniciais...");
  const { rows } = await db_default.query("SELECT COUNT(*)::text AS count FROM services");
  const servicesCount = parseInt(rows[0]?.count || "0", 10);
  if (servicesCount === 0) {
    console.log("[bootstrap] populando dados iniciais...");
    const client = await db_default.connect();
    try {
      await client.query("BEGIN");
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
            a.id,
            a.clientName,
            a.clientPhone,
            a.clientEmail || null,
            JSON.stringify(a.services),
            a.totalPrice,
            a.totalCost,
            a.totalDuration,
            a.date,
            a.timeSlot,
            a.endTimeSlot || null,
            a.status,
            a.paymentStatus,
            a.paymentMethod || null,
            a.notes || null,
            a.createdAt,
            a.completedAt || null,
            a.source
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
            t.id,
            t.appointmentId || null,
            t.type,
            t.category,
            t.description,
            t.amount,
            t.costAmount || null,
            t.date,
            t.paymentMethod,
            t.status,
            t.clientName || null,
            t.createdAt
          ]
        );
      }
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('main_settings', $1::jsonb) ON CONFLICT (key) DO NOTHING`,
        [JSON.stringify(INITIAL_SETTINGS)]
      );
      await client.query("COMMIT");
      console.log("[bootstrap] dados iniciais inseridos.");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } else {
    console.log(`[bootstrap] ${servicesCount} servi\xE7os j\xE1 existem, pulando seed.`);
  }
}

// server/server.ts
var __dirname2 = dirname2(fileURLToPath2(import.meta.url));
var app = express();
app.use(express.json({ limit: "5mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
app.get("/api/health", async (_req, res) => {
  try {
    await db_default.query("SELECT 1");
    res.json({ ok: true, db: "up", uptime: process.uptime() });
  } catch (err) {
    res.status(503).json({ ok: false, db: "down", error: err.message });
  }
});
app.get("/api/settings", async (_req, res) => {
  const { rows } = await db_default.query("SELECT value FROM settings WHERE key=$1", ["main_settings"]);
  res.json(rows[0]?.value ?? null);
});
app.put("/api/settings", async (req, res) => {
  const value = req.body;
  await db_default.query(
    `INSERT INTO settings (key, value, updated_at)
     VALUES ('main_settings', $1::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value=$1::jsonb, updated_at=now()`,
    [JSON.stringify(value)]
  );
  res.json({ ok: true });
});
app.get("/api/categories", async (_req, res) => {
  const { rows } = await db_default.query('SELECT id, name, icon_name AS "iconName", color, description FROM categories ORDER BY id');
  res.json(rows);
});
app.put("/api/categories/:id", async (req, res) => {
  const { id } = req.params;
  const { name, iconName, color, description } = req.body;
  await db_default.query(
    `INSERT INTO categories (id, name, icon_name, color, description, updated_at)
     VALUES ($1,$2,$3,$4,$5,now())
     ON CONFLICT (id) DO UPDATE SET name=$2, icon_name=$3, color=$4, description=$5, updated_at=now()`,
    [id, name, iconName, color, description || null]
  );
  res.json({ ok: true });
});
app.get("/api/services", async (_req, res) => {
  const { rows } = await db_default.query(
    `SELECT id, name, category, duration_minutes AS "durationMinutes",
            price::float8 AS price, cost_price::float8 AS "costPrice",
            commission_rate::float8 AS "commissionRate",
            description, image_url AS "imageUrl", active, display_order AS "order"
     FROM services ORDER BY display_order ASC, id ASC`
  );
  res.json(rows);
});
app.put("/api/services/:id", async (req, res) => {
  const { id } = req.params;
  const s = req.body;
  await db_default.query(
    `INSERT INTO services
      (id, name, category, duration_minutes, price, cost_price, commission_rate, description, image_url, active, display_order, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now())
     ON CONFLICT (id) DO UPDATE SET
       name=$2, category=$3, duration_minutes=$4, price=$5, cost_price=$6, commission_rate=$7,
       description=$8, image_url=$9, active=$10, display_order=$11, updated_at=now()`,
    [
      id,
      s.name,
      s.category,
      s.durationMinutes,
      s.price,
      s.costPrice,
      s.commissionRate ?? null,
      s.description ?? "",
      s.imageUrl ?? null,
      s.active ?? true,
      s.order ?? 0
    ]
  );
  res.json({ ok: true });
});
app.delete("/api/services/:id", async (req, res) => {
  await db_default.query("DELETE FROM services WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});
app.get("/api/appointments", async (_req, res) => {
  const { rows } = await db_default.query(
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
app.put("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;
  const a = req.body;
  await db_default.query(
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
      id,
      a.clientName,
      a.clientPhone,
      a.clientEmail || null,
      JSON.stringify(a.services),
      a.totalPrice,
      a.totalCost,
      a.totalDuration,
      a.date,
      a.timeSlot,
      a.endTimeSlot || null,
      a.status,
      a.paymentStatus,
      a.paymentMethod || null,
      a.notes || null,
      a.createdAt,
      a.completedAt || null,
      a.source
    ]
  );
  res.json({ ok: true });
});
app.delete("/api/appointments/:id", async (req, res) => {
  await db_default.query("DELETE FROM appointments WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});
app.get("/api/transactions", async (_req, res) => {
  const { rows } = await db_default.query(
    `SELECT id, appointment_id AS "appointmentId", type, category, description,
            amount::float8 AS amount, cost_amount::float8 AS "costAmount",
            to_char(date, 'YYYY-MM-DD') AS date,
            payment_method AS "paymentMethod", status, client_name AS "clientName",
            created_at AS "createdAt"
     FROM transactions ORDER BY date DESC, created_at DESC`
  );
  res.json(rows);
});
app.put("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  const t = req.body;
  await db_default.query(
    `INSERT INTO transactions
      (id, appointment_id, type, category, description, amount, cost_amount,
       date, payment_method, status, client_name, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (id) DO UPDATE SET
       appointment_id=$2, type=$3, category=$4, description=$5, amount=$6, cost_amount=$7,
       date=$8, payment_method=$9, status=$10, client_name=$11`,
    [
      id,
      t.appointmentId || null,
      t.type,
      t.category,
      t.description,
      t.amount,
      t.costAmount || null,
      t.date,
      t.paymentMethod,
      t.status,
      t.clientName || null,
      t.createdAt
    ]
  );
  res.json({ ok: true });
});
app.delete("/api/transactions/:id", async (req, res) => {
  await db_default.query("DELETE FROM transactions WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});
app.get("/api/clients", async (_req, res) => {
  const { rows } = await db_default.query(
    `SELECT id, name, phone, email, notes,
            total_visits AS "totalVisits",
            total_spent::float8 AS "totalSpent",
            to_char(last_visit, 'YYYY-MM-DD') AS "lastVisit",
            created_at AS "createdAt"
     FROM clients ORDER BY name ASC`
  );
  res.json(rows);
});
app.put("/api/clients/:id", async (req, res) => {
  const { id } = req.params;
  const c = req.body;
  await db_default.query(
    `INSERT INTO clients (id, name, phone, email, notes, total_visits, total_spent, last_visit, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (id) DO UPDATE SET
       name=$2, phone=$3, email=$4, notes=$5,
       total_visits=$6, total_spent=$7, last_visit=$8`,
    [
      id,
      c.name,
      c.phone,
      c.email || null,
      c.notes || null,
      c.totalVisits ?? 0,
      c.totalSpent ?? 0,
      c.lastVisit || null,
      c.createdAt
    ]
  );
  res.json({ ok: true });
});
app.delete("/api/clients/:id", async (req, res) => {
  await db_default.query("DELETE FROM clients WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});
var distDir = join2(__dirname2, "..", "dist");
app.use(express.static(distDir, { maxAge: "1h" }));
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(join2(distDir, "index.html"));
});
var PORT = parseInt(process.env.PORT || "3001", 10);
bootstrap().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[salao-jane] API+frontend ouvindo em :${PORT}`);
  });
}).catch((err) => {
  console.error("[salao-jane] bootstrap falhou:", err);
  process.exit(1);
});
