import React, { useState } from 'react';
import {
  Calendar,
  Scissors,
  DollarSign,
  Users,
  Settings,
  Share2,
  Sparkles,
  ExternalLink,
  Menu,
  X,
  Plus,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react';
import { StudioSettings } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

export type ActiveTab = 'agenda' | 'servicos' | 'financeiro' | 'clientes' | 'configuracoes';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: StudioSettings;
  onOpenShareModal: () => void;
  onOpenClientView: () => void;
  pendingAppointmentsCount: number;
  onOpenNewAppointment?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onOpenShareModal,
  onOpenClientView,
  pendingAppointmentsCount,
  onOpenNewAppointment,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const tabs: { id: ActiveTab; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    {
      id: 'agenda',
      label: 'Agenda',
      shortLabel: 'Agenda',
      icon: Calendar,
      badge: pendingAppointmentsCount > 0 ? pendingAppointmentsCount : undefined,
    },
    {
      id: 'servicos',
      label: 'Procedimentos',
      shortLabel: 'Serviços',
      icon: Scissors,
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      shortLabel: 'Caixa',
      icon: DollarSign,
    },
    {
      id: 'clientes',
      label: 'Clientes',
      shortLabel: 'Clientes',
      icon: Users,
    },
    {
      id: 'configuracoes',
      label: 'Studio & Logo',
      shortLabel: 'Studio',
      icon: Settings,
    },
  ];

  const handleCopyClientLink = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const bookingUrl = `${origin}${pathname}?agendar=true`;
    navigator.clipboard.writeText(bookingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleTabClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Primary Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Left: Hamburger (mobile/tablet) + Logo & Studio Name */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Drawer Toggle Button */}
              <button
                id="menu-toggle-button"
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 -ml-1 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition active:scale-95 focus:outline-hidden"
                aria-label="Abrir menu de navegação"
                title="Abrir menu lateral"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Logo & Branding */}
              <div
                onClick={() => setActiveTab('agenda')}
                className="flex items-center gap-2.5 cursor-pointer select-none group min-w-0"
              >
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.studioName}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-neutral-200 shadow-2xs shrink-0 group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0 group-hover:scale-105 transition">
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-sm sm:text-base font-bold text-neutral-900 leading-tight truncate">
                      {settings.studioName || 'Studio Bella'}
                    </h1>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 hidden sm:inline-block" title="IndexedDB Conectado" />
                  </div>
                  <p className="text-[11px] text-neutral-500 hidden md:block leading-none mt-0.5">
                    Painel do Studio • PWA Offline
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Desktop Navigation Tabs (Unified Single-Bar Layout) */}
            <nav className="hidden lg:flex items-center gap-1 bg-neutral-100/80 p-1 rounded-2xl border border-neutral-200/60" aria-label="Abas Principais">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`nav-tab-${tab.id}`}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 relative ${
                      isActive
                        ? 'bg-white text-rose-600 shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600' : 'text-neutral-500'}`} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-rose-100 text-rose-700' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Quick Add Appointment Button */}
              {onOpenNewAppointment && (
                <button
                  id="header-new-appointment-btn"
                  onClick={onOpenNewAppointment}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700 px-3 py-1.5 text-xs font-semibold transition active:scale-95 shadow-xs"
                  title="Novo Agendamento Rápido"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">Agendar</span>
                </button>
              )}

              {/* Share Client Link Button */}
              <button
                id="header-share-link-btn"
                onClick={onOpenShareModal}
                className="flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition active:scale-95 shadow-2xs"
                title="Copiar link para enviar para clientes"
              >
                <Share2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden md:inline">Link da Cliente</span>
              </button>

              {/* Client View Preview */}
              <button
                id="header-client-view-btn"
                onClick={onOpenClientView}
                className="hidden sm:flex items-center gap-1.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 px-3 py-1.5 text-xs font-semibold transition active:scale-95 shadow-xs"
                title="Visualizar a página pública que a cliente acessa"
              >
                <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden lg:inline">Visão da Cliente</span>
              </button>

              {/* PWA Install Button */}
              <div className="hidden sm:block">
                <PWAInstallButton compact />
              </div>
            </div>
          </div>
        </div>

        {/* Medium Screen (Tablet) Navigation Strip (visible only on md screens where lg navbar is hidden) */}
        <div className="hidden md:flex lg:hidden border-t border-neutral-100 bg-neutral-50/70 px-4 py-1.5 overflow-x-auto scrollbar-none justify-center">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Dock (Fixed at bottom for easy thumb access on smartphones) */}
      <nav
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200/90 shadow-lg md:hidden pb-safe"
        aria-label="Navegação Inferior Mobile"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`bottom-nav-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center h-full py-1 px-1 transition relative ${
                  isActive ? 'text-rose-600 font-bold' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <div
                  className={`relative p-1 rounded-xl transition ${
                    isActive ? 'bg-rose-50' : 'bg-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-rose-600 stroke-[2.25]' : 'text-neutral-500'}`} />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-2xs">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight leading-tight mt-0.5 truncate max-w-[64px]">
                  {tab.shortLabel}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-rose-600 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Slide-out Drawer Menu (Menu Lateral Deslizante) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-neutral-100 bg-neutral-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.studioName}
                    className="w-11 h-11 rounded-xl object-cover border border-neutral-200 shadow-2xs"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 leading-snug">
                    {settings.studioName || 'Studio Bella'}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {settings.phone || 'Agendamento & Gestão'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 transition"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Share Link Banner inside Drawer */}
            <div className="p-4 bg-rose-50/70 border-b border-rose-100/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-rose-600" />
                  Link de Agendamento
                </span>
                <button
                  onClick={handleCopyClientLink}
                  className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-rose-700/90 leading-relaxed">
                Envie no WhatsApp para suas clientes escolherem serviços, dia e horário sozinhas.
              </p>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenShareModal();
                }}
                className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold text-center transition active:scale-95 shadow-xs"
              >
                Enviar por WhatsApp / QR Code
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">
                Navegação
              </div>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`drawer-link-${tab.id}`}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-rose-50 text-rose-700 font-bold'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600' : 'text-neutral-500'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-xs font-bold">
                        {tab.badge}
                      </span>
                    ) : (
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-neutral-300'}`} />
                    )}
                  </button>
                );
              })}

              <div className="pt-4 border-t border-neutral-100 my-3">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">
                  Ações Rápidas
                </div>

                {onOpenNewAppointment && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenNewAppointment();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-700 hover:bg-rose-50 transition"
                  >
                    <Plus className="w-4 h-4 text-rose-600" />
                    <span>Novo Agendamento</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenClientView();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition"
                >
                  <ExternalLink className="w-4 h-4 text-neutral-500" />
                  <span>Ver Como a Cliente Vê</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer with PWA & Storage Info */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>IndexedDB Offline</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Ativo
                </span>
              </div>

              <div className="pt-1">
                <PWAInstallButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

