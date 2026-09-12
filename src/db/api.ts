// Substitui o IndexedDBService por chamadas HTTP ao backend Express + Postgres
import {
  Appointment,
  CategoryInfo,
  ClientRecord,
  FinancialTransaction,
  ServiceItem,
  StudioSettings,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  INITIAL_SERVICES,
  INITIAL_SETTINGS,
} from './seed-fallback';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

async function http<T>(method: string, path: string, body?: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${method} ${path}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Helper: gera ID curto
export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

class ApiService {
  // Settings
  async getSettings(): Promise<StudioSettings> {
    const s = await http<StudioSettings | null>('GET', '/settings');
    return s ?? INITIAL_SETTINGS;
  }

  async saveSettings(settings: StudioSettings): Promise<void> {
    await http('PUT', '/settings', settings);
  }

  // Services
  async getServices(): Promise<ServiceItem[]> {
    return http<ServiceItem[]>('GET', '/services');
  }

  async saveService(service: ServiceItem): Promise<void> {
    await http('PUT', `/services/${encodeURIComponent(service.id)}`, service);
  }

  async deleteService(serviceId: string): Promise<void> {
    await http('DELETE', `/services/${encodeURIComponent(serviceId)}`);
  }

  // Categories
  async getCategories(): Promise<CategoryInfo[]> {
    const list = await http<CategoryInfo[]>('GET', '/categories');
    return list.length > 0 ? list : DEFAULT_CATEGORIES;
  }

  async saveCategory(category: CategoryInfo): Promise<void> {
    await http('PUT', `/categories/${encodeURIComponent(category.id)}`, category);
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return http<Appointment[]>('GET', '/appointments');
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const all = await this.getAppointments();
    return all.filter((apt) => apt.date === date && apt.status !== 'cancelado');
  }

  async saveAppointment(apt: Appointment): Promise<void> {
    await http('PUT', `/appointments/${encodeURIComponent(apt.id)}`, apt);
    await this.updateClientFromAppointment(apt);
  }

  async deleteAppointment(aptId: string): Promise<void> {
    await http('DELETE', `/appointments/${encodeURIComponent(aptId)}`);
  }

  async completeAppointmentAndRegisterFinance(
    appointmentId: string,
    paymentMethod: FinancialTransaction['paymentMethod'],
    amountPaid: number,
    costAmount?: number
  ): Promise<void> {
    const all = await this.getAppointments();
    const apt = all.find((a) => a.id === appointmentId);
    if (!apt) throw new Error(`Agendamento ${appointmentId} não encontrado`);
    const nowIso = new Date().toISOString();
    const updated: Appointment = {
      ...apt,
      status: 'concluido',
      paymentStatus: 'pago',
      paymentMethod,
      completedAt: nowIso,
    };
    await this.saveAppointment(updated);

    const tx: FinancialTransaction = {
      id: newId('trx'),
      appointmentId,
      type: 'receita',
      category: 'servico',
      description: apt.services.map((s) => s.name).join(', '),
      amount: amountPaid,
      costAmount: costAmount ?? apt.totalCost,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      status: 'pago',
      clientName: apt.clientName,
      createdAt: nowIso,
    };
    await http('PUT', `/transactions/${encodeURIComponent(tx.id)}`, tx);
  }

  // Transactions
  async getTransactions(): Promise<FinancialTransaction[]> {
    return http<FinancialTransaction[]>('GET', '/transactions');
  }

  async saveTransaction(tx: FinancialTransaction): Promise<void> {
    await http('PUT', `/transactions/${encodeURIComponent(tx.id)}`, tx);
  }

  async deleteTransaction(txId: string): Promise<void> {
    await http('DELETE', `/transactions/${encodeURIComponent(txId)}`);
  }

  // Clients
  async getClients(): Promise<ClientRecord[]> {
    return http<ClientRecord[]>('GET', '/clients');
  }

  async saveClient(client: ClientRecord): Promise<void> {
    await http('PUT', `/clients/${encodeURIComponent(client.id)}`, client);
  }

  async deleteClient(id: string): Promise<void> {
    await http('DELETE', `/clients/${encodeURIComponent(id)}`);
  }

  // Helper interno: atualiza estatísticas do cliente
  private async updateClientFromAppointment(apt: Appointment): Promise<void> {
    if (apt.status === 'cancelado' || apt.status === 'nao_compareceu') return;
    try {
      const clients = await this.getClients();
      const byPhone = clients.filter((c) => c.phone === apt.clientPhone);
      const existing = byPhone[0];
      const isConcluded = apt.status === 'concluido';
      const visitsDelta = isConcluded ? 1 : 0;
      const spentDelta = isConcluded ? apt.totalPrice : 0;
      const lastVisit = isConcluded ? apt.date : (existing?.lastVisit ?? undefined);

      const updated: ClientRecord = existing
        ? {
            ...existing,
            totalVisits: (existing.totalVisits ?? 0) + visitsDelta,
            totalSpent: (existing.totalSpent ?? 0) + spentDelta,
            lastVisit,
          }
        : {
            id: newId('cli'),
            name: apt.clientName,
            phone: apt.clientPhone,
            email: apt.clientEmail,
            notes: apt.notes,
            totalVisits: visitsDelta,
            totalSpent: spentDelta,
            lastVisit,
            createdAt: apt.createdAt,
          };
      await this.saveClient(updated);
    } catch (err) {
      console.warn('[api] updateClientFromAppointment falhou:', err);
    }
  }
}

export const db = new ApiService();
export { INITIAL_SERVICES, DEFAULT_CATEGORIES, INITIAL_SETTINGS };
