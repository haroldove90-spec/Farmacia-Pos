import React from 'react';
import {
  Calendar,
  FileText,
  UserPlus,
  Users,
  Volume2,
  DollarSign,
  ShoppingBag,
  QrCode,
  Calculator,
  BarChart3,
  Package,
  Truck,
  ShieldCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Trash2,
  BellRing
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentRole: UserRole;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  waitingCount?: number;
  unredeemedPrescriptionsCount?: number;
  onLogout: () => void;
  onOpenClearData: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeAlert?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  waitingCount = 0,
  unredeemedPrescriptionsCount = 0,
  onLogout,
  onOpenClearData
}) => {
  const getNavItems = (): NavItem[] => {
    switch (currentRole) {
      case 'medico':
        return [
          {
            id: 'agenda',
            label: 'Agenda & Sala de Espera',
            icon: Calendar,
            badge: waitingCount > 0 ? `${waitingCount} en espera` : undefined,
            badgeAlert: waitingCount > 0
          },
          {
            id: 'consulta',
            label: 'Consulta & Expediente (ECE)',
            icon: FileText
          },
          {
            id: 'recetas',
            label: 'Recetas Digitales Emitidas',
            icon: QrCode
          },
          {
            id: 'certificados',
            label: 'Certificados & Lab',
            icon: ShieldCheck
          }
        ];
      case 'recepcion':
        return [
          {
            id: 'triaje',
            label: 'Admisión & Triaje Rápido',
            icon: UserPlus
          },
          {
            id: 'turnos',
            label: 'Sala de Espera & Llamador',
            icon: Volume2,
            badge: waitingCount > 0 ? `${waitingCount}` : undefined
          },
          {
            id: 'cobro',
            label: 'Cobro de Consultas',
            icon: DollarSign
          },
          {
            id: 'directorio',
            label: 'Directorio de Pacientes',
            icon: Users
          }
        ];
      case 'cajero':
        return [
          {
            id: 'pos',
            label: 'Punto de Venta (POS)',
            icon: ShoppingBag
          },
          {
            id: 'canje_receta',
            label: 'Recetas de Consultorio',
            icon: QrCode,
            badge:
              unredeemedPrescriptionsCount > 0
                ? `${unredeemedPrescriptionsCount} listas`
                : undefined,
            badgeAlert: unredeemedPrescriptionsCount > 0
          },
          {
            id: 'caja',
            label: 'Corte Z & Arqueo',
            icon: Calculator
          },
          {
            id: 'historial_ventas',
            label: 'Historial de Tickets',
            icon: FileText
          }
        ];
      case 'admin':
        return [
          {
            id: 'resumen',
            label: 'Visión 360° & Métricas',
            icon: BarChart3
          },
          {
            id: 'inventario',
            label: 'Inventario & Caducidades',
            icon: Package
          },
          {
            id: 'compras',
            label: 'Compras & Proveedores',
            icon: Truck
          },
          {
            id: 'auditoria',
            label: 'Bitácora & Seguridad',
            icon: ShieldCheck
          }
        ];
      case 'paciente':
        return [
          {
            id: 'mis_recetas',
            label: 'Mis Recetas Digitales',
            icon: QrCode
          },
          {
            id: 'citas',
            label: 'Agendar Cita en Línea',
            icon: Calendar
          },
          {
            id: 'recordatorios',
            label: 'Recordatorio Medicamentos',
            icon: Clock
          }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200/80 transition-all duration-200 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top module title / role badge */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
              Módulos Activos
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Navegación directa
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition ml-auto"
          title={collapsed ? 'Expandir panel lateral' : 'Colapsar panel lateral'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation items list */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 text-left ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <div className="relative shrink-0">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {item.badge && collapsed && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                )}
              </div>

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-teal-700 text-teal-100'
                          : item.badgeAlert
                          ? 'bg-rose-100 text-rose-700 animate-pulse'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom utility section in sidebar */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <button
          onClick={onOpenClearData}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Gestión de datos de muestra"
        >
          <Trash2 className="w-4 h-4 text-amber-500 shrink-0" />
          {!collapsed && <span>Datos de Muestra</span>}
        </button>

        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Cambiar de Rol / Salir"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Cambiar de Rol</span>}
        </button>
      </div>
    </aside>
  );
};
