import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Share2,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { StudioSettings } from '../types';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StudioSettings;
  onOpenClientView: () => void;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  settings,
  onOpenClientView,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  if (!isOpen) return null;

  // Build the public booking link with query parameter ?agendar=true
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const bookingUrl = `${origin}?agendar=true`;

  const inviteMessageText =
    `✨ *Agendamento Online - ${settings.studioName}* ✨\n\n` +
    `Olá! Agora você pode agendar seu horário de forma rápida e escolher seus procedimentos preferidos diretamente pelo nosso app online:\n\n` +
    `🔗 *Acesse o link:* ${bookingUrl}\n\n` +
    `📍 ${settings.address}\n` +
    `Estamos ansiosos para te receber! 💖💅💇‍♀️`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      prompt('Copie o link abaixo:', bookingUrl);
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(inviteMessageText);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {
      prompt('Copie o texto abaixo:', inviteMessageText);
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(inviteMessageText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Generate QR Code URL via free reliable QR service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    bookingUrl
  )}&bgcolor=ffffff&color=be185d&margin=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Link de Agendamento</h3>
              <p className="text-xs text-neutral-500">Envie para suas clientes agendarem sozinhas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Quick link box */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Link direto do seu Salão / Studio
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={bookingUrl}
                className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-700 font-mono focus:outline-hidden"
              />
              <button
                onClick={handleCopyLink}
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 text-xs font-semibold shadow-xs transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar pelo WhatsApp</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenClientView();
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 px-4 text-xs font-semibold shadow-xs transition active:scale-95"
            >
              <ExternalLink className="w-4 h-4 text-rose-400" />
              <span>Testar Visão da Cliente</span>
            </button>
          </div>

          {/* Ready WhatsApp Invite message preview */}
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                Mensagem pronta para Status / Direct / WhatsApp
              </span>
              <button
                onClick={handleCopyMessage}
                className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1"
              >
                {copiedMessage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar texto</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-600 whitespace-pre-line leading-relaxed bg-white/80 p-3 rounded-lg border border-rose-100/80 font-sans">
              {inviteMessageText}
            </p>
          </div>

          {/* QR Code for Studio counter / reception */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="p-2 bg-white rounded-xl border border-neutral-200 shadow-xs flex-shrink-0">
              <img
                src={qrCodeUrl}
                alt="QR Code de Agendamento"
                className="w-28 h-28 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-neutral-900">
                <QrCode className="w-4 h-4 text-rose-600" />
                <span>QR Code para Balcão / Recepção</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Suas clientes podem apontar a câmera do celular no balcão do salão e agendar os próximos retornos imediatamente!
              </p>
              <a
                href={qrCodeUrl}
                target="_blank"
                rel="noreferrer"
                download="qrcode-studio.png"
                className="inline-block text-xs font-semibold text-rose-600 hover:text-rose-700 pt-1"
              >
                Baixar imagem do QR Code
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium px-5 py-2 text-xs transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
