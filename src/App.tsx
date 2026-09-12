import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Scissors,
  DollarSign,
  Users,
  Settings as SettingsIcon,
  Share2,
  Sparkles,
  RefreshCw,
  Plus,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  Appointment,
  CategoryInfo,
  ClientRecord,
  FinancialTransaction,
  ServiceItem,
  StudioSettings,
} from './types';
import { db } from './db/api';
import { Header, ActiveTab } from './components/Header';
import { AgendaView } from './components/AgendaView';
import { ServicesView } from './components/ServicesView';
import { FinancialView } from './components/FinancialView';
import { ClientsView } from './components/ClientsView';
import { SettingsView } from './components/SettingsView';
import { ClientBookingView } from './components/ClientBookingView';
import { ShareLinkModal } from './components/ShareLinkModal';
import { CheckoutModal } from './components/CheckoutModal';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export function App() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<ActiveTab>('agenda');
  const [isClientMode, setIsClientMode] = useState<boolean>(false);

  // App Data from IndexedDB
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNewAptModalOpen, setIsNewAptModalOpen] = useState(false);
  const [selectedAptForCheckout, setSelectedAptForCheckout] = useState<Appointment | null>(null);
  const [newAptInitialDate, setNewAptInitialDate] = useState<string | undefined>();

  // Check if URL parameters request client booking mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('agendar') === 'true' || window.location.hash.includes('agendar')) {
      setIsClientMode(true);
    }
  }, []);

  // Fetch all state from IndexedDB
  const loadDatabaseData = useCallback(async () => {
    try {
      const [
        fetchedSettings,
        fetchedServices,
        fetchedCategories,
        fetchedAppointments,
        fetchedTransactions,
        fetchedClients,
      ] = await Promise.all([
        db.getSettings(),
        db.getServices(),
        db.getCategories(),
        db.getAppointments(),
        db.getTransactions(),
        db.getClients(),
      ]);

      setSettings(fetchedSettings);
      setServices(fetchedServices);
      setCategories(fetchedCategories);
      setAppointments(fetchedAppointments);
      setTransactions(fetchedTransactions);
      setClients(fetchedClients);
    } catch (err) {
      console.error('Error loading data from IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // Loading Screen
  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg animate-pulse mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-neutral-800">Carregando Studio Bella...</h2>
        <p className="text-xs text-neutral-500 mt-1">Conectando ao banco de dados IndexedDB</p>
      </div>
    );
  }

  // If Client Mode is Active (either via URL param or via admin preview)
  if (isClientMode) {
    return (
      <div className="relative">
        {/* Switch back to admin toolbar if accessed from inside admin */}
        <div className="sticky top-0 z-40 bg-neutral-900 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold text-rose-300">Modo de Agendamento da Cliente</span>
            <span className="hidden sm:inline text-neutral-400">
              (Esta é a página aberta pelo link compartilhado)
            </span>
          </div>
          <button
            onClick={() => {
              setIsClientMode(false);
              // Clean url query param if present
              window.history.replaceState({}, '', window.location.pathname);
            }}
            className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 text-xs transition active:scale-95 flex items-center gap-1"
          >
            <span>Voltar ao Painel do Salão</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <ClientBookingView
          services={services}
          categories={categories}
          settings={settings}
          onBookingCreated={() => {
            loadDatabaseData();
          }}
        />
        <OfflineIndicator />
      </div>
    );
  }

  const pendingAppointmentsCount = appointments.filter(
    (a) => a.status === 'agendado' && a.date >= new Date().toISOString().split('T')[0]
  ).length;

  return (
    <div className="min-h-screen bg-neutral-100/60 text-neutral-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* PWA Offline Network Banner */}
      <OfflineIndicator />

      {/* Main Admin Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenClientView={() => setIsClientMode(true)}
        pendingAppointmentsCount={pendingAppointmentsCount}
        onOpenNewAppointment={() => {
          setNewAptInitialDate(undefined);
          setIsNewAptModalOpen(true);
        }}
      />

      {/* Content Container (with pb-24 for mobile bottom navigation dock clearance) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {activeTab === 'agenda' && (
          <AgendaView
            appointments={appointments}
            services={services}
            settings={settings}
            onRefresh={loadDatabaseData}
            onOpenNewAppointment={(date) => {
              setNewAptInitialDate(date);
              setIsNewAptModalOpen(true);
            }}
            onOpenCheckout={(apt) => setSelectedAptForCheckout(apt)}
          />
        )}

        {activeTab === 'servicos' && (
          <ServicesView
            services={services}
            categories={categories}
            onRefresh={loadDatabaseData}
          />
        )}

        {activeTab === 'financeiro' && (
          <FinancialView
            transactions={transactions}
            onRefresh={loadDatabaseData}
          />
        )}

        {activeTab === 'clientes' && (
          <ClientsView
            clients={clients}
            settings={settings}
            onRefresh={loadDatabaseData}
          />
        )}

        {activeTab === 'configuracoes' && (
          <SettingsView
            settings={settings}
            onRefresh={loadDatabaseData}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        settings={settings}
        onOpenClientView={() => setIsClientMode(true)}
        onRefresh={loadDatabaseData}
      />

      <NewAppointmentModal
        isOpen={isNewAptModalOpen}
        onClose={() => setIsNewAptModalOpen(false)}
        services={services.filter((s) => s.active)}
        settings={settings}
        initialDate={newAptInitialDate}
        onCreated={loadDatabaseData}
      />

      <CheckoutModal
        isOpen={!!selectedAptForCheckout}
        appointment={selectedAptForCheckout}
        settings={settings}
        onClose={() => setSelectedAptForCheckout(null)}
        onCompleted={() => {
          loadDatabaseData();
          setSelectedAptForCheckout(null);
        }}
      />
    </div>
  );
}

export default App;
