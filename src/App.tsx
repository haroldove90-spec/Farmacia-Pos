import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import { RoleSelector } from './components/RoleSelector';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomBar } from './components/BottomBar';
import { ClearDataModal } from './components/ClearDataModal';
import { DoctorModule } from './modules/DoctorModule';
import { ReceptionModule } from './modules/ReceptionModule';
import { POSModule } from './modules/POSModule';
import { AdminModule } from './modules/AdminModule';
import { PatientModule } from './modules/PatientModule';
import { useDataStore } from './services/dataStore';

export default function App() {
  const store = useDataStore();

  // Role state: null = Show initial role selector
  const [activeRole, setActiveRole] = useState<UserRole | null>(() => {
    return (localStorage.getItem('farmacia_pos_current_role') as UserRole) || null;
  });

  // Current active sub-tab for the active role
  const [currentTab, setCurrentTab] = useState<string>('agenda');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  // Sync role to localStorage and set default tab
  const handleSelectRole = (role: UserRole) => {
    setActiveRole(role);
    localStorage.setItem('farmacia_pos_current_role', role);

    // Default tab for each role
    switch (role) {
      case 'medico':
        setCurrentTab('agenda');
        break;
      case 'recepcion':
        setCurrentTab('triaje');
        break;
      case 'cajero':
        setCurrentTab('pos');
        break;
      case 'admin':
        setCurrentTab('resumen');
        break;
      case 'paciente':
        setCurrentTab('mis_recetas');
        break;
    }
  };

  const handleLogout = () => {
    setActiveRole(null);
    localStorage.removeItem('farmacia_pos_current_role');
  };

  // Real-time counts for sidebar & bottom bar badges
  const appointments = store.getAppointments();
  const prescriptions = store.getPrescriptions();
  const waitingCount = appointments.filter((a) => a.estado === 'en_espera').length;
  const unredeemedPrescriptionsCount = prescriptions.filter((p) => p.estado === 'emitida').length;

  // If no role is selected, show the Role Selector Screen (2 cols mobile / 4 cols desktop, no header)
  if (!activeRole) {
    return <RoleSelector onSelectRole={handleSelectRole} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Unified Institutional Header */}
      <Header
        currentRole={activeRole}
        onChangeRole={handleSelectRole}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarOpen={!isSidebarCollapsed}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <Sidebar
          currentRole={activeRole}
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          waitingCount={waitingCount}
          unredeemedPrescriptionsCount={unredeemedPrescriptionsCount}
          onLogout={handleLogout}
          onOpenClearData={() => setShowClearModal(true)}
        />

        {/* Main Work Area (Clean navigation without repetitive tabs) */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
          {activeRole === 'medico' && <DoctorModule activeSubTab={currentTab} />}
          {activeRole === 'recepcion' && <ReceptionModule activeSubTab={currentTab} />}
          {activeRole === 'cajero' && <POSModule activeSubTab={currentTab} />}
          {activeRole === 'admin' && <AdminModule activeSubTab={currentTab} />}
          {activeRole === 'paciente' && <PatientModule activeSubTab={currentTab} />}
        </main>
      </div>

      {/* Tactile Bottom Navigation Bar for Mobile and Tablets */}
      <BottomBar
        currentRole={activeRole}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        waitingCount={waitingCount}
        unredeemedPrescriptionsCount={unredeemedPrescriptionsCount}
      />

      {/* Clear sample data modal */}
      <ClearDataModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
      />
    </div>
  );
}
