import { Appointment, StudioSettings } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount || 0);
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export function formatDateHuman(dateStr: string): string {
  if (!dateStr) return '';
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  if (dateStr === today) return 'Hoje';
  if (dateStr === tomorrow) return 'Amanhã';

  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(dateObj);
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
}

export function cleanPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function generateWhatsAppBookingMessage(
  apt: Appointment,
  settings: StudioSettings,
  isClientSide = true
): string {
  const serviceList = apt.services.map((s) => `• ${s.name} (${formatCurrency(s.price)})`).join('\n');
  const dateFormatted = formatDateBR(apt.date);

  if (isClientSide) {
    return encodeURIComponent(
      `Olá, *${settings.studioName}*! ✨\n\n` +
        `Gostaria de confirmar meu agendamento feito pelo app online:\n\n` +
        `👤 *Cliente:* ${apt.clientName}\n` +
        `📱 *WhatsApp:* ${apt.clientPhone}\n` +
        `📅 *Data:* ${dateFormatted}\n` +
        `⏰ *Horário:* ${apt.timeSlot}\n\n` +
        `✂️ *Procedimento(s):*\n${serviceList}\n\n` +
        `💵 *Valor Total:* ${formatCurrency(apt.totalPrice)}\n` +
        (apt.notes ? `📝 *Observações:* ${apt.notes}\n\n` : '\n') +
        `Aguardando confirmação! Obrigado(a)! 💕`
    );
  } else {
    // Studio sending confirmation to client
    return encodeURIComponent(
      `Olá, *${apt.clientName}*! Tudo bem? 💖\n\n` +
        `Seu agendamento no *${settings.studioName}* está confirmado!\n\n` +
        `📅 *Data:* ${dateFormatted}\n` +
        `⏰ *Horário:* ${apt.timeSlot}\n` +
        `📍 *Endereço:* ${settings.address}\n\n` +
        `✂️ *Procedimento(s):*\n${serviceList}\n\n` +
        `💵 *Total:* ${formatCurrency(apt.totalPrice)}\n\n` +
        (settings.bookingNotice ? `⚠️ _${settings.bookingNotice}_\n\n` : '') +
        `Te esperamos com todo carinho! ✨`
    );
  }
}

export function buildWhatsAppUrl(phone: string, text: string): string {
  const digits = cleanPhoneDigits(phone);
  let fullNumber = digits;
  // If Brazilian standard number without country code (e.g. 11987654321 or 1187654321)
  if (digits.length === 10 || digits.length === 11) {
    fullNumber = `55${digits}`;
  }
  const encoded = encodeURIComponent(text);
  if (fullNumber) {
    return `https://api.whatsapp.com/send?phone=${fullNumber}&text=${encoded}`;
  }
  return `https://api.whatsapp.com/send?text=${encoded}`;
}

export function getReminderMessageText(
  apt: Appointment,
  settings: StudioSettings,
  type: 'lembrete' | 'confirmacao' | 'hoje' | 'comprovante' = 'lembrete'
): string {
  const dateFormatted = formatDateBR(apt.date);
  const dayName = formatDateHuman(apt.date);
  const serviceList = apt.services.map((s) => `• ${s.name} (${formatCurrency(s.price)})`).join('\n');
  const serviceNamesOnly = apt.services.map((s) => s.name).join(', ');

  switch (type) {
    case 'confirmacao':
      return (
        `Olá, *${apt.clientName}*! Tudo bem? ✨\n\n` +
        `Passando para confirmar o seu agendamento no *${settings.studioName || 'Studio'}*:\n\n` +
        `📅 *Data:* ${dateFormatted} (${dayName})\n` +
        `⏰ *Horário:* ${apt.timeSlot}\n` +
        `✂️ *Procedimento(s):*\n${serviceList}\n` +
        `💵 *Valor:* ${formatCurrency(apt.totalPrice)}\n` +
        (settings.address ? `📍 *Endereço:* ${settings.address}\n\n` : '\n') +
        `👉 *Por favor, responda confirmando sua presença:*\n` +
        `• Digite *SIM* para confirmar\n` +
        `• Ou avise caso precise reagendar\n\n` +
        `Agradecemos a preferência! Te aguardamos! 💕`
      );

    case 'hoje':
      return (
        `Oi, *${apt.clientName}*! 🌸✨\n\n` +
        `Lembrando que *hoje* é o dia do seu atendimento no *${settings.studioName || 'Studio'}*!\n\n` +
        `⏰ *Horário:* ${apt.timeSlot}\n` +
        `✂️ *Procedimento:* ${serviceNamesOnly}\n` +
        (settings.address ? `📍 *Local:* ${settings.address}\n\n` : '\n') +
        `Estamos preparando tudo com muito carinho para receber você. Até logo! 💅💖`
      );

    case 'comprovante':
      return (
        `🧾 *COMPROVANTE DE ATENDIMENTO* 🧾\n` +
        `*${settings.studioName || 'Studio'}*\n` +
        `--------------------------------\n` +
        `👤 *Cliente:* ${apt.clientName}\n` +
        `📅 *Data:* ${dateFormatted}\n` +
        `⏰ *Horário:* ${apt.timeSlot}\n` +
        `💳 *Pagamento:* ${apt.paymentMethod ? apt.paymentMethod.toUpperCase() : 'CONCLUÍDO'}\n\n` +
        `*Serviços Realizados:*\n${serviceList}\n` +
        `--------------------------------\n` +
        `💰 *VALOR TOTAL:* ${formatCurrency(apt.totalPrice)}\n\n` +
        `Muito obrigado pela preferência e confiança! Volte sempre! ✨💖`
      );

    case 'lembrete':
    default:
      return (
        `Oi, *${apt.clientName}*! Tudo bem? 💖\n\n` +
        `Lembrete do seu horário agendado no *${settings.studioName || 'Studio'}*:\n\n` +
        `📅 *Data:* ${dateFormatted} (${dayName})\n` +
        `⏰ *Horário:* ${apt.timeSlot}\n` +
        `✂️ *Procedimento(s):*\n${serviceList}\n` +
        `💵 *Valor:* ${formatCurrency(apt.totalPrice)}\n` +
        (settings.address ? `📍 *Endereço:* ${settings.address}\n\n` : '\n') +
        (settings.bookingNotice ? `⚠️ _${settings.bookingNotice}_\n\n` : '') +
        `Se precisar remarcar, por favor nos avise com antecedência. Te esperamos! 💅✨`
      );
  }
}

