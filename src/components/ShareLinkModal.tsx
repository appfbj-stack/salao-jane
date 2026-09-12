import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Share2,
  MessageCircle,
  Sparkles,
  RotateCcw,
  Save,
  Link as LinkIcon,
  Phone,
  Send,
  Edit3,
} from 'lucide-react';
import { StudioSettings } from '../types';
import { db } from '../db/api';
import { cleanPhoneDigits } from '../utils/formatters';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StudioSettings;
  onOpenClientView?: () => void;
  onRefresh?: () => void;
}

type TemplateKey = 'padrao' | 'novidade' | 'retorno' | 'promocao';

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  settings,
  onOpenClientView,
  onRefresh,
}) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const bookingUrl = `${origin}${pathname}?agendar=true`;

  const getTemplateContent = (key: TemplateKey): string => {
    switch (key) {
      case 'novidade':
        return (
          `🌸 *Novidade no ${settings.studioName || 'Studio'}!* 🌸\n\n` +
          `Para sua comodidade, agora temos agendamento online 24h! Você pode escolher seus procedimentos favoritos, consultar valores e escolher o melhor dia e horário:\n\n` +
          `👉 *Clique no link para agendar:* ${bookingUrl}\n\n` +
          (settings.address ? `📍 ${settings.address}\n` : '') +
          `Te esperamos com todo carinho! ✨💕💅`
        );
      case 'retorno':
        return (
          `💅 *Hora de cuidar de você no ${settings.studioName || 'Studio'}!* ✨\n\n` +
          `Olá querida! Passando para lembrar de garantir o seu horário na nossa agenda. Escolha o dia e horário que preferir diretamente pelo link:\n\n` +
          `🔗 *Agende seu horário aqui:* ${bookingUrl}\n\n` +
          (settings.address ? `📍 ${settings.address}\n` : '') +
          `Qualquer dúvida estamos à disposição! Beijos! 💖`
        );
      case 'promocao':
        return (
          `🎉 *Horários Abertos no ${settings.studioName || 'Studio'}!* 🎉\n\n` +
          `Aproveite para renovar seu visual esta semana! Consulte nossa disponibilidade e reserve seu horário online em poucos segundos:\n\n` +
          `🔗 *Reserve agora:* ${bookingUrl}\n\n` +
          (settings.address ? `📍 ${settings.address}\n` : '') +
          `Vagas limitadas! Garanta já seu momento de beleza! ✨💇‍♀️💅`
        );
      case 'padrao':
      default:
        return (
          `✨ *Agendamento Online - ${settings.studioName || 'Studio'}* ✨\n\n` +
          `Olá! Agora você pode agendar seu horário de forma rápida e escolher seus procedimentos preferidos diretamente pelo nosso link online:\n\n` +
          `🔗 *Acesse o link:* ${bookingUrl}\n\n` +
          (settings.address ? `📍 ${settings.address}\n` : '') +
          `Estamos ansiosos para te receber! 💖💅💇‍♀️`
        );
    }
  };

  const [messageText, setMessageText] = useState<string>('');
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('padrao');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isSavedAsDefault, setIsSavedAsDefault] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  // Initialize message text when modal opens
  useEffect(() => {
    if (isOpen) {
      if (settings.customShareMessage && settings.customShareMessage.trim().length > 0) {
        // If saved message doesn't contain current booking url, ensure user can see it
        setMessageText(settings.customShareMessage);
      } else {
        setMessageText(getTemplateContent('padrao'));
      }
      setIsSavedAsDefault(false);
    }
  }, [isOpen, settings.customShareMessage, settings.studioName, settings.address, bookingUrl]);

  if (!isOpen) return null;

  const handleSelectTemplate = (key: TemplateKey) => {
    setActiveTemplate(key);
    setMessageText(getTemplateContent(key));
  };

  const handleInsertLink = () => {
    if (messageText.includes(bookingUrl)) {
      alert('O link do agendamento já está presente na sua mensagem!');
      return;
    }
    setMessageText((prev) => `${prev.trim()}\n\n🔗 *Link de Agendamento:* ${bookingUrl}`);
  };

  const handleResetDefault = () => {
    setActiveTemplate('padrao');
    setMessageText(getTemplateContent('padrao'));
  };

  const handleSaveAsDefault = async () => {
    try {
      const updated = {
        ...settings,
        customShareMessage: messageText,
      };
      await db.saveSettings(updated);
      if (onRefresh) onRefresh();
      setIsSavedAsDefault(true);
      setTimeout(() => setIsSavedAsDefault(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar mensagem padrão');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      prompt('Copie o link abaixo:', bookingUrl);
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {
      prompt('Copie o texto abaixo:', messageText);
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    const digits = cleanPhoneDigits(clientPhone);
    let fullNumber = digits;
    if (digits.length === 10 || digits.length === 11) {
      fullNumber = `55${digits}`;
    }

    if (fullNumber) {
      window.open(`https://api.whatsapp.com/send?phone=${fullNumber}&text=${encoded}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    }
  };

  // Generate QR Code URL via free reliable QR service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    bookingUrl
  )}&bgcolor=ffffff&color=be185d&margin=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-neutral-100 max-h-[92vh] overflow-y-auto my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">
                Link & Mensagem de Agendamento
              </h3>
              <p className="text-xs text-neutral-500">
                Personalize a mensagem com o link para enviar às clientes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition active:scale-95"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {/* Quick link box */}
          <div className="bg-neutral-50 rounded-2xl p-3 sm:p-3.5 border border-neutral-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-rose-600" />
                <span>Link direto do Studio</span>
              </label>
              <button
                onClick={handleCopyLink}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Apenas o Link</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={bookingUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full rounded-xl bg-white border border-neutral-200 px-3 py-2 text-xs text-neutral-700 font-mono focus:outline-hidden select-all truncate"
              />
              <button
                onClick={handleCopyLink}
                className={`shrink-0 flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-semibold transition active:scale-95 shadow-2xs ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Message Presets / Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>Modelos de Mensagem:</span>
              </label>
              <button
                onClick={handleResetDefault}
                className="text-[11px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1 transition"
                title="Restaurar modelo inicial"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Padrão</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'padrao', label: 'Convite Padrão', desc: 'Link + endereço' },
                { id: 'novidade', label: 'Novidade 24h', desc: 'Lançamento online' },
                { id: 'retorno', label: 'Lembrete Retorno', desc: 'Renovar visual' },
                { id: 'promocao', label: 'Vagas da Semana', desc: 'Horários livres' },
              ].map((tmpl) => {
                const isSelected = activeTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl.id as TemplateKey)}
                    className={`p-2 rounded-xl text-left border transition text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50 text-rose-950 ring-2 ring-rose-500/20 shadow-xs'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <span className="font-bold flex items-center justify-between">
                      {tmpl.label}
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />}
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">{tmpl.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable Message Textarea */}
          <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-rose-600" />
                <span className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                  Editar Mensagem para a Cliente
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInsertLink}
                  className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-100/80 hover:bg-rose-200/80 px-2 py-0.5 rounded-md transition"
                  title="Garante que o link esteja no texto"
                >
                  + Inserir Link
                </button>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1 transition"
                >
                  {copiedMessage ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={7}
              className="w-full rounded-xl border border-rose-200 bg-white p-3 text-xs text-neutral-800 leading-relaxed font-sans focus:outline-hidden focus:ring-2 focus:ring-rose-500 shadow-inner resize-y"
              placeholder="Digite ou personalize a mensagem que será enviada para suas clientes..."
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-neutral-500 pt-0.5">
              <span>
                💡 Dica: Use <strong>*palavra*</strong> para negrito e <strong>_palavra_</strong> para itálico no WhatsApp.
              </span>
              <button
                type="button"
                onClick={handleSaveAsDefault}
                className="self-start sm:self-auto flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-900 transition active:scale-95"
                title="Salva essa mensagem personalizada como o padrão para os próximos envios"
              >
                {isSavedAsDefault ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Salva como padrão!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-rose-600" />
                    <span>Salvar como padrão do Studio</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optional specific phone number */}
          <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-neutral-800">
                    Enviar para um WhatsApp específico (opcional):
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Deixe em branco para escolher o contato ou grupo no WhatsApp
                  </p>
                </div>
              </div>

              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(DDD) 99999-9999"
                className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-mono font-bold text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-full sm:w-44"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 text-xs font-bold shadow-md hover:shadow-lg transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>Enviar pelo WhatsApp</span>
              <Send className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              onClick={() => {
                onClose();
                if (onOpenClientView) onOpenClientView();
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white py-3 px-4 text-xs font-semibold shadow-xs transition active:scale-95"
            >
              <ExternalLink className="w-4 h-4 text-rose-400" />
              <span>Testar Visão da Cliente</span>
            </button>
          </div>

          {/* Toggle QR Code section */}
          <div className="border-t border-neutral-100 pt-3">
            <button
              type="button"
              onClick={() => setShowQrCode(!showQrCode)}
              className="w-full flex items-center justify-between text-xs font-semibold text-neutral-600 hover:text-neutral-900 py-1"
            >
              <span className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-rose-600" />
                <span>QR Code para Balcão / Recepção</span>
              </span>
              <span className="text-[11px] text-rose-600">
                {showQrCode ? 'Ocultar QR Code' : 'Ver QR Code'}
              </span>
            </button>

            {showQrCode && (
              <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in duration-200">
                <div className="p-2 bg-white rounded-xl border border-neutral-200 shadow-xs shrink-0">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code de Agendamento"
                    className="w-28 h-28 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h4 className="text-xs font-bold text-neutral-900">
                    Aponte a câmera para agendar
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Você pode imprimir ou exibir este QR Code no balcão do salão para suas clientes agendarem futuros retornos com facilidade.
                  </p>
                  <a
                    href={qrCodeUrl}
                    target="_blank"
                    rel="noreferrer"
                    download="qrcode-studio.png"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 pt-1"
                  >
                    <span>Baixar imagem do QR Code</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyMessage}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition active:scale-95"
          >
            {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMessage ? 'Mensagem Copiada!' : 'Copiar Mensagem'}</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold px-5 py-2 text-xs transition active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
