import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Scissors,
  Eye,
  Smile,
  Flame,
  Palette,
  CheckCircle,
  MapPin,
  Phone,
  Instagram,
  ArrowRight,
  ArrowLeft,
  CalendarPlus,
  Send,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  Appointment,
  BookedServiceSnapshot,
  CategoryInfo,
  ServiceItem,
  StudioSettings,
} from '../types';
import { db } from '../db/indexedDb';
import {
  formatCurrency,
  formatDateBR,
  formatDateHuman,
  formatPhone,
  generateAvailableTimeSlots,
  generateWhatsAppBookingMessage,
  downloadICSFile,
} from '../utils/formatters';

interface ClientBookingViewProps {
  settings: StudioSettings;
  categories: CategoryInfo[];
  services: ServiceItem[];
  onExitClientMode?: () => void;
}

export const ClientBookingView: React.FC<ClientBookingViewProps> = ({
  settings,
  categories,
  services,
  onExitClientMode,
}) => {
  // Booking Steps: 1: Select Services -> 2: Date & Time -> 3: Client Info -> 4: Confirmed
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected Services
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Selected Date & Time
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Client Details
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Existing appointments for slot calculation
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  // Load appointments from IndexedDB to check occupied slots
  useEffect(() => {
    db.getAppointments().then(setAllAppointments);
  }, [currentStep]);

  // Set default initial date (today or next working day)
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      setSelectedDate(todayStr);
    }
  }, [selectedDate]);

  // Total duration & price calculation
  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [selectedServices]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  const totalCost = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + (s.costPrice || 0), 0);
  }, [selectedServices]);

  // Filter active services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (!s.active) return false;
      if (selectedCategory === 'all') return true;
      return s.category === selectedCategory;
    });
  }, [services, selectedCategory]);

  // Next 21 days for date picker
  const availableDays = useMemo(() => {
    const days: { dateStr: string; dayNum: number; weekDayName: string; isWorkingDay: boolean; isToday: boolean }[] = [];
    const today = new Date();
    const workingDays = settings.workingDays || [1, 2, 3, 4, 5, 6];

    for (let i = 0; i < 21; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
      const isWorkingDay = workingDays.includes(dayOfWeek);

      const weekDayName = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(d);
      const dayNum = d.getDate();

      days.push({
        dateStr,
        dayNum,
        weekDayName: weekDayName.replace('.', '').toUpperCase(),
        isWorkingDay,
        isToday: i === 0,
      });
    }
    return days;
  }, [settings.workingDays]);

  // Time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    return generateAvailableTimeSlots(
      selectedDate,
      totalDuration || 30,
      settings,
      allAppointments
    );
  }, [selectedDate, totalDuration, settings, allAppointments]);

  const toggleService = (service: ServiceItem) => {
    if (selectedServices.some((s) => s.id === service.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setClientPhone(formatted);
  };

  const handleConfirmBooking = async () => {
    if (!clientName.trim() || clientPhone.length < 14) {
      alert('Por favor, preencha seu nome e um telefone WhatsApp válido.');
      return;
    }
    if (selectedServices.length === 0 || !selectedDate || !selectedTime) {
      alert('Selecione os procedimentos, data e horário.');
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

      // Calculate end time
      const [h, m] = selectedTime.split(':').map(Number);
      const endMins = h * 60 + m + totalDuration;
      const endHour = Math.floor(endMins / 60);
      const endMin = endMins % 60;
      const endTimeSlot = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

      const newAppointment: Appointment = {
        id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        services: bookedSnapshots,
        totalPrice,
        totalCost,
        totalDuration,
        date: selectedDate,
        timeSlot: selectedTime,
        endTimeSlot,
        status: 'agendado',
        paymentStatus: 'pendente',
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
        source: 'online_cliente',
      };

      // Save into IndexedDB
      await db.saveAppointment(newAppointment);
      setCreatedAppointment(newAppointment);
      setCurrentStep(4);

      // Trigger Confetti effect
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#be185d', '#f43f5e', '#fb7185', '#fbbf24', '#ffffff'],
        });
      } catch {
        // Safe fallback
      }
    } catch (err) {
      console.error('Erro ao agendar:', err);
      alert('Houve um erro ao processar o agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Scissors':
        return <Scissors className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Eye':
        return <Eye className="w-4 h-4" />;
      case 'Smile':
        return <Smile className="w-4 h-4" />;
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      case 'Palette':
        return <Palette className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const openWhatsAppConfirmation = () => {
    if (!createdAppointment) return;
    const msg = generateWhatsAppBookingMessage(createdAppointment, settings, true);
    const cleanPhone = settings.whatsapp ? settings.whatsapp.replace(/\D/g, '') : '';
    const targetUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${msg}`
      : `https://api.whatsapp.com/send?text=${msg}`;
    window.open(targetUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-20">
      {/* Top Banner with Studio Brand */}
      <header className="relative bg-gradient-to-b from-rose-950 via-rose-900 to-rose-800 text-white pt-8 pb-12 px-4 shadow-lg overflow-hidden">
        {/* Subtle glowing decorative accents */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl mx-auto relative z-10">
          {/* Admin Exit Bar */}
          {onExitClientMode && (
            <div className="flex justify-between items-center mb-6">
              <span className="text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-white/10 text-rose-200 border border-white/10 backdrop-blur-xs">
                🌐 Visualização da Cliente
              </span>
              <button
                onClick={onExitClientMode}
                className="text-xs font-semibold text-rose-200 hover:text-white bg-black/30 hover:bg-black/40 px-3 py-1.5 rounded-xl transition border border-white/10"
              >
                Voltar ao Painel Admin
              </button>
            </div>
          )}

          {/* Studio Profile */}
          <div className="flex items-center gap-4">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.studioName}
                className="w-18 h-18 rounded-2xl object-cover border-2 border-white/30 shadow-xl bg-white/10 flex-shrink-0"
              />
            ) : (
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center font-bold text-2xl border-2 border-white/30 shadow-xl flex-shrink-0">
                <Sparkles className="w-8 h-8" />
              </div>
            )}

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
                {settings.studioName}
              </h1>
              <p className="text-xs text-rose-200 leading-relaxed line-clamp-2">{settings.slogan}</p>
            </div>
          </div>

          {/* Studio info badges */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs text-rose-100/90">
            {settings.address && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-300 flex-shrink-0" />
                <span className="truncate max-w-[240px]">{settings.address}</span>
              </div>
            )}
            {settings.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-rose-300 flex-shrink-0" />
                <span>{settings.phone}</span>
              </div>
            )}
            {settings.instagram && (
              <div className="flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-rose-300 flex-shrink-0" />
                <span>{settings.instagram}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Booking Container */}
      <main className="max-w-xl mx-auto px-4 -mt-6">
        {/* Step Progress Bar */}
        {currentStep < 4 && (
          <div className="bg-white rounded-2xl shadow-md p-3.5 mb-5 border border-neutral-100 flex items-center justify-between">
            {[
              { num: 1, label: 'Serviços' },
              { num: 2, label: 'Data & Hora' },
              { num: 3, label: 'Seus Dados' },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div
                  onClick={() => {
                    if (s.num < currentStep) setCurrentStep(s.num as any);
                  }}
                  className={`flex items-center gap-2 cursor-pointer transition ${
                    currentStep === s.num
                      ? 'text-rose-600 font-bold'
                      : currentStep > s.num
                      ? 'text-emerald-600 font-semibold'
                      : 'text-neutral-400'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                      currentStep === s.num
                        ? 'bg-rose-600 text-white shadow-xs'
                        : currentStep > s.num
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {currentStep > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </span>
                  <span className="text-xs hidden sm:inline">{s.label}</span>
                </div>
                {idx < 2 && <div className="h-0.5 flex-1 mx-2 bg-neutral-100" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* STEP 1: SELECT SERVICES */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition active:scale-95 ${
                  selectedCategory === 'all'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                Todos os Procedimentos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition active:scale-95 ${
                    selectedCategory === cat.id
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {getCategoryIcon(cat.iconName)}
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Notice if configured */}
            {settings.bookingNotice && (
              <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-xs text-amber-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{settings.bookingNotice}</p>
              </div>
            )}

            {/* Service Cards */}
            <div className="space-y-3">
              {filteredServices.map((service) => {
                const isSelected = selectedServices.some((s) => s.id === service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service)}
                    className={`rounded-2xl p-4 transition cursor-pointer border-2 shadow-xs bg-white flex gap-3.5 items-start ${
                      isSelected
                        ? 'border-rose-500 ring-2 ring-rose-100 bg-rose-50/20'
                        : 'border-neutral-200/80 hover:border-neutral-300'
                    }`}
                  >
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-18 h-18 rounded-xl object-cover flex-shrink-0 border border-neutral-100"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-18 h-18 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                          {service.name}
                        </h3>
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition ${
                            isSelected
                              ? 'bg-rose-600 text-white'
                              : 'border border-neutral-300 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </span>
                      </div>

                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-xs">
                        <span className="font-bold text-rose-600 text-sm">
                          {formatCurrency(service.price)}
                        </span>
                        <span className="text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.durationMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Floating Bar when at least 1 service is selected */}
            {selectedServices.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-4 z-40 shadow-2xl">
                <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-neutral-500">
                      {selectedServices.length}{' '}
                      {selectedServices.length === 1 ? 'procedimento' : 'procedimentos'} •{' '}
                      {totalDuration} min
                    </span>
                    <div className="text-lg font-extrabold text-neutral-900">
                      {formatCurrency(totalPrice)}
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white px-5 py-3 font-semibold text-sm shadow-md hover:from-rose-700 hover:to-pink-700 transition active:scale-95"
                  >
                    <span>Escolher Data & Hora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SELECT DATE & TIME */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Selected Summary Card */}
            <div className="rounded-2xl bg-rose-50/70 border border-rose-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                  Procedimentos Selecionados ({selectedServices.length})
                </span>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  Alterar
                </button>
              </div>
              <div className="space-y-1">
                {selectedServices.map((s) => (
                  <div key={s.id} className="flex justify-between text-xs text-neutral-700">
                    <span>{s.name}</span>
                    <span className="font-semibold">{formatCurrency(s.price)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-rose-200/60 flex justify-between text-xs font-bold text-neutral-900">
                <span>Duração Estimada: {totalDuration} min</span>
                <span>Total: {formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {/* Date Picker Horizontal Carousel */}
            <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs">
              <label className="block text-xs font-bold text-neutral-700 mb-3 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-rose-600" />
                <span>Escolha o Dia do Atendimento</span>
              </label>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {availableDays.map((d) => {
                  const isSelected = selectedDate === d.dateStr;
                  const isDisabled = !d.isWorkingDay;

                  return (
                    <button
                      key={d.dateStr}
                      disabled={isDisabled}
                      onClick={() => {
                        setSelectedDate(d.dateStr);
                        setSelectedTime(''); // Reset time when date changes
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition text-center ${
                        isDisabled
                          ? 'opacity-30 bg-neutral-100 cursor-not-allowed text-neutral-400'
                          : isSelected
                          ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                          : 'bg-neutral-50 hover:bg-rose-50 text-neutral-700 border border-neutral-100'
                      }`}
                    >
                      <span className="text-[10px] font-medium tracking-tight">
                        {d.weekDayName}
                      </span>
                      <span className="text-base font-bold my-0.5">{d.dayNum}</span>
                      {d.isToday && (
                        <span
                          className={`text-[9px] px-1 rounded-sm font-semibold ${
                            isSelected ? 'bg-white/20 text-white' : 'text-rose-600'
                          }`}
                        >
                          Hoje
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs">
              <label className="block text-xs font-bold text-neutral-700 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span>Horários Disponíveis ({formatDateHuman(selectedDate)})</span>
                </span>
                <span className="text-[11px] text-neutral-400 font-normal">
                  {totalDuration} min necessários
                </span>
              </label>

              {timeSlots.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-6">
                  Nenhum horário disponível para esta data. Por favor, escolha outro dia.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {timeSlots.map((ts) => {
                    const isSelected = selectedTime === ts.slot;
                    return (
                      <button
                        key={ts.slot}
                        disabled={!ts.available}
                        onClick={() => setSelectedTime(ts.slot)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                          !ts.available
                            ? 'bg-neutral-100 text-neutral-300 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-neutral-900 text-white shadow-sm ring-2 ring-neutral-700 scale-105'
                            : 'bg-neutral-50 hover:bg-rose-50 text-neutral-800 border border-neutral-200'
                        }`}
                      >
                        <span>{ts.slot}</span>
                        {!ts.available && (
                          <span className="text-[9px] text-neutral-400 no-underline font-normal">
                            Ocupado
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 rounded-xl border border-neutral-300 py-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                disabled={!selectedTime}
                onClick={() => setCurrentStep(3)}
                className={`flex-1 rounded-xl py-3 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 shadow-md ${
                  selectedTime
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 active:scale-95'
                    : 'bg-neutral-300 cursor-not-allowed'
                }`}
              >
                <span>Avançar para Seus Dados</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CLIENT DETAILS & CONFIRM */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Booking Summary Box */}
            <div className="rounded-2xl bg-neutral-900 text-white p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div>
                  <span className="text-[11px] text-rose-300 uppercase tracking-wider font-semibold">
                    Resumo do Agendamento
                  </span>
                  <div className="text-base font-bold text-white mt-0.5">
                    {formatDateBR(selectedDate)} às {selectedTime}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-neutral-400">Total</span>
                  <div className="text-lg font-extrabold text-rose-400">
                    {formatCurrency(totalPrice)}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-300">
                {selectedServices.map((s) => (
                  <div key={s.id} className="flex justify-between">
                    <span>• {s.name}</span>
                    <span className="text-neutral-400">{s.durationMinutes} min</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Form */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Seus Dados de Contato</h3>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amanda Silva"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Seu WhatsApp com DDD *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  value={clientPhone}
                  onChange={handlePhoneChange}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Enviaremos a confirmação e lembretes por este número.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Observações ou Preferências (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: primeira vez no salão, alergia a algum produto, cor preferida..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="rounded-xl border border-neutral-300 px-4 py-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                disabled={isSubmitting || !clientName || clientPhone.length < 14}
                onClick={handleConfirmBooking}
                className={`flex-1 rounded-xl py-3 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-lg ${
                  isSubmitting || !clientName || clientPhone.length < 14
                    ? 'bg-neutral-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Confirmando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirmar Agendamento</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS / CONFIRMATION */}
        {currentStep === 4 && createdAppointment && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-neutral-100 text-center space-y-6 animate-in zoom-in-95 duration-300">
            {/* Big Success Check */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-neutral-900 font-serif">
                Agendamento Confirmado com Sucesso! ✨
              </h2>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Olá, <strong>{createdAppointment.clientName}</strong>! Seu horário foi reservado no sistema do{' '}
                <strong>{settings.studioName}</strong>.
              </p>
            </div>

            {/* Ticket Card */}
            <div className="rounded-2xl bg-neutral-50 border border-neutral-200/80 p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                <span className="text-neutral-500">Data & Horário:</span>
                <span className="font-bold text-neutral-900">
                  {formatDateBR(createdAppointment.date)} às {createdAppointment.timeSlot}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                <span className="text-neutral-500">Procedimento(s):</span>
                <span className="font-semibold text-neutral-900 text-right">
                  {createdAppointment.services.map((s) => s.name).join(', ')}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                <span className="text-neutral-500">Valor Total:</span>
                <span className="font-extrabold text-rose-600 text-sm">
                  {formatCurrency(createdAppointment.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between items-start text-neutral-500 pt-1">
                <span>Endereço:</span>
                <span className="text-neutral-800 text-right max-w-[200px]">
                  {settings.address || 'Studio Bella'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              {/* WhatsApp Button */}
              <button
                onClick={openWhatsAppConfirmation}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 text-sm font-bold shadow-md transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Agendamento no WhatsApp do Salão</span>
              </button>

              {/* Add to Calendar (.ics) */}
              <button
                onClick={() => downloadICSFile(createdAppointment, settings)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2.5 px-4 text-xs font-semibold transition"
              >
                <CalendarPlus className="w-4 h-4 text-neutral-600" />
                <span>Adicionar ao Calendário do Meu Celular</span>
              </button>
            </div>

            {/* New Booking / Back */}
            <div className="pt-2 border-t border-neutral-100">
              <button
                onClick={() => {
                  setSelectedServices([]);
                  setSelectedTime('');
                  setCurrentStep(1);
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
              >
                Fazer outro agendamento
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
