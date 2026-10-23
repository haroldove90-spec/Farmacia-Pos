import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  QrCode,
  Download,
  Share2,
  Bell,
  CheckCircle2,
  FileText,
  User,
  HeartPulse,
  Printer
} from 'lucide-react';
import { useDataStore } from '../services/dataStore';
import { Prescription, Appointment } from '../types';

interface PatientModuleProps {
  activeSubTab: string;
}

export const PatientModule: React.FC<PatientModuleProps> = ({ activeSubTab }) => {
  const store = useDataStore();
  const prescriptions = store.getPrescriptions();
  const appointments = store.getAppointments();

  // Booking state
  const [selectedDoctor, setSelectedDoctor] = useState('Dra. Elena Ramos Gómez');
  const [bookingDate, setBookingDate] = useState('2026-10-24');
  const [bookingTime, setBookingTime] = useState('11:00');
  const [patientName, setPatientName] = useState('María González López');
  const [patientPhone, setPatientPhone] = useState('55 1234 5678');
  const [bookingReason, setBookingReason] = useState('Revisión de control de presión y estudios');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Selected prescription modal
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const newApt: Appointment = {
      id: 'apt-' + Date.now(),
      pacienteId: 'pat-1',
      pacienteNombre: patientName,
      telefono: patientPhone,
      medicoId: 'med-1',
      medicoNombre: selectedDoctor,
      fecha: bookingDate,
      hora: bookingTime,
      motivo: bookingReason,
      tipo: 'cita_previa',
      estado: 'programada',
      pagoConsulta: {
        monto: 150,
        pagado: false
      }
    };

    store.saveAppointment(newApt);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
    }, 4000);
  };

  return (
    <div className="p-3 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Patient Portal Welcome Header */}
      <div className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
            Portal Digital del Paciente
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            Hola, María González López
          </h2>
          <p className="text-xs text-teal-100 mt-1">
            Consulta tus recetas digitales con código QR para canje en farmacia y gestiona tus citas.
          </p>
        </div>

        <div className="flex gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-white/20 text-xs font-semibold backdrop-blur-xs">
            Expediente #pat-1
          </span>
        </div>
      </div>

      {/* SUB-TAB: MIS RECETAS DIGITALES */}
      {(activeSubTab === 'mis_recetas' || !activeSubTab) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <QrCode className="w-5 h-5 text-teal-600" />
              <span>Mis Recetas Médicas Digitales</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {prescriptions.length} recetas en tu historial
            </span>
          </div>

          <div className="space-y-4">
            {prescriptions.map((p) => (
              <div
                key={p.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 hover:border-teal-400 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                      Folio: {p.id}
                    </span>
                    <h4 className="font-bold text-slate-900 mt-1 text-base">
                      {p.diagnostico}
                    </h4>
                    <span className="text-xs text-slate-500">
                      Médico: {p.medicoNombre} • Cédula: {p.medicoCedula}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                      p.estado === 'surtida_total'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-teal-50 text-teal-700 border border-teal-200'
                    }`}
                  >
                    {p.estado === 'surtida_total' ? 'Surtida en Farmacia' : 'Disponible para Canje'}
                  </span>
                </div>

                {/* Prescribed Drugs list */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-2">
                  <div className="font-bold text-teal-800 uppercase text-[11px] tracking-wide">
                    Tratamiento Indicado:
                  </div>
                  {p.medicamentos.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-900">
                        • {m.nombre} ({m.dosis})
                      </span>
                      <span className="text-slate-500 text-[11px] font-medium">
                        {m.frecuencia} - {m.duracion}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-slate-400">Emitida el: {p.fechaEmision}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const text = `Hola, te comparto mi receta médica digital de Farmacia POS. Folio: ${p.id} - Diagnóstico: ${p.diagnostico}. Presenta este código en mostrador.`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Compartir por WhatsApp</span>
                    </button>

                    <button
                      onClick={() => setViewPrescription(p)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Ver Código QR</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: AGENDAR CITA EN LÍNEA */}
      {activeSubTab === 'citas' && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="border-b pb-3">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>Agendar Nueva Cita Médica en Línea</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Elige fecha y horario disponible. Tu cita quedará reservada en el consultorio.
            </p>
          </div>

          {bookingSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                ¡Cita confirmada con éxito para el {bookingDate} a las {bookingTime} hrs! Te esperamos.
              </span>
            </div>
          )}

          <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Médico / Especialidad:</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="Dra. Elena Ramos Gómez">
                    Dra. Elena Ramos Gómez — Medicina General & Familiar
                  </option>
                  <option value="Dr. Carlos Villaseñor">
                    Dr. Carlos Villaseñor — Medicina Interna
                  </option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fecha de la Cita:</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Horario Deseado:</label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                >
                  <option value="09:00">09:00 hrs</option>
                  <option value="10:00">10:00 hrs</option>
                  <option value="11:00">11:00 hrs</option>
                  <option value="12:00">12:00 hrs</option>
                  <option value="16:00">16:00 hrs</option>
                  <option value="17:00">17:00 hrs</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Teléfono Móvil:</label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Motivo de la Cita:</label>
              <textarea
                rows={2}
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
                placeholder="Breve descripción del motivo..."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95"
              >
                Confirmar y Reservar Cita
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB: RECORDATORIO DE TOMA DE MEDICAMENTOS */}
      {activeSubTab === 'recordatorios' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <span>Recordatorios Automáticos de Tomas y Horarios</span>
            </h3>
            <p className="text-xs text-slate-500">
              Notificaciones programadas basadas en la última receta médica emitida.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                med: 'Omeprazol 20mg',
                hora: '08:00 AM (En ayuno)',
                indicacion: 'Tomar 30 min antes del desayuno con un vaso de agua',
                activo: true
              },
              {
                med: 'Paracetamol 500mg',
                hora: '14:00 PM',
                indicacion: 'Solo en caso de dolor de cabeza o malestar',
                activo: true
              },
              {
                med: 'Losartán 50mg',
                hora: '21:00 PM',
                indicacion: 'Control nocturno de presión arterial',
                activo: true
              }
            ].map((r, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm">{r.med}</div>
                  <div className="text-teal-700 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {r.hora}
                  </div>
                  <div className="text-slate-500 text-[11px]">{r.indicacion}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Alarma Activa
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL QR VIEW FOR PHARMACY REDEMPTION */}
      {viewPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-black text-slate-900 text-lg">
              Receta Digital de {viewPrescription.pacienteNombre}
            </h3>
            <p className="text-xs text-slate-500">
              Muestra este código QR en el mostrador de Farmacia POS para cargar tus medicamentos de forma instantánea.
            </p>

            <div className="p-4 bg-slate-50 border-2 border-dashed border-teal-500 rounded-2xl inline-block mx-auto">
              <div className="w-44 h-44 bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center font-mono text-xs p-3">
                <QrCode className="w-16 h-16 text-teal-400 mb-2" />
                <span className="text-[10px] text-teal-200">{viewPrescription.id}</span>
                <span className="text-[9px] text-slate-400">FARMPOS-SYNC</span>
              </div>
            </div>

            <div className="text-xs font-bold font-mono text-slate-700">
              Folio: {viewPrescription.id}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border text-xs font-bold hover:bg-slate-50"
              >
                Imprimir
              </button>
              <button
                onClick={() => setViewPrescription(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
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
