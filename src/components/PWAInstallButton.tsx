import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md hover:from-rose-700 hover:to-pink-700 transition font-medium active:scale-95 ${
          compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
        }`}
        title="Instalar aplicativo PWA"
      >
        <Download className="w-4 h-4" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/80 text-rose-800 hover:bg-rose-100 transition font-medium ${
            compact ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-1.5 text-xs'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-rose-600" />
          <span>Instalar no iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                    ✨
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">Instalar no iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-neutral-600">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-50">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <p>
                    No Safari, toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima).
                  </p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-50">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <p>
                    Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-50">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  <p>
                    Toque em <strong>Adicionar</strong> no canto superior direito. Pronto!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback install button for any desktop/browser without prompt fired yet
  const [showGenericGuide, setShowGenericGuide] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowGenericGuide(true)}
        className={`flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 transition text-xs font-medium shadow-2xs ${
          compact ? 'px-2.5 py-1.5' : 'px-3 py-1.5'
        }`}
        title="Instalar App na tela inicial"
      >
        <Download className="w-3.5 h-3.5 text-neutral-500" />
        <span>Instalar PWA</span>
      </button>

      {showGenericGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  📲
                </div>
                <h3 className="text-base font-bold text-neutral-900">Como Instalar o App PWA</h3>
              </div>
              <button
                onClick={() => setShowGenericGuide(false)}
                className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-600">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/60">
                <p className="font-semibold text-neutral-800 mb-1">💻 No Computador (Chrome / Edge):</p>
                <p>Clique no ícone de instalação (computador com seta para baixo) na barra de endereços do navegador ou no menu de três pontos (⋮) &gt; &quot;Instalar Studio Bella&quot;.</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/60">
                <p className="font-semibold text-neutral-800 mb-1">📱 No Celular (Android / iOS):</p>
                <p>Abra as opções do navegador (⋮ ou Compartilhar) e selecione &quot;Adicionar à tela inicial&quot; ou &quot;Instalar aplicativo&quot;.</p>
              </div>
            </div>

            <button
              onClick={() => setShowGenericGuide(false)}
              className="mt-5 w-full rounded-xl bg-neutral-900 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition active:scale-95"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
