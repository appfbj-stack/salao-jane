import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Phone,
  RotateCcw,
  Sparkles,
  Calendar,
  Clock,
  Send,
  AlertCircle,
} from 'lucide-react';
import { Appointment, StudioSettings } from '../types';
import {
  formatDateBR,
  formatDateHuman,
  formatCurrency,
  formatPhone,
  getReminderMessageText,
  buildWhatsAppUrl,
  cleanPhoneDigits,
} from '../utils/formatters';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  settings: StudioSettings;
}

type TemplateType = 'lembrete' | 'confirmacao' | 'hoje' | 'comprovante';

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  isOpen,
  onClose,
  appointment,
  settings,
}) => {
  const [template, setTemplate] = useState<TemplateType>('lembrete');
  const [messageText, setMessageText] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);

  // Initialize or update text when appointment or template changes
  useEffect(() => {
    if (appointment) {
      // Pick template: if today, default to 'hoje' or 'lembrete'
      const today = new Date().toISOString().split('T')[0];
      const defaultTemplate: TemplateType = appointment.date === today ? 'hoje' : 'lembrete';
      setTemplate(defaultTemplate);

      const initialText = getReminderMessageText(appointment, settings, defaultTemplate);
      setMessageText(initialText);
      setPhoneInput(appointment.clientPhone || '');
    }
  }, [appointment, settings]);

  // When user switches templates
  const handleSelectTemplate = (newTemplate: TemplateType) => {
    if (!appointment) return;
    setTemplate(newTemplate);
    const newText = getReminderMessageText(appointment, settings, newTemplate);
    setMessageText(newText);
  };

  // Reset to current template default
  const handleResetToTemplate = () => {
    if (!appointment) return;
    const defaultText = getReminderMessageText(appointment, settings, template);
    setMessageText(defaultText);
  };

  if (!isOpen || !appointment) return null;

  const rawDigits = cleanPhoneDigits(phoneInput);
  const whatsAppUrl = buildWhatsAppUrl(phoneInput, messageText);
  const isPhoneValid = rawDigits.length >= 10;

  const copyTextToClipboard = async (text: string, isLink: boolean) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      if (isLink) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } else {
        setCopiedMessage(true);
        setTimeout(() => setCopiedMessage(false), 2500);
      }
    } catch (err) {
      console.error('Erro ao copiar para área de transferência:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsAppUrl, '_blank');
  };

  const serviceNames = appointment.services.map((s) => s.name).join(', ');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden my-6">
        {/* Header with WhatsApp green accent */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-4 sm:p-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white/20" />
              </div>
              <div>
                <h3 id="reminder-modal-title" className="text-base sm:text-lg font-extrabold leading-tight">
                  Lembrete de Atendimento via WhatsApp
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                  Gere o link personalizado para avisar {appointment.clientName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Info Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-white/15 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-emerald-200" />
              {formatDateBR(appointment.date)} ({formatDateHuman(appointment.date)})
            </span>
            <span className="bg-white/15 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 border border-white/10">
              <Clock className="w-3.5 h-3.5 text-emerald-200" />
              {appointment.timeSlot} ({appointment.totalDuration} min)
            </span>
            <span className="bg-white/15 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 border border-white/10">
              {formatCurrency(appointment.totalPrice)}
            </span>
            <span className="bg-emerald-900/40 text-emerald-100 px-2.5 py-1 rounded-lg font-semibold border border-emerald-400/30 truncate max-w-xs">
              ✂️ {serviceNames}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Template Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
              1. Escolha o Modelo de Lembrete:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'lembrete', label: 'Lembrete Geral', desc: 'Horário + Local' },
                { id: 'confirmacao', label: 'Pedir Confirmação', desc: 'Resposta SIM/NÃO' },
                { id: 'hoje', label: 'Horário de Hoje', desc: 'Aviso rápido' },
                { id: 'comprovante', label: 'Comprovante', desc: 'Pós-atendimento' },
              ].map((item) => {
                const isSelected = template === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTemplate(item.id as TemplateType)}
                    className={`p-2.5 rounded-xl text-left border transition text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <span className="font-bold flex items-center justify-between">
                      {item.label}
                      {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                    </span>
                    <span className="text-[10px] text-neutral-500 mt-1">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client Phone confirmation & edit */}
          <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-neutral-800">
                    Número do WhatsApp da Cliente:
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Destinatário: <strong className="text-neutral-700">{appointment.clientName}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="(DDD) 99999-9999"
                  className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-mono font-bold text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-44"
                />
                {!isPhoneValid && (
                  <span className="text-[11px] text-amber-600 flex items-center gap-1 font-medium" title="Número pode estar sem DDD">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Direct WhatsApp Link Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>2. Link Automático do WhatsApp:</span>
              </label>
              <button
                type="button"
                onClick={() => copyTextToClipboard(whatsAppUrl, true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition active:scale-95"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 bg-neutral-100/90 rounded-xl p-2 border border-neutral-200">
              <input
                type="text"
                readOnly
                value={whatsAppUrl}
                className="w-full bg-transparent text-[11px] font-mono text-neutral-600 select-all focus:outline-hidden truncate"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={() => copyTextToClipboard(whatsAppUrl, true)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition active:scale-95"
              >
                {copiedLink ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Ao abrir este link, o WhatsApp carrega o número e a mensagem preenchida pronta para disparo.
            </p>
          </div>

          {/* Editable Message Text & WhatsApp Chat Bubble Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Editor Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  3. Texto da Mensagem (Editável):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetToTemplate}
                    className="text-[11px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1"
                    title="Restaurar texto padrão do modelo"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyTextToClipboard(messageText, false)}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    {copiedMessage ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Texto Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Texto</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={9}
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs text-neutral-900 leading-relaxed font-sans focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Digite a mensagem personalizada..."
              />
              <span className="text-[10px] text-neutral-400 block mt-0.5">
                Use *palavra* para negrito e _palavra_ para itálico no WhatsApp.
              </span>
            </div>

            {/* WhatsApp Chat Preview */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Prévia do Balão do WhatsApp:
              </label>

              <div className="rounded-2xl bg-[#eae6df] border border-neutral-300/80 p-3.5 h-[210px] sm:h-[225px] overflow-y-auto flex flex-col justify-end shadow-inner relative">
                {/* Wallpaper watermark simulation */}
                <div className="absolute top-2 left-0 right-0 text-center">
                  <span className="text-[10px] font-semibold text-neutral-500 bg-white/80 px-2 py-0.5 rounded-full shadow-2xs">
                    {formatDateHuman(appointment.date)}
                  </span>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="bg-[#dcf8c6] text-neutral-900 text-xs rounded-2xl rounded-tr-xs p-3 shadow-xs max-w-full space-y-1.5 relative border border-emerald-100">
                  <div className="whitespace-pre-wrap leading-relaxed break-words font-sans">
                    {messageText}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-neutral-500 mt-1">
                    <span>{appointment.timeSlot}</span>
                    <span className="text-emerald-700 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-neutral-50 p-4 sm:p-5 border-t border-neutral-200 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition"
          >
            Fechar
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => copyTextToClipboard(whatsAppUrl, true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-700" />
                  <span>Copiar Link do WhatsApp</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="whatsapp-open-btn"
              onClick={handleOpenWhatsApp}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Abrir no WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
