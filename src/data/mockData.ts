import { Product, Patient, Appointment, Prescription, Consultation, CIE10Item } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    codigoBarras: '7501001122334',
    nombre: 'Amoxil 500mg',
    sustanciaActiva: 'Amoxicilina',
    laboratorio: 'GSK',
    presentacion: 'Caja con 12 cápsulas',
    categoria: 'antibiotico',
    precioVenta: 185.00,
    precioCosto: 95.00,
    stock: 18,
    stockMinimo: 10,
    lote: 'L-2024A',
    fechaCaducidad: '2027-04-15',
    fotoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
    esPatente: true,
    equivalenteGenericoId: 'prod-2'
  },
  {
    id: 'prod-2',
    codigoBarras: '7502003344556',
    nombre: 'Amoxicilina 500mg Genérico',
    sustanciaActiva: 'Amoxicilina',
    laboratorio: 'Laboratorios Pisa',
    presentacion: 'Caja con 12 cápsulas',
    categoria: 'antibiotico',
    precioVenta: 48.00,
    precioCosto: 18.00,
    stock: 42,
    stockMinimo: 15,
    lote: 'L-9811P',
    fechaCaducidad: '2027-08-20',
    fotoUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop&q=80',
    esPatente: false
  },
  {
    id: 'prod-3',
    codigoBarras: '7501055667788',
    nombre: 'Tylenol 500mg',
    sustanciaActiva: 'Paracetamol',
    laboratorio: 'Johnson & Johnson',
    presentacion: 'Caja con 20 tabletas',
    categoria: 'medicamento',
    precioVenta: 95.00,
    precioCosto: 45.00,
    stock: 25,
    stockMinimo: 10,
    lote: 'TY-4421',
    fechaCaducidad: '2027-11-30',
    fotoUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&auto=format&fit=crop&q=80',
    esPatente: true,
    equivalenteGenericoId: 'prod-4'
  },
  {
    id: 'prod-4',
    codigoBarras: '7503011223344',
    nombre: 'Paracetamol 500mg Genérico',
    sustanciaActiva: 'Paracetamol',
    laboratorio: 'Apotex',
    presentacion: 'Caja con 20 tabletas',
    categoria: 'medicamento',
    precioVenta: 22.00,
    precioCosto: 7.50,
    stock: 65,
    stockMinimo: 20,
    lote: 'AP-552',
    fechaCaducidad: '2028-02-14',
    fotoUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&auto=format&fit=crop&q=80',
    esPatente: false
  },
  {
    id: 'prod-5',
    codigoBarras: '7501112233445',
    nombre: 'Nexium-MUPS 40mg',
    sustanciaActiva: 'Esomeprazol',
    laboratorio: 'AstraZeneca',
    presentacion: 'Caja con 14 tabletas',
    categoria: 'medicamento',
    precioVenta: 420.00,
    precioCosto: 240.00,
    stock: 8,
    stockMinimo: 5,
    lote: 'NX-882',
    fechaCaducidad: '2026-12-10', // próximo en 2 meses
    fotoUrl: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&auto=format&fit=crop&q=80',
    esPatente: true,
    equivalenteGenericoId: 'prod-6'
  },
  {
    id: 'prod-6',
    codigoBarras: '7504012345678',
    nombre: 'Omeprazol 20mg Genérico',
    sustanciaActiva: 'Omeprazol',
    laboratorio: 'Kener',
    presentacion: 'Caja con 14 cápsulas',
    categoria: 'medicamento',
    precioVenta: 35.00,
    precioCosto: 12.00,
    stock: 35,
    stockMinimo: 12,
    lote: 'OM-231',
    fechaCaducidad: '2027-09-18',
    fotoUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=80',
    esPatente: false
  },
  {
    id: 'prod-7',
    codigoBarras: '7501223344556',
    nombre: 'Cozaar 50mg',
    sustanciaActiva: 'Losartán',
    laboratorio: 'Organon',
    presentacion: 'Caja con 30 tabletas',
    categoria: 'medicamento',
    precioVenta: 560.00,
    precioCosto: 310.00,
    stock: 4, // Stock bajo
    stockMinimo: 6,
    lote: 'CZ-901',
    fechaCaducidad: '2026-11-20', // Próximo a vencer < 30 días!
    fotoUrl: 'https://images.unsplash.com/photo-1579165466791-78818925567b?w=400&auto=format&fit=crop&q=80',
    esPatente: true,
    equivalenteGenericoId: 'prod-8'
  },
  {
    id: 'prod-8',
    codigoBarras: '7505011223344',
    nombre: 'Losartán 50mg Genérico',
    sustanciaActiva: 'Losartán',
    laboratorio: 'Ultra Laboratorios',
    presentacion: 'Caja con 30 tabletas',
    categoria: 'medicamento',
    precioVenta: 65.00,
    precioCosto: 24.00,
    stock: 28,
    stockMinimo: 10,
    lote: 'UL-772',
    fechaCaducidad: '2027-10-11',
    fotoUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&auto=format&fit=crop&q=80',
    esPatente: false
  },
  {
    id: 'prod-9',
    codigoBarras: '7501334455667',
    nombre: 'Glucophage 850mg',
    sustanciaActiva: 'Metformina',
    laboratorio: 'Merck',
    presentacion: 'Caja con 30 tabletas',
    categoria: 'medicamento',
    precioVenta: 290.00,
    precioCosto: 140.00,
    stock: 14,
    stockMinimo: 8,
    lote: 'GP-661',
    fechaCaducidad: '2027-05-30',
    fotoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
    esPatente: true,
    equivalenteGenericoId: 'prod-10'
  },
  {
    id: 'prod-10',
    codigoBarras: '7506011223344',
    nombre: 'Metformina 850mg Genérico',
    sustanciaActiva: 'Metformina',
    laboratorio: 'Bruluart',
    presentacion: 'Caja con 30 tabletas',
    categoria: 'medicamento',
    precioVenta: 42.00,
    precioCosto: 14.50,
    stock: 50,
    stockMinimo: 15,
    lote: 'BR-409',
    fechaCaducidad: '2028-01-15',
    fotoUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop&q=80',
    esPatente: false
  },
  {
    id: 'prod-11',
    codigoBarras: '7501445566778',
    nombre: 'Keterolaco Sublingual 30mg',
    sustanciaActiva: 'Ketorolaco Trometamina',
    laboratorio: 'Mavi',
    presentacion: 'Caja con 4 tabletas sublinguales',
    categoria: 'medicamento',
    precioVenta: 88.00,
    precioCosto: 32.00,
    stock: 19,
    stockMinimo: 8,
    lote: 'MV-102',
    fechaCaducidad: '2027-06-25',
    fotoUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&auto=format&fit=crop&q=80',
    esPatente: false
  },
  {
    id: 'prod-12',
    codigoBarras: '7501556677889',
    nombre: 'Azitromicina 500mg',
    sustanciaActiva: 'Azitromicina',
    laboratorio: 'Sandoz',
    presentacion: 'Caja con 3 tabletas',
    categoria: 'antibiotico',
    precioVenta: 145.00,
    precioCosto: 60.00,
    stock: 12,
    stockMinimo: 6,
    lote: 'AZ-331',
    fechaCaducidad: '2027-03-12',
    fotoUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&auto=format&fit=crop&q=80',
    esPatente: false
  },
  {
    id: 'prod-13',
    codigoBarras: '7501667788990',
    nombre: 'Clonazepam 2mg (Controlado)',
    sustanciaActiva: 'Clonazepam',
    laboratorio: 'Roche',
    presentacion: 'Caja con 30 tabletas',
    categoria: 'controlado',
    precioVenta: 320.00,
    precioCosto: 180.00,
    stock: 6,
    stockMinimo: 5,
    lote: 'CL-009',
    fechaCaducidad: '2027-12-05',
    fotoUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=80',
    esPatente: true
  },
  {
    id: 'prod-14',
    codigoBarras: '7501778899001',
    nombre: 'Alcohol Antiséptico 70% 500ml',
    sustanciaActiva: 'Alcohol Etílico',
    laboratorio: 'Protec',
    presentacion: 'Frasco con 500ml',
    categoria: 'material_curacion',
    precioVenta: 38.00,
    precioCosto: 19.00,
    stock: 30,
    stockMinimo: 10,
    lote: 'AL-882',
    fechaCaducidad: '2028-10-01',
    fotoUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=80',
    esPatente: false
  },
  {
    id: 'prod-15',
    codigoBarras: '7501889900112',
    nombre: 'Suero Oral Electrolit Fresa 625ml',
    sustanciaActiva: 'Electrolitos Orales',
    laboratorio: 'Pisa',
    presentacion: 'Botella 625ml',
    categoria: 'medicamento',
    precioVenta: 32.00,
    precioCosto: 18.00,
    stock: 45,
    stockMinimo: 15,
    lote: 'EL-112',
    fechaCaducidad: '2027-01-28',
    fotoUrl: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&auto=format&fit=crop&q=80',
    esPatente: true
  },
  {
    id: 'prod-16',
    codigoBarras: '7501990011223',
    nombre: 'Termómetro Digital Infrarrojo',
    sustanciaActiva: 'Dispositivo Médico',
    laboratorio: 'Citizen',
    presentacion: '1 Unidad en caja',
    categoria: 'material_curacion',
    precioVenta: 280.00,
    precioCosto: 150.00,
    stock: 5,
    stockMinimo: 3,
    lote: 'TM-012',
    fechaCaducidad: '2030-01-01',
    fotoUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&auto=format&fit=crop&q=80',
    esPatente: false
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    nombre: 'María',
    apellido: 'González López',
    edad: 42,
    genero: 'F',
    telefono: '55 1234 5678',
    email: 'maria.gonzalez@email.com',
    fechaNacimiento: '1984-06-14',
    alergias: ['Penicilina', 'Amoxicilina'],
    antecedentesPatologicos: ['Hipertensión arterial diagnosticada en 2021'],
    antecedentesQuirurgicos: ['Apendicectomía (2012)'],
    contactoEmergencia: 'Roberto González (Esposo) - 55 9876 5432',
    fechaRegistro: '2026-01-10'
  },
  {
    id: 'pat-2',
    nombre: 'Carlos',
    apellido: 'Ramírez Morales',
    edad: 58,
    genero: 'M',
    telefono: '55 4321 8765',
    email: 'carlos.ramirez@email.com',
    fechaNacimiento: '1968-11-03',
    alergias: ['Ninguna conocida'],
    antecedentesPatologicos: ['Diabetes Mellitus tipo 2', 'Dislipidemia'],
    antecedentesQuirurgicos: ['Colecistectomía laparoscópica (2018)'],
    contactoEmergencia: 'Carmen Morales (Hija) - 55 2233 4455',
    fechaRegistro: '2026-02-15'
  },
  {
    id: 'pat-3',
    nombre: 'Sofía',
    apellido: 'Hernández Díaz',
    edad: 27,
    genero: 'F',
    telefono: '55 8899 0011',
    email: 'sofia.hernandez@email.com',
    fechaNacimiento: '1999-03-22',
    alergias: ['Sulfamidas'],
    antecedentesPatologicos: ['Gastritis erosiva crónica'],
    antecedentesQuirurgicos: [],
    contactoEmergencia: 'Laura Díaz (Madre) - 55 7766 5544',
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'pat-4',
    nombre: 'Jorge',
    apellido: 'Torres Valencia',
    edad: 34,
    genero: 'M',
    telefono: '55 6655 4433',
    email: 'jorge.torres@email.com',
    fechaNacimiento: '1992-09-19',
    alergias: ['Ninguna'],
    antecedentesPatologicos: ['Rinitis alérgica estacional'],
    antecedentesQuirurgicos: [],
    contactoEmergencia: 'Mariana Torres (Hermana) - 55 1122 3344',
    fechaRegistro: '2026-03-12'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-101',
    pacienteId: 'pat-1',
    pacienteNombre: 'María González López',
    telefono: '55 1234 5678',
    medicoId: 'med-1',
    medicoNombre: 'Dra. Elena Ramos Gómez',
    fecha: '2026-10-23',
    hora: '10:00',
    motivo: 'Control de presión arterial y dolor de cabeza persistente',
    tipo: 'cita_previa',
    estado: 'en_espera', // Actualmente en sala de espera para alertar al doctor!
    horaLlegada: '09:50',
    pagoConsulta: {
      monto: 150.00,
      pagado: true,
      metodoPago: 'efectivo',
      folioRecibo: 'REC-0081'
    }
  },
  {
    id: 'apt-102',
    pacienteId: 'pat-2',
    pacienteNombre: 'Carlos Ramírez Morales',
    telefono: '55 4321 8765',
    medicoId: 'med-1',
    medicoNombre: 'Dra. Elena Ramos Gómez',
    fecha: '2026-10-23',
    hora: '10:30',
    motivo: 'Revisión glucosa y fatiga matutina',
    tipo: 'cita_previa',
    estado: 'programada',
    pagoConsulta: {
      monto: 150.00,
      pagado: false
    }
  },
  {
    id: 'apt-103',
    pacienteId: 'pat-3',
    pacienteNombre: 'Sofía Hernández Díaz',
    telefono: '55 8899 0011',
    medicoId: 'med-1',
    medicoNombre: 'Dra. Elena Ramos Gómez',
    fecha: '2026-10-23',
    hora: '11:00',
    motivo: 'Ardor estomacal severo y reflujo',
    tipo: 'turno_llegada',
    estado: 'en_espera',
    horaLlegada: '10:15',
    pagoConsulta: {
      monto: 150.00,
      pagado: true,
      metodoPago: 'tarjeta',
      folioRecibo: 'REC-0082'
    }
  }
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'REC-7492',
    pacienteId: 'pat-3',
    pacienteNombre: 'Sofía Hernández Díaz',
    medicoId: 'med-1',
    medicoNombre: 'Dra. Elena Ramos Gómez',
    medicoCedula: 'CED-9842104',
    medicoEspecialidad: 'Médica Cirujana General - UNAM',
    fechaEmision: '2026-10-23 09:30',
    diagnostico: 'Gastritis erosiva aguda y reflujo gastroesofágico',
    diagnosticoCIE10: 'K29.1 Gastritis aguda',
    medicamentos: [
      {
        productoId: 'prod-6',
        nombre: 'Omeprazol 20mg Genérico',
        sustanciaActiva: 'Omeprazol',
        dosis: '1 cápsula (20mg)',
        frecuencia: 'Cada 24 horas en ayuno',
        duracion: 'Por 14 días',
        indicaciones: 'Tomar 30 minutos antes del desayuno con abundante agua.',
        cantidad: 1,
        stockActualFarmacia: 35
      },
      {
        productoId: 'prod-4',
        nombre: 'Paracetamol 500mg Genérico',
        sustanciaActiva: 'Paracetamol',
        dosis: '1 tableta (500mg)',
        frecuencia: 'Cada 8 horas en caso de dolor',
        duracion: 'Por 3 días',
        indicaciones: 'No exceder 3g al día.',
        cantidad: 1,
        stockActualFarmacia: 65
      }
    ],
    indicacionesGenerales: 'Evitar alimentos irritantes, grasas, café y alcohol. Mantener dieta blanda.',
    estado: 'emitida', // Disponible para canjear en el POS de Farmacia!
    codigoQR: 'REC-7492-PAT3-FARMPOS',
    firmaDigital: 'HASH-SIG-ELENARAMOS-20261023-F992A'
  }
];

