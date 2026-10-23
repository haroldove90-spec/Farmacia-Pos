import React, { useState } from 'react';
import {
  Menu,
  LogOut,
  Trash2,
  Stethoscope,
  UserCheck,
  ShoppingBag,
  ShieldCheck,
  User,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../types';
import { Logo } from './Logo';
import { PWAInstallButton } from './PWAInstallButton';
import { ClearDataModal } from './ClearDataModal';

interface HeaderProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onChangeRole,
  onLogout,
  onToggleSidebar
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const roleMeta: Record<
    UserRole,
    { label: string; userLabel: string; icon: React.ComponentType<{ className?: string }>; color: string }
  > = {
    medico: {
      label: 'Médico / Doctor',
      userLabel: 'Dra. Elena Ramos',
      icon: Stethoscope,
      color: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    recepcion: {
      label: 'Recepción / Admisión',
      userLabel: 'Módulo de Triaje',
      icon: UserCheck,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200'
    },
    cajero: {
      label: 'Cajero / POS Farmacia',
      userLabel: 'Caja 1 Mostrador',
      icon: ShoppingBag,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    admin: {
      label: 'Administrador / Dueño',
      userLabel: 'Pedro Mendoza',
      icon: ShieldCheck,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    paciente: {
      label: 'Portal Paciente',
      userLabel: 'María González',
      icon: User,
      color: 'bg-slate-100 text-slate-700 border-slate-200'
    }
  };

  const currentMeta = roleMeta[currentRole];
  const CurrentIcon = currentMeta.icon;

  const availableRoles: UserRole[] = ['medico', 'recepcion', 'cajero', 'admin', 'paciente'];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left section: Hamburger toggle (mobile) + System Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Logo size="md" showSubtitle={false} />
          </div>

          {/* Right section: Active Role Badge + PWA Install + Clear Sample Data + Logout */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Active Role Selector dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition active:scale-95 ${currentMeta.color}`}
                title="Cambiar de rol rápidamente"
              >
                <CurrentIcon className="w-4 h-4 shrink-0" />
                <div className="flex flex-col text-left leading-none hidden md:flex">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                    {currentMeta.label}
                  </span>
                  <span className="font-bold text-slate-900">{currentMeta.userLabel}</span>
                </div>
                <span className="md:hidden font-bold">{currentMeta.label.split('/')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
              </button>

              {/* Dropdown menu */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Cambiar rol activo
                  </div>
                  {availableRoles.map((role) => {
                    const rMeta = roleMeta[role];
                    const RIcon = rMeta.icon;
                    const isSelected = role === currentRole;
                    return (
                      <button
                        key={role}
                        onClick={() => {
                          onChangeRole(role);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-medium hover:bg-slate-50 transition ${
                          isSelected ? 'bg-teal-50/70 text-teal-800 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <RIcon className="w-4 h-4 text-teal-600" />
                          <span>{rMeta.label}</span>
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick PWA Install Button */}
            <PWAInstallButton />

            {/* Clear Sample Data Trigger */}
            <button
              onClick={() => setShowClearModal(true)}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-500 hover:text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200 text-xs font-medium transition active:scale-95 flex items-center gap-1.5"
              title="Borrar datos de muestra del todo el sistema (preparar para producción/supabase)"
            >
              <Trash2 className="w-4 h-4 text-amber-600" />
              <span className="hidden xl:inline">Datos de muestra</span>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-xs font-semibold transition active:scale-95 flex items-center gap-1.5"
              title="Cerrar sesión y volver al selector de roles"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Clear sample data modal */}
      <ClearDataModal isOpen={showClearModal} onClose={() => setShowClearModal(false)} />
    </>
  );
};
