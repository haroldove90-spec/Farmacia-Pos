import React, { useState } from 'react';
import {
  UserPlus,
  Volume2,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Search,
  BellRing,
  CreditCard,
  Banknote,
  Receipt
} from 'lucide-react';
import { Patient, Appointment } from '../types';
import { useDataStore } from '../services/dataStore';

interface ReceptionModuleProps {
  activeSubTab: string;
}

export const ReceptionModule: React.FC<ReceptionModuleProps> = ({ activeSubTab }) => {
  const store = useDataStore();
  const patients = store.getPatients();
  const appointments = store.getAppointments();

  // Fast Patient Registration Form (< 1 min)
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [edad, setEdad] = useState('');
  const [genero, setGenero] = useState<'M' | 'F' | 'Otro'>('M');
  const [telefono, setTelefono] = useState('');
  const [alergias, setAlergias] = useState('');
  const [antecedentes, setAntecedentes] = useState('');
  const [motivoConsulta, setMotivoConsulta] = useState('');

  // Initial Triage vitals
  const [temp, setTemp] = useState('36.5');
  const [presion, setPresion] = useState('120/80');
  const [peso, setPeso] = useState('70');

  // Consultation payment in reception
  const [cobrarConsulta, setCobrarConsulta] = useState(true);
  const [montoConsulta, setMontoConsulta] = useState('150.00');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta'>('efectivo');

  // Waiting Room Calling audio/visual state
  const [calledPatient, setCalledPatient] = useState<Appointment | null>(null);
  const [searchPatientQuery, setSearchPatientQuery] = useState('');

  // Handle Quick Patient Admission
  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim() || !telefono.trim()) {
      alert('Por favor ingrese al menos Nombre, Apellido y Teléfono.');
      return;
    }

    const patientId = 'pat-' + Date.now();
    const newPatient: Patient = {
      id: patientId,
      nombre,
      apellido,
      edad: parseInt(edad) || 30,
      genero,
      telefono,
      fechaNacimiento: '1995-01-01',
      alergias: alergias.trim() ? alergias.split(',').map((s) => s.trim()) : ['Ninguna'],
      antecedentesPatologicos: antecedentes.trim()
        ? antecedentes.split(',').map((s) => s.trim())
        : [],
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    store.savePatient(newPatient);

    // Create turn/appointment in "en_espera" to notify doctor immediately!
    const now = new Date();
    const horaActual = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newAppointment: Appointment = {
      id: 'apt-' + Date.now(),
      pacienteId: patientId,
      pacienteNombre: `${nombre} ${apellido}`,
      telefono,
      medicoId: 'med-1',
      medicoNombre: 'Dra. Elena Ramos Gómez',
      fecha: new Date().toISOString().split('T')[0],
      hora: horaActual,
      horaLlegada: horaActual,
      motivo: motivoConsulta || 'Consulta médica general / triaje',
      tipo: 'turno_llegada',
      estado: 'en_espera', // Live notification to doctor!
      pagoConsulta: {
        monto: parseFloat(montoConsulta) || 150,
        pagado: cobrarConsulta,
        metodoPago: cobrarConsulta ? metodoPago : undefined,
        folioRecibo: cobrarConsulta ? 'REC-' + Math.floor(1000 + Math.random() * 9000) : undefined
      }
    };

    store.saveAppointment(newAppointment);

    alert(
      `¡Paciente registrado con éxito! Estado: "En Espera". Notificación enviada al consultorio médico.`
    );

    // Reset Form
    setNombre('');
    setApellido('');
    setEdad('');
    setTelefono('');
    setAlergias('');
    setAntecedentes('');
    setMotivoConsulta('');
  };

  // Trigger Waiting Room Caller
  const triggerCaller = (apt: Appointment) => {
    setCalledPatient(apt);
    // Play synthetic chime alert
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(520, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  // Filter patients directory
  const filteredPatients = patients.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchPatientQuery.toLowerCase()) ||
      p.apellido.toLowerCase().includes(searchPatientQuery.toLowerCase()) ||
      p.telefono.includes(searchPatientQuery)
  );

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* CALLER MODAL / BANNER OVERLAY */}
      {calledPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center space-y-6 border-4 border-teal-500 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-teal-50 text-teal-600 mx-auto flex items-center justify-center animate-pulse">
              <Volume2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                LLAMANDO A SALA DE ESPERA
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-2">
                {calledPatient.pacienteNombre}
              </h2>
              <div className="text-lg font-bold text-teal-700">
                Pase a: CONSULTORIO 1 con {calledPatient.medicoNombre}
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Turno #{calledPatient.id.slice(-4)} • Motivo: {calledPatient.motivo}
            </p>

            <button
              onClick={() => setCalledPatient(null)}
              className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition"
            >
              Cerrar Aviso
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB: ADMISIÓN Y TRIAJE RÁPIDO (< 1 MIN) */}
      {(activeSubTab === 'triaje' || !activeSubTab) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                <span>Alta Rápida de Paciente & Triaje Inicial (&lt; 1 min)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Captura los datos del paciente para ingresarlo a la sala de espera y notificar al médico en vivo.
              </p>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre(s) *:</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Roberto"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Apellidos *:</label>
                  <input
                    type="text"
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Ej. Mendoza Castro"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Edad (Años):</label>
                  <input
                    type="number"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    placeholder="Ej. 34"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Género:</label>
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value as 'M' | 'F' | 'Otro')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono / WhatsApp *:</label>
                  <input
                    type="tel"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. 55 1234 5678"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alergias Conocidas:</label>
                  <input
                    type="text"
                    value={alergias}
                    onChange={(e) => setAlergias(e.target.value)}
                    placeholder="Ej. Penicilina, Sulfa, Ninguna..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* Triage capture */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Activity className="w-4 h-4 text-teal-600" />
                  Triaje Inicial de Signos Vitales (Adelanta el trabajo del médico):
                </span>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                      Presión:
                    </label>
                    <input
                      type="text"
                      value={presion}
                      onChange={(e) => setPresion(e.target.value)}
                      placeholder="120/80"
                      className="w-full p-2 rounded-lg border border-slate-200 font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                      Temp (°C):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      placeholder="36.5"
                      className="w-full p-2 rounded-lg border border-slate-200 font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                      Peso (kg):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={peso}
                      onChange={(e) => setPeso(e.target.value)}
                      placeholder="70"
                      className="w-full p-2 rounded-lg border border-slate-200 font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Motivo de Visita / Síntomas Principales:
                </label>
                <input
                  type="text"
                  value={motivoConsulta}
                  onChange={(e) => setMotivoConsulta(e.target.value)}
                  placeholder="Ej. Fiebre persistente, dolor de garganta, revisión de rutina..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
                />
              </div>

              {/* Consultation fee charge in reception */}
              <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-teal-900">
                  <input
                    type="checkbox"
                    checked={cobrarConsulta}
                    onChange={(e) => setCobrarConsulta(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Cobrar honorarios de consulta anticipadamente ($150.00 MXN)</span>
                </label>

                {cobrarConsulta && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="font-medium text-slate-600">Forma de Pago:</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={metodoPago === 'efectivo'}
                        onChange={() => setMetodoPago('efectivo')}
                      />
                      <span>Efectivo</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={metodoPago === 'tarjeta'}
                        onChange={() => setMetodoPago('tarjeta')}
                      />
                      <span>Tarjeta</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
                >
                  Registrar e Ingresar a Sala de Espera
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: LIVE WAITING ROOM QUEUE */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Sala de Espera Actual</span>
              </h4>
              <span className="text-xs font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                {appointments.filter((a) => a.estado === 'en_espera').length} Pacientes
              </span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
              {appointments
                .filter((a) => a.estado === 'en_espera')
                .map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900">{apt.pacienteNombre}</div>
                        <div className="text-[11px] text-slate-500">Llegada: {apt.horaLlegada || apt.hora}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/70 text-amber-900">
                        En Espera
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 line-clamp-1">
                      Motivo: {apt.motivo}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        {apt.pagoConsulta.pagado ? '✅ Consulta Pagada' : '⏳ Pago Pendiente'}
                      </span>
                      <button
                        onClick={() => triggerCaller(apt)}
                        className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center gap-1 transition"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Llamar</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: TURNOS & PANTALLA SALA DE ESPERA / LLAMADOR */}
      {activeSubTab === 'turnos' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Volume2 className="w-6 h-6 text-teal-600" />
                <span>Pantalla y Llamador Interactivo de Pacientes</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Utiliza esta vista en pantallas de la sala de espera para alertar a los pacientes cuando el médico está listo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-teal-400 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      TURNO #{apt.id.slice(-4)}
                    </span>
                    <h4 className="font-black text-slate-900 text-lg mt-1">
                      {apt.pacienteNombre}
                    </h4>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      apt.estado === 'en_espera'
                        ? 'bg-amber-100 text-amber-800'
                        : apt.estado === 'en_consulta'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {apt.estado.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border text-xs text-slate-600">
                  <div>
                    <strong>Médico:</strong> {apt.medicoNombre}
                  </div>
                  <div>
                    <strong>Hora cita:</strong> {apt.hora} hrs
                  </div>
                  <div>
                    <strong>Llegada:</strong> {apt.horaLlegada || 'No registrada'}
                  </div>
                </div>

                <button
                  onClick={() => triggerCaller(apt)}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Llamar por Altavoz a Consultorio 1</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: COBRO DE CONSULTAS */}
      {activeSubTab === 'cobro' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-4xl mx-auto">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Módulo de Cobro de Honorarios Médicos</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {appointments.map((apt) => (
              <div key={apt.id} className="py-3.5 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <div className="font-bold text-slate-900">{apt.pacienteNombre}</div>
                  <div className="text-slate-500 text-xs">
                    Consulta con {apt.medicoNombre} • {apt.fecha}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 block">
                      ${apt.pagoConsulta.monto.toFixed(2)}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        apt.pagoConsulta.pagado ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {apt.pagoConsulta.pagado ? `Pagado (${apt.pagoConsulta.folioRecibo})` : 'Pendiente'}
                    </span>
                  </div>

                  {!apt.pagoConsulta.pagado && (
                    <button
                      onClick={() => {
                        apt.pagoConsulta.pagado = true;
                        apt.pagoConsulta.metodoPago = 'efectivo';
                        apt.pagoConsulta.folioRecibo = 'REC-' + Math.floor(1000 + Math.random() * 9000);
                        store.saveAppointment(apt);
                        alert(`Honorarios de ${apt.pacienteNombre} cobrados con éxito.`);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Cobrar Ahora
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: DIRECTORIO DE PACIENTES */}
      {activeSubTab === 'directorio' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Directorio Maestro de Pacientes</h3>
              <p className="text-xs text-slate-500">
                Historial de pacientes registrados en la clínica.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchPatientQuery}
                onChange={(e) => setSearchPatientQuery(e.target.value)}
                placeholder="Buscar por nombre o teléfono..."
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {p.nombre} {p.apellido}
                  </h4>
                  <span className="text-slate-400 text-[11px] font-mono">#{p.id}</span>
                </div>
                <div className="text-slate-600">
                  Edad: {p.edad} años • Género: {p.genero} • Tel: {p.telefono}
                </div>
                <div className="p-2 rounded-lg bg-rose-50 text-rose-800 text-[11px] font-semibold">
                  Alergias: {p.alergias.join(', ') || 'Ninguna'}
                </div>
                <div className="text-[11px] text-slate-400">Registrado el: {p.fechaRegistro}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