export const INITIAL_CONSULTATIONS: Consultation[] = [
  {
    id: 'con-001',
    citaId: 'apt-100',
    pacienteId: 'pat-4',
    pacienteNombre: 'Jorge Torres Valencia',
    medicoId: 'med-1',
    medicoNombre: 'Dra. Elena Ramos Gómez',
    fecha: '2026-10-22 16:30',
    motivoConsulta: 'Dolor de garganta, congestión nasal y fiebre de 38°C de 2 días de evolución.',
    signosVitales: {
      temperatura: 38.1,
      presionSistolica: 118,
      presionDiastolica: 76,
      frecuenciaCardiaca: 82,
      frecuenciaRespiratoria: 18,
      saturacionOxigeno: 98,
      peso: 74,
      altura: 175,
      imc: 24.16,
      categoriaIMC: 'Normal'
    },
    exploracionFisica: 'Orofaringe hiperémica con exudado blanquecino en amígdalas. Ganglios submandibulares palpables y dolorosos. Campos pulmonares limpios y bien ventilados.',
    diagnostico: 'Faringoamigdalitis bacteriana aguda',
    diagnosticoCIE10: 'J03.9 Amigdalitis aguda, no especificada',
    notasEvolucion: 'Paciente tolera vía oral. Se inicia antibioticoterapia y antipirético. Cita de control en 5 días si no remite fiebre.'
  }
];

