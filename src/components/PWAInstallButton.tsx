import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, CheckCircle2, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200/70">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">App Instalada</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        title="Instalar Farmacia POS en este dispositivo"
        className={`inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 font-medium text-white shadow-sm hover:from-teal-700 hover:to-cyan-700 transition active:scale-95 ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
        }`}
      >
        <Download className="w-4 h-4 shrink-0" />
        <span className="font-semibold">Instalar App</span>
      </button>

      {/* Guide modal if native prompt is unavailable or iOS */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-lg">
                <Smartphone className="w-5 h-5 text-teal-600" />
                <span>Instalar Farmacia POS</span>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <p>
                Puedes usar <strong>Farmacia POS</strong> como aplicación independiente de alta velocidad en tu teléfono, tablet o computadora:
              </p>

              {isIOS ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <Share className="w-4 h-4 text-teal-600" /> En iPhone / iPad (Safari):
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                    <li>Presiona el botón <strong>Compartir</strong> <Share className="w-3.5 h-3.5 inline mx-1" /> en la barra inferior de Safari.</li>
                    <li>Desliza hacia abajo y selecciona <strong className="text-teal-700">Agregar al inicio</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1" />.</li>
                    <li>Confirma pulsando <strong>Agregar</strong> en la esquina superior.</li>
                  </ol>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <Download className="w-4 h-4 text-teal-600" /> En Android y Computadoras:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                    <li>Abre el menú del navegador (tres puntos verticales en la esquina).</li>
                    <li>Selecciona <strong className="text-teal-700">Instalar aplicación</strong> o <strong>Agregar a la pantalla principal</strong>.</li>
                    <li>La app se añadirá a tus programas de inicio con soporte sin conexión.</li>
                  </ol>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
