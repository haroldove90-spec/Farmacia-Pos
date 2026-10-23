import React, { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Database, Check, ShieldCheck } from 'lucide-react';
import { DataService } from '../services/dataStore';

interface ClearDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClearDataModal: React.FC<ClearDataModalProps> = ({ isOpen, onClose }) => {
  const [neverReload, setNeverReload] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSampleDisabled = DataService.isSampleDisabled();

  const handleClear = () => {
    DataService.clearAllSampleData(neverReload);
    setStatusMessage('¡Datos de muestra eliminados exitosamente! El sistema está en blanco.');
    setConfirmed(true);
    setTimeout(() => {
      setStatusMessage(null);
      setConfirmed(false);
      onClose();
    }, 1800);
  };

  const handleRestore = () => {
    DataService.restoreSampleData();
    setStatusMessage('¡Datos de prueba restaurados para demostración y evaluación!');
    setConfirmed(true);
    setTimeout(() => {
      setStatusMessage(null);
      setConfirmed(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">
              Gestión de Datos de Muestra & Supabase
            </h3>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              Puedes limpiar todos los datos precargados (pacientes de muestra, recetas, ventas e inventario de prueba) para empezar a registrar pacientes y medicamentos reales.
            </p>
          </div>
        </div>

        {statusMessage ? (
          <div className="my-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={neverReload}
                  onChange={(e) => setNeverReload(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <div className="text-xs text-slate-700">
                  <span className="font-semibold block text-slate-900">
                    No volver a cargar datos de muestra en este navegador
                  </span>
                  Mantiene el sistema 100% en blanco para producción o conexión con base de datos en Supabase / Cloud.
                </div>
              </label>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center gap-2.5 text-xs text-teal-800">
              <Database className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>Modo Supabase Listo:</strong> La capa de datos almacena el estado localmente y está estructurada con esquemas relacionales exactos para sincronización con Supabase.
              </span>
            </div>

            {isSampleDisabled && (
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50/80 px-3 py-2 rounded-lg border border-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Actualmente la recarga de muestras está desactivada en este dispositivo.</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div>
            {isSampleDisabled && (
              <button
                type="button"
                onClick={handleRestore}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar datos demo</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-sm active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrar datos de muestra</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
