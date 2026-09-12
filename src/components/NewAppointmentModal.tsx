import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Calendar,
  Clock,
  User,
  Phone,
  Scissors,
  Check,
  Sparkles,
} from 'lucide-react';
import { Appointment, BookedServiceSnapshot, ServiceItem, StudioSettings } from '../types';
import { db } from '../db/api';
import { formatCurrency, formatPhone } from '../utils/formatters';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceItem[];
  settings: StudioSettings;
  onCreated: () => void;
  initialDate?: string;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  services,
  settings,
  onCreated,
  initialDate,
}) => {
  if (!isOpen) return null;

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('09:00');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedServices = useMemo(() => {
    return services.filter((s) => selectedServiceIds.includes(s.id));
  }, [services, selectedServiceIds]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [selectedServices]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  const totalCost = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + (s.costPrice || 0), 0);
  }, [selectedServices]);

  const toggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter((item) => item !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || selectedServiceIds.length === 0 || !date || !timeSlot) {
      alert('Por favor preencha o nome da cliente, data, horário e pelo menos um serviço.');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookedSnapshots: BookedServiceSnapshot[] = selectedServices.map((s) => ({
        serviceId: s.id,
        name: s.name,
        price: s.price,
        costPrice: s.costPrice || 0,
        durationMinutes: s.durationMinutes,
        category: s.category,
      }));

      const [h, m] = timeSlot.split(':').map(Number);
      const endMins = h * 60 + m + (totalDuration || 30);
      const endHour = Math.floor(endMins / 60);
      const endMin = endMins % 60;
      const endTimeSlot = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

      const newApt: Appointment = {
        id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim() || '(11) 99999-9999',
        services: bookedSnapshots,
        totalPrice,
        totalCost,
        totalDuration: totalDuration || 30,
        date,
        timeSlot,
        endTimeSlot,
        status: 'confirmado',
        paymentStatus: 'pendente',
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
        source: 'studio_admin',
      };

      await db.saveAppointment(newApt);
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar agendamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Novo Agendamento</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Client Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nome da Cliente *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Nome completo"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 pl-9 pr-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                WhatsApp da Cliente
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={clientPhone}
                  onChange={handlePhoneChange}
                  className="w-full rounded-xl border border-neutral-300 pl-9 pr-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Data do Atendimento *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Horário de Início *
              </label>
              <input
                type="time"
                required
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Service Selector (Multi-selection) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-neutral-700">
                Selecione os Procedimentos * ({selectedServiceIds.length} selecionados)
              </label>
              {totalPrice > 0 && (
                <span className="text-xs font-bold text-rose-600">
                  Total: {formatCurrency(totalPrice)} ({totalDuration} min)
                </span>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-neutral-200 p-2 space-y-1.5 bg-neutral-50/50">
              {services.map((s) => {
                const isChecked = selectedServiceIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleService(s.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                      isChecked
                        ? 'bg-rose-100/70 text-rose-900 font-semibold border border-rose-200'
                        : 'bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                          isChecked ? 'bg-rose-600 text-white' : 'border border-neutral-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </span>
                      <span>{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500">
                      <span>{s.durationMinutes}m</span>
                      <span className="font-bold text-neutral-900">{formatCurrency(s.price)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Observações (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: detalhes técnicos, produtos específicos, preferência..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedServiceIds.length === 0}
              className={`rounded-xl px-5 py-2 text-xs font-bold text-white transition shadow-md flex items-center gap-1.5 ${
                selectedServiceIds.length === 0
                  ? 'bg-neutral-300 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 active:scale-95'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Horário</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
