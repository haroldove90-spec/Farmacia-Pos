import React, { useState, useMemo } from 'react';
import {
  Search,
  Barcode,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Award,
  Sparkles,
  QrCode,
  ShieldAlert,
  Printer,
  CheckCircle2,
  AlertCircle,
  Delete,
  X,
  HelpCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Receipt,
  Calculator
} from 'lucide-react';
import { Product, CartItem, Sale, CashRegister, Prescription } from '../types';
import { DataService, useDataStore } from '../services/dataStore';

interface POSModuleProps {
  activeSubTab: string;
}

export const POSModule: React.FC<POSModuleProps> = ({ activeSubTab }) => {
  const store = useDataStore();
  const products = store.getProducts();
  const prescriptions = store.getPrescriptions();
  const sales = store.getSales();
  const cashRegister = store.getCashRegister();

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [redeemedPrescription, setRedeemedPrescription] = useState<Prescription | null>(null);

  // Controlled Drugs Regulatory State
  const [showControlledModal, setShowControlledModal] = useState(false);
  const [cedulaInput, setCedulaInput] = useState('');
  const [medicoInput, setMedicoInput] = useState('');
  const [folioRecetaInput, setFolioRecetaInput] = useState('');

  // Payment & Mobile Calculator State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showMobileCalc, setShowMobileCalc] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<Sale['metodoPago']>('efectivo');
  const [amountReceivedInput, setAmountReceivedInput] = useState<string>('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Generic alternative suggestion modal
  const [genericModalData, setGenericModalData] = useState<{
    patent: Product;
    generic: Product;
  } | null>(null);

  // Cash Register movements state
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<'entrada' | 'salida'>('entrada');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');
  const [openRegisterAmount, setOpenRegisterAmount] = useState('1500');
  const [showZReport, setShowZReport] = useState(false);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sustanciaActiva.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigoBarras.includes(searchTerm);
      const matchCat =
        selectedCategory === 'todos' ||
        (selectedCategory === 'medicamento' && (p.categoria === 'medicamento' || p.categoria === 'vitaminas')) ||
        p.categoria === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCategory]);

  // Cart calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cart]);

  const discountTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.descuento, 0);
  }, [cart]);

  const total = Math.max(0, subtotal - discountTotal);

  // Check if cart contains controlled antibiotics/drugs requiring health regulatory check
  const hasControlledOrAntibiotic = useMemo(() => {
    return cart.some(
      (item) => item.producto.categoria === 'antibiotico' || item.producto.categoria === 'controlado'
    );
  }, [cart]);

  // Add product to cart
  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock <= 0) {
      alert(`El producto ${product.nombre} no tiene stock disponible.`);
      return;
    }

    // Check if patent product has a cheaper generic equivalent
    if (product.esPatente && product.equivalenteGenericoId) {
      const generic = products.find((p) => p.id === product.equivalenteGenericoId);
      if (generic && generic.stock > 0) {
        setGenericModalData({ patent: product, generic });
        return;
      }
    }

    applyAddToCart(product, quantity);
  };

  const applyAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.producto.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.cantidad + quantity);
        return prevCart.map((item) =>
          item.producto.id === product.id
            ? {
                ...item,
                cantidad: newQty,
                subtotal: newQty * item.precioUnitario
              }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            producto: product,
            cantidad: Math.min(product.stock, quantity),
            precioUnitario: product.precioVenta,
            descuento: 0,
            subtotal: Math.min(product.stock, quantity) * product.precioVenta,
            recetaId: redeemedPrescription?.id
          }
        ];
      }
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.producto.id === productId) {
            const newQty = item.cantidad + delta;
            if (newQty <= 0) return null;
            if (newQty > item.producto.stock) {
              alert(`Stock máximo alcanzado (${item.producto.stock} uds.)`);
              return item;
            }
            return {
              ...item,
              cantidad: newQty,
              subtotal: newQty * item.precioUnitario
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.producto.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setRedeemedPrescription(null);
  };

  // Redeem Prescription from clinic
  const redeemPrescription = (prescription: Prescription) => {
    setRedeemedPrescription(prescription);
    const newItems: CartItem[] = [];

    prescription.medicamentos.forEach((med) => {
      // Find by ID or by matching name / substance
      let match = products.find((p) => p.id === med.productoId);
      if (!match) {
        match = products.find(
          (p) =>
            p.nombre.toLowerCase().includes(med.nombre.toLowerCase()) ||
            p.sustanciaActiva.toLowerCase() === med.sustanciaActiva.toLowerCase()
        );
      }

      if (match) {
        const qty = Math.min(match.stock, med.cantidad || 1);
        newItems.push({
          producto: match,
          cantidad: qty > 0 ? qty : 1,
          precioUnitario: match.precioVenta,
          descuento: 0,
          subtotal: (qty > 0 ? qty : 1) * match.precioVenta,
          recetaId: prescription.id
        });
      }
    });

    if (newItems.length > 0) {
      setCart((prev) => [...prev, ...newItems]);
      // Prefill regulatory data if controlled
      setCedulaInput(prescription.medicoCedula || '');
      setMedicoInput(prescription.medicoNombre || '');
      setFolioRecetaInput(prescription.id);
    }
  };

  // Calculator keypad input handler
  const handleCalcPress = (btn: string) => {
    if (btn === 'C') {
      setAmountReceivedInput('');
    } else if (btn === 'DEL') {
      setAmountReceivedInput((prev) => prev.slice(0, -1));
    } else if (btn === '.') {
      if (!amountReceivedInput.includes('.')) {
        setAmountReceivedInput((prev) => (prev === '' ? '0.' : prev + '.'));
      }
    } else if (btn.startsWith('$')) {
      // Direct quick bill buttons ($50, $100, $200, $500)
      const val = parseFloat(btn.replace('$', ''));
      setAmountReceivedInput(val.toString());
    } else if (btn === 'EXACT') {
      setAmountReceivedInput(total.toFixed(2));
    } else {
      setAmountReceivedInput((prev) => prev + btn);
    }
  };

  const numericReceived = parseFloat(amountReceivedInput) || 0;
  const changeDue = Math.max(0, numericReceived - total);

  // Complete checkout
  const handleCompleteSale = () => {
    if (cart.length === 0) return;

    if (hasControlledOrAntibiotic && (!cedulaInput.trim() || !folioRecetaInput.trim())) {
      setShowControlledModal(true);
      return;
    }

    if (paymentMethod === 'efectivo' && numericReceived < total) {
      alert(`El monto recibido ($${numericReceived.toFixed(2)}) es menor al total ($${total.toFixed(2)}).`);
      return;
    }

    const saleRecord: Sale = {
      id: 'VEN-' + Math.floor(100000 + Math.random() * 900000),
      fecha: new Date().toLocaleString('es-MX'),
      cajeroNombre: 'Cajero Farmacia',
      items: [...cart],
      subtotal,
      descuentoTotal: discountTotal,
      total,
      metodoPago: paymentMethod,
      montoRecibido: paymentMethod === 'efectivo' ? numericReceived : total,
      cambio: paymentMethod === 'efectivo' ? changeDue : 0,
      recetaFolio: redeemedPrescription?.id || folioRecetaInput || undefined,
      datosNormativos: hasControlledOrAntibiotic
        ? {
            cedulaMedico: cedulaInput,
            nombreMedico: medicoInput || 'Médico Externo / Consultorio',
            folioReceta: folioRecetaInput || 'S/F',
            medicamentosRetenidos: cart
              .filter(
                (c) =>
                  c.producto.categoria === 'antibiotico' ||
                  c.producto.categoria === 'controlado'
              )
              .map((c) => `${c.producto.nombre} (${c.cantidad} uds)`)
          }
        : undefined
    };

    store.processSale(saleRecord);
    setCompletedSale(saleRecord);
    setShowCheckoutModal(false);
    clearCart();
    setAmountReceivedInput('');
  };

  // Render Sub-Views
  if (activeSubTab === 'canje_receta') {
    const pendingPrescriptions = prescriptions.filter((p) => p.estado === 'emitida');
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-teal-700 font-bold text-lg">
              <QrCode className="w-5 h-5 text-teal-600" />
              <span>Recetas Emitidas en Consultorios (Sincronización en Vivo)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Cuando el médico finaliza una receta en el consultorio, aparece aquí al instante. Escanea o selecciona el folio para cargar el carrito de compra.
            </p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold self-start sm:self-auto">
            {pendingPrescriptions.length} Recetas pendientes de surtir
          </div>
        </div>

        {pendingPrescriptions.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              Todas las recetas de consultorio han sido surtidas
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Nuevas recetas aparecerán automáticamente cuando el médico prescriba a un paciente en el Módulo de Consultorio.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingPrescriptions.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-teal-400 hover:shadow-md transition space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      Folio: {p.id}
                    </span>
                    <h4 className="font-bold text-slate-900 mt-1.5 text-base">
                      {p.pacienteNombre}
                    </h4>
                    <span className="text-xs text-slate-500 block">
                      Médico: {p.medicoNombre} • Cédula: {p.medicoCedula}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {p.fechaEmision}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900 text-[11px] uppercase tracking-wide text-teal-800">
                    Medicamentos Prescritos:
                  </div>
                  {p.medicamentos.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center py-0.5">
                      <span className="font-medium text-slate-800">
                        • {m.nombre} ({m.dosis})
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        Cant: {m.cantidad}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500 italic">
                    Dx: {p.diagnostico}
                  </span>
                  <button
                    onClick={() => {
                      redeemPrescription(p);
                      // Switch to pos tab
                      alert(`¡Receta ${p.id} cargada exitosamente en el Punto de Venta!`);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs active:scale-95 transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Cargar en Carrito</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeSubTab === 'caja') {
    const isRegisterOpen = cashRegister?.abierta;
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <span>Control de Turno, Arqueo y Corte Z</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Apertura de turno con fondo inicial, registro de entradas/salidas de efectivo y emisión de Corte Z.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isRegisterOpen ? (
              <>
                <button
                  onClick={() => setShowMovementModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                >
                  Entrada / Salida
                </button>
                <button
                  onClick={() => setShowZReport(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Corte Z (Cierre de Turno)
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  store.openCashRegister(parseFloat(openRegisterAmount) || 1500, 'Cajero Farmacia');
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
              >
                Abrir Turno de Caja
              </button>
            )}
          </div>
        </div>

        {/* Register Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Fondo de Apertura
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ${cashRegister ? cashRegister.montoApertura.toFixed(2) : '0.00'}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Apertura: {cashRegister?.fechaApertura || 'Sin turno abierto'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Ventas Totales del Turno
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              $
              {sales
                .reduce((acc, s) => acc + s.total, 0)
                .toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {sales.length} transacciones registradas
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Estado de Caja
            </span>
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isRegisterOpen
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                {isRegisterOpen ? 'Turno Abierto / Operando' : 'Caja Cerrada'}
              </span>
            </div>
          </div>
        </div>

        {/* Movements History */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-800">
            Movimientos y Auditoría de Efectivo en Turno
          </div>
          <div className="divide-y divide-slate-100">
            {cashRegister?.movimientos.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl font-bold uppercase text-[10px] ${
                      m.tipo === 'apertura'
                        ? 'bg-blue-50 text-blue-700'
                        : m.tipo === 'entrada'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {m.tipo}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">{m.motivo}</span>
                    <span className="text-[11px] text-slate-400">
                      {m.hora} • Registrado por: {m.usuario}
                    </span>
                  </div>
                </div>
                <div className="font-mono font-bold text-slate-800 text-sm">
                  {m.tipo === 'salida' ? '-' : '+'}${m.monto.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal for manual cash movement */}
        {showMovementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Registrar Movimiento de Efectivo</h3>
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setMovementType('entrada')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    movementType === 'entrada' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Entrada de Efectivo
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('salida')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    movementType === 'salida' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Salida / Retiro
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Monto ($):</label>
                <input
                  type="number"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Motivo / Concepto:</label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="Ej. Pago a proveedor de agua, recolección de efectivo..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-teal-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowMovementModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const val = parseFloat(movementAmount);
                    if (!val || val <= 0 || !movementReason.trim()) {
                      alert('Por favor ingrese monto y motivo válidos.');
                      return;
                    }
                    store.addCashMovement(movementType, val, movementReason, 'Cajero Farmacia');
                    setShowMovementModal(false);
                    setMovementAmount('');
                    setMovementReason('');
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs"
                >
                  Guardar Movimiento
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Corte Z Report */}
        {showZReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-teal-600" />
                  <span>Reporte de Corte Z (Cierre de Turno)</span>
                </div>
                <button onClick={() => setShowZReport(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="font-mono text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="text-center font-bold text-slate-900 pb-2 border-b border-dashed border-slate-300">
                  FARMACIA POS - CORTE Z<br />
                  SUCURSAL MATRIZ #01<br />
                  FECHA: {new Date().toLocaleString('es-MX')}
                </div>
                <div className="flex justify-between">
                  <span>FONDO APERTURA:</span>
                  <span className="font-bold">${cashRegister?.montoApertura.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VENTAS EFECTIVO:</span>
                  <span>
                    $
                    {sales
                      .filter((s) => s.metodoPago === 'efectivo')
                      .reduce((acc, s) => acc + s.total, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VENTAS TARJETA:</span>
                  <span>
                    $
                    {sales
                      .filter((s) => s.metodoPago.startsWith('tarjeta'))
                      .reduce((acc, s) => acc + s.total, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>TRANSFERENCIAS / OTROS:</span>
                  <span>
                    $
                    {sales
                      .filter((s) => s.metodoPago === 'transferencia' || s.metodoPago === 'puntos')
                      .reduce((acc, s) => acc + s.total, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-dashed border-slate-300 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                  <span>TOTAL EN CAJA:</span>
                  <span>
                    $
                    {(
                      (cashRegister?.montoApertura || 0) +
                      sales.reduce((acc, s) => acc + s.total, 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Imprimir Ticket Z
                </button>
                <button
                  onClick={() => {
                    store.closeCashRegister('Cajero Farmacia');
                    setShowZReport(false);
                    alert('¡Caja cerrada correctamente! El turno ha finalizado.');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-xs"
                >
                  Confirmar y Cerrar Caja
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeSubTab === 'historial_ventas') {
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Historial de Tickets de Venta</h3>
            <p className="text-xs text-slate-500">
              Registro cronológico de ventas, recetas canjeadas y formas de cobro.
            </p>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl">
            {sales.length} Tickets
          </span>
        </div>

        {sales.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-2xl border border-slate-200 text-slate-400 text-sm">
            Aún no se han cobrado ventas en este turno.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            {sales.map((sale) => (
              <div key={sale.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-700">{sale.id}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{sale.fecha}</span>
                    {sale.recetaFolio && (
                      <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[11px] font-bold border border-teal-200">
                        Receta: {sale.recetaFolio}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600 text-xs mt-1">
                    {sale.items.map((i) => `${i.producto.nombre} (x${i.cantidad})`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-base">
                      ${sale.total.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">
                      {sale.metodoPago.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={() => setCompletedSale(sale)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    title="Ver / Reimprimir Ticket"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // DEFAULT VIEW: MAIN POS SALE SCREEN WITH LARGE PHOTO BUTTONS & MOBILE RESPONSIVE CALCULATOR
  return (
    <div className="p-2.5 sm:p-5 max-w-7xl mx-auto">
      {/* Top Banner / Notification if prescription is currently loaded */}
      {redeemedPrescription && (
        <div className="mb-3 p-3 bg-teal-50 border border-teal-300 rounded-xl flex items-center justify-between text-xs sm:text-sm text-teal-900">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-teal-600 shrink-0" />
            <span>
              <strong>Receta {redeemedPrescription.id} vinculada:</strong> Paciente{' '}
              {redeemedPrescription.pacienteNombre} (Médico: {redeemedPrescription.medicoNombre})
            </span>
          </div>
          <button
            onClick={() => setRedeemedPrescription(null)}
            className="text-teal-700 hover:text-rose-600 text-xs font-bold"
          >
            Desvincular
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT / MAIN COLUMN: PRODUCT CATALOG WITH LARGE PHOTO BUTTONS */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-3">
          {/* Search bar & Category filters */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Buscar medicamento por nombre, sustancia activa o código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'medicamento', label: 'Medicamentos' },
                { id: 'antibiotico', label: 'Antibióticos' },
                { id: 'controlado', label: 'Controlados' },
                { id: 'material_curacion', label: 'Material Curación' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* LARGE PHOTO PRODUCT BUTTONS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5 overflow-y-auto max-h-[calc(100vh-250px)] pb-20 lg:pb-0">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= product.stockMinimo;

              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={isOutOfStock}
                  className={`group relative flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden text-left shadow-xs transition-all duration-150 active:scale-95 hover:shadow-md hover:border-teal-400 cursor-pointer ${
                    isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed' : ''
                  }`}
                >
                  {/* Product Image Header (LARGE PHOTO) */}
                  <div className="relative w-full h-28 sm:h-32 bg-slate-100 overflow-hidden">
                    <img
                      src={product.fotoUrl}
                      alt={product.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />

                    {/* Category / Controlled Pill Badge */}
                    {product.categoria === 'antibiotico' && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold shadow-xs">
                        Antibiótico
                      </span>
                    )}
                    {product.categoria === 'controlado' && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold shadow-xs">
                        Controlado
                      </span>
                    )}
                    {product.esPatente && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold shadow-xs">
                        Patente
                      </span>
                    )}

                    {/* Stock pill */}
                    <div
                      className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs ${
                        isOutOfStock
                          ? 'bg-rose-600 text-white'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isOutOfStock ? 'Agotado' : `Stock: ${product.stock}`}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-teal-700">
                        {product.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                        {product.sustanciaActiva}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {product.presentacion}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="font-mono text-sm sm:text-base font-black text-teal-700">
                        ${product.precioVenta.toFixed(2)}
                      </span>
                      <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center font-bold text-xs transition">
                        +
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: TICKET CART & RESPONSIVE MOBILE CALCULATOR */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md flex flex-col h-[calc(100vh-170px)] sticky top-20">
            {/* Cart Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Ticket de Venta
                </h3>
                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                  {cart.length}
                </span>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold transition"
                >
                  Vaciar
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 p-3 overflow-y-auto divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <ShoppingBag className="w-10 h-10 stroke-1 text-slate-300" />
                  <p className="text-xs font-medium">
                    El carrito está vacío.<br />
                    Toca los productos con foto o canjea una receta médica.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.producto.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 truncate">
                        {item.producto.nombre}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        ${item.precioUnitario.toFixed(2)} c/u
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateCartQuantity(item.producto.id, -1)}
                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold font-mono">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.producto.id, 1)}
                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="w-16 text-right font-mono font-bold text-slate-900 shrink-0">
                      ${item.subtotal.toFixed(2)}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.producto.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cart Regulatory Alert for Antibiotics */}
            {hasControlledOrAntibiotic && (
              <div className="p-2.5 bg-amber-50 border-t border-amber-200 flex items-center justify-between text-[11px] text-amber-800">
                <span className="flex items-center gap-1.5 font-semibold">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  Medicamento Antibiótico/Controlado
                </span>
                <button
                  onClick={() => setShowControlledModal(true)}
                  className="font-bold underline text-amber-900 hover:text-amber-950"
                >
                  {cedulaInput ? 'Cédula registrada' : 'Capturar Cédula'}
                </button>
              </div>
            )}

            {/* Cart Summary & Total */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Descuento aplicado:</span>
                    <span className="font-mono">-${discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>TOTAL A COBRAR:</span>
                  <span className="font-mono text-teal-700 text-xl font-black">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action buttons: Mobile Calculator toggle & Cobrar */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowMobileCalc(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition active:scale-95"
                >
                  <Calculator className="w-4 h-4 text-teal-600" />
                  <span>Calculadora</span>
                </button>

                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => {
                    setShowCheckoutModal(true);
                    setAmountReceivedInput(total.toFixed(2));
                  }}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition shadow-sm active:scale-95 ${
                    cart.length === 0
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Cobrar (${total.toFixed(2)})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESPONSIVE MOBILE CALCULATOR MODAL */}
      {showMobileCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Calculator className="w-4 h-4 text-teal-600" />
                <span>Calculadora Táctil de Cobro y Cambio</span>
              </div>
              <button
                onClick={() => setShowMobileCalc(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Calculator Display */}
            <div className="bg-slate-900 p-3.5 rounded-xl text-white font-mono text-right space-y-1">
              <div className="text-xs text-slate-400 flex justify-between">
                <span>TOTAL A PAGAR:</span>
                <span className="font-bold text-white">${total.toFixed(2)}</span>
              </div>
              <div className="text-xs text-teal-400 flex justify-between">
                <span>EFECTIVO RECIBIDO:</span>
                <span className="text-lg font-bold text-emerald-400">
                  ${numericReceived.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-amber-400 flex justify-between pt-1 border-t border-slate-700">
                <span>CAMBIO A ENTREGAR:</span>
                <span className="text-xl font-black text-amber-300">
                  ${changeDue.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quick Bill shortcuts */}
            <div className="grid grid-cols-4 gap-2">
              {['$50', '$100', '$200', '$500'].map((bill) => (
                <button
                  key={bill}
                  type="button"
                  onClick={() => handleCalcPress(bill)}
                  className="py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs hover:bg-teal-100 active:scale-95 transition"
                >
                  {bill}
                </button>
              ))}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', 'DEL'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleCalcPress(k)}
                  className={`py-3.5 rounded-xl font-bold font-mono text-base transition active:scale-95 shadow-2xs ${
                    k === 'C'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : k === 'DEL'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCalcPress('EXACT')}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Monto Exacto
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMobileCalc(false);
                  setShowCheckoutModal(true);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
              >
                Aplicar Cobro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL: MULTIPLE PAYMENT METHODS */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span>Procesar Pago & Emisión de Ticket</span>
              </h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Monto Total a Pagar
              </span>
              <div className="text-3xl font-black text-slate-900 font-mono mt-1">
                ${total.toFixed(2)}
              </div>
            </div>

            {/* Payment method selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Seleccione Método de Pago:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'efectivo', label: 'Efectivo', icon: Banknote },
                  { id: 'tarjeta_debito', label: 'Tarjeta Débito', icon: CreditCard },
                  { id: 'tarjeta_credito', label: 'Tarjeta Crédito', icon: CreditCard },
                  { id: 'transferencia', label: 'Transferencia', icon: ArrowRightLeft },
                  { id: 'puntos', label: 'Monedero / Puntos', icon: Award }
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSel = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as Sale['metodoPago'])}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left font-semibold transition ${
                        isSel
                          ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash details if cash payment */}
            {paymentMethod === 'efectivo' && (
              <div className="space-y-3 bg-teal-50/50 p-3.5 rounded-xl border border-teal-200/60">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-teal-900">
                      Monto Recibido ($):
                    </label>
                    <button
                      type="button"
                      onClick={() => setAmountReceivedInput(total.toFixed(2))}
                      className="text-[11px] font-bold text-teal-700 hover:underline"
                    >
                      Exacto (${total.toFixed(2)})
                    </button>
                  </div>
                  <input
                    type="number"
                    value={amountReceivedInput}
                    onChange={(e) => setAmountReceivedInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-base font-bold bg-white outline-none focus:border-teal-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex justify-between items-center font-mono text-sm pt-1">
                  <span className="font-semibold text-slate-600">Cambio a entregar:</span>
                  <span className="font-black text-emerald-700 text-lg">
                    ${changeDue.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCompleteSale}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
              >
                Completar Venta e Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED SALE TICKET MODAL */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-1">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-lg">¡Venta Exitosa!</h3>
              <p className="text-xs text-slate-500">Ticket generado y stock actualizado</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs space-y-2">
              <div className="text-center font-bold text-slate-800 pb-2 border-b border-dashed border-slate-300">
                FARMACIA POS<br />
                SUCURSAL MATRIZ #01<br />
                FOLIO: {completedSale.id}
              </div>
              <div className="text-[11px] text-slate-500">
                Fecha: {completedSale.fecha}<br />
                Cajero: {completedSale.cajeroNombre}
              </div>
              <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1">
                {completedSale.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {it.cantidad}x {it.producto.nombre}
                    </span>
                    <span className="font-bold">${it.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm">
                <span>TOTAL:</span>
                <span>${completedSale.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>PAGO ({completedSale.metodoPago.toUpperCase()}):</span>
                <span>${completedSale.montoRecibido.toFixed(2)}</span>
              </div>
              {completedSale.cambio > 0 && (
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>CAMBIO:</span>
                  <span>${completedSale.cambio.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Imprimir
              </button>
              <button
                type="button"
                onClick={() => setCompletedSale(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGULATORY CONTROLLED DRUGS MODAL */}
      {showControlledModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Control Sanitario de Antibióticos / Controlados</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Conforme a la normativa sanitaria de salud, para la venta de antibióticos y medicamentos controlados es obligatorio registrar los datos del médico prescriptor y retener el folio de la receta.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Cédula Profesional del Médico *:
                </label>
                <input
                  type="text"
                  value={cedulaInput}
                  onChange={(e) => setCedulaInput(e.target.value)}
                  placeholder="Ej. CED-9842104"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombre Completo del Médico:
                </label>
                <input
                  type="text"
                  value={medicoInput}
                  onChange={(e) => setMedicoInput(e.target.value)}
                  placeholder="Ej. Dra. Elena Ramos Gómez"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Folio de la Receta Médica *:
                </label>
                <input
                  type="text"
                  value={folioRecetaInput}
                  onChange={(e) => setFolioRecetaInput(e.target.value)}
                  placeholder="Ej. REC-7492"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowControlledModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!cedulaInput.trim() || !folioRecetaInput.trim()) {
                    alert('Por favor capture al menos la Cédula y Folio de Receta para continuar.');
                    return;
                  }
                  setShowControlledModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs"
              >
                Guardar Datos Sanitarios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERIC ALTERNATIVE SUGGESTION MODAL */}
      {genericModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-base">
              <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
              <span>Sugerencia Automática de Medicamento Genérico</span>
            </div>
            <p className="text-xs text-slate-600">
              El cliente seleccionó un fármaco de patente. Tenemos disponible la misma sustancia activa en genérico con un ahorro del{' '}
              <strong className="text-emerald-700 font-bold">
                {Math.round(
                  ((genericModalData.patent.precioVenta - genericModalData.generic.precioVenta) /
                    genericModalData.patent.precioVenta) *
                    100
                )}
                %
              </strong>
              .
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Opción Patente</span>
                <div className="font-bold text-slate-900">{genericModalData.patent.nombre}</div>
                <div className="font-mono text-slate-600 font-bold">
                  ${genericModalData.patent.precioVenta.toFixed(2)}
                </div>
              </div>

              <div className="p-3 rounded-xl border-2 border-emerald-400 bg-emerald-50/50 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700">Opción Genérico</span>
                <div className="font-bold text-slate-900">{genericModalData.generic.nombre}</div>
                <div className="font-mono text-emerald-700 font-bold">
                  ${genericModalData.generic.precioVenta.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  applyAddToCart(genericModalData.patent, 1);
                  setGenericModalData(null);
                }}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Mantener Patente
              </button>
              <button
                type="button"
                onClick={() => {
                  applyAddToCart(genericModalData.generic, 1);
                  setGenericModalData(null);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
              >
                Usar Genérico (Ahorro)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
