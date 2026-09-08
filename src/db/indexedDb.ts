import {
  Appointment,
  CategoryInfo,
  ClientRecord,
  FinancialTransaction,
  ServiceItem,
  StudioSettings,
} from '../types';

const DB_NAME = 'studio_bella_db';
const DB_VERSION = 1;

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  {
    id: 'cabelo',
    name: 'Cabelo',
    iconName: 'Scissors',
    color: 'from-amber-500 to-rose-500',
    description: 'Cortes, escovas, hidratação, mechas e químicas.',
  },
  {
    id: 'unhas',
    name: 'Unhas',
    iconName: 'Sparkles',
    color: 'from-pink-500 to-rose-600',
    description: 'Manicure, pedicure, alongamento em gel e blindagem.',
  },
  {
    id: 'sobrancelhas',
    name: 'Sobrancelhas & Cílios',
    iconName: 'Eye',
    color: 'from-purple-500 to-indigo-600',
    description: 'Design personalizado, henna, micropigmentação e lash lifting.',
  },
  {
    id: 'estetica',
    name: 'Estética Facial & Corporal',
    iconName: 'Smile',
    color: 'from-emerald-500 to-teal-600',
    description: 'Limpeza de pele, drenagem, massagens e tratamentos.',
  },
  {
    id: 'depilacao',
    name: 'Depilação',
    iconName: 'Flame',
    color: 'from-orange-500 to-amber-600',
    description: 'Depilação cera morna, egípcia e laser.',
  },
  {
    id: 'maquiagem',
    name: 'Maquiagem & Noivas',
    iconName: 'Palette',
    color: 'from-fuchsia-500 to-pink-600',
    description: 'Produções para eventos, formaturas e ensaios.',
  },
];