export const CIE10_DATABASE: CIE10Item[] = [
  { codigo: 'J00', descripcion: 'Rinofaringitis aguda (resfriado común)' },
  { codigo: 'J02.9', descripcion: 'Faringitis aguda, no especificada' },
  { codigo: 'J03.9', descripcion: 'Amigdalitis aguda, no especificada' },
  { codigo: 'J20.9', descripcion: 'Bronquitis aguda, no especificada' },
  { codigo: 'K29.1', descripcion: 'Otras gastritis agudas' },
  { codigo: 'K29.7', descripcion: 'Gastritis, no especificada' },
  { codigo: 'K21.9', descripcion: 'Enfermedad por reflujo gastroesofágico sin esofagitis' },
  { codigo: 'A09', descripcion: 'Gastroenteritis y colitis de origen no especificado' },
  { codigo: 'I10', descripcion: 'Hipertensión esencial (primaria)' },
  { codigo: 'E11.9', descripcion: 'Diabetes mellitus tipo 2 sin mención de complicación' },
  { codigo: 'M54.5', descripcion: 'Lumbago no especificado (Lumbalgia)' },
  { codigo: 'M25.5', descripcion: 'Dolor en articulación' },
  { codigo: 'N39.0', descripcion: 'Infección de vías urinarias, sitio no especificado' },
  { codigo: 'L20.9', descripcion: 'Dermatitis atópica, no especificada' },
  { codigo: 'R51', descripcion: 'Cefalea' },
  { codigo: 'F41.9', descripcion: 'Trastorno de ansiedad, no especificado' }
];

