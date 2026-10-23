import { useSyncExternalStore } from 'react';
import {
  Product,
  Patient,
  Appointment,
  Prescription,
  Consultation,
  Sale,
  CashRegister,
  PurchaseOrder,
  AuditLog,
  UserRole
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_CONSULTATIONS
} from '../data/mockData';

const STORAGE_KEYS = {
  NO_SAMPLE_DATA: 'farmacia_pos_no_sample_data',
  PRODUCTS: 'farmacia_pos_products',
  PATIENTS: 'farmacia_pos_patients',
  APPOINTMENTS: 'farmacia_pos_appointments',
  PRESCRIPTIONS: 'farmacia_pos_prescriptions',
  CONSULTATIONS: 'farmacia_pos_consultations',
  SALES: 'farmacia_pos_sales',
  CASH_REGISTER: 'farmacia_pos_cash_register',
  PURCHASE_ORDERS: 'farmacia_pos_purchase_orders',
  AUDIT_LOGS: 'farmacia_pos_audit_logs',
  CURRENT_ROLE: 'farmacia_pos_current_role'
};

const memoryCache: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch (e) {
    // fallback to memory cache if localStorage is partitioned or restricted
  }
  return memoryCache[key] ?? null;
}

function safeSetItem(key: string, val: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
    }
  } catch (e) {
    // fallback
  }
  memoryCache[key] = val;
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    // fallback
  }
  delete memoryCache[key];
}

const listeners = new Set<() => void>();
let storeVersion = 0;

function notifyListeners() {
  storeVersion++;
  listeners.forEach((listener) => listener());
}

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = safeGetItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading storage for key', key, e);
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    safeSetItem(key, JSON.stringify(val));
    notifyListeners();
  } catch (e) {
    console.error('Error writing storage for key', key, e);
  }
}

// Initial seed checker
function isSampleDataDisabled(): boolean {
  try {
    return safeGetItem(STORAGE_KEYS.NO_SAMPLE_DATA) === 'true';
  } catch {
    return false;
  }
}

export function initDataStore() {
  const disabled = isSampleDataDisabled();

  if (!safeGetItem(STORAGE_KEYS.PRODUCTS)) {
    setStored(STORAGE_KEYS.PRODUCTS, disabled ? [] : INITIAL_PRODUCTS);
  }
  if (!safeGetItem(STORAGE_KEYS.PATIENTS)) {
    setStored(STORAGE_KEYS.PATIENTS, disabled ? [] : INITIAL_PATIENTS);
  }
  if (!safeGetItem(STORAGE_KEYS.APPOINTMENTS)) {
    setStored(STORAGE_KEYS.APPOINTMENTS, disabled ? [] : INITIAL_APPOINTMENTS);
  }
  if (!safeGetItem(STORAGE_KEYS.PRESCRIPTIONS)) {
    setStored(STORAGE_KEYS.PRESCRIPTIONS, disabled ? [] : INITIAL_PRESCRIPTIONS);
  }
  if (!safeGetItem(STORAGE_KEYS.CONSULTATIONS)) {
    setStored(STORAGE_KEYS.CONSULTATIONS, disabled ? [] : INITIAL_CONSULTATIONS);
  }
  if (!safeGetItem(STORAGE_KEYS.SALES)) {
    setStored(STORAGE_KEYS.SALES, []);
  }
  if (!safeGetItem(STORAGE_KEYS.CASH_REGISTER)) {
    const initialRegister: CashRegister = {
      id: 'reg-01',
      abierta: true,
      montoApertura: 1500,
      fechaApertura: new Date().toISOString().split('T')[0] + ' 08:00',
      movimientos: [
        {
          id: 'mov-init',
          tipo: 'apertura',
          monto: 1500,
          motivo: 'Fondo de cambio de apertura matutina',
          hora: '08:00',
          usuario: 'Cajero Matutino'
        }
      ],
      ventasIds: []
    };
    setStored(STORAGE_KEYS.CASH_REGISTER, disabled ? null : initialRegister);
  }
  if (!safeGetItem(STORAGE_KEYS.PURCHASE_ORDERS)) {
    setStored(STORAGE_KEYS.PURCHASE_ORDERS, []);
  }
  if (!safeGetItem(STORAGE_KEYS.AUDIT_LOGS)) {
    setStored(STORAGE_KEYS.AUDIT_LOGS, [
      {
        id: 'aud-init',
        fecha: new Date().toLocaleString('es-MX'),
        usuario: 'Sistema',
        rol: 'admin',
        accion: 'Inicio de Sistema',
        detalle: 'Plataforma Farmacia POS inicializada correctamente.'
      }
    ]);
  }
}

// Initialize eagerly on script evaluation
initDataStore();

// Log audit helper
export function addAuditLog(usuario: string, rol: UserRole, accion: string, detalle: string) {
  const currentLogs = getStored<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  const newLog: AuditLog = {
    id: 'aud-' + Date.now(),
    fecha: new Date().toLocaleString('es-MX'),
    usuario,
    rol,
    accion,
    detalle
  };
  setStored(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...currentLogs.slice(0, 100)]);
}