export const INITIAL_SERVICES: ServiceItem[] = [
  // Cabelo
  {
    id: 'srv_corte_fem',
    name: 'Corte Feminino + Escova Modelada',
    category: 'cabelo',
    durationMinutes: 60,
    price: 90.0,
    costPrice: 12.0,
    description: 'Lavagem especial, corte personalizado, finalização com escova e reparador.',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    active: true,
    order: 1,
  },
  {
    id: 'srv_corte_masc',
    name: 'Corte Masculino & Barba Terapia',
    category: 'cabelo',
    durationMinutes: 45,
    price: 65.0,
    costPrice: 8.0,
    description: 'Corte tesoura/máquina com toalha quente e alinhamento de barba.',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    active: true,
    order: 2,
  },
  {
    id: 'srv_hidratacao',
    name: 'Hidratação Profunda & Cronograma',
    category: 'cabelo',
    durationMinutes: 50,
    price: 110.0,
    costPrice: 25.0,
    description: 'Tratamento intensivo de reposição hídrica e lipídica com marcas premium.',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    active: true,
    order: 3,
  },
  {
    id: 'srv_mechas',
    name: 'Mechas / Morena Iluminada',
    category: 'cabelo',
    durationMinutes: 180,
    price: 350.0,
    costPrice: 75.0,
    description: 'Técnica personalizada de iluminação com tonalização e tratamento reconstrutor.',
    imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80',
    active: true,
    order: 4,
  },

  // Unhas
  {
    id: 'srv_manicure_pedicure',
    name: 'Pé & Mão Completo (Tradicional)',
    category: 'unhas',
    durationMinutes: 60,
    price: 65.0,
    costPrice: 7.0,
    description: 'Cutilagem funda e delicada, esmaltação duradoura e hidratação das cutículas.',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
    active: true,
    order: 5,
  },
  {
    id: 'srv_alongamento_gel',
    name: 'Alongamento em Gel / Fibra de Vidro',
    category: 'unhas',
    durationMinutes: 120,
    price: 160.0,
    costPrice: 30.0,
    description: 'Alongamento resistente com formato natural, ponto de tensão e cutilagem russa.',
    imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80',
    active: true,
    order: 6,
  },
  {
    id: 'srv_spa_pes',
    name: 'Spa dos Pés Relaxante',
    category: 'unhas',
    durationMinutes: 45,
    price: 75.0,
    costPrice: 15.0,
    description: 'Higienização, esfoliação com sais minerais, massagem podal e parafina térmica.',
    imageUrl: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=600&q=80',
    active: true,
    order: 7,
  },

  // Sobrancelhas & Cílios
  {
    id: 'srv_design_sobrancelha',
    name: 'Design de Sobrancelhas com Henna',
    category: 'sobrancelhas',
    durationMinutes: 40,
    price: 55.0,
    costPrice: 5.0,
    description: 'Mapeamento facial simétrico, limpeza precisa e aplicação de henna orgânica.',
    imageUrl: 'https://images.unsplash.com/photo-1597225244660-1cd128c64284?auto=format&fit=crop&w=600&q=80',
    active: true,
    order: 8,
  },
  {
    id: 'srv_lash_lifting',
    name: 'Lash Lifting & Tintura de Cílios',
    category: 'sobrancelhas',
    durationMinutes: 60,
    price: 120.0,
    costPrice: 20.0,
    description: 'Curvatura e nutrição dos fios naturais dos cílios, proporcionando efeito rímel por até 6 semanas.',
    imageUrl: 'https://images.unsplash.com/photo-1583001809873-a128495da465?auto=format&fit=crop&w=600&q=80',
    active: true,
    order: 9,
  },
  {
    id: 'srv_micro_sobrancelha',
    name: 'Micropigmentação Shadow / Fio a Fio',
    category: 'sobrancelhas',
    durationMinutes: 120,
    price: 380.0,
    costPrice: 50.0,
    description: 'Preenchimento semipermanente ultra realista com anestésico tópico e pigmentos de alta fixação.',
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
    active: true,
    order: 10,
  },

  // Estética Facial & Corporal
  {
    id: 'srv_limpeza_pele',
    name: 'Limpeza de Pele Profunda com Ozônio',
    category: 'estetica',
    durationMinutes: 80,
    price: 140.0,
    costPrice: 25.0,
    description: 'Vapor de ozônio, extração sem dor, alta frequência, máscara calmante e fototerapia LED.',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    active: true,
    order: 11,
  },
  {
    id: 'srv_drenagem_linfatica',
    name: 'Drenagem Linfática / Massagem Modeladora',
    category: 'estetica',
    durationMinutes: 60,
    price: 110.0,
    costPrice: 10.0,
    description: 'Redução de retenção de líquidos, desinchaço e ativação da circulação corporal.',
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80',
    active: true,
    order: 12,
  },
  {
    id: 'srv_massagem_relaxante',
    name: 'Massagem Relaxante com Aromaterapia',
    category: 'estetica',
    durationMinutes: 50,
    price: 100.0,
    costPrice: 10.0,
    description: 'Alívio de tensões musculares, óleos essenciais terapêuticos e pedras quentes.',
    imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80',
    active: true,
    order: 13,
  },
];

