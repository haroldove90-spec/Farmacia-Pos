import React from 'react';
import {
  Calendar,
  FileText,
  UserPlus,
  Volume2,
  DollarSign,
  ShoppingBag,
  QrCode,
  Calculator,
  BarChart3,
  Package,
  Truck,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { UserRole } from '../types';

interface BottomBarProps {
  currentRole: UserRole;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  waitingCount?: number;
  unredeemedPrescriptionsCount?: number;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  currentRole,
  currentTab,
  onSelectTab,
  waitingCount = 0,
  unredeemedPrescriptionsCount = 0
}) => {
  const getNavItems = () => {
    switch (currentRole) {
      case 'medico':
        return [
          {
            id: 'agenda',
            label: 'Agenda',
            icon: Calendar,
            badge: waitingCount > 0 ? waitingCount : undefined
          },
          {
            id: 'consulta',
            label: 'Consulta',
            icon: FileText
          },
          {
            id: 'recetas',
            label: 'Recetas',
            icon: QrCode
          },
          {
            id: 'certificados',
            label: 'Constancias',
            icon: ShieldCheck
          }
        ];
      case 'recepcion':
        return [
          {
            id: 'triaje',
            label: 'Admisión',
            icon: UserPlus
          },
          {
            id: 'turnos',
            label: 'Llamador',
            icon: Volume2,
            badge: waitingCount > 0 ? waitingCount : undefined
          },
          {
            id: 'cobro',
            label: 'Cobro',
            icon: DollarSign
          },
          {
            id: 'directorio',
            label: 'Pacientes',
            icon: FileText
          }
        ];
      case 'cajero':
        return [
          {
            id: 'pos',
            label: 'Vender POS',
            icon: ShoppingBag
          },
          {
            id: 'canje_receta',
            label: 'Recetas',
            icon: QrCode,
            badge: unredeemedPrescriptionsCount > 0 ? unredeemedPrescriptionsCount : undefined
          },
          {
            id: 'caja',
            label: 'Caja & Z',
            icon: Calculator
          },
          {
            id: 'historial_ventas',
            label: 'Tickets',
            icon: FileText
          }
        ];
      case 'admin':
        return [
          {
            id: 'resumen',
            label: 'Métricas',
            icon: BarChart3
          },
          {
            id: 'inventario',
            label: 'Inventario',
            icon: Package
          },
          {
            id: 'compras',
            label: 'Compras',
            icon: Truck
          },
          {
            id: 'auditoria',
            label: 'Auditoría',
            icon: ShieldCheck
          }
        ];
      case 'paciente':
        return [
          {
            id: 'mis_recetas',
            label: 'Mis Recetas',
            icon: QrCode
          },
          {
            id: 'citas',
            label: 'Citas',
            icon: Calendar
          },
          {
            id: 'recordatorios',
            label: 'Tratamiento',
            icon: Clock
          }
        ];
    }
  };

  const items = getNavItems();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 shadow-lg safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition active:scale-95 ${
                isActive ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center leading-none">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
