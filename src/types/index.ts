export type UserRole = 'medico' | 'recepcion' | 'cajero' | 'admin' | 'paciente';

export interface VitalSigns {
  temperatura: number; // °C
  presionSistolica: number; // mmHg
  presionDiastolica: number; // mmHg
  frecuenciaCardiaca?: number; // lpm
  frecuenciaRespiratoria?: number; // rpm
  saturacionOxigeno?: number; // %
  peso: number; // kg
  altura: number; // cm
  glucosa?: number; // mg/dL
  imc: number;
  categoriaIMC: 'Bajo peso' | 'Normal' | 'Sobrepeso' | 'Obesidad I' | 'Obesidad II' | 'Obesidad III';
}

export interface Patient {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  genero: 'M' | 'F' | 'Otro';
  telefono: string;
  email?: string;
  fechaNacimiento: string;
  alergias: string[];
  antecedentesPatologicos: string[];
  antecedentesQuirurgicos?: string[];
  contactoEmergencia?: string;
  fechaRegistro: string;
}

export interface CIE10Item {
  codigo: string;
  descripcion: string;
}

export interface PrescribedMedicine {
  productoId?: string;
  nombre: string;
  sustanciaActiva: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  indicaciones: string;
  cantidad: number;
  stockActualFarmacia?: number;
  esControlado?: boolean;
  esAntibiotico?: boolean;
}

export interface Prescription {
  id: string; // Folio
  pacienteId: string;
  pacienteNombre: string;
  medicoId: string;
  medicoNombre: string;
  medicoCedula: string;
  medicoEspecialidad: string;
  fechaEmision: string;
  diagnostico: string;
  diagnosticoCIE10?: string;
  medicamentos: PrescribedMedicine[];
  indicacionesGenerales?: string;
  estado: 'emitida' | 'surtida_parcial' | 'surtida_total' | 'cancelada';
  codigoQR: string;
  firmaDigital: string;
}

export interface Consultation {
  id: string;
  citaId?: string;
  pacienteId: string;
  pacienteNombre: string;
  medicoId: string;
  medicoNombre: string;
  fecha: string;
  motivoConsulta: string;
  signosVitales: VitalSigns;
  exploracionFisica: string;
  diagnostico: string;
  diagnosticoCIE10?: string;
  recetaId?: string;
  notasEvolucion: string;
  solicitudLaboratorio?: string;
}

export interface Appointment {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  telefono: string;
  medicoId: string;
  medicoNombre: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  motivo: string;
  tipo: 'cita_previa' | 'turno_llegada';
  estado: 'programada' | 'en_espera' | 'en_consulta' | 'atendido' | 'cancelado';
  horaLlegada?: string;
  pagoConsulta: {
    monto: number;
    pagado: boolean;
    metodoPago?: 'efectivo' | 'tarjeta' | 'transferencia';
    folioRecibo?: string;
  };
}

export interface Product {
  id: string;
  codigoBarras: string;
  nombre: string;
  sustanciaActiva: string;
  laboratorio: string;
  presentacion: string;
  categoria: 'medicamento' | 'antibiotico' | 'controlado' | 'material_curacion' | 'cuidado_personal' | 'vitaminas';
  precioVenta: number;
  precioCosto: number;
  stock: number;
  stockMinimo: number;
  lote: string;
  fechaCaducidad: string; // YYYY-MM-DD
  fotoUrl: string;
  esPatente: boolean;
  equivalenteGenericoId?: string;
}

export interface CartItem {
  producto: Product;
  cantidad: number;
  precioUnitario: number;
  descuento: number; // Porcentaje o monto
  subtotal: number;
  recetaId?: string;
}

export interface Sale {
  id: string; // Folio de venta
  fecha: string;
  cajeroNombre: string;
  items: CartItem[];
  subtotal: number;
  descuentoTotal: number;
  total: number;
  metodoPago: 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia' | 'puntos';
  montoRecibido: number;
  cambio: number;
  recetaFolio?: string;
  datosNormativos?: {
    cedulaMedico: string;
    nombreMedico: string;
    folioReceta: string;
    medicamentosRetenidos: string[];
  };
}

export interface CashMovement {
  id: string;
  tipo: 'apertura' | 'entrada' | 'salida' | 'cierre_z';
  monto: number;
  motivo: string;
  hora: string;
  usuario: string;
}

export interface CashRegister {
  id: string;
  abierta: boolean;
  montoApertura: number;
  fechaApertura: string;
  movimientos: CashMovement[];
  ventasIds: string[];
}

export interface PurchaseOrder {
  id: string;
  proveedor: string;
  fecha: string;
  estado: 'pendiente' | 'aprobada' | 'recibida' | 'cancelada';
  items: {
    productoId: string;
    nombre: string;
    cantidad: number;
    costoUnitario: number;
  }[];
  total: number;
}

export interface AuditLog {
  id: string;
  fecha: string;
  usuario: string;
  rol: UserRole;
  accion: string;
  detalle: string;
}