export const INITIAL_SETTINGS: StudioSettings = {
  studioName: 'Studio Bella & Estética',
  slogan: 'Realçando sua beleza única com carinho e excelência ✨',
  logoUrl: '',
  phone: '(11) 98765-4321',
  whatsapp: '11987654321',
  address: 'Av. Paulista, 1000 - Sala 42, São Paulo - SP',
  instagram: '@studiobella.estetica',
  pixKey: 'contato@studiobella.com.br',
  pixKeyType: 'email',
  openingHour: '08:00',
  closingHour: '19:00',
  intervalMinutes: 30,
  lunchBreak: {
    enabled: true,
    start: '12:00',
    end: '13:00',
  },
  workingDays: [1, 2, 3, 4, 5, 6], // Seg a Sáb
  appointmentAdvanceDays: 30,
  onlineBookingEnabled: true,
  bookingNotice: 'Por favor, chegue com 5 a 10 minutos de antecedência. Para cancelamentos, avise com no mínimo 2 horas.',
  currency: 'R$',
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_demo_1',
    clientName: 'Juliana Mendes',
    clientPhone: '(11) 99887-1122',
    clientEmail: 'juliana.m@email.com',
    services: [
      {
        serviceId: 'srv_corte_fem',
        name: 'Corte Feminino + Escova Modelada',
        price: 90.0,
        costPrice: 12.0,
        durationMinutes: 60,
        category: 'cabelo',
      },
      {
        serviceId: 'srv_manicure_pedicure',
        name: 'Pé & Mão Completo (Tradicional)',
        price: 65.0,
        costPrice: 7.0,
        durationMinutes: 60,
        category: 'unhas',
      },
    ],
    totalPrice: 155.0,
    totalCost: 19.0,
    totalDuration: 120,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '09:00',
    endTimeSlot: '11:00',
    status: 'confirmado',
    paymentStatus: 'pendente',
    paymentMethod: 'pix',
    notes: 'Cliente prefere esmalte tons nude.',
    createdAt: new Date().toISOString(),
    source: 'online_cliente',
  },
  {
    id: 'apt_demo_2',
    clientName: 'Mariana Costa',
    clientPhone: '(11) 98711-2233',
    services: [
      {
        serviceId: 'srv_design_sobrancelha',
        name: 'Design de Sobrancelhas com Henna',
        price: 55.0,
        costPrice: 5.0,
        durationMinutes: 40,
        category: 'sobrancelhas',
      },
    ],
    totalPrice: 55.0,
    totalCost: 5.0,
    totalDuration: 40,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '14:00',
    endTimeSlot: '14:40',
    status: 'concluido',
    paymentStatus: 'pago',
    paymentMethod: 'pix',
    notes: 'Henna castanho médio suave.',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    source: 'studio_admin',
  },
  {
    id: 'apt_demo_3',
    clientName: 'Camila Rodrigues',
    clientPhone: '(11) 97654-8899',
    services: [
      {
        serviceId: 'srv_limpeza_pele',
        name: 'Limpeza de Pele Profunda com Ozônio',
        price: 140.0,
        costPrice: 25.0,
        durationMinutes: 80,
        category: 'estetica',
      },
    ],
    totalPrice: 140.0,
    totalCost: 25.0,
    totalDuration: 80,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '16:00',
    endTimeSlot: '17:20',
    status: 'agendado',
    paymentStatus: 'pendente',
    notes: 'Primeira vez no Studio.',
    createdAt: new Date().toISOString(),
    source: 'online_cliente',
  },
];

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'trx_demo_1',
    appointmentId: 'apt_demo_2',
    type: 'receita',
    category: 'servico',
    description: 'Design de Sobrancelhas com Henna - Mariana Costa',
    amount: 55.0,
    costAmount: 5.0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'pix',
    status: 'pago',
    clientName: 'Mariana Costa',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'trx_demo_2',
    type: 'despesa',
    category: 'material_insumo',
    description: 'Compra de esmaltes, lixas e descartáveis',
    amount: 85.0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cartao_debito',
    status: 'pago',
    createdAt: new Date().toISOString(),
  },
];

class IndexedDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('services')) {
          const store = db.createObjectStore('services', { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('active', 'active', { unique: false });
        }

        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('appointments')) {
          const store = db.createObjectStore('appointments', { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('clientPhone', 'clientPhone', { unique: false });
        }

        if (!db.objectStoreNames.contains('transactions')) {
          const store = db.createObjectStore('transactions', { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('clients')) {
          const store = db.createObjectStore('clients', { keyPath: 'id' });
          store.createIndex('phone', 'phone', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = async () => {
        const db = request.result;
        // Check if initial seed is needed
        await this.seedInitialData(db);
        resolve(db);
      };

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  private async seedInitialData(db: IDBDatabase): Promise<void> {
    // Check if services are empty
    const tx = db.transaction(['services', 'categories', 'settings', 'appointments', 'transactions'], 'readwrite');
    const servicesStore = tx.objectStore('services');
    const countReq = servicesStore.count();

    countReq.onsuccess = () => {
      if (countReq.result === 0) {
        // Seed categories
        const catStore = tx.objectStore('categories');
        DEFAULT_CATEGORIES.forEach((cat) => catStore.put(cat));

        // Seed services
        INITIAL_SERVICES.forEach((srv) => servicesStore.put(srv));

        // Seed settings
        const settingsStore = tx.objectStore('settings');
        settingsStore.put({ key: 'main_settings', value: INITIAL_SETTINGS });

        // Seed initial appointments
        const aptStore = tx.objectStore('appointments');
        INITIAL_APPOINTMENTS.forEach((apt) => aptStore.put(apt));

        // Seed initial transactions
        const trxStore = tx.objectStore('transactions');
        INITIAL_TRANSACTIONS.forEach((trx) => trxStore.put(trx));
      }
    };
  }

  // --- GENERIC HELPERS ---
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  }

  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  }

  async put<T>(storeName: string, value: T): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(value);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- SPECIFIC DOMAIN METHODS ---

  // Settings
  async getSettings(): Promise<StudioSettings> {
    const res = await this.get<{ key: string; value: StudioSettings }>('settings', 'main_settings');
    return res ? res.value : INITIAL_SETTINGS;
  }

  async saveSettings(settings: StudioSettings): Promise<void> {
    await this.put('settings', { key: 'main_settings', value: settings });
  }

  // Services
  async getServices(): Promise<ServiceItem[]> {
    const list = await this.getAll<ServiceItem>('services');
    return list.sort((a, b) => a.order - b.order);
  }

  async saveService(service: ServiceItem): Promise<void> {
    await this.put('services', service);
  }

  async deleteService(serviceId: string): Promise<void> {
    await this.delete('services', serviceId);
  }

  // Categories
  async getCategories(): Promise<CategoryInfo[]> {
    const list = await this.getAll<CategoryInfo>('categories');
    return list.length > 0 ? list : DEFAULT_CATEGORIES;
  }

  async saveCategory(category: CategoryInfo): Promise<void> {
    await this.put('categories', category);
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    const list = await this.getAll<Appointment>('appointments');
    return list.sort((a, b) => {
      const dateDiff = a.date.localeCompare(b.date);
      if (dateDiff !== 0) return dateDiff;
      return a.timeSlot.localeCompare(b.timeSlot);
    });
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const all = await this.getAppointments();
    return all.filter((apt) => apt.date === date && apt.status !== 'cancelado');
  }

  async saveAppointment(apt: Appointment): Promise<void> {
    await this.put('appointments', apt);
    // Update client profile stats
    await this.updateClientFromAppointment(apt);
  }

  async deleteAppointment(aptId: string): Promise<void> {
    await this.delete('appointments', aptId);
  }

  // Completing an appointment & registering financial transaction
  async completeAppointmentAndRegisterFinance(
    appointmentId: string,
    paymentMethod: FinancialTransaction['paymentMethod'],
    amountPaid: number,
    costAmount?: number
  ): Promise<void> {
    const apt = await this.get<Appointment>('appointments', appointmentId);
    if (!apt) return;

    const updatedApt: Appointment = {
      ...apt,
      status: 'concluido',
      paymentStatus: 'pago',
      paymentMethod,
      completedAt: new Date().toISOString(),
    };

    await this.saveAppointment(updatedApt);

    // Create automatic revenue transaction
    const serviceNames = apt.services.map((s) => s.name).join(' + ');
    const trx: FinancialTransaction = {
      id: `trx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      appointmentId: apt.id,
      type: 'receita',
      category: 'servico',
      description: `${serviceNames} - ${apt.clientName}`,
      amount: amountPaid || apt.totalPrice,
      costAmount: costAmount !== undefined ? costAmount : apt.totalCost,
      date: apt.date || new Date().toISOString().split('T')[0],
      paymentMethod,
      status: 'pago',
      clientName: apt.clientName,
      createdAt: new Date().toISOString(),
    };

    await this.saveTransaction(trx);
  }

  // Financial Transactions
  async getTransactions(): Promise<FinancialTransaction[]> {
    const list = await this.getAll<FinancialTransaction>('transactions');
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }

  async saveTransaction(trx: FinancialTransaction): Promise<void> {
    await this.put('transactions', trx);
  }

  async deleteTransaction(trxId: string): Promise<void> {
    await this.delete('transactions', trxId);
  }

  // Clients
  async getClients(): Promise<ClientRecord[]> {
    const list = await this.getAll<ClientRecord>('clients');
    return list.sort((a, b) => b.totalSpent - a.totalSpent);
  }

  async saveClient(client: ClientRecord): Promise<void> {
    await this.put('clients', client);
  }

  private async updateClientFromAppointment(apt: Appointment): Promise<void> {
    if (!apt.clientPhone && !apt.clientName) return;

    const clientId = `cli_${apt.clientPhone.replace(/\D/g, '') || apt.clientName.toLowerCase().replace(/\s+/g, '_')}`;
    const existing = await this.get<ClientRecord>('clients', clientId);

    const appointments = await this.getAll<Appointment>('appointments');
    const clientApts = appointments.filter(
      (a) =>
        (a.clientPhone && a.clientPhone === apt.clientPhone) ||
        a.clientName.toLowerCase() === apt.clientName.toLowerCase()
    );

    const completedApts = clientApts.filter((a) => a.status === 'concluido');
    const totalSpent = completedApts.reduce((acc, a) => acc + a.totalPrice, 0);

    const clientRecord: ClientRecord = {
      id: clientId,
      name: apt.clientName,
      phone: apt.clientPhone,
      email: apt.clientEmail || existing?.email,
      notes: existing?.notes || apt.notes,
      totalVisits: completedApts.length,
      totalSpent,
      lastVisit: apt.date,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    await this.put('clients', clientRecord);
  }

  // Backup export / import
  async exportFullBackup(): Promise<string> {
    const services = await this.getAll('services');
    const categories = await this.getAll('categories');
    const appointments = await this.getAll('appointments');
    const transactions = await this.getAll('transactions');
    const clients = await this.getAll('clients');
    const settings = await this.getSettings();

    const data = {
      version: DB_VERSION,
      exportDate: new Date().toISOString(),
      studio: settings.studioName,
      data: {
        settings,
        categories,
        services,
        appointments,
        transactions,
        clients,
      },
    };

    return JSON.stringify(data, null, 2);
  }

  async importFullBackup(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) throw new Error('Formato de backup inválido');

      const db = await this.getDB();
      const stores = ['services', 'categories', 'appointments', 'transactions', 'clients', 'settings'];

      for (const storeName of stores) {
        await this.clear(storeName);
      }

      if (parsed.data.settings) {
        await this.saveSettings(parsed.data.settings);
      }
      if (Array.isArray(parsed.data.categories)) {
        for (const cat of parsed.data.categories) await this.saveCategory(cat);
      }
      if (Array.isArray(parsed.data.services)) {
        for (const srv of parsed.data.services) await this.saveService(srv);
      }
      if (Array.isArray(parsed.data.appointments)) {
        for (const apt of parsed.data.appointments) await this.put('appointments', apt);
      }
      if (Array.isArray(parsed.data.transactions)) {
        for (const trx of parsed.data.transactions) await this.saveTransaction(trx);
      }
      if (Array.isArray(parsed.data.clients)) {
        for (const cli of parsed.data.clients) await this.saveClient(cli);
      }

      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }

  async resetToInitialDefaults(): Promise<void> {
    const stores = ['services', 'categories', 'appointments', 'transactions', 'clients', 'settings'];
    for (const s of stores) {
      await this.clear(s);
    }
    const db = await this.getDB();
    await this.seedInitialData(db);
  }
}

export const db = new IndexedDBService();
