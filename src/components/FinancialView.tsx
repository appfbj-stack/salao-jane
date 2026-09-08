import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  QrCode,
  Banknote,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  Trash2,
  Receipt,
  FileSpreadsheet,
  PieChart,
  CheckCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { FinancialTransaction, PaymentMethod } from '../types';
import { db } from '../db/indexedDb';
import { formatCurrency, formatDateBR } from '../utils/formatters';

interface FinancialViewProps {
  transactions: FinancialTransaction[];
  onRefresh: () => void;
}

export const FinancialView: React.FC<FinancialViewProps> = ({
  transactions,
  onRefresh,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'hoje' | 'mes' | 'todos'>('mes');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'receita' | 'despesa'>('todos');

  // Modal for manual entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trxType, setTrxType] = useState<'receita' | 'despesa'>('receita');
  const [trxCategory, setTrxCategory] = useState<FinancialTransaction['category']>('servico');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [costAmount, setCostAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [trxDate, setTrxDate] = useState(new Date().toISOString().split('T')[0]);

  // Date ranges
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (periodFilter === 'hoje' && t.date !== todayStr) return false;
      if (periodFilter === 'mes' && !t.date.startsWith(currentMonthPrefix)) return false;
      if (typeFilter !== 'todos' && t.type !== typeFilter) return false;
      return true;
    });
  }, [transactions, periodFilter, typeFilter, todayStr, currentMonthPrefix]);

  // Financial Metrics Calculation
  const metrics = useMemo(() => {
    let grossRevenue = 0;
    let totalExpenses = 0;
    let totalProductCosts = 0;
    let serviceCount = 0;

    const methodBreakdown: Record<string, number> = {
      pix: 0,
      cartao_credito: 0,
      cartao_debito: 0,
      dinheiro: 0,
      outro: 0,
    };

    filteredTransactions.forEach((t) => {
      if (t.type === 'receita') {
        grossRevenue += t.amount || 0;
        totalProductCosts += t.costAmount || 0;
        if (t.category === 'servico') serviceCount++;
        if (t.paymentMethod) {
          methodBreakdown[t.paymentMethod] = (methodBreakdown[t.paymentMethod] || 0) + t.amount;
        }
      } else {
        totalExpenses += t.amount || 0;
      }
    });

    const netProfit = grossRevenue - totalExpenses - totalProductCosts;
    const avgTicket = serviceCount > 0 ? grossRevenue / serviceCount : 0;

    return {
      grossRevenue,
      totalExpenses,
      totalProductCosts,
      netProfit,
      avgTicket,
      serviceCount,
      methodBreakdown,
    };
  }, [filteredTransactions]);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) {
      alert('Preencha a descrição e um valor válido maior que zero.');
      return;
    }

    try {
      const newTrx: FinancialTransaction = {
        id: `trx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: trxType,
        category: trxCategory,
        description: description.trim(),
        amount: Number(amount),
        costAmount: trxType === 'receita' ? Number(costAmount) || 0 : undefined,
        date: trxDate,
        paymentMethod,
        status: 'pago',
        createdAt: new Date().toISOString(),
      };

      await db.saveTransaction(newTrx);
      setIsModalOpen(false);
      setDescription('');
      setAmount(0);
      setCostAmount(0);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar transação');
    }
  };

  const handleDeleteTrx = async (id: string) => {
    if (confirm('Deseja excluir este lançamento financeiro?')) {
      await db.deleteTransaction(id);
      onRefresh();
    }
  };

  const handleExportCSV = () => {
    const headers = ['Data', 'Tipo', 'Categoria', 'Descricao', 'Valor (R$)', 'Custo (R$)', 'Forma Pagto'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      t.type.toUpperCase(),
      t.category,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      (t.costAmount || 0).toFixed(2),
      t.paymentMethod,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `extrato-financeiro-${periodFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Controle Financeiro &amp; Fluxo de Caixa</h2>
          <p className="text-xs text-neutral-500">
            Acompanhe o faturamento de cada procedimento, custos de materiais e lucro real.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Period Filter Buttons */}
          <div className="flex bg-neutral-100 p-1 rounded-xl">
            {[
              { id: 'hoje', label: 'Hoje' },
              { id: 'mes', label: 'Este Mês' },
              { id: 'todos', label: 'Todos' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriodFilter(p.id as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  periodFilter === p.id ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition"
            title="Exportar dados para Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Faturamento Bruto */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-neutral-500 font-medium">Faturamento Bruto</span>
            <div className="text-2xl font-black text-neutral-900">
              {formatCurrency(metrics.grossRevenue)}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {metrics.serviceCount} serviços cobrados
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Custos & Despesas */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-neutral-500 font-medium">Custos &amp; Insumos</span>
            <div className="text-2xl font-black text-rose-600">
              {formatCurrency(metrics.totalProductCosts + metrics.totalExpenses)}
            </div>
            <span className="text-[11px] text-neutral-400">
              Materiais ({formatCurrency(metrics.totalProductCosts)}) + Fixos
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Lucro Líquido Real */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-emerald-900 font-bold">Lucro Líquido Real</span>
            <div className="text-2xl font-black text-emerald-700">
              {formatCurrency(metrics.netProfit)}
            </div>
            <span className="text-[11px] text-emerald-800 font-medium">
              Margem limpa do Studio
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-neutral-500 font-medium">Ticket Médio</span>
            <div className="text-2xl font-black text-neutral-900">
              {formatCurrency(metrics.avgTicket)}
            </div>
            <span className="text-[11px] text-neutral-400">por atendimento</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Payment Methods Breakdown Strip */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
          Receitas por Forma de Pagamento
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-200/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-neutral-500 block">PIX</span>
              <span className="text-sm font-bold text-neutral-900">
                {formatCurrency(metrics.methodBreakdown.pix || 0)}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-200/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-neutral-500 block">Cartão Crédito</span>
              <span className="text-sm font-bold text-neutral-900">
                {formatCurrency(metrics.methodBreakdown.cartao_credito || 0)}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-200/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-neutral-500 block">Cartão Débito</span>
              <span className="text-sm font-bold text-neutral-900">
                {formatCurrency(metrics.methodBreakdown.cartao_debito || 0)}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-200/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-neutral-500 block">Dinheiro</span>
              <span className="text-sm font-bold text-neutral-900">
                {formatCurrency(metrics.methodBreakdown.dinheiro || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List / Cash Flow */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {/* Table Header & Filters */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-neutral-900">Extrato de Lançamentos</h3>
            <span className="text-xs text-neutral-400">({filteredTransactions.length})</span>
          </div>

          {/* Type Filter */}
          <div className="flex gap-1">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'receita', label: 'Receitas' },
              { id: 'despesa', label: 'Despesas' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTypeFilter(tf.id as any)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  typeFilter === tf.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-500 hover:bg-neutral-100'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 text-xs">
            Nenhum lançamento encontrado para o período selecionado.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredTransactions.map((t) => {
              const isIncome = t.type === 'receita';
              return (
                <div
                  key={t.id}
                  className="p-4 sm:px-5 flex items-center justify-between hover:bg-neutral-50/70 transition text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="font-bold text-neutral-900">{t.description}</div>
                      <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                        <span>{formatDateBR(t.date)}</span>
                        <span>•</span>
                        <span className="uppercase">{t.paymentMethod || 'PIX'}</span>
                        {t.costAmount ? (
                          <>
                            <span>•</span>
                            <span className="text-neutral-500">
                              Custo insumo: {formatCurrency(t.costAmount)}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div
                        className={`text-sm font-extrabold ${
                          isIncome ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatCurrency(t.amount)}
                      </div>
                      {isIncome && t.costAmount ? (
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          Lucro: {formatCurrency(t.amount - t.costAmount)}
                        </span>
                      ) : null}
                    </div>

                    <button
                      onClick={() => handleDeleteTrx(t.id)}
                      className="text-neutral-300 hover:text-rose-500 transition p-1"
                      title="Excluir lançamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Novo Lançamento Financeiro</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="mt-4 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTrxType('receita');
                    setTrxCategory('servico');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    trxType === 'receita'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Receita / Entrada</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTrxType('despesa');
                    setTrxCategory('material_insumo');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    trxType === 'despesa'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Despesa / Saída</span>
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Descrição do Lançamento *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    trxType === 'receita'
                      ? 'Ex: Venda de Shampoo, Procedimento avulso...'
                      : 'Ex: Compra de Esmaltes, Conta de Luz, Aluguel...'
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Amount & Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs font-bold text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {trxType === 'receita' ? (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Custo Insumo (R$)
                    </label>
                    <input
                      type="number"
                      step="0.50"
                      value={costAmount}
                      onChange={(e) => setCostAmount(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Categoria
                    </label>
                    <select
                      value={trxCategory}
                      onChange={(e) => setTrxCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="material_insumo">Material / Insumo</option>
                      <option value="aluguel_fixo">Aluguel / Custos Fixos</option>
                      <option value="comissao">Comissão Profissional</option>
                      <option value="marketing">Marketing / Anúncios</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Payment Method & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="pix">PIX</option>
                    <option value="cartao_credito">Cartão Crédito</option>
                    <option value="cartao_debito">Cartão Débito</option>
                    <option value="dinheiro">Dinheiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={trxDate}
                    onChange={(e) => setTrxDate(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Submit */}
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
                  Registrar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
