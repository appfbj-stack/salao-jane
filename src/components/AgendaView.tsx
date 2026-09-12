import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  MessageCircle,
  Receipt,
  Download,
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Scissors,
  Share2,
} from 'lucide-react';
import { Appointment, ServiceItem, StudioSettings } from '../types';
import { db } from '../db/api';
import {
  formatCurrency,
  formatDateBR,
  formatDateHuman,
  downloadICSFile,
} from '../utils/formatters';
import { WhatsAppReminderModal } from './WhatsAppReminderModal';

interface AgendaViewProps {
  appointments: Appointment[];
  services: ServiceItem[];
  settings: StudioSettings;
  onRefresh: () => void;
  onOpenNewAppointment: (date?: string) => void;
  onOpenCheckout: (apt: Appointment) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  appointments,
  services,
  settings,
  onRefresh,
  onOpenNewAppointment,
  onOpenCheckout,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAptForReminder, setSelectedAptForReminder] = useState<Appointment | null>(null);

  // Move date back/forward by 1 day
  const changeDate = (daysDelta: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + daysDelta);
    setSelectedDate(dateObj.toISOString().split('T')[0]);
  };

  // Filter appointments for selected day & query
  const dayAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (apt.date !== selectedDate) return false;
      if (statusFilter !== 'todos' && apt.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesClient = apt.clientName.toLowerCase().includes(query);
        const matchesPhone = apt.clientPhone.includes(query);
        const matchesService = apt.services.some((s) => s.name.toLowerCase().includes(query));
        if (!matchesClient && !matchesPhone && !matchesService) return false;
      }
      return true;
    });
  }, [appointments, selectedDate, statusFilter, searchTerm]);

  // Daily statistics
  const dayStats = useMemo(() => {
    const allForDay = appointments.filter((a) => a.date === selectedDate && a.status !== 'cancelado');
    const completed = allForDay.filter((a) => a.status === 'concluido');
    const totalExpectedRevenue = allForDay.reduce((acc, a) => acc + a.totalPrice, 0);
    const totalRealizedRevenue = completed.reduce((acc, a) => acc + a.totalPrice, 0);

    return {
      total: allForDay.length,
      completedCount: completed.length,
      expectedRevenue: totalExpectedRevenue,
      realizedRevenue: totalRealizedRevenue,
    };
  }, [appointments, selectedDate]);

  const handleUpdateStatus = async (apt: Appointment, newStatus: Appointment['status']) => {
    try {
      const updated = { ...apt, status: newStatus };
      await db.saveAppointment(updated);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar status');
    }
  };

  const handleSendWhatsAppReminder = (apt: Appointment) => {
    setSelectedAptForReminder(apt);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Day Navigation */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition"
            title="Dia anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
          >
            Hoje
          </button>

          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <button
            onClick={() => changeDate(1)}
            className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition"
            title="Próximo dia"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg ml-1 hidden md:inline">
            {formatDateHuman(selectedDate)}
          </span>
        </div>

        {/* Quick New Appointment Button */}
        <button
          onClick={() => onOpenNewAppointment(selectedDate)}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-4 py-2 text-xs font-bold shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Daily KPIs Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs">
          <span className="text-[11px] text-neutral-500 font-medium">Agendamentos do Dia</span>
          <div className="text-xl font-bold text-neutral-900 mt-1">{dayStats.total}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs">
          <span className="text-[11px] text-neutral-500 font-medium">Atendimentos Concluídos</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {dayStats.completedCount} / {dayStats.total}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs">
          <span className="text-[11px] text-neutral-500 font-medium">Previsão Faturamento</span>
          <div className="text-xl font-bold text-neutral-900 mt-1">
            {formatCurrency(dayStats.expectedRevenue)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs">
          <span className="text-[11px] text-neutral-500 font-medium">Realizado no Caixa</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {formatCurrency(dayStats.realizedRevenue)}
          </div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Status Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'agendado', label: 'Agendados' },
            { id: 'confirmado', label: 'Confirmados' },
            { id: 'concluido', label: 'Concluídos' },
            { id: 'cancelado', label: 'Cancelados' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === f.id
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por cliente ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-white border border-neutral-200 pl-8 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Appointments Timeline / List */}
      {dayAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-neutral-200/80 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900">
              Nenhum agendamento para {formatDateBR(selectedDate)}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Compartilhe o link do salão com suas clientes ou crie um novo agendamento manual.
            </p>
          </div>
          <button
            onClick={() => onOpenNewAppointment(selectedDate)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Horário</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {dayAppointments.map((apt) => {
            const isCompleted = apt.status === 'concluido';
            const isCancelled = apt.status === 'cancelado';
            const isConfirmed = apt.status === 'confirmado';

            return (
              <div
                key={apt.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isCancelled
                    ? 'border-neutral-200 opacity-60 bg-neutral-50'
                    : 'border-neutral-200/90 hover:border-rose-300'
                }`}
              >
                {/* Left: Time & Client info */}
                <div className="flex items-start gap-4">
                  {/* Time Badge */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 py-2 rounded-xl bg-neutral-900 text-white">
                    <span className="text-xs font-extrabold">{apt.timeSlot}</span>
                    <span className="text-[10px] text-neutral-400">{apt.totalDuration}m</span>
                  </div>

                  {/* Client & Services */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-900">{apt.clientName}</h4>

                      {/* Source tag */}
                      {apt.source === 'online_cliente' && (
                        <span className="text-[10px] font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Online
                        </span>
                      )}

                      {/* Status badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCancelled
                            ? 'bg-neutral-200 text-neutral-600'
                            : isConfirmed
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {apt.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Services Chips */}
                    <div className="flex flex-wrap gap-1.5 text-xs text-neutral-600">
                      {apt.services.map((s, idx) => (
                        <span
                          key={idx}
                          className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md font-medium text-[11px]"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>

                    {/* Phone & Notes */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                      {apt.clientPhone && (
                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppReminder(apt)}
                          className="flex items-center gap-1 font-mono text-neutral-600 hover:text-emerald-700 transition"
                          title="Clique para gerar link e enviar lembrete via WhatsApp"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{apt.clientPhone}</span>
                        </button>
                      )}
                      {apt.notes && (
                        <span className="italic text-neutral-400 truncate max-w-xs">
                          "{apt.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Value & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
                  {/* Price info */}
                  <div className="text-left md:text-right">
                    <div className="text-xs text-neutral-400">Total</div>
                    <div className="text-base font-extrabold text-neutral-900">
                      {formatCurrency(apt.totalPrice)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap md:flex-nowrap">
                    {/* WhatsApp Reminder Button */}
                    <button
                      id={`btn-whatsapp-reminder-${apt.id}`}
                      onClick={() => handleSendWhatsAppReminder(apt)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition border border-emerald-200 text-xs font-bold shadow-2xs active:scale-95"
                      title="Gerar link de WhatsApp e enviar lembrete com detalhes do agendamento"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                      <span>Lembrete</span>
                    </button>

                    {/* ICS Calendar */}
                    <button
                      onClick={() => downloadICSFile(apt, settings)}
                      className="p-2 rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition"
                      title="Baixar para Google/Apple Agenda"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Checkout / Baixa no Caixa if not completed */}
                    {!isCompleted && !isCancelled && (
                      <button
                        onClick={() => onOpenCheckout(apt)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-bold shadow-xs transition active:scale-95"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Dar Baixa</span>
                      </button>
                    )}

                    {/* Status Toggle menu */}
                    {!isCompleted && !isCancelled && (
                      <button
                        onClick={() => handleUpdateStatus(apt, 'cancelado')}
                        className="p-2 rounded-xl bg-neutral-100 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Cancelar agendamento"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WhatsApp Reminder Modal */}
      <WhatsAppReminderModal
        isOpen={!!selectedAptForReminder}
        onClose={() => setSelectedAptForReminder(null)}
        appointment={selectedAptForReminder}
        settings={settings}
      />
    </div>
  );
};
