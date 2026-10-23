import React from 'react';
import { Stethoscope, UserCheck, ShoppingBag, ShieldCheck, User } from 'lucide-react';
import { UserRole } from '../types';
import { Logo } from './Logo';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  const roles: {
    id: UserRole;
    name: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    bgHover: string;
    borderHover: string;
    badgeText?: string;
  }[] = [
    {
      id: 'medico',
      name: 'Médico / Doctor',
      subtitle: 'Consultorio & Recetas',
      icon: Stethoscope,
      accentColor: 'text-teal-600',
      bgHover: 'hover:bg-teal-50/70',
      borderHover: 'hover:border-teal-400',
      badgeText: 'Consultorio'
    },
    {
      id: 'recepcion',
      name: 'Recepción / Asistente',
      subtitle: 'Admisión & Triaje',
      icon: UserCheck,
      accentColor: 'text-cyan-600',
      bgHover: 'hover:bg-cyan-50/70',
      borderHover: 'hover:border-cyan-400',
      badgeText: 'Admisión'
    },
    {
      id: 'cajero',
      name: 'Cajero / Farmacéutico',
      subtitle: 'Punto de Venta POS',
      icon: ShoppingBag,
      accentColor: 'text-emerald-600',
      bgHover: 'hover:bg-emerald-50/70',
      borderHover: 'hover:border-emerald-400',
      badgeText: 'POS Mostrador'
    },
    {
      id: 'admin',
      name: 'Administrador / Dueño',
      subtitle: 'Pedro Mendoza',
      icon: ShieldCheck,
      accentColor: 'text-indigo-600',
      bgHover: 'hover:bg-indigo-50/70',
      borderHover: 'hover:border-indigo-400',
      badgeText: 'Control Total'
    },
    {
      id: 'paciente',
      name: 'Portal Paciente',
      subtitle: 'Citas & Recetas Digitales',
      icon: User,
      accentColor: 'text-slate-600',
      bgHover: 'hover:bg-slate-100',
      borderHover: 'hover:border-slate-400',
      badgeText: 'Autoservicio'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      {/* Unencapsulated system logo (centered, clean, no header container) */}
      <div className="mb-10 flex flex-col items-center text-center">
        <Logo size="xl" showSubtitle={true} className="scale-105" />
        <div className="mt-3 text-xs tracking-wider uppercase font-semibold text-slate-500">
          Seleccione su rol para ingresar al sistema
        </div>
      </div>

      {/* Grid: 2 Columns on Mobile / 4 Columns on Desktop */}
      <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
        {roles.slice(0, 4).map((role) => {
          const IconComponent = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className={`group relative flex flex-col items-center justify-center p-5 sm:p-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs transition-all duration-150 active:scale-95 text-center ${role.bgHover} ${role.borderHover} hover:shadow-md cursor-pointer`}
            >
              <div className="mb-3.5 p-3.5 rounded-2xl bg-slate-50 group-hover:scale-110 transition-transform duration-150">
                <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 ${role.accentColor}`} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight group-hover:text-slate-950">
                {role.name}
              </h3>
              <span className="mt-1 text-[11px] font-medium text-slate-600 sm:text-xs">
                {role.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Optional Patient Self-service row */}
      <div className="mt-5 w-full max-w-5xl flex justify-center">
        <button
          onClick={() => onSelectRole('paciente')}
          className="group flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-teal-700 hover:border-teal-300 hover:bg-teal-50/50 shadow-xs transition active:scale-95"
        >
          <User className="w-4 h-4 text-teal-600" />
          <span>Acceder como Paciente (Consultar Recetas / Agendar Cita)</span>
        </button>
      </div>

      <div className="mt-8 text-center text-[11px] text-slate-600">
        Farmacia POS v1.0 • Sistema Integral para Farmacias y Consultorios Médicos
      </div>
    </div>
  );
};
