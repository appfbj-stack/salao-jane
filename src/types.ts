export type ServiceCategoryType =
  | 'cabelo'
  | 'unhas'
  | 'sobrancelhas'
  | 'estetica'
  | 'depilacao'
  | 'maquiagem'
  | 'outros'
  | string;

export interface CategoryInfo {
  id: string;
  name: string;
  iconName: string;
  color: string;
  description?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategoryType;
  durationMinutes: number;
  price: number;
  costPrice: number; // Custo de insumos/produtos usados
  commissionRate?: number; // % de comissão (ex: 50 para 50%)
  description: string;
  imageUrl?: string;
  active: boolean;
  order: number;
}

export type AppointmentStatus =
  | 'agendado'
  | 'confirmado'
  | 'concluido'
  | 'cancelado'
  | 'nao_compareceu';

export type PaymentStatus = 'pendente' | 'pago' | 'parcial';

export type PaymentMethod =
  | 'pix'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'dinheiro'
  | 'outro';

export interface BookedServiceSnapshot {
  serviceId: string;
  name: string;
  price: number;
  costPrice: number;
  durationMinutes: number;
  category: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  services: BookedServiceSnapshot[];
  totalPrice: number;
  totalCost: number;
  totalDuration: number;
  date: string; // Formato YYYY-MM-DD
  timeSlot: string; // Formato HH:mm (ex: "14:30")
  endTimeSlot?: string; // Formato HH:mm
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  source: 'online_cliente' | 'studio_admin';
}

export interface FinancialTransaction {
  id: string;
  appointmentId?: string;
  type: 'receita' | 'despesa';
  category:
    | 'servico'
    | 'produto_venda'
    | 'material_insumo'
    | 'aluguel_fixo'
    | 'comissao'
    | 'marketing'
    | 'outros';
  description: string;
  amount: number;
  costAmount?: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  status: 'pago' | 'pendente';
  clientName?: string;
  createdAt: string;
}

export interface StudioSettings {
  studioName: string;
  slogan: string;
  logoUrl: string; // Base64 data URL or external URL
  phone: string;
  whatsapp: string;
  address: string;
  instagram: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  openingHour: string; // ex: "08:00"
  closingHour: string; // ex: "19:00"
  intervalMinutes: number; // ex: 30
  lunchBreak: {
    enabled: boolean;
    start: string; // ex: "12:00"
    end: string; // ex: "13:00"
  };
  workingDays: number[]; // 0=Domingo, 1=Segunda, ..., 6=Sábado
  appointmentAdvanceDays: number;
  onlineBookingEnabled: boolean;
  bookingNotice: string;
  currency: string;
  customShareMessage?: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: string;
  createdAt: string;
}
