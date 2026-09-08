import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Scissors,
  Eye,
  Smile,
  Flame,
  Palette,
  Search,
  Check,
  X,
  Clock,
  DollarSign,
  Image as ImageIcon,
  Tag,
  Upload,
} from 'lucide-react';
import { CategoryInfo, ServiceItem } from '../types';
import { db } from '../db/indexedDb';
import { formatCurrency } from '../utils/formatters';

interface ServicesViewProps {
  services: ServiceItem[];
  categories: CategoryInfo[];
  onRefresh: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  categories,
  onRefresh,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('cabelo');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [price, setPrice] = useState(80);
  const [costPrice, setCostPrice] = useState(10);
  const [commissionRate, setCommissionRate] = useState(0);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesDesc = s.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [services, selectedCategory, searchTerm]);

  const handleOpenAdd = () => {
    setEditingService(null);
    setName('');
    setCategory(categories[0]?.id || 'cabelo');
    setDurationMinutes(60);
    setPrice(80);
    setCostPrice(10);
    setCommissionRate(0);
    setDescription('');
    setImageUrl('');
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: ServiceItem) => {
    setEditingService(s);
    setName(s.name);
    setCategory(s.category);
    setDurationMinutes(s.durationMinutes);
    setPrice(s.price);
    setCostPrice(s.costPrice || 0);
    setCommissionRate(s.commissionRate || 0);
    setDescription(s.description || '');
    setImageUrl(s.imageUrl || '');
    setActive(s.active);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o procedimento "${name}"?`)) {
      try {
        await db.deleteService(id);
        onRefresh();
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir serviço.');
      }
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Preencha o nome do procedimento.');
      return;
    }

    try {
      const item: ServiceItem = {
        id: editingService ? editingService.id : `srv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        category,
        durationMinutes: Number(durationMinutes) || 30,
        price: Number(price) || 0,
        costPrice: Number(costPrice) || 0,
        commissionRate: Number(commissionRate) || 0,
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
        active,
        order: editingService ? editingService.order : services.length + 1,
      };

      await db.saveService(item);
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar procedimento.');
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
        return <Tag className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Catálogo de Procedimentos</h2>
          <p className="text-xs text-neutral-500">
            Cadastre cortes, unhas, sobrancelhas, estética e defina preços e custos de insumos.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Procedimento</span>
        </button>
      </div>

      {/* Categories & Search Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            Todos ({services.length})
          </button>
          {categories.map((cat) => {
            const count = services.filter((s) => s.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {getCategoryIcon(cat.iconName)}
                <span>
                  {cat.name} ({count})
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar procedimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-white border border-neutral-200 pl-8 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => {
          const cat = categories.find((c) => c.id === service.category);
          const profit = service.price - (service.costPrice || 0);

          return (
            <div
              key={service.id}
              className={`bg-white rounded-2xl border p-4 shadow-xs transition flex flex-col justify-between space-y-3 ${
                service.active ? 'border-neutral-200/90' : 'border-neutral-200 opacity-60 bg-neutral-50'
              }`}
            >
              <div className="space-y-3">
                {/* Image & Category tag */}
                <div className="relative h-36 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-100">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-rose-50 text-rose-400">
                      <Sparkles className="w-10 h-10" />
                    </div>
                  )}

                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                    {cat?.name || service.category}
                  </span>

                  {!service.active && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white">
                      Inativo
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {service.description || 'Sem descrição cadastrada.'}
                  </p>
                </div>
              </div>

              {/* Financial & Duration Breakdown */}
              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-neutral-500">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{service.durationMinutes} min</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-neutral-400 mr-1">Preço:</span>
                    <span className="text-sm font-extrabold text-rose-600">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                </div>

                {/* Cost & Profit Strip */}
                <div className="rounded-xl bg-neutral-50 p-2 border border-neutral-200/60 flex justify-between text-[11px]">
                  <span className="text-neutral-500">
                    Custo Insumos: <strong>{formatCurrency(service.costPrice || 0)}</strong>
                  </span>
                  <span className="text-emerald-700 font-bold">
                    Margem Lucro: {formatCurrency(profit)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleOpenEdit(service)}
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-xl transition"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => handleDelete(service.id, service.name)}
                    className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Excluir procedimento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                {editingService ? 'Editar Procedimento' : 'Novo Procedimento'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nome do Procedimento / Serviço *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Corte Feminino + Hidratação, Alongamento em Gel..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price, Duration, Material Cost */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Preço Cobrado (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs font-bold text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Custo Insumos (R$)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    title="Custo de produtos usados para calcular lucro líquido"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Duração (minutos) *
                  </label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Descrição detalhada
                </label>
                <textarea
                  rows={2}
                  placeholder="Explique o que está incluso no procedimento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Image Upload or URL */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Foto do Procedimento
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Cole a URL da imagem ou envie um arquivo abaixo"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                  <label className="flex-shrink-0 cursor-pointer flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded-xl text-xs font-semibold transition border border-neutral-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {imageUrl && (
                  <div className="mt-2 h-24 rounded-xl overflow-hidden border border-neutral-200 w-36">
                    <img
                      src={imageUrl}
                      alt="Prévia"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="srv_active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-neutral-300"
                />
                <label htmlFor="srv_active" className="text-xs font-semibold text-neutral-700">
                  Procedimento Ativo (disponível para agendamento online)
                </label>
              </div>

              {/* Submit */}
              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-bold transition shadow-md"
                >
                  Salvar Procedimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