export function generateWhatsAppReminderMessage(apt: Appointment, settings: StudioSettings): string {
  const text = getReminderMessageText(apt, settings, 'lembrete');
  return encodeURIComponent(text);
}

export function generateWhatsAppReceiptMessage(apt: Appointment, settings: StudioSettings): string {
  const serviceList = apt.services.map((s) => `• ${s.name}: ${formatCurrency(s.price)}`).join('\n');
  const dateFormatted = formatDateBR(apt.date);

  return encodeURIComponent(
    `🧾 *COMPROVANTE DE ATENDIMENTO* 🧾\n` +
      `*${settings.studioName}*\n` +
      `--------------------------------\n` +
      `👤 *Cliente:* ${apt.clientName}\n` +
      `📅 *Data:* ${dateFormatted}\n` +
      `💳 *Forma de Pagamento:* ${apt.paymentMethod ? apt.paymentMethod.toUpperCase() : 'PAGO'}\n\n` +
      `*Serviços Realizados:*\n${serviceList}\n` +
      `--------------------------------\n` +
      `💰 *VALOR TOTAL:* ${formatCurrency(apt.totalPrice)}\n\n` +
      `Muito obrigado pela preferência e carinho! Volte sempre! ✨💖`
  );
}

export function downloadICSFile(apt: Appointment, settings: StudioSettings) {
  const [year, month, day] = apt.date.split('-').map(Number);
  const [hour, minute] = apt.timeSlot.split(':').map(Number);

  const startDate = new Date(year, month - 1, day, hour, minute);
  const endDate = new Date(startDate.getTime() + (apt.totalDuration || 60) * 60000);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatICSDate = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  const services = apt.services.map((s) => s.name).join(', ');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Studio Bella//Agendamento//PT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:Agendamento: ${services} - ${settings.studioName}`,
    `DESCRIPTION:Procedimento no ${settings.studioName} para ${apt.clientName}. Total: ${formatCurrency(apt.totalPrice)}`,
    `LOCATION:${settings.address || 'Studio Bella'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `agendamento-${apt.date}-${apt.timeSlot.replace(':', '')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate available slots given settings and existing bookings
export function generateAvailableTimeSlots(
  dateStr: string,
  totalDurationMinutes: number,
  settings: StudioSettings,
  existingAppointments: Appointment[]
): { slot: string; available: boolean; reason?: string }[] {
  if (!dateStr || !settings) return [];

  const [openHour, openMin] = (settings.openingHour || '08:00').split(':').map(Number);
  const [closeHour, closeMin] = (settings.closingHour || '19:00').split(':').map(Number);
  const interval = settings.intervalMinutes || 30;

  const startTotalMins = openHour * 60 + openMin;
  const closeTotalMins = closeHour * 60 + closeMin;

  const slots: { slot: string; available: boolean; reason?: string }[] = [];

  // Parse existing busy intervals for this date
  const busyIntervals: { start: number; end: number }[] = [];

  // Lunch break
  if (settings.lunchBreak?.enabled && settings.lunchBreak.start && settings.lunchBreak.end) {
    const [lsh, lsm] = settings.lunchBreak.start.split(':').map(Number);
    const [leh, lem] = settings.lunchBreak.end.split(':').map(Number);
    busyIntervals.push({
      start: lsh * 60 + lsm,
      end: leh * 60 + lem,
    });
  }

  // Active appointments
  existingAppointments.forEach((apt) => {
    if (apt.date === dateStr && apt.status !== 'cancelado') {
      const [ah, am] = apt.timeSlot.split(':').map(Number);
      const aptStart = ah * 60 + am;
      const aptEnd = aptStart + (apt.totalDuration || 30);
      busyIntervals.push({ start: aptStart, end: aptEnd });
    }
  });

  const durationNeeded = Math.max(totalDurationMinutes, interval);

  for (let current = startTotalMins; current + durationNeeded <= closeTotalMins; current += interval) {
    const slotHour = Math.floor(current / 60);
    const slotMin = current % 60;
    const slotStr = `${slotHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`;
    const slotEndMins = current + durationNeeded;

    // Check collision
    let hasConflict = false;
    let conflictReason = '';

    for (const busy of busyIntervals) {
      // Overlap condition: start < busy.end and end > busy.start
      if (current < busy.end && slotEndMins > busy.start) {
        hasConflict = true;
        conflictReason = 'Horário ocupado';
        break;
      }
    }

    // Check if slot is in the past for today
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (dateStr === todayStr) {
      const currentNowMins = now.getHours() * 60 + now.getMinutes();
      if (current <= currentNowMins + 10) {
        hasConflict = true;
        conflictReason = 'Horário já passou';
      }
    }

    slots.push({
      slot: slotStr,
      available: !hasConflict,
      reason: conflictReason,
    });
  }

  return slots;
}
