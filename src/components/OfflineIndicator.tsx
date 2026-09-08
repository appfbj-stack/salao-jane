import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-neutral-900/95 text-white px-4 py-2.5 text-xs font-medium shadow-2xl border border-neutral-700 backdrop-blur-md animate-in slide-in-from-bottom-3">
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <div className="flex items-center gap-1.5">
        <span className="text-amber-300 font-semibold">Modo Offline</span>
        <span className="text-neutral-400">•</span>
        <span className="text-neutral-300">IndexedDB ativo (seus dados continuam salvos)</span>
      </div>
      <Database className="w-3.5 h-3.5 text-emerald-400 ml-1" />
    </div>
  );
};
