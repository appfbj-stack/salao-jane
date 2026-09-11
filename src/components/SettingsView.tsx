import React, { useState } from 'react';
import {
  Settings,
  Upload,
  Image as ImageIcon,
  Save,
  Clock,
  MapPin,
  Phone,
  Instagram,
  QrCode,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  CheckCircle,
  Database,
  Trash2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { StudioSettings } from '../types';
import { db } from '../db/indexedDb';
import { formatPhone } from '../utils/formatters';

interface SettingsViewProps {
  settings: StudioSettings;
  onRefresh: () => void;
  onOpenShareModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onRefresh,
  onOpenShareModal,
}) => {
  const [formData, setFormData] = useState<StudioSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleInputChange = (field: keyof StudioSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter menos de 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleInputChange('logoUrl', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleWorkingDay = (dayIndex: number) => {
    const current = formData.workingDays || [1, 2, 3, 4, 5, 6];
    let updated: number[];
    if (current.includes(dayIndex)) {
      updated = current.filter((d) => d !== dayIndex);
    } else {
      updated = [...current, dayIndex].sort();
    }
    handleInputChange('workingDays', updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await db.saveSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const json = await db.exportFullBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-studio-bella-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Erro ao exportar backup');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await db.importFullBackup(content);
      if (success) {
        setImportStatus('Backup restaurado com sucesso!');
        setTimeout(() => setImportStatus(null), 4000);
        onRefresh();
      } else {
        alert('Falha ao restaurar backup. Verifique se o arquivo é válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = async () => {
    if (
      confirm(
        'Tem certeza que deseja restaurar os dados de demonstração do Studio Bella? Todos os dados atuais serão substituídos pelo modelo inicial.'
      )
    ) {
      await db.resetToInitialDefaults();
      onRefresh();
      window.location.reload();
    }
  };

  const daysOfWeek = [
    { index: 0, name: 'Dom' },
    { index: 1, name: 'Seg' },
    { index: 2, name: 'Ter' },
    { index: 3, name: 'Qua' },
    { index: 4, name: 'Qui' },
    { index: 5, name: 'Sex' },
    { index: 6, name: 'Sáb' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Configurações do Salão &amp; Personalização</h2>
          <p className="text-xs text-neutral-500">
            Personalize a logo, nome, horários de atendimento, chave Pix e backup do IndexedDB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 px-3.5 py-2 text-xs font-semibold transition"
          >
            <Share2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Compartilhar Link</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">
            Todas as alterações foram salvas com sucesso no banco IndexedDB local!
          </span>
        </div>
      )}

      {importStatus && (
        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 flex items-center gap-3 text-xs text-blue-800 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span className="font-semibold">{importStatus}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* LOGO & VISUAL IDENTITY */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span>Logo &amp; Identidade Visual do Studio</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Logo Preview */}
            <div className="relative group">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Logo"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-rose-200 shadow-md bg-neutral-50"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex flex-col items-center justify-center font-bold text-xs shadow-md">
                  <Sparkles className="w-8 h-8 mb-1" />
                  <span>Sem Logo</span>
                </div>
              )}

              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={() => handleInputChange('logoUrl', '')}
                  className="absolute -top-2 -right-2 p-1 bg-neutral-900 text-white rounded-full text-xs shadow-md hover:bg-rose-600 transition"
                  title="Remover logo"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Logo Actions */}
            <div className="space-y-2 flex-1">
              <span className="text-xs font-semibold text-neutral-800 block">
                Envie a Logo do seu Salão / Estética
              </span>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                A logo aparecerá no topo do aplicativo, na página de agendamento online das clientes e nos comprovantes.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <label className="cursor-pointer flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Enviar Logo (Arquivo / Foto)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Preset Logos */}
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange(
                      'logoUrl',
                      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 text-xs font-medium"
                >
                  Foto Salão Elegante
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange(
                      'logoUrl',
                      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80'
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 text-xs font-medium"
                >
                  Foto Estética &amp; Spa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BASIC DATA */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900">Informações de Contato &amp; Endereço</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nome do Salão / Studio *
              </label>
              <input
                type="text"
                required
                value={formData.studioName}
                onChange={(e) => handleInputChange('studioName', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Slogan / Frase de Apresentação
              </label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => handleInputChange('slogan', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                WhatsApp Principal (para receber agendamentos) *
              </label>
              <input
                type="tel"
                required
                placeholder="(11) 99999-9999"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', formatPhone(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Instagram (@studio)
              </label>
              <input
                type="text"
                placeholder="@studiobella.estetica"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Endereço Completo do Studio *
              </label>
              <input
                type="text"
                required
                placeholder="Rua / Avenida, Número, Bairro, Cidade - UF"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        {/* PIX CONFIGURATION */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Dados de Recebimento PIX</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Tipo da Chave PIX
              </label>
              <select
                value={formData.pixKeyType}
                onChange={(e) => handleInputChange('pixKeyType', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <option value="email">E-mail</option>
                <option value="telefone">Telefone / Celular</option>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="aleatoria">Chave Aleatória (EVP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Chave PIX
              </label>
              <input
                type="text"
                placeholder="Chave para receber os pagamentos"
                value={formData.pixKey}
                onChange={(e) => handleInputChange('pixKey', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* BUSINESS HOURS & WORKING DAYS */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-600" />
            <span>Horários de Atendimento &amp; Intervalos</span>
          </h3>

          {/* Working Days */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              Dias da Semana com Atendimento:
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((d) => {
                const isActive = (formData.workingDays || []).includes(d.index);
                return (
                  <button
                    key={d.index}
                    type="button"
                    onClick={() => handleToggleWorkingDay(d.index)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                    }`}
                  >
                    {d.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Abertura
              </label>
              <input
                type="time"
                value={formData.openingHour}
                onChange={(e) => handleInputChange('openingHour', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Fechamento
              </label>
              <input
                type="time"
                value={formData.closingHour}
                onChange={(e) => handleInputChange('closingHour', e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Intervalo entre Slots (minutos)
              </label>
              <select
                value={formData.intervalMinutes}
                onChange={(e) => handleInputChange('intervalMinutes', parseInt(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
              </select>
            </div>
          </div>

          {/* Lunch Break */}
          <div className="pt-2 border-t border-neutral-100 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="lunch_enabled"
                checked={formData.lunchBreak?.enabled}
                onChange={(e) =>
                  handleInputChange('lunchBreak', {
                    ...formData.lunchBreak,
                    enabled: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-neutral-300"
              />
              <label htmlFor="lunch_enabled" className="text-xs font-semibold text-neutral-700">
                Pausa para Almoço / Intervalo (bloquear horários)
              </label>
            </div>

            {formData.lunchBreak?.enabled && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-1">Início Almoço</label>
                  <input
                    type="time"
                    value={formData.lunchBreak.start}
                    onChange={(e) =>
                      handleInputChange('lunchBreak', {
                        ...formData.lunchBreak,
                        start: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-1">Fim Almoço</label>
                  <input
                    type="time"
                    value={formData.lunchBreak.end}
                    onChange={(e) =>
                      handleInputChange('lunchBreak', {
                        ...formData.lunchBreak,
                        end: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Booking Notice */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Aviso de Agendamento (Regras &amp; Tolerância mostradas às clientes)
            </label>
            <textarea
              rows={2}
              value={formData.bookingNotice}
              onChange={(e) => handleInputChange('bookingNotice', e.target.value)}
              placeholder="Ex: Tolerância de 10 minutos de atraso. Cancelamentos com 2h de antecedência."
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Custom Share Message */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-700">
                Mensagem Padrão de Envio do Link (WhatsApp / Redes)
              </label>
              <button
                type="button"
                onClick={onOpenShareModal}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <Share2 className="w-3 h-3" />
                <span>Abrir Editor Completo</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={formData.customShareMessage || ''}
              onChange={(e) => handleInputChange('customShareMessage', e.target.value)}
              placeholder="Deixe em branco para usar o modelo padrão com link e endereço, ou digite aqui seu texto personalizado fixo..."
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
            <span className="text-[11px] text-neutral-400 block mt-1">
              Dica: Você também pode personalizar livremente a mensagem na janela de envio rápido de link com modelos e prévia.
            </span>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold px-6 py-3 text-sm shadow-md transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Todas as Configurações'}</span>
          </button>
        </div>
      </form>

      {/* INDEXEDDB BACKUP & RECOVERY */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-rose-600" />
          <span>Backup &amp; Segurança dos Dados (IndexedDB)</span>
        </h3>
        <p className="text-xs text-neutral-500">
          Seus agendamentos, clientes, procedimentos e lançamentos financeiros estão salvos com segurança no armazenamento local IndexedDB do navegador.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 text-xs font-semibold transition shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Baixar Backup Completo (JSON)</span>
          </button>

          {/* Import JSON */}
          <label className="cursor-pointer flex items-center gap-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-4 py-2.5 text-xs font-semibold transition">
            <Upload className="w-4 h-4 text-neutral-500" />
            <span>Restaurar Backup (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          {/* Reset Defaults */}
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2.5 text-xs font-semibold transition"
          >
            <RefreshCw className="w-4 h-4 text-rose-600" />
            <span>Restaurar Dados Padrão</span>
          </button>
        </div>
      </div>
    </div>
  );
};
