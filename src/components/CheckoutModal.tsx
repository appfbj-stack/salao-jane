import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  DollarSign,
  Send,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { Appointment, PaymentMethod, StudioSettings } from '../types';
import { db } from '../db/indexedDb';
import {
  formatCurrency,
  formatDateBR,
  generateWhatsAppReceiptMessage,
} from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  settings: StudioSettings;
  onClose: () => void;
  onCompleted: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  appointment,
  settings,
  onClose,
  onCompleted,
}) => {
  if (!isOpen || !appointment) return null;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [amountPaid, setAmountPaid] = useState<number>(appointment.totalPrice);
  const [costAmount, setCostAmount] = useState<number>(appointment.totalCost || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [finished, setFinished] = useState(false);

  const profit = (amountPaid || 0) - (costAmount || 0);

  const handleFinish = async () => {
    setIsProcessing(true);
    try {
      await db.completeAppointmentAndRegisterFinance(
        appointment.id,
        paymentMethod,
        amountPaid,
        costAmount
      );
      setFinished(true);
      onCompleted();
    } catch (err) {
      console.error(err);
      alert('Erro ao finalizar comanda');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendWhatsAppReceipt = () => {
    const updatedApt: Appointment = {
      ...appointment,
      paymentMethod,
      totalPrice: amountPaid,
    };
    const msg = generateWhatsAppReceiptMessage(updatedApt, settings);
    const cleanPhone = appointment.clientPhone.replace(/\D/g, '');
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${msg}`
      : `https://api.whatsapp.com/send?text=${msg}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Baixa no Caixa &amp; Comanda</h3>
              <p className="text-xs text-neutral-500">{appointment.clientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!finished ? (
          <div className="mt-4 space-y-4">
            {/* Services breakdown */}
            <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-200/80 space-y-1.5 text-xs">
              <span className="font-bold text-neutral-700 block mb-1">Serviços Realizados:</span>
              {appointment.services.map((s, idx) => (
                <div key={idx} className="flex justify-between text-neutral-600">
                  <span>• {s.name}</span>
                  <span className="font-semibold">{formatCurrency(s.price)}</span>
                </div>
              ))}
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'pix', label: 'PIX', icon: <QrCode className="w-4 h-4 text-emerald-600" /> },
                  {
                    id: 'cartao_credito',
                    label: 'Cartão Crédito',
                    icon: <CreditCard className="w-4 h-4 text-blue-600" />,
                  },
                  {
                    id: 'cartao_debito',
                    label: 'Cartão Débito',
                    icon: <CreditCard className="w-4 h-4 text-indigo-600" />,
                  },
                  {
                    id: 'dinheiro',
                    label: 'Dinheiro',
                    icon: <Banknote className="w-4 h-4 text-amber-600" />,
                  },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition ${
                      paymentMethod === pm.id
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-200'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {pm.icon}
                    <span>{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Value & Cost adjustment */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Valor Cobrado (R$)
                </label>
                <input
                  type="number"
                  step="0.50"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm font-bold text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Custo Materiais (R$)
                </label>
                <input
                  type="number"
                  step="0.50"
                  value={costAmount}
                  onChange={(e) => setCostAmount(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Profit preview */}
            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 flex justify-between items-center text-xs">
              <span className="font-semibold text-emerald-900">Lucro Líquido deste Atendimento:</span>
              <span className="text-sm font-extrabold text-emerald-700">
                {formatCurrency(profit)}
              </span>
            </div>

            {/* Submit buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleFinish}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirmar Recebimento</span>
              </button>
            </div>
          </div>
        ) : (
          /* Finished State */
          <div className="mt-4 text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-bold text-neutral-900">
                Atendimento Concluído com Sucesso!
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                A receita de <strong>{formatCurrency(amountPaid)}</strong> foi registrada no módulo financeiro do IndexedDB.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleSendWhatsAppReceipt}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 text-xs font-bold shadow-md transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Comprovante no WhatsApp da Cliente</span>
              </button>

              <button
                onClick={onClose}
                className="w-full rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2.5 px-4 text-xs font-semibold transition"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