export const PRESCRIPTION_TEMPLATES = [
  {
    titulo: 'Infección Respiratoria Alta (Faringitis)',
    cie10: 'J03.9 Amigdalitis aguda',
    medicamentos: [
      {
        nombre: 'Amoxicilina 500mg Genérico',
        sustanciaActiva: 'Amoxicilina',
        dosis: '1 cápsula (500mg)',
        frecuencia: 'Cada 8 horas',
        duracion: 'Por 7 días',
        indicaciones: 'Con o sin alimentos. Completar tratamiento estricto.',
        cantidad: 2
      },
      {
        nombre: 'Paracetamol 500mg Genérico',
        sustanciaActiva: 'Paracetamol',
        dosis: '1 tableta (500mg)',
        frecuencia: 'Cada 6 u 8 horas en caso de fiebre o dolor',
        duracion: 'Por 4 días',
        indicaciones: 'No rebasar dosis indicada.',
        cantidad: 1
      }
    ],
    indicacionesGenerales: 'Abundantes líquidos, reposo relativo, gárgaras de agua tibia con sal.'
  },
  {
    titulo: 'Gastritis / Reflujo Gastroesofágico',
    cie10: 'K29.7 Gastritis, no especificada',
    medicamentos: [
      {
        nombre: 'Omeprazol 20mg Genérico',
        sustanciaActiva: 'Omeprazol',
        dosis: '1 cápsula (20mg)',
        frecuencia: 'Cada 24 horas en ayunas',
        duracion: 'Por 14 días',
        indicaciones: '30 minutos antes del primer alimento.',
        cantidad: 1
      }
    ],
    indicacionesGenerales: 'Evitar irritantes, picante, grasas y café. Cenar 2 horas antes de dormir.'
  },
  {
    titulo: 'Dolor Lumbar Agudo (Lumbalgia)',
    cie10: 'M54.5 Lumbago no especificado',
    medicamentos: [
      {
        nombre: 'Keterolaco Sublingual 30mg',
        sustanciaActiva: 'Ketorolaco Trometamina',
        dosis: '1 tableta sublingual',
        frecuencia: 'Cada 12 horas si hay dolor intenso',
        duracion: 'Por máximo 3 días',
        indicaciones: 'Disolver debajo de la lengua.',
        cantidad: 1
      },
      {
        nombre: 'Paracetamol 500mg Genérico',
        sustanciaActiva: 'Paracetamol',
        dosis: '1 tableta (500mg)',
        frecuencia: 'Cada 8 horas',
        duracion: 'Por 5 días',
        indicaciones: 'Tomar con alimentos.',
        cantidad: 1
      }
    ],
    indicacionesGenerales: 'Reposo en cama dura, calor local por 20 minutos 3 veces al día, no levantar objetos pesados.'
  }
];