export const DataService = {
  isSampleDisabled(): boolean {
    return isSampleDataDisabled();
  },

  clearAllSampleData(neverReload: boolean = true) {
    if (neverReload) {
      safeSetItem(STORAGE_KEYS.NO_SAMPLE_DATA, 'true');
    }
    setStored(STORAGE_KEYS.PRODUCTS, []);
    setStored(STORAGE_KEYS.PATIENTS, []);
    setStored(STORAGE_KEYS.APPOINTMENTS, []);
    setStored(STORAGE_KEYS.PRESCRIPTIONS, []);
    setStored(STORAGE_KEYS.CONSULTATIONS, []);
    setStored(STORAGE_KEYS.SALES, []);
    setStored(STORAGE_KEYS.CASH_REGISTER, null);
    setStored(STORAGE_KEYS.PURCHASE_ORDERS, []);
    
    addAuditLog('Administrador', 'admin', 'Borrado de datos de muestra', 
      neverReload 
        ? 'Se eliminaron los datos de muestra y se configuró el navegador para no volver a mostrarlos.' 
        : 'Se eliminaron los datos de muestra temporales.');
    
    notifyListeners();
  },

  restoreSampleData() {
    safeRemoveItem(STORAGE_KEYS.NO_SAMPLE_DATA);
    setStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setStored(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    setStored(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    setStored(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS);
    setStored(STORAGE_KEYS.CONSULTATIONS, INITIAL_CONSULTATIONS);
    setStored(STORAGE_KEYS.SALES, []);
    
    const initialRegister: CashRegister = {
      id: 'reg-01',
      abierta: true,
      montoApertura: 1500,
      fechaApertura: new Date().toISOString().split('T')[0] + ' 08:00',
      movimientos: [
        {
          id: 'mov-init',
          tipo: 'apertura',
          monto: 1500,
          motivo: 'Fondo de cambio de apertura matutina',
          hora: '08:00',
          usuario: 'Cajero Matutino'
        }
      ],
      ventasIds: []
    };
    setStored(STORAGE_KEYS.CASH_REGISTER, initialRegister);
    setStored(STORAGE_KEYS.PURCHASE_ORDERS, []);
    
    addAuditLog('Administrador', 'admin', 'Restauración de datos de muestra', 'Se re-poblaron los datos médicos y catálogo de farmacia.');
    notifyListeners();
  },

  // Products
  getProducts(): Product[] {
    return getStored<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  },

  saveProduct(product: Product) {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    setStored(STORAGE_KEYS.PRODUCTS, products);
    addAuditLog('Inventario', 'admin', 'Actualización de Producto', `Producto: ${product.nombre}`);
  },

  updateStock(productId: string, quantityDelta: number) {
    const products = this.getProducts();
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock + quantityDelta);
      setStored(STORAGE_KEYS.PRODUCTS, products);
    }
  },

  // Patients
  getPatients(): Patient[] {
    return getStored<Patient[]>(STORAGE_KEYS.PATIENTS, []);
  },

  savePatient(patient: Patient) {
    const patients = this.getPatients();
    const index = patients.findIndex((p) => p.id === patient.id);
    if (index >= 0) {
      patients[index] = patient;
    } else {
      patients.unshift(patient);
    }
    setStored(STORAGE_KEYS.PATIENTS, patients);
    addAuditLog('Recepción', 'recepcion', 'Registro de Paciente', `${patient.nombre} ${patient.apellido}`);
  },

  // Appointments
  getAppointments(): Appointment[] {
    return getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
  },

  saveAppointment(appointment: Appointment) {
    const appointments = this.getAppointments();
    const index = appointments.findIndex((a) => a.id === appointment.id);
    if (index >= 0) {
      appointments[index] = appointment;
    } else {
      appointments.push(appointment);
    }
    setStored(STORAGE_KEYS.APPOINTMENTS, appointments);
  },

  updateAppointmentStatus(id: string, estado: Appointment['estado']) {
    const appointments = this.getAppointments();
    const apt = appointments.find((a) => a.id === id);
    if (apt) {
      apt.estado = estado;
      if (estado === 'en_espera' && !apt.horaLlegada) {
        const now = new Date();
        apt.horaLlegada = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      }
      setStored(STORAGE_KEYS.APPOINTMENTS, appointments);
      addAuditLog('Admisión/Consultorio', 'recepcion', 'Cambio de Estado de Cita', `Cita ${id} cambió a ${estado}`);
    }
  },

  // Prescriptions
  getPrescriptions(): Prescription[] {
    return getStored<Prescription[]>(STORAGE_KEYS.PRESCRIPTIONS, []);
  },

  savePrescription(prescription: Prescription) {
    const prescriptions = this.getPrescriptions();
    const index = prescriptions.findIndex((p) => p.id === prescription.id);
    if (index >= 0) {
      prescriptions[index] = prescription;
    } else {
      prescriptions.unshift(prescription);
    }
    setStored(STORAGE_KEYS.PRESCRIPTIONS, prescriptions);
    addAuditLog(
      prescription.medicoNombre,
      'medico',
      'Emisión de Receta Digital',
      `Folio: ${prescription.id} para ${prescription.pacienteNombre}. Sincronizada con POS.`
    );
  },

  updatePrescriptionStatus(id: string, estado: Prescription['estado']) {
    const prescriptions = this.getPrescriptions();
    const pres = prescriptions.find((p) => p.id === id);
    if (pres) {
      pres.estado = estado;
      setStored(STORAGE_KEYS.PRESCRIPTIONS, prescriptions);
      addAuditLog('Caja POS', 'cajero', 'Actualización de Receta', `Receta ${id} surtida (${estado})`);
    }
  },

  // Consultations
  getConsultations(): Consultation[] {
    return getStored<Consultation[]>(STORAGE_KEYS.CONSULTATIONS, []);
  },

  saveConsultation(consultation: Consultation) {
    const consultations = this.getConsultations();
    consultations.unshift(consultation);
    setStored(STORAGE_KEYS.CONSULTATIONS, consultations);
    addAuditLog(
      consultation.medicoNombre,
      'medico',
      'Consulta Médica Finalizada',
      `Paciente: ${consultation.pacienteNombre}. Diagnóstico: ${consultation.diagnostico}`
    );
  },

  // Sales
  getSales(): Sale[] {
    return getStored<Sale[]>(STORAGE_KEYS.SALES, []);
  },

  processSale(sale: Sale) {
    const sales = this.getSales();
    sales.unshift(sale);
    setStored(STORAGE_KEYS.SALES, sales);

    // Deduct stock for all items
    const products = this.getProducts();
    sale.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.producto.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.cantidad);
      }
    });
    setStored(STORAGE_KEYS.PRODUCTS, products);

    // If prescription was redeemed, update its state
    if (sale.recetaFolio) {
      this.updatePrescriptionStatus(sale.recetaFolio, 'surtida_total');
    }

    // Update cash register if open
    const register = this.getCashRegister();
    if (register && register.abierta) {
      register.ventasIds.push(sale.id);
      setStored(STORAGE_KEYS.CASH_REGISTER, register);
    }

    addAuditLog(
      sale.cajeroNombre,
      'cajero',
      'Venta Cobrada en Mostrador',
      `Folio: ${sale.id} - Total: $${sale.total.toFixed(2)} (${sale.metodoPago})${
        sale.recetaFolio ? ` [Receta vinculada: ${sale.recetaFolio}]` : ''
      }`
    );
  },

  // Cash register
  getCashRegister(): CashRegister | null {
    return getStored<CashRegister | null>(STORAGE_KEYS.CASH_REGISTER, null);
  },

  openCashRegister(montoApertura: number, usuario: string) {
    const now = new Date();
    const newRegister: CashRegister = {
      id: 'reg-' + Date.now(),
      abierta: true,
      montoApertura,
      fechaApertura: now.toLocaleString('es-MX'),
      movimientos: [
        {
          id: 'mov-' + Date.now(),
          tipo: 'apertura',
          monto: montoApertura,
          motivo: 'Apertura de turno',
          hora: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          usuario
        }
      ],
      ventasIds: []
    };
    setStored(STORAGE_KEYS.CASH_REGISTER, newRegister);
    addAuditLog(usuario, 'cajero', 'Apertura de Caja', `Fondo inicial: $${montoApertura.toFixed(2)}`);
  },

  addCashMovement(tipo: 'entrada' | 'salida', monto: number, motivo: string, usuario: string) {
    const register = this.getCashRegister();
    if (!register || !register.abierta) return;
    const now = new Date();
    register.movimientos.push({
      id: 'mov-' + Date.now(),
      tipo,
      monto,
      motivo,
      hora: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      usuario
    });
    setStored(STORAGE_KEYS.CASH_REGISTER, register);
    addAuditLog(usuario, 'cajero', `Movimiento de Caja (${tipo})`, `$${monto.toFixed(2)} - ${motivo}`);
  },

  closeCashRegister(usuario: string) {
    const register = this.getCashRegister();
    if (!register) return;
    register.abierta = false;
    setStored(STORAGE_KEYS.CASH_REGISTER, register);
    addAuditLog(usuario, 'cajero', 'Corte Z / Cierre de Caja', `Cierre de turno completado.`);
  },

  // Purchase orders
  getPurchaseOrders(): PurchaseOrder[] {
    return getStored<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, []);
  },

  createPurchaseOrder(order: PurchaseOrder) {
    const orders = this.getPurchaseOrders();
    orders.unshift(order);
    setStored(STORAGE_KEYS.PURCHASE_ORDERS, orders);
    addAuditLog('Administrador', 'admin', 'Orden de Compra Creada', `${order.id} a proveedor ${order.proveedor}`);
  },

  // Audit logs
  getAuditLogs(): AuditLog[] {
    return getStored<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }
};

// React Hook to subscribe to store updates with useSyncExternalStore
export function useDataStore() {
  useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
      };
    },
    () => storeVersion
  );

  return DataService;
}
