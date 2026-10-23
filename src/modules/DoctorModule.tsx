import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Activity,
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  QrCode,
  Printer,
  Sparkles,
  Search,
  BellRing,
  Stethoscope,
  Send,
  ShieldAlert,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import {
  Appointment,
  Patient,
  Prescription,
  Consultation,
  VitalSigns,
  PrescribedMedicine,
  Product
} from '../types';
import { useDataStore } from '../services/dataStore';
import { CIE10_DATABASE, PRESCRIPTION_TEMPLATES } from '../data/mockData';

interface DoctorModuleProps {
  activeSubTab: string;
}

export const DoctorModule: React.FC<DoctorModuleProps> = ({ activeSubTab }) => {
  const store = useDataStore();
  const appointments = store.getAppointments();
  const patients = store.getPatients();
  const products = store.getProducts();
  const prescriptions = store.getPrescriptions();
  const consultations = store.getConsultations();

  // Active consultation state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Vitals form state
  const [temp, setTemp] = useState('36.5');
  const [presSistolica, setPresSistolica] = useState('120');
  const [presDiastolica, setPresDiastolica] = useState('80');
  const [pulso, setPulso] = useState('75');
  const [peso, setPeso] = useState('70');
  const [altura, setAltura] = useState('170');
  const [glucosa, setGlucosa] = useState('95');

  // Consultation notes & CIE-10
  const [motivo, setMotivo] = useState('');
  const [exploracion, setExploracion] = useState('');
  const [diagnosticoTexto, setDiagnosticoTexto] = useState('');
  const [cie10Search, setCie10Search] = useState('');
  const [selectedCIE10, setSelectedCIE10] = useState<string>('');
  const [showCIE10Dropdown, setShowCIE10Dropdown] = useState(false);
  const [notasEvolucion, setNotasEvolucion] = useState('');
  const [solicitudLab, setSolicitudLab] = useState('');

  // Digital Prescription builder state
  const [prescriptionMeds, setPrescriptionMeds] = useState<PrescribedMedicine[]>([]);
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [showMedSuggestions, setShowMedSuggestions] = useState(false);
  const [tempDosis, setTempDosis] = useState('');
  const [tempFrecuencia, setTempFrecuencia] = useState('');
  const [tempDuracion, setTempDuracion] = useState('');
  const [tempIndicaciones, setTempIndicaciones] = useState('');
  const [tempCantidad, setTempCantidad] = useState(1);
  const [tempSelectedProduct, setTempSelectedProduct] = useState<Product | null>(null);
  const [indicacionesGenerales, setIndicacionesGenerales] = useState('');

  // Generated prescription view modal
  const [currentPrescriptionModal, setCurrentPrescriptionModal] = useState<Prescription | null>(null);

  // Quick Certificate / Justificante state
  const [showCertModal, setShowCertModal] = useState(false);
  const [certDiasReposo, setCertDiasReposo] = useState('3');
  const [certDiagnostico, setCertDiagnostico] = useState('');

  // Auto calculate BMI
  const computedBMI = useMemo(() => {
    const p = parseFloat(peso);
    const a = parseFloat(altura) / 100;
    if (p > 0 && a > 0) {
      const imc = p / (a * a);
      let cat: VitalSigns['categoriaIMC'] = 'Normal';
      if (imc < 18.5) cat = 'Bajo peso';
      else if (imc < 25) cat = 'Normal';
      else if (imc < 30) cat = 'Sobrepeso';
      else if (imc < 35) cat = 'Obesidad I';
      else if (imc < 40) cat = 'Obesidad II';
      else cat = 'Obesidad III';
      return { val: parseFloat(imc.toFixed(2)), cat };
    }
    return { val: 0, cat: 'Normal' as const };
  }, [peso, altura]);

  // Patients waiting in queue
  const waitingPatients = useMemo(() => {
    return appointments.filter((a) => a.estado === 'en_espera');
  }, [appointments]);

  // Filter CIE-10 for autocomplete
  const filteredCIE10 = useMemo(() => {
    if (!cie10Search.trim()) return [];
    return CIE10_DATABASE.filter(
      (c) =>
        c.codigo.toLowerCase().includes(cie10Search.toLowerCase()) ||
        c.descripcion.toLowerCase().includes(cie10Search.toLowerCase())
    );
  }, [cie10Search]);

  // Filter medicines for autocomplete (Predictive search by 2-3 characters)
  const filteredMedCatalog = useMemo(() => {
    if (medSearchQuery.trim().length < 2) return [];
    return products.filter(
      (p) =>
        p.nombre.toLowerCase().includes(medSearchQuery.toLowerCase()) ||
        p.sustanciaActiva.toLowerCase().includes(medSearchQuery.toLowerCase())
    );
  }, [products, medSearchQuery]);

  // Check for allergy warnings with currently added medications
  const allergyAlerts = useMemo(() => {
    if (!selectedPatient || selectedPatient.alergias.length === 0) return [];
    const patientAllergies = selectedPatient.alergias.map((a) => a.toLowerCase());
    const warnings: string[] = [];

    prescriptionMeds.forEach((med) => {
      const sub = med.sustanciaActiva.toLowerCase();
      const nom = med.nombre.toLowerCase();

      patientAllergies.forEach((allergy) => {
        if (
          (allergy.includes('penicil') && (sub.includes('amoxi') || sub.includes('penicil') || nom.includes('amoxil'))) ||
          (allergy.includes('sulfa') && sub.includes('sulfa')) ||
          sub.includes(allergy) ||
          nom.includes(allergy)
        ) {
          warnings.push(
            `¡ALERTA CRÍTICA! El paciente tiene registrada alergia a "${allergy}" y se ha añadido "${med.nombre}" (${med.sustanciaActiva}).`
          );
        }
      });
    });

    return warnings;
  }, [selectedPatient, prescriptionMeds]);

  // Select patient to start consultation
  const startConsultation = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    const pat = patients.find((p) => p.id === appointment.pacienteId);
    setSelectedPatient(pat || null);
    setMotivo(appointment.motivo || '');
    store.updateAppointmentStatus(appointment.id, 'en_consulta');
  };

  // Add medicine to current prescription
  const addMedicineToPrescription = () => {
    if (!medSearchQuery.trim()) {
      alert('Por favor ingrese o seleccione un medicamento.');
      return;
    }

    const newMed: PrescribedMedicine = {
      productoId: tempSelectedProduct?.id,
      nombre: tempSelectedProduct ? tempSelectedProduct.nombre : medSearchQuery,
      sustanciaActiva: tempSelectedProduct ? tempSelectedProduct.sustanciaActiva : 'Sustancia activa',
      dosis: tempDosis || '1 dosis',
      frecuencia: tempFrecuencia || 'Cada 8 horas',
      duracion: tempDuracion || 'Por 5 días',
      indicaciones: tempIndicaciones || 'Tomar después de los alimentos.',
      cantidad: tempCantidad || 1,
      stockActualFarmacia: tempSelectedProduct ? tempSelectedProduct.stock : 0,
      esAntibiotico: tempSelectedProduct?.categoria === 'antibiotico',
      esControlado: tempSelectedProduct?.categoria === 'controlado'
    };

    setPrescriptionMeds((prev) => [...prev, newMed]);

    // Reset inputs
    setMedSearchQuery('');
    setTempSelectedProduct(null);
    setTempDosis('');
    setTempFrecuencia('');
    setTempDuracion('');
    setTempIndicaciones('');
    setTempCantidad(1);
    setShowMedSuggestions(false);
  };

  // Apply prescription template
  const applyTemplate = (template: typeof PRESCRIPTION_TEMPLATES[0]) => {
    setDiagnosticoTexto(template.cie10);
    setIndicacionesGenerales(template.indicacionesGenerales);

    const meds: PrescribedMedicine[] = template.medicamentos.map((m) => {
      const match = products.find(
        (p) =>
          p.nombre.toLowerCase().includes(m.nombre.toLowerCase()) ||
          p.sustanciaActiva.toLowerCase().includes(m.sustanciaActiva.toLowerCase())
      );
      return {
        productoId: match?.id,
        nombre: m.nombre,
        sustanciaActiva: m.sustanciaActiva,
        dosis: m.dosis,
        frecuencia: m.frecuencia,
        duracion: m.duracion,
        indicaciones: m.indicaciones,
        cantidad: m.cantidad,
        stockActualFarmacia: match?.stock || 0,
        esAntibiotico: match?.categoria === 'antibiotico',
        esControlado: match?.categoria === 'controlado'
      };
    });

    setPrescriptionMeds(meds);
  };

  // Save consultation and issue digital prescription
  const finalizeConsultation = () => {
    if (!selectedPatient) {
      alert('Por favor seleccione un paciente para finalizar.');
      return;
    }
    if (!diagnosticoTexto.trim()) {
      alert('Por favor registre el diagnóstico de la consulta.');
      return;
    }

    const prescriptionFolio = 'REC-' + Math.floor(1000 + Math.random() * 9000);

    // Create prescription if medicines added
    if (prescriptionMeds.length > 0) {
      const prescriptionRecord: Prescription = {
        id: prescriptionFolio,
        pacienteId: selectedPatient.id,
        pacienteNombre: `${selectedPatient.nombre} ${selectedPatient.apellido}`,
        medicoId: 'med-1',
        medicoNombre: 'Dra. Elena Ramos Gómez',
        medicoCedula: 'CED-9842104',
        medicoEspecialidad: 'Médica Cirujana General - UNAM',
        fechaEmision: new Date().toLocaleString('es-MX'),
        diagnostico: diagnosticoTexto,
        diagnosticoCIE10: selectedCIE10 || undefined,
        medicamentos: [...prescriptionMeds],
        indicacionesGenerales,
        estado: 'emitida', // Available in POS!
        codigoQR: `${prescriptionFolio}-${selectedPatient.id}-FARMPOS`,
        firmaDigital: `SIG-RAMOS-${Date.now()}`
      };

      store.savePrescription(prescriptionRecord);
      setCurrentPrescriptionModal(prescriptionRecord);
    }

    // Save Consultation Record
    const consultationRecord: Consultation = {
      id: 'con-' + Date.now(),
      citaId: selectedAppointment?.id,
      pacienteId: selectedPatient.id,
      pacienteNombre: `${selectedPatient.nombre} ${selectedPatient.apellido}`,
      medicoId: 'med-1',
      medicoNombre: 'Dra. Elena Ramos Gómez',
      fecha: new Date().toLocaleString('es-MX'),
      motivoConsulta: motivo,
      signosVitales: {
        temperatura: parseFloat(temp) || 36.5,
        presionSistolica: parseFloat(presSistolica) || 120,
        presionDiastolica: parseFloat(presDiastolica) || 80,
        frecuenciaCardiaca: parseFloat(pulso) || 75,
        frecuenciaRespiratoria: 18,
        saturacionOxigeno: 98,
        peso: parseFloat(peso) || 70,
        altura: parseFloat(altura) || 170,
        glucosa: parseFloat(glucosa) || 95,
        imc: computedBMI.val,
        categoriaIMC: computedBMI.cat
      },
      exploracionFisica: exploracion,
      diagnostico: diagnosticoTexto,
      diagnosticoCIE10: selectedCIE10 || undefined,
      recetaId: prescriptionMeds.length > 0 ? prescriptionFolio : undefined,
      notasEvolucion,
      solicitudLaboratorio: solicitudLab || undefined
    };

    store.saveConsultation(consultationRecord);

    if (selectedAppointment) {
      store.updateAppointmentStatus(selectedAppointment.id, 'atendido');
    }

    alert('¡Consulta guardada con éxito y receta sincronizada con el mostrador de Farmacia!');
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* REAL-TIME NOTIFICATION BANNER: PATIENT ARRIVED IN WAITING ROOM */}
      {waitingPatients.length > 0 && (
        <div className="bg-amber-500 text-white p-3.5 sm:p-4 rounded-2xl shadow-md flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 animate-bounce">
              <BellRing className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>¡Paciente en Sala de Espera!</span>
                <span className="text-xs bg-white text-amber-900 px-2 py-0.5 rounded-full font-black">
                  {waitingPatients.length} en espera
                </span>
              </div>
              <p className="text-xs text-amber-100">
                {waitingPatients[0].pacienteNombre} acaba de registrar su llegada en recepción (Hora: {waitingPatients[0].horaLlegada || 'Reciente'}).
              </p>
            </div>
          </div>

          <button
            onClick={() => startConsultation(waitingPatients[0])}
            className="px-4 py-2 rounded-xl bg-white text-amber-900 font-bold text-xs sm:text-sm hover:bg-amber-50 shadow-sm shrink-0 transition active:scale-95"
          >
            Llamar a Consulta
          </button>
        </div>
      )}

      {/* VIEW: AGENDA & WAITING ROOM */}
      {activeSubTab === 'agenda' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <span>Agenda Médica y Pacientes en Espera</span>
              </h3>
              <p className="text-xs text-slate-500">
                Dra. Elena Ramos Gómez • Consultorio 1 • Turno Matutino
              </p>
            </div>
            <div className="flex gap-2 text-xs font-semibold">
              <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                {waitingPatients.length} En Espera
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                {appointments.filter((a) => a.estado === 'atendido').length} Atendidos
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((apt) => {
              const isWaiting = apt.estado === 'en_espera';
              const isDone = apt.estado === 'atendido';
              const isInProgress = apt.estado === 'en_consulta';

              return (
                <div
                  key={apt.id}
                  className={`bg-white rounded-2xl p-5 border shadow-xs transition space-y-3 ${
                    isWaiting
                      ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-md'
                      : isInProgress
                      ? 'border-teal-400 ring-2 ring-teal-400/20'
                      : 'border-slate-200 opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isWaiting
                          ? 'bg-amber-100 text-amber-800'
                          : isInProgress
                          ? 'bg-teal-100 text-teal-800'
                          : isDone
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {isWaiting
                        ? '🟡 En Sala de Espera'
                        : isInProgress
                        ? '🟢 En Consulta Activa'
                        : isDone
                        ? '⚪ Atendido'
                        : '🔵 Programada'}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      {apt.hora} hrs
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{apt.pacienteNombre}</h4>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Tel: {apt.telefono} • {apt.tipo === 'turno_llegada' ? 'Sin Cita' : 'Cita Previa'}
                    </span>
                    <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong>Motivo:</strong> {apt.motivo}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                      {apt.horaLlegada ? `Llegada: ${apt.horaLlegada}` : 'Pendiente de llegar'}
                    </span>
                    {apt.estado !== 'atendido' && (
                      <button
                        onClick={() => startConsultation(apt)}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
                      >
                        <span>Ingresar a Consulta</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: CONSULTA & EXPEDIENTE CLÍNICO ELECTRÓNICO (ECE) */}
      {(activeSubTab === 'consulta' || selectedAppointment) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Patient Header & ECE Summary */}
          <div className="lg:col-span-12 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg border border-teal-200 shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    {selectedPatient
                      ? `${selectedPatient.nombre} ${selectedPatient.apellido}`
                      : 'Seleccione un paciente de la lista o agenda'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                    {selectedPatient && (
                      <>
                        <span>Edad: {selectedPatient.edad} años</span>
                        <span>•</span>
                        <span>Género: {selectedPatient.genero}</span>
                        <span>•</span>
                        <span>Expediente: #{selectedPatient.id}</span>
                        <span>•</span>
                        <span>Tel: {selectedPatient.telefono}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Patient Selector if not selected */}
              {!selectedPatient && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600">Elegir Paciente:</label>
                  <select
                    className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                    onChange={(e) => {
                      const p = patients.find((x) => x.id === e.target.value);
                      setSelectedPatient(p || null);
                    }}
                  >
                    <option value="">-- Seleccionar --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.apellido} ({p.edad} años)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Medical history & Allergies Banner */}
            {selectedPatient && (
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                  <span className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider text-rose-700">
                    <AlertTriangle className="w-3.5 h-3.5" /> Alergias Registradas:
                  </span>
                  <div className="font-semibold mt-1">
                    {selectedPatient.alergias.length > 0
                      ? selectedPatient.alergias.join(', ')
                      : 'Sin alergias conocidas'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                  <span className="font-bold block text-[11px] uppercase tracking-wider text-slate-500">
                    Antecedentes Patológicos:
                  </span>
                  <div className="mt-1">
                    {selectedPatient.antecedentesPatologicos.join(', ') || 'Ninguno relevante'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                  <span className="font-bold block text-[11px] uppercase tracking-wider text-slate-500">
                    Cirugías Previas:
                  </span>
                  <div className="mt-1">
                    {selectedPatient.antecedentesQuirurgicos?.join(', ') || 'Sin cirugías'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LEFT COLUMN: VITAL SIGNS & CLINICAL EVOLUTION NOTES */}
          <div className="lg:col-span-6 space-y-4">
            {/* Vitals Capture & Auto BMI */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>Signos Vitales y Triaje Clínico</span>
                </div>
                <span className="text-xs text-slate-400">Cálculo de IMC Automático</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Presión Arterial:</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={presSistolica}
                      onChange={(e) => setPresSistolica(e.target.value)}
                      className="w-14 px-2 py-1.5 rounded-lg border text-center font-mono font-bold"
                      placeholder="120"
                    />
                    <span>/</span>
                    <input
                      type="number"
                      value={presDiastolica}
                      onChange={(e) => setPresDiastolica(e.target.value)}
                      className="w-14 px-2 py-1.5 rounded-lg border text-center font-mono font-bold"
                      placeholder="80"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Temperatura (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border font-mono font-bold text-center"
                    placeholder="36.5"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Peso (kg):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border font-mono font-bold text-center"
                    placeholder="70"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estatura (cm):</label>
                  <input
                    type="number"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border font-mono font-bold text-center"
                    placeholder="170"
                  />
                </div>
              </div>

              {/* Automatic BMI Result Box */}
              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] uppercase font-bold text-teal-800 tracking-wider">
                    Índice de Masa Corporal (IMC):
                  </span>
                  <div className="font-mono text-base font-black text-teal-900 mt-0.5">
                    {computedBMI.val} kg/m²
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-teal-700 font-semibold block">Clasificación:</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-xs bg-white text-teal-900 border border-teal-300">
                    {computedBMI.cat}
                  </span>
                </div>
              </div>
            </div>

            {/* Clinical Exploration & Diagnostic with CIE-10 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Exploración Física & Diagnóstico (CIE-10)</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Motivo de Consulta y Padecimiento Actual:
                </label>
                <textarea
                  rows={2}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Síntomas, inicio, frecuencia, evolución..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Exploración Física:
                </label>
                <textarea
                  rows={2}
                  value={exploracion}
                  onChange={(e) => setExploracion(e.target.value)}
                  placeholder="Cabeza, cuello, campos pulmonares, ruidos cardiacos, abdomen..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
                />
              </div>

              {/* CIE-10 Autocomplete Search */}
              <div className="relative">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Diagnóstico Clínico (Búsqueda predictiva con código CIE-10):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={diagnosticoTexto}
                    onChange={(e) => {
                      setDiagnosticoTexto(e.target.value);
                      setCie10Search(e.target.value);
                      setShowCIE10Dropdown(true);
                    }}
                    placeholder="Escriba el diagnóstico o código CIE-10 (ej. Rinofaringitis, J00, Gastritis...)"
                    className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
                  />
                </div>

                {/* Autocomplete dropdown */}
                {showCIE10Dropdown && filteredCIE10.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {filteredCIE10.map((c) => (
                      <button
                        key={c.codigo}
                        type="button"
                        onClick={() => {
                          setDiagnosticoTexto(`${c.codigo} - ${c.descripcion}`);
                          setSelectedCIE10(c.codigo);
                          setShowCIE10Dropdown(false);
                        }}
                        className="w-full text-left p-2.5 hover:bg-teal-50 text-xs flex justify-between items-center transition"
                      >
                        <span className="font-medium text-slate-800">{c.descripcion}</span>
                        <span className="font-mono font-bold text-teal-700 bg-teal-100/60 px-1.5 py-0.5 rounded text-[10px]">
                          {c.codigo}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: INTELLIGENT DIGITAL PRESCRIPTION WITH LIVE PHARMACY STOCK */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <QrCode className="w-4 h-4 text-teal-600" />
                  <span>Receta Médica Digital Inteligente</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Stock Farmacia en Vivo
                </span>
              </div>

              {/* Quick Preset Templates */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Plantillas de Prescripción Rápida:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESCRIPTION_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyTemplate(tmpl)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-[11px] font-semibold transition border border-slate-200/80 active:scale-95"
                    >
                      {tmpl.titulo.split('(')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergy Warning if triggered */}
              {allergyAlerts.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-900 space-y-1 animate-pulse">
                  {allergyAlerts.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-bold">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Predictive Medicine Search by 2-3 characters */}
              <div className="relative space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Buscador de Medicamentos (Teclea 2 o 3 letras):
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={medSearchQuery}
                    onChange={(e) => {
                      setMedSearchQuery(e.target.value);
                      setShowMedSuggestions(true);
                    }}
                    placeholder="Ej. Amo (Amoxil / Amoxicilina), Par (Paracetamol)..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
                  />
                </div>

                {/* Suggestions List with REAL-TIME PHARMACY STOCK */}
                {showMedSuggestions && filteredMedCatalog.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {filteredMedCatalog.map((product) => {
                      const hasStock = product.stock > 0;
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setTempSelectedProduct(product);
                            setMedSearchQuery(product.nombre);
                            setTempDosis(product.presentacion);
                            setShowMedSuggestions(false);
                          }}
                          className="w-full text-left p-2.5 hover:bg-slate-50 text-xs flex items-center justify-between transition"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{product.nombre}</div>
                            <div className="text-[11px] text-slate-500">
                              {product.sustanciaActiva} • {product.presentacion}
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                hasStock
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {hasStock ? `En Farmacia: ${product.stock} disp.` : 'Agotado'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dosing Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Dosis:
                  </label>
                  <input
                    type="text"
                    value={tempDosis}
                    onChange={(e) => setTempDosis(e.target.value)}
                    placeholder="Ej. 1 cápsula 500mg"
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Frecuencia:
                  </label>
                  <input
                    type="text"
                    value={tempFrecuencia}
                    onChange={(e) => setTempFrecuencia(e.target.value)}
                    placeholder="Cada 8 horas"
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Duración:
                  </label>
                  <input
                    type="text"
                    value={tempDuracion}
                    onChange={(e) => setTempDuracion(e.target.value)}
                    placeholder="Por 7 días"
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempIndicaciones}
                  onChange={(e) => setTempIndicaciones(e.target.value)}
                  placeholder="Indicaciones adicionales (ej. Con alimentos, abundante agua...)"
                  className="flex-1 p-2 rounded-lg border border-slate-200 text-xs"
                />
                <button
                  type="button"
                  onClick={addMedicineToPrescription}
                  className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shrink-0 transition"
                >
                  + Agregar Fármaco
                </button>
              </div>

              {/* Prescribed Items List */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 divide-y divide-slate-200/80">
                <div className="font-bold text-slate-700 text-xs pb-1.5 flex justify-between">
                  <span>Medicamentos a Prescribir:</span>
                  <span className="text-teal-700 font-mono">
                    {prescriptionMeds.length} añadidos
                  </span>
                </div>

                {prescriptionMeds.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No has añadido medicamentos a la receta aún.
                  </div>
                ) : (
                  prescriptionMeds.map((med, idx) => (
                    <div key={idx} className="py-2 flex items-start justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">
                          {med.nombre}{' '}
                          <span className="text-[11px] text-slate-500 font-normal">
                            ({med.sustanciaActiva})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {med.dosis} • {med.frecuencia} • {med.duracion}
                        </div>
                        {med.indicaciones && (
                          <div className="text-[10px] text-slate-400 italic">
                            Nota: {med.indicaciones}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            (med.stockActualFarmacia || 0) > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          Stock: {med.stockActualFarmacia || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPrescriptionMeds((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Indicaciones Generales / Dieta / Cuidados:
                </label>
                <textarea
                  rows={2}
                  value={indicacionesGenerales}
                  onChange={(e) => setIndicacionesGenerales(e.target.value)}
                  placeholder="Dieta blanda, reposo, signos de alarma para urgencias..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
                />
              </div>

              {/* Action Buttons: Finalize Consultation & Issue Prescription */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowCertModal(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Emitir Constancia Médica
                </button>

                <button
                  type="button"
                  onClick={finalizeConsultation}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-600/20 transition active:scale-95 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Finalizar Consulta & Sincronizar Receta con POS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: EMITTED PRESCRIPTIONS HISTORY */}
      {activeSubTab === 'recetas' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Historial de Recetas Médicas Emitidas</h3>
              <p className="text-xs text-slate-500">
                Recetas con código QR y código de barras vinculadas a la farmacia.
              </p>
            </div>
            <span className="text-xs font-bold bg-teal-50 text-teal-800 px-3 py-1 rounded-xl border border-teal-200">
              {prescriptions.length} Recetas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Folio: {p.id}
                    </span>
                    <h4 className="font-bold text-slate-900 mt-1">{p.pacienteNombre}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.estado === 'surtida_total'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.estado === 'surtida_total' ? 'Surtida en Farmacia' : 'Pendiente de Surtir'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {p.medicamentos.map((m, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>• {m.nombre}</span>
                      <span className="text-slate-400">{m.dosis}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">{p.fechaEmision}</span>
                  <button
                    onClick={() => setCurrentPrescriptionModal(p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Ver Receta Digital</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: CERTIFICADOS Y JUSTIFICANTES MÉDICOS */}
      {activeSubTab === 'certificados' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Emisión de Constancias y Certificados Médicos</h3>
          <p className="text-xs text-slate-500">
            Genera constancias de salud, justificación laboral o escolar y solicitudes de análisis clínicos.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Paciente:</label>
              <select
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                onChange={(e) => {
                  const p = patients.find((x) => x.id === e.target.value);
                  setSelectedPatient(p || null);
                }}
              >
                <option value="">-- Seleccionar Paciente --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Días de Reposo Sugeridos:</label>
              <input
                type="number"
                value={certDiasReposo}
                onChange={(e) => setCertDiasReposo(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Diagnóstico Clínico:</label>
              <input
                type="text"
                value={certDiagnostico}
                onChange={(e) => setCertDiagnostico(e.target.value)}
                placeholder="Ej. Infección respiratoria aguda no neumónica..."
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>

            <button
              onClick={() => {
                if (!selectedPatient) {
                  alert('Seleccione un paciente primero.');
                  return;
                }
                setShowCertModal(true);
              }}
              className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-xs"
            >
              Generar Constancia Imprimible
            </button>
          </div>
        </div>
      )}

      {/* PRINTABLE DIGITAL PRESCRIPTION MODAL WITH QR & BARCODE */}
      {currentPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            {/* Prescription Header */}
            <div className="flex justify-between items-start border-b-2 border-teal-600 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  CLÍNICA Y FARMACIA POS
                </h2>
                <div className="text-xs text-slate-600 mt-1 font-medium">
                  <strong>{currentPrescriptionModal.medicoNombre}</strong><br />
                  {currentPrescriptionModal.medicoEspecialidad}<br />
                  Cédula Profesional: {currentPrescriptionModal.medicoCedula}
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-sm font-black text-teal-700 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
                  Folio: {currentPrescriptionModal.id}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Fecha: {currentPrescriptionModal.fechaEmision}
                </span>
              </div>
            </div>

            {/* Patient Info */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700 grid grid-cols-2 gap-2">
              <div>
                <span className="font-bold text-slate-900">Paciente:</span>{' '}
                {currentPrescriptionModal.pacienteNombre}
              </div>
              <div>
                <span className="font-bold text-slate-900">Diagnóstico:</span>{' '}
                {currentPrescriptionModal.diagnostico}
              </div>
            </div>

            {/* Medications Body */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 border-b pb-1">
                Rx Prescripción Médica:
              </h4>

              <div className="space-y-3">
                {currentPrescriptionModal.medicamentos.map((m, idx) => (
                  <div key={idx} className="border-l-4 border-teal-500 pl-3 py-1 text-xs">
                    <div className="font-bold text-slate-900 text-sm">
                      {idx + 1}. {m.nombre} ({m.sustanciaActiva})
                    </div>
                    <div className="text-slate-700 mt-0.5">
                      <strong>Dosis:</strong> {m.dosis} • <strong>Frecuencia:</strong> {m.frecuencia} •{' '}
                      <strong>Duración:</strong> {m.duracion}
                    </div>
                    {m.indicaciones && (
                      <div className="text-slate-500 italic mt-0.5">{m.indicaciones}</div>
                    )}
                  </div>
                ))}
              </div>

              {currentPrescriptionModal.indicacionesGenerales && (
                <div className="p-3 rounded-xl bg-slate-50 border text-xs text-slate-700">
                  <strong>Indicaciones Generales:</strong>{' '}
                  {currentPrescriptionModal.indicacionesGenerales}
                </div>
              )}
            </div>

            {/* QR Code + Digital Signature + Barcode Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* QR representation */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-slate-900 text-white p-2 rounded-xl flex items-center justify-center font-mono text-[9px] text-center shrink-0">
                  [QR CANJE<br />FARMACIA]
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  <strong>Canje Digital Directo:</strong><br />
                  Presente este código en mostrador de la farmacia para surtido inmediato.
                </div>
              </div>

              {/* Digital Signature */}
              <div className="text-right">
                <div className="font-serif italic text-teal-800 text-lg font-bold">
                  Dra. Elena Ramos Gómez
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Firma Digital Verificada • Hash: {currentPrescriptionModal.firmaDigital}
                </div>
              </div>
            </div>

            {/* Print Action Bar */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Imprimir en PDF
              </button>
              <button
                onClick={() => setCurrentPrescriptionModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEDICAL CERTIFICATE MODAL */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b pb-2">
              Constancia Médica Oficial
            </h3>
            <div className="text-xs text-slate-700 space-y-3 leading-relaxed bg-slate-50 p-4 rounded-xl border">
              <p>
                A QUIEN CORRESPONDA:<br />
                Por medio de la presente se hace constar que el paciente{' '}
                <strong>
                  {selectedPatient?.nombre} {selectedPatient?.apellido}
                </strong>{' '}
                fue evaluado clínicamente en esta fecha presentando:{' '}
                <strong>{certDiagnostico || diagnosticoTexto || 'Padecimiento agudo en tratamiento'}</strong>.
              </p>
              <p>
                Por lo anterior, se le indicó reposo en casa por un lapso de{' '}
                <strong>{certDiasReposo} días</strong> a partir de la fecha de expedición.
              </p>
              <div className="pt-4 text-center">
                <div className="font-bold">Dra. Elena Ramos Gómez</div>
                <div className="text-[11px] text-slate-500">Cédula Prof. CED-9842104</div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border text-xs font-bold hover:bg-slate-50"
              >
                Imprimir
              </button>
              <button
                onClick={() => setShowCertModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
