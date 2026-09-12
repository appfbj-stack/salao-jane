import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  Calendar,
  DollarSign,
  MessageCircle,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Heart,
  X,
} from 'lucide-react';
import { ClientRecord, StudioSettings } from '../types';
import { db } from '../db/api';
import { formatCurrency, formatDateBR, formatPhone } from '../utils/formatters';

interface ClientsViewProps {
  clients: ClientRecord[];
  settings: StudioSettings;
  onRefresh: () => void;
  onOpenNewAppointmentForClient?: (clientName: string, clientPhone: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  settings,
  onRefresh,
  onOpenNewAppointmentForClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q))
      );
    });
  }, [clients, searchTerm]);

  const handleOpenAdd = () => {
    setEditingClient(null);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: ClientRecord) => {
    setEditingClient(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const record: ClientRecord = {
        id: editingClient ? editingClient.id : `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
        totalVisits: editingClient ? editingClient.totalVisits : 0,
        totalSpent: editingClient ? editingClient.totalSpent : 0,
        lastVisit: editingClient?.lastVisit,
        createdAt: editingClient ? editingClient.createdAt : new Date().toISOString(),
      };

      await db.saveClient(record);
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar cliente');
    }
  };

  const openWhatsAppReturnInvite = (c: ClientRecord) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const bookingUrl = `${origin}?agendar=true`;
    const msg = encodeURIComponent(
      `Olá, *${c.name}*! Tudo bem? 💖\n\n` +
        `Passando para saber como ficou o seu procedimento no *${settings.studioName}*! ✨\n\n` +
        `Quando quiser agendar sua próxima manutenção ou novo procedimento, pode escolher o melhor horário por aqui:\n` +
        `🔗 ${bookingUrl}\n\n` +
        `Estamos com novidades! Até breve! 💅💇‍♀️`
    );
    const cleanPhone = c.phone.replace(/\D/g, '');
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${msg}`
      : `https://api.whatsapp.com/send?text=${msg}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Carteira de Clientes</h2>
          <p className="text-xs text-neutral-500">
            Histórico de visitas, valor total gasto e fidelização rápida via WhatsApp.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Buscar cliente por nome, telefone ou preferências..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl bg-white border border-neutral-200 pl-10 pr-4 py-2.5 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 shadow-2xs"
        />
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-neutral-200/80 shadow-xs space-y-2">
          <Users className="w-10 h-10 text-neutral-300 mx-auto" />
          <p className="text-xs text-neutral-500">Nenhuma cliente encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-rose-300 transition"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 leading-tight">
                        {client.name}
                      </h3>
                      <span className="text-xs text-neutral-500 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-neutral-400" />
                        {client.phone || 'Sem telefone'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(client)}
                    className="text-neutral-400 hover:text-neutral-700 p-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Notes if any */}
                {client.notes && (
                  <div className="rounded-xl bg-rose-50/50 p-2.5 border border-rose-100/60 text-xs text-rose-900 leading-relaxed italic">
                    "{client.notes}"
                  </div>
                )}
              </div>

              {/* Stats & Actions */}
              <div className="pt-3 border-t border-neutral-100 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 block">Total Atendimentos</span>
                    <span className="font-bold text-neutral-900">{client.totalVisits} visitas</span>
                  </div>
                  <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 block">Total Investido</span>
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(client.totalSpent)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* WhatsApp Follow-up button */}
                  <button
                    onClick={() => openWhatsAppReturnInvite(client)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-semibold transition active:scale-95 shadow-2xs"
                    title="Chamar para retorno pelo WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Convidar Retorno</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                {editingClient ? 'Editar Cliente' : 'Cadastrar Cliente'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome da cliente"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  WhatsApp / Telefone
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Preferências / Observações
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Alergias, esmalte favorito, tamanho de cílios, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-bold shadow-md"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
